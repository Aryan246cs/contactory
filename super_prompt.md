# CONTATORY — MASTER CODEX BUILD PROMPT

## ROLE

You are the lead product engineer, senior React Native engineer, mobile architect, UI/UX designer, OCR engineer, database engineer, QA engineer, and release engineer for this project.

You are not here merely to suggest code.

You are responsible for actually building the application in the repository.

Work directly on the codebase.

Inspect the repository before making decisions.

Implement features, create files, modify files, install appropriate dependencies, run checks, fix errors, and continuously improve the application.

When something cannot be completed because it requires a physical device, Apple Developer account, Google Play account, signing credentials, or another external dependency, implement everything possible and clearly document the exact remaining action.

Do not stop after creating a plan.

Do not give me a theoretical architecture instead of implementing it.

Do not create fake functionality just to make a screen look complete.

Do not claim something works unless you have actually validated it.

---

# 1. PRODUCT

## App Name

# CONTATORY

The product name is:

**Contactory**

Do not rename it.

Do not use placeholder names such as:
- MeetMemo
- CardScanner
- Business Card Scanner
- Contact Manager

The application is called **Contactory** everywhere.

Use:

**Contactory**

as the app name in:
- UI
- navigation
- metadata
- README
- configuration
- documentation
- store-preparation files
- splash screen
- onboarding

---

# 2. BRAND LANGUAGE

These three statements are extremely important.

They are not random marketing copy.

They define the product.

## PRIMARY TAGLINE

> **Every card has a story. Remember yours.**

Use this prominently throughout the onboarding and home experience.

---

## PRIMARY ACTION

> **Scan Card**

This is the most important action in the entire application.

The home screen must visually communicate:

# Scan Card

The user should immediately understand that this is what the application does.

---

## PRODUCT PROMISE

> **Never forget someone you meet.**

Use this as the emotional positioning of the product.

The application is not simply an OCR scanner.

It is a memory layer for professional relationships.

The user isn't scanning paper.

They are preserving the person, the contact, and the context of the interaction.

---

# 3. PRODUCT CONCEPT

Contactory is a modern personal networking application.

A user receives a physical visiting/business card.

Instead of putting it into their wallet, bag, drawer, or desk and eventually forgetting about it, they immediately open Contactory.

They:

1. Scan the card.
2. Contactory recognizes the information.
3. The application extracts:
   - Name
   - Company
   - Job title
   - Phone numbers
   - Email
   - Website
   - Address
4. The user reviews the extracted information.
5. If multiple phone numbers exist, they can choose:
   - One
   - Multiple
   - All
6. The user can add a short personal note.
7. Contactory stores the contact locally.
8. The user can optionally save it to the phone's native Contacts.
9. The user can later search for the person and remember:
   - Who they were.
   - Where they met.
   - What they discussed.
   - Why they matter.

The core experience should take approximately 10–20 seconds for a clean business card.

---

# 4. PRODUCT PHILOSOPHY

The application should feel:

- Premium
- Modern
- Fast
- Minimal
- Intelligent
- Personal
- Privacy-conscious
- Slightly futuristic
- Extremely polished

It should NOT feel like:

- A generic CRUD application.
- A college project.
- A basic OCR demo.
- A spreadsheet UI.
- A CRM dashboard.
- An enterprise accounting application.
- A generic React Native template.

The interface should feel like a real consumer application that could be launched on the App Store today.

Take inspiration from the design principles of products such as:

- Apple
- Linear
- Arc
- Raycast
- Notion
- Things
- Superhuman
- modern premium fintech applications

Do NOT copy their interfaces.

Develop an original Contactory visual identity.

---

# 5. UI DIRECTION — MAKE IT CRAZY GOOD

I want an unusually polished UI.

"Crazy" means:

**high-quality, memorable, modern, and visually impressive — not cluttered.**

The interface should feel like something users would want to show someone.

Use:

- Strong typography.
- Huge whitespace.
- Beautiful hierarchy.
- Subtle gradients.
- Glass-like surfaces where appropriate.
- Soft depth.
- Fine borders.
- Beautiful shadows.
- Micro-interactions.
- Smooth transitions.
- Subtle motion.
- Excellent empty states.
- Large touch targets.
- Beautiful camera scanning experience.
- Strong visual feedback.
- Carefully designed cards.
- Elegant icons.
- Responsive layouts.

Do not over-animate everything.

Animation should reinforce meaning.

Examples:

