// scripts/ensure-data.cjs
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/generated-palettes.json');

// Only create the file if it DOES NOT exist
if (!fs.existsSync(filePath)) {
  console.log('Data file missing. Creating dummy file to prevent crash...');
  // Create the directory if it's missing too
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, '[]'); // Write an empty array
}