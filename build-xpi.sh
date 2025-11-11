#!/bin/bash
# Build script for Kokoro TTS Firefox addon

set -e

# Get version from manifest.json
VERSION=$(grep -oP '"version":\s*"\K[^"]+' manifest.json)

# XPI filename
XPI_NAME="kokoro-tts-addon-v${VERSION}.xpi"

# Remove old XPI if exists
rm -f *.xpi

# Create XPI
echo "Building ${XPI_NAME}..."
zip -r "${XPI_NAME}" \
    manifest.json \
    background.js \
    content.js \
    popup.html \
    popup.js \
    player.html \
    player.js \
    styles.css \
    icons/

echo "✓ Successfully created ${XPI_NAME}"
echo ""
echo "To install in Firefox:"
echo "1. Go to about:addons"
echo "2. Click the gear icon → 'Install Add-on From File...'"
echo "3. Select ${XPI_NAME}"
