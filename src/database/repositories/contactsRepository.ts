import { initializeDatabase } from '@/database/database';
import type { ContactDraft, ContactRecord } from '@/types/contact';

type ContactRow = {
  id: string; full_name: string; first_name: string | null; last_name: string | null;
  company: string | null; job_title: string | null; email: string | null; website: string | null;
  address: string | null; native_contact_id: string | null; created_at: string; updated_at: string;
};
type PhoneRow = { id: string; phone_number: string; label: string | null; is_primary: number };
type NoteRow = { id: string; content: string; meeting_date: string | null; location: string | null; created_at: string };
type TagRow = { id: string; name: string; kind: string };

function makeId() { return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`; }
function asContact(row: ContactRow, phones: PhoneRow[], notes: NoteRow[], tags: TagRow[] = []): ContactRecord {
  return {
    id: row.id, nativeContactId: row.native_contact_id, fullName: row.full_name, firstName: row.first_name ?? '', lastName: row.last_name ?? '',
    company: row.company ?? '', jobTitle: row.job_title ?? '', email: row.email ?? '',
    website: row.website ?? '', address: row.address ?? '',
    phones: phones.map((p) => ({ id: p.id, value: p.phone_number, label: p.label ?? 'Phone', isPrimary: p.is_primary === 1 })),
    notes: notes.map((n) => ({ id: n.id, content: n.content, meetingDate: n.meeting_date, location: n.location, createdAt: n.created_at })),
    tags,
    createdAt: row.created_at, updatedAt: row.updated_at,
  };
}

export async function saveContact(draft: ContactDraft, existingId?: string): Promise<string> {
  const db = await initializeDatabase();
  const id = existingId ?? makeId();
  const now = new Date().toISOString();
  const phones = draft.phones.filter((phone) => phone.selected && phone.value.trim());

  await db.withTransactionAsync(async () => {
    if (existingId) {
      await db.runAsync(
        `UPDATE contacts SET full_name=?, first_name=?, last_name=?, company=?, job_title=?, email=?, website=?, address=?, updated_at=? WHERE id=?`,
        draft.fullName.trim(), draft.firstName.trim() || null, draft.lastName.trim() || null,
        draft.company.trim() || null, draft.jobTitle.trim() || null, draft.email.trim() || null,
        draft.website.trim() || null, draft.address.trim() || null, now, id,
      );
      await db.runAsync('DELETE FROM contact_phones WHERE contact_id=?', id);
    } else {
      await db.runAsync(
        `INSERT INTO contacts (id, full_name, first_name, last_name, company, job_title, email, website, address, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        id, draft.fullName.trim(), draft.firstName.trim() || null, draft.lastName.trim() || null,
        draft.company.trim() || null, draft.jobTitle.trim() || null, draft.email.trim() || null,
        draft.website.trim() || null, draft.address.trim() || null, now, now,
      );
    }
    for (let index = 0; index < phones.length; index += 1) {
      const phone = phones[index];
      await db.runAsync(
        'INSERT INTO contact_phones (id, contact_id, phone_number, label, is_primary, created_at) VALUES (?, ?, ?, ?, ?, ?)',
        makeId(), id, phone.value.trim(), phone.label.trim() || null, index === 0 ? 1 : 0, now,
      );
    }

    const existingNote = existingId ? await db.getFirstAsync<{ id: string }>(
      'SELECT id FROM contact_notes WHERE contact_id=? ORDER BY created_at LIMIT 1', id,
    ) : null;
    const noteContent = draft.note.trim();
    if (noteContent || draft.location.trim() || draft.meetingDate.trim()) {
      if (existingNote) {
        await db.runAsync('UPDATE contact_notes SET content=?, meeting_date=?, location=?, updated_at=? WHERE id=?',
          noteContent, draft.meetingDate || null, draft.location.trim() || null, now, existingNote.id);
      } else {
        await db.runAsync('INSERT INTO contact_notes (id, contact_id, content, meeting_date, location, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
          makeId(), id, noteContent, draft.meetingDate || null, draft.location.trim() || null, now, now);
      }
    } else if (existingNote) {
      await db.runAsync('DELETE FROM contact_notes WHERE id=?', existingNote.id);
    }
  });
  return id;
}

