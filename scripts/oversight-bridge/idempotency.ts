/**
 * Idempotency and rate limiting via append-only audit log.
 */

import { readAuditEvents, type AuditEvent } from './audit-log.ts';

export const RATE_LIMIT_PER_HOUR = 10;
export const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;

export function hasFindingId(auditPath: string, findingId: string): boolean {
  const events = readAuditEvents(auditPath);
  return events.some(
    (e) =>
      e.findingId === findingId &&
      (e.eventType === 'ingest_accepted' || e.eventType === 'ingest_duplicate'),
  );
}

export function countRecentIngests(
  auditPath: string,
  source: string,
  windowMs = RATE_LIMIT_WINDOW_MS,
): number {
  const events = readAuditEvents(auditPath);
  const cutoff = Date.now() - windowMs;
  return events.filter((e) => {
    if (e.source !== source) return false;
    if (e.eventType !== 'ingest_accepted') return false;
    const ts = Date.parse(e.timestamp);
    return !Number.isNaN(ts) && ts >= cutoff;
  }).length;
}

export function isRateLimited(
  auditPath: string,
  source: string,
  limit = RATE_LIMIT_PER_HOUR,
): boolean {
  return countRecentIngests(auditPath, source) >= limit;
}

export function listAcceptedFindingIds(auditPath: string): string[] {
  const events = readAuditEvents(auditPath);
  const ids = new Set<string>();
  for (const e of events) {
    if (e.eventType === 'ingest_accepted' && e.findingId) ids.add(e.findingId);
  }
  return [...ids];
}

export function filterEventsByFindingId(events: AuditEvent[], findingId: string): AuditEvent[] {
  return events.filter((e) => e.findingId === findingId);
}
