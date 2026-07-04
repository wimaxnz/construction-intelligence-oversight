/**
 * Relay handler — validate · sanitize · rate-limit · idempotency · HMAC dispatch.
 * Validation rules mirror scripts/oversight-bridge/validate-payload.ts (keep in sync).
 */

import { parseAndValidatePayload } from './validate';

export type HandlerConfig = {
  rateLimitPerHour: number;
  oversightRepo: string;
  dispatchEvent: string;
};

export type HandlerResult = { status: number; body: Record<string, unknown> };

export interface RelayEnv {
  OVERSIGHT_RELAY_API_KEY: string;
  GITHUB_DISPATCH_PAT: string;
  OVERSIGHT_INGEST_HMAC: string;
  RELAY_KV: KVNamespace;
}

const RELAY_SOURCE = 'relay-api';
const RATE_WINDOW_SEC = 3600;

function extractBearer(auth: string | null): string | null {
  if (!auth) return null;
  const m = auth.match(/^Bearer\s+(.+)$/i);
  return m ? m[1].trim() : null;
}

async function auditKv(
  kv: KVNamespace,
  event: Record<string, unknown>,
): Promise<void> {
  const id = `audit:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`;
  await kv.put(id, JSON.stringify(event), { expirationTtl: 60 * 60 * 24 * 90 });
}

async function isRateLimited(kv: KVNamespace, limit: number): Promise<boolean> {
  const key = `ratelimit:${RELAY_SOURCE}`;
  const raw = await kv.get(key);
  const now = Date.now();
  let entries: number[] = raw ? (JSON.parse(raw) as number[]) : [];
  entries = entries.filter((t) => now - t < RATE_WINDOW_SEC * 1000);
  return entries.length >= limit;
}

async function recordRateLimit(kv: KVNamespace): Promise<void> {
  const key = `ratelimit:${RELAY_SOURCE}`;
  const raw = await kv.get(key);
  const now = Date.now();
  let entries: number[] = raw ? (JSON.parse(raw) as number[]) : [];
  entries = entries.filter((t) => now - t < RATE_WINDOW_SEC * 1000);
  entries.push(now);
  await kv.put(key, JSON.stringify(entries), { expirationTtl: RATE_WINDOW_SEC + 60 });
}

async function hasFindingId(kv: KVNamespace, findingId: string): Promise<boolean> {
  const v = await kv.get(`idempotency:${findingId}`);
  return v !== null;
}

async function markFindingId(kv: KVNamespace, findingId: string): Promise<void> {
  await kv.put(`idempotency:${findingId}`, new Date().toISOString(), {
    expirationTtl: 60 * 60 * 24 * 365,
  });
}

/** Minimal sanitization for worker (strip injection phrases; no full PII scrub). */
function sanitizeText(text: string): { out: string; hits: number } {
  const patterns = [
    /ignore\s+(?:all\s+)?(?:previous|prior|above)\s+instructions/gi,
    /\brun\s+(?:bash|shell|powershell|cmd)\b/gi,
    /```(?:bash|sh|powershell|cmd|shell)/gi,
    /\.\.[\\/]/g,
  ];
  let out = text;
  let hits = 0;
  for (const p of patterns) {
    p.lastIndex = 0;
    if (p.test(out)) {
      hits += 1;
      out = out.replace(p, '[stripped-injection]');
    }
  }
  return { out, hits };
}

function sanitizePayload(payload: ReturnType<typeof parseAndValidatePayload> & { ok: true }) {
  const p = { ...payload.payload };
  let totalHits = 0;
  for (const field of ['title', 'evidence', 'whyItMatters', 'recommendedAction'] as const) {
    const { out, hits } = sanitizeText(p[field]);
    p[field] = out;
    totalHits += hits;
  }
  return { payload: p, injectionHits: totalHits };
}

async function signPayload(payload: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function dispatchGitHub(
  repo: string,
  eventType: string,
  payloadJson: string,
  hmac: string,
  pat: string,
): Promise<{ ok: boolean; status: number; message?: string }> {
  const res = await fetch(`https://api.github.com/repos/${repo}/dispatches`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${pat}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
      'User-Agent': 'oversight-relay-cf/1.0',
    },
    body: JSON.stringify({
      event_type: eventType,
      client_payload: { payload: payloadJson, hmac },
    }),
  });
  if (res.status === 204) return { ok: true, status: 204 };
  const text = await res.text();
  return { ok: false, status: res.status, message: text.slice(0, 500) };
}