export async function getContactById(id: string): Promise<ContactRecord | null> {
  const db = await initializeDatabase();
  const row = await db.getFirstAsync<ContactRow>('SELECT * FROM contacts WHERE id=?', id);
  if (!row) return null;
  const [phones, notes, tags] = await Promise.all([
    db.getAllAsync<PhoneRow>('SELECT id, phone_number, label, is_primary FROM contact_phones WHERE contact_id=? ORDER BY is_primary DESC, created_at', id),
    db.getAllAsync<NoteRow>('SELECT id, content, meeting_date, location, created_at FROM contact_notes WHERE contact_id=? ORDER BY created_at DESC', id),
    db.getAllAsync<TagRow>('SELECT t.id, t.name, t.kind FROM tags t JOIN contact_tags ct ON ct.tag_id=t.id WHERE ct.contact_id=? ORDER BY t.name COLLATE NOCASE', id),
  ]);
  return asContact(row, phones, notes, tags);
}

export async function listContacts(): Promise<ContactRecord[]> {
  const db = await initializeDatabase();
  const rows = await db.getAllAsync<ContactRow>(`SELECT * FROM contacts ORDER BY full_name COLLATE NOCASE, created_at DESC`);
  return Promise.all(rows.map(async (row) => {
    const [phones, notes, tags] = await Promise.all([
      db.getAllAsync<PhoneRow>('SELECT id, phone_number, label, is_primary FROM contact_phones WHERE contact_id=? ORDER BY is_primary DESC, created_at', row.id),
      db.getAllAsync<NoteRow>('SELECT id, content, meeting_date, location, created_at FROM contact_notes WHERE contact_id=? ORDER BY created_at DESC', row.id),
      db.getAllAsync<TagRow>('SELECT t.id, t.name, t.kind FROM tags t JOIN contact_tags ct ON ct.tag_id=t.id WHERE ct.contact_id=? ORDER BY t.name COLLATE NOCASE', row.id),
    ]);
    return asContact(row, phones, notes, tags);
  }));
}

export async function searchContacts(query: string): Promise<ContactRecord[]> {
  const term = `%${query.trim()}%`;
  if (query.trim().length === 0) return listContacts();
  const db = await initializeDatabase();
  const rows = await db.getAllAsync<ContactRow>(`
    SELECT DISTINCT c.* FROM contacts c
    LEFT JOIN contact_phones p ON p.contact_id = c.id
    LEFT JOIN contact_notes n ON n.contact_id = c.id
    WHERE c.full_name LIKE ? COLLATE NOCASE OR c.company LIKE ? COLLATE NOCASE
      OR c.job_title LIKE ? COLLATE NOCASE OR c.email LIKE ? COLLATE NOCASE
      OR c.website LIKE ? COLLATE NOCASE OR c.address LIKE ? COLLATE NOCASE
      OR p.phone_number LIKE ? OR n.content LIKE ? COLLATE NOCASE OR n.location LIKE ? COLLATE NOCASE
    ORDER BY c.full_name COLLATE NOCASE`,
    term, term, term, term, term, term, term, term, term,
  );
  return Promise.all(rows.map(async (row) => {
    const [phones, notes, tags] = await Promise.all([
      db.getAllAsync<PhoneRow>('SELECT id, phone_number, label, is_primary FROM contact_phones WHERE contact_id=? ORDER BY is_primary DESC, created_at', row.id),
      db.getAllAsync<NoteRow>('SELECT id, content, meeting_date, location, created_at FROM contact_notes WHERE contact_id=? ORDER BY created_at DESC', row.id),
      db.getAllAsync<TagRow>('SELECT t.id, t.name, t.kind FROM tags t JOIN contact_tags ct ON ct.tag_id=t.id WHERE ct.contact_id=? ORDER BY t.name COLLATE NOCASE', row.id),
    ]);
    return asContact(row, phones, notes, tags);
  }));
}

