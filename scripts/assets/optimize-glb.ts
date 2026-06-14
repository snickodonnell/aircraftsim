import { access, mkdir, stat } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import path from 'node:path';

function parseArgs(argv = process.argv.slice(2)) {
  const args = new Map<string, string | boolean>();
  const positionals: string[] = [];
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith('--')) {
      positionals.push(token);
      continue;
    }
    const key = token.slice(2);
    const next = argv[i + 1];
    if (next && !next.startsWith('--')) {
      args.set(key, next);
      i += 1;
    } else {
      args.set(key, true);
    }
  }
  for (const [key, value] of Object.entries(process.env)) {
    if (key.startsWith('npm_config_') && value !== undefined) {
      args.set(key.slice('npm_config_'.length).replaceAll('_', '-'), value);
    }
  }
  args.set('_', positionals.join('\n'));
  return args;
}

async function assertFileExists(filePath: string) {
  try {
    await access(filePath);
  } catch {
    throw new Error(`Input GLB not found: ${filePath}`);
  }
}

function booleanArg(value: string | boolean | undefined) {
  return value === true || value === 'true' || value === '1';
}

function run(command: string, args: string[]) {
  return new Promise<void>((resolve, reject) => {
    const child = spawn(command, args, { stdio: 'inherit', shell: false });
    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${command} exited with code ${code}.`));
      }
    });
  });
}

async function main() {
  const args = parseArgs();
  const positionals = String(args.get('_') ?? '').split('\n').filter(Boolean);
  const input = String(args.get('input') ?? positionals[0] ?? '');
  const output = String(args.get('output') ?? positionals[1] ?? '');
  const textureSize = String(args.get('texture-size') ?? positionals[2] ?? process.env.ASSET_TEXTURE_SIZE ?? '1024');
  const compressTextures = booleanArg(args.get('compress-textures'));
  const inspect = booleanArg(args.get('inspect'));

  if (!input || !output) {
    throw new Error(
      'Usage: npm run asset:optimize -- --input public/models/cleaned/name.glb --output public/models/optimized/name.glb --texture-size 1024',
    );
  }

  if (!output.replaceAll('\\', '/').startsWith('public/models/optimized/')) {
    throw new Error('Optimized runtime GLBs must be written under public/models/optimized/.');
  }

  await assertFileExists(input);
  await mkdir(path.dirname(output), { recursive: true });

  const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx';
  const optimizeArgs = [
    'gltf-transform',
    'optimize',
    path.normalize(input),
    path.normalize(output),
    '--texture-size',
    textureSize,
  ];

  if (compressTextures) {
    optimizeArgs.push('--texture-compress', 'webp');
  }

  await run(npx, optimizeArgs);

  const file = await stat(output);
  console.log(`Optimized GLB written to ${output}`);
  console.log(`Output size: ${(file.size / 1024).toFixed(1)} KB`);

  if (inspect) {
    await run(npx, ['gltf-transform', 'inspect', path.normalize(output)]);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