export async function handleFindingsRequest(
  rawBody: string,
  authHeader: string | null,
  env: RelayEnv,
  config: HandlerConfig,
): Promise<HandlerResult> {
  const now = new Date().toISOString();
  const token = extractBearer(authHeader);

  if (!token || token !== env.OVERSIGHT_RELAY_API_KEY) {
    await auditKv(env.RELAY_KV, { eventType: 'relay_rejected', timestamp: now, reason: 'unauthorized' });
    return { status: 401, body: { ok: false, code: 'UNAUTHORIZED', message: 'Invalid Bearer token' } };
  }

  if (await isRateLimited(env.RELAY_KV, config.rateLimitPerHour)) {
    await auditKv(env.RELAY_KV, { eventType: 'relay_rate_limited', timestamp: now });
    return {
      status: 429,
      body: { ok: false, code: 'RATE_LIMITED', message: `${config.rateLimitPerHour}/hour exceeded` },
    };
  }

  const validated = parseAndValidatePayload(rawBody);
  if (!validated.ok) {
    await auditKv(env.RELAY_KV, {
      eventType: 'relay_rejected',
      timestamp: now,
      errors: validated.errors,
    });
    return {
      status: 400,
      body: {
        ok: false,
        code: 'VALIDATION_FAILED',
        message: validated.errors.map((e) => e.message).join('; '),
      },
    };
  }

  if (await hasFindingId(env.RELAY_KV, validated.payload.findingId)) {
    await auditKv(env.RELAY_KV, {
      eventType: 'relay_duplicate',
      timestamp: now,
      findingId: validated.payload.findingId,
    });
    return {
      status: 409,
      body: {
        ok: false,
        code: 'DUPLICATE',
        message: `Duplicate findingId: ${validated.payload.findingId}`,
      },
    };
  }

  const { payload: sanitized, injectionHits } = sanitizePayload(validated);
  const payloadJson = JSON.stringify(sanitized);

  await auditKv(env.RELAY_KV, {
    eventType: 'relay_accepted',
    timestamp: now,
    findingId: sanitized.findingId,
    injectionHits,
  });

  const hmac = await signPayload(payloadJson, env.OVERSIGHT_INGEST_HMAC);
  const dispatch = await dispatchGitHub(
    config.oversightRepo,
    config.dispatchEvent,
    payloadJson,
    hmac,
    env.GITHUB_DISPATCH_PAT,
  );

  if (!dispatch.ok) {
    await auditKv(env.RELAY_KV, {
      eventType: 'relay_dispatch_failed',
      timestamp: now,
      findingId: sanitized.findingId,
      status: dispatch.status,
      message: dispatch.message,
    });
    return {
      status: 502,
      body: { ok: false, code: 'DISPATCH_FAILED', message: dispatch.message ?? 'GitHub dispatch failed' },
    };
  }

  await markFindingId(env.RELAY_KV, sanitized.findingId);
  await recordRateLimit(env.RELAY_KV);
  await auditKv(env.RELAY_KV, {
    eventType: 'relay_dispatched',
    timestamp: now,
    findingId: sanitized.findingId,
  });

  return {
    status: 202,
    body: {
      ok: true,
      findingId: sanitized.findingId,
      mode: 'dispatched',
      sanitized: injectionHits > 0,
    },
  };
}