export async function findPotentialDuplicate(email: string, phones: string[], exceptId?: string): Promise<ContactRecord | null> {
  const db = await initializeDatabase();
  if (email.trim()) {
    const row = await db.getFirstAsync<ContactRow>(`SELECT * FROM contacts WHERE LOWER(email)=? ${exceptId ? 'AND id<>?' : ''} LIMIT 1`,
      ...(exceptId ? [email.trim().toLowerCase(), exceptId] : [email.trim().toLowerCase()]));
    if (row) return getContactById(row.id);
  }
  for (const phone of phones) {
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 8) continue;
    const row = await db.getFirstAsync<ContactRow>(`
      SELECT DISTINCT c.* FROM contacts c JOIN contact_phones p ON p.contact_id=c.id
      WHERE REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(p.phone_number, '+', ''), ' ', ''), '-', ''), '(', ''), ')', ''), '.', '') LIKE ?
      ${exceptId ? 'AND c.id<>?' : ''} LIMIT 1`,
      ...(exceptId ? [`%${digits.slice(-8)}`, exceptId] : [`%${digits.slice(-8)}`]));
    if (row) return getContactById(row.id);
  }
  return null;
}

export async function deleteContact(id: string): Promise<void> {
  const db = await initializeDatabase();
  await db.runAsync('DELETE FROM contacts WHERE id=?', id);
}

export async function setNativeContactId(id: string, nativeId: string): Promise<void> {
  const db = await initializeDatabase();
  await db.runAsync('UPDATE contacts SET native_contact_id=?, updated_at=? WHERE id=?', nativeId, new Date().toISOString(), id);
}

export async function getAllContactsForExport(): Promise<ContactRecord[]> { return listContacts(); }

export async function deleteAllLocalData(): Promise<void> {
  const db = await initializeDatabase();
  await db.withTransactionAsync(async () => {
    await db.execAsync("DELETE FROM contact_tags; DELETE FROM contact_notes; DELETE FROM contact_phones; DELETE FROM contacts; DELETE FROM tags WHERE kind='custom';");
  });
}

export async function listTags(): Promise<TagRow[]> {
  const db = await initializeDatabase();
  return db.getAllAsync<TagRow>('SELECT id, name, kind FROM tags ORDER BY CASE kind WHEN \'suggested\' THEN 0 ELSE 1 END, name COLLATE NOCASE');
}

export async function createTag(name: string): Promise<TagRow> {
  const clean = name.trim().replace(/\s+/g, ' ');
  if (!clean || clean.length > 32) throw new Error('Tag names must be between 1 and 32 characters.');
  const db = await initializeDatabase();
  const existing = await db.getFirstAsync<TagRow>('SELECT id, name, kind FROM tags WHERE name=? COLLATE NOCASE', clean);
  if (existing) return existing;
  const tag = { id: makeId(), name: clean, kind: 'custom' };
  await db.runAsync('INSERT INTO tags (id, name, kind, created_at) VALUES (?, ?, ?, ?)', tag.id, tag.name, tag.kind, new Date().toISOString());
  return tag;
}

export async function setContactTags(contactId: string, tagIds: string[]): Promise<void> {
  const db = await initializeDatabase(); const now = new Date().toISOString();
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM contact_tags WHERE contact_id=?', contactId);
    for (const tagId of [...new Set(tagIds)]) await db.runAsync('INSERT OR IGNORE INTO contact_tags (contact_id, tag_id, created_at) VALUES (?, ?, ?)', contactId, tagId, now);
  });
}

