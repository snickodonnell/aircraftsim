import { describe, expect, it } from 'vitest';
import { airDensityAtAltitude, effectiveWindVelocity, standardFlightEnvironment } from './atmosphere';

describe('atmosphere', () => {
  it('reduces density with altitude', () => {
    const seaLevel = airDensityAtAltitude(0);
    const mid = airDensityAtAltitude(5000);
    const high = airDensityAtAltitude(10000);

    expect(seaLevel).toBeCloseTo(1.225);
    expect(mid).toBeLessThan(seaLevel);
    expect(high).toBeLessThan(mid);
  });

  it('keeps negative altitude stable', () => {
    expect(airDensityAtAltitude(-100)).toBeCloseTo(airDensityAtAltitude(0));
  });

  it('defaults to no wind', () => {
    expect(effectiveWindVelocity(standardFlightEnvironment)).toEqual([0, 0, 0]);
  });
});
