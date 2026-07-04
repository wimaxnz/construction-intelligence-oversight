/**
 * Core ingest pipeline — shared by CLI and self-test.
 */

import { parseAndValidatePayload } from './validate-payload.ts';
import { sanitizeFinding } from './sanitize-finding.ts';
import { appendAuditEvent, newEventId, resolveAuditLogPath } from './audit-log.ts';
import { hasFindingId, isRateLimited } from './idempotency.ts';
import { appendFinding } from './append-finding.ts';

export type IngestOptions = {
  baseDir: string;
  allowHighRisk?: boolean;
  layoutRoot?: boolean;
};

export type IngestResult =
  | { code: 0; findingId: string; ingestedAt: string }
  | { code: 1; reason: string }
  | { code: 2; reason: string }
  | { code: 3; reason: string };

export function runIngest(raw: string, options: IngestOptions): IngestResult {
  if (options.layoutRoot) process.env.OVERSIGHT_FILE_LAYOUT = 'root';
  const auditPath = resolveAuditLogPath(options.baseDir);
  const allowHighRisk = options.allowHighRisk ?? false;

  const validated = parseAndValidatePayload(raw);
  if (!validated.ok) {
    appendAuditEvent(auditPath, {
      eventId: newEventId(),
      eventType: 'ingest_rejected',
      timestamp: new Date().toISOString(),
      details: { errors: validated.errors },
    });
    return {
      code: 1,
      reason: validated.errors.map((e) => e.message).join('; '),
    };
  }

  const { payload } = validated;

  if (hasFindingId(auditPath, payload.findingId)) {
    appendAuditEvent(auditPath, {
      eventId: newEventId(),
      eventType: 'ingest_duplicate',
      timestamp: new Date().toISOString(),
      findingId: payload.findingId,
      source: payload.source,
    });
    return { code: 2, reason: `Duplicate findingId: ${payload.findingId}` };
  }

  if (isRateLimited(auditPath, payload.source)) {
    appendAuditEvent(auditPath, {
      eventId: newEventId(),
      eventType: 'ingest_rate_limited',
      timestamp: new Date().toISOString(),
      source: payload.source,
    });
    return { code: 3, reason: `Rate limit exceeded for source: ${payload.source}` };
  }

  const { payload: sanitized, injectionHits, highRiskAfterScrub } = sanitizeFinding(payload);

  if (injectionHits.length > 0) {
    appendAuditEvent(auditPath, {
      eventId: newEventId(),
      eventType: 'ingest_injection_stripped',
      timestamp: new Date().toISOString(),
      findingId: payload.findingId,
      source: payload.source,
      details: { hits: injectionHits },
    });
  }

  if (highRiskAfterScrub.length > 0 && !allowHighRisk) {
    appendAuditEvent(auditPath, {
      eventId: newEventId(),
      eventType: 'ingest_high_risk_blocked',
      timestamp: new Date().toISOString(),
      findingId: payload.findingId,
      source: payload.source,
      details: { patterns: highRiskAfterScrub },
    });
    return {
      code: 1,
      reason: `High-risk content after scrub: ${highRiskAfterScrub.join(', ')}`,
    };
  }

  const ingestedAt = new Date().toISOString();
  appendFinding(options.baseDir, sanitized, ingestedAt);

  appendAuditEvent(auditPath, {
    eventId: newEventId(),
    eventType: 'ingest_accepted',
    timestamp: ingestedAt,
    findingId: sanitized.findingId,
    source: sanitized.source,
    details: {
      severity: sanitized.severity,
      category: sanitized.category,
      title: sanitized.title,
    },
  });

  return { code: 0, findingId: sanitized.findingId, ingestedAt };
}
