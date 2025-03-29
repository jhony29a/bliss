import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INPUT_SVG = path.join(__dirname, 'client/public/icons/bliss-icon.svg');
const OUTPUT_DIR = path.join(__dirname, 'client/public/icons');

// Garante que o diretório de saída existe
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Tamanhos de ícones para gerar
const ICON_SIZES = [72, 96, 128, 144, 152, 192, 384, 512];

// Gerar ícones em vários tamanhos
async function generateIcons() {
  try {
    // Verifica se o arquivo SVG existe
    if (!fs.existsSync(INPUT_SVG)) {
      console.error(`Arquivo SVG de entrada não encontrado: ${INPUT_SVG}`);
      return;
    }

    // Conta quantos ícones foram gerados
    let generatedCount = 0;

    // Gerar cada tamanho de ícone
    for (const size of ICON_SIZES) {
      const outputFile = path.join(OUTPUT_DIR, `icon-${size}x${size}.png`);
      
      await sharp(INPUT_SVG)
        .resize(size, size)
        .png()
        .toFile(outputFile);
      
      generatedCount++;
      console.log(`Ícone gerado: ${outputFile}`);
    }

    // Criar também uma versão de badge para notificações
    const badgeFile = path.join(OUTPUT_DIR, 'badge-96x96.png');
    await sharp(INPUT_SVG)
      .resize(96, 96)
      .png()
      .toFile(badgeFile);
    
    console.log(`Badge gerado: ${badgeFile}`);
    console.log(`\nTotal de ${generatedCount} ícones gerados com sucesso!`);
  } catch (error) {
    console.error('Erro ao gerar ícones:', error);
  }
}

// Executa a função principal
generateIcons();