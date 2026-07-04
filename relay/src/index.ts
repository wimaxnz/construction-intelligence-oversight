/**
 * Oversight relay — Cloudflare Worker entry.
 * POST /v1/findings only. Bearer auth. Fixed dispatch target.
 *
 * Secrets (wrangler secret put):
 *   OVERSIGHT_RELAY_API_KEY
 *   GITHUB_DISPATCH_PAT
 *   OVERSIGHT_INGEST_HMAC
 */

import { handleFindingsRequest } from './handler';

export interface Env {
  OVERSIGHT_RELAY_API_KEY: string;
  GITHUB_DISPATCH_PAT: string;
  OVERSIGHT_INGEST_HMAC: string;
  RELAY_KV: KVNamespace;
}

const RATE_LIMIT_PER_HOUR = 10;
const OVERSIGHT_REPO = 'wimaxnz/construction-intelligence-oversight';
const DISPATCH_EVENT = 'oversight-finding';

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === 'GET' && url.pathname === '/health') {
      return json(200, { ok: true, service: 'oversight-relay' });
    }

    if (request.method !== 'POST' || url.pathname !== '/v1/findings') {
      return json(404, { ok: false, code: 'NOT_FOUND', message: 'Only POST /v1/findings' });
    }

    const raw = await request.text();
    const auth = request.headers.get('Authorization');
    const result = await handleFindingsRequest(raw, auth, env, {
      rateLimitPerHour: RATE_LIMIT_PER_HOUR,
      oversightRepo: OVERSIGHT_REPO,
      dispatchEvent: DISPATCH_EVENT,
    });

    return json(result.status, result.body);
  },
};

function json(status: number, body: unknown): Response {
  return new Response(`${JSON.stringify(body)}\n`, {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
