import { Contact } from 'expo-contacts';
import type { ContactDraft } from '@/types/contact';

export async function saveToPhoneContacts(draft: ContactDraft): Promise<string> {
  try {
    const names = draft.fullName.trim().split(/\s+/).filter(Boolean);
    const contact = await Contact.create({
      givenName: draft.firstName.trim() || names[0] || '',
      familyName: draft.lastName.trim() || names.slice(1).join(' '),
      company: draft.company.trim() || undefined,
      jobTitle: draft.jobTitle.trim() || undefined,
      emails: draft.email.trim() ? [{ label: 'work', address: draft.email.trim() }] : [],
      phones: draft.phones.filter((phone) => phone.selected && phone.value.trim()).map((phone) => ({ label: phone.label.toLowerCase(), number: phone.value.trim() })),
      addresses: draft.address.trim() ? [{ label: 'work', street: draft.address.trim() }] : [],
      urlAddresses: draft.website.trim() ? [{ label: 'work', url: draft.website.trim() }] : [],
    });
    return contact.id;
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    if (/permission|denied|unauthorized/i.test(message)) throw new Error('Contactory saved this record, but phone Contacts permission was not granted. You can allow it in device settings and try again.');
    if (/native module|not available|not found/i.test(message)) throw new Error('Contactory saved this record locally. Saving to phone Contacts needs the installed app build; Expo Go does not include write access on every platform.');
    throw new Error('Contactory saved this record locally, but the phone contact could not be created. You can retry from its details.');
  }
}
