import { useMemo, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3 } from 'three';
import {
  computeFlightForces,
  createInitialAircraftState,
  getAircraftProfile,
  standardFlightEnvironment,
  stepAircraftSimulation,
  type AircraftControlInput,
  type AircraftProfile,
  type AircraftProfileId,
  type AircraftSimState,
  type FlightEnvironment,
  type FlightTelemetry,
} from '../../sim/aero';
import flightTestLevel from '../../levels/flightTestLevel.json';
import { AircraftCameraRig } from './AircraftCameraRig';
import { AircraftDebugHud } from './AircraftDebugHud';
import { GenericTestAircraft } from './GenericTestAircraft';
import { useAircraftInput } from './useAircraftInput';
import { useAircraftHudStore } from './useAircraftHudStore';

type FlightTestLevel = typeof flightTestLevel;

type AircraftControllerProps = {
  aircraftProfileId?: AircraftProfileId;
  level?: FlightTestLevel;
};

function buildProfileForLevel(profile: AircraftProfile, level: FlightTestLevel): AircraftProfile {
  return {
    ...profile,
    spawn: {
      ...profile.spawn,
      position: level.spawn.position as [number, number, number],
      rotationEulerDeg: level.spawn.rotationEulerDeg as [number, number, number],
      initialSpeedMps: level.spawn.initialSpeedMps,
      altitudeM: level.spawn.position[1],
    },
  };
}

function buildEnvironment(level: FlightTestLevel): FlightEnvironment {
  return {
    ...standardFlightEnvironment,
    groundAltitudeM: level.environment.groundAltitudeM,
    windVelocityMps: level.environment.windMps as [number, number, number],
    turbulenceIntensity: level.environment.turbulenceIntensity,
  };
}

function initialTelemetry(profile: AircraftProfile, environment: FlightEnvironment, state: AircraftSimState) {
  return computeFlightForces(profile, environment, state, {
    pitch: 0,
    roll: 0,
    yaw: 0,
    throttle: state.throttle,
    trimPitch: 0,
    boost: false,
  }).telemetry;
}

function shapeAxis(value: number, deadzone: number, curve: number) {
  const abs = Math.abs(value);
  if (abs <= deadzone) {
    return 0;
  }
  const normalized = (abs - deadzone) / (1 - deadzone);
  return Math.sign(value) * Math.pow(normalized, curve);
}