- Camera opens → subtle transition.
- Card capture → image settles into preview.
- OCR starts → elegant scanning animation.
- Contact fields appear → subtle stagger.
- Contact saved → satisfying success animation.
- Search → smooth result transitions.
- Delete → deliberate destructive animation.

Animations must never make the app feel slow.

Respect reduced-motion accessibility preferences where possible.

---

# 6. VISUAL IDENTITY

Create a proper design system.

Centralize:

- Colors.
- Typography.
- Spacing.
- Radius.
- Shadows.
- Borders.
- Animation timings.
- Icon sizes.
- Button variants.
- Input variants.

Do not hardcode styling randomly throughout screens.

Create reusable design tokens.

Example conceptual tokens:

```text
colors
  background
  surface
  surfaceElevated
  textPrimary
  textSecondary
  textMuted
  border
  accent
  accentSoft
  success
  warning
  destructive

spacing
  xs
  sm
  md
  lg
  xl
  2xl

radius
  sm
  md
  lg
  xl
  pill
```

Choose the actual visual values yourself.

The result should look intentional.

---

# 7. COLOR DIRECTION

Do not make this another generic blue SaaS application.

Explore a sophisticated palette.

Possible direction:

- Near-black / charcoal text.
- Warm off-white or very subtle tinted background.
- One distinctive accent color.
- Soft accent gradients.
- Very subtle translucent surfaces.

The accent should be memorable but restrained.

Do not use ten different colors.

Use color primarily to establish hierarchy and interaction.

---

# 8. TYPOGRAPHY

Typography is extremely important.

Use a high-quality system-compatible font stack.

Prioritize:

- Large display typography on onboarding.
- Strong heading hierarchy.
- Highly readable body text.
- Compact metadata.
- Excellent number rendering.

The application should feel editorial and premium.

Avoid oversized typography everywhere.

Use large typography specifically where it creates impact.

---

# 9. HOME SCREEN — THE HERO EXPERIENCE

The Home screen is the most important screen.

It should immediately communicate:

> **Never forget someone you meet.**

Then:

> Every card has a story. Remember yours.

And the dominant CTA:

# Scan Card

The Scan Card button should be visually distinctive.

Do not make it look like an ordinary rectangular button.

Consider a large elevated scanning surface/button with:

- Camera icon.
- Subtle gradient.
- Soft glow.
- Press animation.
- Haptic feedback where available.
- Short supporting text.

Example conceptual hierarchy:

```text
Good afternoon, Aryan.

Never forget
someone you meet.

Every card has a story.
Remember yours.


        ┌─────────────────────┐
        │                     │
        │       ◉             │
        │                     │
        │     Scan Card       │
        │                     │
        │  Capture a contact  │
        │  in seconds        │
        │                     │
        └─────────────────────┘


Recent
──────────────────────────────

Rahul Sharma
Acme Technologies
"Discussed AI automation..."
```

Do not necessarily copy this layout literally.

Design something better.

---

# 10. APPLICATION ARCHITECTURE

Use:

- React Native
- Expo
- TypeScript
- Expo Router
- SQLite
- Native device APIs
- EAS Build
- EAS Submit

Use the latest stable mutually compatible versions available in the project environment.

Before installing packages, inspect the current Expo SDK.

Do not blindly install incompatible package versions.

---

# 11. MOBILE STRATEGY

This is a real Android + iOS application.

Do NOT build around Expo Go as the final environment.

Use:

- Expo development builds.
- EAS Build.
- Proper native configuration.

The application must eventually be capable of:

Android:
- Development build.
- Preview APK/AAB.
- Production AAB.

iOS:
- Development build.
- TestFlight build.
- Production IPA through App Store Connect.

The final app must not depend on Expo Go-specific behavior.

---

# 12. CORE TECH STACK

## Frontend

React Native + Expo + TypeScript.

## Navigation

Expo Router.

## Database

SQLite using:

`expo-sqlite`

SQLite is the primary local source of truth.

## Camera

Use the appropriate Expo camera package.

## Native Contacts

Use the appropriate Expo/native contacts API compatible with the selected SDK.

## Files

Use Expo file-system APIs where necessary.

## Secure values

Use Expo SecureStore only for appropriate small sensitive key-value data.

Do not store the entire database inside SecureStore.

## OCR

Prefer native on-device OCR.

Android:

Google ML Kit Text Recognition.

iOS:

Apple Vision framework.

Investigate maintained Expo-compatible integrations first.

If a suitable maintained library exists, use it.

If not, implement a clean native bridge/module where feasible.

DO NOT make cloud OCR the default.

