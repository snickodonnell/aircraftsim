import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { CapsuleCollider, RigidBody, type RapierRigidBody } from '@react-three/rapier';
import { bindKeyboardMovement, getMoveInput } from './input';
import { PLAYER_HEIGHT, PLAYER_RADIUS, PLAYER_SPEED } from './physics';
import { useGameStore } from './useGameStore';

type PlayerProps = {
  spawn: [number, number, number];
};

export function Player({ spawn }: PlayerProps) {
  const bodyRef = useRef<RapierRigidBody>(null);
  const setPlayerPosition = useGameStore((state) => state.setPlayerPosition);

  useEffect(() => bindKeyboardMovement(), []);

  useFrame(() => {
    const body = bodyRef.current;
    if (!body) {
      return;
    }

    const input = getMoveInput();
    const velocity = body.linvel();
    body.setLinvel(
      {
        x: input.x * PLAYER_SPEED,
        y: velocity.y,
        z: input.z * PLAYER_SPEED,
      },
      true,
    );

    const translation = body.translation();
    setPlayerPosition([translation.x, translation.y, translation.z]);
  });

  return (
    <RigidBody
      ref={bodyRef}
      colliders={false}
      enabledRotations={[false, false, false]}
      position={spawn}
      mass={1}
      name="player"
    >
      <CapsuleCollider args={[PLAYER_HEIGHT / 2, PLAYER_RADIUS]} />
      <mesh castShadow position={[0, PLAYER_HEIGHT / 2, 0]}>
        <capsuleGeometry args={[PLAYER_RADIUS, PLAYER_HEIGHT, 8, 16]} />
        <meshStandardMaterial color="#7dd3fc" roughness={0.6} metalness={0.05} />
      </mesh>
    </RigidBody>
  );
}
