import { describe, expect, it } from 'vitest';
import { Quaternion, Vector3 } from 'three';
import { aircraftProfiles } from './aircraftProfiles';
import { computeAeroKinematics } from './aeroKinematics';

const profile = aircraftProfiles.generic_trainer;

describe('aeroKinematics', () => {
  it('uses local -Z as aircraft forward', () => {
    const kinematics = computeAeroKinematics({
      velocityWorld: new Vector3(0, 0, -50),
      windWorld: new Vector3(),
      orientation: new Quaternion(),
      angularVelocityLocal: new Vector3(),
      profile,
    });

    expect(kinematics.speedMps).toBeCloseTo(50);
    expect(kinematics.alphaRad).toBeCloseTo(0);
    expect(kinematics.betaRad).toBeCloseTo(0);
  });

  it('reports positive angle of attack for downward flight path relative to the nose', () => {
    const kinematics = computeAeroKinematics({
      velocityWorld: new Vector3(0, -5, -50),
      windWorld: new Vector3(),
      orientation: new Quaternion(),
      angularVelocityLocal: new Vector3(),
      profile,
    });

    expect(kinematics.alphaRad).toBeGreaterThan(0);
  });

  it('maps three.js local angular velocity into aerospace body rates', () => {
    const kinematics = computeAeroKinematics({
      velocityWorld: new Vector3(0, 0, -50),
      windWorld: new Vector3(),
      orientation: new Quaternion(),
      angularVelocityLocal: new Vector3(0.2, -0.3, -0.4),
      profile,
    });

    expect(kinematics.pBody).toBeCloseTo(0.4);
    expect(kinematics.qBody).toBeCloseTo(0.2);
    expect(kinematics.rBody).toBeCloseTo(0.3);
    expect(kinematics.pHat).toBeGreaterThan(0);
    expect(kinematics.qHat).toBeGreaterThan(0);
    expect(kinematics.rHat).toBeGreaterThan(0);
  });
});
