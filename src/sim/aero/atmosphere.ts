import type { FlightEnvironment, Vec3Tuple } from './aircraftTypes';

export const standardFlightEnvironment: FlightEnvironment = {
  gravityMps2: 9.80665,
  seaLevelDensityKgM3: 1.225,
  densityScaleHeightM: 8500,
  windVelocityMps: [0, 0, 0],
  turbulenceIntensity: 0,
  gustVelocityMps: [0, 0, 0],
  groundAltitudeM: 0,
};

export function airDensityAtAltitude(
  altitudeM: number,
  environment: FlightEnvironment = standardFlightEnvironment,
) {
  const altitudeAboveGround = Math.max(0, altitudeM - environment.groundAltitudeM);
  return (
    environment.seaLevelDensityKgM3 *
    Math.exp(-altitudeAboveGround / environment.densityScaleHeightM)
  );
}

export function effectiveWindVelocity(environment: FlightEnvironment): Vec3Tuple {
  return [
    environment.windVelocityMps[0] + environment.gustVelocityMps[0],
    environment.windVelocityMps[1] + environment.gustVelocityMps[1],
    environment.windVelocityMps[2] + environment.gustVelocityMps[2],
  ];
}
