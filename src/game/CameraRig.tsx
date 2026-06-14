import { useFrame, useThree } from '@react-three/fiber';
import { Vector3 } from 'three';
import { useGameStore } from './useGameStore';

const desiredCameraPosition = new Vector3();
const target = new Vector3();

export function CameraRig() {
  const { camera } = useThree();
  const playerPosition = useGameStore((state) => state.playerPosition);

  useFrame((_, delta) => {
    target.set(playerPosition[0], playerPosition[1] + 0.5, playerPosition[2]);
    desiredCameraPosition.set(
      playerPosition[0],
      playerPosition[1] + 5,
      playerPosition[2] + 7,
    );

    camera.position.lerp(desiredCameraPosition, Math.min(delta * 4, 1));
    camera.lookAt(target);
  });

  return null;
}
