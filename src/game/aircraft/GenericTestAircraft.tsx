import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { DoubleSide, Quaternion, Vector3, type Group } from 'three';

type GenericTestAircraftProps = {
  position: Vector3;
  quaternion: Quaternion;
  throttle?: number;
  dihedralDeg?: number;
};

export function GenericTestAircraft({
  position,
  quaternion,
  throttle = 0,
  dihedralDeg = 0,
}: GenericTestAircraftProps) {
  const groupRef = useRef<Group>(null);
  const propRef = useRef<Group>(null);
  const dihedralRad = (dihedralDeg * Math.PI) / 180;

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.position.copy(position);
      groupRef.current.quaternion.copy(quaternion);
    }
    if (propRef.current) {
      propRef.current.rotation.z += delta * (18 + throttle * 52);
    }
  });

  return (
    <group ref={groupRef}>
      <mesh castShadow>
        <boxGeometry args={[0.55, 0.55, 4.2]} />
        <meshStandardMaterial color="#e5e7eb" roughness={0.55} />
      </mesh>
      <mesh castShadow position={[0, 0, -2.35]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.38, 0.9, 24]} />
        <meshStandardMaterial color="#ef4444" roughness={0.45} />
      </mesh>
      <mesh castShadow receiveShadow position={[1.8, 0.02, -0.3]} rotation={[0, 0, dihedralRad]}>
        <boxGeometry args={[3.6, 0.12, 1.05]} />
        <meshStandardMaterial color="#38bdf8" roughness={0.48} />
      </mesh>
      <mesh castShadow receiveShadow position={[-1.8, 0.02, -0.3]} rotation={[0, 0, -dihedralRad]}>
        <boxGeometry args={[3.6, 0.12, 1.05]} />
        <meshStandardMaterial color="#38bdf8" roughness={0.48} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0.02, 1.75]}>
        <boxGeometry args={[2.4, 0.1, 0.72]} />
        <meshStandardMaterial color="#60a5fa" roughness={0.48} />
      </mesh>
      <mesh castShadow position={[0, 0.55, 1.65]}>
        <boxGeometry args={[0.12, 1.15, 0.85]} />
        <meshStandardMaterial color="#2563eb" roughness={0.48} />
      </mesh>
      <group ref={propRef} position={[0, 0, -2.88]}>
        <mesh>
          <boxGeometry args={[0.12, 2.0, 0.035]} />
          <meshStandardMaterial color="#111827" roughness={0.35} />
        </mesh>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <boxGeometry args={[0.12, 2.0, 0.035]} />
          <meshStandardMaterial color="#111827" roughness={0.35} />
        </mesh>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <circleGeometry args={[1.08, 32]} />
          <meshStandardMaterial color="#f8fafc" transparent opacity={0.12} side={DoubleSide} />
        </mesh>
      </group>
      <mesh position={[0, -0.38, -0.25]}>
        <boxGeometry args={[0.18, 0.5, 0.18]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>
    </group>
  );
}
