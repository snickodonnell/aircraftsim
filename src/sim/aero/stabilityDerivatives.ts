import type { AircraftControlSurfaceState, AircraftProfile } from './aircraftTypes';
import { clamp, degreesToRadians, lerp, smoothstep } from './aeroMath';
import type { AeroKinematics } from './aeroKinematics';
import {
  controlSurfacesToRadians,
  normalizedSurfaceMagnitude,
} from './controlSurfaces';

export type AeroCoefficients = {
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

function signedCurve(value: number, maxAbs: number) {
  return clamp(value, -maxAbs, maxAbs);
}

export function dihedralRollBetaDerivative(profile: AircraftProfile) {
  return (
    profile.wing.dihedralDeg *
    profile.wing.dihedralEffectiveness *
    profile.wing.surfaceLiftShare *
    0.018
  );
}

export function bankDihedralRollCoefficient(profile: AircraftProfile, bankAngleRad: number) {
  return (
    bankAngleRad *
    degreesToRadians(profile.wing.dihedralDeg) *
    profile.wing.bankStabilityEffectiveness *
    profile.wing.surfaceLiftShare
  );
}

export function effectiveRollBetaDerivative(profile: AircraftProfile) {
  return (
    profile.stabilityDerivatives.lateralDirectional.cRollBeta +
    dihedralRollBetaDerivative(profile)
  );
}

export function computeAeroCoefficients(
  profile: AircraftProfile,
  kinematics: AeroKinematics,
  controlSurfaces: AircraftControlSurfaceState,
  bankAngleRad = 0,
): AeroCoefficients {
  const longitudinal = profile.stabilityDerivatives.longitudinal;
  const lateral = profile.stabilityDerivatives.lateralDirectional;
  const { elevatorRad, aileronRad, rudderRad } = controlSurfacesToRadians(controlSurfaces);
  const alpha = kinematics.alphaRad + degreesToRadians(profile.wing.incidenceDeg);
  const beta = kinematics.betaRad;

  const stallAngleRad = degreesToRadians(profile.aero.stallAngleDeg);
  const stallRatio = Math.abs(alpha) / Math.max(stallAngleRad, 0.0001);
  const stallBlend = smoothstep(1, 1.6, stallRatio);
  const controlFade = lerp(1, 0.45, stallBlend);
  const cLAttached =
    longitudinal.cL0 +
    longitudinal.cLAlpha * alpha +
    longitudinal.cLQ * kinematics.qHat +
    longitudinal.cLElevator * elevatorRad * controlFade;
  const cLLinear = signedCurve(cLAttached, profile.aero.clMax);
  const cLPost =
    Math.sign(cLLinear || alpha || 1) *
    profile.aero.clMax *
    profile.aero.postStallLiftFactor;
  const cL = lerp(cLLinear, cLPost, stallBlend);

  const controlMagnitude = normalizedSurfaceMagnitude(profile, controlSurfaces);
  const cD =
    longitudinal.cD0 +
    profile.aero.inducedDragK * cL * cL +
    longitudinal.cDAlpha * alpha * alpha +
    longitudinal.cDBeta * beta * beta +
    longitudinal.cDControl * controlMagnitude * controlMagnitude +
    stallBlend * 0.8 * clamp(stallRatio - 1, 0, 2);

  const cY =
    lateral.cYBeta * beta +
    lateral.cYP * kinematics.pHat +
    lateral.cYR * kinematics.rHat +
    lateral.cYAileron * aileronRad * controlFade +
    lateral.cYRudder * rudderRad * controlFade;

  const cRollDihedral = dihedralRollBetaDerivative(profile) * beta;
  const cRollBank = bankDihedralRollCoefficient(profile, bankAngleRad);
  const cRoll =
    lateral.cRollBeta * beta +
    cRollDihedral +
    cRollBank +
    lateral.cRollP * kinematics.pHat +
    lateral.cRollR * kinematics.rHat +
    lateral.cRollAileron * aileronRad * controlFade +
    lateral.cRollRudder * rudderRad * controlFade;

  const cM =
    longitudinal.cM0 +
    longitudinal.cMAlpha * alpha +
    longitudinal.cMQ * kinematics.qHat +
    longitudinal.cMElevator * elevatorRad * controlFade;

  const cN =
    lateral.cNBeta * beta +
    lateral.cNP * kinematics.pHat +
    lateral.cNR * kinematics.rHat +
    lateral.cNAileron * aileronRad * controlFade +
    lateral.cNRudder * rudderRad * controlFade;

  return {
    cL,
    cD,
    cY,
    cRoll,
    cM,
    cN,
    stallBlend,
    cRollDihedral,
    cRollBank,
  };
}
