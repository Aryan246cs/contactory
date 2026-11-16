import { requestAiContactSuggestions } from './aiFieldSuggestions';

describe('AI field suggestion client', () => {
  const originalEndpoint = process.env.EXPO_PUBLIC_GROQ_SUGGESTION_URL;
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    if (originalEndpoint === undefined) delete process.env.EXPO_PUBLIC_GROQ_SUGGESTION_URL;
    else process.env.EXPO_PUBLIC_GROQ_SUGGESTION_URL = originalEndpoint;
    globalThis.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it('accepts suggestions only when values are backed by OCR evidence', async () => {
    process.env.EXPO_PUBLIC_GROQ_SUGGESTION_URL = 'https://worker.example/suggest';
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        full_name: { value: 'Yves Theriault', evidence: 'YVES THERIAULT, PHD, PMP', confidence: 'high' },
        company: { value: 'Made Up Company', evidence: 'YVES THERIAULT, PHD, PMP', confidence: 'high' },
        job_title: { value: '', evidence: '', confidence: 'low' },
        name_candidates: [{ value: 'Yves Theriault', evidence: 'YVES THERIAULT, PHD, PMP' }],
      }),
    }) as unknown as typeof fetch;

    const suggestions = await requestAiContactSuggestions('YVES THERIAULT, PHD, PMP');
    expect(suggestions.full_name.value).toBe('Yves Theriault');
    expect(suggestions.company).toMatchObject({ value: '', confidence: 'low' });
    expect(suggestions.name_candidates).toHaveLength(1);
    expect(globalThis.fetch).toHaveBeenCalledWith('https://worker.example/suggest', expect.objectContaining({ method: 'POST' }));
  });

  it('turns Worker DNS failures into a useful message and preserves local fallback', async () => {
    process.env.EXPO_PUBLIC_GROQ_SUGGESTION_URL = 'https://worker.example/suggest';
    globalThis.fetch = jest.fn().mockRejectedValue(new TypeError('fetch failed: java.net.UnknownHostException')) as unknown as typeof fetch;
    await expect(requestAiContactSuggestions('Alex Morgan\nNorthstar')).rejects.toThrow('Could not connect to the AI service. Check your internet connection and Worker URL.');
  });
});
