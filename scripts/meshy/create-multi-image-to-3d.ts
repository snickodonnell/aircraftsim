import {
  assertFileExists,
  buildMetadata,
  getBooleanArg,
  getPositionals,
  getStringArg,
  imageFileToDataUri,
  isLiveMode,
  parseArgs,
  postMeshyTask,
  printDryRunHeader,
  saveMetadata,
} from './meshy-client';

async function main() {
  const args = parseArgs();
  const positionals = getPositionals(args);
  const assetName = getStringArg(args, 'name', positionals[0]);
  const imagePaths = getStringArg(args, 'images', positionals[1])
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
  const live = isLiveMode(args);

  if (imagePaths.length < 1 || imagePaths.length > 4) {
    throw new Error('Meshy multi-image workflow expects between 1 and 4 images.');
  }

  await Promise.all(imagePaths.map((imagePath) => assertFileExists(imagePath, 'Reference image')));

  const payload = {
    image_urls: live
      ? await Promise.all(imagePaths.map((imagePath) => imageFileToDataUri(imagePath)))
      : imagePaths.map(() => '<dry-run-local-image-data-uri>'),
    model_type: getStringArg(args, 'model-type', 'lowpoly'),
    should_texture: getBooleanArg(args, 'should-texture', true),
    enable_pbr: getBooleanArg(args, 'enable-pbr', false),
    target_formats: ['glb'],
    moderation: getBooleanArg(args, 'moderation', false),
  };

  if (!live) {
    printDryRunHeader('meshy:multi-image-to-3d');
  }

  const response = live
    ? await postMeshyTask('/multi-image-to-3d', payload)
    : { result: `dry-run-${assetName}-${Date.now()}` };

  if (!response.result) {
    throw new Error('Meshy did not return a task id in response.result.');
  }

  const metadataPath = await saveMetadata(
    buildMetadata({
      assetName,
      workflow: 'multi-image-to-3d',
      taskId: response.result,
      inputImages: imagePaths,
      dryRun: !live,
      task: { request: payload },
      notes: live
        ? ['Live Meshy multi-image task created. Poll before downloading the raw GLB.']
        : ['Dry-run only. No Meshy API call was made and no credits were spent.'],
    }),
  );

  console.log(`Asset: ${assetName}`);
  console.log(`Workflow: multi-image-to-3d`);
  console.log(`Task id: ${response.result}`);
  console.log(`Metadata: ${metadataPath}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
