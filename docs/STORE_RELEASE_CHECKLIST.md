# Vemori store release checklist

## Google Play

- [ ] Replace the example Android package ID with an owned identifier.
- [ ] Set up the Google Play developer account and internal testing track.
- [ ] Prepare the app icon, phone/tablet screenshots, store description, and support URL.
- [ ] Publish a hosted privacy policy matching the final native data flows.
- [ ] Complete Data Safety disclosures and explain camera, local contact storage, OCR, and optional Contacts writes.
- [ ] Review content rating and permission disclosures.
- [ ] Build and validate a production AAB; review signing ownership and key backup.
- [ ] Complete closed/open testing requirements and staged production rollout.

## Apple App Store

- [ ] Replace the example iOS bundle ID with an owned identifier.
- [ ] Set up the Apple Developer account and App Store Connect record.
- [ ] Prepare the app icon, supported-device screenshots, description, keywords, and support URL.
- [ ] Publish a hosted privacy policy matching the final native data flows.
- [ ] Complete App Privacy details and permission descriptions.
- [ ] Validate camera and Contacts denial paths and all supported device sizes.
- [ ] Build and distribute through TestFlight; complete App Review notes.
- [ ] Submit the production build and respond to App Review.

Store approval, signing, and account access require publisher action and are not claimed by this project.

For the full first-time walkthrough, account setup, EAS build commands, and backend/cost guidance, see [DEPLOYMENT_AND_PUBLISHING.md](DEPLOYMENT_AND_PUBLISHING.md).
