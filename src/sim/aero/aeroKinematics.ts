import { Quaternion, Vector3 } from 'three';
import type { AircraftProfile } from './aircraftTypes';
import { clamp, localAirVelocity } from './aeroMath';

const EPSILON = 0.00001;

export type AeroKinematics = {
  airVelocityWorld: Vector3;
  airVelocityLocal: Vector3;
  speedMps: number;
  safeSpeedMps: number;
  alphaRad: number;
  betaRad: number;
  pBody: number;
  qBody: number;
  rBody: number;
  pHat: number;
  qHat: number;
  rHat: number;
};

export function computeAeroKinematics(params: {
  velocityWorld: Vector3;
  windWorld: Vector3;
  orientation: Quaternion;
  angularVelocityLocal: Vector3;
  profile: AircraftProfile;
}): AeroKinematics {
  const airVelocityWorld = params.velocityWorld.clone().sub(params.windWorld);
  const airVelocityLocal = localAirVelocity(
    params.velocityWorld,
    params.windWorld,
    params.orientation,
  );

  const u = -airVelocityLocal.z;
  const v = airVelocityLocal.x;
  const w = -airVelocityLocal.y;
  const speedMps = Math.sqrt(u * u + v * v + w * w);
  const safeSpeedMps = Math.max(speedMps, params.profile.limits.minAeroSpeedMps, EPSILON);
  const alphaRad = speedMps < EPSILON ? 0 : Math.atan2(w, Math.max(Math.abs(u), EPSILON));
  const betaRad = speedMps < EPSILON ? 0 : Math.asin(clamp(v / safeSpeedMps, -1, 1));

  const pBody = -params.angularVelocityLocal.z;
  const qBody = params.angularVelocityLocal.x;
  const rBody = -params.angularVelocityLocal.y;

  return {
    airVelocityWorld,
    airVelocityLocal,
    speedMps,
    safeSpeedMps,
    alphaRad,
    betaRad,
    pBody,
    qBody,
    rBody,
    pHat: (pBody * params.profile.wingspanM) / (2 * safeSpeedMps),
    qHat: (qBody * params.profile.meanChordM) / (2 * safeSpeedMps),
    rHat: (rBody * params.profile.wingspanM) / (2 * safeSpeedMps),
  };
}