DO NOT upload visiting cards to an external OCR service.

---

# 13. LOCAL-FIRST ARCHITECTURE

The application must work without an account.

Do NOT make login mandatory.

The user should be able to:

- Install Contactory.
- Open it.
- Scan a card.
- Save it.
- Add notes.
- Search contacts.
- Close the application.
- Reopen it.
- Continue using the app.

All of this must work without internet.

Do not create a fake login screen.

Do not introduce Supabase/Firebase merely because "every app needs a backend."

The first version is local-first.

Cloud backup can be introduced later.

---

# 14. DATABASE

Create a robust SQLite data layer.

## contacts

```text
id
full_name
first_name
last_name
company
job_title
email
website
address
native_contact_id
created_at
updated_at
```

## contact_phones

```text
id
contact_id
phone_number
label
is_primary
created_at
```

## contact_notes

```text
id
contact_id
content
meeting_date
location
created_at
updated_at
```

## scanned_cards

```text
id
contact_id
image_path
raw_ocr_text
created_at
```

Raw OCR text and card images should only be retained where useful.

Avoid unnecessary sensitive data retention.

Use proper foreign keys.

Create indexes where appropriate.

Use transactions.

Use parameterized queries.

Never interpolate user input directly into SQL.

---

# 15. DATABASE ARCHITECTURE

Do NOT execute SQL directly from UI components.

Create repositories/services.

For example:

```text
src/
  database/
    database.ts
    migrations.ts
    repositories/
      contactsRepository.ts
      phonesRepository.ts
      notesRepository.ts
```

Screens should call repository/service functions.

They should not contain large SQL queries.

---

# 16. OCR ARCHITECTURE

Separate:

## OCR

Image → Raw text

from:

## Contact extraction

Raw text → Structured contact

Create clear interfaces.

Example:

```ts
interface OCRResult {
  text: string;
  blocks?: OCRTextBlock[];
}

interface ParsedContact {
  fullName?: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  jobTitle?: string;
  phones: ParsedPhone[];
  emails: string[];
  website?: string;
  address?: string;
}
```

Implement:

```text
recognizeTextFromImage()
extractContactFields()
extractPhoneNumbers()
extractEmails()
extractWebsite()
normalizePhoneNumber()
deduplicateValues()
```

The parser must be deterministic and explainable.

Do not use an LLM for basic OCR parsing.

Do not introduce AI simply for marketing purposes.

---

# 17. CONTACT PARSING

Business cards can have unpredictable layouts.

Build reasonable heuristics.

Detect:

### Phone numbers

Examples:

```text
+91 98765 43210
+91-9876543210
09876543210
0124 4567890
```

Support international formats where possible.

### Emails

Detect standard email patterns.

### Websites

Detect:

```text
https://...
www....
company.com
```

### Phone labels

Recognize:

```text
Mobile
Mob
M
Phone
Tel
Office
Work
Direct
Fax
```

Do not assume labels are always present.

---

# 18. REVIEW SCREEN

Never automatically save OCR output without allowing the user to review it.

The Review Contact screen must feel excellent.

Example structure:

```text
Review Contact

Rahul Sharma
ACME TECHNOLOGIES
Product Manager

Phone numbers

✓ +91 9876543210
  Mobile

□ 0124 4567890
  Office

Email

rahul@acme.com

Website

acme.com

──────────────────

Add a note

Where did you meet?
What did you discuss?
Why should you remember this person?

──────────────────

        Save Contact
```

Everything must be editable.

---

# 19. MULTIPLE PHONE NUMBERS

This is explicitly required.

If OCR detects:

```text
Mobile: +91 9876543210
Office: +91 124 4567890
```

show:

```text
☑ Mobile
  +91 9876543210

☐ Office
  +91 124 4567890
```

The user may select:

- Mobile only.
- Office only.
- Both.
- Neither.

Do not silently choose one.

---

# 20. NOTES — THE DIFFERENTIATOR

Notes are one of the most important features.

The application should help answer:

> "Who was this person again?"

A note could be:

```text
Met at Delhi startup meetup.

Discussed an AI automation project.
He is interested in exploring a collaboration
next month.
```

Store:

- Note.
- Date.
- Optional location.

Design the note area beautifully.

Make it feel like a personal memory, not a database field.

---

# 21. CONTACT DETAILS SCREEN

This should be one of the strongest screens in the application.

Possible structure:

