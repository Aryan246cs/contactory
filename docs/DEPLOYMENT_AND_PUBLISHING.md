# Contactory deployment and publishing guide

This is a first-release walkthrough for publishing the current Expo app on Google Play and the Apple App Store. It assumes the app remains offline-first: the installed app stores contacts, notes, and tags in SQLite on the user's device. Scanned card photos and OCR text are temporary inputs and are not retained. There is no Contactory API, hosted database, login, or required backend to deploy.

## 1. What you need to decide first

- **Publisher identity:** individual or registered organization. Store account names and public seller details follow this choice.
- **Final app name and visual identity:** check trademark, company registry, domain, and both store listings in each target market. A store name being available does not grant trademark rights. Choose an owned permanent Android package and iOS bundle ID; changing these after release means publishing a separate app.
- **Support and privacy pages:** create public HTTPS pages for a support contact and final privacy policy. The app needs a reachable support path and policy URL for review. Start from `PRIVACY_POLICY_DRAFT.md`, then ensure it describes the exact release binary and your publisher details.
- **Data policy:** local contact records are stored on the device. The user can export a CSV or optionally copy a contact to the system Contacts app. Those are user-directed actions. No server receives contacts. Be transparent that device backups, CSV shares, and phone Contacts are governed by the operating system and the user's choices.

## 2. Accounts and tools

1. Create a Google Play Console developer account and an Apple Developer Program membership using the publisher's legal identity. Complete identity checks, tax/banking forms if applicable, and account recovery before release. At the time this guide was written, Google lists a one-time US$25 registration fee and Apple lists US$99 per membership year (local currency may apply). Verify the current amounts and eligibility requirements on the official enrollment pages before paying.
2. Create an Expo account if you want to use EAS Build. EAS is a build service, not this app's runtime backend. You can instead build locally with Android Studio / Xcode, though iOS builds require macOS and Xcode.
3. Install a supported Node.js LTS release, npm, Git, Android Studio (Android SDK), and Xcode on a Mac for iOS. Keep signing credentials in a password manager and maintain a recovery copy.
4. Set up a shared support email and a simple public website or static hosting for policy, help, and support contact. No server-side API is required. A static site can be hosted at low or no cost; avoid adding analytics or crash-reporting SDKs unless you intentionally update the privacy disclosures.

## 3. Prepare this repository

1. Pick the final public name and identifiers. Update `expo.name`, `expo.slug`, `expo.ios.bundleIdentifier`, `expo.android.package`, scheme, version, and any visible brand copy in `app.json` and the app. Replace `com.example.contactory` with identifiers under a domain or identity you control.
2. Create the final icon and store art. Provide an adaptive Android icon and a square iOS app icon meeting current store specifications. Prepare phone screenshots from real release builds; tablet screenshots are useful because this app currently declares iPad support.
3. Review permission prompts in `app.json`. Camera is used when scanning; photo library is used only for user-selected card images; Contacts is optional when saving to the phone. Remove any permission that the final app does not need. Verify the actual generated Android manifest and iOS privacy strings after prebuild.
4. Review `docs/PRIVACY_POLICY_DRAFT.md` and publish a completed policy. Confirm app privacy / Data Safety answers against the production dependencies and the actual user-initiated export/native Contacts flows.
5. Review `docs/STORE_RELEASE_CHECKLIST.md` and `docs/REAL_DEVICE_TESTING.md`. The checklist includes offline scan/OCR, local persistence, deletion, permissions, export, and app restart scenarios. Test release builds on physical Android and iPhone devices before submitting.
6. Set a release version and build number strategy. Android `versionCode` must increase for every uploaded build; iOS build numbers must also increase. EAS can increment versions with the production profile, but track the values in the repository.

## 4. Backend, database, and operating costs

**Required production backend: none.** SQLite, tags, duplicate review, and OCR run locally. The app does not need a server charge to keep running. EAS Build is optional and may have plan limits or costs; check the current EAS pricing before relying on it. Store developer memberships, optional domain/hosting, and any paid design services are separate publisher expenses.

For a free app with no in-app purchases, you generally do not need to pay for application hosting because the stores distribute the install package. Budget for the developer account memberships, optional EAS cloud build usage, optional support/policy website domain, and any paid services you later add. Store commissions may apply if you later sell digital products or add subscriptions.

Do not add cloud sync, remote OCR, analytics, advertising, or crash reporting without revisiting the privacy policy, store declarations, consent design, security controls, and operating budget. If you later add sync, plan for user authentication, encrypted transport, access control, deletion/export, backups, incident response, and a clear service-availability policy.

