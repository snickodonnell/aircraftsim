import {
  getMeshyTask,
  getPositionals,
  getStringArg,
  isLiveMode,
  parseArgs,
  printDryRunHeader,
  type MeshyWorkflow,
} from './meshy-client';

function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function parseWorkflow(value: string): MeshyWorkflow {
  if (value === 'image-to-3d' || value === 'multi-image-to-3d') {
    return value;
  }
  throw new Error('--type must be image-to-3d or multi-image-to-3d.');
}

async function main() {
  const args = parseArgs();
  const positionals = getPositionals(args);
  const taskId = getStringArg(args, 'task-id', positionals[0]);
  const workflow = parseWorkflow(getStringArg(args, 'type', positionals[1] ?? 'image-to-3d'));
  const live = isLiveMode(args);
  const maxAttempts = Number(getStringArg(args, 'max-attempts', '20'));
  const intervalSeconds = Number(getStringArg(args, 'interval-seconds', '10'));

  if (!live) {
    printDryRunHeader('meshy:poll');
    console.log(`Would poll ${workflow} task ${taskId} up to ${maxAttempts} times.`);
    return;
  }

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const task = await getMeshyTask(workflow, taskId);
    console.log(
      `Attempt ${attempt}/${maxAttempts}: status=${task.status ?? 'UNKNOWN'} progress=${task.progress ?? 'n/a'}`,
    );

    if (task.status === 'SUCCEEDED') {
      console.log('Meshy task succeeded.');
      console.log(JSON.stringify({ id: task.id, model_urls: task.model_urls }, null, 2));
      return;
    }

    if (task.status === 'FAILED' || task.status === 'CANCELED') {
      throw new Error(`Meshy task ended with status ${task.status}.`);
    }

    if (attempt < maxAttempts) {
      await sleep(intervalSeconds * 1000);
    }
  }

  throw new Error(`Timed out waiting for Meshy task ${taskId}.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
