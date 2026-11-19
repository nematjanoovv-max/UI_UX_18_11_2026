#!/bin/bash
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$DIR/.." && pwd)"
ANDROID_JAR="$ROOT_DIR/android-sdk/android.jar"

echo "=== 1. Syncing assets ==="
mkdir -p "$DIR/assets/www"
cp -r "$ROOT_DIR/assets" "$DIR/assets/www/"
cp "$ROOT_DIR/index.html" "$DIR/assets/www/"
cp "$ROOT_DIR/game.js" "$DIR/assets/www/"
cp "$ROOT_DIR/manifest.json" "$DIR/assets/www/"
cp "$ROOT_DIR/sw.js" "$DIR/assets/www/"
cp "$ROOT_DIR/icon.svg" "$DIR/assets/www/" 2>/dev/null || true

echo "=== 2. Preparing build directories ==="
rm -rf "$DIR/build" "$DIR/gen"
mkdir -p "$DIR/build/classes" "$DIR/gen"

echo "=== 3. Generating R.java ==="
aapt package -f -m -J "$DIR/gen" -M "$DIR/AndroidManifest.xml" -S "$DIR/res" -I "$ANDROID_JAR"

echo "=== 4. Compiling Java sources ==="
ecj -encoding UTF-8 -cp "$ANDROID_JAR" -d "$DIR/build/classes" \
    "$DIR/gen/com/lastgrid/towerdefense/R.java" \
    "$DIR/src/com/lastgrid/towerdefense/MainActivity.java"

echo "=== 5. Generating Dalvik Executable (classes.dex) ==="
dx --dex --output="$DIR/build/classes.dex" "$DIR/build/classes"

echo "=== 6. Packaging APK with resources and assets ==="
cd "$DIR"
aapt package -f -M AndroidManifest.xml -S res -A assets -I "$ANDROID_JAR" -F "$DIR/build/app-unsigned.apk"

echo "=== 7. Adding classes.dex into APK ==="
cd "$DIR/build"
aapt add app-unsigned.apk classes.dex
cd "$DIR"

echo "=== 8. 4-byte Zipaligning APK ==="
zipalign -p -f 4 "$DIR/build/app-unsigned.apk" "$DIR/build/app-aligned.apk"
zipalign -c 4 "$DIR/build/app-aligned.apk"
echo "Zipalign verified successfully!"

echo "=== 9. Ensuring Release Keystore ==="
KEYSTORE="$DIR/lastgrid_release.keystore"
if [ ! -f "$KEYSTORE" ]; then
    keytool -genkeypair -v \
        -keystore "$KEYSTORE" \
        -alias lastgrid \
        -keyalg RSA \
        -keysize 2048 \
        -validity 10000 \
        -storepass lastgrid2026 \
        -keypass lastgrid2026 \
        -dname "CN=TowerDefense LastGrid, OU=GameStudio, O=LastGridStudio, L=Tashkent, ST=Tashkent, C=UZ"
fi

echo "=== 10. Signing APK with Official Google apksigner (v1 + v2 + v3) ==="
FINAL_APK="$ROOT_DIR/TowerDefense_LastGrid_v4.0.0.apk"
apksigner sign \
    --ks "$KEYSTORE" \
    --ks-key-alias lastgrid \
    --ks-pass pass:lastgrid2026 \
    --key-pass pass:lastgrid2026 \
    --v1-signing-enabled true \
    --v2-signing-enabled true \
    --v3-signing-enabled true \
    --out "$FINAL_APK" \
    "$DIR/build/app-aligned.apk"

echo "=== 11. Verifying Signature Schemes ==="
apksigner verify --verbose "$FINAL_APK"

echo "=== 12. Copying to aliases and web distributions ==="
cp "$FINAL_APK" "$ROOT_DIR/last-grid.apk"
mkdir -p "$ROOT_DIR/web" "$ROOT_DIR/export/web"
cp "$FINAL_APK" "$ROOT_DIR/web/"
cp "$FINAL_APK" "$ROOT_DIR/web/last-grid.apk"
cp "$FINAL_APK" "$ROOT_DIR/export/web/"
cp "$FINAL_APK" "$ROOT_DIR/export/web/last-grid.apk"

echo "=== 13. AAPT Dump Badging ==="
aapt dump badging "$FINAL_APK"

echo "BUILD SUCCESSFUL!"
