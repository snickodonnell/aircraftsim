export type AircraftControlBindings = {
  throttleUp: string[];
  throttleDown: string[];
  yawLeft: string[];
  yawRight: string[];
  rollLeft: string[];
  rollRight: string[];
  pitchUp: string[];
  pitchDown: string[];
  centerControls: string[];
  reset: string[];
  toggleHud: string[];
  toggleCamera: string[];
  pointerLock: string[];
};

export type AircraftInputConfig = {
  mouseSensitivityX: number;
  mouseSensitivityY: number;
  invertPitch: boolean;
  keyboardPitchRate: number;
  keyboardRollRate: number;
  keyboardYawRate: number;
  pitchCenteringRate: number;
  rollCenteringRate: number;
  yawCenteringRate: number;
  inputSmoothing: number;
  throttleStepPerSecond: number;
  pointerLockEnabled: boolean;
  yokeReturnDelaySeconds: number;
  yokeReturnRampSeconds: number;
  mouseActivityThreshold: number;
};

export const defaultAircraftBindings: AircraftControlBindings = {
  throttleUp: ['KeyW'],
  throttleDown: ['KeyS'],
  yawLeft: ['KeyA'],
  yawRight: ['KeyD'],
  rollLeft: ['KeyQ', 'ArrowLeft'],
  rollRight: ['KeyE', 'ArrowRight'],
  pitchUp: ['ArrowDown'],
  pitchDown: ['ArrowUp'],
  centerControls: ['Space'],
  reset: ['KeyR'],
  toggleHud: ['KeyH'],
  toggleCamera: ['KeyC'],
  pointerLock: ['MouseLeft'],
};

export const defaultAircraftInputConfig: AircraftInputConfig = {
  mouseSensitivityX: 0.0025,
  mouseSensitivityY: 0.002,
  invertPitch: false,
  keyboardPitchRate: 2.4,
  keyboardRollRate: 2.8,
  keyboardYawRate: 2.6,
  pitchCenteringRate: 0.12,
  rollCenteringRate: 0.04,
  yawCenteringRate: 2.8,
  inputSmoothing: 8,
  throttleStepPerSecond: 0.35,
  pointerLockEnabled: true,
  yokeReturnDelaySeconds: 0.18,
  yokeReturnRampSeconds: 0.55,
  mouseActivityThreshold: 0.35,
};
