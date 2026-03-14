## Running expo app on android device wirelessly

- Turn on **Wireless Debugging** on the device.
- `adb pair [device_ip]:[port]` Get `device_ip` and `port` from **Wireless Debugging** settings.
- Install apk: `adb -s [device_id] install -r d:\city-online-mart\app\android\app\build\outputs\apk\debug\app-debug.apk`
- Reverse port: `adb -s [device_id] reverse tcp:8081 tcp:8081`
- Run: `npx expo start --dev-client`

## The older way:

- Connect device via USB
- `adb tcpip 5555`
- `adb connect [device_ip]:5555` Get `device_ip` from **My Phone**
- Disconnect USB
- Reverse port: `adb -s [device_id] reverse tcp:8081 tcp:8081`
- Run: `npx expo start --dev-client`
