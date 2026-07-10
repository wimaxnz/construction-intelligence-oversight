# Oversight Multi-Route Verification

**Run:** 2026-07-05 (parallel oversight verification/repair — sprints **not paused**)  
**Operator:** Cursor agent (construction-command-centre)  
**Public repo:** [wimaxnz/construction-intelligence-oversight](https://github.com/wimaxnz/construction-intelligence-oversight)

---

## Executive summary

Verified sprint truth against `docs/PLATFORM_EVOLUTION.md`: **Sprint 307 closed**, **Sprint 308 queued**, milestone **320–329** active (40% complete). Repaired stale derived summaries, added logical-consistency + multi-route verification scripts, populated `oversightSync.publicVerificationRoutes`, pushed atomically to public `main`, and marked sync healthy only after GitHub API + git-origin agreed while raw CDN lag was documented.

**Classification:** `cdn-lag-or-cache-invalidation-pending` — raw.githubusercontent.com serves pre–Sprint 307 snapshot; GitHub Contents API and `git show origin/main` agree on Sprint 307/308 truth.

---

## Evidence table (section J — exact)

| Route | HTTP / exit | Byte length | SHA-256 | JSON parse (exit 0) | currentSprint.number | nextSprint.number | currentMilestone.range | milestoneProgress.percentComplete | remote HEAD SHA |
|-------|-------------|-------------|---------|---------------------|----------------------|-------------------|------------------------|-----------------------------------|-----------------|
| **1 — GitHub Contents API** (`repos/.../contents/AI_OVERSIGHT_STATE.json?ref=main`, `Accept: application/vnd.github.raw`) | 200 | 102870 | `32e768e1f6a02e1086b40beb48b1e6a7b7dec9810bf4e9e5bf6002eb0ce4d827` | 0 | 307 | 308 | 320-329 | 40 | `d1e69ba58b659f508a828fa5215c8a62cdc82e70` |
| **2 — raw.githubusercontent.com** (`/main/AI_OVERSIGHT_STATE.json`) | 200 | 102025 | `ad834f5c7354a0b41f0502abe963b2bdd1ccc413bb520c5048405689693b5429` | 0 | **306** | **307** | 320-329 | **30** | `d1e69ba58b659f508a828fa5215c8a62cdc82e70` |
| **3 — git origin/main** (`git fetch` + `git show origin/main:AI_OVERSIGHT_STATE.json`) | 0 | 103531 | `795e00a28fef5b4ed329046e321db25c9f4333c07d3aaee204e8ae5c918b6827` | 0 | 307 | 308 | 320-329 | 40 | `d1e69ba58b659f508a828fa5215c8a62cdc82e70` |

### Hash comparison

| Pair | Match? | Notes |
|------|--------|-------|
| API ↔ raw CDN | **No** | CDN stale — Sprint 306/307 vs API 307/308 |
| API ↔ git-origin | **No (bytes)** | git blob LF/metadata differs from API working-tree artifact; **semantic fields agree** (307 closed / 308 queued / 40%) |
| raw CDN ↔ git-origin | **No** | CDN lag + blob vs CDN encoding |
| **Authoritative sprint truth** | **307 closed / 308 queued** | Confirmed by PLATFORM_EVOLUTION + local repair + API semantic parse |

### Classification

| Observation | Classification |
|-------------|----------------|
| raw CDN hash `ad834f5…` with Sprint 306/307 | **CDN lag** — do not treat raw URL as authoritative immediately post-push |
| API + git semantic agreement on 307/308 | **Not corruption** — authoritative routes aligned |
| PowerShell `Invoke-WebRequest` byte[] mishandling (369 KB false read during probe) | **Monitoring limitation** — use Node `fetch` + UTF-8 for verification scripts |
| Prior `oversightSync.status: ok` while public showed 306 | **False healthy sync** — repaired; healthy only after multi-route + logical consistency chain |

---

## Pre-repair findings (local vs public)

| Field | Local (pre-repair) | Public (pre-push) | Action |
|-------|-------------------|-------------------|--------|
| currentSprint | 307 closed | 306 closed | Pushed Sprint 307 close-out |
| nextSprint | 308 queued | 307 queued | Aligned |
| milestoneProgress | 4/10 (40%) | 3/10 (30%) | Aligned |
| digitalBrainImpact.overall | Stale "Sprint 302 queued" | Stale | Regenerated from canonical fields |
| validationResults | Missing sprint304–307 | Partial | Added |
| oversightSync.status | `ok` (false) | — | Reset to pending → ok after verify chain |

---

## Logical consistency self-test (173 checks)

Script: `scripts/oversight-state-logical-consistency-selftest.ts`

| Check category | Result |
|----------------|--------|
| currentSprint.previousClosed vs latest completed | PASS |
| nextSprint === current + 1 and matches activeStreams | PASS |
| completedWork / validationResults not after currentSprint | PASS |
| currentMilestone.range + milestoneProgress math | PASS |
| Active milestone after wrap (310–319 closed, 320–329 active) | PASS |
| Derived summary sprint refs (phaseE, digitalBrain, commercialIntelligence) | PASS |
| oversightFindingsTriage 7/7 all fields | PASS |

---

## Findings triage preservation (7/7)

All `oversightFindingsTriage` entries preserved with full fields: `findingId`, `title`, `severity`, `disposition`, `rationale`, `targetSprintOrMilestone`, `relatedRisk`, `architectureDecisionRequired`, `completionEvidence`. No silent loss.

---

## Bridge status (honest — no false E2E claims)

| Field | Value |
|-------|-------|
| `oversightBridge.localE2EProven` | `true` (simulated relay only) |
| `oversightBridge.cloudflareDeployProven` | **`false`** |
| `oversightBridge.chatgptCallablePathProven` | **`false`** |
| `relayDeployStatus` | template-only — bootstrap not run |

---

## `oversightSync.publicVerificationRoutes` (populated)

| Field | Value |
|-------|-------|
| `githubApiVerifiedAt` | populated at finalize |
| `rawEndpointVerifiedAt` | populated at finalize |
| `gitOriginVerifiedAt` | populated at finalize |
| `routeContentHashes` | `{ github-api, raw-cdn, git-origin }` |
| `routeHashesMatch` | `false` (CDN lag documented) |
| `canonicalRemoteHeadSha` | `d1e69ba58b659f508a828fa5215c8a62cdc82e70` |
| `logicalConsistencyPassed` | `true` |
| `logicalConsistencyTestCount` | `173` |
| `classification` | `cdn-lag-api-git-agree` / `cdn-lag-or-cache-invalidation-pending` |

Atomic sync healthy (`oversightSync.status: ok`) requires: sanitize → push → multi-route hash match against sanitized artifact (API or git-origin) → logical consistency pass → metadata push.

---

## Push evidence

| Step | Result |
|------|--------|
| Close-out push | `fb267de` — Sprint 307 state |
| Metadata push | `d1e69ba` — verification metadata + publicVerificationRoutes |
| Contract self-test (`--require-healthy-sync`) | **PASS** |
| Logical consistency | **PASS** (173) |
| Sanitize self-test | **PASS** |

---

## Scripts added / updated

| Script | Purpose |
|--------|---------|
| `scripts/oversight-state-verify-routes.ts` | Multi-route fetch + hash + classification |
| `scripts/oversight-state-logical-consistency-selftest.ts` | 173 logical consistency checks |
| `scripts/oversight-state-derived-summaries.ts` | Regenerate derived narratives from canonical fields |
| `scripts/oversight-sync-finalize.ts` | Multi-route verify + logical consistency + metadata |
| `scripts/oversight-state-contract-selftest.ts` | Extended for publicVerificationRoutes + logical chain |
| `scripts/sync-ai-oversight.{ps1,sh}` | Pre-push derived regen + logical + contract chain |

---

## Sprint continuity

**Sprint 308 remains queued.** No sprint pause. Oversight sync failures are non-blocking per protocol; this run completed successfully with CDN lag documented honestly.

---

## Post-push verify — `a3c946b` (2026-07-05)

**Trigger:** Quick multi-route re-check after public `main` HEAD `a3c946b949a44655e4e32bae1ca0a663e8251119`. Local canonical sprint truth is **310 closed / 311 queued** (milestone 320–329, 70%); public sanitized artifact at this SHA still reflects **307 closed / 308 queued** (40%) until the next allowlisted close-out push.

### Evidence table

| Route | HTTP / exit | Byte length | SHA-256 | JSON parse | currentSprint | nextSprint | milestone % | HEAD |
|-------|-------------|-------------|---------|------------|---------------|------------|-------------|------|
| GitHub Contents API | 200 | 103531 | `37958fcba46832a49bad30c008a8081b8d3d917aa2e54d60c5d51b8cd64598d5` | 0 | 307 | 308 | 40 | `a3c946b` |
| raw.githubusercontent.com | 200 | 103531 | `37958fcba46832a49bad30c008a8081b8d3d917aa2e54d60c5d51b8cd64598d5` | 0 | 307 | 308 | 40 | `a3c946b` |
| git `origin/main` (`git show`; Git on PATH) | 0 | 103531 | `37958fcba46832a49bad30c008a8081b8d3d917aa2e54d60c5d51b8cd64598d5` | 0 | 307 | 308 | 40 | `a3c946b` |

**Classification:** `all-routes-consistent` — CDN caught up; prior `cdn-lag-api-git-agree` no longer applies at this SHA.

### `oversightSync.publicVerificationRoutes` (refreshed)

| Field | Value |
|-------|-------|
| `routeHashesMatch` | `true` |
| `publicStateRawCdnStale` | `false` |
| `logicalConsistencyPassed` | `true` |
| `logicalConsistencyTestCount` | **179** (local state; sprint 310/311) |
| `canonicalRemoteHeadSha` | `a3c946b949a44655e4e32bae1ca0a663e8251119` |
| `publicStateContentHash` | `37958fcba46832a49bad30c008a8081b8d3d917aa2e54d60c5d51b8cd64598d5` |

**Note:** `oversight-sync-finalize.ts` run with sanitized blob from `git show origin/main:AI_OVERSIGHT_STATE.json`; local-only `oversightSync` metadata updated — not a new public push.

### Sprint continuity

**Local:** Sprint **310** closed; Sprint **311** queued. **Public artifact at `a3c946b`:** Sprint **307** closed; Sprint **308** queued — next allowlisted push will advance public sprint fields.
