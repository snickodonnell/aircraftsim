import { Html } from '@react-three/drei';
import type { AircraftControlInput, AircraftProfile, FlightTelemetry } from '../../sim/aero';

type AircraftDebugHudProps = {
  visible: boolean;
  profile: AircraftProfile;
  telemetry: FlightTelemetry;
  controls: AircraftControlInput;
  pointerLocked: boolean;
  cameraMode: 'chase' | 'farChase';
};

function fmt(value: number, digits = 0) {
  return Number.isFinite(value) ? value.toFixed(digits) : 'n/a';
}

export function AircraftDebugHud({
  visible,
  profile,
  telemetry,
  controls,
  pointerLocked,
  cameraMode,
}: AircraftDebugHudProps) {
  if (!visible) {
    return null;
  }

  return (
    <Html fullscreen>
      <div className="aircraft-hud">
        <div className="aircraft-hud__title">{profile.displayName}</div>
        <div className="aircraft-hud__grid">
          <span>Profile</span>
          <strong>{profile.id}</strong>
          <span>Speed</span>
          <strong>
            {fmt(telemetry.speedMps, 1)} m/s · {fmt(telemetry.speedMph, 0)} mph
          </strong>
          <span>Altitude</span>
          <strong>{fmt(telemetry.altitudeM, 0)} m</strong>
          <span>Vertical</span>
          <strong>{fmt(telemetry.verticalSpeedMps, 1)} m/s</strong>
          <span>Throttle</span>
          <strong>{fmt(telemetry.throttle * 100, 0)}%</strong>
          <span>AoA / Beta</span>
          <strong>
            {fmt(telemetry.angleOfAttackDeg, 1)} / {fmt(telemetry.sideSlipDeg, 1)} deg
          </strong>
          <span>Bank</span>
          <strong>{fmt(telemetry.bankAngleDeg, 1)} deg</strong>
          <span>Lift</span>
          <strong>{fmt(telemetry.liftN / 1000, 1)} kN</strong>
          <span>Drag</span>
          <strong>{fmt(telemetry.dragN / 1000, 1)} kN</strong>
          <span>Thrust</span>
          <strong>{fmt(telemetry.thrustN / 1000, 1)} kN</strong>
          <span>Dihedral</span>
          <strong>{fmt(telemetry.dihedralMomentNm / 1000, 1)} kN m</strong>
          <span>CL/CD/CY</span>
          <strong>
            {fmt(telemetry.coefficients.cL, 2)} / {fmt(telemetry.coefficients.cD, 2)} /{' '}
            {fmt(telemetry.coefficients.cY, 2)}
          </strong>
          <span>Cl/Cm/Cn</span>
          <strong>
            {fmt(telemetry.coefficients.cRoll, 2)} / {fmt(telemetry.coefficients.cM, 2)} /{' '}
            {fmt(telemetry.coefficients.cN, 2)}
          </strong>
          <span>p/q/r hat</span>
          <strong>
            {fmt(telemetry.nondimensionalRates.pHat, 2)} /{' '}
            {fmt(telemetry.nondimensionalRates.qHat, 2)} /{' '}
            {fmt(telemetry.nondimensionalRates.rHat, 2)}
          </strong>
          <span>Surf E/A/R</span>
          <strong>
            {fmt(telemetry.controlSurfaces.elevator, 1)} /{' '}
            {fmt(telemetry.controlSurfaces.aileron, 1)} /{' '}
            {fmt(telemetry.controlSurfaces.rudder, 1)} deg
          </strong>
          <span>Input P/R/Y</span>
          <strong>
            {fmt(controls.pitch, 2)} / {fmt(controls.roll, 2)} / {fmt(controls.yaw, 2)}
          </strong>
          <span>Camera</span>
          <strong>{cameraMode}</strong>
        </div>
        <div className="aircraft-hud__hint">
          Click to capture mouse · W/S throttle · mouse pitch/roll · A/D rudder · Q/E roll · R reset · H HUD · C camera
          {pointerLocked ? ' · pointer locked' : ''}
        </div>
      </div>
    </Html>
  );
}
