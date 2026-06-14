import { describe, expect, it } from 'vitest';
import { Vector3 } from 'three';
import { aircraftProfiles } from './aircraftProfiles';
import {
  calculateAngleOfAttack,
  calculateDragCoefficient,
  calculateLiftCoefficient,
  clamp,
  lerp,
} from './aeroMath';

const profile = aircraftProfiles.generic_trainer;

describe('aeroMath', () => {
  it('clamps values', () => {
    expect(clamp(-1, 0, 1)).toBe(0);
    expect(clamp(0.5, 0, 1)).toBe(0.5);
    expect(clamp(2, 0, 1)).toBe(1);
  });

  it('lerps values', () => {
    expect(lerp(10, 20, 0)).toBe(10);
    expect(lerp(10, 20, 0.5)).toBe(15);
    expect(lerp(10, 20, 1)).toBe(20);
  });

  it('calculates stable angle of attack', () => {
    expect(calculateAngleOfAttack(new Vector3(0, 0, -50))).toBeCloseTo(0);
    expect(calculateAngleOfAttack(new Vector3(0, -5, -50))).toBeGreaterThan(0);
    expect(Number.isFinite(calculateAngleOfAttack(new Vector3(0, 0, 0)))).toBe(true);
  });

  it('keeps coefficient curves finite and stall-friendly', () => {
    const clLow = calculateLiftCoefficient(profile.aero, 0.02);
    const clMedium = calculateLiftCoefficient(profile.aero, 0.12);
    const clStalled = calculateLiftCoefficient(profile.aero, 0.7);
    const cdLow = calculateDragCoefficient(profile.aero, clLow, 0.02, 0);
    const cdStalled = calculateDragCoefficient(profile.aero, clStalled, 0.7, 0);

    expect(clMedium).toBeGreaterThan(clLow);
    expect(Math.abs(clStalled)).toBeLessThanOrEqual(profile.aero.clMax);
    expect(cdStalled).toBeGreaterThan(cdLow);
  });
});
