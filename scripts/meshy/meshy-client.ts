import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { config } from 'dotenv';

config({ path: '.env', quiet: true });
config({ path: '.env.local', override: true, quiet: true });

export type CliArgs = Record<string, string | boolean | string[]>;

export type MeshyWorkflow = 'image-to-3d' | 'multi-image-to-3d';

export type MeshyTask = {
  id: string;
  type?: string;
  status?: string;
  progress?: number;
  model_urls?: Record<string, string>;
  [key: string]: unknown;
};

export type AssetMetadata = {
  assetName: string;
  source: 'meshy';
  workflow: MeshyWorkflow;
  taskId: string;
  inputImages: string[];
  rawModelPath: string;
  cleanedModelPath: string;
  optimizedModelPath: string;
  createdAt: string;
  updatedAt: string;
  dryRun: boolean;
  notes: string[];
  task?: MeshyTask | Record<string, unknown>;
};

export function parseArgs(argv = process.argv.slice(2)): CliArgs {
  const args: CliArgs = {};
  const positionals: string[] = [];

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith('--')) {
      positionals.push(token);
      continue;
    }

    const [rawKey, inlineValue] = token.slice(2).split('=', 2);
    const next = argv[i + 1];

    if (inlineValue !== undefined) {
      args[rawKey] = inlineValue;
    } else if (next && !next.startsWith('--')) {
      args[rawKey] = next;
      i += 1;
    } else {
      args[rawKey] = true;
    }
  }

  for (const [key, value] of Object.entries(process.env)) {
    if (!key.startsWith('npm_config_') || value === undefined) {
      continue;
    }
    const argKey = key.slice('npm_config_'.length).replaceAll('_', '-');
    if (args[argKey] === undefined && !['cache', 'global', 'prefix', 'user-agent'].includes(argKey)) {
      args[argKey] = value;
    }
  }

  args._ = positionals;
  return args;
}

export function getPositionals(args: CliArgs): string[] {
  const value = args._;
  return Array.isArray(value) ? value : [];
}

export function getStringArg(args: CliArgs, key: string, fallback?: string): string {
  const value = args[key];
  if (typeof value === 'string' && value.trim()) {
    const trimmed = value.trim();
    if (!(trimmed === 'true' && fallback !== undefined)) {
      return trimmed;
    }
  }
  if (fallback !== undefined) {
    return fallback;
  }
  throw new Error(`Missing required --${key} argument.`);
}

export function getBooleanArg(args: CliArgs, key: string, fallback = false): boolean {
  const value = args[key];
  if (value === true) {
    return true;
  }
  if (typeof value === 'string') {
    return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
  }
  return fallback;
}

export function isLiveMode(args: CliArgs): boolean {
  return getBooleanArg(args, 'live', false);
}

export function getMeshyBaseUrl() {
  return process.env.MESHY_API_BASE_URL || 'https://api.meshy.ai/openapi/v1';
}

export function getAssetDirs() {
  return {
    raw: process.env.ASSET_RAW_DIR || 'public/models/raw',
    cleaned: process.env.ASSET_CLEANED_DIR || 'public/models/cleaned',
    optimized: process.env.ASSET_OPTIMIZED_DIR || 'public/models/optimized',
    references: process.env.ASSET_REFERENCE_IMAGE_DIR || 'public/images/references',
  };
}

export function requireApiKey() {
  const apiKey = process.env.MESHY_API_KEY;
  if (!apiKey) {
    throw new Error(
      'Missing MESHY_API_KEY. Add it to .env for local scripts, then rerun with --live only after review.',
    );
  }
  return apiKey;
}

export async function assertFileExists(filePath: string, label = 'File') {
  try {
    await access(filePath);
  } catch {
    throw new Error(`${label} not found: ${filePath}`);
  }
}

export async function imageFileToDataUri(filePath: string) {
  const ext = path.extname(filePath).toLowerCase();
  const mime =
    ext === '.png'
      ? 'image/png'
      : ext === '.jpg' || ext === '.jpeg'
        ? 'image/jpeg'
        : undefined;

  if (!mime) {
    throw new Error(`Unsupported image format for Meshy input: ${filePath}. Use .png, .jpg, or .jpeg.`);
  }

  const bytes = await readFile(filePath);
  return `data:${mime};base64,${bytes.toString('base64')}`;
}

export function buildMetadata(params: {
  assetName: string;
  workflow: MeshyWorkflow;
  taskId: string;
  inputImages: string[];
  dryRun: boolean;
  task?: MeshyTask | Record<string, unknown>;
  notes?: string[];
}): AssetMetadata {
  const dirs = getAssetDirs();
  const now = new Date().toISOString();

  return {
    assetName: params.assetName,
    source: 'meshy',
    workflow: params.workflow,
    taskId: params.taskId,
    inputImages: params.inputImages,
    rawModelPath: path.join(dirs.raw, `${params.assetName}.glb`).replaceAll('\\', '/'),
    cleanedModelPath: path.join(dirs.cleaned, `${params.assetName}.glb`).replaceAll('\\', '/'),
    optimizedModelPath: path.join(dirs.optimized, `${params.assetName}.glb`).replaceAll('\\', '/'),
    createdAt: now,
    updatedAt: now,
    dryRun: params.dryRun,
    notes: params.notes ?? [],
    task: params.task,
  };
}

export async function saveMetadata(metadata: AssetMetadata) {
  const dirs = getAssetDirs();
  await mkdir(dirs.raw, { recursive: true });
  const metadataPath = path.join(dirs.raw, `${metadata.assetName}.meshy.json`);
  await writeFile(metadataPath, `${JSON.stringify(metadata, null, 2)}\n`, 'utf8');
  return metadataPath;
}

export async function postMeshyTask(pathname: string, payload: Record<string, unknown>) {
  const apiKey = requireApiKey();
  const response = await fetch(`${getMeshyBaseUrl()}${pathname}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Meshy request failed (${response.status}): ${await response.text()}`);
  }

  return (await response.json()) as { result?: string };
}

export async function getMeshyTask(workflow: MeshyWorkflow, taskId: string) {
  const apiKey = requireApiKey();
  const response = await fetch(`${getMeshyBaseUrl()}/${workflow}/${taskId}`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Meshy task lookup failed (${response.status}): ${await response.text()}`);
  }

  return (await response.json()) as MeshyTask;
}

export async function downloadFile(url: string, outputPath: string) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Download failed (${response.status}): ${await response.text()}`);
  }

  await mkdir(path.dirname(outputPath), { recursive: true });
  const bytes = Buffer.from(await response.arrayBuffer());
  await writeFile(outputPath, bytes);
}

export function printDryRunHeader(scriptName: string) {
  console.log(`${scriptName} running in dry-run mode. Pass --live to call Meshy after review.`);
}
