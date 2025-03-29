import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SCREENSHOTS_DIR = path.join(__dirname, 'client/public/screenshots');

// Lista de screenshots SVG para converter
const SCREENSHOTS = [
  'explore-screen',
  'chat-screen',
  'profile-screen'
];

async function generateScreenshots() {
  try {
    // Verifica se o diretório existe
    if (!fs.existsSync(SCREENSHOTS_DIR)) {
      console.error(`Diretório de screenshots não encontrado: ${SCREENSHOTS_DIR}`);
      return;
    }

    let convertedCount = 0;

    // Converte cada screenshot SVG para PNG
    for (const screenshot of SCREENSHOTS) {
      const svgFile = path.join(SCREENSHOTS_DIR, `${screenshot}.svg`);
      const pngFile = path.join(SCREENSHOTS_DIR, `${screenshot}.png`);
      
      if (!fs.existsSync(svgFile)) {
        console.error(`Arquivo SVG não encontrado: ${svgFile}`);
        continue;
      }
      
      await sharp(svgFile)
        .resize(1080, 1920)
        .png()
        .toFile(pngFile);
      
      convertedCount++;
      console.log(`Screenshot convertido: ${pngFile}`);
    }

    console.log(`\nTotal de ${convertedCount} screenshots convertidos com sucesso!`);
  } catch (error) {
    console.error('Erro ao gerar screenshots:', error);
  }
}

// Executa a função principal
generateScreenshots();