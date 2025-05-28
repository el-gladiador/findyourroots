#!/bin/bash

# PWA Icon Generator Script
# Creates only the essential icons needed for a PWA from favicon.ico

set -e  # Exit on any error

echo "🎨 PWA Icon Generator - Creating essential icons..."

# Define the project directories
PROJECT_ROOT="/home/mamiri@irs.local/Projects/personal/findyourroots"
PUBLIC_DIR="$PROJECT_ROOT/public"
FAVICON_PATH="$PROJECT_ROOT/src/app/favicon.ico"

# Check if favicon exists
if [ ! -f "$FAVICON_PATH" ]; then
    echo "❌ Error: favicon.ico not found at $FAVICON_PATH"
    exit 1
fi

# Check if ImageMagick is available
if ! command -v convert &> /dev/null; then
    echo "❌ Error: ImageMagick is not installed. Please install it first:"
    echo "   sudo apt install imagemagick"
    exit 1
fi

# Change to public directory
cd "$PUBLIC_DIR"

echo "📁 Working in: $PUBLIC_DIR"
echo "🔍 Using favicon: $FAVICON_PATH"

# Define only the essential icon sizes for PWA
# These are the minimum required for PWA functionality
declare -A ICONS=(
    ["16"]="favicon and browser tab"
    ["32"]="favicon and browser tab"
    ["192"]="Android home screen and splash"
    ["512"]="Android home screen and splash"
    ["180"]="iOS home screen (apple-touch-icon)"
)

echo ""
echo "🚀 Generating essential PWA icons..."

# Generate each icon
for size in "${!ICONS[@]}"; do
    if [ "$size" = "180" ]; then
        # Special case for Apple touch icon
        output_file="apple-touch-icon.png"
        echo "  📱 Creating $output_file (${size}x${size}) - ${ICONS[$size]}"
    else
        output_file="icon-${size}x${size}.png"
        echo "  🖼️  Creating $output_file (${size}x${size}) - ${ICONS[$size]}"
    fi
    
    # Convert favicon to PNG with specified size (use [0] to get first icon from ICO)
    if convert "$FAVICON_PATH[0]" -resize "${size}x${size}" "$output_file" 2>/dev/null; then
        # Verify the created file
        if [ -f "$output_file" ] && [ -s "$output_file" ]; then
            file_size=$(stat -c%s "$output_file")
            echo "     ✅ Created successfully (${file_size} bytes)"
        else
            echo "     ❌ Failed to create or file is empty"
            exit 1
        fi
    else
        echo "     ❌ ImageMagick conversion failed for size ${size}"
        exit 1
    fi
done

echo ""
echo "🔍 Verifying created icons..."

# Verify all icons were created and are valid
for size in "${!ICONS[@]}"; do
    if [ "$size" = "180" ]; then
        icon_file="apple-touch-icon.png"
    else
        icon_file="icon-${size}x${size}.png"
    fi
    
    if [ -f "$icon_file" ]; then
        # Check if it's a valid PNG
        if file "$icon_file" | grep -q "PNG image"; then
            echo "  ✅ $icon_file - Valid PNG"
        else
            echo "  ❌ $icon_file - Invalid PNG format"
            exit 1
        fi
    else
        echo "  ❌ $icon_file - Missing"
        exit 1
    fi
done

# Also copy favicon.ico to public for browsers that request it directly
echo ""
echo "📋 Copying favicon.ico to public directory..."
if cp "$FAVICON_PATH" "favicon.ico"; then
    echo "  ✅ favicon.ico copied successfully"
else
    echo "  ❌ Failed to copy favicon.ico"
    exit 1
fi

echo ""
echo "🎉 PWA Icon Generation Complete!"
echo ""
echo "📊 Summary of created files:"
echo "   • favicon.ico (copied from src/app/)"
echo "   • icon-16x16.png (browser favicon)"
echo "   • icon-32x32.png (browser favicon)"
echo "   • icon-192x192.png (Android PWA)"
echo "   • icon-512x512.png (Android PWA)"
echo "   • apple-touch-icon.png (iOS PWA)"
echo ""
echo "🔧 These icons are now ready for your PWA manifest.json!"
echo "   The manifest.json should reference these exact filenames."
