# clean app build folder
rm -r android/app/.cxx; rm -r android/app/build;

# generate codegen artifacts and clean app
cd android
./gradlew :app:generateCodegenArtifactsFromSchema
./gradlew clean

# build debug apk
./gradlew :app:assembleDebug

# install
adb -s adb-0608133126105749-NeSc3g._adb-tls-connect._tcp install -r d:\city-online-mart\app\android\app\build\outputs\apk\debug\app-debug.apk

# reverse port
adb -s adb-0608133126105749-NeSc3g._adb-tls-connect._tcp reverse tcp:8081 tcp:8081

# run
npx expo start --dev-client