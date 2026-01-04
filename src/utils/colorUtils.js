// src/utils/colorUtils.js

// ============================================
// BASIC CONVERTERS
// ============================================
export const hslToHex = (h, s, l) => {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
};

export const hexToHsl = (hex) => {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s;
  const l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
      default: h = 0;
    }
    h *= 360;
  }

  return { h, s: s * 100, l: l * 100 };
};

const random = (min, max) => Math.random() * (max - min) + min;

// ============================================
// SOPHISTICATED VIBRANCY ADJUSTMENT
// ============================================
const adjustForVibrancy = (h, s, l) => {
  let newH = h;
  let newS = s;
  let newL = l;

  // 1. "The Muddy Zone" Fix (Hue 30-100: Oranges/Yellows/Greens)
  // Low brightness/sat here looks like baby food. We push it to Gold or Forest.
  if (h > 35 && h < 100) {
    if (l < 40) {
      // If dark, push towards red (Brown) or Green (Forest), avoid sludge
      newS = Math.max(newS, 45); 
      newL = Math.max(newL, 20); 
    } else if (l > 40 && l < 70) {
      // Mid-tone muddy yellow -> boost saturation to look like Gold/Mustard
      newS = Math.max(newS, 65);
    }
  }

  // 2. "The Toxic Green" Fix (Hue 80-150)
  // Neon greens are rarely pleasing in UI. We force them to be "Sage" or "Forest".
  if (h > 80 && h < 150) {
    if (l > 60) {
      newS = Math.min(newS, 40); // Force Sage/Pastel
    } else {
      newS = Math.min(newS, 60); // Force Forest
    }
  }

  // 3. "The Cold Gray" Fix (Hue 200-260: Blues)
  if (h > 210 && h < 260 && l > 80 && s < 40) {
    newS += 20; // Make it a deliberate "Ice Blue" rather than dirty gray
  }

  // 4. Luminance Compensation
  // Yellows needs high lightness to look "Yellow"
  if (h > 50 && h < 70) {
    newL = Math.max(newL, 60);
  }
  // Deep Blues/Purples look better dark
  if (h > 230 && h < 280) {
    newL = Math.min(newL, 85);
  }

  // 5. Cap extremes
  newS = Math.max(5, Math.min(98, newS));
  newL = Math.max(8, Math.min(96, newL));

  return { h: newH, s: newS, l: newL };
};

// ============================================
// HARMONY GENERATION
// ============================================
const generateHarmoniousHues = (mode, count, constraints) => {
  // Pick a strong "Anchor" color
  // We bias slightly away from the "ugly" 80-120 range for the base color
  let base = random(0, 360);
  if (base > 80 && base < 120 && Math.random() > 0.2) {
    base = (base + 100) % 360; 
  }

  const hues = [];
  const jitter = (amount = 15) => random(-amount, amount);

  switch (mode) {
    case 'mono':
      // Very tight hue spread
      for (let i = 0; i < count; i++) {
        hues.push((base + jitter(5) + 360) % 360);
      }
      break;

    case 'analogous':
      // A gentle arc across the color wheel
      const range = 50; // Tighter range is usually more pleasing
      for (let i = 0; i < count; i++) {
        const offset = (i / (count - 1)) * range - (range / 2);
        hues.push((base + offset + jitter(8) + 360) % 360);
      }
      break;

    case 'complementary':
      for (let i = 0; i < count; i++) {
        if (i < 3) {
          hues.push((base + jitter(15) + 360) % 360);
        } else {
          hues.push((base + 180 + jitter(15) + 360) % 360);
        }
      }
      break;

    case 'splitComplementary':
    case 'triadic':
      const anchors = mode === 'triadic' 
        ? [0, 120, 240] 
        : [0, 150, 210];
      
      for (let i = 0; i < count; i++) {
        const anchor = anchors[i % anchors.length];
        hues.push((base + anchor + jitter(10) + 360) % 360);
      }
      break;

    default: 
      // Fallback
      for (let i = 0; i < count; i++) {
        hues.push((base + (i * 30) + 360) % 360);
      }
  }

  return hues;
};

// ============================================
// COHESIVE SATURATION & LIGHTNESS
// ============================================
const generateCohesiveVariations = (hues, mood, count) => {
  const result = [];
  
  // 1 = Dark to Light (Linear)
  // 2 = Light to Dark (Linear)
  // 3 = Arc (Dark ends, light middle)
  const strategy = Math.random();
  
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1); // 0.0 to 1.0
    
    let s, l;

    // --- SATURATION ---
    if (mood === 'pastel') {
      s = random(30, 60);
    } else if (mood === 'vibrant') {
      s = random(75, 95);
    } else if (mood === 'muted') {
      s = random(10, 35);
    } else {
      // Natural Vibe: Saturation dips slightly at extremes of lightness
      s = 55 + (Math.sin(t * Math.PI) * 15) + random(-10, 10);
    }

    // --- LIGHTNESS ---
    if (mood === 'dark') {
      l = random(12, 35);
    } else if (mood === 'pastel') {
      l = random(82, 94);
    } else {
      // Enforce Contrast: We rarely want "all mid-tones"
      if (strategy < 0.40) {
        // Dark -> Light
        l = 15 + (t * 75) + random(-5, 5);
      } else if (strategy < 0.80) {
        // Light -> Dark
        l = 90 - (t * 75) + random(-5, 5);
      } else {
        // Random anchors
        if (i === 0) l = random(15, 30);
        else if (i === count - 1) l = random(80, 95);
        else l = random(30, 80);
      }
    }

    result.push({ s, l });
  }
  
  return result;
};

