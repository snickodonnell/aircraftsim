export type ColliderType = 'box' | 'sphere' | 'capsule' | 'mesh' | 'none';

export type AssetId = 'tiny_test_asset' | 'spitfire_like';

export type AssetDefinition = {
  id: AssetId;
  name: string;
  runtimePath: `/models/optimized/${string}.glb`;
  aircraftId?: string;
  aircraftProfileId?: string;
  meshHintNames?: string[];
  referenceImagePath?: `/images/references/${string}`;
  visualOnly?: boolean;
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
  spitfire_like: {
    id: 'spitfire_like',
    name: 'Spitfire-Like Fighter',
    runtimePath: '/models/optimized/aircraft/spitfire_like/spitfire_like.glb',
    aircraftId: 'spitfire_like',
    aircraftProfileId: 'spitfire_like',
    meshHintNames: ['spitfire_like', 'spitfire', 'ww2_spitfire', 'ww2_fighter'],
    referenceImagePath: '/images/references/aircraft/spitfire_like/source.png',
    visualOnly: true,
    colliderType: 'none',
    scale: [1, 1, 1],
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    notes:
      'Meshy-generated optimized visual model. Flight physics come from aircraftProfileId, not mesh geometry.',
  },
};

export function getAssetDefinition(assetId: AssetId) {
  return assetManifest[assetId];
}

export function getAssetDefinitionForAircraftProfileId(aircraftProfileId: string) {
  return Object.values(assetManifest).find((asset) => asset.aircraftProfileId === aircraftProfileId);
}
