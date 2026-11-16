# Publish Vemori on Google Play

This guide takes Vemori from its current tested state to a production release on Google
Play. It covers Android only. The app is an Expo SDK 57 / React Native app; contact data is
stored in local SQLite, and card OCR runs on-device. Its core features need no backend. The
optional Groq field-suggestion flow uses the deployed Cloudflare Worker described below. EAS
Build creates the Android binary and EAS Submit can upload it to Play Console.

## Contents

- [Current repository state](#current-repository-state)
- [1. Set up the publisher and accounts](#1-set-up-the-publisher-and-accounts)
- [Groq AI suggestion flow and configuration](#groq-ai-suggestion-flow-and-configuration)
- [2. Confirm app identity and release configuration](#2-confirm-app-identity-and-release-configuration)
- [3. Prepare the app and validate it on Android](#3-prepare-the-app-and-validate-it-on-android)
- [4. Create the Play Console app and store listing](#4-create-the-play-console-app-and-store-listing)
- [5. Build a production Android App Bundle](#5-build-a-production-android-app-bundle)
- [6. Upload to internal testing](#6-upload-to-internal-testing)
- [7. Run the required pre-release testing track](#7-run-the-required-pre-release-testing-track)
- [8. Request production access and publish](#8-request-production-access-and-publish)
- [9. Publish an update](#9-publish-an-update)
- [Official references](#official-references)

## Current repository state

- App name: `Vemori` (`app.json` → `expo.name`)
- Android application ID: `com.tiger.vemori` (`app.json` → `expo.android.package`). This ID is
  permanent once the app is published. Confirm that it is yours and that you intend to keep
  it; change it before the first Play upload if needed.
- App version: `1.0.0`; EAS production uses remote app-version management and automatic
  incrementing (`eas.json`).
- Build profiles: `development`, `preview` (internal APK), and `production` (store build;
  Android App Bundle by default).
- EAS project ID is already configured in `app.json`. Confirm the EAS account/project belongs
  to the publisher before building.
- OCR uses native on-device ML Kit on Android through `expo-ocr-kit`; Expo Go is not a
  release/test substitute for OCR.
- Optional AI field suggestions use GPT-OSS 20B through `server/groq-proxy`. The test Worker
  is deployed at `https://vemori-card-suggestions.vemori-card-suggestions.workers.dev`; the
  Groq key is stored as a Cloudflare Worker secret, and the EAS `development` environment has
  the public Worker URL configured. Never copy the key into this repository or the app.
- The developer reports successful end-to-end scans of all shared sample cards using AI
  suggestions. This is a useful device check, not a guarantee for arbitrary cards or a
  substitute for wider release testing.
- `app.json` currently declares camera, microphone, read contacts, and write contacts
  permissions. The product flow described in the code uses camera for card scanning and
  optional Contacts access for saving a record. Review the generated manifest and remove any
  permission that is not needed; in particular, justify or remove microphone access if no
  shipped feature uses it.
- No Play listing, public support page, completed privacy policy, Play Console account,
  signing ownership, or device release validation is included in this repository.

## 1. Set up the publisher and accounts

1. Decide whether the publisher is an individual or an organization. Use the publisher's legal
   identity, not a contractor's personal account. Google may ask for identity, organization,
   contact, and verification details.
2. Create and verify a Google Play Console developer account. Complete account verification,
   developer contact details, and any payments or profile requirements shown in Console. Fees
   and enrollment requirements can change; follow the current Play Console enrollment flow.
3. Create or confirm the Expo account and EAS project that will own builds. From the repo, sign
   in and inspect the project:

   ```sh
   npx eas-cli login
   npx eas-cli project:info
   ```

4. Prepare a durable publisher-controlled support email and public HTTPS pages for support and
   the privacy policy. The privacy policy must describe the exact release: local contact
   storage, on-device OCR, camera/photo access, optional writing to phone Contacts, and
   user-triggered CSV sharing. Be clear that data copied to phone Contacts or shared through
   Android is subject to those services and the user's choices. The removed draft in this repo
   was not a published or legally reviewed policy.

## Groq AI suggestion flow and configuration

The app calls Groq only after the user taps **Ask AI to review these fields** and confirms
sending the recognized text. It sends OCR text only, not the image. The local parser remains
the fallback, and nothing is saved until the user reviews the form and taps Save. The Worker
enforces a strict JSON schema, checks each suggestion against quoted OCR evidence, caps text
size, times out upstream requests, and applies a basic per-IP rate limit of 12 requests per
60 seconds. This reduces errors and abuse; model confidence is only a rough signal and does
not make extraction infallible. Set a spending limit in Groq Console.

The current public Worker URL is
`https://vemori-card-suggestions.vemori-card-suggestions.workers.dev`. Its hostname has no
caller authentication; the rate limit is basic abuse control, not strong access control.
Before enabling AI in a public release, add stronger abuse protection and spending controls,
or omit the Worker URL from the production EAS environment so the AI button is unavailable
in that build.

1. Create a Groq API key in the [Groq Console](https://console.groq.com/keys). Do not paste it
   into the mobile app, `.env`, `app.json`, source code, or Git.
2. From the repository root, log into Cloudflare and deploy the Worker once:

   ```sh
   npx wrangler login
   npx wrangler deploy --config server/groq-proxy/wrangler.toml
   ```

3. Set the Groq key as a Worker secret. Wrangler will prompt for the secret value and deploy
   the updated Worker:

   ```sh
   npx wrangler secret put GROQ_API_KEY --config server/groq-proxy/wrangler.toml
   ```

   Copy the resulting `workers.dev` URL. The Worker calls Groq's chat completions API using
   `openai/gpt-oss-20b` and strict structured outputs. The model can be changed with the Worker
   `GROQ_MODEL` variable if you intentionally want to compare `openai/gpt-oss-120b`.

4. For local Metro development, copy `.env.example` to `.env` and set
   `EXPO_PUBLIC_GROQ_SUGGESTION_URL` to the Worker URL. For a remote EAS build, set the same
   public URL in the matching EAS environment. The development variable is already set for the
   current test endpoint; set `production` separately only if AI is intended in the Play build:

   ```sh
   npx eas-cli env:set \
     --name EXPO_PUBLIC_GROQ_SUGGESTION_URL \
     --value https://vemori-card-suggestions.vemori-card-suggestions.workers.dev \
     --environment production \
     --visibility plaintext
   ```

   The URL is public configuration, not a secret. Never set the Groq key as an `EXPO_PUBLIC_`
   variable.
5. Restart Metro for local development. For the Play binary, build after setting the production
   EAS variable. In review, tap **Ask AI to review these fields** and accept the per-scan
   disclosure. The app applies only non-low-confidence suggestions that pass evidence checks;
   review the card and fields before saving.
6. The shared sample cards have been scanned successfully on-device according to the developer.
   Continue checking varied cards and separate OCR reading errors from field-mapping errors.
   Keep the production AI option disabled until privacy disclosures and endpoint abuse
   protections are ready.

The recognized text contains other people's contact details. Groq's current [data controls
documentation](https://console.groq.com/docs/your-data) says inference inputs/outputs are
not retained by default, with limited reliability/abuse logging that may retain content for
up to 30 days unless Zero Data Retention is enabled. Review those controls and the current
service terms before enabling this in a public release. Update the hosted privacy policy and
Play Data safety answers to disclose the optional user-triggered transfer to your Worker and
Groq, including purpose, data types, and applicable retention. Do not describe the release
as fully offline if this option is enabled.

## 2. Confirm app identity and release configuration

1. Confirm `expo.android.package` in `app.json` is a unique ID under your control. Treat it as
   permanent after the first Play upload.
2. Confirm the public name, icon files, splash screen, app links/scheme, and user-facing
   branding. The app is named Vemori and currently uses `assets/images/vemori-icon.png` and the
   configured adaptive icon art.
3. Review Android permissions in `app.json` and the final generated Android manifest. Keep only
   permissions required by the shipped behavior, with user-facing explanations. Do not make
   store declarations based only on the source config; inspect the resulting build.
4. Confirm the app version and Android version code strategy. `eas.json` has `appVersionSource:
   "remote"` and production `autoIncrement: true`; EAS should manage a higher Android version
   code on successive production builds. Track the public `version` in `app.json` and verify
   the generated version code before upload.
5. Check Play's current target API requirement before producing a release. As of November 2026,
   new apps and updates submitted from August 31, 2026 must target Android 16 / API 36 or
   later. Inspect the generated build/manifest and Play Console warning for the actual target.
   If the Expo/Android toolchain used here does not generate an eligible target,
   upgrade/configure the Android build before proceeding.
6. Make sure no secrets (service account JSON, signing credentials, API keys) are committed.
   Store recovery information securely with the publisher.

## 3. Prepare the app and validate it on Android

1. Install project dependencies using the repository lockfile and the required Node.js version
   recorded in the README/project setup. Resolve install or type errors before making a store
   build.
2. Build an installable preview APK with the custom native OCR module:

   ```sh
   npx eas-cli build --profile preview --platform android
   ```

3. Install that APK on physical Android devices. Check fresh install and upgrade behavior,
   first-run flow, camera permission allow/deny paths, camera capture and gallery selection,
   OCR with clear and difficult cards, editing every suggested field, multiple phone numbers,
   local save/search/restart/delete, optional save to phone Contacts, and CSV share-sheet
   export. Test offline operation and large text. Resolve issues and repeat the preview build
   after native/config changes.
4. Check the release code and store claims against actual behavior. OCR and field parsing are
   fallible and users must review fields; do not promise perfect automatic recognition. If the
   AI option is configured, disclose the optional recognized-text transfer to Groq in the
   privacy policy and Play Data safety form.
5. Keep a record of tested devices, OS versions, app build/version code, issues found, and
   fixes. This will help answer Play's testing and production-readiness questions.

## 4. Create the Play Console app and store listing

1. In Play Console, choose **Create app**. Set the app name, default language, app type,
   free/paid status, and required declarations. Use the same package ID as `app.json`.
2. Complete the store listing: short and full descriptions, category, app icon, phone
   screenshots, contact email, and a publicly accessible privacy-policy URL. Google Play
   requires a privacy policy link in Play Console and a policy link or text in the app; keep it
   active, non-geofenced, and consistent with the exact release. Use screenshots from the
   actual app. Ensure text is readable and avoid functionality claims the app does not provide.
3. Complete the App content tasks shown in Console. These commonly include privacy policy, ads,
   app access, target audience, content rating, and any permission declarations. Answer from
   the final build and intended audience.
4. Complete Data safety accurately. Google requires the form for apps on closed, open, and
   production tracks; apps active exclusively on internal testing are exempt. The app stores
   contacts and notes locally; OCR runs on-device; a user can optionally copy details into
   Android Contacts and explicitly share a CSV. If the AI option is enabled, disclose that a
   user may send OCR text to the Vemori Worker and Groq for field suggestions. Explain each
   data path according to the exact form definitions and final dependency/build behavior.
   Revisit the form if analytics, cloud sync, remote AI/OCR, crash reporting, advertising, or
   other network services are added.
5. Complete pricing and countries/regions, and provide any trader/publisher information
   requested for the chosen distribution regions. Review the Console dashboard until all
   required setup tasks are resolved.

## 5. Build a production Android App Bundle

The production profile in `eas.json` does not set `android.buildType: "apk"`, so EAS Build
produces the store-oriented `.aab`.

1. Confirm you are in the correct EAS account/project and that the Android application ID is
   final.
2. Start the production build:

   ```sh
   npx eas-cli build --profile production --platform android
   ```

3. On the first Android store build, EAS may offer to create/manage the Android signing key.
   Choose the intended long-term owner. If using EAS-managed credentials, confirm the EAS
   project is publisher-controlled. If supplying your own key, keep secure backups of the
   keystore and passwords. Losing the signing identity can prevent future updates.
4. Wait for the build to complete, download the `.aab`, and keep the build URL, commit,
   version, and version code with the release record. Do not distribute the production signing
   material.
5. For future updates, make the code/config changes, update the user-facing version as
   appropriate, and create a new production build with a higher version code. Never reuse an
   already uploaded version code.

## 6. Upload to internal testing

1. In Play Console, open **Testing → Internal testing**, create a release, upload the
   production `.aab`, and resolve upload warnings/errors. An AAB submitted to Play is not
   directly installed as an APK; Play generates device-specific APKs.
2. Add your internal tester accounts, save the release, review the release summary, and roll it
   out to internal testing.
3. Use the tester opt-in link on Android devices and install through Google Play. Check
   install, update over an earlier build, and app behavior from the Play-distributed binary.
4. Fix issues by building a new AAB with a higher version code and uploading it to the relevant
   track.

If you use EAS Submit, first create the Play app and configure a Google service account for
API access as described in Expo's current guide. Then:

```sh
npx eas-cli submit --platform android
```

The first EAS submission defaults to the internal testing track. You can also upload the
`.aab` manually in Play Console. Keep the Google service-account JSON out of Git and grant
only the access needed for submission.

## 7. Run the required pre-release testing track

1. Decide which track to use next. A closed test is the controlled route for recruited testers;
   internal testing is useful for a small initial check.
2. If the Play developer account is a **personal account created after November 13, 2023**,
   current Play policy requires a closed test with at least 12 testers opted in continuously
   for at least 14 days before applying for production access. Then apply through the Play
   Console dashboard and answer questions about tester engagement, feedback, app value, and
   readiness. Confirm the live requirement in Console because Google can change it.
3. For organization accounts or other account cohorts, follow the exact prerequisites presented
   in that account's Play Console. Do not assume the personal-account rule applies identically
   to every account.
4. Recruit testers who can exercise the real features and gather feedback. Address crashes,
   broken flows, permission confusion, and misleading parsing before applying for production
   access or promoting a release.

## 8. Request production access and publish

1. Finish all Play Console setup tasks and confirm listing, content rating, Data safety,
   privacy/support URLs, countries, and pricing are complete.
2. If required for the account, apply for production access after the closed-test period and
   provide accurate answers based on what testers actually did and what you changed.
3. Open **Test and release → Production**, create a release, select the verified AAB (or upload
   the final one), add concise release notes, and review the release summary and policy
   warnings.
4. Choose a staged rollout where available, review eligible countries/devices, and start
   rollout. A staged rollout limits exposure and can be halted if a release problem appears.
5. Complete the final **Send for review / Start rollout / Publish** action shown in Play
   Console. Google reviews the submission; approval and listing visibility are not
   instantaneous or guaranteed. Monitor Console status and respond to any policy or review
   request.
6. After release, monitor Android vitals, crashes/ANRs, reviews, and support email. Halt or
   pause rollout if the release has a serious issue; prepare a fixed build with a higher
   version code.

## 9. Publish an update

1. Make and review the change. Recheck permissions, SDK/dependency changes, privacy wording,
   and Data safety declarations.
2. Increment the app version as appropriate and produce a new production AAB. Verify the new
   version code is higher than every previously uploaded code.
3. Upload to internal or closed testing first when the change warrants it, then promote the
   tested artifact or upload the final artifact to production.
4. Add release notes, review any new Console warnings, choose rollout percentage, submit for
   review, and monitor rollout.

## Official references

- [Google Play Console Help](https://support.google.com/googleplay/android-developer/)
- [Create and set up an
  app](https://support.google.com/googleplay/android-developer/answer/9859152)
- [Testing requirements for new personal developer
  accounts](https://support.google.com/googleplay/android-developer/answer/14151465)
- [Google Play User Data policy (privacy policy
  requirements)](https://support.google.com/googleplay/android-developer/answer/10144311)
- [Google Play Data safety
  section](https://support.google.com/googleplay/android-developer/answer/10787469)
- [Set up internal, closed, or open
  testing](https://support.google.com/googleplay/android-developer/answer/9845334)
- [Target API level
  requirements](https://developer.android.com/google/play/requirements/target-sdk)
- [Expo: Build for Android](https://docs.expo.dev/build-reference/android-builds/)
- [Expo: Submit to Google Play](https://docs.expo.dev/submit/android/)
- [Groq: supported models](https://console.groq.com/docs/models)
- [Groq: structured outputs](https://console.groq.com/docs/structured-outputs)
- [Groq: data controls](https://console.groq.com/docs/your-data)
- [Cloudflare Workers: rate limit
  binding](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/)
- [Cloudflare Workers:
  secrets](https://developers.cloudflare.com/workers/configuration/secrets/)
