# Contactory privacy policy draft

**Draft for review.** This document describes the current local-first MVP behavior. It is not legal advice and must be reviewed and completed before publication.

## Data stored in Contactory

Contact names, company and job details, selected phone numbers, email addresses, websites, addresses, and optional meeting notes are stored in the app's local SQLite database on the device. The MVP does not enable SQLite encryption. Contact images and raw OCR text are not retained after the review flow.

## Card scanning

Contactory processes card images on-device using Google ML Kit on Android and Apple Vision on iOS. Contactory does not send card images or extracted fields to a Contactory server for OCR.

## Phone Contacts

If you choose “Also save to phone Contacts,” the selected contact fields are written to the device's Contacts system. This creates a separate device Contacts record. Personal meeting notes remain in Contactory. Deleting a Contactory record does not remove the corresponding phone Contacts record.

## Export

When you export CSV, Contactory creates a temporary local file and opens the operating system share sheet. You choose whether and where to share or save it. Contactory does not upload the file.

## Network and third parties

This MVP has no login, cloud backup, analytics SDK, or advertising SDK configured, and does not automatically upload contact information. Optional native module dependencies process information locally as described above.

## Your choices

You may edit and delete local Contactory records, export them, and choose whether to write selected contact details to your device Contacts. Local data deletion does not delete phone Contacts entries.

## Complete before release

Add the publisher’s legal identity, contact details, effective date, governing jurisdiction, app-store privacy disclosures, and any support process. Confirm this draft against the production binary and all dependency data practices.
