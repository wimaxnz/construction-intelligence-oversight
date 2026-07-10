# AI Oversight â€” Safe Public Sync

**Purpose:** Publish sanitized sprint close-out state to the independent public oversight repository so external reviewers can monitor architecture, product direction, and roadmap alignment **without** exposing app source, credentials, or commercial data.

**Remote:** https://github.com/wimaxnz/construction-intelligence-oversight  
**Local clone (default):** `../construction-intelligence-oversight` (sibling to this repo)  
**Override:** `$env:OVERSIGHT_REPO_PATH` / `OVERSIGHT_REPO_PATH`

This repo is **not** a runtime dependency of `construction-command-centre`. The app never reads from it at build or deploy time.


---

**Last successful push:** 2026-07-05 - sprint 294 close-out (AI_OVERSIGHT_STATE.json, AI_OVERSIGHT_REQUEST.md, AI_OVERSIGHT_RESPONSE.md, AI_OVERSIGHT_PROTOCOL.md, OVERSIGHT_PACKET.md). Remote: wimaxnz/construction-intelligence-oversight @ 4de3ecf9ea7de7230cec775ec72b50bd5acbaf6a.

**Bridge docs (local only, not in push allowlist):** OVERSIGHT_BRIDGE_ADR.md, OVERSIGHT_BRIDGE_OPERATIONS.md, OVERSIGHT_BRIDGE_THREAT_MODEL.md, OVERSIGHT_SYNC.md, OVERSIGHT_REMOTE.md, AI_OVERSIGHT_INBOX.json — indexed in AI_OVERSIGHT_STATE.json ? oversightSync.bridgeDocsPublished.
---

## Non-blocking rule

- Run sync **after** sprint close-out when convenient.
- If git, network, or auth fails: **warn and continue** â€” never pause the next sprint.
- Missing or delayed external review does not gate delivery.

---

## Allowlist (push only)

Only these files from `docs/ai-oversight/` are copied to the oversight repo root:

| File | Required | Notes |
|------|----------|-------|
| `AI_OVERSIGHT_STATE.json` | Yes | Sprint/milestone snapshot |
| `AI_OVERSIGHT_REQUEST.md` | When changed | Outbound review asks |
| `AI_OVERSIGHT_RESPONSE.md` | When present locally | Inbound findings (mirrored on push if file exists) |
| `AI_OVERSIGHT_PROTOCOL.md` | Yes (first sync) | Loop definition for reviewers |
| `OVERSIGHT_PACKET.md` | Optional | Human-readable close-out summary |

**Pull inbound:** `AI_OVERSIGHT_RESPONSE.md` from the oversight clone when reviewers publish updates (script copies into `docs/ai-oversight/`).

**Never synced:** app source, `.env`, keys, tokens, drawings, customer/personal data, commercial figures, private docs, internal URLs, DB dumps, secret logs, or any file outside the allowlist.

---

## Sanitization (before every push)

Scripts stage allowlisted files in a temp directory, then run `scripts/oversight-sanitize.ts` **before** copying to the oversight clone.

### Text scrub patterns

| Category | Examples redacted |
|----------|-------------------|
| Auth / keys | Bearer tokens, `sk-` / `pk_` prefixes, API key assignments, JWTs |
| Secrets | `password=` values, connection strings (`postgres://â€¦`), `.env` references |
| Supabase | Project URLs with embedded keys/tokens |
| PII | Email addresses, phone numbers |
| Commercial | `$â€¦`, `NZD â€¦`, contract/award/claim/forecast dollar amounts in free text |
| Internal infra | `localhost`, `admin247`, private IPs (`10.x`, `192.168.x`, `172.16â€“31.x`), internal HTTP URLs |

Replacement marker: `[REDACTED]` (paths: `[REDACTED-path]`).

### `AI_OVERSIGHT_STATE.json` rules

- **Keep:** sprint number, milestone progress, validation metadata, strategic alignment fields.
- **Scrub:** string values in `openRisks`, `completedWork`, `documentationUpdates`, `blockers`, `deferredItems`.
- **Redact paths** in `changedFiles` that match sensitive patterns (`.env`, `drawing`, `customer`, `secret`, etc.).

### Fail-safe

If high-risk patterns remain **after** scrub, push is blocked unless you pass `-Force` (PowerShell) or `OVERSIGHT_FORCE=1` (bash). Review source files manually before forcing.

---

## Usage after sprint close-out

1. Update `AI_OVERSIGHT_STATE.json` (and `AI_OVERSIGHT_REQUEST.md` if filing a review ask).
2. Run sanitization self-test (optional but recommended):

```powershell
.\scripts\sync-ai-oversight.ps1 -SelfTest
```

```bash
./scripts/sync-ai-oversight.sh selftest
```

3. Push sanitized allowlisted files to the oversight repo (scripts stage â†’ scrub â†’ copy â†’ commit â†’ push **only** to `../construction-intelligence-oversight` or `OVERSIGHT_REPO_PATH` â€” never app code):

```powershell
.\scripts\sync-ai-oversight.ps1 -Push
```

```bash
./scripts/sync-ai-oversight.sh push
```

If high-risk patterns remain after scrub, push is blocked until you pass `-Force` / `OVERSIGHT_FORCE=1` after manual review.

4. When convenient, pull reviewer response:

```powershell
.\scripts\sync-ai-oversight.ps1 -Pull
```

```bash
./scripts/sync-ai-oversight.sh pull
```

Commit message on the oversight repo: `chore(oversight): sync sprint close-out state`

---

## One-time setup

```powershell
git clone https://github.com/wimaxnz/construction-intelligence-oversight.git ../construction-intelligence-oversight
```

The sync script clones automatically if the sibling directory is missing and git is in PATH.

**Observed remote layout:** files at repo root (not nested under `docs/`). Remote currently contains only `README.md`; first push adds the allowlisted oversight files.

---

## Manual workflow (no git in PATH)

| Action | Steps |
|--------|-------|
| **Push** | Run sanitization locally: `npx tsx --tsconfig tsconfig.app.json scripts/oversight-sanitize.ts --stage <temp-dir>` after copying allowlisted files into `<temp-dir>`. Upload sanitized files via GitHub web UI or `gh`. |
| **Pull** | Download `AI_OVERSIGHT_RESPONSE.md` from the external repo into `docs/ai-oversight/`. |

---

## Oversight repo `.gitignore` (reference)

The oversight clone is managed separately from this app repo. If initializing an empty clone, a minimal `.gitignore` can exclude accidental additions:

```gitignore
# Only allowlisted oversight files should be committed.
# Sync script copies explicit filenames; reject everything else by convention.
*
!.gitignore
!README.md
!AI_OVERSIGHT_*.json
!AI_OVERSIGHT_*.md
!OVERSIGHT_PACKET.md
```

The main `construction-command-centre` repo does **not** add the oversight remote as a push target for app code.

---

## Related docs

- [`AI_OVERSIGHT_PROTOCOL.md`](./AI_OVERSIGHT_PROTOCOL.md) â€” oversight loop and when to update state
- [`OVERSIGHT_REMOTE.md`](./OVERSIGHT_REMOTE.md) â€” quick reference (legacy alias)
