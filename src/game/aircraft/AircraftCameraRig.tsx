import { useFrame, useThree } from '@react-three/fiber';
import { Matrix4, Quaternion, Vector3 } from 'three';

export type AircraftCameraConfig = {
  chaseDistance: number;
  chaseHeight: number;
  farChaseDistance: number;
  farChaseHeight: number;
  lookAheadDistance: number;
  positionLerp: number;
  rotationLerp: number;
  minAltitudeOffset: number;
};

type AircraftCameraRigProps = {
  aircraftPosition: Vector3;
  aircraftQuaternion: Quaternion;
  mode?: 'chase' | 'farChase';
  config?: Partial<AircraftCameraConfig>;
};

const defaultConfig: AircraftCameraConfig = {
  chaseDistance: 18,
  chaseHeight: 5,
  farChaseDistance: 34,
  farChaseHeight: 10,
  lookAheadDistance: 18,
  positionLerp: 5,
  rotationLerp: 7,
  minAltitudeOffset: 1.5,
};

const forward = new Vector3();
const desiredPosition = new Vector3();
const lookTarget = new Vector3();
const desiredMatrix = new Matrix4();
const desiredQuaternion = new Quaternion();

export function AircraftCameraRig({
  aircraftPosition,
  aircraftQuaternion,
  mode = 'chase',
  config,
}: AircraftCameraRigProps) {
  const { camera } = useThree();
  const settings = { ...defaultConfig, ...config };

  useFrame((_, delta) => {
    const distance = mode === 'farChase' ? settings.farChaseDistance : settings.chaseDistance;
    const height = mode === 'farChase' ? settings.farChaseHeight : settings.chaseHeight;

    forward.set(0, 0, -1).applyQuaternion(aircraftQuaternion).normalize();
    desiredPosition
      .copy(aircraftPosition)
      .addScaledVector(forward, -distance)
      .add(new Vector3(0, height, 0));
    desiredPosition.y = Math.max(desiredPosition.y, settings.minAltitudeOffset);

    lookTarget.copy(aircraftPosition).addScaledVector(forward, settings.lookAheadDistance);

    camera.position.lerp(desiredPosition, Math.min(delta * settings.positionLerp, 1));
    desiredMatrix.lookAt(camera.position, lookTarget, new Vector3(0, 1, 0));
    desiredQuaternion.setFromRotationMatrix(desiredMatrix);
    camera.quaternion.slerp(desiredQuaternion, Math.min(delta * settings.rotationLerp, 1));
  });

  return null;
}
