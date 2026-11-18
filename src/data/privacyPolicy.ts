export const privacyPolicyEffectiveDate = 'November 18, 2026';
export const privacyPolicyUrl = 'https://vemori-card-suggestions.vemori-card-suggestions.workers.dev/privacy-policy';

export const privacyPolicySections = [
  {
    title: 'About Vemori',
    body: 'Vemori is published by the developer identified on its Google Play listing. For privacy questions, contact the developer using the support email shown on that listing.',
  },
  {
    title: 'Information saved in Vemori',
    body: 'When you save a contact, Vemori stores the name, company, job title, phone numbers, email address, website, address, notes, tags, and app preferences you choose in the app’s local SQLite database on your device. Vemori does not require an account or operate a cloud contact database or backup. Your device operating system may back up app data according to your device account and backup settings.',
  },
  {
    title: 'Card scanning and photos',
    body: 'Card photos are read on your device using Google ML Kit on Android or Apple Vision on iOS. Vemori sends the photo to neither the AI service nor a server for OCR. Camera captures use temporary files that Vemori attempts to remove after scanning. If you select a gallery photo, the original remains in your photo library and Vemori does not delete it. Recognized text is temporary in the scan flow unless you choose to request AI suggestions.',
  },
  {
    title: 'Optional AI suggestions',
    body: 'If you tap “Ask AI to review these fields” and confirm, Vemori sends the text recognized from the card—not the image—over HTTPS to a Cloudflare Worker and then to Groq’s GPT-OSS service. The text may include personal details printed on the card, such as names, phone numbers, email addresses, or addresses. The Worker also processes your network address for basic rate limiting. Groq uses the text to suggest a person’s name, company, and job title. AI is optional; the local parser remains available, and you review the fields before saving.',
  },
  {
    title: 'AI service handling and retention',
    body: 'Vemori does not save AI requests in its contact database. Cloudflare processes requests and operational information to run and protect the Worker. Groq says inference inputs and outputs are not retained by default, but may be temporarily logged for reliability or abuse investigations for up to 30 days unless Zero Data Retention is enabled for the account. Service terms and settings can change; review the current Cloudflare and Groq privacy and data-control information before using AI.',
  },
  {
    title: 'Phone Contacts and sharing',
    body: 'Only if you choose “Also save to phone Contacts,” Vemori copies the selected contact details and memory note to your device’s Contacts app. That separate copy may sync through your device or Contacts account. When you export a CSV, the operating system’s share sheet sends or saves it only to the destination you choose. Vemori does not upload the CSV.',
  },
  {
    title: 'Retention, deletion, and security',
    body: 'Saved Vemori records remain in the app until you delete them. Deleting a Vemori record does not delete a copy already saved to phone Contacts or a file you exported. Vemori uses HTTPS for its optional AI request and keeps the Groq API key on the server, not in the app. Vemori does not separately encrypt its local SQLite database; protect access to your device with its available security settings.',
  },
  {
    title: 'Other data use',
    body: 'Vemori has no sign-in, advertising SDK, analytics SDK, or automatic upload of your contact list configured. The optional AI request described above is the app’s network transfer of card content.',
  },
] as const;
