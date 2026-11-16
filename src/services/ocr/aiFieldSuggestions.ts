export type AiFieldSuggestion = { value: string; evidence: string; confidence: 'high' | 'medium' | 'low' };
export type AiContactSuggestions = {
  full_name: AiFieldSuggestion;
  company: AiFieldSuggestion;
  job_title: AiFieldSuggestion;
  name_candidates: Array<{ value: string; evidence: string }>;
};

export function isAiSuggestionsConfigured(): boolean {
  return Boolean(process.env.EXPO_PUBLIC_GROQ_SUGGESTION_URL?.trim());
}

function isField(value: unknown): value is AiFieldSuggestion {
  if (!value || typeof value !== 'object') return false;
  const field = value as Partial<AiFieldSuggestion>;
  return typeof field.value === 'string' && typeof field.evidence === 'string'
    && (field.confidence === 'high' || field.confidence === 'medium' || field.confidence === 'low');
}

function normalize(value: string): string {
  return value.toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
}

function sanitizeField(field: AiFieldSuggestion, sourceText: string): AiFieldSuggestion {
  if (!field.value.trim()) return { value: '', evidence: '', confidence: 'low' };
  const evidence = field.evidence.trim();
  const supported = evidence && sourceText.toLocaleLowerCase().includes(evidence.toLocaleLowerCase())
    && normalize(evidence).includes(normalize(field.value));
  return supported ? { ...field, value: field.value.trim(), evidence } : { value: '', evidence: '', confidence: 'low' };
}

export async function requestAiContactSuggestions(text: string): Promise<AiContactSuggestions> {
  const endpoint = process.env.EXPO_PUBLIC_GROQ_SUGGESTION_URL?.trim();
  if (!endpoint) throw new Error('AI suggestions are not configured for this build.');
  if (!text.trim()) throw new Error('There is no recognized card text to review.');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25000);
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ text: text.slice(0, 12000) }),
      signal: controller.signal,
    });
    const payload = await response.json() as Partial<AiContactSuggestions> & { error?: string };
    if (!response.ok) throw new Error(payload.error || 'AI suggestions are temporarily unavailable.');
    if (!isField(payload.full_name) || !isField(payload.company) || !isField(payload.job_title) || !Array.isArray(payload.name_candidates)) {
      throw new Error('AI returned suggestions in an unexpected format. Your local results are unchanged.');
    }
    const candidates = payload.name_candidates.flatMap((item) => {
      if (!item || typeof item.value !== 'string' || typeof item.evidence !== 'string') return [];
      const evidence = item.evidence.trim();
      if (!evidence || !text.toLocaleLowerCase().includes(evidence.toLocaleLowerCase()) || !normalize(evidence).includes(normalize(item.value))) return [];
      return [{ value: item.value.trim(), evidence }];
    }).slice(0, 5);
    return {
      full_name: sanitizeField(payload.full_name, text),
      company: sanitizeField(payload.company, text),
      job_title: sanitizeField(payload.job_title, text),
      name_candidates: candidates,
    };
  } catch (error) {
    if (controller.signal.aborted) throw new Error('The AI request timed out. Your local suggestions are still available.');
    if (error instanceof Error && /fetch|network|unknownhost|unable to resolve|connection/i.test(error.message)) {
      throw new Error('Could not connect to the AI service. Check your internet connection and Worker URL.');
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
