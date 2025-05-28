const fs = require('fs');
const path = require('path');

// Create a simple colored PNG icon using Canvas API (simulated)
// Since we don't have canvas available, we'll create a simple SVG and convert it
function createSVGIcon(size, color = '#3b82f6') {
  return `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="${color}" rx="8"/>
  <text x="${size/2}" y="${size/2 + size/8}" font-family="Arial, sans-serif" font-size="${size/3}" font-weight="bold" text-anchor="middle" fill="white">🌳</text>
</svg>`;
}

// Convert SVG to PNG using a simple approach
async function createPNGFromSVG(svgContent, outputPath) {
  // For now, let's create a simple colored square PNG manually
  // This is a minimal PNG header for a colored square
  const createSimplePNG = (width, height, r, g, b) => {
    // Create a simple PNG programmatically 
    // This is simplified - in production you'd use a proper image library
    const header = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
    ]);
    
    // IHDR chunk
    const ihdr = Buffer.alloc(25);
    ihdr.writeUInt32BE(13, 0); // length
    ihdr.write('IHDR', 4);
    ihdr.writeUInt32BE(width, 8);
    ihdr.writeUInt32BE(height, 12);
    ihdr.writeUInt8(8, 16); // bit depth
    ihdr.writeUInt8(2, 17); // color type (RGB)
    ihdr.writeUInt8(0, 18); // compression
    ihdr.writeUInt8(0, 19); // filter
    ihdr.writeUInt8(0, 20); // interlace
    
    // Calculate CRC for IHDR
    const crc32 = require('zlib').crc32;
    const ihdrCrc = crc32(ihdr.slice(4, 21));
    ihdr.writeUInt32BE(ihdrCrc, 21);
    
    // Simple IDAT chunk with solid color
    const pixelData = Buffer.alloc(width * height * 3 + height); // RGB + filter bytes
    for (let y = 0; y < height; y++) {
      pixelData[y * (width * 3 + 1)] = 0; // filter byte
      for (let x = 0; x < width; x++) {
        const idx = y * (width * 3 + 1) + 1 + x * 3;
        pixelData[idx] = r;
        pixelData[idx + 1] = g;
        pixelData[idx + 2] = b;
      }
    }
    
    const compressed = require('zlib').deflateSync(pixelData);
    const idat = Buffer.alloc(8 + compressed.length + 4);
    idat.writeUInt32BE(compressed.length, 0);
    idat.write('IDAT', 4);
    compressed.copy(idat, 8);
    const idatCrc = crc32(idat.slice(4, 8 + compressed.length));
    idat.writeUInt32BE(idatCrc, 8 + compressed.length);
    
    // IEND chunk
    const iend = Buffer.from([0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82]);
    
    return Buffer.concat([header, ihdr, idat, iend]);
  };
  
  // Create a blue icon (family tree theme)
  const pngData = createSimplePNG(parseInt(outputPath.match(/(\d+)x\d+/)[1]), parseInt(outputPath.match(/\d+x(\d+)/)[1]), 59, 130, 246);
  fs.writeFileSync(outputPath, pngData);
}

async function generateIcons() {
  const publicDir = path.join(__dirname, '..', 'public');
  const sizes = [16, 32, 48, 72, 96, 144, 150, 192, 310, 512];
  
  console.log('Generating PWA icons...');
  
  for (const size of sizes) {
    const filename = `icon-${size}x${size}.png`;
    const filepath = path.join(publicDir, filename);
    
    console.log(`Creating ${filename}...`);
    await createPNGFromSVG('', filepath);
  }
  
  // Create apple-touch-icon (180x180)
  console.log('Creating apple-touch-icon.png...');
  const appleTouchIconPath = path.join(publicDir, 'apple-touch-icon.png');
  await createPNGFromSVG('', appleTouchIconPath.replace('apple-touch-icon', 'icon-180x180'));
  
  console.log('All icons generated successfully!');
}

if (require.main === module) {
  generateIcons().catch(console.error);
}

module.exports = { generateIcons };
