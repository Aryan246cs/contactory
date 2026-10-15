# Vemori real-device testing

Use an Expo development build for OCR and native Contacts coverage. Expo Go can validate navigation, onboarding, SQLite, manual entry, and camera/gallery flows, but does not contain the Vemori OCR native module.

## Android development build

- [ ] Fresh install opens onboarding and persists completion after force close.
- [ ] Camera prompt appears only after Scan Card is tapped.
- [ ] Camera denial offers gallery and system settings routes.
- [ ] Camera capture, retake, and gallery selection work.
- [ ] OCR runs offline on a clear card; unreadable cards show a useful error.
- [ ] Name, company, title, email, website, address, and multiple numbers are extracted where present.
- [ ] Every phone number can be edited, selected, or excluded.
- [ ] Contact and note persist through app restart.
- [ ] Contact can be edited and deleted; deleting does not remove the phone contact.
- [ ] Native Contacts permission is requested only when chosen; success and denial states are accurate.
- [ ] Search works for name, company, phone, email, title, note, and meeting location.
- [ ] CSV export opens the Android share sheet and contains correctly escaped values.
- [ ] Delete-all confirmation removes local data only.
- [ ] Layout remains usable with large text and keyboard open.

## iOS development build

- [ ] Fresh install opens onboarding and persists completion after force close.
- [ ] Camera prompt appears only after Scan Card is tapped.
- [ ] Camera denial offers gallery and system settings routes.
- [ ] Camera capture, retake, and gallery selection work.
- [ ] Vision OCR runs offline on a clear card; unreadable cards show a useful error.
- [ ] Name, company, title, email, website, address, and multiple numbers are extracted where present.
- [ ] Every phone number can be edited, selected, or excluded.
- [ ] Contact and note persist through app restart.
- [ ] Contact can be edited and deleted; deleting does not remove the phone contact.
- [ ] Native Contacts permission is requested only when chosen; success and denial states are accurate.
- [ ] Search works for name, company, phone, email, title, note, and meeting location.
- [ ] CSV export opens the iOS share sheet and contains correctly escaped values.
- [ ] Delete-all confirmation removes local data only.
- [ ] Layout remains usable with Dynamic Type and keyboard open.

## Expo Go checks

- [ ] Install the SDK 57 compatible Expo Go client.
- [ ] Run `npx expo start --go` and scan the QR code.
- [ ] Onboarding and local database work.
- [ ] Camera and gallery capture work on a real device.
- [ ] Manual contact entry, editing, notes, search, and CSV share work.
- [ ] OCR displays its explicit development-build requirement rather than crashing.
- [ ] Native Contacts save behavior is treated as platform-dependent in Expo Go and verified in a development build.
