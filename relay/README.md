# Oversight HTTPS Relay (Cloudflare Worker)

ChatGPT Custom GPT Actions cannot call GitHub `repository_dispatch` (403). This relay exposes **POST /v1/findings** with Bearer auth, validates/sanitizes payloads, and HMAC-signs dispatches to **wimaxnz/construction-intelligence-oversight** only.

**Deploy target:** Cloudflare Workers (not the oversight or delivery repo). Secrets never committed.

---

## Prerequisites

- Cloudflare account + `wrangler` CLI
- Fine-grained GitHub PAT scoped to `construction-intelligence-oversight` (Contents write, Metadata read)
- `OVERSIGHT_INGEST_HMAC` — same value as GitHub Actions secret on oversight repo

---

## Deploy (Alister — one-time)

```bash
cd docs/ai-oversight/templates/oversight-relay
npm install

# Create KV for rate limit + idempotency + audit
npx wrangler kv namespace create RELAY_KV
# Copy id into wrangler.toml [[kv_namespaces]] id = "..."

npx wrangler secret put OVERSIGHT_RELAY_API_KEY    # openssl rand -hex 32
npx wrangler secret put GITHUB_DISPATCH_PAT        # fine-grained PAT, oversight repo only
npx wrangler secret put OVERSIGHT_INGEST_HMAC      # must match oversight repo Actions secret

npx wrangler deploy
```

Note the workers.dev URL (e.g. `https://oversight-relay.<account>.workers.dev`).

---

## ChatGPT Custom GPT Action

1. Open Custom GPT → Configure → Actions → Import from URL or paste `openapi.yaml`
2. Set **Authentication** → API Key → Bearer → paste `OVERSIGHT_RELAY_API_KEY`
3. Update `servers[0].url` in OpenAPI to your deployed worker URL
4. Only operation: `submitOversightFinding` → POST `/v1/findings`

---

## Local development

```bash
# Terminal 1 — local Node relay (simulates worker)
OVERSIGHT_RELAY_API_KEY=dev-key OVERSIGHT_INGEST_HMAC=dev-hmac \
  RELAY_SIMULATE_INGEST_DIR=../../../construction-intelligence-oversight \
  npx tsx ../../../../scripts/oversight-bridge/local-relay-server.ts --port 8787

# Terminal 2 — submit test finding
OVERSIGHT_RELAY_URL=http://127.0.0.1:8787 OVERSIGHT_RELAY_API_KEY=dev-key \
  npx tsx ../../../../scripts/oversight-bridge/submit-finding.ts --payload '...'
```

For real GitHub dispatch locally, set `GITHUB_DISPATCH_PAT` and omit `RELAY_SIMULATE_INGEST_DIR`.

---

## Security

| Control | Implementation |
|---------|----------------|
| Auth | Bearer `OVERSIGHT_RELAY_API_KEY` (separate from HMAC) |
| Target | Fixed repo `wimaxnz/construction-intelligence-oversight` |
| Schema | Ported from `validate-payload.ts` — 8192 byte max, forbidden fields |
| Rate limit | 10/hour per API key (KV on CF; audit log locally) |
| Idempotency | `findingId` tracked in KV / relay audit |
| Sanitize | Injection strip + full scrub on Node relay; minimal strip on CF worker |
| Audit | KV events (CF) or `relay-audit.jsonl` (local) |

---

## Files

| File | Role |
|------|------|
| `src/index.ts` | Worker entry — routes POST /v1/findings |
| `src/handler.ts` | Validate · rate-limit · dispatch |
| `src/validate.ts` | Schema (keep synced with main repo) |
| `openapi.yaml` | ChatGPT Action import |
| `wrangler.toml` | CF Worker config |

---

## Sync validation rules

When `scripts/oversight-bridge/validate-payload.ts` changes, copy updates to `src/validate.ts` and redeploy.
