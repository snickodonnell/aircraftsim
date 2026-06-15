# Aerodynamics Framework

This framework separates aircraft visuals from flight behavior.

Hard rule: GLB geometry never determines aerodynamic properties. A Meshy aircraft model is a visual skin. Flight behavior comes from an `AircraftProfile` in `src/sim/aero/aircraftProfiles.ts`.

## Architecture

Pure simulation code lives in `src/sim/aero`:

- `aircraftTypes.ts` defines profiles, controls, environment, and telemetry.
- `aircraftProfiles.ts` stores game-friendly aircraft profiles.
- `atmosphere.ts` defines gravity, wind, gusts, and density by altitude.
- `aeroMath.ts` contains pure math helpers and coefficient curves.
- `aeroKinematics.ts` converts the three.js aircraft frame into body-axis flight variables.
- `controlSurfaces.ts` converts pilot commands into rate-limited elevator, aileron, and rudder deflections.
- `stabilityDerivatives.ts` builds aerodynamic coefficients from angle of attack, sideslip, body rates, and control-surface deflection.
- `flightModel.ts` dimensionalizes the coefficients into forces and moments.
- `integrator.ts` advances custom aircraft state.
- `validation.ts` checks profile sanity.

React integration lives in `src/game/aircraft`:

- `AircraftController.tsx` owns one simulated aircraft.
- `useAircraftInput.ts` converts mouse/keyboard state into pilot intent.
- `AircraftCameraRig.tsx` follows simulated aircraft state.
- `GenericTestAircraft.tsx` is a simple geometry-only visual test skin.
- `AircraftDebugHud.tsx` displays telemetry.

## Coordinate Frames

World frame:

- `+X` = right/east
- `+Y` = up
- `+Z` = scene-forward/south

Aircraft local frame:

- `+X` = right wing
- `+Y` = aircraft up
- `-Z` = nose/forward

Runtime aircraft visuals should be authored so the nose points down local `-Z`.

The derivative math uses an internal aerospace-style body frame:

- `x_body` = nose/forward
- `y_body` = right wing
- `z_body` = down

The adapter in `aeroKinematics.ts` maps from the project frame into this body frame:

- `u = -localVelocity.z`
- `v = localVelocity.x`
- `w = -localVelocity.y`
- `p = -localAngularVelocity.z`
- `q = localAngularVelocity.x`
- `r = -localAngularVelocity.y`

Moments are mapped back into the project frame as:

- pitch moment -> local `+X`
- yaw moment -> local `-Y`
- roll moment -> local `-Z`

This preserves the existing playable control convention: positive pitch command noses up, positive roll command rolls right, and positive yaw command yaws right.

## Stability-Derivative Model

The flight model now follows the usual fixed-wing coefficient buildup used in flight dynamics work:

- Longitudinal coefficients: `CL`, `CD`, and `Cm`
- Lateral-directional coefficients: `CY`, `Cl`, and `Cn`
- State variables: angle of attack `alpha`, sideslip `beta`, and nondimensional rates `pHat`, `qHat`, `rHat`
- Control variables: elevator, aileron, and rudder deflections in radians

Forces are dimensionalized with dynamic pressure:

- Lift, drag, and side force scale with `q * S`.
- Pitch moment scales with `q * S * c`.
- Roll and yaw moments scale with `q * S * b`.

Where `q` is dynamic pressure, `S` is wing area, `c` is mean chord, and `b` is wingspan.

The model is still intentionally game-friendly. It is not CFD, it does not inspect mesh geometry, and it uses a stable stall blend rather than trying to model separated flow in detail.

## Update Loop

Each frame:

1. Read smoothed controls from `useAircraftInput`.
2. Resolve the `AircraftProfile`.
3. Build the independent environment model.
4. Move actual control surfaces toward pilot commands using per-profile surface rate limits.
5. Compute air-relative kinematics and aerodynamic coefficients.
6. Compute lift, drag, side force, thrust, gravity, and moments.
7. Integrate custom aircraft state with a clamped semi-implicit Euler step.
8. Sync the visual aircraft transform from simulation state.
9. Update camera and HUD.

## Rapier Decision

The flight test scene uses a custom aircraft simulation state and does not use Rapier for aerodynamic forces. Rapier can be reintroduced later for coarse world collision, but it should not infer flight forces from mesh or collider geometry.

## Future Meshy Aircraft

Optimized GLBs from `public/models/optimized` can be attached as visual models later. The selected `aircraftProfileId` controls physics; `runtimePath` controls visuals.

When adding generated aircraft:

- Resolve the optimized GLB through the asset manifest by explicit `aircraftProfileId`.
- Keep the geometry-only aircraft visual as a fallback for profiles without a runtime asset.
- Store real-world reference sources, assumptions, confidence, and game-tuning notes in the aircraft profile metadata.
- Do not use apparent generated wingspan, silhouette, tail size, dihedral, collider shape, or triangle geometry to set aerodynamic coefficients.
- Verify the visual orientation separately: project aircraft forward is local `-Z`.

## Dihedral And Spiral Stability

Aircraft profiles include a `wing` block with `dihedralDeg`, `incidenceDeg`, `dihedralEffectiveness`, `bankStabilityEffectiveness`, and `surfaceLiftShare`.

The current model uses a game-friendly approximation of real dihedral effect:

- Positive dihedral creates a stabilizing roll coefficient contribution from sideslip.
- Positive dihedral also adds a mild bank-angle spiral-stability helper so the effect is visible and tunable in the low-fidelity browser model.
- Negative dihedral, or anhedral, flips those contributions and becomes mildly destabilizing.
- The effect scales with dynamic pressure, wing area, wingspan, and the configured wing lift share.

This is not CFD and it does not inspect mesh geometry. It is a profile-driven lift-surface approximation based on known aircraft stability principles: dihedral couples sideslip into rolling moment, usually represented by the roll stability derivative `Cl_beta`. Because this project uses a three.js-friendly local frame, the documented signs in `aircraftProfiles.ts` are the source of truth for game tuning.

The generic test aircraft renders visible upward wing dihedral so the stabilizing feedback can be tested immediately.

## Future Task List

- Add GLB visual loading to `AircraftController` while keeping `AircraftProfile` as the physics source.
- Add coarse ground collision or runway contact using simple colliders.
- Add trim controls, flaps, landing gear, and optional assisted level-flight mode.
- Add visual animation for elevator, aileron, and rudder deflections.
- Add per-profile camera defaults and input sensitivity overrides.
- Add additional profile families such as jet trainer and arcade racing plane.
- Add debug graphs for coefficient curves and force vectors.
