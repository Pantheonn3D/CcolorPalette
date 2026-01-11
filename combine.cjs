const fs = require('fs');
const path = require('path');

const outputFile = 'all_code.txt';
const ignoreDirs = ['node_modules', '.git', 'dist', 'build', '.idea', '.vscode'];
const ignoreFiles = ['package-lock.json', 'yarn.lock', 'all_code.txt', 'combine.js'];
const extensions = ['.js', '.jsx', '.ts', '.tsx', '.css', '.html', '.json'];

function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      if (!ignoreDirs.includes(file)) {
        arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
      }
    } else {
      if (!ignoreFiles.includes(file) && extensions.includes(path.extname(file))) {
        arrayOfFiles.push(path.join(dirPath, "/", file));
      }
    }
  });

  return arrayOfFiles;
}

const files = getAllFiles('./');
let content = '';

files.forEach(file => {
  content += `\n\n--- START OF FILE: ${file} ---\n\n`;
  content += fs.readFileSync(file, 'utf8');
});

fs.writeFileSync(outputFile, content);
console.log(`All code written to ${outputFile}`);