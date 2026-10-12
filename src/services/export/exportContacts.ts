import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { getAllContactsForExport } from '@/database/repositories/contactsRepository';

function csvCell(value: string): string {
  const safe = /^[=+@-]/.test(value) ? `'${value}` : value;
  return `"${safe.replace(/"/g, '""')}"`;
}

export async function exportContactsCsv(): Promise<void> {
  const contacts = await getAllContactsForExport();
  const columns = ['Name', 'Company', 'Job Title', 'Phone', 'Email', 'Website', 'Address', 'Note', 'Meeting Date', 'Meeting Location', 'Created Date'];
  const rows = contacts.map((contact) => [
    contact.fullName, contact.company, contact.jobTitle,
    contact.phones.map((phone) => `${phone.label}: ${phone.value}`).join(' | '),
    contact.email, contact.website, contact.address,
    contact.notes[0]?.content ?? '', contact.notes[0]?.meetingDate ?? '', contact.notes[0]?.location ?? '', contact.createdAt,
  ]);
  const csv = `\uFEFF${[columns, ...rows].map((row) => row.map(csvCell).join(',')).join('\r\n')}`;
  const file = new File(Paths.cache, `contactory-contacts-${new Date().toISOString().slice(0, 10)}.csv`);
  file.create({ overwrite: true });
  file.write(csv);
  if (!(await Sharing.isAvailableAsync())) throw new Error('Sharing is unavailable on this device.');
  await Sharing.shareAsync(file.uri, { mimeType: 'text/csv', dialogTitle: 'Export Contactory contacts', UTI: 'public.comma-separated-values-text' });
}
