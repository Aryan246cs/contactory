import worker from './index';

const cardText = 'SASIDHARAN. B\nChief Operations Officer\nACCURATE PRODUCTS CORPORATION PRIVATE LTD.';

function modelResponse(fullName = 'SASIDHARAN. B') {
  return {
    full_name: { value: fullName, evidence: 'SASIDHARAN. B', confidence: 'high' },
    company: { value: 'ACCURATE PRODUCTS CORPORATION PRIVATE LTD', evidence: 'ACCURATE PRODUCTS CORPORATION PRIVATE LTD.', confidence: 'high' },
    job_title: { value: 'Chief Operations Officer', evidence: 'Chief Operations Officer', confidence: 'high' },
    name_candidates: [{ value: 'SASIDHARAN. B', evidence: 'SASIDHARAN. B' }],
  };
}

describe('Groq field suggestion proxy', () => {
  const originalFetch = globalThis.fetch;
  afterEach(() => { globalThis.fetch = originalFetch; jest.restoreAllMocks(); });

  it('returns strict structured suggestions after checking values against OCR evidence', async () => {
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ choices: [{ message: { content: JSON.stringify(modelResponse()) } }] }),
    }) as unknown as typeof fetch;
    const limiter = { limit: jest.fn().mockResolvedValue({ success: true }) };
    const request = new Request('https://worker.test/suggest', { method: 'POST', headers: { 'content-type': 'application/json', 'cf-connecting-ip': '127.0.0.1' }, body: JSON.stringify({ text: cardText }) });
    const response = await worker.fetch(request, { GROQ_API_KEY: 'test-only', AI_RATE_LIMITER: limiter });
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      full_name: { value: 'SASIDHARAN. B' },
      company: { value: 'ACCURATE PRODUCTS CORPORATION PRIVATE LTD' },
      job_title: { value: 'Chief Operations Officer' },
    });
  });

  it('drops a model value that has no support in the card text', async () => {
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ choices: [{ message: { content: JSON.stringify(modelResponse('Made Up Person')) } }] }),
    }) as unknown as typeof fetch;
    const request = new Request('https://worker.test/suggest', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ text: cardText }) });
    const response = await worker.fetch(request, { GROQ_API_KEY: 'test-only', AI_RATE_LIMITER: { limit: async () => ({ success: true }) } });
    const body = await response.json() as { full_name: { value: string; confidence: string } };
    expect(body.full_name).toEqual({ value: '', evidence: '', confidence: 'low' });
  });
});
