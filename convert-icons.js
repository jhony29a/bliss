import sharp from 'sharp';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function convertSvgToPng() {
  const sizes = [192, 512];
  
  for (const size of sizes) {
    const svgBuffer = readFileSync(path.join(__dirname, `client/public/icons/icon-${size}x${size}.svg`));
    
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(path.join(__dirname, `client/public/icons/icon-${size}x${size}.png`));
      
    console.log(`Converted icon-${size}x${size}.svg to PNG`);
  }
}

convertSvgToPng().catch(err => console.error('Error converting icons:', err));