```text
←

Rahul Sharma
Product Manager

ACME TECHNOLOGIES


[ Call ] [ Message ] [ Email ]


CONTACT

+91 9876543210
rahul@acme.com
acme.com


YOUR MEMORY

Met at Delhi startup meetup

Discussed an AI automation project.
Interested in exploring a collaboration.


12 October 2026


Edit Contact
```

Make the "Your Memory" section visually distinct.

That is the product's emotional differentiator.

---

# 22. CONTACT LIBRARY

Users should be able to browse all contacts.

Use a beautiful list.

Each item can show:

```text
RS
Rahul Sharma
Acme Technologies
Discussed AI automation...
```

Optional subtle metadata:

```text
Added 2h ago
```

Avoid clutter.

Use performant list rendering.

---

# 23. SEARCH

Search should feel instant.

Search:

- Name.
- Company.
- Phone.
- Email.
- Job title.
- Notes.
- Meeting location.

Example:

User searches:

```text
startup meetup
```

Result:

```text
Rahul Sharma
Acme Technologies

Met at Delhi startup meetup.
Discussed an AI automation project.
```

This is extremely important.

The user may remember the context but not the person's name.

---

# 24. MANUAL CONTACT CREATION

Scanning is the hero feature, but users must also be able to create a contact manually.

Provide:

```text
Add Contact
```

with the same fields as the review screen.

This is useful when:
- OCR fails.
- The user doesn't have the card.
- Someone sends their information digitally.

---

# 25. NATIVE CONTACTS

Allow the user to save the contact to the device's native Contacts.

The app's local database and native Contacts are separate systems.

Clearly communicate this.

Example success state:

```text
Contact Saved

✓ Saved to Contactory
✓ Added to your phone contacts

Your note remains safely stored
inside Contactory.
```

If native Contacts permission is denied:

```text
Saved to Contactory

Your contact and note are safely stored
inside the app.

Phone Contacts permission wasn't granted.

[Try Again ]
```

Never falsely claim that the phone contact was created.

---

# 26. PERMISSIONS

Request permissions contextually.

DO NOT request everything on first launch.

Camera permission:

When user taps:

**Scan Card**

Contacts permission:

When user chooses:

**Save to Phone Contacts**

Gallery/photo access:

Only when actually needed.

If permissions are denied:
- Explain what is unavailable.
- Keep the rest of the app functional.
- Provide a route to system settings where appropriate.

---

# 27. ONBOARDING

Create a visually impressive onboarding experience.

Slide 1:

# Every card has a story.

Subtitle:

**Remember yours.**

Visual:
A beautiful animated business card transitioning into a digital contact.

---

Slide 2:

# Never forget someone you meet.

Subtitle:

**Keep the person, the contact, and the memory together.**

Visual:
Contact information transforming into a beautiful contact card with a note.

---

Slide 3:

# Your network. Your memory.

Subtitle:

**Stored privately on your device.**

Visual:
A subtle privacy/local-storage visual.

Final CTA:

# Start using Contactory

Do not make onboarding long.

---

# 28. SPLASH SCREEN

Create a premium splash screen.

Minimal.

Display:

**Contactory**

and optionally:

**Every card has a story. Remember yours.**

Do not create a generic spinner screen.

---

# 29. EMPTY STATES

Do not leave blank screens.

If there are no contacts:

```text
Your network is empty.

The next person you meet
could be the beginning.

[ Scan Card ]
```

Make empty states feel intentional.

---

# 30. SUCCESS STATES

Saving a card should feel satisfying.

After successful save:

```text
You're all set.

Rahul Sharma
Acme Technologies

Saved to your network.

[ View Contact ]

[ Scan Another Card ]
```

Use subtle motion/haptic feedback.

Do not make it childish.

---

# 31. ERROR STATES

Design every important failure state.

Examples:

OCR failed.

Camera unavailable.

Camera permission denied.

Contacts permission denied.

Database failure.

Invalid image.

No contact information detected.

Native contact creation failed.

File operation failed.

Use clear human-readable messages.

Never display raw stack traces to users.

---

# 32. SEARCH EXPERIENCE

Search should have:

- Large search field.
- Instant results.
- Recent searches optionally.
- Clear button.
- Beautiful empty state.

Consider highlighting matched text where practical.

Do not overcomplicate it.

---

# 33. SETTINGS

Settings should contain:

## Appearance
- Light
- Dark
- System

## Permissions
- Camera
- Contacts

## Data
- Export contacts
- Delete all local data

## Privacy
- Privacy policy

## About
- App version
- Contactory
- Tagline

Do not show cloud sync controls until cloud sync exists.

---

# 34. EXPORT

