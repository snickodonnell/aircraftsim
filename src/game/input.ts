const pressedKeys = new Set<string>();

const watchedKeys = new Set([
  'KeyW',
  'KeyA',
  'KeyS',
  'KeyD',
  'ArrowUp',
  'ArrowLeft',
  'ArrowDown',
  'ArrowRight',
]);

export type MoveInput = {
  x: number;
  z: number;
};

export function bindKeyboardMovement() {
  const onKeyDown = (event: KeyboardEvent) => {
    if (!watchedKeys.has(event.code)) {
      return;
    }
    pressedKeys.add(event.code);
  };

  const onKeyUp = (event: KeyboardEvent) => {
    pressedKeys.delete(event.code);
  };

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);

  return () => {
    window.removeEventListener('keydown', onKeyDown);
    window.removeEventListener('keyup', onKeyUp);
    pressedKeys.clear();
  };
}

export function getMoveInput(): MoveInput {
  const x =
    (pressedKeys.has('KeyD') || pressedKeys.has('ArrowRight') ? 1 : 0) -
    (pressedKeys.has('KeyA') || pressedKeys.has('ArrowLeft') ? 1 : 0);
  const z =
    (pressedKeys.has('KeyS') || pressedKeys.has('ArrowDown') ? 1 : 0) -
    (pressedKeys.has('KeyW') || pressedKeys.has('ArrowUp') ? 1 : 0);

  if (x === 0 && z === 0) {
    return { x: 0, z: 0 };
  }

  const length = Math.hypot(x, z);
  return {
    x: x / length,
    z: z / length,
  };
}
