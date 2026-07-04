/**
 * Sanitize AI oversight files before push to the public oversight repository.
 *
 * Usage:
 *   tsx --tsconfig tsconfig.app.json scripts/oversight-sanitize.ts --stage <dir> [--force]
 *   tsx --tsconfig tsconfig.app.json scripts/oversight-sanitize.ts --selftest
 *
 * Exit codes: 0 = safe, 1 = high-risk (use --force), 2 = error
 */

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

export const REDACT = '[REDACTED]';

export const ALLOWLIST = [
  'AI_OVERSIGHT_STATE.json',
  'AI_OVERSIGHT_REQUEST.md',
  'AI_OVERSIGHT_RESPONSE.md',
  'AI_OVERSIGHT_PROTOCOL.md',
  'OVERSIGHT_PACKET.md',
] as const;

export const PUSH_ALLOWLIST = [
  'AI_OVERSIGHT_STATE.json',
  'AI_OVERSIGHT_REQUEST.md',
  'AI_OVERSIGHT_PROTOCOL.md',
  'OVERSIGHT_PACKET.md',
] as const;

const SENSITIVE_PATH =
  /(?:\.env|secret|credential|password|token|private|customer|personal|drawing|supabase.*key|\.pem|dump|backup)/i;

type ScrubRule = { name: string; pattern: RegExp; replacement: string };

