#!/usr/bin/env node

const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

console.log('🎨 Generating PWA icons from SVG...');

// Icon sizes matching your manifest.json
const ICON_SIZES = [
  { size: 16, name: 'icon-16x16.png' },
  { size: 32, name: 'icon-32x32.png' },
  { size: 192, name: 'icon-192x192.png' },
  { size: 512, name: 'icon-512x512.png' },
  { size: 180, name: 'apple-touch-icon.png' }  // For Apple devices
];

async function generateIconsFromSVG() {
  try {
    const sourcePath = './public/file.svg';
    const outputDir = './public';
    
    console.log('📂 Checking source SVG...');
    await fs.access(sourcePath);
    console.log('✅ Source SVG found: file.svg');
    
    // Analyze the SVG
    console.log('🔍 Analyzing SVG...');
    const svgImage = sharp(sourcePath);
    const metadata = await svgImage.metadata();
    console.log(`📊 SVG info: ${metadata.width || 'auto'}x${metadata.height || 'auto'} (${metadata.format})`);
    
    console.log('🚀 Generating icon sizes...');
    
    // Generate each icon size
    for (const icon of ICON_SIZES) {
      try {
        const outputPath = path.join(outputDir, icon.name);
        console.log(`  ⏳ Creating ${icon.name}...`);
        
        await sharp(sourcePath)
          .resize(icon.size, icon.size, {
            fit: 'contain',
            background: { r: 255, g: 255, b: 255, alpha: 0 } // Transparent background
          })
          .png({ 
            quality: 100,
            compressionLevel: 6,
            adaptiveFiltering: true
          })
          .toFile(outputPath);
        
        console.log(`  ✅ Generated ${icon.name} (${icon.size}x${icon.size})`);
      } catch (iconError) {
        console.error(`  ❌ Failed to create ${icon.name}:`, iconError.message);
      }
    }
    
    // Generate favicon.ico
    try {
      console.log('🔍 Creating favicon.ico...');
      const faviconPath = path.join(outputDir, 'favicon.ico');
      await sharp(sourcePath)
        .resize(32, 32, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .png()
        .toFile(faviconPath);
      console.log('✅ Generated favicon.ico');
    } catch (faviconError) {
      console.error('❌ Failed to create favicon.ico:', faviconError.message);
    }
    
    // Create a square version with background for better PWA compatibility
    try {
      console.log('🎯 Creating square version with background...');
      const squarePath = path.join(outputDir, 'icon-square-512.png');
      await sharp(sourcePath)
        .resize(512, 512, {
          fit: 'contain',
          background: { r: 59, g: 130, b: 246, alpha: 1 } // Blue background matching your app theme
        })
        .png({ quality: 100 })
        .toFile(squarePath);
      console.log('✅ Generated icon-square-512.png (with blue background)');
    } catch (squareError) {
      console.error('❌ Failed to create square version:', squareError.message);
    }
    
    console.log('\n🎉 SVG to PWA icons generation complete!');
    console.log('📊 Generated files:');
    for (const icon of ICON_SIZES) {
      console.log(`   • ${icon.name}`);
    }
    console.log('   • favicon.ico');
    console.log('   • icon-square-512.png (with background)');
    
    console.log('\n💡 Icon info:');
    console.log('   • All icons have transparent backgrounds');
    console.log('   • SVG scales perfectly to all sizes');
    console.log('   • Square version includes blue background for PWA');
    console.log('   • Icons match your manifest.json configuration');
    
    // Verify all expected files exist
    console.log('\n🔍 Verifying generated files...');
    for (const icon of ICON_SIZES) {
      try {
        await fs.access(path.join(outputDir, icon.name));
        console.log(`   ✅ ${icon.name} exists`);
      } catch {
        console.log(`   ❌ ${icon.name} missing`);
      }
    }
    
  } catch (error) {
    console.error('❌ Generation failed:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// Run the generation
generateIconsFromSVG();