Allow users to export their local contact data.

Initially:

CSV.

Include:

```text
Name
Company
Job Title
Phone
Email
Website
Address
Note
Meeting Date
Meeting Location
Created Date
```

Do not silently upload the export.

Let the operating system share/save the file.

---

# 35. DELETE DATA

Provide:

```text
Delete all local data
```

with a serious confirmation.

Example:

```text
Delete everything?

This permanently removes your
Contactory contacts, notes, and
stored card records from this device.

This cannot be undone.

Cancel
Delete Everything
```

Do NOT automatically delete the user's native phone contacts unless explicitly designed and confirmed.

---

# 36. DUPLICATE DETECTION

Before creating a new contact:

Check likely matches using:

- Normalized phone number.
- Email.

Potential duplicate:

```text
This person may already be in Contactory.

Rahul Sharma
Acme Technologies
+91 9876543210

[ View Existing ]
[ Save Anyway ]
```

Do not automatically merge.

---

# 37. ACCESSIBILITY

Implement reasonable accessibility.

Ensure:
- Buttons have accessible labels.
- Icons have labels where needed.
- Touch targets are large enough.
- Text has sufficient contrast.
- Dynamic text doesn't destroy layouts.
- Important information isn't communicated through color alone.
- Reduced-motion settings are respected where practical.

---

# 38. PERFORMANCE

The app must feel fast.

Avoid:
- Heavy unnecessary dependencies.
- Huge component trees.
- Unnecessary rerenders.
- Re-running OCR unnecessarily.
- Loading every contact when only a small list is needed.
- Storing images as database blobs.

Store image paths rather than large binary images inside SQLite.

Use efficient list rendering.

---

# 39. SECURITY / PRIVACY

This app stores personal contact information.

Privacy must be a first-class architectural consideration.

MVP principles:

- Local-first.
- On-device OCR.
- No mandatory login.
- No unnecessary cloud upload.
- No advertising SDK.
- No unnecessary analytics SDK.
- No automatic sharing.
- No unnecessary permissions.
- No hardcoded API keys.
- No secret credentials in Git.

Do not claim that the SQLite database is encrypted unless actual encryption is implemented.

Do not claim end-to-end encryption.

Be honest about what the app actually protects.

---

# 40. FUTURE CLOUD ARCHITECTURE

Do not implement this in the MVP unless explicitly requested later.

However, keep architecture extensible for:

Supabase Auth
+
Supabase PostgreSQL
+
Optional cloud backup.

Future synchronization could support:

```text
Local SQLite
      ↓
Sync Engine
      ↓
Supabase
```

But this is NOT part of the first release.

Do not add backend complexity now.

---

# 41. NAVIGATION

Use Expo Router.

Suggested structure:

```text
app/
  _layout.tsx

  index.tsx

  onboarding.tsx

  scan/
    index.tsx
    preview.tsx
    review.tsx

  contacts/
    index.tsx
    new.tsx
    [id].tsx
    edit/
      [id].tsx

  search.tsx

  settings.tsx
```

Adjust if the architecture can be improved.

Keep navigation clean.

Use modal presentation where appropriate.

---

# 42. PROJECT STRUCTURE

Suggested structure:

```text
app/
src/
  components/
  database/
  services/
    ocr/
    contacts/
    export/
  hooks/
  types/
  utils/
  constants/
  theme/
assets/
tests/
docs/
```

Separate:

UI

from:

business logic

from:

database

from:

native integrations.

Do not put everything into screen components.

---

# 43. TESTING

Implement tests for:

### Parser

- One phone.
- Multiple phones.
- Email.
- Website.
- Missing fields.
- Duplicate numbers.
- International numbers.
- Different ordering.
- Empty OCR.

### Database

- Create.
- Read.
- Update.
- Delete.
- Notes.
- Phones.
- Search.
- Relationships.

### UI

- Empty home.
- Contact creation.
- Phone selection.
- Review screen.
- Search.
- Delete confirmation.

Mock native APIs appropriately.

Do not pretend native device functionality has been physically tested if it hasn't.

---

# 44. REAL DEVICE TESTING CHECKLIST

Prepare a document:

`docs/REAL_DEVICE_TESTING.md`

Include:

## Android

- [ ] Camera permission.
- [ ] Camera capture.
- [ ] OCR.
- [ ] Gallery import.
- [ ] Multiple phone numbers.
- [ ] Native contact creation.
- [ ] Contact permission denial.
- [ ] App restart persistence.
- [ ] Search.
- [ ] Export.
- [ ] Dark mode.

