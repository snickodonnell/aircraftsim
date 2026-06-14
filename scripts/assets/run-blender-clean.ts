import { access } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { config } from 'dotenv';

config({ path: '.env', quiet: true });
config({ path: '.env.local', override: true, quiet: true });

function blenderExecutable() {
  return process.env.BLENDER_PATH || process.env.BLENDER_EXE || 'blender';
}

async function assertInputExists(filePath: string) {
  try {
    await access(filePath);
  } catch {
    throw new Error(`Input GLB not found: ${filePath}`);
  }
}

function run(command: string, args: string[]) {
  return new Promise<void>((resolve, reject) => {
    const child = spawn(command, args, { stdio: 'inherit', shell: false });
    child.on('error', (error) => {
      reject(
        new Error(
          `Could not start Blender at "${command}". Set BLENDER_PATH in .env if Blender is not on PATH. ${error.message}`,
        ),
      );
    });
    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Blender exited with code ${code}.`));
      }
    });
  });
}

async function main() {
  const [input, output, ...rest] = process.argv.slice(2);
  if (!input || !output) {
    throw new Error(
      'Usage: npm run asset:clean -- public/models/raw/name.glb public/models/cleaned/name.glb --asset-name name',
    );
  }

  await assertInputExists(input);
  const blenderArgs = [...rest];
  if (blenderArgs.length > 0 && !blenderArgs.some((arg) => arg === '--asset-name')) {
    const firstValue = blenderArgs[0];
    if (firstValue && !firstValue.startsWith('--')) {
      blenderArgs.splice(0, 1, '--asset-name', firstValue);
    }
  }
  const scriptPath = path.normalize('scripts/blender/clean_glb.py');
  await run(blenderExecutable(), ['-b', '--python', scriptPath, '--', input, output, ...blenderArgs]);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
