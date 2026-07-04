#!/usr/bin/env bash
# Bootstrap: deploy oversight relay from template (run on machine with wrangler + Cloudflare auth).
# Does NOT copy relay into oversight repo — relay is external infrastructure.
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "==> Installing dependencies"
npm install

if ! grep -q 'REPLACE_WITH_KV' wrangler.toml 2>/dev/null; then
  echo "KV namespace already configured in wrangler.toml"
else
  echo "==> Create KV namespace and update wrangler.toml:"
  echo "    npx wrangler kv namespace create RELAY_KV"
  echo "    # paste id into wrangler.toml"
  exit 1
fi

echo "==> Set secrets (if not already set):"
echo "    npx wrangler secret put OVERSIGHT_RELAY_API_KEY"
echo "    npx wrangler secret put GITHUB_DISPATCH_PAT"
echo "    npx wrangler secret put OVERSIGHT_INGEST_HMAC"

echo "==> Deploying worker"
npx wrangler deploy

echo "==> Done. Configure ChatGPT Action with openapi.yaml and worker URL."