## iOS

- [ ] Camera permission.
- [ ] Camera capture.
- [ ] OCR.
- [ ] Gallery import.
- [ ] Multiple phone numbers.
- [ ] Native contact creation.
- [ ] Contact permission denial.
- [ ] App restart persistence.
- [ ] Search.
- [ ] Export.
- [ ] Dark mode.

---

# 45. DEVELOPMENT ENVIRONMENT

Before implementing anything:

Inspect:

- package.json
- app.json/app.config.*
- tsconfig.json
- eas.json
- existing source files
- git status
- existing tests
- installed Expo SDK

Do NOT destroy existing work.

If the repository is empty, initialize it.

If it already contains a project, adapt it.

---

# 46. DEPENDENCY MANAGEMENT

Before adding dependencies:

Check whether an existing dependency already solves the problem.

Prefer Expo-supported packages.

Use:

```bash
npx expo install <package>
```

for Expo dependencies when appropriate.

Avoid adding libraries simply because they are popular.

Every dependency should have a reason.

After installing dependencies:

Run:

```bash
npx expo-doctor
```

or the appropriate current Expo validation command.

Fix compatibility problems.

---

# 47. ENVIRONMENT CONFIGURATION

If no external API is required, don't create unnecessary environment variables.

If environment variables are eventually required:

Create:

```text
.env.example
```

Never commit secrets.

Never place real credentials into source code.

---

# 48. EAS

Prepare:

```text
eas.json
```

with:

- development
- preview
- production

profiles.

Do not invent signing credentials.

Do not claim that the application has been submitted to either store.

Prepare the project for submission.

---

# 49. APP CONFIGURATION

Configure:

- App name: Contactory.
- Slug: appropriate Contactory slug.
- Android package identifier.
- iOS bundle identifier.
- Scheme.
- Version.
- Orientation.
- Icons.
- Splash screen.
- Permissions.
- Native configuration required by dependencies.

Use placeholder identifiers where the developer must provide unique production identifiers.

Clearly identify those placeholders.

---

# 50. STORE READINESS

Prepare:

`docs/STORE_RELEASE_CHECKLIST.md`

Include:

## Google Play

- Developer account.
- App identifier.
- App icon.
- Screenshots.
- Store description.
- Privacy policy.
- Data Safety.
- Permission disclosures.
- Content rating.
- Testing track.
- Production release.

## App Store

- Apple Developer account.
- Bundle ID.
- App Store Connect.
- App icon.
- Screenshots.
- Description.
- Keywords.
- Privacy details.
- Permission descriptions.
- TestFlight.
- App Review.

Do not claim approval.

---

# 51. PRIVACY POLICY DRAFT

Create:

`docs/PRIVACY_POLICY_DRAFT.md`

It must describe the actual MVP implementation.

Do not invent:
- Analytics.
- Cloud storage.
- Advertising.
- Third-party sharing.

If the MVP does not send contact information to a server, say so accurately.

If a future cloud feature is not implemented, do not describe it as an existing feature.

Clearly distinguish:
- Data stored locally.
- Native device contacts.
- Optional future cloud features.

This is a draft and not legal advice.

---

# 52. README

Create a professional README.

Start with:

# Contactory

> Every card has a story. Remember yours.

Then explain:

- What Contactory is.
- Problem.
- Solution.
- Core workflow.
- Features.
- Screens.
- Tech stack.
- Architecture.
- Database.
- OCR.
- Permissions.
- Local-first strategy.
- Development setup.
- Testing.
- Development builds.
- Production builds.
- Android release.
- iOS release.
- Privacy.
- Known limitations.

Include Mermaid diagrams.

At minimum:

### Architecture

```text
User
 ↓
React Native UI
 ↓
Application Services
 ↓
SQLite
 ↓
Native APIs
 ├── Camera
 ├── OCR
 └── Contacts
```

### Scan workflow

```text
Visiting Card
 ↓
Camera
 ↓
Image
 ↓
OCR
 ↓
Raw Text
 ↓
Contact Parser
 ↓
Review
 ↓
User Correction
 ↓
SQLite
 ↓
Native Contacts
```

Explain every important folder.

---

# 53. DESIGN DETAILS

Use subtle micro-interactions.

Examples:

## Scan Card

On press:
- Slight scale down.
- Haptic.
- Transition into camera.

## OCR

Show a scanning line moving over the captured card.

Keep it subtle.

## Extracted fields

Fields can appear with a short staggered animation.

## Save

Use a short success animation.

## Contact avatar

