import { describe, expect, it } from 'vitest';
import { Quaternion, Vector3, Euler } from 'three';
import { aircraftProfiles } from './aircraftProfiles';
import { standardFlightEnvironment } from './atmosphere';
import { computeFlightForces, type AircraftSimState } from './flightModel';
import type { AircraftControlInput, AircraftControlSurfaceState } from './aircraftTypes';

const profile = aircraftProfiles.generic_trainer;
const controls: AircraftControlInput = {
  pitch: 0,
  roll: 0,
  yaw: 0,
  throttle: 0.7,
  trimPitch: 0,
  boost: false,
};

function stateWithVelocity(
  velocityWorld: Vector3,
  controlSurfaces: AircraftControlSurfaceState = {
    elevator: 0,
    aileron: 0,
    rudder: 0,
  },
): AircraftSimState {
  return {
    positionWorld: new Vector3(0, 300, 0),
    velocityWorld,
    orientation: new Quaternion(),
    angularVelocityLocal: new Vector3(),
    controlSurfaces,
    throttle: 0.7,
  };
}

describe('flightModel', () => {
  it('computes finite forces at low speed', () => {
    const result = computeFlightForces(
      profile,
      standardFlightEnvironment,
      stateWithVelocity(new Vector3(0, 0, 0)),
      controls,
    );

    expect(Number.isFinite(result.forceWorld.length())).toBe(true);
    expect(Number.isFinite(result.momentLocal.length())).toBe(true);
  });

  it('thrust acts along aircraft forward direction', () => {
    const result = computeFlightForces(
      profile,
      standardFlightEnvironment,
      stateWithVelocity(new Vector3(0, 0, -50)),
      controls,
    );

    expect(result.forceWorld.dot(new Vector3(0, 0, -1))).toBeGreaterThan(0);
    expect(result.telemetry.thrustN).toBeGreaterThan(profile.engine.idleThrustN);
  });

  it('gravity is included', () => {
    const result = computeFlightForces(
      profile,
      standardFlightEnvironment,
      stateWithVelocity(new Vector3(0, 0, 0)),
      { ...controls, throttle: 0 },
    );

    expect(result.forceWorld.y).toBeLessThan(0);
    expect(Math.abs(result.forceWorld.y)).toBeGreaterThan(profile.massKg * 5);
  });

  it('lift increases with speed at the same angle of attack', () => {
    const slow = computeFlightForces(
      profile,
      standardFlightEnvironment,
      stateWithVelocity(new Vector3(0, -4, -40)),
      controls,
    );
    const fast = computeFlightForces(
      profile,
      standardFlightEnvironment,
      stateWithVelocity(new Vector3(0, -8, -80)),
      controls,
    );

    expect(fast.telemetry.liftN).toBeGreaterThan(slow.telemetry.liftN);
  });

  it('control inputs produce moments', () => {
    const pitchUp = computeFlightForces(
      profile,
      standardFlightEnvironment,
      stateWithVelocity(new Vector3(0, -4, -55), {
        elevator: profile.controlSurfaces.elevatorMaxDeg,
        aileron: 0,
        rudder: 0,
      }),
      {
        ...controls,
        pitch: 1,
      },
    );
    const pitchDown = computeFlightForces(
      profile,
      standardFlightEnvironment,
      stateWithVelocity(new Vector3(0, -4, -55), {
        elevator: -profile.controlSurfaces.elevatorMaxDeg,
        aileron: 0,
        rudder: 0,
      }),
      {
        ...controls,
        pitch: -1,
      },
    );
    const rollRight = computeFlightForces(
      profile,
      standardFlightEnvironment,
      stateWithVelocity(new Vector3(0, -4, -55), {
        elevator: 0,
        aileron: profile.controlSurfaces.aileronMaxDeg,
        rudder: 0,
      }),
      {
        ...controls,
        roll: 1,
      },
    );
    const yawRight = computeFlightForces(
      profile,
      standardFlightEnvironment,
      stateWithVelocity(new Vector3(0, -4, -55), {
        elevator: 0,
        aileron: 0,
        rudder: profile.controlSurfaces.rudderMaxDeg,
      }),
      {
        ...controls,
        yaw: 1,
      },
    );

    expect(pitchUp.momentLocal.x).toBeGreaterThan(pitchDown.momentLocal.x);
    expect(rollRight.momentLocal.z).toBeLessThan(0);
    expect(yawRight.momentLocal.y).toBeLessThan(0);
  });

  it('reports derivative telemetry for the current flight condition', () => {
    const result = computeFlightForces(
      profile,
      standardFlightEnvironment,
      stateWithVelocity(new Vector3(0, -4, -55)),
      controls,
    );

    expect(result.telemetry.coefficients.cL).toBeGreaterThan(0);
    expect(result.telemetry.coefficients.cD).toBeGreaterThan(0);
    expect(Number.isFinite(result.telemetry.nondimensionalRates.pHat)).toBe(true);
    expect(result.telemetry.controlSurfaces).toEqual({
      elevator: 0,
      aileron: 0,
      rudder: 0,
    });
  });

  it('positive dihedral produces stabilizing roll feedback from bank angle', () => {
    const bankedState = stateWithVelocity(new Vector3(0, -2, -55));
    bankedState.orientation.setFromEuler(new Euler(0, 0, 0.25));
    const positiveDihedral = computeFlightForces(
      profile,
      standardFlightEnvironment,
      bankedState,
      controls,
    );
    const negativeDihedral = computeFlightForces(
      {
        ...profile,
        wing: {
          ...profile.wing,
          dihedralDeg: -profile.wing.dihedralDeg,
        },
      },
      standardFlightEnvironment,
      bankedState,
      controls,
    );

    expect(positiveDihedral.telemetry.dihedralMomentNm).toBeLessThan(0);
    expect(negativeDihedral.telemetry.dihedralMomentNm).toBeGreaterThan(0);
  });

  it('positive and negative dihedral flip sideslip roll response', () => {
    const slipState = stateWithVelocity(new Vector3(10, -2, -55));
    const positiveDihedral = computeFlightForces(
      profile,
      standardFlightEnvironment,
      slipState,
      controls,
    );
    const negativeDihedral = computeFlightForces(
      {
        ...profile,
        wing: {
          ...profile.wing,
          dihedralDeg: -profile.wing.dihedralDeg,
        },
      },
      standardFlightEnvironment,
      slipState,
      controls,
    );

    expect(Math.sign(positiveDihedral.telemetry.dihedralMomentNm)).toBe(
      -Math.sign(negativeDihedral.telemetry.dihedralMomentNm),
    );
  });
});
