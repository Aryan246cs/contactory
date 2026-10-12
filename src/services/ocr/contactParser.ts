import type { ParsedContact, ParsedPhone } from '@/types/contact';
import { emptyParsedContact } from '@/types/contact';

const EMAIL_RE = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const URL_RE = /(?:https?:\/\/)?(?:www\.)?[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9-]+)*\.(?:com|org|net|io|co|in|ai|app|biz|info|edu|gov|me|tech|design|studio)(?:\/[\w./?%&=+#-]*)?/gi;
const PHONE_RE = /(?<!\w)\+?\d[\d\s()./-]{5,}\d(?!\w)/g;
const LABEL_RE = /\b(mobile|mob|cell|phone|tel|telephone|office|work|direct|fax|home|main)\b/i;
const TITLE_RE = /\b(ceo|cto|cfo|coo|founder|co-founder|director|manager|president|vice president|vp|engineer|designer|consultant|developer|lead|head of|product|sales|marketing|officer|partner|professor|owner|architect|analyst|specialist|executive)\b/i;
const COMPANY_RE = /\b(inc\.?|llc|ltd\.?|limited|corp\.?|corporation|technologies|technology|solutions|studio|labs|group|company|co\.|systems|partners|ventures|digital|services)\b/i;

export function normalizePhoneNumber(value: string): string {
  const trimmed = value.trim();
  const digits = trimmed.replace(/\D/g, '');
  return trimmed.startsWith('+') ? `+${digits}` : digits;
}

export function deduplicateValues(values: string[]): string[] {
  const seen = new Set<string>();
  return values.map((v) => v.trim()).filter((v) => {
    const key = v.toLowerCase();
    if (!v || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function extractEmails(text: string): string[] {
  return deduplicateValues(text.match(EMAIL_RE) ?? []);
}

export function extractWebsite(text: string): string {
  const withoutEmails = text.replace(EMAIL_RE, ' ');
  return (withoutEmails.match(URL_RE) ?? [])[0]?.replace(/[.,;:)]+$/, '') ?? '';
}

export function extractPhoneNumbers(text: string): ParsedPhone[] {
  const found: ParsedPhone[] = [];
  const lines = text.split(/\r?\n/);
  let lastLabel = '';
  for (const line of lines) {
    const label = line.match(LABEL_RE)?.[1] ?? lastLabel;
    if (line.match(LABEL_RE)) lastLabel = label;
    for (const match of line.matchAll(PHONE_RE)) {
      const value = match[0].trim().replace(/[.,;:]+$/, '');
      const digits = value.replace(/\D/g, '');
      if (digits.length < 7 || digits.length > 15) continue;
      const normalized = normalizePhoneNumber(value);
      if (found.some((phone) => normalizePhoneNumber(phone.value) === normalized)) continue;
      found.push({ value, label: label ? label[0].toUpperCase() + label.slice(1).toLowerCase() : 'Phone', selected: true });
    }
    if (line.trim() && !PHONE_RE.test(line) && !LABEL_RE.test(line)) lastLabel = '';
    PHONE_RE.lastIndex = 0;
  }
  return found;
}

function cleanLine(line: string): string {
  return line.replace(EMAIL_RE, ' ').replace(URL_RE, ' ').replace(PHONE_RE, ' ').replace(LABEL_RE, ' ')
    .replace(/^\s*(name|company|organisation|organization|title|job title|email|website|web|address)\s*[:|-]\s*/i, ' ')
    .replace(/[|•·]/g, ' ').replace(/\s+/g, ' ').replace(/^[\s,;:|.-]+|[\s,;:|.-]+$/g, '').trim();
}

export function extractContactFields(text: string): ParsedContact {
  const parsed = emptyParsedContact();
  parsed.phones = extractPhoneNumbers(text);
  parsed.email = extractEmails(text)[0] ?? '';
  parsed.website = extractWebsite(text);

  const rawLines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const cleaned = rawLines.map((line) => ({ raw: line, value: cleanLine(line) })).filter((line) => line.value.length > 1);
  const title = cleaned.find(({ value }) => TITLE_RE.test(value));
  if (title) parsed.jobTitle = title.value;
  const name = cleaned.find(({ raw, value }) => {
    if (value === title?.value || TITLE_RE.test(value) || COMPANY_RE.test(value)) return false;
    if (/\d|@|https?:/i.test(raw) || value.length > 42) return false;
    const words = value.split(/\s+/);
    return words.length >= 2 && words.length <= 4 && words.every((word) => /^[\p{L}'’-]+\.?$/u.test(word));
  });
  const company = cleaned.find(({ value }) => COMPANY_RE.test(value))
    ?? cleaned.find(({ raw, value }) => value !== name?.value && raw === raw.toUpperCase() && /[A-Z]/.test(raw) && value.length > 2);
  if (company) parsed.company = company.value;
  if (name) {
    parsed.fullName = name.value;
    const words = parsed.fullName.split(/\s+/);
    parsed.firstName = words[0] ?? '';
    parsed.lastName = words.slice(1).join(' ');
  }

  const address = cleaned.find(({ value }) => /\b(street|road|rd\.?|avenue|ave\.?|suite|floor|building|block|sector|pincode|postal|zip|district|city|state|india|usa|uk)\b/i.test(value) || /\b\d{5,6}\b/.test(value));
  if (address) parsed.address = address.value;
  return parsed;
}
