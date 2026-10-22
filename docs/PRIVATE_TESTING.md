# Share Vemori privately with testers

Use the EAS `preview` build to give a few mentors an install link. This is a standalone app build: testers do not need Expo Go, a development server, or an Expo account. It is not listed publicly in an app store.

## Android

1. From the project directory, sign in to the Expo account that owns this EAS project and start a preview build:

   ```sh
   npx eas-cli login
   npx eas-cli build --profile preview --platform android
   ```

2. When the build finishes, open its EAS build page and copy the install link (or QR code).
3. Send the link to each mentor. They open it on an Android phone, download the APK, and approve Android's prompt to install an app from that source if asked.

The preview profile explicitly builds an APK, so testers can install it directly. Do not send the Metro QR code from `npx expo start`; that is for development and needs the computer's server to stay running.

## iPhone

For a private group of a few mentors, use EAS internal iOS distribution. It creates an `.ipa` and an install link, but Apple only allows that build to run on iPhones or iPads registered in its ad hoc provisioning profile. This requires an Apple Developer Program account.

1. In the project directory, run `npx eas-cli device:create` and choose the registration link/website option.
2. Send the generated device-registration link to each iPhone tester. They open it on their iPhone and follow the steps to register that device.
3. After all devices are registered, build the iOS preview:

   ```sh
   npx eas-cli build --profile preview --platform ios
   ```

4. Share the finished EAS build/install link with the mentors. Each registered device can install it. If you add another tester later, register their device and create a new build so that device is included.

TestFlight is another option. It avoids collecting device IDs and lets testers install through Apple's TestFlight app, but requires an App Store Connect record and beta setup. The first external-test build is reviewed by Apple before mentors can install it. See [Apple's TestFlight guide](https://developer.apple.com/testflight/).

## App name and icon

The installed app is configured to appear as **Vemori**, with the Vemori mark as its iOS icon, Android icon, and splash image. The name comes from `expo.name` in `app.json`; the artwork is in `assets/images/`.

## What testers should know

- Each person gets a separate local library on their own phone. Vemori does not sync contacts or notes between testers.
- Ask testers to try adding and editing a contact, scanning a card, searching, exporting, and restarting the app, then send you feedback directly.
- Testers can remove the app after the trial. Its locally stored Vemori data is removed with the app unless the device restores it from a backup.
