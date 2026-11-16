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
    expect(deduplicateValues(['ACME', 'Acme', 'Vemori'])).toEqual(['ACME', 'Vemori']);
  });

  it('removes brackets from recognized phone numbers while preserving readable separators', () => {
    expect(extractPhoneNumbers('Phone: +91 (22) 6718 (6718)')[0].value).toBe('+91 22 6718 6718');
  });

  it('handles website-only and sparse cards without fabricating missing values', () => {
    expect(extractWebsite('https://example.com/about')).toBe('https://example.com/about');
    expect(extractContactFields('')).toMatchObject({ fullName: '', company: '', email: '', phones: [] });
    expect(extractContactFields('Contact\n+1 202 555 0134').fullName).toBe('');
  });

  it('extracts a postal line when available', () => {
    expect(extractContactFields('Mina Patel\nmina@example.com\n22 Park Street, Mumbai 400001').address).toContain('Mumbai');
  });

  it('separates an uppercase person name, role, and split brand wordmark', () => {
    const parsed = extractContactFields('aviato\nTECHNOLOGIES\nGHANSHYAM VAZE\nHead- Finance\nGhanshyam@aviato.org');
    expect(parsed.fullName).toBe('GHANSHYAM VAZE');
    expect(parsed.jobTitle).toBe('Head- Finance');
    expect(parsed.company).toBe('aviato TECHNOLOGIES');
  });

  it('uses explicit labels and domain clues without assuming every uppercase line is a company', () => {
    const parsed = extractContactFields('NAME: ALEX MORGAN\nTITLE: Regional Director\nCOMPANY: Northstar\nalex@northstar.example');
    expect(parsed.fullName).toBe('ALEX MORGAN');
    expect(parsed.jobTitle).toBe('Regional Director');
    expect(parsed.company).toBe('Northstar');
  });

  it('uses OCR position to prefer the name beside the role over a distant uppercase logo', () => {
    const parsed = extractContactFields('NOVA GROUP\nJAMIE TAYLOR\nChief Executive Officer', [
      { text: 'NOVA GROUP', boundingBox: { x: 20, y: 10, width: 100, height: 20 } },
      { text: 'JAMIE TAYLOR', boundingBox: { x: 220, y: 180, width: 120, height: 20 } },
      { text: 'Chief Executive Officer', boundingBox: { x: 220, y: 210, width: 150, height: 20 } },
    ]);
    expect(parsed.fullName).toBe('JAMIE TAYLOR');
    expect(parsed.company).toBe('NOVA GROUP');
  });

  it('joins address lines while keeping contact lines out of the address', () => {
    const parsed = extractContactFields('Mina Patel\n22 Park Street, Suite 4\nMumbai 400001\nmina@example.com');
    expect(parsed.address).toBe('22 Park Street, Suite 4, Mumbai 400001');
  });

  it('leaves an ambiguous uppercase wordmark out of the name field', () => {
    const parsed = extractContactFields('NORTHSTAR VENTURES\nhello@northstar.example');
    expect(parsed.fullName).toBe('');
  });

  it('infers a company from a non-generic email domain when the card omits a company line', () => {
    expect(extractContactFields('Priya Shah\nFounder\npriya@orbitlabs.com').company).toBe('Orbitlabs');
  });

  it('strips credentials and honorifics from names and prefers the legal company name', () => {
    const accurate = extractContactFields([
      'AAccurate GROZ', 'A GROZ GROUP COMPANY', 'SASIDHARAN. B', 'Chief Operations Officer',
      'ACCURATE PRODUCTS CORPORATION PRIVATE LTD.', 'AC-22A, AC24 & AC-25A, SIDCO Industrial Estate',
      'Thirumudivakkam, Chennai - 600132, India', 'Mobile: +91 89398 79969',
      'Email: sasidharan.balasubramani@accurateproducts.com',
    ].join('\n'));
    expect(accurate.fullName).toBe('SASIDHARAN. B');
    expect(accurate.company).toBe('ACCURATE PRODUCTS CORPORATION PRIVATE LTD');
    expect(accurate.jobTitle).toBe('Chief Operations Officer');

    const yves = extractContactFields('YVES THERIAULT, PHD, PMP\nChief Catalyst for Innovation & Entrepreneurship\nQualcomm Institute\nUniversity of California San Diego\nytheriault@ucsd.edu');
    expect(yves.fullName).toBe('YVES THERIAULT');
    expect(yves.jobTitle).toContain('Chief Catalyst');

    const santhakumar = extractContactFields('Dr. J. SANTHAKUMAR, M.E., Ph.D.\nAssociate Professor\nDepartment of Mechanical Engineering\nSRM Institute of Science & Technology');
    expect(santhakumar.fullName).toBe('J. SANTHAKUMAR');

    const gosink = extractContactFields('UC San Diego\nEric Gosink, PhD\nInnovation & Commercialization Manager\nOffice of Innovation and Commercialization\negosink@ucsd.edu');
    expect(gosink.fullName).toBe('Eric Gosink');
    expect(gosink.company).toBe('Office of Innovation and Commercialization');

    const ramesh = extractContactFields('UNIVERSITY OF CALIFORNIA SAN DIEGO\nRamesh Rao, Ph.D.\nDirector: Qualcomm Institute | Calit2\nDistinguished Prof: Electrical & Computer Eng\nrrao@ucsd.edu');
    expect(ramesh.fullName).toBe('Ramesh Rao');
    expect(ramesh.company).toBe('UNIVERSITY OF CALIFORNIA SAN DIEGO');
  });

  it('keeps multiple people as review choices without treating slogans as names', () => {
    const parsed = extractContactFields([
      'Pradeep Yadav 7891185212', 'Ashish Yadav 9467054585', 'SHRI MARUTI PROPERTIES',
      'Deals In: All Types of Industrial Properties', 'Buy | Sell | Lease', 'Construction',
      'Head Office : 1st & 3rd Floor, Saraswati Tower, Abhay Singh Chowk', 'Near Om Juice, Rewari (Hr.)',
    ].join('\n'));
    expect(parsed.fullName).toBe('Pradeep Yadav');
    expect(parsed.company).toBe('SHRI MARUTI PROPERTIES');
    expect(parsed.jobTitle).toBe('');
    expect(parsed.nameCandidates).toEqual(['Pradeep Yadav', 'Ashish Yadav']);
  });
});
