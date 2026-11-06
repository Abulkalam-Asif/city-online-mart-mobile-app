# Build commands (Android APKs)

Run everything from the `app/` folder in **Git Bash**. The scripts pass `--archs` to Gradle as
`-PreactNativeArchitectures`, which overrides `android/gradle.properties`, so that file never needs editing.

## The 3 commands I use

```bash
# 1. Debug, every ABI (phones + emulators). Biggest APK, slowest build.
./debug-apk.sh --fast --archs=armeabi-v7a,arm64-v8a,x86,x86_64

# 2. Debug, phones only. Normal day-to-day build for the real device.
./debug-apk.sh --fast --archs=armeabi-v7a,arm64-v8a

# 3. Release, phones only. Small APK for sharing/testing.
./release-apk.sh --fast --archs=armeabi-v7a,arm64-v8a
```

After a debug build: `./run-debug.sh` installs it on the phone, opens the app and starts Metro.
The release APK is not installed by the script; its path is printed at the end
(`android/app/build/outputs/apk/release/app-release.apk`).

## Which ABI is which

| ABI | Runs on |
|---|---|
| `arm64-v8a` | Almost every modern phone (64-bit ARM) |
| `armeabi-v7a` | Older / low-end phones (32-bit ARM) |
| `x86_64` | Android Studio emulator on a PC (64-bit) |
| `x86` | Old 32-bit emulator images (rarely needed) |

Each extra ABI adds its own native libraries, so the APK gets bigger and the build slower.
Build only what the target device needs. Installing an APK on a device whose ABI is missing from it
crashes at launch (native libraries not found).

## Other versions

```bash
# Emulator only (fastest emulator build)
./debug-apk.sh --fast --archs=x86_64

# One phone ABI only (fastest build for a modern phone)
./debug-apk.sh --fast --archs=arm64-v8a

# Phone + 64-bit emulator
./debug-apk.sh --fast --archs=arm64-v8a,x86_64

# Release for the emulator, to test the release build there
./release-apk.sh --archs=x86_64

# Default ABIs (armeabi-v7a,arm64-v8a) when --archs is left out
./debug-apk.sh --fast
./release-apk.sh
```

## Options

| Option | `debug-apk.sh` | `release-apk.sh` |
|---|---|---|
| `--archs=a,b` | ABIs to build, comma separated, no spaces. Default `armeabi-v7a,arm64-v8a` | Same |
| `--fast` | Skips the clean step (incremental build). Without it: deletes `android/app/.cxx` and `android/app/build`, runs codegen and `gradlew clean` first | Accepted but does nothing: the release script never cleans |

## When to drop `--fast` (debug)

Use plain `./debug-apk.sh --archs=...` (clean build, slow) after a native change (new native package,
`app.json` permissions or plugins, `expo prebuild`) or when the build looks stale (missing module,
old code). Native changes also need `npx expo prebuild --platform android` first.
JavaScript-only changes need no new APK.

## Checking what was built

An APK is a zip: `unzip -l android/app/build/outputs/apk/debug/app-debug.apk | grep "lib/"` lists the ABI
folders inside it (`lib/arm64-v8a/`, ...). The script also prints the ABIs and the file size at the end.
