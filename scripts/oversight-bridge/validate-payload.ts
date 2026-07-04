/**
 * Strict payload validation for oversight bridge ingest.
 * Rejects arbitrary repo/path/shell/command fields; fixed contract only.
 */

export const MAX_PAYLOAD_BYTES = 8192;
export const MAX_FINDING_ID_LEN = 64;
export const MAX_TITLE_LEN = 120;
export const MAX_TEXT_FIELD_LEN = 2000;

export const VALID_SEVERITIES = ['low', 'medium', 'high', 'critical'] as const;
export const VALID_CATEGORIES = [
  'architecture',
  'product',
  'construction',
  'commercial',
  'roadmap',
  'regression',
  'security',
  'data-integrity',
] as const;
export const VALID_SOURCE = 'independent-oversight';

export type Severity = (typeof VALID_SEVERITIES)[number];
export type Category = (typeof VALID_CATEGORIES)[number];

export type OversightFindingPayload = {
  findingId: string;
  timestamp: string;
  severity: Severity;
  category: Category;
  title: string;
  evidence: string;
  whyItMatters: string;
  recommendedAction: string;
  source: typeof VALID_SOURCE;
};

/** Fields that must never appear in inbound payloads (injection / path traversal). */
export const FORBIDDEN_FIELD_NAMES = [
  'repo',
  'repository',
  'path',
  'file',
  'filepath',
  'branch',
  'command',
  'shell',
  'cmd',
  'exec',
  'script',
  'workflow',
  'token',
  'secret',
  'key',
  'url',
  'endpoint',
  'ref',
  'sha',
  'commit',
  'owner',
  'org',
  'organization',
  'cwd',
  'env',
  'run',
  'bash',
  'powershell',
  'git',
] as const;

const FINDING_ID_PATTERN = /^[a-z0-9][a-z0-9-]{0,62}[a-z0-9]$|^[a-z0-9]{1,2}$/i;
const ISO8601_PATTERN =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/;

const REQUIRED_STRING_FIELDS = [
  'findingId',
  'timestamp',
  'severity',
  'category',
  'title',
  'evidence',
  'whyItMatters',
  'recommendedAction',
  'source',
] as const;

export type ValidationError = { code: string; message: string };

export function validatePayloadSize(raw: string): ValidationError | null {
  const bytes = Buffer.byteLength(raw, 'utf8');
  if (bytes > MAX_PAYLOAD_BYTES) {
    return {
      code: 'PAYLOAD_TOO_LARGE',
      message: `Payload ${bytes} bytes exceeds max ${MAX_PAYLOAD_BYTES}`,
    };
  }
  return null;
}

export function detectForbiddenFields(obj: Record<string, unknown>): string[] {
  const hits: string[] = [];
  for (const key of Object.keys(obj)) {
    const lower = key.toLowerCase();
    if (FORBIDDEN_FIELD_NAMES.some((f) => lower === f || lower.includes(f))) {
      hits.push(key);
    }
  }
  return hits;
}

function validateIso8601(value: string): boolean {
  if (!ISO8601_PATTERN.test(value)) return false;
  const d = Date.parse(value);
  return !Number.isNaN(d);
}

function validateStringField(
  name: string,
  value: unknown,
  maxLen: number,
): ValidationError | null {
  if (typeof value !== 'string') {
    return { code: 'INVALID_TYPE', message: `${name} must be a string` };
  }
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return { code: 'EMPTY_FIELD', message: `${name} must not be empty` };
  }
  if (value.length > maxLen) {
    return { code: 'FIELD_TOO_LONG', message: `${name} exceeds max length ${maxLen}` };
  }
  return null;
}

export function validatePayload(raw: unknown): {
  ok: true;
  payload: OversightFindingPayload;
} | { ok: false; errors: ValidationError[] } {
  const errors: ValidationError[] = [];

  if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) {
    return { ok: false, errors: [{ code: 'INVALID_ROOT', message: 'Payload must be a JSON object' }] };
  }

  const obj = raw as Record<string, unknown>;
  const forbidden = detectForbiddenFields(obj);
  if (forbidden.length > 0) {
    errors.push({
      code: 'FORBIDDEN_FIELDS',
      message: `Rejected fields: ${forbidden.join(', ')}`,
    });
  }

  const allowedKeys = new Set(REQUIRED_STRING_FIELDS);
  for (const key of Object.keys(obj)) {
    if (!allowedKeys.has(key as (typeof REQUIRED_STRING_FIELDS)[number])) {
      errors.push({ code: 'UNKNOWN_FIELD', message: `Unknown field: ${key}` });
    }
  }

  for (const field of REQUIRED_STRING_FIELDS) {
    if (!(field in obj)) {
      errors.push({ code: 'MISSING_FIELD', message: `Missing required field: ${field}` });
    }
  }

  if (errors.length > 0) return { ok: false, errors };

  const findingIdErr = validateStringField('findingId', obj.findingId, MAX_FINDING_ID_LEN);
  if (findingIdErr) errors.push(findingIdErr);
  else if (!FINDING_ID_PATTERN.test(String(obj.findingId))) {
    errors.push({
      code: 'INVALID_FINDING_ID',
      message: 'findingId must be alphanumeric with hyphens, 1–64 chars',
    });
  }

  const tsErr = validateStringField('timestamp', obj.timestamp, 40);
  if (tsErr) errors.push(tsErr);
  else if (!validateIso8601(String(obj.timestamp))) {
    errors.push({ code: 'INVALID_TIMESTAMP', message: 'timestamp must be ISO-8601' });
  }

  if (!VALID_SEVERITIES.includes(obj.severity as Severity)) {
    errors.push({
      code: 'INVALID_SEVERITY',
      message: `severity must be one of: ${VALID_SEVERITIES.join(', ')}`,
    });
  }

  if (!VALID_CATEGORIES.includes(obj.category as Category)) {
    errors.push({
      code: 'INVALID_CATEGORY',
      message: `category must be one of: ${VALID_CATEGORIES.join(', ')}`,
    });
  }

  const titleErr = validateStringField('title', obj.title, MAX_TITLE_LEN);
  if (titleErr) errors.push(titleErr);

  for (const field of ['evidence', 'whyItMatters', 'recommendedAction'] as const) {
    const err = validateStringField(field, obj[field], MAX_TEXT_FIELD_LEN);
    if (err) errors.push(err);
  }

  if (obj.source !== VALID_SOURCE) {
    errors.push({
      code: 'INVALID_SOURCE',
      message: `source must be "${VALID_SOURCE}"`,
    });
  }

  if (errors.length > 0) return { ok: false, errors };

  return {
    ok: true,
    payload: {
      findingId: String(obj.findingId).trim(),
      timestamp: String(obj.timestamp).trim(),
      severity: obj.severity as Severity,
      category: obj.category as Category,
      title: String(obj.title).trim(),
      evidence: String(obj.evidence).trim(),
      whyItMatters: String(obj.whyItMatters).trim(),
      recommendedAction: String(obj.recommendedAction).trim(),
      source: VALID_SOURCE,
    },
  };
}

export function parseAndValidatePayload(raw: string): ReturnType<typeof validatePayload> {
  const sizeErr = validatePayloadSize(raw);
  if (sizeErr) return { ok: false, errors: [sizeErr] };

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, errors: [{ code: 'INVALID_JSON', message: 'Payload is not valid JSON' }] };
  }

  return validatePayload(parsed);
}
