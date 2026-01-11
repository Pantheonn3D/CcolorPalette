// test-palette.cjs
const palette = "2A1D00-B19F38-A6DAFA-6D55AA-00425C";

// --- PASTE THE HELPER FUNCTIONS FROM YOUR SCRIPT HERE ---
function hexToHsl(hex) {
  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) { h = s = 0; } 
  else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
    h *= 360;
  }
  return { h, s: s * 100, l: l * 100 };
}

function srgbToLinear(c) {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function relativeLuminance(hex) {
  const r = srgbToLinear(parseInt(hex.slice(0, 2), 16) / 255);
  const g = srgbToLinear(parseInt(hex.slice(2, 4), 16) / 255);
  const b = srgbToLinear(parseInt(hex.slice(4, 6), 16) / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function wcagContrastRatio(hex1, hex2) {
  const l1 = relativeLuminance(hex1);
  const l2 = relativeLuminance(hex2);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

function scoreHarmony(hsls) {
  if (hsls.length < 2) return 50;
  const hues = hsls.map(c => c.h);
  let maxDiff = 0;
  for (let i = 0; i < hues.length; i++) {
    for (let j = i + 1; j < hues.length; j++) {
      let diff = Math.abs(hues[i] - hues[j]);
      if (diff > 180) diff = 360 - diff;
      if (diff > maxDiff) maxDiff = diff;
    }
  }
  console.log(`   🎨 Harmony Max Diff: ${maxDiff.toFixed(1)}°`);
  if (maxDiff < 30) return 90; 
  if (maxDiff < 60) return 85; 
  if (maxDiff > 150 && maxDiff < 210) return 80; 
  return 60; 
}

function scoreAccessibility(hexColors) {
  let bestContrast = 0;
  for (const hex of hexColors) {
    const onWhite = wcagContrastRatio(hex, 'FFFFFF');
    const onBlack = wcagContrastRatio(hex, '000000');
    bestContrast = Math.max(bestContrast, onWhite, onBlack);
  }
  console.log(`   👁️ Best Text Contrast: ${bestContrast.toFixed(2)}:1`);
  if (bestContrast >= 7) return 100;
  if (bestContrast >= 4.5) return 85; 
  if (bestContrast >= 3) return 60; 
  return 30; 
}

function calculateScore(p) {
    console.log(`\nTesting Palette: ${p}`);
    const hexColors = p.split('-');
    const hsls = hexColors.map(hexToHsl);
    
    const harmony = scoreHarmony(hsls);
    const a11y = scoreAccessibility(hexColors);
    
    const total = (harmony * 0.4) + (a11y * 0.4) + 20;
    
    console.log(`   -----------------------------`);
    console.log(`   Harmony Score: ${harmony}`);
    console.log(`   A11y Score:    ${a11y}`);
    console.log(`   Base Bonus:    +20`);
    console.log(`   -----------------------------`);
    console.log(`   FINAL SCORE:   ${Math.round(total)} (Needs 60 to pass)`);
    console.log(`   -----------------------------\n`);
}

calculateScore(palette);