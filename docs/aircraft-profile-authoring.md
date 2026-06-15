# Aircraft Profile Authoring

Add aircraft behavior in `src/sim/aero/aircraftProfiles.ts`. Profiles are game tuning data, not certified historical aircraft data.

## Required Shape

Each `AircraftProfile` includes:

- `id`, `displayName`, `category`
- `meshHintNames` for optional visual-name matching
- optional `metadata` for profile mode, source URLs, assumptions, confidence, reference values, and game-tuning notes
- `massKg`, `wingAreaM2`, `wingspanM`, `meanChordM`, `referenceLengthM`
- `inertiaTensorApprox` as `[ixx, iyy, izz]`
- `engine`
- `aero`
- `stabilityDerivatives`
- `controlSurfaces`
- `liftingSurfaces`
- `control`
- `pilotControl`
- `wing`
- `limits`
- `spawn`
- `visual`
- `tuningNotes`

## Profile Metadata

Use `metadata` for every real, inspired-by, or generic aircraft profile that is intended for gameplay:

- `profileMode`: `real_aircraft`, `inspired_by_real_aircraft`, or `generic_class`
- `sourceConfidence`: `high`, `medium`, or `low`
- `referenceAircraft`: real aircraft used as references, when applicable
- `referenceValues`: researched or assumed values used to set the game profile
- `sources`: labels, URLs, fields used, confidence, and notes
- `assumptions`: decisions that are not directly sourced
- `gameTuningNotes`: why values were adjusted for playability
- `notHistoricallyExact`: `true` for inspired-by and game-tuned profiles

Do not silently present a game-tuned profile as historical truth. If values are based on reference ranges, say so in metadata.

## Baseline Aero Fields

- `cl0`: baseline lift at zero angle of attack. Typical game range: `0` to `0.5`.
- `clAlpha`: lift slope. Typical range: `3` to `7`.
- `clMax`: max lift before stall blend. Typical range: `1.0` to `1.8`.
- `cd0`: baseline drag. Typical range: `0.02` to `0.08`.
- `inducedDragK`: drag added by lift. Typical range: `0.03` to `0.12`.
- `cmAlpha`: pitch stability. Negative values tend to self-correct.
- `stallAngleDeg`: where stall blending begins. Typical range: `12` to `18`.
- `postStallLiftFactor`: retained lift after stall. Higher is easier.

These fields are still present for stall and drag shaping, but the live force model primarily uses `stabilityDerivatives`.

## Stability Derivatives

`stabilityDerivatives` is the main physics tuning block. It is intentionally data-driven and independent of GLB geometry.

Longitudinal derivatives:

- `cL0`, `cLAlpha`, `cLQ`, `cLElevator`: lift buildup from angle of attack, pitch rate, and elevator.
- `cD0`, `cDAlpha`, `cDBeta`, `cDControl`: drag buildup from baseline drag, angle of attack, sideslip, and deflected controls.
- `cM0`, `cMAlpha`, `cMQ`, `cMElevator`: pitch moment from trim, static pitch stability, pitch-rate damping, and elevator.

Lateral-directional derivatives:

- `cYBeta`, `cYP`, `cYR`, `cYAileron`, `cYRudder`: side force from sideslip, rates, and controls.
- `cRollBeta`, `cRollP`, `cRollR`, `cRollAileron`, `cRollRudder`: roll moment coefficient.
- `cNBeta`, `cNP`, `cNR`, `cNAileron`, `cNRudder`: yaw moment coefficient.

Sign conventions in this project:

- `cLAlpha` should be positive.
- `cMAlpha` should be negative for stable pitch behavior.
- `cMQ`, `cRollP`, and `cNR` should be negative for rate damping.
- Positive `cRollAileron` makes positive roll input roll right.
- Positive `cNRudder` makes positive yaw input yaw right.
- Positive `cNBeta` gives weathercock stability in the project frame.

Control derivatives are applied to actual surface deflection in radians. For example, a trainer with `aileronMaxDeg: 13` and `cRollAileron: 0.2` produces about `0.045` roll coefficient at full aileron before stall/control fade.

## Control Surfaces

`controlSurfaces` describes the aircraft hardware:

