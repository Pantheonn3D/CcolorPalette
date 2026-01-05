import fs from 'fs';
import path from 'path';

// Config
const targetDir = './src';
const outputFile = 'all_styles.css';

let combinedCss = '';

function findCssFiles(directory) {
  const files = fs.readdirSync(directory);

  for (const file of files) {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      findCssFiles(fullPath); // Recursive call for subfolders
    } else if (fullPath.endsWith('.css')) {
      console.log(`Adding: ${fullPath}`);
      const content = fs.readFileSync(fullPath, 'utf8');
      
      // Add a nice header for each file
      combinedCss += `\n/* =========================================\n   SOURCE: ${fullPath}\n   ========================================= */\n\n`;
      combinedCss += content;
    }
  }
}

console.log('Scanning...');
findCssFiles(targetDir);

fs.writeFileSync(outputFile, combinedCss);
console.log(`\nDone! Saved to: ${outputFile}`);