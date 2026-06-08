import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const svgPath = path.resolve('public/icon-512.svg');
const out512 = path.resolve('public/icon-512.png');
const out192 = path.resolve('public/icon-192.png');
const out180 = path.resolve('public/icon-180.png');
const outApple = path.resolve('public/apple-touch-icon.png');
const outApplePre = path.resolve('public/apple-touch-icon-precomposed.png');

async function convert() {
  try {
    if (!fs.existsSync(svgPath)) {
      console.error(`Error: SVG icon source not found at ${svgPath}`);
      return;
    }
    
    console.log('Converting vector SVG to premium iOS & Android compatible PNG formats...');
    
    // 1. Generate 512x512
    await sharp(svgPath)
      .resize(512, 512)
      .png()
      .toFile(out512);
    console.log('Success: Generated public/icon-512.png');

    // 2. Generate 192x192
    await sharp(svgPath)
      .resize(192, 192)
      .png()
      .toFile(out192);
    console.log('Success: Generated public/icon-192.png');

    // 3. Generate 180x180 (iOS Apple Touch Icon standard spec)
    await sharp(svgPath)
      .resize(180, 180)
      .png()
      .toFile(out180);
    console.log('Success: Generated public/icon-180.png');
    
    // 4. Generate apple-touch-icon.png (general iOS root fallback search patterns)
    await sharp(svgPath)
      .resize(180, 180)
      .png()
      .toFile(outApple);
    console.log('Success: Generated public/apple-touch-icon.png');

    // 5. Generate apple-touch-icon-precomposed.png (Android / older iOS root fallback)
    await sharp(svgPath)
      .resize(180, 180)
      .png()
      .toFile(outApplePre);
    console.log('Success: Generated public/apple-touch-icon-precomposed.png');
    
    console.log('Icon conversion complete!');
  } catch (error) {
    console.error('Failed to convert icons:', error);
  }
}

convert();
