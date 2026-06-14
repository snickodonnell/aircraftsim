import { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import {
  CuboidCollider,
  RigidBody,
  type CuboidColliderProps,
} from '@react-three/rapier';
import { Euler } from 'three';
import { getAssetDefinition, type AssetId } from '../assets/assetManifest';
import level01 from '../levels/level01.json';
import { CameraRig } from './CameraRig';
import { Lighting } from './Lighting';
import { Player } from './Player';
import { GROUND_SIZE } from './physics';

type Vec3 = [number, number, number];

type LevelObstacle = {
  id: string;
  position: Vec3;
  scale: Vec3;
};

type RuntimeAssetPlacement = {
  assetId: AssetId;
  enabled: boolean;
  position: Vec3;
  rotation: Vec3;
  scale: Vec3;
};

type LevelData = {
  id: string;
  name: string;
  spawn: Vec3;
  obstacles: LevelObstacle[];
  runtimeAssets: RuntimeAssetPlacement[];
};

function Ground() {
  const [width, height, depth] = GROUND_SIZE;

  return (
    <RigidBody type="fixed" colliders={false} name="ground">
      <CuboidCollider args={[width / 2, height / 2, depth / 2]} position={[0, -height / 2, 0]} />
      <mesh receiveShadow position={[0, -height, 0]}>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color="#334155" roughness={0.9} />
      </mesh>
    </RigidBody>
  );
}

function StaticObstacle({ obstacle }: { obstacle: LevelObstacle }) {
  const colliderArgs = obstacle.scale.map((value) => value / 2) as CuboidColliderProps['args'];

  return (
    <RigidBody type="fixed" colliders={false} name={obstacle.id}>
      <CuboidCollider args={colliderArgs} position={obstacle.position} />
      <mesh castShadow receiveShadow position={obstacle.position}>
        <boxGeometry args={obstacle.scale} />
        <meshStandardMaterial color="#94a3b8" roughness={0.75} />
      </mesh>
    </RigidBody>
  );
}

function RuntimeAsset({ placement }: { placement: RuntimeAssetPlacement }) {
  const asset = getAssetDefinition(placement.assetId);
  const gltf = useGLTF(asset.runtimePath);
  const rotation = useMemo(
    () => new Euler(placement.rotation[0], placement.rotation[1], placement.rotation[2]),
    [placement.rotation],
  );

  return (
    <RigidBody type="fixed" colliders={false} name={asset.id}>
      <primitive
        object={gltf.scene}
        position={placement.position}
        rotation={rotation}
        scale={placement.scale}
      />
      {asset.colliderType === 'box' ? (
        <CuboidCollider args={[0.5, 0.5, 0.5]} position={placement.position} />
      ) : null}
    </RigidBody>
  );
}

export function Scene() {
  const level = level01 as LevelData;
  const enabledAssets = level.runtimeAssets.filter((asset) => asset.enabled);

  return (
    <>
      <color attach="background" args={['#111827']} />
      <fog attach="fog" args={['#111827', 18, 32]} />
      <Lighting />
      <Ground />
      {level.obstacles.map((obstacle) => (
        <StaticObstacle key={obstacle.id} obstacle={obstacle} />
      ))}
      {enabledAssets.map((placement) => (
        <RuntimeAsset key={placement.assetId} placement={placement} />
      ))}
      <Player spawn={level.spawn} />
      <CameraRig />
    </>
  );
}
