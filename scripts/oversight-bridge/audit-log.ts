/**
 * Append-only JSONL audit log for oversight bridge ingest events.
 */

import { appendFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

export type AuditEventType =
  | 'ingest_accepted'
  | 'ingest_rejected'
  | 'ingest_duplicate'
  | 'ingest_rate_limited'
  | 'ingest_injection_stripped'
  | 'ingest_high_risk_blocked';

export type AuditEvent = {
  eventId: string;
  eventType: AuditEventType;
  timestamp: string;
  findingId?: string;
  source?: string;
  details?: Record<string, unknown>;
};

export const DEFAULT_AUDIT_LOG = 'docs/ai-oversight/bridge-audit.jsonl';
export const ROOT_AUDIT_LOG = 'bridge-audit.jsonl';

export function resolveAuditLogPath(baseDir: string, override?: string): string {
  if (override) return override;
  const layout = process.env.OVERSIGHT_FILE_LAYOUT === 'root' ? 'root' : 'docs';
  return join(baseDir, layout === 'root' ? ROOT_AUDIT_LOG : DEFAULT_AUDIT_LOG);
}

export function ensureAuditLogDir(auditPath: string): void {
  const dir = dirname(auditPath);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

export function appendAuditEvent(auditPath: string, event: AuditEvent): void {
  ensureAuditLogDir(auditPath);
  appendFileSync(auditPath, `${JSON.stringify(event)}\n`, 'utf8');
}

export function readAuditEvents(auditPath: string): AuditEvent[] {
  if (!existsSync(auditPath)) return [];
  const raw = readFileSync(auditPath, 'utf8');
  return raw
    .split('\n')
    .filter((line) => line.trim().length > 0)
    .map((line) => JSON.parse(line) as AuditEvent);
}

export function newEventId(): string {
  return `evt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
