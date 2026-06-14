import path from 'node:path';
import {
  buildMetadata,
  downloadFile,
  getAssetDirs,
  getMeshyTask,
  getPositionals,
  getStringArg,
  isLiveMode,
  parseArgs,
  printDryRunHeader,
  saveMetadata,
  type MeshyWorkflow,
} from './meshy-client';

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
  const assetName = getStringArg(args, 'name', positionals[1]);
  const workflow = parseWorkflow(getStringArg(args, 'type', positionals[2] ?? 'image-to-3d'));
  const live = isLiveMode(args);
  const outputPath = path.join(getAssetDirs().raw, `${assetName}.glb`);

  if (!live) {
    printDryRunHeader('meshy:download');
    const metadataPath = await saveMetadata(
      buildMetadata({
        assetName,
        workflow,
        taskId,
        inputImages: [],
        dryRun: true,
        task: { status: 'DRY_RUN_DOWNLOAD' },
        notes: [`Would download model_urls.glb to ${outputPath}. No Meshy API call was made.`],
      }),
    );
    console.log(`Would save raw GLB to: ${outputPath}`);
    console.log(`Metadata: ${metadataPath}`);
    return;
  }

  const task = await getMeshyTask(workflow, taskId);
  if (task.status !== 'SUCCEEDED') {
    throw new Error(`Task ${taskId} is not ready. Current status: ${task.status ?? 'UNKNOWN'}.`);
  }

  const glbUrl = task.model_urls?.glb;
  if (!glbUrl) {
    throw new Error('Meshy task succeeded but did not include model_urls.glb.');
  }

  await downloadFile(glbUrl, outputPath);
  const metadataPath = await saveMetadata(
    buildMetadata({
      assetName,
      workflow,
      taskId,
      inputImages: [],
      dryRun: false,
      task,
      notes: ['Raw GLB downloaded. Run Blender cleanup before using this asset in game.'],
    }),
  );

  console.log(`Downloaded raw GLB: ${outputPath}`);
  console.log(`Metadata: ${metadataPath}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
