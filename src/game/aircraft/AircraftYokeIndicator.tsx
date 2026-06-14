import { useAircraftHudStore } from './useAircraftHudStore';

function clampUnit(value: number) {
  return Math.max(-1, Math.min(1, value));
}

export function AircraftYokeIndicator() {
  const pitch = useAircraftHudStore((state) => state.pitch);
  const roll = useAircraftHudStore((state) => state.roll);
  const pointerLocked = useAircraftHudStore((state) => state.pointerLocked);
  const x = clampUnit(roll) * 42;
  const y = clampUnit(pitch) * 42;

  return (
    <div className="aircraft-control-panel" aria-label="Aircraft controls">
      <div className="aircraft-control-panel__label">Yoke</div>
      <div className="aircraft-yoke" aria-hidden="true">
        <div className="aircraft-yoke__axis aircraft-yoke__axis--horizontal" />
        <div className="aircraft-yoke__axis aircraft-yoke__axis--vertical" />
        <div
          className="aircraft-yoke__cursor"
          style={{
            transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
          }}
        >
          <span />
        </div>
      </div>
      <div className="aircraft-control-panel__status">
        {pointerLocked ? 'Mouse captured' : 'Click canvas'}
      </div>
    </div>
  );
}