// ============================================
// MAIN GENERATOR (WEIGHTED PROBABILITY)
// ============================================
export const generateRandomPalette = (mode = 'auto', count = 5, constraints = {}) => {
  
  let harmonyMode = mode;

  // WEIGHTED RANDOMIZER
  // This favors "safe" harmonies over "risky" ones.
  if (mode === 'auto') {
    const roll = Math.random();
    if (roll < 0.40) {
      harmonyMode = 'analogous';      // 40% Chance (Very Safe)
    } else if (roll < 0.65) {
      harmonyMode = 'mono';           // 25% Chance (Modern/Clean)
    } else if (roll < 0.85) {
      harmonyMode = 'complementary';  // 20% Chance (Standard)
    } else if (roll < 0.95) {
      harmonyMode = 'splitComplementary'; // 10% Chance (Risky)
    } else {
      harmonyMode = 'triadic';        // 5% Chance (Very Risky)
    }
  }

  // 1. Get Hues
  const hues = generateHarmoniousHues(harmonyMode, count, constraints);
  
  // 2. Get S/L curves
  const slValues = generateCohesiveVariations(hues, constraints.mood || 'any', count);

  let palette = [];

  for (let i = 0; i < count; i++) {
    const h = hues[i];
    let { s, l } = slValues[i];

    // 3. Perceptual Cleanup
    const polished = adjustForVibrancy(h, s, l);
    
    // 4. Force specific constraints
    if (constraints.darkModeFriendly && polished.l > 85) polished.l = 85;

    palette.push(hslToHex(polished.h, polished.s, polished.l));
  }

  // 5. Optimize order
  return optimizeColorOrder(palette);
};


// ============================================
// UTILITIES (Contrast, Bridge, Sorting, etc.)
// ============================================

const getHueDistance = (h1, h2) => {
  let diff = Math.abs(h1 - h2);
  return diff > 180 ? 360 - diff : diff;
};

const clusterByHue = (colors) => {
  const colorData = colors.map((hex) => ({ hex, hsl: hexToHsl(hex) }));
  return colorData.sort((a, b) => a.hsl.l - b.hsl.l).map(c => c.hex);
};

const optimizeColorOrder = (colors) => {
  const hsls = colors.map(hexToHsl);
  const hueSpread = Math.max(...hsls.map(c => c.h)) - Math.min(...hsls.map(c => c.h));
  
  if (hueSpread < 60) {
    return clusterByHue(colors);
  } else {
    return colors.map(hex => ({ hex, h: hexToHsl(hex).h }))
                 .sort((a, b) => a.h - b.h)
                 .map(c => c.hex);
  }
};

export const getContrastColor = (hex) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? '#000000' : '#FFFFFF';
};

// Improved Bridge Calculation
export const generateBridgeColor = (colorBefore, colorAfter) => {
  const c1 = hexToHsl(colorBefore);
  const c2 = hexToHsl(colorAfter);

  let diff = c2.h - c1.h;
  if (diff > 180) diff -= 360; 
  if (diff < -180) diff += 360;
  
  let h = (c1.h + diff * 0.5);
  if (h < 0) h += 360;
  if (h >= 360) h -= 360;

  const s = (c1.s + c2.s) / 2; 
  const l = (c1.l + c2.l) / 2;

  const polished = adjustForVibrancy(h, s, l);

  return hslToHex(polished.h, polished.s, polished.l);
};

// Shade Generator
export const generateShades = (hex, totalSteps = 20) => {
  const { h, s, l } = hexToHsl(hex);
  const shades = [];
  const maxLight = 98;
  const minLight = 5;
  const currentIndex = Math.round((1 - (l / 100)) * (totalSteps - 1));

  if (currentIndex > 0) {
    const stepSize = (maxLight - l) / currentIndex;
    for (let i = 0; i < currentIndex; i++) {
      const newL = maxLight - (stepSize * i);
      shades.push(hslToHex(h, s, newL));
    }
  }

  shades.push(hex);

  const remainingSteps = totalSteps - 1 - currentIndex;
  if (remainingSteps > 0) {
    const stepSize = (l - minLight) / remainingSteps;
    for (let i = 1; i <= remainingSteps; i++) {
      const newL = l - (stepSize * i);
      shades.push(hslToHex(h, s, newL));
    }
  }
  return shades;
};

// Color Blindness Simulation
const colorBlindnessMatrices = {
  protanopia: [[0.567, 0.433, 0], [0.558, 0.442, 0], [0, 0.242, 0.758]],
  deuteranopia: [[0.625, 0.375, 0], [0.7, 0.3, 0], [0, 0.3, 0.7]],
  tritanopia: [[0.95, 0.05, 0], [0, 0.433, 0.567], [0, 0.475, 0.525]],
  achromatopsia: [[0.299, 0.587, 0.114], [0.299, 0.587, 0.114], [0.299, 0.587, 0.114]],
};

export const simulateColorBlindness = (hex, type) => {
  if (type === 'normal' || !colorBlindnessMatrices[type]) return hex;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const matrix = colorBlindnessMatrices[type];
  const newR = Math.round(matrix[0][0] * r + matrix[0][1] * g + matrix[0][2] * b);
  const newG = Math.round(matrix[1][0] * r + matrix[1][1] * g + matrix[1][2] * b);
  const newB = Math.round(matrix[2][0] * r + matrix[2][1] * g + matrix[2][2] * b);
  const clamp = (v) => Math.max(0, Math.min(255, v));
  return `#${clamp(newR).toString(16).padStart(2, '0')}${clamp(newG).toString(16).padStart(2, '0')}${clamp(newB).toString(16).padStart(2, '0')}`.toUpperCase();
};