import { Quaternion, Vector3 } from 'three';
import type { AircraftAeroCoefficients } from './aircraftTypes';
import { degreesToRadians, radiansToDegrees } from './coordinateFrames';

const EPSILON = 0.00001;

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export function smoothstep(edge0: number, edge1: number, value: number) {
  const t = clamp((value - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

export function safeNormalize(vector: Vector3, fallback = new Vector3(0, 0, -1)) {
  if (vector.lengthSq() < EPSILON) {
    return fallback.clone();
  }
  return vector.clone().normalize();
}

export function clampVectorMagnitude(vector: Vector3, maxLength: number) {
  const length = vector.length();
  if (length <= maxLength || length < EPSILON) {
    return vector.clone();
  }
  return vector.clone().multiplyScalar(maxLength / length);
}

export function localAirVelocity(velocityWorld: Vector3, windWorld: Vector3, orientation: Quaternion) {
  return velocityWorld.clone().sub(windWorld).applyQuaternion(orientation.clone().invert());
}

export function calculateAngleOfAttack(localVelocity: Vector3) {
  const forwardSpeed = Math.max(Math.abs(-localVelocity.z), EPSILON);
  if (localVelocity.lengthSq() < EPSILON) {
    return 0;
  }
  return Math.atan2(-localVelocity.y, forwardSpeed);
}

export function calculateSideslip(localVelocity: Vector3) {
  const forwardSpeed = Math.max(Math.abs(-localVelocity.z), EPSILON);
  if (localVelocity.lengthSq() < EPSILON) {
    return 0;
  }
  return Math.atan2(localVelocity.x, forwardSpeed);
}

export function dynamicPressure(airDensityKgM3: number, speedMps: number) {
  return 0.5 * airDensityKgM3 * speedMps * speedMps;
}

export function calculateLiftCoefficient(aero: AircraftAeroCoefficients, angleOfAttackRad: number) {
  const stallAngleRad = degreesToRadians(aero.stallAngleDeg);
  const linear = clamp(aero.cl0 + aero.clAlpha * angleOfAttackRad, -aero.clMax, aero.clMax);
  const stallRatio = Math.abs(angleOfAttackRad) / Math.max(stallAngleRad, EPSILON);
  const stallBlend = smoothstep(1, 1.6, stallRatio);
  const postStall = Math.sign(linear || angleOfAttackRad || 1) * aero.clMax * aero.postStallLiftFactor;
  return lerp(linear, postStall, stallBlend);
}

export function calculateDragCoefficient(
  aero: AircraftAeroCoefficients,
  liftCoefficient: number,
  angleOfAttackRad: number,
  sideslipRad: number,
) {
  const stallAngleRad = degreesToRadians(aero.stallAngleDeg);
  const stallRatio = Math.abs(angleOfAttackRad) / Math.max(stallAngleRad, EPSILON);
  const stallBlend = smoothstep(1, 1.6, stallRatio);
  return (
    aero.cd0 +
    aero.inducedDragK * liftCoefficient * liftCoefficient +
    aero.sideSlipDrag * sideslipRad * sideslipRad +
    stallBlend * 0.8 * clamp(stallRatio - 1, 0, 2)
  );
}

export { degreesToRadians, radiansToDegrees };
