# Oversight Bridge — Operations

**Repo:** Bootstrap targets `wimaxnz/construction-intelligence-oversight` only.  
**Main repo role:** Templates + local self-test; no production ingest endpoint.

---

## Bootstrap (one-time)

From `construction-command-centre`:

```bash
# 1. Clone oversight repo (if needed)
git clone https://github.com/wimaxnz/construction-intelligence-oversight.git ../construction-intelligence-oversight

# 2. Copy workflow template
cp docs/ai-oversight/templates/oversight-repo/.github/workflows/oversight-ingest.yml \
   ../construction-intelligence-oversight/.github/workflows/

# 3. Copy bridge scripts (required by workflow)
mkdir -p ../construction-intelligence-oversight/scripts/oversight-bridge
cp -r scripts/oversight-bridge/* ../construction-intelligence-oversight/scripts/oversight-bridge/
cp scripts/oversight-sanitize.ts ../construction-intelligence-oversight/scripts/

# 4. Seed empty inbox at repo root (oversight layout)
echo '{"version":1,"updatedAt":null,"findings":[]}' > ../construction-intelligence-oversight/AI_OVERSIGHT_INBOX.json

# 5. Commit and push oversight repo
cd ../construction-intelligence-oversight
git add .github/workflows/oversight-ingest.yml scripts/ AI_OVERSIGHT_INBOX.json
git commit -m "feat(oversight): add automated finding ingest bridge"
git push origin main
```

### Git unavailable (one-time manual bootstrap)

When `git` is not in PATH (e.g. Cursor agent shell on Windows), copy bridge assets locally then commit/push from a machine with git:

```powershell
# From construction-command-centre (PowerShell)
$oversight = "..\construction-intelligence-oversight"
New-Item -ItemType Directory -Force -Path "$oversight\.github\workflows" | Out-Null
New-Item -ItemType Directory -Force -Path "$oversight\scripts\oversight-bridge" | Out-Null
Copy-Item -Force "docs\ai-oversight\templates\oversight-repo\.github\workflows\oversight-ingest.yml" "$oversight\.github\workflows\"
Copy-Item -Recurse -Force "scripts\oversight-bridge\*" "$oversight\scripts\oversight-bridge\"
Copy-Item -Force "scripts\oversight-sanitize.ts" "$oversight\scripts\"
if (-not (Test-Path "$oversight\AI_OVERSIGHT_INBOX.json")) {
  Set-Content -Path "$oversight\AI_OVERSIGHT_INBOX.json" -Value '{"version":1,"updatedAt":null,"findings":[]}'
}
```

Then on a host with git:

```bash
cd ../construction-intelligence-oversight
git add .github/workflows/oversight-ingest.yml scripts/ AI_OVERSIGHT_INBOX.json
git commit -m "feat(oversight): add automated finding ingest bridge"
git push origin main
```

`sync-ai-oversight` pull/push also requires git; sprint close-out proceeds when sync is skipped (non-blocking).

---

## Auth setup (no secrets in git)

### HTTPS relay (ChatGPT Custom GPT Action) — Option C

ChatGPT cannot call GitHub `repository_dispatch` directly (403). Deploy the Cloudflare Worker template:

```bash
cd docs/ai-oversight/templates/oversight-relay
./bootstrap-deploy.sh   # or follow README.md
```

| Secret (Worker) | Purpose | How to generate |
|-----------------|---------|-----------------|
| `OVERSIGHT_RELAY_API_KEY` | Bearer auth for ChatGPT Action | `openssl rand -hex 32` |
| `GITHUB_DISPATCH_PAT` | Calls `repository_dispatch` on oversight repo only | Fine-grained PAT — oversight repo, Contents write |
| `OVERSIGHT_INGEST_HMAC` | HMAC over payload body | Same value as oversight repo Actions secret |

Configure Custom GPT Action: import `docs/ai-oversight/templates/oversight-relay/openapi.yaml`, set Bearer auth to `OVERSIGHT_RELAY_API_KEY`, update server URL to deployed worker.

Local test (no deploy):

```bash
OVERSIGHT_RELAY_API_KEY=e2e-key OVERSIGHT_INGEST_HMAC=e2e-hmac \
  RELAY_SIMULATE_INGEST_DIR=/tmp/oversight-test \
  npx tsx scripts/oversight-bridge/local-relay-server.ts --port 8787

OVERSIGHT_RELAY_URL=http://127.0.0.1:8787 OVERSIGHT_RELAY_API_KEY=e2e-key \
  npx tsx scripts/oversight-bridge/submit-finding.ts --payload '{...}'
```

E2E proof:

```bash
npx tsx --tsconfig tsconfig.app.json scripts/oversight-bridge-relay-e2e-selftest.ts
```

