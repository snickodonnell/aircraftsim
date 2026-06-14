import { aircraftProfiles } from './aircraftProfiles';
import type { AircraftProfile } from './aircraftTypes';

export type ProfileValidationResult = {
  valid: boolean;
  errors: string[];
  warnings: string[];
};

function positive(value: number, label: string, errors: string[]) {
  if (!Number.isFinite(value) || value <= 0) {
    errors.push(`${label} must be a positive finite number.`);
  }
}

function finite(value: number, label: string, errors: string[]) {
  if (!Number.isFinite(value)) {
    errors.push(`${label} must be finite.`);
  }
}

export function validateAircraftProfile(profile: AircraftProfile): ProfileValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!profile.id) {
    errors.push('Profile id is required.');
  }
  if (!profile.displayName) {
    errors.push(`${profile.id}: displayName is required.`);
  }

  positive(profile.massKg, `${profile.id}: massKg`, errors);
  positive(profile.wingAreaM2, `${profile.id}: wingAreaM2`, errors);
  positive(profile.wingspanM, `${profile.id}: wingspanM`, errors);
  positive(profile.meanChordM, `${profile.id}: meanChordM`, errors);
  positive(profile.referenceLengthM, `${profile.id}: referenceLengthM`, errors);
  positive(profile.engine.maxThrustN, `${profile.id}: engine.maxThrustN`, errors);
  positive(profile.wing.surfaceLiftShare, `${profile.id}: wing.surfaceLiftShare`, errors);
  profile.inertiaTensorApprox.forEach((value, index) => {
    positive(value, `${profile.id}: inertiaTensorApprox[${index}]`, errors);
  });
  positive(profile.pilotControl.mousePitchSensitivity, `${profile.id}: pilotControl.mousePitchSensitivity`, errors);
  positive(profile.pilotControl.mouseRollSensitivity, `${profile.id}: pilotControl.mouseRollSensitivity`, errors);
  positive(profile.pilotControl.inputSmoothing, `${profile.id}: pilotControl.inputSmoothing`, errors);
  positive(profile.pilotControl.yokeReturnRampSeconds, `${profile.id}: pilotControl.yokeReturnRampSeconds`, errors);
  positive(profile.pilotControl.mouseActivityThreshold, `${profile.id}: pilotControl.mouseActivityThreshold`, errors);
  positive(profile.control.minControlDynamicPressurePa, `${profile.id}: control.minControlDynamicPressurePa`, errors);
  positive(profile.limits.minAeroSpeedMps, `${profile.id}: limits.minAeroSpeedMps`, errors);
  positive(profile.controlSurfaces.elevatorMaxDeg, `${profile.id}: controlSurfaces.elevatorMaxDeg`, errors);
  positive(profile.controlSurfaces.aileronMaxDeg, `${profile.id}: controlSurfaces.aileronMaxDeg`, errors);
  positive(profile.controlSurfaces.rudderMaxDeg, `${profile.id}: controlSurfaces.rudderMaxDeg`, errors);
  positive(profile.controlSurfaces.elevatorRateDegPerSec, `${profile.id}: controlSurfaces.elevatorRateDegPerSec`, errors);
  positive(profile.controlSurfaces.aileronRateDegPerSec, `${profile.id}: controlSurfaces.aileronRateDegPerSec`, errors);
  positive(profile.controlSurfaces.rudderRateDegPerSec, `${profile.id}: controlSurfaces.rudderRateDegPerSec`, errors);
  positive(profile.liftingSurfaces.horizontalTailAreaM2, `${profile.id}: liftingSurfaces.horizontalTailAreaM2`, errors);
  positive(profile.liftingSurfaces.verticalTailAreaM2, `${profile.id}: liftingSurfaces.verticalTailAreaM2`, errors);
  positive(profile.liftingSurfaces.tailArmM, `${profile.id}: liftingSurfaces.tailArmM`, errors);

  const longitudinal = profile.stabilityDerivatives.longitudinal;
  const lateral = profile.stabilityDerivatives.lateralDirectional;
  Object.entries(longitudinal).forEach(([key, value]) =>
    finite(value, `${profile.id}: stabilityDerivatives.longitudinal.${key}`, errors),
  );
  Object.entries(lateral).forEach(([key, value]) =>
    finite(value, `${profile.id}: stabilityDerivatives.lateralDirectional.${key}`, errors),
  );

  if (profile.aero.stallAngleDeg < 8 || profile.aero.stallAngleDeg > 25) {
    warnings.push(`${profile.id}: stallAngleDeg is outside the suggested game range 8..25.`);
  }
  if (longitudinal.cLAlpha <= 0) {
    errors.push(`${profile.id}: longitudinal.cLAlpha should be positive.`);
  }
  if (longitudinal.cMAlpha >= 0) {
    errors.push(`${profile.id}: longitudinal.cMAlpha should be negative for static pitch stability.`);
  }
  if (longitudinal.cMQ >= 0) {
    errors.push(`${profile.id}: longitudinal.cMQ should be negative for pitch-rate damping.`);
  }
  if (lateral.cRollP >= 0) {
    errors.push(`${profile.id}: lateralDirectional.cRollP should be negative for roll damping.`);
  }
  if (lateral.cNR >= 0) {
    errors.push(`${profile.id}: lateralDirectional.cNR should be negative for yaw-rate damping.`);
  }
  if (lateral.cNBeta <= 0) {
    warnings.push(`${profile.id}: lateralDirectional.cNBeta is usually positive for weathercock stability in this frame.`);
  }
  if (lateral.cNRudder <= 0) {
    warnings.push(`${profile.id}: lateralDirectional.cNRudder should usually be positive for the default yaw-right command convention.`);
  }
  if (profile.limits.neverExceedSpeedMps <= profile.limits.maxSpeedMps) {
    errors.push(`${profile.id}: neverExceedSpeedMps should exceed maxSpeedMps.`);
  }
  if (profile.limits.minThrottle < 0 || profile.limits.maxThrottle > 1) {
    errors.push(`${profile.id}: throttle limits should stay inside 0..1.`);
  }
  if (profile.pilotControl.axisDeadzone < 0 || profile.pilotControl.axisDeadzone > 0.25) {
    errors.push(`${profile.id}: pilotControl.axisDeadzone should stay inside 0..0.25.`);
  }
  if (profile.pilotControl.rollDeadzone < 0 || profile.pilotControl.rollDeadzone > 0.25) {
    errors.push(`${profile.id}: pilotControl.rollDeadzone should stay inside 0..0.25.`);
  }
  if (Math.abs(profile.wing.dihedralDeg) > 12) {
    warnings.push(`${profile.id}: wing.dihedralDeg is outside the suggested initial range -12..12.`);
  }
  if (profile.controlSurfaces.elevatorMaxDeg > 35 || profile.controlSurfaces.aileronMaxDeg > 35 || profile.controlSurfaces.rudderMaxDeg > 40) {
    warnings.push(`${profile.id}: one or more control surface limits are high for the current game model.`);
  }
  if (profile.wing.surfaceLiftShare > 1) {
    errors.push(`${profile.id}: wing.surfaceLiftShare should be <= 1.`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

export function validateAllAircraftProfiles() {
  return Object.values(aircraftProfiles).map(validateAircraftProfile);
}
