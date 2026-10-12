import { deduplicateValues, extractContactFields, extractEmails, extractPhoneNumbers, extractWebsite, normalizePhoneNumber } from './contactParser';

describe('contact card parser', () => {
  it('extracts a person, role, company, email, website and one phone', () => {
    const parsed = extractContactFields('Rahul Sharma\nProduct Manager\nACME TECHNOLOGIES\nMobile: +91 98765 43210\nrahul@acme.com\nwww.acme.com');
    expect(parsed.fullName).toBe('Rahul Sharma');
    expect(parsed.jobTitle).toBe('Product Manager');
    expect(parsed.company).toBe('ACME TECHNOLOGIES');
    expect(parsed.phones).toHaveLength(1);
    expect(parsed.phones[0].label).toBe('Mobile');
    expect(parsed.email).toBe('rahul@acme.com');
    expect(parsed.website).toBe('www.acme.com');
  });

  it('keeps multiple labeled numbers separate and selected for review', () => {
    const phones = extractPhoneNumbers('Mobile: +91 98765 43210\nOffice: +91 124 4567890');
    expect(phones.map((phone) => phone.label)).toEqual(['Mobile', 'Office']);
    expect(phones.map((phone) => phone.selected)).toEqual([true, true]);
  });

  it('normalizes international values and removes duplicate phone and email values', () => {
    expect(normalizePhoneNumber('+91 (98765) 43210')).toBe('+919876543210');
    expect(extractPhoneNumbers('+1 415-555-0134\n+1 (415) 555-0134')).toHaveLength(1);
    expect(extractEmails('a@sample.com\na@sample.com')).toEqual(['a@sample.com']);
    expect(deduplicateValues(['ACME', 'Acme', 'Contactory'])).toEqual(['ACME', 'Contactory']);
  });

  it('handles website-only and sparse cards without fabricating missing values', () => {
    expect(extractWebsite('https://contactory.app/about')).toBe('https://contactory.app/about');
    expect(extractContactFields('')).toMatchObject({ fullName: '', company: '', email: '', phones: [] });
    expect(extractContactFields('Contact\n+1 202 555 0134').fullName).toBe('');
  });

  it('extracts a postal line when available', () => {
    expect(extractContactFields('Mina Patel\nmina@example.com\n22 Park Street, Mumbai 400001').address).toContain('Mumbai');
  });
});
