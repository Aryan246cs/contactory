import { initializeDatabase } from '@/database/database';
import { deleteContact, getContactById, saveContact, searchContacts } from './contactsRepository';
import type { ContactDraft } from '@/types/contact';

jest.mock('@/database/database', () => ({ initializeDatabase: jest.fn() }));
const mockInitialize = initializeDatabase as jest.MockedFunction<typeof initializeDatabase>;

const db = {
  withTransactionAsync: jest.fn(async (callback: () => Promise<void>) => callback()),
  runAsync: jest.fn(async (..._args: unknown[]) => ({ changes: 1, lastInsertRowId: 1 })),
  getFirstAsync: jest.fn(async (..._args: unknown[]) => null as unknown),
  getAllAsync: jest.fn(async (..._args: unknown[]) => [] as unknown[]),
  execAsync: jest.fn(async () => undefined),
};

const sample: ContactDraft = {
  fullName: 'Rahul Sharma', firstName: 'Rahul', lastName: 'Sharma', company: 'Acme Technologies',
  jobTitle: 'Product Manager', email: 'rahul@acme.com', website: 'acme.com', address: 'Delhi',
  phones: [{ value: '+91 98765 43210', label: 'Mobile', selected: true }, { value: '0124 4567890', label: 'Office', selected: false }],
  note: 'Met at startup meetup', meetingDate: '2026-10-12', location: 'Delhi startup meetup',
};

beforeEach(() => { jest.clearAllMocks(); mockInitialize.mockResolvedValue(db as never); });

describe('contacts repository', () => {
  it('writes a contact, selected phone, and private memory in a transaction', async () => {
    const id = await saveContact(sample);
    expect(id).toBeTruthy();
    expect(db.withTransactionAsync).toHaveBeenCalledTimes(1);
    expect(db.runAsync).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO contacts'), expect.any(String), 'Rahul Sharma', 'Rahul', 'Sharma', 'Acme Technologies', 'Product Manager', 'rahul@acme.com', 'acme.com', 'Delhi', expect.any(String), expect.any(String));
    expect(db.runAsync).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO contact_phones'), expect.any(String), id, '+91 98765 43210', 'Mobile', 1, expect.any(String));
    expect(db.runAsync).not.toHaveBeenCalledWith(expect.stringContaining('0124 4567890'), expect.anything());
    expect(db.runAsync).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO contact_notes'), expect.any(String), id, 'Met at startup meetup', '2026-10-12', 'Delhi startup meetup', expect.any(String), expect.any(String));
  });

  it('parameterizes search text so search input stays data', async () => {
    await searchContacts("' OR 1=1 --");
    const [sql, value] = db.getAllAsync.mock.calls[0] as unknown as [string, string];
    expect(sql).toContain('c.full_name LIKE ?');
    expect(sql).not.toContain("' OR 1=1 --");
    expect(value).toBe("%' OR 1=1 --%");
  });

  it('reads a contact and its relational phone and note records', async () => {
    db.getFirstAsync.mockResolvedValueOnce({ id: 'contact-1', full_name: 'Mina Patel', first_name: 'Mina', last_name: 'Patel', company: 'Northwind', job_title: null, email: null, website: null, address: null, native_contact_id: null, created_at: '2026-10-12T00:00:00.000Z', updated_at: '2026-10-12T00:00:00.000Z' });
    db.getAllAsync.mockResolvedValueOnce([{ id: 'phone-1', phone_number: '555 123 4567', label: 'Work', is_primary: 1 }]).mockResolvedValueOnce([{ id: 'note-1', content: 'Follow up', meeting_date: null, location: 'Meetup', created_at: '2026-10-12T00:00:00.000Z' }]);
    const contact = await getContactById('contact-1');
    expect(contact?.phones[0].value).toBe('555 123 4567');
    expect(contact?.notes[0].content).toBe('Follow up');
  });

  it('deletes only the Vemori contact row', async () => {
    await deleteContact('contact-1');
    expect(db.runAsync).toHaveBeenCalledWith('DELETE FROM contacts WHERE id=?', 'contact-1');
  });
});
