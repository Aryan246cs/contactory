import type { ParsedContact, ParsedPhone } from '@/types/contact';
import { emptyParsedContact } from '@/types/contact';

const EMAIL_RE = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const URL_RE = /(?:https?:\/\/)?(?:www\.)?[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9-]+)*\.(?:com|org|net|io|co|in|ai|app|biz|info|edu|gov|me|tech|design|studio)(?:\/[\w./?%&=+#-]*)?/gi;
const PHONE_RE = /(?<!\w)\+?\d[\d\s()./-]{5,}\d(?!\w)/g;
const LABEL_RE = /\b(mobile|mob|cell|phone|tel|telephone|office|work|direct|fax|home|main)\b/i;
const TITLE_RE = /\b(ceo|cto|cfo|coo|founder|co-founder|director|manager|president|vice president|vp|engineer|designer|consultant|developer|lead|head(?:\s+of)?|product|sales|marketing|finance|officer|partner|professor|owner|architect|analyst|specialist|executive|accountant|controller|human resources|hr|operations|technical|scientist|attorney|lawyer|doctor|nurse|realtor|broker|intern|advisor|associate|administrator|coordinator|representative)\b/i;
const COMPANY_RE = /\b(inc\.?|llc|ltd\.?|limited|corp\.?|corporation|technologies|technology|solutions|studio|labs|group|company|co\.|systems|partners|ventures|digital|services)\b/i;
const GENERIC_EMAIL_HOSTS = new Set(['gmail', 'googlemail', 'yahoo', 'outlook', 'hotmail', 'live', 'icloud', 'me', 'aol', 'protonmail', 'proton', 'rediffmail']);

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
      const value = match[0].trim().replace(/[()[\]{}]/g, '').replace(/[.,;:]+$/, '');
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

type ParserBlock = { text: string; boundingBox?: { x: number; y: number; width: number; height: number } };

function fieldLabel(raw: string, field: 'name' | 'company' | 'title' | 'address'): boolean {
  const labels = { name: /^(?:full\s+)?name\s*[:|-]/i, company: /^(?:company|organization|organisation|employer)\s*[:|-]/i, title: /^(?:job\s+)?title\s*[:|-]/i, address: /^address\s*[:|-]/i };
  return labels[field].test(raw.trim());
}

function normalizedText(value: string): string { return value.toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim(); }

function blockForLine(raw: string, blocks: ParserBlock[]) {
  const key = normalizedText(raw);
  if (!key) return undefined;
  return blocks.find((block) => {
    const blockKey = normalizedText(block.text);
    // The wrapper exposes block-level boxes, not line boxes. Only attach a box
    // when it uniquely describes this line; otherwise several lines may inherit
    // one large paragraph rectangle and produce misleading spatial scores.
    return blockKey === key;
  })?.boundingBox;
}

export function extractContactFields(text: string, blocks: ParserBlock[] = []): ParsedContact {
  const parsed = emptyParsedContact();
  parsed.phones = extractPhoneNumbers(text);
  parsed.email = extractEmails(text)[0] ?? '';
  parsed.website = extractWebsite(text);
  const emailHost = (parsed.email.split('@')[1] ?? parsed.website.replace(/^https?:\/\/(www\.)?/i, '').split('/')[0] ?? '').split('.')[0]?.toLowerCase() ?? '';
  const emailLocal = (parsed.email.split('@')[0] ?? '').toLowerCase().replace(/[^a-z\p{L}]+/giu, ' ');

  const rawLines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const cleaned = rawLines.map((line) => ({ raw: line, value: cleanLine(line), box: blockForLine(line, blocks) })).filter((line) => line.value.length > 1);
  const titleIndex = cleaned.findIndex(({ value }) => TITLE_RE.test(value));
  const title = titleIndex >= 0 ? cleaned[titleIndex] : undefined;
  if (title) parsed.jobTitle = title.value;
  const candidates = cleaned.map((line, index) => ({ ...line, index })).filter(({ raw, value }) => {
    if (TITLE_RE.test(value) || COMPANY_RE.test(value)) return false;
    if (/\d|@|https?:/i.test(raw) || value.length > 42) return false;
    const words = value.split(/\s+/);
    return words.length >= 2 && words.length <= 4 && words.every((word) => /^[\p{L}'’-]+\.?$/u.test(word));
  });
  // Names are usually in mixed/title case and close to the role line. Large logo
  // wordmarks are commonly uppercase, so avoid treating those as a person's name.
  const nameCandidate = candidates
    .map((candidate) => {
      const uppercase = candidate.raw === candidate.raw.toUpperCase() && /[A-Z]/.test(candidate.raw);
      const titleDistance = titleIndex < 0 ? 0 : Math.abs(candidate.index - titleIndex);
      const labeledName = fieldLabel(candidate.raw, 'name');
      const tokens = candidate.value.toLowerCase().split(/[^\p{L}]+/u).filter((token) => token.length > 1);
      const emailSupportsName = tokens.some((token) => token.length >= 3 && emailLocal.includes(token));
      const domainSupportsCompany = emailHost.length >= 3 && candidate.value.toLowerCase().includes(emailHost);
      let spatialPenalty = 0;
      if (candidate.box && title?.box) {
        const cardWidth = Math.max(...blocks.map((block) => (block.boundingBox?.x ?? 0) + (block.boundingBox?.width ?? 0)), 1);
        const cardHeight = Math.max(...blocks.map((block) => (block.boundingBox?.y ?? 0) + (block.boundingBox?.height ?? 0)), 1);
        const dx = (candidate.box.x + candidate.box.width / 2 - title.box.x - title.box.width / 2) / cardWidth;
        const dy = (candidate.box.y + candidate.box.height / 2 - title.box.y - title.box.height / 2) / cardHeight;
        spatialPenalty = Math.min(4, Math.hypot(dx, dy) * 5);
      }
      return { ...candidate, score: (labeledName ? 12 : uppercase ? (titleDistance <= 1 || emailSupportsName ? 3 : -5) : 3) - titleDistance * 1.5 - spatialPenalty + (emailSupportsName ? 4 : 0) - (domainSupportsCompany ? 8 : 0) + (candidate.value.split(/\s+/).length === 2 ? 1 : 0) };
    })
    .sort((a, b) => b.score - a.score)[0];
  const name = nameCandidate && nameCandidate.score > 0 ? nameCandidate : undefined;
  const labeledCompanyIndex = cleaned.findIndex(({ raw }) => fieldLabel(raw, 'company'));
  const companyIndex = cleaned.findIndex(({ value }) => COMPANY_RE.test(value));
  let company = labeledCompanyIndex >= 0 ? cleaned[labeledCompanyIndex].value : companyIndex >= 0 ? cleaned[companyIndex].value : '';
  if (!company) {
    company = cleaned.find(({ raw, value }) => value !== name?.value && raw === raw.toUpperCase() && /[A-Z]/.test(raw) && value.length > 2)?.value ?? '';
  }
  // Brand names are often split across OCR lines, e.g. "aviato" + "TECHNOLOGIES".
  // Join a short adjacent brand word when the line carrying the company suffix is found.
  const suffixIndex = companyIndex >= 0 ? companyIndex : labeledCompanyIndex;
  if (suffixIndex > 0) {
    const previous = cleaned[suffixIndex - 1];
    const previousWords = previous.value.split(/\s+/);
    if (previous.value !== name?.value && previousWords.length <= 2 && previous.value.length <= 22 && !TITLE_RE.test(previous.value) && !/\d|@/.test(previous.raw)) {
      company = `${previous.value} ${company}`;
    }
  }
  if (!company) {
    const host = emailHost;
    if (host && !GENERIC_EMAIL_HOSTS.has(host) && !/^(info|contact|hello|mail|support|sales|admin|www)$/.test(host)) company = host[0].toUpperCase() + host.slice(1);
  }
  if (company && !/\b[A-Z0-9.-]+\.(?:com|org|net|io|co|in|ai|app|biz|info|tech|studio)\b/i.test(company)) {
    const host = emailHost;
    if (host && !GENERIC_EMAIL_HOSTS.has(host) && !company.toLowerCase().includes(host) && COMPANY_RE.test(company)) company = `${host[0].toUpperCase()}${host.slice(1)} ${company}`;
  }
  if (company) parsed.company = company;
  if (name) {
    parsed.fullName = name.value;
    const words = parsed.fullName.split(/\s+/);
    parsed.firstName = words[0] ?? '';
    parsed.lastName = words.slice(1).join(' ');
  }

  const addressIndex = cleaned.findIndex(({ value, raw }) => fieldLabel(raw, 'address') || /\b(street|road|rd\.?|avenue|ave\.?|suite|floor|building|block|sector|pincode|postal|zip|district|city|state|india|usa|uk|telangana|maharashtra|karnataka|delhi|mumbai|hyderabad|chennai|bengaluru)\b/i.test(value) || /\b\d{5,6}\b/.test(value));
  if (addressIndex >= 0) {
    const parts = [cleaned[addressIndex].value];
    for (let i = addressIndex + 1; i < cleaned.length; i++) {
      const next = cleaned[i];
      if (TITLE_RE.test(next.value) || COMPANY_RE.test(next.value) || next.value === name?.value || /@|https?:|\+?\d[\d\s()./-]{6,}/.test(next.raw)) break;
      if (next.value.length > 70 || /^[A-Z][a-z]+ [A-Z][a-z]+$/.test(next.value)) break;
      if (/\d|,|\b(india|usa|uk|telangana|maharashtra|karnataka|delhi|mumbai|hyderabad|chennai|bengaluru)\b/i.test(next.value)) parts.push(next.value);
      else break;
    }
    parsed.address = parts.join(', ');
  }
  return parsed;
}
