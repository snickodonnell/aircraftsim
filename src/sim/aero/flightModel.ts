import { Vector3 } from 'three';
import {
  AIRCRAFT_FORWARD_LOCAL,
  AIRCRAFT_RIGHT_LOCAL,
  AIRCRAFT_UP_LOCAL,
  radiansToDegrees,
} from './coordinateFrames';
import {
  clamp,
  clampVectorMagnitude,
  dynamicPressure,
  safeNormalize,
} from './aeroMath';
import { airDensityAtAltitude, effectiveWindVelocity } from './atmosphere';
import { computeAeroKinematics } from './aeroKinematics';
import { controlsToSurfaceTargets } from './controlSurfaces';
import { computeAeroCoefficients } from './stabilityDerivatives';
import type {
  AircraftControlInput,
  AircraftProfile,
  AircraftSimState,
  FlightEnvironment,
  FlightTelemetry,
} from './aircraftTypes';

export type { AircraftSimState } from './aircraftTypes';

export type FlightForces = {
  forceWorld: Vector3;
  momentLocal: Vector3;
  telemetry: FlightTelemetry;
};

const forwardLocal = new Vector3(...AIRCRAFT_FORWARD_LOCAL);
const rightLocal = new Vector3(...AIRCRAFT_RIGHT_LOCAL);
const upLocal = new Vector3(...AIRCRAFT_UP_LOCAL);

export function makeAircraftBasis(orientation: AircraftSimState['orientation']) {
  return {
    forwardWorld: forwardLocal.clone().applyQuaternion(orientation).normalize(),
    rightWorld: rightLocal.clone().applyQuaternion(orientation).normalize(),
    upWorld: upLocal.clone().applyQuaternion(orientation).normalize(),
  };
}

function projectedDirection(axisWorld: Vector3, airDirection: Vector3) {
  return safeNormalize(
    axisWorld.clone().sub(airDirection.clone().multiplyScalar(axisWorld.dot(airDirection))),
    axisWorld,
  );
}

export function computeFlightForces(
  profile: AircraftProfile,
  environment: FlightEnvironment,
  state: AircraftSimState,
  controls: AircraftControlInput,
): FlightForces {
  const { forwardWorld, rightWorld, upWorld } = makeAircraftBasis(state.orientation);
  const windWorld = new Vector3(...effectiveWindVelocity(environment));
  const altitudeM = state.positionWorld.y;
  const airDensityKgM3 = airDensityAtAltitude(altitudeM, environment);
  const kinematics = computeAeroKinematics({
    velocityWorld: state.velocityWorld,
    windWorld,
    orientation: state.orientation,
    angularVelocityLocal: state.angularVelocityLocal,
    profile,
  });
  const q = dynamicPressure(airDensityKgM3, kinematics.speedMps);
  const bankAngleRad = Math.asin(clamp(rightWorld.y, -1, 1));
  const controlSurfaces = state.controlSurfaces ?? controlsToSurfaceTargets(profile, controls);
  const coefficients = computeAeroCoefficients(
    profile,
    kinematics,
    controlSurfaces,
    bankAngleRad,
  );

  const airDirection = safeNormalize(kinematics.airVelocityWorld, forwardWorld);
  const liftDirection = projectedDirection(upWorld, airDirection);
  const sideDirection = projectedDirection(rightWorld, airDirection);

  const liftN = q * profile.wingAreaM2 * coefficients.cL;
  const dragN = q * profile.wingAreaM2 * coefficients.cD;
  const sideForceN = q * profile.wingAreaM2 * coefficients.cY;
  const throttle = clamp(
    controls.throttle,
    profile.limits.minThrottle,
    profile.limits.maxThrottle,
  );
  const thrustBase =
    profile.engine.idleThrustN +
    throttle * (profile.engine.maxThrustN - profile.engine.idleThrustN);
  const speedFactor = clamp(
    1 - (kinematics.speedMps / profile.limits.neverExceedSpeedMps) * 0.35,
    0.35,
    1,
  );
  const thrustN = thrustBase * speedFactor * (controls.boost ? 1.08 : 1);

  const liftForceWorld = liftDirection.multiplyScalar(liftN);
  const dragForceWorld = airDirection.multiplyScalar(-dragN);
  const sideForceWorld = sideDirection.multiplyScalar(sideForceN);
  const thrustForceWorld = forwardWorld.clone().multiplyScalar(thrustN);
  const gravityForceWorld = new Vector3(0, -profile.massKg * environment.gravityMps2, 0);

  const forceWorld = liftForceWorld
    .clone()
    .add(dragForceWorld)
    .add(sideForceWorld)
    .add(thrustForceWorld)
    .add(gravityForceWorld);

  const normalizedControlActivity = Math.max(
    Math.abs(controlSurfaces.elevator) /
      Math.max(profile.controlSurfaces.elevatorMaxDeg, 0.0001),
    Math.abs(controlSurfaces.aileron) /
      Math.max(profile.controlSurfaces.aileronMaxDeg, 0.0001),
    Math.abs(controlSurfaces.rudder) /
      Math.max(profile.controlSurfaces.rudderMaxDeg, 0.0001),
  );
  const momentQ = Math.max(q, profile.control.minControlDynamicPressurePa * normalizedControlActivity);
  const pitchMomentNm = momentQ * profile.wingAreaM2 * profile.meanChordM * coefficients.cM;
  const rollMomentNm = momentQ * profile.wingAreaM2 * profile.wingspanM * coefficients.cRoll;
  const yawMomentNm = momentQ * profile.wingAreaM2 * profile.wingspanM * coefficients.cN;

  const dihedralMomentNm =
    -momentQ *
    profile.wingAreaM2 *
    profile.wingspanM *
    (coefficients.cRollDihedral + coefficients.cRollBank);

  const maxForce = profile.massKg * environment.gravityMps2 * profile.limits.maxLoadFactor * 2.5;
  const maxMoment = profile.massKg * profile.referenceLengthM * environment.gravityMps2 * 80;
  const limitedForceWorld = clampVectorMagnitude(forceWorld, maxForce);
  const momentLocal = clampVectorMagnitude(
    new Vector3(pitchMomentNm, -yawMomentNm, -rollMomentNm),
    maxMoment,
  );

  return {
    forceWorld: limitedForceWorld,
    momentLocal,
    telemetry: {
      profileId: profile.id,
      profileName: profile.displayName,
      speedMps: kinematics.speedMps,
      speedMph: kinematics.speedMps * 2.236936,
      altitudeM,
      verticalSpeedMps: state.velocityWorld.y,
      angleOfAttackDeg: radiansToDegrees(kinematics.alphaRad),
      sideSlipDeg: radiansToDegrees(kinematics.betaRad),
      dynamicPressurePa: q,
      airDensityKgM3,
      liftN,
      dragN,
      thrustN,
      dihedralMomentNm,
      bankAngleDeg: radiansToDegrees(bankAngleRad),
      coefficients,
      nondimensionalRates: {
        pHat: kinematics.pHat,
        qHat: kinematics.qHat,
        rHat: kinematics.rHat,
      },
      controlSurfaces,
      throttle,
      loadFactor: liftN / Math.max(profile.massKg * environment.gravityMps2, 1),
    },
  };
}
