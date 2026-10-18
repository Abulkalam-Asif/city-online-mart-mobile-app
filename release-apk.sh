#!/usr/bin/env bash
# Builds a release APK (JavaScript bundled inside, no Metro needed). Does NOT install it.
# Run from the app/ folder: ./release-apk.sh
# Run `npx expo prebuild --platform android` first if app.json, icons or native packages changed.
# Note: the generated android/ project signs release builds with the debug keystore, so this APK is
# for testing only, not for the Play Store.
set -eu

APK="android/app/build/outputs/apk/release/app-release.apk"

# remove the old release APK so a failed build cannot leave a stale one behind
rm -f "$APK"

cd android
./gradlew :app:assembleRelease
cd ..

if [ ! -f "$APK" ]; then
  echo "Error: APK not found at $APK" >&2
  exit 1
fi

echo
echo "Release APK built:"
ls -lh "$APK"
echo "Full path: $(pwd)/$APK"
