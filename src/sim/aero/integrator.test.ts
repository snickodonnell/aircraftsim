import { describe, expect, it } from 'vitest';
import { aircraftProfiles } from './aircraftProfiles';
import { standardFlightEnvironment } from './atmosphere';
import { createInitialAircraftState, stepAircraftSimulation } from './integrator';
import type { AircraftControlInput } from './aircraftTypes';

const profile = aircraftProfiles.generic_trainer;
const neutralControls: AircraftControlInput = {
  pitch: 0,
  roll: 0,
  yaw: 0,
  throttle: 0.7,
  trimPitch: 0,
  boost: false,
};

describe('integrator', () => {
  it('keeps a short neutral flight simulation finite', () => {
    let state = createInitialAircraftState(profile);

    for (let index = 0; index < 180; index += 1) {
      state = stepAircraftSimulation(
        profile,
        standardFlightEnvironment,
        state,
        neutralControls,
        1 / 60,
      ).state;
    }

    expect(Number.isFinite(state.positionWorld.length())).toBe(true);
    expect(Number.isFinite(state.velocityWorld.length())).toBe(true);
    expect(Number.isFinite(state.angularVelocityLocal.length())).toBe(true);
    expect(state.orientation.length()).toBeCloseTo(1);
  });

  it('rate-limits a roll command through the aileron surface', () => {
    const state = createInitialAircraftState(profile);
    const next = stepAircraftSimulation(
      profile,
      standardFlightEnvironment,
      state,
      {
        ...neutralControls,
        roll: 1,
      },
      0.05,
    ).state;

    const clampedDt = 1 / 30;
    expect(next.controlSurfaces.aileron).toBeCloseTo(
      profile.controlSurfaces.aileronRateDegPerSec * clampedDt,
    );
    expect(next.controlSurfaces.aileron).toBeLessThan(profile.controlSurfaces.aileronMaxDeg);
  });
});