export const SCRUB_RULES: ScrubRule[] = [
  { name: 'bearer', pattern: /Bearer\s+[A-Za-z0-9\-._~+/]+=*/gi, replacement: REDACT },
  {
    name: 'api-key',
    pattern: /\b(?:api[_-]?key|apikey)\s*[:=]\s*['"]?[A-Za-z0-9\-_]{8,}/gi,
    replacement: REDACT,
  },
  {
    name: 'token-assignment',
    pattern: /\b(?:token|secret)\s*[=:]\s*['"]?[A-Za-z0-9\-_]{8,}/gi,
    replacement: REDACT,
  },
  { name: 'sk-prefix', pattern: /\bsk-(?:live|test)?-?[A-Za-z0-9]{8,}/g, replacement: REDACT },
  { name: 'pk-prefix', pattern: /\bpk_(?:live|test)_[A-Za-z0-9]{12,}/g, replacement: REDACT },
  {
    name: 'supabase-service-key',
    pattern: /\beyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\b/g,
    replacement: REDACT,
  },
  {
    name: 'supabase-url-key',
    pattern: /https?:\/\/[a-z0-9-]+\.supabase\.co[^\s'"<>]*/gi,
    replacement: REDACT,
  },
  {
    name: 'connection-string',
    pattern: /(?:postgres(?:ql)?|mysql|mongodb(?:\+srv)?|redis):\/\/[^\s'"<>]+/gi,
    replacement: REDACT,
  },
  {
    name: 'password',
    pattern: /password\s*[=:]\s*['"]?[^\s'"]{4,}/gi,
    replacement: `password=${REDACT}`,
  },
  {
    name: 'email',
    pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g,
    replacement: REDACT,
  },
  {
    name: 'phone',
    pattern: /(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}\b/g,
    replacement: REDACT,
  },
  {
    name: 'currency-nzd',
    pattern: /\bNZD\s*\$?\s*[\d,]+(?:\.\d{2})?\b/gi,
    replacement: REDACT,
  },
  {
    name: 'currency-usd',
    pattern: /\$\s*[\d,]+(?:\.\d{2})?\b/g,
    replacement: REDACT,
  },
  {
    name: 'commercial-figure',
    pattern: /\b(?:contract|awarded|claim|variation|forecast|margin|revenue|cost)\s*(?:value|amount|total)?\s*[:=]?\s*\$?\s*[\d,]+(?:\.\d{2})?\b/gi,
    replacement: REDACT,
  },
  {
    name: 'internal-host',
    pattern:
      /\b(?:localhost|127\.0\.0\.1|admin247|192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(?:1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3})(?::\d+)?\b/gi,
    replacement: REDACT,
  },
  {
    name: 'env-file',
    pattern: /\.env(?:\.[A-Za-z0-9_-]+)?\b/g,
    replacement: REDACT,
  },
  {
    name: 'internal-url',
    pattern: /https?:\/\/(?:localhost|127\.0\.0\.1|admin247|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+)[^\s'"<>]*/gi,
    replacement: REDACT,
  },
];

export const HIGH_RISK_PATTERNS: Array<{ name: string; pattern: RegExp }> = [
  { name: 'bearer', pattern: /Bearer\s+[A-Za-z0-9\-._~+/]{8,}/i },
  { name: 'sk-prefix', pattern: /\bsk-(?:live|test)?-?[A-Za-z0-9]{8,}/ },
  { name: 'pk-prefix', pattern: /\bpk_(?:live|test)_[A-Za-z0-9]{12,}/ },
  { name: 'jwt', pattern: /eyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/ },
  { name: 'password', pattern: /password\s*[=:]\s*['"]?[^\s'"]{4,}/i },
  {
    name: 'connection-string',
    pattern: /(?:postgres(?:ql)?|mysql|mongodb(?:\+srv)?):\/\/[^\s'"<>]+/i,
  },
  { name: 'supabase-key', pattern: /supabase\.co.*(?:key|token|secret)=/i },
  { name: 'email', pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/ },
];

export function scrubText(input: string): string {
  let out = input;
  for (const rule of SCRUB_RULES) {
    out = out.replace(rule.pattern, rule.replacement);
  }
  return out;
}

export function detectHighRisk(input: string): string[] {
  const hits: string[] = [];
  for (const rule of HIGH_RISK_PATTERNS) {
    if (rule.pattern.test(input)) hits.push(rule.name);
    rule.pattern.lastIndex = 0;
  }
  return hits;
}

function redactSensitivePath(path: string): string {
  return SENSITIVE_PATH.test(path) ? '[REDACTED-path]' : path;
}

function sanitizeJsonValue(value: unknown): unknown {
  if (typeof value === 'string') return scrubText(value);
  if (Array.isArray(value)) return value.map(sanitizeJsonValue);
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) out[k] = sanitizeJsonValue(v);
    return out;
  }
  return value;
}

export function sanitizeStateJson(raw: string): string {
  const parsed = JSON.parse(raw) as Record<string, unknown>;

  if (parsed.changedFiles && typeof parsed.changedFiles === 'object') {
    const changed = parsed.changedFiles as Record<string, unknown>;
    for (const [sprint, files] of Object.entries(changed)) {
      if (Array.isArray(files)) {
        changed[sprint] = files.map((f) =>
          typeof f === 'string' ? redactSensitivePath(f) : f,
        );
      }
    }
  }

  for (const key of ['openRisks', 'completedWork', 'documentationUpdates', 'blockers', 'deferredItems']) {
    if (key in parsed) parsed[key] = sanitizeJsonValue(parsed[key]);
  }

  return `${JSON.stringify(parsed, null, 2)}\n`;
}

export function sanitizeFileContent(filename: string, raw: string): string {
  if (filename === 'AI_OVERSIGHT_STATE.json') return sanitizeStateJson(raw);
  return scrubText(raw);
}

export function sanitizeStagingDir(stageDir: string): { highRisk: string[]; files: string[] } {
  const files = readdirSync(stageDir).filter((f) => ALLOWLIST.includes(f as (typeof ALLOWLIST)[number]));
  const allHighRisk: string[] = [];

  for (const file of files) {
    const path = join(stageDir, file);
    const raw = readFileSync(path, 'utf8');
    const sanitized = sanitizeFileContent(file, raw);
    writeFileSync(path, sanitized, 'utf8');
    const hits = detectHighRisk(sanitized);
    allHighRisk.push(...hits.map((h) => `${file}:${h}`));
  }

  return { highRisk: [...new Set(allHighRisk)], files };
}

export type SelfTestCase = { name: string; input: string; mustNotContain: RegExp[]; expectRedacted?: boolean };

export const SELFTEST_CASES: SelfTestCase[] = [
  {
    name: 'bearer token',
    input: 'Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.abc.def',
    mustNotContain: [/Bearer eyJ/],
  },
  {
    name: 'sk- prefix',
    input: 'key=sk-live-abcdefghijklmnopqrstuvwxyz',
    mustNotContain: [/sk-live-[a-z]{10,}/],
  },
  {
    name: 'email',
    input: 'Contact reviewer@example.com for details',
    mustNotContain: [/reviewer@example\.com/],
  },
  {
    name: 'currency',
    input: 'Awarded value $1,250,000.00 on contract close',
    mustNotContain: [/\$1,250,000/],
  },
  {
    name: 'internal host',
    input: 'Dev at http://admin247.local:5174/api',
    mustNotContain: [/admin247\.local/],
  },
  {
    name: 'password pattern',
    input: 'password=SuperSecret123!',
    mustNotContain: [/SuperSecret123/],
  },
  {
    name: 'connection-string',
    input: 'DB=postgres://user:pass@10.0.0.5:5432/app',
    mustNotContain: [new RegExp('postgres://user')],
  },
  {
    name: 'token assignment',
    input: 'secret=abc123xyz789012',
    mustNotContain: [/abc123xyz789012/],
  },
  {
    name: 'state changedFiles sensitive path',
    input: JSON.stringify({
      changedFiles: { sprint1: ['src/app.ts', '.env.local', 'drawings/plan.pdf'] },
      openRisks: [],
    }),
    mustNotContain: [/\.env\.local/, new RegExp('drawings/plan')],
  },
];

export function runSelfTest(): number {
  let failed = 0;
  for (const tc of SELFTEST_CASES) {
    const out =
      tc.name.includes('state') && tc.input.startsWith('{')
        ? sanitizeStateJson(tc.input)
        : scrubText(tc.input);
    for (const pattern of tc.mustNotContain) {
      if (pattern.test(out)) {
        console.error(`FAIL: ${tc.name} — still matches ${pattern}`);
        failed += 1;
      }
    }
    if (!out.includes(REDACT) && tc.expectRedacted !== false) {
      const shouldRedact = tc.mustNotContain.length > 0;
      if (shouldRedact && !out.includes('[REDACTED')) {
        console.error(`FAIL: ${tc.name} — expected redaction marker`);
        failed += 1;
      }
    }
    if (failed === 0) console.log(`ok: ${tc.name}`);
  }
  return failed > 0 ? 1 : 0;
}

function main(): number {
  const args = process.argv.slice(2);
  if (args.includes('--selftest')) return runSelfTest();

  const stageIdx = args.indexOf('--stage');
  if (stageIdx === -1 || !args[stageIdx + 1]) {
    console.error('Usage: oversight-sanitize.ts --stage <dir> [--force] | --selftest');
    return 2;
  }

  const stageDir = args[stageIdx + 1];
  const force = args.includes('--force');

  if (!existsSync(stageDir)) {
    console.error(`Staging directory not found: ${stageDir}`);
    return 2;
  }

  const { highRisk, files } = sanitizeStagingDir(stageDir);
  console.log(`Sanitized ${files.length} file(s) in ${stageDir}`);

  if (highRisk.length > 0) {
    console.warn('High-risk patterns detected after scrub:');
    for (const hit of highRisk) console.warn(`  - ${hit}`);
    if (!force) {
      console.error('Push blocked. Re-review source files or re-run with --force if safe.');
      return 1;
    }
    console.warn('Proceeding with --force');
  }

  return 0;
}

if (process.argv[1]?.includes('oversight-sanitize.ts')) {
  process.exit(main());
}
