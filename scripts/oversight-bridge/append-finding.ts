/**
 * Append validated finding to fixed oversight paths only.
 * Writes: AI_OVERSIGHT_INBOX.json + AI_OVERSIGHT_RESPONSE.md section.
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import type { OversightFindingPayload } from './validate-payload.ts';

export const INBOX_FILENAME = 'AI_OVERSIGHT_INBOX.json';
export const RESPONSE_FILENAME = 'AI_OVERSIGHT_RESPONSE.md';

export type InboxFile = {
  version: 1;
  updatedAt: string | null;
  findings: Array<OversightFindingPayload & { ingestedAt: string }>;
};

/** `docs` = construction-command-centre; `root` = construction-intelligence-oversight clone */
export type OversightLayout = 'docs' | 'root';

export function resolveOversightDir(baseDir: string, layout?: OversightLayout): string {
  const mode = layout ?? (process.env.OVERSIGHT_FILE_LAYOUT === 'root' ? 'root' : 'docs');
  return mode === 'root' ? baseDir : join(baseDir, 'docs/ai-oversight');
}

export function readInbox(oversightDir: string): InboxFile {
  const path = join(oversightDir, INBOX_FILENAME);
  if (!existsSync(path)) {
    return { version: 1, updatedAt: null, findings: [] };
  }
  const parsed = JSON.parse(readFileSync(path, 'utf8')) as InboxFile;
  if (!parsed.findings) parsed.findings = [];
  return parsed;
}

export function formatResponseSection(payload: OversightFindingPayload, ingestedAt: string): string {
  return [
    '',
    `### ${payload.findingId} — ${payload.title}`,
    '',
    `| Field | Value |`,
    `|-------|-------|`,
    `| **Severity** | ${payload.severity} |`,
    `| **Category** | ${payload.category} |`,
    `| **Timestamp** | ${payload.timestamp} |`,
    `| **Ingested** | ${ingestedAt} |`,
    `| **Source** | ${payload.source} |`,
    '',
    `**Evidence**`,
    '',
    payload.evidence,
    '',
    `**Why it matters**`,
    '',
    payload.whyItMatters,
    '',
    `**Recommended action**`,
    '',
    payload.recommendedAction,
    '',
  ].join('\n');
}

export function appendFindingToInbox(
  oversightDir: string,
  payload: OversightFindingPayload,
  ingestedAt: string,
): InboxFile {
  const inbox = readInbox(oversightDir);
  const existing = inbox.findings.findIndex((f) => f.findingId === payload.findingId);
  const entry = { ...payload, ingestedAt };

  if (existing >= 0) {
    inbox.findings[existing] = entry;
  } else {
    inbox.findings.push(entry);
  }

  inbox.updatedAt = ingestedAt;
  inbox.version = 1;

  const dir = oversightDir;
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

  writeFileSync(join(dir, INBOX_FILENAME), `${JSON.stringify(inbox, null, 2)}\n`, 'utf8');
  return inbox;
}

export function appendFindingToResponse(
  oversightDir: string,
  payload: OversightFindingPayload,
  ingestedAt: string,
): void {
  const responsePath = join(oversightDir, RESPONSE_FILENAME);
  let content = '';

  if (existsSync(responsePath)) {
    content = readFileSync(responsePath, 'utf8');
  } else {
    content = [
      '# AI Oversight — Review Responses',
      '',
      'Findings from independent oversight land here (human-readable).',
      'Machine-readable inbox: `AI_OVERSIGHT_INBOX.json`.',
      '',
      '---',
      '',
      '## Bridge-ingested findings',
      '',
    ].join('\n');
  }

  const marker = `### ${payload.findingId} —`;
  if (content.includes(marker)) {
    const start = content.indexOf(marker);
    const next = content.indexOf('\n### ', start + 1);
    const section = formatResponseSection(payload, ingestedAt);
    content =
      next >= 0
        ? content.slice(0, start) + section.trimStart() + content.slice(next)
        : content.slice(0, start) + section.trimStart();
  } else {
    if (!content.includes('## Bridge-ingested findings')) {
      content += '\n## Bridge-ingested findings\n';
    }
    content += formatResponseSection(payload, ingestedAt);
  }

  if (!existsSync(oversightDir)) mkdirSync(oversightDir, { recursive: true });
  writeFileSync(responsePath, content.endsWith('\n') ? content : `${content}\n`, 'utf8');
}

export function appendFinding(
  baseDir: string,
  payload: OversightFindingPayload,
  ingestedAt = new Date().toISOString(),
): { inbox: InboxFile; oversightDir: string } {
  const oversightDir = resolveOversightDir(baseDir);
  const inbox = appendFindingToInbox(oversightDir, payload, ingestedAt);
  appendFindingToResponse(oversightDir, payload, ingestedAt);
  return { inbox, oversightDir };
}
