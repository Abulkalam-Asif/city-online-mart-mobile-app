#!/usr/bin/env bash
# Builds a release APK (JavaScript bundled inside, no Metro needed). Does NOT install it.
# Run from the app/ folder:
#   ./release-apk.sh                          phone ABIs only (armeabi-v7a,arm64-v8a), the small APK
#   ./release-apk.sh --archs=arm64-v8a,x86_64 build only for the given ABIs (comma separated)
#   ./release-apk.sh --fast                   accepted so it matches debug-apk.sh; this script never cleans,
#                                             so every build is already incremental and the flag changes nothing
# The flag overrides reactNativeArchitectures in android/gradle.properties, so that file needs no edits.
# Run `npx expo prebuild --platform android` first if app.json, icons or native packages changed.
# Note: the generated android/ project signs release builds with the debug keystore, so this APK is
# for testing only, not for the Play Store.
set -eu

APK="android/app/build/outputs/apk/release/app-release.apk"
ARCHS="armeabi-v7a,arm64-v8a"

for arg in "$@"; do
  case "$arg" in
    --fast) ;; # no-op, see header
    --archs=*) ARCHS="${arg#--archs=}" ;;
    *) echo "Unknown option: $arg (use --fast, --archs=a,b)" >&2; exit 1 ;;
  esac
done

echo "Building for ABIs: $ARCHS"

# remove the old release APK so a failed build cannot leave a stale one behind
rm -f "$APK"

cd android
./gradlew :app:assembleRelease -PreactNativeArchitectures="$ARCHS"
cd ..

if [ ! -f "$APK" ]; then
  echo "Error: APK not found at $APK" >&2
  exit 1
fi

echo
echo "Release APK built (ABIs: $ARCHS):"
ls -lh "$APK"
echo "Full path: $(pwd)/$APK"
