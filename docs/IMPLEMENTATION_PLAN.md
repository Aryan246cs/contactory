# Contactory implementation plan

This plan groups the complete product brief into three deliverable modules.

## Module 1 — App foundation and first impression

- Expo + React Native + TypeScript + Expo Router project setup.
- App identity, local design tokens, navigation shell, onboarding, and home screen.
- Local SQLite initialization and the foundational relational schema.
- Persist onboarding completion locally; no account or network dependency.

**Status:** Implemented. Dependencies installed; TypeScript, unit tests, and Expo public config validation pass. Physical-device validation remains pending.

## Module 2 — Card capture and contact extraction

- Camera permission and polished capture/preview flow.
- On-device OCR integration behind a platform-aware service boundary.
- Deterministic contact parsing, editable review, and explicit selection of multiple phone numbers.
- Honest loading and failure states; no upload or automatic save.

**Status:** Implemented. On-device OCR is wired through the native module and deterministic parser. Expo Go reports its missing native module clearly and still supports manual entry. OCR recognition itself needs validation in Android and iOS development builds.

## Module 3 — Contact memory and release readiness

- Repository-backed contact/phone/note create, edit, detail, and delete workflows.
- Search across identity and memory, native Contacts export, and CSV share/export.
- Settings, dark mode, accessibility/performance polish, privacy and store documents.
- Automated coverage, EAS development/preview/production validation, and real-device checklist.

**Status:** Contact CRUD, local search, optional phone Contacts handoff, CSV export, local suggested/custom tags and groups, duplicate review/merge, graphite and green theme polish, privacy draft, store checklist, deployment guide, and real-device checklist are implemented. TypeScript passes. App behavior, accessibility/performance, Expo Doctor, native builds, and physical-device validation remain for the release testing pass.

## Module 1 handoff

The home action now opens the camera flow. The Expo Go runtime limitation is explained at the OCR step. No fake contact records or OCR results are included.
