import type { Quaternion, Vector3 } from 'three';

export type Vec3Tuple = [number, number, number];

export type AircraftCategory =
  | 'prop_trainer'
  | 'ww2_fighter'
  | 'heavy_bomber'
  | 'jet_baseline';

export type EngineType = 'prop' | 'jet';

export type AircraftEngineProfile = {
  type: EngineType;
  maxThrustN: number;
  idleThrustN: number;
  throttleResponse: number;
};

export type AircraftAeroCoefficients = {
  cl0: number;
  clAlpha: number;
  clMax: number;
  cd0: number;
  inducedDragK: number;
  cm0: number;
  cmAlpha: number;
  stallAngleDeg: number;
  postStallLiftFactor: number;
  sideSlipDrag: number;
};

export type AircraftWingGeometry = {
  dihedralDeg: number;
  incidenceDeg: number;
  dihedralEffectiveness: number;
  bankStabilityEffectiveness: number;
  surfaceLiftShare: number;
};

export type AircraftLongitudinalDerivatives = {
  cL0: number;
  cLAlpha: number;
  cLQ: number;
  cLElevator: number;
  cD0: number;
  cDAlpha: number;
  cDBeta: number;
  cDControl: number;
  cM0: number;
  cMAlpha: number;
  cMQ: number;
  cMElevator: number;
};

export type AircraftLateralDirectionalDerivatives = {
  cYBeta: number;
  cYP: number;
  cYR: number;
  cYAileron: number;
  cYRudder: number;
  cRollBeta: number;
  cRollP: number;
  cRollR: number;
  cRollAileron: number;
  cRollRudder: number;
  cNBeta: number;
  cNP: number;
  cNR: number;
  cNAileron: number;
  cNRudder: number;
};

export type AircraftStabilityDerivatives = {
  longitudinal: AircraftLongitudinalDerivatives;
  lateralDirectional: AircraftLateralDirectionalDerivatives;
};

export type AircraftControlSurfaceProfile = {
  elevatorMaxDeg: number;
  aileronMaxDeg: number;
  rudderMaxDeg: number;
  elevatorRateDegPerSec: number;
  aileronRateDegPerSec: number;
  rudderRateDegPerSec: number;
};

export type AircraftLiftingSurfaces = {
  horizontalTailAreaM2: number;
  verticalTailAreaM2: number;
  tailArmM: number;
};

export type AircraftControlProfile = {
  elevatorPower: number;
  aileronPower: number;
  rudderPower: number;
  pitchDamping: number;
  rollDamping: number;
  yawDamping: number;
  minControlDynamicPressurePa: number;
};

export type AircraftPilotControlProfile = {
  mousePitchSensitivity: number;
  mouseRollSensitivity: number;
  keyboardPitchRate: number;
  keyboardRollRate: number;
  keyboardYawRate: number;
  inputSmoothing: number;
  pitchCenteringRate: number;
  rollCenteringRate: number;
  yawCenteringRate: number;
  axisDeadzone: number;
  pitchCurve: number;
  rollCurve: number;
  yawCurve: number;
  rollDeadzone: number;
  yawDeadzone: number;
  yokeReturnDelaySeconds: number;
  yokeReturnRampSeconds: number;
  mouseActivityThreshold: number;
};

export type AircraftLimits = {
  maxSpeedMps: number;
  neverExceedSpeedMps: number;
  maxLoadFactor: number;
  minThrottle: number;
  maxThrottle: number;
  minAeroSpeedMps: number;
};

export type AircraftSpawnDefaults = {
  position: Vec3Tuple;
  rotationEulerDeg: Vec3Tuple;
  initialSpeedMps: number;
  altitudeM: number;
};

export type AircraftVisualDefaults = {
  modelScale: Vec3Tuple;
  modelRotationEulerDeg: Vec3Tuple;
  chaseCameraDistance: number;
  chaseCameraHeight: number;
};

export type AircraftProfileMode =
  | 'real_aircraft'
  | 'inspired_by_real_aircraft'
  | 'generic_class';

export type SourceConfidence = 'high' | 'medium' | 'low';

export type AircraftProfileSource = {
  label: string;
  url?: string;
  fieldsUsed: string[];
  confidence: SourceConfidence;
  notes?: string;
};

export type AircraftProfileReferenceValue = number | string | boolean | number[] | string[];

export type AircraftProfileMetadata = {
  profileMode: AircraftProfileMode;
  sourceConfidence: SourceConfidence;
  referenceAircraft?: string[];
  referenceValues?: Record<string, AircraftProfileReferenceValue>;
  sources: AircraftProfileSource[];
  assumptions: string[];
  gameTuningNotes: string[];
  notHistoricallyExact: boolean;
};

export type AircraftProfile = {
  id: string;
  displayName: string;
  category: AircraftCategory;
  meshHintNames?: string[];
  metadata?: AircraftProfileMetadata;
  massKg: number;
  wingAreaM2: number;
  wingspanM: number;
  meanChordM: number;
  referenceLengthM: number;
  inertiaTensorApprox: Vec3Tuple;
  engine: AircraftEngineProfile;
  aero: AircraftAeroCoefficients;
  wing: AircraftWingGeometry;
  stabilityDerivatives: AircraftStabilityDerivatives;
  controlSurfaces: AircraftControlSurfaceProfile;
  liftingSurfaces: AircraftLiftingSurfaces;
  control: AircraftControlProfile;
  pilotControl: AircraftPilotControlProfile;
  limits: AircraftLimits;
  spawn: AircraftSpawnDefaults;
  visual: AircraftVisualDefaults;
  tuningNotes: string[];
};

export type AircraftControlInput = {
  pitch: number;
  roll: number;
  yaw: number;
  throttle: number;
  trimPitch: number;
  boost: boolean;
};

export type AircraftControlSurfaceState = {
  elevator: number;
  aileron: number;
  rudder: number;
};

export type FlightTelemetry = {
  profileId: string;
  profileName: string;
  speedMps: number;
  speedMph: number;
  altitudeM: number;
  verticalSpeedMps: number;
  angleOfAttackDeg: number;
  sideSlipDeg: number;
  dynamicPressurePa: number;
  airDensityKgM3: number;
  liftN: number;
  dragN: number;
  thrustN: number;
  dihedralMomentNm: number;
  bankAngleDeg: number;
  coefficients: {
    cL: number;
    cD: number;
    cY: number;
    cRoll: number;
    cM: number;
    cN: number;
    stallBlend: number;
    cRollDihedral: number;
    cRollBank: number;
  };
  nondimensionalRates: {
    pHat: number;
    qHat: number;
    rHat: number;
  };
  controlSurfaces: AircraftControlSurfaceState;
  throttle: number;
  loadFactor: number;
};

export type AircraftSimState = {
  positionWorld: Vector3;
  velocityWorld: Vector3;
  orientation: Quaternion;
  angularVelocityLocal: Vector3;
  controlSurfaces: AircraftControlSurfaceState;
  throttle: number;
};

export type FlightEnvironment = {
  gravityMps2: number;
  seaLevelDensityKgM3: number;
  densityScaleHeightM: number;
  windVelocityMps: Vec3Tuple;
  turbulenceIntensity: number;
  gustVelocityMps: Vec3Tuple;
  groundAltitudeM: number;
};

export type AircraftProfileResolutionInput = {
  aircraftProfileId?: string;
  assetId?: string;
  displayName?: string;
  meshHintName?: string;
};
