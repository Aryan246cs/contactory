import * as Contacts from 'expo-contacts';
import { ContactsPermissionError, saveToPhoneContacts } from './nativeContacts';

jest.mock('expo-contacts', () => ({
  __esModule: true,
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  Contact: { create: jest.fn() },
}));

const draft = {
  fullName: 'Asha Rao', firstName: 'Asha', lastName: 'Rao', company: '', jobTitle: '',
  email: '', website: '', address: '', phones: [], note: '', meetingDate: '', location: '',
};

describe('saveToPhoneContacts permissions', () => {
  beforeEach(() => jest.clearAllMocks());

  it('requests native Contacts permission before creating a phone contact', async () => {
    jest.mocked(Contacts.getPermissionsAsync).mockResolvedValue({ granted: false, canAskAgain: true } as never);
    jest.mocked(Contacts.requestPermissionsAsync).mockResolvedValue({ granted: true, canAskAgain: true } as never);
    jest.mocked(Contacts.Contact.create).mockResolvedValue({ id: 'phone-contact-1' } as never);

    await expect(saveToPhoneContacts(draft)).resolves.toBe('phone-contact-1');
    expect(Contacts.requestPermissionsAsync).toHaveBeenCalledTimes(1);
    expect(Contacts.Contact.create).toHaveBeenCalledTimes(1);
  });

  it('returns a settings-actionable permission error when permission is denied', async () => {
    jest.mocked(Contacts.getPermissionsAsync).mockResolvedValue({ granted: false, canAskAgain: false } as never);
    jest.mocked(Contacts.requestPermissionsAsync).mockResolvedValue({ granted: false, canAskAgain: false } as never);

    await expect(saveToPhoneContacts(draft)).rejects.toMatchObject<Partial<ContactsPermissionError>>({
      name: 'ContactsPermissionError', canAskAgain: false,
    });
    expect(Contacts.Contact.create).not.toHaveBeenCalled();
  });
});