- `elevatorMaxDeg`, `aileronMaxDeg`, `rudderMaxDeg`: maximum deflection.
- `elevatorRateDegPerSec`, `aileronRateDegPerSec`, `rudderRateDegPerSec`: how fast surfaces move toward the pilot command.

The yoke or keyboard only commands intent. The simulator moves the real control surfaces toward that intent, then the derivative model uses the resulting surface deflections. This lets a heavy bomber have slow controls and a fighter have quick controls without rewriting the input system.

`liftingSurfaces` stores tail and stabilizer scale data for future extensions. The current solver validates it but does not yet build separate wing/tail lift elements from it.

## Wing Geometry And Dihedral

The `wing` block controls simplified lift-surface stability:

- `dihedralDeg`: wing angle in degrees. Positive angles raise the wingtips and stabilize roll. Negative angles are anhedral and slightly destabilize roll.
- `incidenceDeg`: reserved wing mounting angle for future lift-surface refinements.
- `dihedralEffectiveness`: how strongly sideslip creates roll moment through dihedral.
- `bankStabilityEffectiveness`: game-friendly bank feedback used to make dihedral stability visible and controllable.
- `surfaceLiftShare`: fraction of lift treated as wing-surface lift for stability calculations.

Starting ranges:

- Trainers: `3` to `6` degrees positive dihedral.
- Fighters: `0` to `5` degrees.
- Heavy stable aircraft: `4` to `8` degrees.
- Agile or intentionally unstable aircraft: small positive, zero, or mildly negative values.

Use negative dihedral carefully. It should make aircraft feel more responsive or unstable, not uncontrollable.

## Tuning Recipes

Easier trainer:

- Strong pitch/roll/yaw damping.
- Moderate max thrust.
- Higher `postStallLiftFactor`.
- Lower control derivatives or smaller surface limits.
- Larger positive dihedral and mild bank stability.

Fighter-like:

- Higher thrust and max speed.
- Stronger aileron/elevator derivatives.
- Faster control-surface rates.
- Lower inertia.
- Sharper stall if desired.

Bomber-like:

- High mass and inertia.
- Slower throttle response.
- Lower control derivatives and slower surface rates relative to mass.
- Strong damping.

## Pilot Control Feel

`pilotControl` controls how player input maps to aircraft control intent before aerodynamic control powers are applied.

- `mousePitchSensitivity` and `mouseRollSensitivity`: yoke displacement per mouse pixel.
- `keyboardPitchRate`, `keyboardRollRate`, `keyboardYawRate`: how quickly keyboard input reaches full deflection.
- `pitchCenteringRate`, `rollCenteringRate`, `yawCenteringRate`: how quickly controls drift back to neutral when not held. Mouse yoke axes should usually center slowly enough to feel controllable, but not so slowly that they feel stuck.
- `yokeReturnDelaySeconds`: how long after mouse movement stops before pitch/roll self-centering begins.
- `yokeReturnRampSeconds`: how gradually the self-centering force fades in.
- `mouseActivityThreshold`: per-frame mouse motion threshold used to decide whether the pilot is actively manipulating the yoke.
- `axisDeadzone`: neutral zone around center.
- `rollDeadzone` and `yawDeadzone`: per-axis overrides. Roll should stay tiny so yoke x-axis movement has early effect.
- `pitchCurve`, `rollCurve`, `yawCurve`: response shaping. `1` is linear; values above `1` are softer near center and stronger near the edge. Roll generally wants to stay close to linear so small yoke displacement has a visible effect.
- `rollCurve` can be below `1` for aircraft that need more low-end roll authority in a browser control scheme.

The aerodynamic derivative and `controlSurfaces` blocks determine actual elevator, aileron, and rudder effectiveness. `pilotControl` only determines how the player reaches those commanded deflections.

Spitfire-like:

- Use `spitfire_like` as a starting point.
- Add Meshy hints such as `spitfire`, `ww2_spitfire`, or `spitfire_mk_i`.
- Tune for feel; do not claim historical perfection unless real data and validation are added later.
- Store source URLs and assumptions in `metadata.sources`, `metadata.referenceValues`, and `metadata.assumptions`.
- Use real-world dimensions and performance as reference ranges, but keep thrust, damping, stall blend, and control response game-tuned.

Run profile tests after edits:

```bash
npm test
```
