import { Euler, Quaternion, Vector3 } from 'three';
import { clamp, clampVectorMagnitude, degreesToRadians } from './aeroMath';
import { computeFlightForces, type AircraftSimState, type FlightForces } from './flightModel';
import { neutralControlSurfaces, stepControlSurfaces } from './controlSurfaces';
import type { AircraftControlInput, AircraftProfile, FlightEnvironment } from './aircraftTypes';

export type FlightStepResult = {
  state: AircraftSimState;
  forces: FlightForces;
};

export function createInitialAircraftState(profile: AircraftProfile): AircraftSimState {
  const orientation = new Quaternion().setFromEuler(
    new Euler(
      degreesToRadians(profile.spawn.rotationEulerDeg[0]),
      degreesToRadians(profile.spawn.rotationEulerDeg[1]),
      degreesToRadians(profile.spawn.rotationEulerDeg[2]),
      'XYZ',
    ),
  );
  const forward = new Vector3(0, 0, -1).applyQuaternion(orientation).normalize();

  return {
    positionWorld: new Vector3(...profile.spawn.position),
    velocityWorld: forward.multiplyScalar(profile.spawn.initialSpeedMps),
    orientation,
    angularVelocityLocal: new Vector3(0, 0, 0),
    controlSurfaces: neutralControlSurfaces(),
    throttle: 0.65,
  };
}

export function cloneAircraftState(state: AircraftSimState): AircraftSimState {
  return {
    positionWorld: state.positionWorld.clone(),
    velocityWorld: state.velocityWorld.clone(),
    orientation: state.orientation.clone(),
    angularVelocityLocal: state.angularVelocityLocal.clone(),
    controlSurfaces: { ...state.controlSurfaces },
    throttle: state.throttle,
  };
}

export function stepAircraftSimulation(
  profile: AircraftProfile,
  environment: FlightEnvironment,
  currentState: AircraftSimState,
  controls: AircraftControlInput,
  rawDt: number,
): FlightStepResult {
  const dt = clamp(rawDt, 0, 1 / 30);
  const state = cloneAircraftState(currentState);
  state.throttle = clamp(
    controls.throttle,
    profile.limits.minThrottle,
    profile.limits.maxThrottle,
  );
  state.controlSurfaces = stepControlSurfaces(
    profile,
    state.controlSurfaces,
    controls,
    dt,
  );

  const forces = computeFlightForces(profile, environment, state, {
    ...controls,
    throttle: state.throttle,
  });

  const accelerationWorld = forces.forceWorld.clone().multiplyScalar(1 / profile.massKg);
  state.velocityWorld.addScaledVector(accelerationWorld, dt);
  state.velocityWorld.copy(
    clampVectorMagnitude(state.velocityWorld, profile.limits.neverExceedSpeedMps * 1.25),
  );
  state.positionWorld.addScaledVector(state.velocityWorld, dt);

  const inertia = new Vector3(...profile.inertiaTensorApprox);
  const inertiaOmega = new Vector3(
    inertia.x * state.angularVelocityLocal.x,
    inertia.y * state.angularVelocityLocal.y,
    inertia.z * state.angularVelocityLocal.z,
  );
  const gyro = state.angularVelocityLocal.clone().cross(inertiaOmega);
  const angularAcceleration = forces.momentLocal.clone().sub(gyro);
  angularAcceleration.set(
    angularAcceleration.x / inertia.x,
    angularAcceleration.y / inertia.y,
    angularAcceleration.z / inertia.z,
  );

  state.angularVelocityLocal.addScaledVector(angularAcceleration, dt);
  state.angularVelocityLocal.copy(clampVectorMagnitude(state.angularVelocityLocal, 2.6));

  const angularSpeed = state.angularVelocityLocal.length();
  if (angularSpeed > 0.0001) {
    const axisLocal = state.angularVelocityLocal.clone().normalize();
    const deltaLocal = new Quaternion().setFromAxisAngle(axisLocal, angularSpeed * dt);
    state.orientation.multiply(deltaLocal).normalize();
  }

  const minAltitude = environment.groundAltitudeM + 1;
  if (state.positionWorld.y < minAltitude) {
    state.positionWorld.y = minAltitude;
    state.velocityWorld.y = Math.max(0, state.velocityWorld.y);
    state.angularVelocityLocal.multiplyScalar(0.35);
  }

  return {
    state,
    forces,
  };
}
