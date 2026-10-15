import * as Contacts from 'expo-contacts';
import { Contact } from 'expo-contacts';
import type { ContactDraft } from '@/types/contact';

export class ContactsPermissionError extends Error {
  constructor(readonly canAskAgain: boolean) {
    super('Vemori needs permission to add this person to your phone Contacts. You can grant it in the permission prompt or in app settings.');
    this.name = 'ContactsPermissionError';
  }
}

export async function saveToPhoneContacts(draft: ContactDraft, existingContactId?: string | null): Promise<string> {
  try {
    const currentPermission = await Contacts.getPermissionsAsync();
    const permission = currentPermission.granted ? currentPermission : await Contacts.requestPermissionsAsync();
    if (!permission.granted) throw new ContactsPermissionError(permission.canAskAgain);

    const names = draft.fullName.trim().split(/\s+/).filter(Boolean);
    const noteLines = [
      draft.note.trim(),
      draft.location.trim() ? `Met at: ${draft.location.trim()}` : '',
      draft.meetingDate.trim() ? `Meeting date: ${draft.meetingDate.trim().slice(0, 10)}` : '',
    ].filter(Boolean);
    const details = {
      givenName: draft.firstName.trim() || names[0] || '',
      familyName: draft.lastName.trim() || names.slice(1).join(' '),
      company: draft.company.trim() || undefined,
      jobTitle: draft.jobTitle.trim() || undefined,
      emails: draft.email.trim() ? [{ label: 'work', address: draft.email.trim() }] : [],
      phones: draft.phones.filter((phone) => phone.selected && phone.value.trim()).map((phone) => ({ label: phone.label.toLowerCase(), number: phone.value.trim() })),
      addresses: draft.address.trim() ? [{ label: 'work', street: draft.address.trim() }] : [],
      urlAddresses: draft.website.trim() ? [{ label: 'work', url: draft.website.trim() }] : [],
      note: noteLines.join('\n'),
    };
    if (existingContactId) {
      const existingContact = new Contact(existingContactId);
      await existingContact.update(details);
      return existingContact.id;
    }
    const contact = await Contact.create(details);
    return contact.id;
  } catch (error) {
    if (error instanceof ContactsPermissionError) throw error;
    const message = error instanceof Error ? error.message : '';
    if (/permission|denied|unauthorized/i.test(message)) throw new Error('Vemori saved this record, but phone Contacts permission was not granted. You can allow it in device settings and try again.');
    if (/native module|not available|not found/i.test(message)) throw new Error('Vemori saved this record locally. Saving to phone Contacts needs the installed app build; Expo Go does not include write access on every platform.');
    throw new Error('Vemori saved this record locally, but the phone contact could not be created. You can retry from its details.');
  }
}
