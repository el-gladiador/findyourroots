#!/bin/bash

# Create proper PWA icons from favicon
cd /home/mamiri@irs.local/Projects/personal/findyourroots/public

echo "Creating PWA icons..."

# Try using favicon.ico if available
if command -v convert &> /dev/null; then
    echo "Using ImageMagick to convert favicon..."
    convert ../src/app/favicon.ico -resize 16x16 icon-16x16.png
    convert ../src/app/favicon.ico -resize 32x32 icon-32x32.png
    convert ../src/app/favicon.ico -resize 48x48 icon-48x48.png
    convert ../src/app/favicon.ico -resize 72x72 icon-72x72.png
    convert ../src/app/favicon.ico -resize 96x96 icon-96x96.png
    convert ../src/app/favicon.ico -resize 144x144 icon-144x144.png
    convert ../src/app/favicon.ico -resize 150x150 icon-150x150.png
    convert ../src/app/favicon.ico -resize 192x192 icon-192x192.png
    convert ../src/app/favicon.ico -resize 310x310 icon-310x310.png
    convert ../src/app/favicon.ico -resize 512x512 icon-512x512.png
    convert ../src/app/favicon.ico -resize 180x180 apple-touch-icon.png
    echo "Icons created successfully!"
else
    echo "ImageMagick not available. Please install it or create icons manually."
    echo "For now, copying favicon.ico as a temporary solution..."
    
    # Copy favicon.ico to different names as a temporary fix
    cp ../src/app/favicon.ico icon-16x16.ico
    cp ../src/app/favicon.ico icon-32x32.ico
    cp ../src/app/favicon.ico icon-48x48.ico
    cp ../src/app/favicon.ico icon-72x72.ico
    cp ../src/app/favicon.ico icon-96x96.ico
    cp ../src/app/favicon.ico icon-144x144.ico
    cp ../src/app/favicon.ico icon-150x150.ico
    cp ../src/app/favicon.ico icon-192x192.ico
    cp ../src/app/favicon.ico icon-310x310.ico
    cp ../src/app/favicon.ico icon-512x512.ico
    cp ../src/app/favicon.ico apple-touch-icon.ico
fi
