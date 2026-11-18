# Publish Vemori on Google Play

This is the release checklist for Vemori **from its current setup**. The AI Worker is
already deployed and the development build already uses it. You do not need to redo the
Groq setup.

## Contents

- [What is already done](#what-is-already-done)
- [Wrangler and the Groq key](#wrangler-and-the-groq-key)
- [How long it will take](#how-long-it-will-take)
- [Steps to publish](#steps-to-publish)
- [Official references](#official-references)

## What is already done

- **AI card suggestions:** You report that the shared sample cards scan correctly with AI
  suggestions. Keep the manual review step; this does not guarantee every card will work.
- **Groq proxy:** Cloudflare Worker `vemori-card-suggestions` is deployed at:

  ```text
  https://vemori-card-suggestions.vemori-card-suggestions.workers.dev
  ```

- **Groq key:** Stored as the Cloudflare Worker secret `GROQ_API_KEY`.
- **Model:** The Worker is configured for `openai/gpt-oss-20b`.
- **Development URL:** You set `EXPO_PUBLIC_GROQ_SUGGESTION_URL` in the EAS `development`
  environment.
- **Public privacy policy:** Live at
  `https://vemori-card-suggestions.vemori-card-suggestions.workers.dev/privacy-policy`.
  The in-app policy uses the same shared policy text.
- **Microphone permission:** Removed from the Android config; the camera and image-picker
  plugins are both configured not to request microphone access.
- **EAS project:** The repo is linked to an EAS project. The Android package ID is
  `com.tiger.vemori`.
- **Build profiles:** `preview` creates an installable APK; `production` creates a Play
  Store Android App Bundle (`.aab`) and automatically increments its Android version code.

The repository cannot confirm your Play Console account status, who owns the package ID, or
whether you have finished the privacy policy, store listing, and signing setup. The earlier
EAS command set the **development** Worker URL. Set the **preview** and **production** URLs
below if those builds should include AI.

## Wrangler and the Groq key

**Wrangler** is Cloudflare's command-line tool for managing and deploying Cloudflare
Workers. We used it to upload the small server that sits between the app and Groq.

The app sends recognized card text to the Worker after the user confirms the AI prompt. The
Worker reads `GROQ_API_KEY` from Cloudflare's secret storage and sends the request to Groq.
The secret is **not** in the mobile app, source code, `.env`, or EAS. The app only needs the
Worker URL, which is public configuration.

You do not need to make another Groq key or redeploy the Worker for the Play build. For an
AI-enabled Play build, you do need to set the public Worker URL in EAS's `production`
environment and make a new production build. If you leave that URL unset, AI suggestions
will not be configured in the Play app.

The Worker is publicly reachable and has basic per-IP rate limiting (12 requests per
minute), not caller authentication. Before a public launch, set a Groq spending limit and
consider stronger abuse protection. Do not put a secret key in the app as a substitute;
mobile app secrets can be extracted.

## How long it will take

These are planning estimates, not guarantees from Google or Expo:

- Check accounts, package ID, and permissions: **30–60 minutes**. Account verification may
  add waiting time.
- Finish the policy, screenshots, store listing, and declarations: **2–5 hours** if the
  materials are ready. Writing the policy and making assets can add time.
- Set the EAS URLs and make preview/production builds: **1–2 hours of hands-on work**. Build
  queue and build time vary.
- Upload the first test release: **1–2 hours**. Play processing can take minutes or hours.
- If the new personal-account rule applies: **14 continuous days** with at least 12 opted-in
  closed testers, then a production-access review.
- Production-access and app reviews: allow **up to 7 days each or longer**; there is no fixed
  approval time.

If your **personal** Play developer account was created after November 13, 2023, Google
requires 12 testers to remain opted into a closed test continuously for at least 14 days
before you can request production access. Google says the production-access review usually
takes seven days or less, but it can take longer. App review can also take a few hours to
seven days or longer. Plan for **about 3–4 weeks or more** from a release-ready build if that
  tester rule applies. If it does not apply, budget **about 1–2 weeks** for the remaining
  work and review queue. That is roughly **5–10 hours of hands-on work** if the policy and
  store assets are ready; creating them can add time. Google review times can vary.

## Steps to publish

### 1. Check your accounts and app identity

1. Sign in to the Expo account that owns this project and check the project:

   ```sh
   npx eas-cli login
   npx eas-cli project:info
   ```

2. Sign in to [Google Play Console](https://play.google.com/console/). Confirm your developer
   identity is verified and check whether your account is personal or organization, and when
   it was created. This determines whether the 12-tester/14-day rule applies.
3. Confirm that you own `com.tiger.vemori` and want to keep it. Google treats the Android
   package ID as permanent after the first Play upload. If you need to change it, do that
   before creating the Play app or uploading a build.
4. Confirm your app name is **Vemori** and choose the publisher name, support email, countries,
   and free/paid status you intend to use.

### 2. Confirm privacy disclosures and decide on AI

The in-app privacy page and matching public page are now updated and live at
[the Vemori privacy policy](https://vemori-card-suggestions.vemori-card-suggestions.workers.dev/privacy-policy).
The policy identifies the publisher through the Play listing and uses the listing's support
email as the privacy contact. Set a real support email in the Play listing before release.
If app data handling changes later, update the shared text in `src/data/privacyPolicy.ts`,
then ship the app change and redeploy the Worker so both versions stay in sync.

1. Complete Play Console's **Data safety** form and all **App content** declarations to match
   the final app and its SDKs. Do not claim that the AI-enabled app is fully offline.
2. Set a Groq spending limit. The Worker URL is public and rate limiting is only basic
   abuse protection. Decide whether to add stronger protection before broad public use.

If you decide to ship without AI, skip the production URL command in Step 6 and do not claim
AI suggestions in the store listing. The local OCR/parser flow will remain available.

### 3. Confirm permissions in the release build

The scan flow captures still photos and does not record audio. The repository config now
removes `android.permission.RECORD_AUDIO` and disables microphone access in both the camera
and image-picker plugins. The effective Android config was checked and no longer includes
that permission. Camera and read/write Contacts permissions remain for scanning and the
optional save-to-phone-Contacts flow. After building, inspect the AAB/Play Console permission
summary and confirm it matches those features.

### 4. Prepare the Play listing and release details

In Play Console, create the app if it does not exist. Complete:

- Store listing: app name, short/full descriptions, icon, phone screenshots, category, and
  support email.
- Privacy policy: public, working URL, also accessible from inside the app.
- App content: ads, app access, target audience, content rating, and permission declarations
  as applicable.
- Data safety: local contact storage, on-device OCR, optional copying to phone Contacts,
  user-triggered CSV export, and the optional text transfer to Worker/Groq if AI is enabled.
- Countries/regions and pricing.

Use screenshots of the current app and describe only features it actually has. Google requires
a privacy policy in Play Console and in the app, and a Data safety form for closed, open, and
production tracks. Apps active exclusively on internal testing are exempt from Data safety.

### 5. Build and check a preview APK

Your existing development build can keep using AI because its development URL is already set.
That URL is part of that build's configuration; it does not automatically configure a
separate preview or production build. Since the privacy screen and Android permissions have
now changed, make a new release build to include those changes.

If you want the preview APK to test AI, first set the Worker URL in EAS's `preview`
environment. This does not change the already configured `development` environment:

```sh
npx eas-cli env:set \
  --name EXPO_PUBLIC_GROQ_SUGGESTION_URL \
  --value https://vemori-card-suggestions.vemori-card-suggestions.workers.dev \
  --environment preview \
  --visibility plaintext
```

Build a preview to check the native Android app before making the store bundle:

```sh
npx eas-cli build --profile preview --platform android
```

Install it on a physical Android device. Check camera/gallery, OCR, AI consent and fallback,
field editing, local save/search/restart/delete, optional phone Contacts save, and CSV sharing.
You have already tested the shared sample cards; use this pass to check the complete release
flow and other devices if available.

Check the generated Android target API. As of November 18, 2026, new Play apps and updates
must target **Android 16 / API 36 or higher**. If this Expo SDK/build toolchain generates a
lower target, stop and upgrade/configure the Android build before publishing.

### 6. Set the production AI URL and build the Play bundle

If you are shipping AI, set the public URL in the EAS `production` environment. The
`development` variable does not set the production build variable:

```sh
npx eas-cli env:set \
  --name EXPO_PUBLIC_GROQ_SUGGESTION_URL \
  --value https://vemori-card-suggestions.vemori-card-suggestions.workers.dev \
  --environment production \
  --visibility plaintext
```

The URL is not a secret. Do not add `GROQ_API_KEY` to EAS or the app. Environment variables
are embedded during the build, so changing this URL later requires another build. Wrangler
publishes the server; it does not update the URL packaged inside an already-built app.

Now create the production Android App Bundle:

```sh
npx eas-cli build --profile production --platform android
```

On the first production build, EAS may ask about Android signing credentials. Use EAS-managed
credentials if this EAS project belongs to you/the publisher, and keep the recovery details
safe. A new local keystore is not required when EAS manages signing. Download the resulting
`.aab` and record its version and version code.

You do **not** need Android Studio for this EAS cloud build. The `preview` profile creates an
APK for installing and testing on a phone. The `production` profile creates the `.aab` that
Google Play accepts for a new app. Use the production build command above for Play upload.

### 7. Upload to a Play testing track

For the simplest first upload, upload the `.aab` manually:

Manual upload does not require a Google service-account JSON key. That key is needed only if
you choose to upload through EAS Submit.

1. In Play Console, open **Testing → Internal testing** and create a release.
2. Upload the production `.aab`, review errors and warnings, add release notes, and save/publish
   the internal test.
3. Add your tester email addresses and share the opt-in link. Install through Google Play.
4. Check the Play-installed build, not only the development build.

For a new personal developer account created after November 13, 2023, create a **closed**
test with at least 12 testers. They must remain opted in continuously for 14 days before you
apply for production access. Internal testing alone does not fulfill this requirement. Use the
Production Access application in the Play Console dashboard after the closed test; answer
accurately about the testing and feedback. Google may ask you to continue testing.

If your account is not subject to that rule, use internal/closed testing to verify the release
before production. The exact track requirements shown in your Play Console take precedence.

### 8. Request production and publish

After required testing and setup are complete:

1. Resolve Play Console errors and finish all required declarations.
2. If your account requires it, apply for and receive production access.
3. Open **Test and release → Production**, create the release, and select the tested AAB or
   upload the final one. Use a staged rollout if it is offered.
4. Review the release summary and submit it for Google review. After approval, complete the
   final publish/rollout action shown in Console.
5. Monitor the release, Android vitals, crash reports, reviews, and support email. If a serious
   issue appears, pause the rollout and prepare a fixed build with a higher version code.

Google review and publication are not instantaneous or guaranteed. Do not upload repeated
changes while a review is pending unless necessary; another submission can affect the queue.

### For later updates

Make the changes, build a new production AAB, and confirm EAS assigned a higher version code.
Test it on an internal or closed track when appropriate, upload/promote it to production, add
release notes, and submit it for review. You do not need to create another signing key.

## Official references

- [Google Play: app testing requirements for new personal accounts](https://support.google.com/googleplay/android-developer/answer/14151465)
- [Google Play: publish your app and review timing](https://support.google.com/googleplay/android-developer/answer/9859751)
- [Google Play: privacy and user data policy](https://support.google.com/googleplay/android-developer/answer/10144311)
- [Google Play: Data safety requirements](https://support.google.com/googleplay/android-developer/answer/10787469)
- [Google Play: target API level requirements](https://developer.android.com/google/play/requirements/target-sdk)
- [Expo: build Android apps](https://docs.expo.dev/build-reference/android-builds/)
- [Expo: submit to Google Play](https://docs.expo.dev/submit/android/)
- [Groq: data controls](https://console.groq.com/docs/your-data)
- [Cloudflare: Wrangler](https://developers.cloudflare.com/workers/wrangler/)
- [Cloudflare: Worker secrets](https://developers.cloudflare.com/workers/configuration/secrets/)