## 5. Configure EAS builds (optional)

From the project directory:

```sh
npx eas-cli login
npx eas-cli project:info
npx eas-cli build:configure
```

Confirm the EAS project belongs to the publisher. The repository already has development, preview, and production profiles in `eas.json`. Install EAS CLI on demand with `npx`; it does not need to be a permanent app dependency.

Build installable review binaries:

```sh
npx eas-cli build --profile preview --platform android
npx eas-cli build --profile preview --platform ios
```

Build store binaries after device testing and store setup:

```sh
npx eas-cli build --profile production --platform android
npx eas-cli build --profile production --platform ios
```

Android production output should be an Android App Bundle (`.aab`) for Play. EAS will offer to manage Android signing keys; decide whether to let EAS manage them or provide your own, then securely back up the keystore and passwords. For iOS, connect the Apple Developer account and let EAS manage distribution certificates/provisioning profiles, or supply credentials you manage. Never commit signing keys or credentials to Git.

## 6. Google Play release path

1. In Play Console, create the app using its final name, default language, app/game type, and free/paid status.
2. Complete the store listing: short and full descriptions, category, icon, phone screenshots, contact email, support URL, and privacy policy URL.
3. Complete app access, ads, target audience, content rating, Data Safety, and permission declarations truthfully. For this build, describe local contact data, on-device OCR, camera/photo selection, optional system Contacts writes, and user-initiated CSV sharing according to the final implementation and Google's definitions.
4. Upload a preview `.aab` to an internal testing track. Add tester accounts, install from Play, check upgrades and clean installs, and resolve Console warnings. Follow any currently applicable closed-testing requirement for new personal developer accounts; check the current Play Console task list for the account's exact rule.
5. Promote the verified build to closed/open testing, then production when eligible. Start with a staged rollout, monitor reviews and crash/device feedback, and halt rollout if a release issue appears.
6. For updates, raise the Android version code, rebuild, upload, complete any changed declarations, and roll out again.

## 7. Apple App Store release path

1. Register the explicit bundle ID in the Apple Developer account and create the app record in App Store Connect. Confirm the final bundle ID matches `app.json`.
2. Add the app name, subtitle, description, keywords, primary category, support URL, privacy policy URL, age rating, pricing/availability, icon, and required iPhone/iPad screenshots.
3. Complete App Privacy details from the final binary and all included SDKs. Explain that contact information is stored locally and not collected by the developer only if that is accurate for the submitted version. Disclose optional user-initiated transfers as required by Apple's form.
4. Upload a production-signed build with EAS Submit or Transporter/Xcode. Test it with TestFlight, including permission-denial paths and offline operation, before submitting for App Review.
5. Add clear App Review notes describing how to test scanning, on-device OCR, optional Contacts saving, and local-only behavior. Submit for review, address questions, then release manually or automatically after approval.
6. Increment the iOS build number for every upload. Updates to permissions, SDKs, privacy answers, or data flows may require revising store disclosures.

## 8. Before pressing Submit

- The final name and logo are cleared by the publisher; no trademark clearance is implied by this code change.
- Identifiers are owned, consistent, and permanent.
- Privacy policy, support URL, store privacy forms, permission prompts, and binary behavior agree.
- Fresh install, upgrade, offline use, OCR, local deletion, CSV export, and optional system Contacts behavior were checked on real devices.
- Screenshots come from the final build, text is readable, and store claims do not promise cloud features or retention behavior the app does not provide.
- Signing, recovery, store account, tax, support, and privacy-site access are controlled by the publisher rather than a contractor's personal account.

## Official references

Check these sources for requirements and fees at the time you enroll or submit:

- [Google Play Console Help](https://support.google.com/googleplay/android-developer/)
- [Google Play Console account setup and registration fee](https://support.google.com/googleplay/android-developer/answer/6112435)
- [Google Play app setup and release](https://support.google.com/googleplay/android-developer/answer/9859152)
- [Apple Developer Program membership and pricing](https://developer.apple.com/programs/whats-included/)
- [Apple enrollment options](https://developer.apple.com/help/account/membership/programs-overview/)
- [App Store Connect Help](https://developer.apple.com/help/app-store-connect/)
- [Expo EAS Build documentation](https://docs.expo.dev/build/introduction/)
- [Expo EAS Build plan availability](https://docs.expo.dev/build/setup/)
- [Expo EAS Submit documentation](https://docs.expo.dev/submit/introduction/)