See [`OVERSIGHT_RELAY_E2E_PROOF.md`](./OVERSIGHT_RELAY_E2E_PROOF.md) for latest timestamped evidence.

### GitHub Secrets (oversight repo only)

| Secret | Purpose | How to generate |
|--------|---------|-----------------|
| `OVERSIGHT_INGEST_HMAC` | HMAC key for `repository_dispatch` | `openssl rand -hex 32` — store in GitHub → Settings → Secrets → Actions |

Settings → Actions → General → Workflow permissions: **Read and write**.

### Fine-grained PAT (for dispatch caller)

Create at GitHub → Settings → Developer settings → Fine-grained tokens:

- **Repository access:** `construction-intelligence-oversight` only
- **Permissions:** Contents (read/write), Actions (read), Metadata (read)
- Store in password manager or ChatGPT Action config — **never** commit to repo

### HMAC signing (caller script)

```bash
PAYLOAD='{"findingId":"example-001",...}'
SECRET='<OVERSIGHT_INGEST_HMAC>'
HMAC=$(printf '%s' "$PAYLOAD" | openssl dgst -sha256 -hmac "$SECRET" | awk '{print $2}')

gh api repos/wimaxnz/construction-intelligence-oversight/dispatches \
  -f event_type=oversight-finding \
  -f "client_payload[payload]=$PAYLOAD" \
  -f "client_payload[hmac]=$HMAC"
```

---

## Deploy / update bridge scripts

When validation logic changes in main repo, re-copy scripts to oversight repo and push:

```bash
cp -r scripts/oversight-bridge/* ../construction-intelligence-oversight/scripts/oversight-bridge/
cp scripts/oversight-sanitize.ts ../construction-intelligence-oversight/scripts/
```

No deploy step required for `construction-command-centre` runtime.

---

## Test

### Local self-test (main repo)

```bash
npx tsx --tsconfig tsconfig.app.json scripts/oversight-bridge-ingest-selftest.ts
```

### Relay E2E self-test

```bash
npx tsx --tsconfig tsconfig.app.json scripts/oversight-bridge-relay-e2e-selftest.ts
```

With deployed worker:

```bash
OVERSIGHT_RELAY_URL=https://oversight-relay.<account>.workers.dev \
OVERSIGHT_RELAY_API_KEY=<key> \
GITHUB_DISPATCH_PAT=<pat> \
  npx tsx --tsconfig tsconfig.app.json scripts/oversight-bridge-relay-e2e-selftest.ts
```

### Local ingest (writes to docs/ai-oversight/)

```bash
npx tsx --tsconfig tsconfig.app.json scripts/oversight-bridge/ingest-cli.ts \
  --payload '{"findingId":"local-test-001","timestamp":"2026-07-05T08:00:00Z","severity":"low","category":"architecture","title":"Local test","evidence":"Test.","whyItMatters":"Test.","recommendedAction":"Remove.","source":"independent-oversight"}'
```

Remove test finding from INBOX/RESPONSE afterward.

### Workflow dispatch (oversight repo)

```bash
gh workflow run oversight-ingest.yml -R wimaxnz/construction-intelligence-oversight \
  -f payload='{"findingId":"wf-test-001","timestamp":"2026-07-05T08:00:00Z","severity":"low","category":"architecture","title":"Workflow test","evidence":"Test.","whyItMatters":"Test.","recommendedAction":"Close PR.","source":"independent-oversight"}'
```

---

## Pull + consume (Cursor close-out)

```powershell
.\scripts\sync-ai-oversight.ps1 -Pull
npx tsx --tsconfig tsconfig.app.json scripts/consume-oversight-findings.ts
```

```bash
./scripts/sync-ai-oversight.sh pull
npx tsx --tsconfig tsconfig.app.json scripts/consume-oversight-findings.ts
```

Non-blocking: failures warn only; next sprint proceeds.

---

## Rollback

1. **Unmerged PR:** Close PR and delete branch `oversight/inbox/{findingId}`
2. **Merged finding:** Revert merge commit on oversight repo; re-pull locally
3. **Bad state entry:** Update `oversightFindingsState` in `AI_OVERSIGHT_STATE.json` (disposition / status)
4. **Compromised secret:** Rotate `OVERSIGHT_INGEST_HMAC`; revoke PAT; review `bridge-audit.jsonl`

---

## Monitoring

- GitHub Actions run history on oversight repo
- `bridge-audit.jsonl` — append-only event stream
- `AI_OVERSIGHT_STATE.json` → `oversightBridge.lastConsumedAt`

---

## What NOT to do

- Do not add ingest workflow to `construction-command-centre`
- Do not commit PATs, HMAC secrets, or `.env` values
- Do not use `--allow-high-risk` in production workflow
- Do not auto-merge ingest PRs without review when findings are security-critical
