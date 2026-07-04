/**
 * CLI entry for oversight bridge ingest (local test + GitHub Actions).
 *
 * Usage:
 *   tsx scripts/oversight-bridge/ingest-cli.ts --payload '<json>'
 *   tsx scripts/oversight-bridge/ingest-cli.ts --file path/to/payload.json
 *   cat payload.json | tsx scripts/oversight-bridge/ingest-cli.ts --stdin
 *
 * Exit: 0 accepted | 1 validation/safety reject | 2 duplicate | 3 rate limited
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { runIngest } from './ingest.ts';

function readPayload(args: string[]): string {
  if (args.includes('--stdin')) {
    return readFileSync(0, 'utf8');
  }
  const fileIdx = args.indexOf('--file');
  if (fileIdx >= 0 && args[fileIdx + 1]) {
    return readFileSync(args[fileIdx + 1], 'utf8');
  }
  const payloadIdx = args.indexOf('--payload');
  if (payloadIdx >= 0 && args[payloadIdx + 1]) {
    return args[payloadIdx + 1];
  }
  throw new Error('Provide --payload, --file, or --stdin');
}

function main(): number {
  const args = process.argv.slice(2);
  const baseDirIdx = args.indexOf('--base-dir');
  const baseDir = baseDirIdx >= 0 && args[baseDirIdx + 1] ? args[baseDirIdx + 1] : join(process.cwd());

  let raw: string;
  try {
    raw = readPayload(args);
  } catch (e) {
    console.error(e instanceof Error ? e.message : e);
    return 1;
  }

  const result = runIngest(raw, {
    baseDir,
    allowHighRisk: args.includes('--allow-high-risk'),
    layoutRoot: args.includes('--layout-root'),
  });

  if (result.code === 0) {
    console.log(JSON.stringify({ ok: true, findingId: result.findingId, ingestedAt: result.ingestedAt }));
    return 0;
  }

  console.error(result.reason);
  return result.code;
}

if (process.argv[1]?.includes('ingest-cli.ts')) {
  process.exit(main());
}
