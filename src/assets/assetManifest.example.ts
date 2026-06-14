export type AssetId = 'wooden_chest' | 'stone_wall_low';

export type AssetDefinition = {
  id: AssetId;
  path: string;
  kind: 'prop' | 'character' | 'environment' | 'item';
  scale?: number;
  collider?: 'box' | 'sphere' | 'capsule' | 'mesh' | 'none';
};

export const assetManifest: Record<AssetId, AssetDefinition> = {
  wooden_chest: {
    id: 'wooden_chest',
    path: '/models/optimized/wooden_chest.glb',
    kind: 'prop',
    scale: 1,
    collider: 'box',
  },
  stone_wall_low: {
    id: 'stone_wall_low',
    path: '/models/optimized/stone_wall_low.glb',
    kind: 'environment',
    scale: 1,
    collider: 'box',
  },
};
