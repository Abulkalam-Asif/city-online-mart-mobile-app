# install-all.ps1
Write-Host "Building APK with support for all architectures..."
Write-Host ""

# Build the APK first
cd android
.\gradlew assembleDebug
cd ..

$apkPath = "android\app\build\outputs\apk\debug\app-debug.apk"

# Check if APK exists
if (-not (Test-Path $apkPath)) {
    Write-Host "Error: APK not found at $apkPath" -ForegroundColor Red
    exit 1
}

Write-Host "`nAPK built successfully!"
Write-Host "Installing on all connected devices...`n"

# Get all device IDs
$devices = adb devices | Select-String "device$" | ForEach-Object { ($_ -split '\s+')[0] }

foreach ($device in $devices) {
    Write-Host "Installing on $device..." -ForegroundColor Cyan
    adb -s $device install -r $apkPath
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Opening app on $device..." -ForegroundColor Green
        adb -s $device shell am start -n com.abulkalamasif.ecommercemobileapp/.MainActivity
    } else {
        Write-Host "Failed to install on $device" -ForegroundColor Red
    }
    Write-Host ""
}

Write-Host "Installation complete!" -ForegroundColor Green