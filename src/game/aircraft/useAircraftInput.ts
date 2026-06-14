import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MathUtils } from 'three';
import {
  defaultAircraftBindings,
  defaultAircraftInputConfig,
  type AircraftControlBindings,
  type AircraftInputConfig,
} from './aircraftBindings';

export type AircraftInputState = {
  pitch: number;
  roll: number;
  yaw: number;
  throttle: number;
  trimPitch: number;
  boost: boolean;
  pointerLocked: boolean;
  hudVisible: boolean;
  cameraMode: 'chase' | 'farChase';
  resetRequested: boolean;
};

const initialInput: AircraftInputState = {
  pitch: 0,
  roll: 0,
  yaw: 0,
  throttle: 0.65,
  trimPitch: 0,
  boost: false,
  pointerLocked: false,
  hudVisible: true,
  cameraMode: 'chase',
  resetRequested: false,
};

function includes(bindings: string[], code: string) {
  return bindings.includes(code);
}

export function useAircraftInput(
  target?: HTMLElement | null,
  configOverrides?: Partial<AircraftInputConfig>,
  bindingOverrides?: Partial<AircraftControlBindings>,
) {
  const config = useMemo(
    () => ({ ...defaultAircraftInputConfig, ...configOverrides }),
    [configOverrides],
  );
  const bindings = useMemo(
    () => ({ ...defaultAircraftBindings, ...bindingOverrides }),
    [bindingOverrides],
  );
  const keysRef = useRef(new Set<string>());
  const desiredRef = useRef({ pitch: 0, roll: 0, yaw: 0 });
  const mouseMotionThisFrameRef = useRef(0);
  const mouseIdleSecondsRef = useRef(999);
  const inputRef = useRef<AircraftInputState>({ ...initialInput });
  const resetPendingRef = useRef(false);
  const [snapshot, setSnapshot] = useState<AircraftInputState>(inputRef.current);

  const requestPointerLock = useCallback(() => {
    if (!config.pointerLockEnabled || !target?.requestPointerLock) {
      return;
    }
    target.requestPointerLock();
  }, [config.pointerLockEnabled, target]);

  const consumeResetRequest = useCallback(() => {
    if (!resetPendingRef.current) {
      return false;
    }
    resetPendingRef.current = false;
    inputRef.current.resetRequested = false;
    return true;
  }, []);

  const updateInput = useCallback(
    (dt: number) => {
      const keys = keysRef.current;
      const desired = desiredRef.current;
      const input = inputRef.current;
      const mouseMotion = mouseMotionThisFrameRef.current;
      mouseMotionThisFrameRef.current = 0;
      const pointerLocked = document.pointerLockElement === target;
      const mouseActive =
        pointerLocked && mouseMotion > config.mouseActivityThreshold;
      mouseIdleSecondsRef.current = mouseActive ? 0 : mouseIdleSecondsRef.current + dt;
      const returnBlend = MathUtils.smoothstep(
        mouseIdleSecondsRef.current,
        config.yokeReturnDelaySeconds,
        config.yokeReturnDelaySeconds + config.yokeReturnRampSeconds,
      );

      if (bindings.throttleUp.some((code) => keys.has(code))) {
        input.throttle += config.throttleStepPerSecond * dt;
      }
      if (bindings.throttleDown.some((code) => keys.has(code))) {
        input.throttle -= config.throttleStepPerSecond * dt;
      }
      input.throttle = MathUtils.clamp(input.throttle, 0, 1);

      const keyboardPitch =
        (bindings.pitchUp.some((code) => keys.has(code)) ? 1 : 0) -
        (bindings.pitchDown.some((code) => keys.has(code)) ? 1 : 0);
      const keyboardRoll =
        (bindings.rollRight.some((code) => keys.has(code)) ? 1 : 0) -
        (bindings.rollLeft.some((code) => keys.has(code)) ? 1 : 0);
      const keyboardYaw =
        (bindings.yawRight.some((code) => keys.has(code)) ? 1 : 0) -
        (bindings.yawLeft.some((code) => keys.has(code)) ? 1 : 0);

      if (keyboardPitch !== 0) {
        desired.pitch = MathUtils.damp(desired.pitch, keyboardPitch, config.keyboardPitchRate, dt);
      } else {
        desired.pitch = MathUtils.damp(
          desired.pitch,
          0,
          config.pitchCenteringRate * returnBlend,
          dt,
        );
      }
      if (keyboardRoll !== 0) {
        desired.roll = MathUtils.damp(desired.roll, keyboardRoll, config.keyboardRollRate, dt);
      } else {
        desired.roll = MathUtils.damp(
          desired.roll,
          0,
          config.rollCenteringRate * returnBlend,
          dt,
        );
      }
      desired.yaw = MathUtils.damp(desired.yaw, keyboardYaw, config.keyboardYawRate, dt);
      if (keyboardYaw === 0) {
        desired.yaw = MathUtils.damp(desired.yaw, 0, config.yawCenteringRate, dt);
      }

      if (bindings.centerControls.some((code) => keys.has(code))) {
        desired.pitch = MathUtils.damp(desired.pitch, 0, 14, dt);
        desired.roll = MathUtils.damp(desired.roll, 0, 14, dt);
        desired.yaw = MathUtils.damp(desired.yaw, 0, 14, dt);
      }

      input.pitch = MathUtils.damp(input.pitch, MathUtils.clamp(desired.pitch, -1, 1), config.inputSmoothing, dt);
      input.roll = MathUtils.damp(input.roll, MathUtils.clamp(desired.roll, -1, 1), config.inputSmoothing, dt);
      input.yaw = MathUtils.damp(input.yaw, MathUtils.clamp(desired.yaw, -1, 1), config.inputSmoothing, dt);
      input.resetRequested = resetPendingRef.current;

      setSnapshot({ ...input });
      return input;
    },
    [bindings, config, target],
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      keysRef.current.add(event.code);
      if (event.repeat) {
        return;
      }
      if (includes(bindings.reset, event.code)) {
        resetPendingRef.current = true;
      }
      if (includes(bindings.toggleHud, event.code)) {
        inputRef.current.hudVisible = !inputRef.current.hudVisible;
      }
      if (includes(bindings.toggleCamera, event.code)) {
        inputRef.current.cameraMode =
          inputRef.current.cameraMode === 'chase' ? 'farChase' : 'chase';
      }
    };

    const onKeyUp = (event: KeyboardEvent) => {
      keysRef.current.delete(event.code);
    };

    const onMouseMove = (event: MouseEvent) => {
      if (document.pointerLockElement !== target) {
        return;
      }
      const pitchSign = config.invertPitch ? -1 : 1;
      desiredRef.current.roll += event.movementX * config.mouseSensitivityX;
      desiredRef.current.pitch += event.movementY * config.mouseSensitivityY * pitchSign;
      mouseMotionThisFrameRef.current += Math.hypot(event.movementX, event.movementY);
      desiredRef.current.roll = MathUtils.clamp(desiredRef.current.roll, -1, 1);
      desiredRef.current.pitch = MathUtils.clamp(desiredRef.current.pitch, -1, 1);
    };

    const onPointerLockChange = () => {
      inputRef.current.pointerLocked = document.pointerLockElement === target;
      setSnapshot({ ...inputRef.current });
    };

    const onMouseDown = () => requestPointerLock();

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('mousemove', onMouseMove);
    document.addEventListener('pointerlockchange', onPointerLockChange);
    target?.addEventListener('mousedown', onMouseDown);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('pointerlockchange', onPointerLockChange);
      target?.removeEventListener('mousedown', onMouseDown);
      keysRef.current.clear();
    };
  }, [bindings, config, requestPointerLock, target]);

  return {
    input: snapshot,
    updateInput,
    requestPointerLock,
    consumeResetRequest,
  };
}
