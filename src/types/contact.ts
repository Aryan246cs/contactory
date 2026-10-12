export type ParsedPhone = {
  value: string;
  label: string;
  selected: boolean;
};

export type ParsedContact = {
  fullName: string;
  firstName: string;
  lastName: string;
  company: string;
  jobTitle: string;
  email: string;
  website: string;
  address: string;
  phones: ParsedPhone[];
};

export type ContactDraft = Omit<ParsedContact, 'phones'> & {
  phones: Array<{ value: string; label: string; selected: boolean }>;
  note: string;
  meetingDate: string;
  location: string;
  rawOcrText?: string;
  imagePath?: string;
};

export type ContactRecord = Omit<ParsedContact, 'phones'> & {
  id: string;
  nativeContactId: string | null;
  phones: Array<{ id: string; value: string; label: string; isPrimary: boolean }>;
  notes: Array<{ id: string; content: string; meetingDate: string | null; location: string | null; createdAt: string }>;
  createdAt: string;
  updatedAt: string;
};

export function emptyParsedContact(): ParsedContact {
  return { fullName: '', firstName: '', lastName: '', company: '', jobTitle: '', email: '', website: '', address: '', phones: [] };
}
