import { describe, expect, it } from 'vitest';
import { aircraftProfiles } from './aircraftProfiles';
import {
  controlSurfacesToRadians,
  neutralControlSurfaces,
  stepControlSurfaces,
} from './controlSurfaces';

const profile = aircraftProfiles.generic_trainer;

describe('controlSurfaces', () => {
  it('rate-limits movement toward pilot commands', () => {
    const next = stepControlSurfaces(
      profile,
      neutralControlSurfaces(),
      {
        pitch: 1,
        roll: 1,
        yaw: 1,
        throttle: 0.7,
        trimPitch: 0,
        boost: false,
      },
      0.05,
    );

    expect(next.elevator).toBeCloseTo(profile.controlSurfaces.elevatorRateDegPerSec * 0.05);
    expect(next.aileron).toBeCloseTo(profile.controlSurfaces.aileronRateDegPerSec * 0.05);
    expect(next.rudder).toBeCloseTo(profile.controlSurfaces.rudderRateDegPerSec * 0.05);
  });

  it('converts surface deflections to radians', () => {
    const radians = controlSurfacesToRadians({
      elevator: 180,
      aileron: 90,
      rudder: 45,
    });

    expect(radians.elevatorRad).toBeCloseTo(Math.PI);
    expect(radians.aileronRad).toBeCloseTo(Math.PI / 2);
    expect(radians.rudderRad).toBeCloseTo(Math.PI / 4);
  });
});
