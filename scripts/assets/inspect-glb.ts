import { access, stat } from 'node:fs/promises';
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
    throw new Error(`GLB not found: ${filePath}`);
  }
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
  if (!input) {
    throw new Error('Usage: npm run asset:inspect -- --input public/models/optimized/name.glb');
  }

  await assertFileExists(input);
  const file = await stat(input);
  console.log(`Inspecting ${input}`);
  console.log(`File size: ${(file.size / 1024).toFixed(1)} KB`);

  const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx';
  await run(npx, ['gltf-transform', 'inspect', path.normalize(input)]);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