export async function listContactsByTag(tagId: string): Promise<ContactRecord[]> {
  const db = await initializeDatabase();
  const rows = await db.getAllAsync<ContactRow>('SELECT c.* FROM contacts c JOIN contact_tags ct ON ct.contact_id=c.id WHERE ct.tag_id=? ORDER BY c.full_name COLLATE NOCASE', tagId);
  return Promise.all(rows.map(async (row) => {
    const [phones, notes, tags] = await Promise.all([
      db.getAllAsync<PhoneRow>('SELECT id, phone_number, label, is_primary FROM contact_phones WHERE contact_id=? ORDER BY is_primary DESC, created_at', row.id),
      db.getAllAsync<NoteRow>('SELECT id, content, meeting_date, location, created_at FROM contact_notes WHERE contact_id=? ORDER BY created_at DESC', row.id),
      db.getAllAsync<TagRow>('SELECT t.id, t.name, t.kind FROM tags t JOIN contact_tags ct ON ct.tag_id=t.id WHERE ct.contact_id=? ORDER BY t.name COLLATE NOCASE', row.id),
    ]);
    return asContact(row, phones, notes, tags);
  }));
}

export async function findDuplicateGroups(): Promise<Array<[ContactRecord, ContactRecord]>> {
  const contacts = await listContacts(); const pairs: Array<[ContactRecord, ContactRecord]> = []; const byId = new Map(contacts.map((contact) => [contact.id, contact]));
  const firstByKey = new Map<string, string>(); const seen = new Set<string>();
  for (const contact of contacts) {
    const keys = [contact.email.trim().toLowerCase() ? `e:${contact.email.trim().toLowerCase()}` : '', ...contact.phones.map((phone) => {
      const digits = phone.value.replace(/\D/g, '').slice(-8); return digits.length === 8 ? `p:${digits}` : '';
    })].filter(Boolean);
    for (const key of keys) {
      const firstId = firstByKey.get(key);
      if (!firstId) { firstByKey.set(key, contact.id); continue; }
      if (firstId === contact.id) continue;
      const pairKey = [firstId, contact.id].sort().join(':');
      if (!seen.has(pairKey)) { seen.add(pairKey); pairs.push([byId.get(firstId)!, contact]); }
    }
  }
  return pairs;
}

export async function mergeContacts(keepId: string, mergeId: string): Promise<void> {
  const db = await initializeDatabase(); const now = new Date().toISOString();
  await db.withTransactionAsync(async () => {
    const keep = await db.getFirstAsync<ContactRow>('SELECT * FROM contacts WHERE id=?', keepId);
    const other = await db.getFirstAsync<ContactRow>('SELECT * FROM contacts WHERE id=?', mergeId);
    if (!keep || !other) throw new Error('One of these contacts no longer exists.');
    const fields = ['full_name','first_name','last_name','company','job_title','email','website','address'] as const;
    const cols = ['full_name','first_name','last_name','company','job_title','email','website','address'];
    const chosen = fields.map((key) => keep[key] || other[key]);
    await db.runAsync(`UPDATE contacts SET ${cols.map((c) => `${c}=?`).join(', ')}, native_contact_id=COALESCE(native_contact_id, ?), updated_at=? WHERE id=?`, ...chosen, other.native_contact_id, now, keepId);
    const existingPhones = await db.getAllAsync<{ phone_number: string }>('SELECT phone_number FROM contact_phones WHERE contact_id=?', keepId);
    const normalized = new Set(existingPhones.map((p) => p.phone_number.replace(/\D/g, '')));
    const incoming = await db.getAllAsync<PhoneRow>('SELECT id, phone_number, label, is_primary FROM contact_phones WHERE contact_id=?', mergeId);
    for (const phone of incoming) if (!normalized.has(phone.phone_number.replace(/\D/g, ''))) {
      await db.runAsync('UPDATE contact_phones SET contact_id=? WHERE id=?', keepId, phone.id);
      normalized.add(phone.phone_number.replace(/\D/g, ''));
    } else await db.runAsync('DELETE FROM contact_phones WHERE id=?', phone.id);
    await db.runAsync('UPDATE contact_notes SET contact_id=?, updated_at=? WHERE contact_id=?', keepId, now, mergeId);
    await db.runAsync('INSERT OR IGNORE INTO contact_tags (contact_id, tag_id, created_at) SELECT ?, tag_id, ? FROM contact_tags WHERE contact_id=?', keepId, now, mergeId);
    await db.runAsync('DELETE FROM contacts WHERE id=?', mergeId);
  });
}
