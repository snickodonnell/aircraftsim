# Flight Controls

The flight-test scene is tuned for playability first.

## Mouse

Click the canvas to request pointer lock. While pointer locked:

- Mouse down = pitch up, like pulling back on a yoke.
- Mouse up = pitch down.
- Mouse left = roll right.
- Mouse right = roll left.
- `Esc` releases pointer lock through the browser.

Keyboard controls still work without pointer lock.

## Keyboard

- `W` = throttle up.
- `S` = throttle down.
- `A` = rudder/yaw left.
- `D` = rudder/yaw right.
- `Q` = roll left assist.
- `E` = roll right assist.
- Arrow up/down = pitch alternate.
- Arrow left/right = roll alternate.
- `Space` = center pitch/roll/yaw inputs.
- `R` = reset aircraft to spawn.
- `H` = toggle debug HUD.
- `C` = toggle chase/far chase camera.

## Smoothing And Surface Motion

Throttle ramps instead of jumping instantly. Pitch, roll, and yaw inputs interpolate toward target values, so controls feel less twitchy than raw mouse deltas.

Control defaults live in `src/game/aircraft/aircraftBindings.ts`. Aircraft-specific control feel lives on each `AircraftProfile` as `pilotControl`, which can tune mouse sensitivity, keyboard rates, centering rates, deadzone, and axis response curves per aircraft.

The yoke has an activity-aware return-to-center loop. Mouse movement is treated as active manipulation; after a brief idle delay, pitch and roll gently drift back toward neutral. This approximates lightly self-centering controls without constantly fighting the player during active input.

After the input layer produces pitch/roll/yaw intent, the simulation moves actual elevator, aileron, and rudder surfaces toward those commands using `controlSurfaces` limits on the selected aircraft profile. The aerodynamic solver uses those surface deflections, not raw mouse movement, when computing moments.

This split is important:

- `pilotControl` changes player feel.
- `controlSurfaces` changes aircraft hardware limits.
- `stabilityDerivatives` changes the aerodynamic response.

## Control HUD

The bottom-right yoke indicator shows pitch and roll intent:

- Center = neutral controls.
- Crosshair right/left = roll right/left.
- Crosshair down = pitch up.
- Crosshair up = pitch down.
- Roll is tuned with a very small deadzone and a low-end response curve so small horizontal displacement produces an aileron response, while the aircraft profile still determines the final roll rate and damping.

This is intentionally implemented as a separate control instrument so future HUD work can add throttle, trim, flaps, gear, damage, or calibration panels without coupling those controls to the debug telemetry HUD.