Generate initials automatically.

Example:

Rahul Sharma

→

RS

Do not require profile images.

---

# 54. CAMERA EXPERIENCE

This is another hero moment.

The camera screen should not look like a generic camera implementation.

Create a polished scanning interface.

Concept:

```text
        ← Scan Card

        Position the card
        inside the frame


       ┌──────────────────┐
       │                  │
       │                  │
       │   BUSINESS CARD  │
       │                  │
       │                  │
       └──────────────────┘


             ◉
```

Use animated corner guides or subtle scanning indicators.

Provide:
- Flash.
- Gallery.
- Capture.
- Retake.

Do not automatically upload anything.

---

# 55. CARD PREVIEW

After capture:

Display the image beautifully.

Actions:

```text
Retake
Use This Card
```

While processing:

```text
Reading your card...
Finding the important details...
```

Do not use fake progress percentages.

Use an indeterminate progress indicator or real stages.

---

# 56. OCR PROCESSING STATES

Possible states:

```text
Preparing image...
Reading card...
Finding contact details...
Almost there...
```

Only show stages that correspond to actual operations.

Do not lie about processing.

---

# 57. CONTACT AVATAR

Automatically generate an avatar from initials.

Examples:

Aryan Srivastava

→ AS

Rahul Sharma

→ RS

Use consistent styling.

If company is detected but name isn't, create a company-based fallback.

---

# 58. CONTACT ACTIONS

Contact details should support:

- Call.
- Email.
- Open website.
- Open WhatsApp if available.

Use native linking APIs.

Never automatically initiate a communication.

---

# 59. DATA MODEL PRINCIPLES

Do not store phone numbers as:

```text
"9876543210, 01244567890"
```

Use normalized relational records.

One contact:

```text
Contact
 ├── Phone 1
 ├── Phone 2
 └── Note
```

This makes future expansion possible.

---

# 60. DATE HANDLING

Store timestamps consistently.

Prefer ISO 8601 internally.

Display human-friendly values:

```text
Today
Yesterday
2 days ago
12 Oct 2026
```

Use the user's locale where appropriate.

Do not hardcode Indian date formats throughout the app.

---

# 61. SEARCH DATABASE DESIGN

Search should be fast.

Use indexed columns where appropriate.

For the MVP, SQLite LIKE-based search is acceptable.

Do not prematurely introduce Elasticsearch or another remote search engine.

---

# 62. NO OVERENGINEERING

Do not add:

- Redux unless necessary.
- GraphQL.
- Microservices.
- Backend server.
- Kubernetes.
- Redis.
- Elasticsearch.
- AI agents.
- LLMs.

This is a mobile application.

Keep the architecture sophisticated internally but simple operationally.

---

# 63. PRODUCT PRIORITY

Priority order:

## P0 — MUST WORK

1. App launch.
2. Onboarding.
3. Home.
4. Camera.
5. OCR.
6. Contact extraction.
7. Review.
8. Multiple phone selection.
9. Notes.
10. SQLite.
11. Native contact creation.
12. Contact details.
13. Search.

## P1

14. Manual contact.
15. Editing.
16. Delete.
17. CSV export.
18. Dark mode.
19. Beautiful animations.
20. Empty/error states.

## P2

21. Cloud backup.
22. Authentication.
23. Multi-device sync.
24. Advanced tags.
25. AI features.

Do NOT work on P2 until P0 is working.

---

# 64. IMPORTANT: DON'T BUILD CLOUD SYNC YET

The initial application is intentionally:

LOCAL-FIRST.

Do not implement:
- Supabase.
- Firebase.
- Authentication.
- Cloud contact storage.

unless specifically requested later.

The architecture should allow these later.

But do not introduce their complexity now.

---

# 65. IMPORTANT: DON'T USE AI FOR EVERYTHING

The product is an AI-adjacent application, but the core functionality does not require an LLM.

Use deterministic technologies where they are better:

OCR → native OCR.

Phone extraction → regex/parser.

Email extraction → parser.

Database → SQLite.

Search → SQLite.

Do not call an LLM simply to parse:

```text
+91 9876543210
```

This keeps the app:
- Faster.
- Cheaper.
- More private.
- More reliable.
- Offline-capable.

---

# 66. CODE QUALITY

Use:

- TypeScript.
- Strong typing.
- Small components.
- Clear naming.
- Reusable components.
- Repository pattern for database.
- Service layer for native integrations.
- Error handling.
- Comments only where useful.

