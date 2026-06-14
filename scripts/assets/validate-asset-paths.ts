import { access } from 'node:fs/promises';
import path from 'node:path';
import { assetManifest } from '../../src/assets/assetManifest';

function allowMissing() {
  return (
    process.argv.includes('--allow-missing') ||
    process.env.npm_config_allow_missing === 'true' ||
    process.env.npm_config_allow_missing === '1'
  );
}

async function exists(filePath: string) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const missing: string[] = [];
  const warnings: string[] = [];

  for (const asset of Object.values(assetManifest)) {
    if (!asset.runtimePath.startsWith('/models/optimized/')) {
      warnings.push(`${asset.id} points outside /models/optimized/: ${asset.runtimePath}`);
    }
    if (asset.runtimePath.includes('/raw/') || asset.runtimePath.includes('/cleaned/')) {
      warnings.push(`${asset.id} points at a pipeline artifact instead of an optimized runtime GLB.`);
    }

    const publicPath = path.join('public', asset.runtimePath.replace(/^\//, ''));
    if (!(await exists(publicPath))) {
      missing.push(`${asset.id}: ${publicPath}`);
    }
  }

  for (const warning of warnings) {
    console.warn(`Warning: ${warning}`);
  }

  if (missing.length > 0 && !allowMissing()) {
    throw new Error(`Missing runtime GLB files:\n${missing.join('\n')}\nUse --allow-missing during scaffold-only setup.`);
  }

  if (missing.length > 0) {
    console.warn(`Missing assets allowed for scaffold setup:\n${missing.join('\n')}`);
  }

  console.log(`Validated ${Object.keys(assetManifest).length} manifest asset(s).`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
