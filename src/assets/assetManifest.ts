export type ColliderType = 'box' | 'sphere' | 'capsule' | 'mesh' | 'none';

export type AssetId = 'tiny_test_asset';

export type AssetDefinition = {
  id: AssetId;
  name: string;
  runtimePath: `/models/optimized/${string}.glb`;
  aircraftProfileId?: string;
  meshHintNames?: string[];
  colliderType: ColliderType;
  scale: [number, number, number];
  position: [number, number, number];
  rotation: [number, number, number];
  notes: string;
};

export const assetManifest: Record<AssetId, AssetDefinition> = {
  tiny_test_asset: {
    id: 'tiny_test_asset',
    name: 'Tiny Test Asset',
    runtimePath: '/models/optimized/tiny_test_asset.glb',
    aircraftProfileId: 'generic_trainer',
    meshHintNames: ['trainer', 'generic_trainer'],
    colliderType: 'box',
    scale: [1, 1, 1],
    position: [2, 0, -2],
    rotation: [0, 0, 0],
    notes:
      'Reserved for the first reviewed Meshy dry-run/live test. Keep disabled in level data until the optimized GLB exists.',
  },
};

export function getAssetDefinition(assetId: AssetId) {
  return assetManifest[assetId];
}
