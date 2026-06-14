# 04 — Environment and Secrets

This repo uses environment variables for local tools and API credentials.

## Required local env file

Create a local file:

```txt
.env
```

Do not commit `.env`.

Start from:

```txt
.env.example
```

## Required variables

```txt
MESHY_API_KEY=replace_with_your_meshy_pro_api_key
```

## Optional variables

```txt
BLENDER_PATH=C:\Program Files\Blender Foundation\Blender 4.5\blender.exe
ASSET_TEXTURE_SIZE=1024
ASSET_DECIMATE_RATIO=0.65
```

## `.gitignore` requirements

Ensure `.gitignore` contains:

```txt
.env
.env.local
.env.*.local
```

## Script behavior

Every script that uses Meshy must:

1. Load `.env` and `.env.local` if present.
2. Check for `MESHY_API_KEY`.
3. Fail with a useful message if missing.
4. Never print the key.
5. Accept CLI arguments.
6. Save outputs predictably.

## Example env loading pattern in TypeScript

```ts
import 'dotenv/config';

const apiKey = process.env.MESHY_API_KEY;
if (!apiKey) {
  throw new Error('Missing MESHY_API_KEY. Create .env from .env.example and add your Meshy Pro API key.');
}
```

## Recommended `.env.example`

See the root `.env.example` file in this scaffold.
