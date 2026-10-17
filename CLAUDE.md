# Mobile app (React Native / Expo)

Part of City Online Mart. Read the root `../CLAUDE.md` first (hard rules, docs index); this file only adds what is specific to `app/`.

## Layout

- `src/app/` Expo Router routes: `(auth)`, `(tabs)`, `(checkout-payments)`, `order-details`, `product-details`.
- `src/components/` by area (`auth`, `order-details`, `product-details`, `tabs`, `common`, ...).
- `src/services/` Firebase calls. Register new ones in `services/index.ts`. `cartService` is static (AsyncStorage, no Firebase).
- `src/contexts/` (`CityContext`, `AuthContext`, `CartContext`, `ModalContext`), `src/lib/` (`cityFirebase.ts`, `react-query.ts`), `src/hooks/`, `src/types/`, `src/utils/`. `@/` = `src/`.
- Uses `@react-native-firebase` (native modules), not the web Firebase SDK. Types come from `FirebaseFirestoreTypes`; admin uses the web SDK, so shared entities (orders, refunds) are copied by hand and must be kept in sync.

## Commands

```powershell
npm run start                       # Metro
npm run lint ; npx tsc --noEmit     # run both before finishing a change
powershell ./install-all.ps1        # build debug APK and install on all connected devices
```

No automated tests exist in this repo. Real-device setup: `../docs/ANDROID_WIRELESS_DEBUGGING.md`.

## Gotchas

- Native code changes (new native package, `app.json` permissions, plugins) need a new APK; JavaScript changes do not.
- This is a **dev-client** build, not Expo Go. Firebase native modules do not run in Expo Go.
- City-scoped storage: auth and cart keys include the city. Never add a generic key like `@auth_user` (see `admin/docs/business-rules/multi-city.md`).
- On city switch the React Query cache is cleared; keep query keys free of data from another city.
- Receipts are PDFs captured from `HiddenCaptureView.tsx`; mirror any change to the admin print receipt (`AdminPrintReceipt.tsx`).
- `.env` and `google-services.json` are environment-specific; do not commit changes to them casually.

## Before opening a PR

Lint and `tsc` pass; test on a device when UI or native code changed. Branch from and PR into `dev`.
