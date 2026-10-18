#!/usr/bin/env bash
# Builds the debug APK only. Does NOT install it or start Metro (see run-debug.sh for that).
# Run from the app/ folder:
#   ./debug-apk.sh          clean build (slow, use after native changes or when something looks stale)
#   ./debug-apk.sh --fast   skip the clean step (incremental build)
# Run `npx expo prebuild --platform android` first if app.json, icons or native packages changed.
set -eu

APK="android/app/build/outputs/apk/debug/app-debug.apk"

if [ "${1:-}" != "--fast" ]; then
  # clean app build folder
  rm -rf android/app/.cxx android/app/build
fi

cd android

if [ "${1:-}" != "--fast" ]; then
  # generate codegen artifacts and clean app
  ./gradlew :app:generateCodegenArtifactsFromSchema
  ./gradlew clean
fi

# build debug apk
./gradlew :app:assembleDebug
cd ..

if [ ! -f "$APK" ]; then
  echo "Error: APK not found at $APK" >&2
  exit 1
fi

echo
echo "Debug APK built:"
ls -lh "$APK"
echo "Next: ./run-debug.sh"