Avoid:
- Giant components.
- 1,000-line screens.
- `any` everywhere.
- Duplicate logic.
- Magic strings.
- Hardcoded styles everywhere.
- Dead code.
- Placeholder implementations.

---

# 67. DOCUMENTATION COMMENTS

Where native code or unusual logic exists, explain:

- Why it exists.
- What it does.
- Platform differences.
- Any limitations.

Do not comment obvious code excessively.

---

# 68. GIT SAFETY

Before modifying the repository:

Check git status.

Do not delete unrelated user work.

Do not overwrite unrelated files.

Do not commit secrets.

If the repository contains existing functionality, preserve it unless it conflicts with the Contactory implementation.

---

# 69. IMPLEMENTATION STRATEGY

Work in phases.

## PHASE 1

Inspect repository.

Establish architecture.

Create design system.

Create navigation.

Create database.

Create onboarding.

Create home.

Make the application launch.

---

## PHASE 2

Implement camera.

Implement image preview.

Implement OCR abstraction.

Implement native OCR integration.

Implement contact parser.

Implement review screen.

---

## PHASE 3

Implement:

- SQLite saving.
- Notes.
- Multiple phone numbers.
- Native Contacts.
- Contact details.
- Editing.
- Deleting.
- Search.

---

## PHASE 4

Polish:

- Animations.
- Haptics.
- Empty states.
- Error states.
- Dark mode.
- Accessibility.
- Performance.

---

## PHASE 5

Testing.

Run:
- TypeScript checks.
- Lint.
- Tests.
- Expo validation.
- Build checks.

Fix errors.

Do not merely report errors.

---

## PHASE 6

Release preparation.

Create:
- README.
- Privacy draft.
- Store checklist.
- Device testing checklist.
- EAS configuration.

---

# 70. CRITICAL CODING BEHAVIOR

When you encounter an error:

Do not stop immediately.

Investigate.

Understand the cause.

Fix it.

Run the relevant validation again.

If a dependency is incompatible:

Investigate an alternative.

If a native feature cannot be completed in the current environment:

Implement the abstraction and all surrounding functionality.

Then clearly report:

```text
BLOCKED BY PHYSICAL/NATIVE ENVIRONMENT:
...
```

Do not silently replace real functionality with mock functionality.

---

# 71. WHEN TO ASK ME

Do not ask me questions for decisions you can reasonably make yourself.

Make sensible engineering decisions.

Ask me only when:
- A destructive decision could delete existing work.
- A required credential/account is needed.
- Two fundamentally different product requirements conflict.
- A unique production identifier must be supplied.
- A legal/store account action requires my intervention.

Otherwise, proceed.

---

# 72. CODEX OUTPUT BEHAVIOR

After each meaningful implementation phase, summarize briefly:

### Completed
- ...

### Validation
- ...

### Remaining
- ...

### Blocked
- ...

Do not flood me with explanations.

The actual repository changes are the primary output.

---

# 73. FINAL DEFINITION OF DONE

Contactory's MVP is considered implemented when a user can:

1. Install the application.
2. Open it without logging in.
3. Complete onboarding.
4. Reach a beautiful home screen.
5. Clearly see:

   **Scan Card**

6. Tap Scan Card.
7. Grant camera permission.
8. Capture a visiting card.
9. Preview the image.
10. Run real OCR.
11. Extract contact information.
12. Review the information.
13. Correct OCR mistakes.
14. See multiple phone numbers separately.
15. Select one or multiple phone numbers.
16. Add a personal note.
17. Save the record.
18. Store it in SQLite.
19. Optionally add it to native phone contacts.
20. View the saved contact.
21. Close the app.
22. Reopen the app.
23. Find the contact again.
24. Search by the person's name.
25. Search by company.
26. Search using text from the note.
27. Edit the contact.
28. Edit the note.
29. Delete the contact.
30. Export contact information.
31. Use the application in dark mode.
32. Continue using the app if native Contacts permission is denied.
33. Continue using saved data offline.

And throughout the experience, the product should reinforce:

# Contactory

### Every card has a story. Remember yours.

### Scan Card

### Never forget someone you meet.

---

# 74. START NOW

Do NOT respond with a long theoretical explanation.

First:

1. Inspect the repository.
2. Inspect the existing package configuration.
3. Check the Expo SDK.
4. Check existing files and git status.
5. Determine whether the project is empty or existing.
6. Identify the safest implementation path.
7. Begin implementation.

Then work through the phases above.

Prioritize actual working code.

Do not stop at a prototype.

Do not stop at mock screens.

Build Contactory.