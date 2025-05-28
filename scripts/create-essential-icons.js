// Simple script to copy favicon as base icons and create proper PWA setup
const fs = require('fs');
const path = require('path');

const publicDir = '/home/mamiri@irs.local/Projects/personal/findyourroots/public';
const faviconPath = '/home/mamiri@irs.local/Projects/personal/findyourroots/src/app/favicon.ico';

// Essential PWA icon sizes
const requiredIcons = [
  { name: 'icon-192x192.png', size: '192x192' },
  { name: 'icon-512x512.png', size: '512x512' },
  { name: 'apple-touch-icon.png', size: '180x180' }
];

console.log('Creating essential PWA icons...');

// For now, copy the favicon.ico as PNG files (browsers can handle ico files as images)
// This is a temporary solution until proper image conversion is available
for (const icon of requiredIcons) {
  const targetPath = path.join(publicDir, icon.name);
  try {
    fs.copyFileSync(faviconPath, targetPath);
    console.log(`Created ${icon.name}`);
  } catch (error) {
    console.error(`Error creating ${icon.name}:`, error.message);
  }
}

console.log('Essential PWA icons created!');
