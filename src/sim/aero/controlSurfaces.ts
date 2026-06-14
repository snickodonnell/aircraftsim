import type {
  AircraftControlInput,
  AircraftControlSurfaceState,
  AircraftProfile,
} from './aircraftTypes';
import { clamp, degreesToRadians } from './aeroMath';

export type AircraftControlSurfaceRadians = {
  elevatorRad: number;
  aileronRad: number;
  rudderRad: number;
};

export function neutralControlSurfaces(): AircraftControlSurfaceState {
  return {
    elevator: 0,
    aileron: 0,
    rudder: 0,
  };
}

export function controlsToSurfaceTargets(
  profile: AircraftProfile,
  controls: AircraftControlInput,
): AircraftControlSurfaceState {
  return {
    elevator:
      clamp(controls.pitch + controls.trimPitch, -1, 1) *
      profile.controlSurfaces.elevatorMaxDeg,
    aileron: clamp(controls.roll, -1, 1) * profile.controlSurfaces.aileronMaxDeg,
    rudder: clamp(controls.yaw, -1, 1) * profile.controlSurfaces.rudderMaxDeg,
  };
}

function moveToward(current: number, target: number, maxStep: number) {
  if (Math.abs(target - current) <= maxStep) {
    return target;
  }
  return current + Math.sign(target - current) * maxStep;
}

export function stepControlSurfaces(
  profile: AircraftProfile,
  current: AircraftControlSurfaceState,
  controls: AircraftControlInput,
  dt: number,
): AircraftControlSurfaceState {
  const target = controlsToSurfaceTargets(profile, controls);

  return {
    elevator: moveToward(
      current.elevator,
      target.elevator,
      profile.controlSurfaces.elevatorRateDegPerSec * dt,
    ),
    aileron: moveToward(
      current.aileron,
      target.aileron,
      profile.controlSurfaces.aileronRateDegPerSec * dt,
    ),
    rudder: moveToward(
      current.rudder,
      target.rudder,
      profile.controlSurfaces.rudderRateDegPerSec * dt,
    ),
  };
}

export function controlSurfacesToRadians(
  surfaces: AircraftControlSurfaceState,
): AircraftControlSurfaceRadians {
  return {
    elevatorRad: degreesToRadians(surfaces.elevator),
    aileronRad: degreesToRadians(surfaces.aileron),
    rudderRad: degreesToRadians(surfaces.rudder),
  };
}

export function normalizedSurfaceMagnitude(
  profile: AircraftProfile,
  surfaces: AircraftControlSurfaceState,
) {
  const elevator = surfaces.elevator / Math.max(profile.controlSurfaces.elevatorMaxDeg, 0.0001);
  const aileron = surfaces.aileron / Math.max(profile.controlSurfaces.aileronMaxDeg, 0.0001);
  const rudder = surfaces.rudder / Math.max(profile.controlSurfaces.rudderMaxDeg, 0.0001);

  return Math.sqrt(elevator * elevator + aileron * aileron + rudder * rudder);
}