export function AircraftController({
  aircraftProfileId = 'generic_trainer',
  level = flightTestLevel,
}: AircraftControllerProps) {
  const { gl } = useThree();
  const profile = useMemo(
    () => buildProfileForLevel(getAircraftProfile(aircraftProfileId), level),
    [aircraftProfileId, level],
  );
  const environment = useMemo(() => buildEnvironment(level), [level]);
  const initialState = useMemo(() => createInitialAircraftState(profile), [profile]);
  const stateRef = useRef<AircraftSimState>(initialState);
  const [renderState, setRenderState] = useState<AircraftSimState>(initialState);
  const [telemetry, setTelemetry] = useState<FlightTelemetry>(
    initialTelemetry(profile, environment, initialState),
  );
  const inputConfig = useMemo(
    () => ({
      mouseSensitivityX: profile.pilotControl.mouseRollSensitivity,
      mouseSensitivityY: profile.pilotControl.mousePitchSensitivity,
      keyboardPitchRate: profile.pilotControl.keyboardPitchRate,
      keyboardRollRate: profile.pilotControl.keyboardRollRate,
      keyboardYawRate: profile.pilotControl.keyboardYawRate,
      pitchCenteringRate: profile.pilotControl.pitchCenteringRate,
      rollCenteringRate: profile.pilotControl.rollCenteringRate,
      yawCenteringRate: profile.pilotControl.yawCenteringRate,
      inputSmoothing: profile.pilotControl.inputSmoothing,
      yokeReturnDelaySeconds: profile.pilotControl.yokeReturnDelaySeconds,
      yokeReturnRampSeconds: profile.pilotControl.yokeReturnRampSeconds,
      mouseActivityThreshold: profile.pilotControl.mouseActivityThreshold,
    }),
    [profile],
  );
  const { input, updateInput, consumeResetRequest } = useAircraftInput(gl.domElement, inputConfig);
  const setYokeInput = useAircraftHudStore((state) => state.setYokeInput);

  useFrame((_, delta) => {
    const updatedInput = updateInput(delta);
    const controls: AircraftControlInput = {
      pitch: shapeAxis(
        updatedInput.pitch,
        profile.pilotControl.axisDeadzone,
        profile.pilotControl.pitchCurve,
      ),
      roll: shapeAxis(
        updatedInput.roll,
        profile.pilotControl.rollDeadzone,
        profile.pilotControl.rollCurve,
      ),
      yaw: shapeAxis(
        updatedInput.yaw,
        profile.pilotControl.yawDeadzone,
        profile.pilotControl.yawCurve,
      ),
      throttle: updatedInput.throttle,
      trimPitch: updatedInput.trimPitch,
      boost: updatedInput.boost,
    };
    setYokeInput({
      pitch: updatedInput.pitch,
      roll: updatedInput.roll,
      pointerLocked: updatedInput.pointerLocked,
    });

    if (consumeResetRequest()) {
      stateRef.current = createInitialAircraftState(profile);
    } else {
      const result = stepAircraftSimulation(profile, environment, stateRef.current, controls, delta);
      stateRef.current = result.state;
      setTelemetry(result.forces.telemetry);
    }

    setRenderState({
      positionWorld: stateRef.current.positionWorld.clone(),
      velocityWorld: stateRef.current.velocityWorld.clone(),
      orientation: stateRef.current.orientation.clone(),
      angularVelocityLocal: stateRef.current.angularVelocityLocal.clone(),
      controlSurfaces: { ...stateRef.current.controlSurfaces },
      throttle: updatedInput.throttle,
    });
  });

  return (
    <>
      <GenericTestAircraft
        position={renderState.positionWorld}
        quaternion={renderState.orientation}
        throttle={input.throttle}
        dihedralDeg={profile.wing.dihedralDeg}
      />
      <AircraftCameraRig
        aircraftPosition={renderState.positionWorld}
        aircraftQuaternion={renderState.orientation}
        mode={input.cameraMode}
        config={{
          chaseDistance: profile.visual.chaseCameraDistance,
          chaseHeight: profile.visual.chaseCameraHeight,
        }}
      />
      <AircraftDebugHud
        visible={input.hudVisible}
        profile={profile}
        telemetry={{
          ...telemetry,
          altitudeM: Math.max(
            0,
            renderState.positionWorld.y - environment.groundAltitudeM,
          ),
          verticalSpeedMps: renderState.velocityWorld.y,
        }}
        controls={{
          pitch: input.pitch,
          roll: input.roll,
          yaw: input.yaw,
          throttle: input.throttle,
          trimPitch: input.trimPitch,
          boost: input.boost,
        }}
        pointerLocked={input.pointerLocked}
        cameraMode={input.cameraMode}
      />
    </>
  );
}

export function FlightReferenceMarker() {
  return (
    <group>
      <mesh position={[0, 0.03, -120]}>
        <boxGeometry args={[14, 0.05, 220]} />
        <meshStandardMaterial color="#1f2937" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.07, -120]}>
        <boxGeometry args={[1, 0.05, 180]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.8} />
      </mesh>
      <mesh position={[0, 12, -260]}>
        <boxGeometry args={[500, 1.5, 1]} />
        <meshBasicMaterial color="#d7e7f5" />
      </mesh>
    </group>
  );
}

export function FlightEnvironmentVisuals({ level = flightTestLevel }: { level?: FlightTestLevel }) {
  const groundSize = level.visual.groundSize;
  const gridSize = level.visual.gridSize;

  return (
    <>
      <color attach="background" args={[level.visual.skyColor]} />
      <fog attach="fog" args={[level.visual.horizonColor, 1200, 3600]} />
      <hemisphereLight args={['#eaf4ff', '#67805f', 1.8]} />
      <directionalLight castShadow intensity={2.3} position={[120, 260, 80]} />
      <mesh receiveShadow position={[0, level.environment.groundAltitudeM - 0.02, 0]}>
        <boxGeometry args={[groundSize, 0.04, groundSize]} />
        <meshStandardMaterial color="#6f8f58" roughness={0.95} />
      </mesh>
      <gridHelper args={[groundSize, gridSize, '#e5e7eb', '#94a3b8']} position={[0, 0.04, 0]} />
      <FlightReferenceMarker />
    </>
  );
}

export function FlightTestScene() {
  const level = flightTestLevel;
  return (
    <>
      <FlightEnvironmentVisuals level={level} />
      <AircraftController aircraftProfileId={level.aircraftProfileId as AircraftProfileId} level={level} />
    </>
  );
}
