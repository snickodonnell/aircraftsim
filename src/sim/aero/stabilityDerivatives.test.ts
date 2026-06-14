import { describe, expect, it } from 'vitest';
import { Quaternion, Vector3 } from 'three';
import { aircraftProfiles } from './aircraftProfiles';
import { computeAeroKinematics } from './aeroKinematics';
import { computeAeroCoefficients } from './stabilityDerivatives';
import type { AircraftControlSurfaceState, AircraftProfile } from './aircraftTypes';

const profile = aircraftProfiles.generic_trainer;
const neutralSurfaces: AircraftControlSurfaceState = {
  elevator: 0,
  aileron: 0,
  rudder: 0,
};

function kinematicsFor(profileUnderTest: AircraftProfile, params?: {
  velocityWorld?: Vector3;
  angularVelocityLocal?: Vector3;
}) {
  return computeAeroKinematics({
    velocityWorld: params?.velocityWorld ?? new Vector3(0, 0, -55),
    windWorld: new Vector3(),
    orientation: new Quaternion(),
    angularVelocityLocal: params?.angularVelocityLocal ?? new Vector3(),
    profile: profileUnderTest,
  });
}

describe('stabilityDerivatives', () => {
  it('increases lift coefficient with positive angle of attack', () => {
    const lowAlpha = computeAeroCoefficients(
      profile,
      kinematicsFor(profile, { velocityWorld: new Vector3(0, -1, -55) }),
      neutralSurfaces,
    );
    const highAlpha = computeAeroCoefficients(
      profile,
      kinematicsFor(profile, { velocityWorld: new Vector3(0, -8, -55) }),
      neutralSurfaces,
    );

    expect(highAlpha.cL).toBeGreaterThan(lowAlpha.cL);
  });

  it('uses static pitch stability and elevator authority in the expected directions', () => {
    const base = computeAeroCoefficients(profile, kinematicsFor(profile), neutralSurfaces);
    const noseUp = computeAeroCoefficients(profile, kinematicsFor(profile), {
      ...neutralSurfaces,
      elevator: profile.controlSurfaces.elevatorMaxDeg,
    });
    const highAlpha = computeAeroCoefficients(
      profile,
      kinematicsFor(profile, { velocityWorld: new Vector3(0, -8, -55) }),
      neutralSurfaces,
    );

    expect(noseUp.cM).toBeGreaterThan(base.cM);
    expect(highAlpha.cM).toBeLessThan(base.cM);
  });

  it('damps positive pitch, roll, and yaw rates', () => {
    const base = computeAeroCoefficients(profile, kinematicsFor(profile), neutralSurfaces);
    const pitchRate = computeAeroCoefficients(
      profile,
      kinematicsFor(profile, { angularVelocityLocal: new Vector3(0.35, 0, 0) }),
      neutralSurfaces,
    );
    const rollRate = computeAeroCoefficients(
      profile,
      kinematicsFor(profile, { angularVelocityLocal: new Vector3(0, 0, -0.35) }),
      neutralSurfaces,
    );
    const yawRate = computeAeroCoefficients(
      profile,
      kinematicsFor(profile, { angularVelocityLocal: new Vector3(0, -0.35, 0) }),
      neutralSurfaces,
    );

    expect(pitchRate.cM).toBeLessThan(base.cM);
    expect(rollRate.cRoll).toBeLessThan(base.cRoll);
    expect(yawRate.cN).toBeLessThan(base.cN);
  });

  it('uses positive aileron as a right-roll command in coefficient space', () => {
    const base = computeAeroCoefficients(profile, kinematicsFor(profile), neutralSurfaces);
    const rightRoll = computeAeroCoefficients(profile, kinematicsFor(profile), {
      ...neutralSurfaces,
      aileron: profile.controlSurfaces.aileronMaxDeg,
    });

    expect(rightRoll.cRoll).toBeGreaterThan(base.cRoll);
  });

  it('flips the dihedral roll contribution when dihedral is inverted', () => {
    const slipVelocity = new Vector3(8, 0, -55);
    const positive = computeAeroCoefficients(
      profile,
      kinematicsFor(profile, { velocityWorld: slipVelocity }),
      neutralSurfaces,
    );
    const negativeDihedralProfile = {
      ...profile,
      wing: {
        ...profile.wing,
        dihedralDeg: -profile.wing.dihedralDeg,
      },
    };
    const negative = computeAeroCoefficients(
      negativeDihedralProfile,
      kinematicsFor(negativeDihedralProfile, { velocityWorld: slipVelocity }),
      neutralSurfaces,
    );

    expect(positive.cRollDihedral).toBeGreaterThan(0);
    expect(negative.cRollDihedral).toBeLessThan(0);
  });
});
