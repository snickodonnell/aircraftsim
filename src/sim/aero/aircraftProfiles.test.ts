import { describe, expect, it } from 'vitest';
import { aircraftProfiles, resolveAircraftProfile } from './aircraftProfiles';
import { validateAircraftProfile } from './validation';

describe('aircraftProfiles', () => {
  it('exports required baseline profiles', () => {
    expect(aircraftProfiles.generic_trainer).toBeDefined();
    expect(aircraftProfiles.ww2_fighter_baseline).toBeDefined();
    expect(aircraftProfiles.spitfire_like).toBeDefined();
    expect(aircraftProfiles.heavy_bomber_baseline).toBeDefined();
  });

  it('validates all profiles', () => {
    for (const profile of Object.values(aircraftProfiles)) {
      expect(validateAircraftProfile(profile).errors).toEqual([]);
    }
  });

  it('maps Spitfire hints to the Spitfire-like profile', () => {
    expect(aircraftProfiles.spitfire_like.meshHintNames).toContain('spitfire');
    expect(resolveAircraftProfile({ displayName: 'Spitfire' }).id).toBe('spitfire_like');
    expect(resolveAircraftProfile({ assetId: 'meshy_spitfire_001' }).id).toBe('spitfire_like');
  });

  it('uses explicit profile id first and falls back to trainer', () => {
    expect(
      resolveAircraftProfile({
        aircraftProfileId: 'heavy_bomber_baseline',
        displayName: 'Spitfire',
      }).id,
    ).toBe('heavy_bomber_baseline');
    expect(resolveAircraftProfile({ displayName: 'unknown_aircraft' }).id).toBe('generic_trainer');
  });
});
