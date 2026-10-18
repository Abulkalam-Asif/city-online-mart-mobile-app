#!/usr/bin/env bash
# Installs the debug APK on a phone, opens the app, forwards port 8081 and starts the dev server.
# Run from the app/ folder (build the APK first with ./debug-apk.sh):
#   ./run-debug.sh                         uses the first connected device
#   ADB_DEVICE=<id> ./run-debug.sh         uses a specific device (ids: `adb devices`)
set -eu

APK="android/app/build/outputs/apk/debug/app-debug.apk"
PACKAGE="com.cityonlinemart.com"

if [ ! -f "$APK" ]; then
  echo "Error: APK not found at $APK. Run ./debug-apk.sh first." >&2
  exit 1
fi

# pick the device (adb.exe prints CRLF, so strip \r)
DEVICE="${ADB_DEVICE:-$(adb devices | tr -d '\r' | awk '$2 == "device" { print $1; exit }')}"
if [ -z "$DEVICE" ]; then
  echo "Error: no connected device. Connect the phone (see docs/ANDROID_WIRELESS_DEBUGGING.md) and retry." >&2
  exit 1
fi
echo "Using device: $DEVICE"

# install
adb -s "$DEVICE" install -r "$APK"

# reverse port, so the phone reaches Metro on this PC
adb -s "$DEVICE" reverse tcp:8081 tcp:8081

# open the app
adb -s "$DEVICE" shell monkey -p "$PACKAGE" -c android.intent.category.LAUNCHER 1 >/dev/null 2>&1 || true

# run the dev server
npx expo start --dev-client
