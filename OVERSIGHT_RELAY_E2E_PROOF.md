# Oversight Relay E2E Proof

**Generated:** 2026-07-04T23:22:45.038Z  
**E2E proven:** Y (local path)  
**Mode:** local-simulated

---

## Test finding

| Field | Value |
|-------|-------|
| findingId | `relay-e2e-mr6zmctr` |
| relay URL | `http://127.0.0.1:9876` |

## Relay response

```json
{
  "status": 202,
  "body": {
    "ok": true,
    "findingId": "relay-e2e-mr6zmctr",
    "mode": "simulated",
    "sanitized": false
  }
}
```

## Inbox entry (oversight repo layout)

```json
{
  "findingId": "relay-e2e-mr6zmctr",
  "timestamp": "2026-07-04T23:22:39Z",
  "severity": "low",
  "category": "architecture",
  "title": "Relay E2E self-test finding",
  "evidence": "Synthetic evidence from oversight-bridge-relay-e2e-selftest.ts.",
  "whyItMatters": "Proves ChatGPT→relay→ingest→consume path without manual copy/paste.",
  "recommendedAction": "Remove after E2E proof; close any auto-opened PR.",
  "source": "independent-oversight",
  "ingestedAt": "2026-07-04T23:22:44.212Z"
}
```

## Triage state (consume-oversight-findings)

```json
{
  "findingId": "relay-e2e-mr6zmctr",
  "firstSeen": "2026-07-04T23:22:44.212Z",
  "lastReviewed": null,
  "status": "pending",
  "severity": "low",
  "category": "architecture",
  "title": "Relay E2E self-test finding",
  "completionEvidence": null
}
```

## Environment

| Check | Result |
|-------|--------|
| GITHUB_DISPATCH_PAT set | no (simulated ingest) |
| gh CLI available | no |
| Remote relay deployed | no — deploy via bootstrap-deploy.sh |

## Remote verification (after Cloudflare deploy)

1. Deploy worker: `docs/ai-oversight/templates/oversight-relay/bootstrap-deploy.sh`
2. Set env: `OVERSIGHT_RELAY_URL`, `OVERSIGHT_RELAY_API_KEY`, `GITHUB_DISPATCH_PAT`
3. Re-run: `npx tsx scripts/oversight-bridge-relay-e2e-selftest.ts`
4. Check PR: `https://github.com/wimaxnz/construction-intelligence-oversight/pulls`
5. Or raw inbox: `https://raw.githubusercontent.com/wimaxnz/construction-intelligence-oversight/main/AI_OVERSIGHT_INBOX.json`

---

*Automated by scripts/oversight-bridge-relay-e2e-selftest.ts*
