import fs from 'fs';
import path from 'path';

// Config
const targetDir = './src';
const outputFile = 'all_components.txt'; // Using .txt makes it easier to read/share

let combinedCode = '';

function findReactFiles(directory) {
  const files = fs.readdirSync(directory);

  for (const file of files) {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      findReactFiles(fullPath); // Go deeper
    } 
    // This line grabs both .jsx components and .js logic files
    else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) { 
      
      console.log(`Adding: ${fullPath}`);
      const content = fs.readFileSync(fullPath, 'utf8');
      
      // Add a clean header using JS comment syntax
      combinedCode += `\n/* =========================================\n   FILE: ${fullPath}\n   ========================================= */\n\n`;
      combinedCode += content;
    }
  }
}

console.log('Scanning for React files...');
findReactFiles(targetDir);

fs.writeFileSync(outputFile, combinedCode);
console.log(`\nDone! All code saved to: ${outputFile}`);