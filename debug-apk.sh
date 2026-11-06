#!/usr/bin/env bash
# Builds the debug APK only. Does NOT install it or start Metro (see run-debug.sh for that).
# Run from the app/ folder:
#   ./debug-apk.sh                              clean build (slow, use after native changes or when something looks stale)
#   ./debug-apk.sh --fast                       skip the clean step (incremental build)
#   ./debug-apk.sh --archs=x86_64               build only for the given ABIs (comma separated)
#   ./debug-apk.sh --fast --archs=arm64-v8a,x86_64
# ABIs: armeabi-v7a, arm64-v8a (phones), x86, x86_64 (emulators). Default: armeabi-v7a,arm64-v8a.
# The flag overrides reactNativeArchitectures in android/gradle.properties, so that file needs no edits.
# Run `npx expo prebuild --platform android` first if app.json, icons or native packages changed.
set -eu

APK="android/app/build/outputs/apk/debug/app-debug.apk"
ARCHS="armeabi-v7a,arm64-v8a"
FAST=0

for arg in "$@"; do
  case "$arg" in
    --fast) FAST=1 ;;
    --archs=*) ARCHS="${arg#--archs=}" ;;
    *) echo "Unknown option: $arg (use --fast, --archs=a,b)" >&2; exit 1 ;;
  esac
done

echo "Building for ABIs: $ARCHS"

if [ "$FAST" -eq 0 ]; then
  # clean app build folder
  rm -rf android/app/.cxx android/app/build
fi

cd android

if [ "$FAST" -eq 0 ]; then
  # generate codegen artifacts and clean app
  ./gradlew :app:generateCodegenArtifactsFromSchema -PreactNativeArchitectures="$ARCHS"
  ./gradlew clean -PreactNativeArchitectures="$ARCHS"
fi

# build debug apk
./gradlew :app:assembleDebug -PreactNativeArchitectures="$ARCHS"
cd ..

if [ ! -f "$APK" ]; then
  echo "Error: APK not found at $APK" >&2
  exit 1
fi

echo
echo "Debug APK built (ABIs: $ARCHS):"
ls -lh "$APK"
echo "Next: ./run-debug.sh"
