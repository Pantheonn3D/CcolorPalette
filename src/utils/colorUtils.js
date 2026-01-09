// src/utils/colorUtils.js

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
// 2. VIBRANCY & HARMONY LOGIC
// ============================================

const adjustForVibrancy = (h, s, l) => {
  let newH = h;
  let newS = s;
  let newL = l;

  // "The Muddy Zone" Fix
  if (h > 35 && h < 100) {
    if (l < 40) {
      newS = Math.max(newS, 45); 
      newL = Math.max(newL, 20); 
    } else if (l > 40 && l < 70) {
      newS = Math.max(newS, 65);
    }
  }

  // "The Toxic Green" Fix
  if (h > 80 && h < 150) {
    if (l > 60) {
      newS = Math.min(newS, 40);
    } else {
      newS = Math.min(newS, 60);
    }
  }

  // "The Cold Gray" Fix
  if (h > 210 && h < 260 && l > 80 && s < 40) {
    newS += 20;
  }

  // Luminance Compensation
  if (h > 50 && h < 70) newL = Math.max(newL, 60);
  if (h > 230 && h < 280) newL = Math.min(newL, 85);

  // Cap extremes
  newS = Math.max(5, Math.min(98, newS));
  newL = Math.max(8, Math.min(96, newL));

  return { h: newH, s: newS, l: newL };
};

const generateHarmoniousHues = (mode, count, constraints) => {
  let base = random(0, 360);
  if (base > 80 && base < 120 && Math.random() > 0.2) {
    base = (base + 100) % 360; 
  }

  const hues = [];
  const jitter = (amount = 15) => random(-amount, amount);

  switch (mode) {
    case 'mono':
      for (let i = 0; i < count; i++) hues.push((base + jitter(5) + 360) % 360);
      break;
    case 'analogous':
      const range = 50; 
      for (let i = 0; i < count; i++) {
        // FIX: Ensure no division by zero if count is 1
        const progress = count > 1 ? i / (count - 1) : 0.5;
        const offset = progress * range - (range / 2);
        hues.push((base + offset + jitter(8) + 360) % 360);
      }
      break;
    case 'complementary':
      for (let i = 0; i < count; i++) {
        // FIX: Split evenly based on count, not hardcoded "3"
        // This ensures 2-color palettes get 1 base and 1 complement
        if (i < Math.ceil(count / 2)) hues.push((base + jitter(15) + 360) % 360);
        else hues.push((base + 180 + jitter(15) + 360) % 360);
      }
      break;
    case 'splitComplementary':
    case 'triadic':
      const anchors = mode === 'triadic' ? [0, 120, 240] : [0, 150, 210];
      for (let i = 0; i < count; i++) {
        const anchor = anchors[i % anchors.length];
        hues.push((base + anchor + jitter(10) + 360) % 360);
      }
      break;
    default: 
      for (let i = 0; i < count; i++) hues.push((base + (i * 30) + 360) % 360);
  }
  return hues;
};

const generateCohesiveVariations = (hues, mood, count) => {
  const result = [];
  const strategy = Math.random();
  
  for (let i = 0; i < count; i++) {
    // FIX: Ensure no division by zero if count is 1
    const t = count > 1 ? i / (count - 1) : 0.5; 
    let s, l;

    if (mood === 'pastel') s = random(30, 60);
    else if (mood === 'vibrant') s = random(75, 95);
    else if (mood === 'muted') s = random(10, 35);
    else s = 55 + (Math.sin(t * Math.PI) * 15) + random(-10, 10);

    if (mood === 'dark') l = random(12, 35);
    else if (mood === 'pastel') l = random(82, 94);
    else {
      if (strategy < 0.40) l = 15 + (t * 75) + random(-5, 5);
      else if (strategy < 0.80) l = 90 - (t * 75) + random(-5, 5);
      else {
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
// 3. MAIN PALETTE GENERATOR (SMART WEIGHTS)
// ============================================

export const generateRandomPalette = (mode = 'auto', count = 5, constraints = {}) => {
  let harmonyMode = mode;

  if (mode === 'auto') {
    const roll = Math.random();

    // FIX: Apply Smart Weights based on count to avoid "unlucky" palettes
    if (count <= 2) {
      // 2 Colors: Focus on contrast or strict simplicity
      if (roll < 0.50) harmonyMode = 'complementary';       
      else if (roll < 0.80) harmonyMode = 'mono';           
      else harmonyMode = 'analogous';                       
    
    } else if (count === 3) {
      // 3 Colors: The sweet spot for Triads
      if (roll < 0.40) harmonyMode = 'splitComplementary';  
      else if (roll < 0.70) harmonyMode = 'triadic';        
      else if (roll < 0.90) harmonyMode = 'analogous';      
      else harmonyMode = 'mono';
    
    } else if (count >= 6) {
      // 6+ Colors: Force order to prevent chaos
      if (roll < 0.60) harmonyMode = 'analogous';           
      else if (roll < 0.85) harmonyMode = 'mono';           
      else harmonyMode = 'splitComplementary';              
    } else {
      // 4-5 Colors: Standard distribution
      if (roll < 0.45) harmonyMode = 'analogous';
      else if (roll < 0.65) harmonyMode = 'mono';
      else if (roll < 0.85) harmonyMode = 'complementary';
      else if (roll < 0.95) harmonyMode = 'splitComplementary';
      else harmonyMode = 'triadic';
    }
  }

  const hues = generateHarmoniousHues(harmonyMode, count, constraints);
  const slValues = generateCohesiveVariations(hues, constraints.mood || 'any', count);

  let palette = [];
  for (let i = 0; i < count; i++) {
    const h = hues[i];
    let { s, l } = slValues[i];
    
    const polished = adjustForVibrancy(h, s, l);
    
    if (constraints.darkModeFriendly && polished.l > 85) polished.l = 85;
    
    palette.push(hslToHex(polished.h, polished.s, polished.l));
  }

  return optimizeColorOrder(palette);
};

// ============================================
// 4. UTILITIES (Sorting, Contrast, Shades)
// ============================================

const getHueDistance = (h1, h2) => {
  let diff = Math.abs(h1 - h2);
  return diff > 180 ? 360 - diff : diff;
};

const getColorDistance = (c1, c2) => {
  const hDist = getHueDistance(c1.hsl.h, c2.hsl.h);
  const sDist = Math.abs(c1.hsl.s - c2.hsl.s);
  const lDist = Math.abs(c1.hsl.l - c2.hsl.l);
  return Math.sqrt((hDist * hDist) + (sDist * sDist * 0.5) + (lDist * lDist * 0.8));
};

const optimizeColorOrder = (colors) => {
  const colorData = colors.map((hex) => ({ hex, hsl: hexToHsl(hex) }));
  const hues = colorData.map(c => c.hsl.h);
  const hueSpread = Math.max(...hues) - Math.min(...hues);
  
  if (hueSpread < 40) {
    return colorData.sort((a, b) => a.hsl.l - b.hsl.l).map(c => c.hex);
  }

  let current = colorData.reduce((prev, curr) => (curr.hsl.l < prev.hsl.l ? curr : prev));
  const sorted = [current];
  let remaining = colorData.filter(c => c !== current);

  while (remaining.length > 0) {
    let nearest = null;
    let minDist = Infinity;
    for (const candidate of remaining) {
      const dist = getColorDistance(current, candidate);
      if (dist < minDist) {
        minDist = dist;
        nearest = candidate;
      }
    }
    if (nearest) {
      sorted.push(nearest);
      current = nearest;
      remaining = remaining.filter(c => c !== nearest);
    } else break; 
  }
  return sorted.map(c => c.hex);
};

export const getContrastColor = (hex) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? '#000000' : '#FFFFFF';
};

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

// ============================================
// 5. DETERMINISTIC SEED SYSTEM
// ============================================

const pseudoRandom = (seedString) => {
  let h = 0xdeadbeef;
  for (let i = 0; i < seedString.length; i++) {
    h = Math.imul(h ^ seedString.charCodeAt(i), 2654435761);
  }
  return ((h ^ h >>> 15) >>> 0) / 4294967296;
};

const createSeededGenerator = (seedString) => {
  let index = 0;
  return () => {
    index++;
    return pseudoRandom(seedString + index.toString());
  };
};

const pickOne = (options, seed) => {
  const index = Math.floor(seed * options.length);
  return options[Math.min(index, options.length - 1)];
};

const pickMultiple = (options, seedGen, count) => {
  const selected = [];
  const available = [...options];
  for (let i = 0; i < Math.min(count, options.length); i++) {
    const idx = Math.floor(seedGen() * available.length);
    selected.push(available.splice(idx, 1)[0]);
  }
  return selected;
};

// ============================================
// 6. COMPREHENSIVE COLOR ANALYSIS
// ============================================

const getDetailedHueInfo = (h) => {
  const hueMap = [
    { range: [0, 10], primary: "red", detailed: "pure red", searchTerms: ["red", "crimson", "scarlet"] },
    { range: [10, 25], primary: "red", detailed: "vermilion", searchTerms: ["red-orange", "vermilion", "tomato"] },
    { range: [25, 40], primary: "orange", detailed: "burnt orange", searchTerms: ["orange", "burnt orange", "rust"] },
    { range: [40, 50], primary: "orange", detailed: "amber", searchTerms: ["amber", "golden orange", "honey"] },
    { range: [50, 60], primary: "yellow", detailed: "golden yellow", searchTerms: ["yellow", "gold", "mustard"] },
    { range: [60, 75], primary: "yellow", detailed: "lemon", searchTerms: ["yellow", "lemon", "citrus"] },
    { range: [75, 90], primary: "green", detailed: "chartreuse", searchTerms: ["lime", "chartreuse", "yellow-green"] },
    { range: [90, 120], primary: "green", detailed: "leaf green", searchTerms: ["green", "grass green", "kelly green"] },
    { range: [120, 150], primary: "green", detailed: "emerald", searchTerms: ["emerald", "forest green", "jade"] },
    { range: [150, 170], primary: "teal", detailed: "teal", searchTerms: ["teal", "turquoise", "aqua"] },
    { range: [170, 195], primary: "cyan", detailed: "cyan", searchTerms: ["cyan", "aqua", "robin egg"] },
    { range: [195, 220], primary: "blue", detailed: "sky blue", searchTerms: ["sky blue", "azure", "cerulean"] },
    { range: [220, 245], primary: "blue", detailed: "cobalt", searchTerms: ["blue", "cobalt", "royal blue"] },
    { range: [245, 265], primary: "blue", detailed: "navy", searchTerms: ["navy", "indigo", "midnight blue"] },
    { range: [265, 285], primary: "purple", detailed: "violet", searchTerms: ["purple", "violet", "grape"] },
    { range: [285, 310], primary: "purple", detailed: "magenta", searchTerms: ["magenta", "fuchsia", "orchid"] },
    { range: [310, 335], primary: "pink", detailed: "rose", searchTerms: ["pink", "rose", "blush"] },
    { range: [335, 360], primary: "red", detailed: "crimson", searchTerms: ["crimson", "ruby", "cherry"] }
  ];
  
  const normalized = ((h % 360) + 360) % 360;
  const match = hueMap.find(entry => normalized >= entry.range[0] && normalized < entry.range[1]);
  return match || hueMap[0];
};

const analyzeColorTemperature = (hsls) => {
  const warmRanges = [[0, 70], [320, 360]];
  const coolRanges = [[170, 280]];
  
  let warmCount = 0;
  let coolCount = 0;
  
  hsls.forEach(({ h }) => {
    const inWarm = warmRanges.some(([min, max]) => h >= min && h < max);
    const inCool = coolRanges.some(([min, max]) => h >= min && h < max);
    if (inWarm) warmCount++;
    if (inCool) coolCount++;
  });
  
  const total = hsls.length;
  if (warmCount > total * 0.6) return { type: "warm", ratio: warmCount / total };
  if (coolCount > total * 0.6) return { type: "cool", ratio: coolCount / total };
  return { type: "balanced", ratio: 0.5 };
};

const calculateContrastRatio = (l1, l2) => {
  const lighter = Math.max(l1, l2) / 100;
  const darker = Math.min(l1, l2) / 100;
  return ((lighter + 0.05) / (darker + 0.05)).toFixed(2);
};

const detectHarmonyType = (hsls) => {
  if (hsls.length < 2) return "single";
  
  const hues = hsls.map(c => c.h);
  const pairs = [];
  
  for (let i = 0; i < hues.length; i++) {
    for (let j = i + 1; j < hues.length; j++) {
      let diff = Math.abs(hues[i] - hues[j]);
      if (diff > 180) diff = 360 - diff;
      pairs.push(diff);
    }
  }
  
  const maxDiff = Math.max(...pairs);
  const avgDiff = pairs.reduce((a, b) => a + b, 0) / pairs.length;
  
  if (maxDiff < 25) return "monochromatic";
  if (maxDiff < 60) return "analogous";
  if (avgDiff > 100 && avgDiff < 140) return "triadic";
  if (maxDiff > 150 && maxDiff < 210) return "complementary";
  if (maxDiff >= 130 && maxDiff <= 170) return "split-complementary";
  return "custom";
};

const getComprehensiveTraits = (hsls) => {
  const avgS = hsls.reduce((a, c) => a + c.s, 0) / hsls.length;
  const avgL = hsls.reduce((a, c) => a + c.l, 0) / hsls.length;
  const maxL = Math.max(...hsls.map(c => c.l));
  const minL = Math.min(...hsls.map(c => c.l));
  const lightnessRange = maxL - minL;
  
  const satStdDev = Math.sqrt(hsls.reduce((a, c) => a + Math.pow(c.s - avgS, 2), 0) / hsls.length);
  const lightStdDev = Math.sqrt(hsls.reduce((a, c) => a + Math.pow(c.l - avgL, 2), 0) / hsls.length);
  
  const dominantHsl = hsls.reduce((prev, curr) => curr.s > prev.s ? curr : prev);
  const hueInfo = getDetailedHueInfo(dominantHsl.h);
  const temperature = analyzeColorTemperature(hsls);
  const harmony = detectHarmonyType(hsls);
  const contrastRatio = calculateContrastRatio(minL, maxL);
  
  return {
    avgS, avgL, maxL, minL, lightnessRange,
    satStdDev, lightStdDev,
    hueInfo, temperature, harmony, contrastRatio,
    
    // Boolean characteristics
    isVibrant: avgS > 65,
    isMuted: avgS < 35,
    isPastel: avgS < 55 && avgL > 72,
    isDark: avgL < 38,
    isLight: avgL > 68,
    isHighContrast: lightnessRange > 55,
    isLowContrast: lightnessRange < 25,
    isUniform: satStdDev < 12 && lightStdDev < 15,
    hasNeutrals: hsls.some(c => c.s < 15),
    
    // Computed scores
    vibrancyScore: Math.round((avgS + lightnessRange) / 2),
    accessibilityScore: lightnessRange > 45 ? "good" : lightnessRange > 30 ? "moderate" : "limited"
  };
};

// ============================================
// 7. SEMANTIC CONTENT DATABASE
// ============================================

const contentDatabase = {
  paletteCharacteristics: {
    vibrant: {
      adjectives: ["vivid", "bold", "striking", "dynamic", "saturated", "intense", "energetic", "punchy"],
      descriptions: [
        "commands attention and creates immediate visual impact",
        "delivers strong chromatic presence for memorable designs",
        "provides maximum color energy for engaging compositions"
      ]
    },
    muted: {
      adjectives: ["subtle", "refined", "understated", "sophisticated", "restrained", "nuanced", "tempered", "gentle"],
      descriptions: [
        "creates refined atmospheres without visual competition",
        "supports content-focused designs where color complements rather than dominates",
        "delivers timeless sophistication through careful desaturation"
      ]
    },
    pastel: {
      adjectives: ["soft", "delicate", "airy", "gentle", "light", "serene", "calming", "ethereal"],
      descriptions: [
        "evokes lightness and approachability in any application",
        "creates welcoming, non-aggressive visual environments",
        "balances color interest with visual gentleness"
      ]
    },
    dark: {
      adjectives: ["deep", "rich", "dramatic", "moody", "luxurious", "intense", "grounded", "substantial"],
      descriptions: [
        "establishes visual weight and dramatic presence",
        "creates depth and sophistication in design compositions",
        "anchors layouts with substantial chromatic foundation"
      ]
    },
    light: {
      adjectives: ["bright", "fresh", "open", "clean", "luminous", "crisp", "airy", "spacious"],
      descriptions: [
        "maximizes perceived space and visual breathing room",
        "supports readability and content clarity",
        "creates inviting, accessible visual environments"
      ]
    },
    warm: {
      adjectives: ["inviting", "cozy", "welcoming", "friendly", "approachable", "comforting", "earthy", "sun-touched"],
      descriptions: [
        "activates emotional warmth and human connection",
        "creates psychologically comfortable environments",
        "supports approachable, personable brand positioning"
      ]
    },
    cool: {
      adjectives: ["calm", "serene", "professional", "trustworthy", "composed", "refreshing", "clean", "tranquil"],
      descriptions: [
        "establishes measured professionalism and trust",
        "creates psychologically calming visual experiences",
        "supports clarity-focused, rational design approaches"
      ]
    }
  },

  harmonyDescriptions: {
    monochromatic: {
      name: "monochromatic",
      explanation: "uses variations of a single hue across different saturation and lightness levels",
      benefits: "ensures automatic color harmony while providing tonal variation for visual hierarchy",
      bestFor: "minimalist designs, text-heavy layouts, and brands seeking cohesive simplicity"
    },
    analogous: {
      name: "analogous",
      explanation: "combines neighboring hues from the color wheel for natural color flow",
      benefits: "creates organic, nature-inspired harmonies that feel intuitive and comfortable",
      bestFor: "environmental design, wellness branding, and compositions requiring visual comfort"
    },
    complementary: {
      name: "complementary",
      explanation: "pairs colors from opposite sides of the color wheel for maximum contrast",
      benefits: "generates visual tension and energy that draws attention to key elements",
      bestFor: "call-to-action designs, sports branding, and high-energy marketing materials"
    },
    triadic: {
      name: "triadic",
      explanation: "uses three colors equally spaced around the color wheel",
      benefits: "provides rich color variety while maintaining structural balance",
      bestFor: "playful brands, children's products, and designs requiring diverse color options"
    },
    "split-complementary": {
      name: "split-complementary",
      explanation: "modifies complementary harmony by using two colors adjacent to the complement",
      benefits: "retains complementary contrast with reduced visual tension",
      bestFor: "balanced designs that need contrast without aggressive color opposition"
    },
    custom: {
      name: "custom",
      explanation: "follows a unique color relationship tailored to specific design requirements",
      benefits: "provides flexibility for specialized applications and distinctive brand identities",
      bestFor: "unique brand positioning and designs requiring non-traditional color approaches"
    }
  },

  industryApplications: {
    webDesign: {
      title: "Web and Digital Interface Design",
      contexts: {
        highContrast: [
          "The substantial lightness range supports WCAG accessibility compliance for body text and interactive elements.",
          "Provides clear visual hierarchy for navigation systems, buttons, and content sections.",
          "Enables effective data visualization where distinct values require clear color differentiation."
        ],
        lowContrast: [
          "Consider reserving pure black or white for text to meet accessibility contrast requirements.",
          "Works well for background layering and subtle UI depth effects.",
          "Suitable for decorative elements where readability is not the primary concern."
        ],
        dark: [
          "Optimized for dark mode interfaces with sufficient tonal separation for layered components.",
          "Reduces eye strain in low-ambient-light environments and extended reading sessions.",
          "Supports immersive experiences for media-focused and entertainment applications."
        ],
        light: [
          "Creates open, breathable layouts for content-dense pages and documentation.",
          "Supports scannable interfaces where information hierarchy drives user flow.",
          "Effective for e-commerce where products need neutral, non-competing backgrounds."
        ],
        vibrant: [
          "Delivers strong brand recognition and memorability in competitive digital spaces.",
          "Commands attention for key conversion elements and promotional content.",
          "Supports engagement-focused designs for social and interactive platforms."
        ],
        muted: [
          "Allows content to take center stage without color distraction.",
          "Supports long-form reading experiences and professional service contexts.",
          "Creates sophisticated backdrops for portfolio and editorial presentations."
        ]
      }
    },
    branding: {
      title: "Brand Identity and Marketing",
      hueAssociations: {
        red: "energy, urgency, passion, and appetite stimulation, commonly deployed in food service, entertainment, retail, and emergency services",
        orange: "friendliness, creativity, affordability, and youthful energy, effective for startups, creative agencies, and value-oriented retail",
        yellow: "optimism, clarity, warmth, and attention-grabbing visibility, suited for hospitality, construction, and caution signaling",
        green: "growth, health, sustainability, wealth, and natural authenticity, standard in finance, healthcare, organic products, and environmental sectors",
        teal: "sophistication, clarity, and balanced professionalism, popular in healthcare technology and modern corporate identities",
        cyan: "innovation, cleanliness, and technological advancement, common in tech startups and medical device companies",
        blue: "reliability, trustworthiness, competence, and stability, dominant across corporate, finance, technology, and healthcare sectors",
        purple: "creativity, luxury, wisdom, and imagination, used in beauty, education, wellness, and premium product positioning",
        pink: "nurturing, approachability, playfulness, and compassion, effective in health, beauty, confectionery, and youth marketing"
      },
      saturationImpact: {
        high: "High saturation creates memorable brand recognition and works effectively for digital-first companies competing for attention in crowded markets.",
        low: "Reduced saturation projects maturity, trustworthiness, and sophistication, appropriate for professional services, luxury positioning, and heritage brands."
      }
    },
    interiorDesign: {
      title: "Interior Design and Architecture",
      temperatureContexts: {
        warm: [
          "Creates intimate, inviting atmospheres in residential living spaces, restaurants, and hospitality environments.",
          "Compensates for north-facing rooms with limited natural warmth.",
          "Supports social spaces where conversation and connection are priorities."
        ],
        cool: [
          "Provides visual relief in south-facing rooms with abundant direct sunlight.",
          "Creates calming environments appropriate for bedrooms, bathrooms, spas, and healthcare facilities.",
          "Supports focused work environments in offices and study spaces."
        ],
        balanced: [
          "Offers flexibility across different lighting conditions and room orientations.",
          "Adapts well to spaces with mixed natural and artificial light sources.",
          "Supports transitional spaces that serve multiple functions throughout the day."
        ]
      },
      lightnessContexts: {
        light: [
          "Maximizes perceived space in compact rooms and apartments.",
          "Reflects available light to brighten rooms with limited windows.",
          "Creates gallery-like backdrops for art and object display."
        ],
        dark: [
          "Adds drama and intimacy to feature walls, libraries, and entertainment rooms.",
          "Grounds open-plan spaces when applied strategically to architectural elements.",
          "Works on ceilings in rooms with generous height and natural light."
        ]
      }
    },
    digitalArt: {
      title: "Digital Art and Illustration",
      contexts: {
        highContrast: [
          "Supports clear focal point establishment and compositional hierarchy.",
          "Enables effective foreground-background separation in complex illustrations.",
          "Provides the value range needed for dramatic lighting effects."
        ],
        analogous: [
          "Creates cohesive color scripts for animation and sequential narrative art.",
          "Natural choice for landscape and environmental concept art with atmospheric depth.",
          "Supports mood consistency across multi-scene storyboarding."
        ],
        monochromatic: [
          "Ideal for value studies and establishing lighting before introducing color complexity.",
          "Effective for noir and limited-palette stylistic approaches.",
          "Supports focused mood development in conceptual work."
        ],
        vibrant: [
          "Commands attention in thumbnail compositions for portfolio presentation.",
          "Supports stylized and cel-shaded illustration techniques.",
          "Effective for character design requiring distinctive, memorable palettes."
        ]
      }
    },
    fashion: {
      title: "Fashion and Textile Design",
      temperatureGuidance: {
        warm: [
          "Complements warm skin undertones and autumn seasonal color analysis profiles.",
          "Pairs naturally with gold jewelry, brass hardware, and brown leather.",
          "Photographs well under incandescent and warm-filtered lighting."
        ],
        cool: [
          "Complements cool skin undertones and winter seasonal color analysis profiles.",
          "Pairs naturally with silver jewelry, chrome hardware, and black leather.",
          "Photographs well under daylight and cool-filtered studio lighting."
        ]
      },
      practicalNotes: [
        "The tonal range supports outfit building from statement pieces to coordinating layers.",
        "Enables capsule wardrobe planning with interchangeable color combinations.",
        "Consider fabric type when evaluating colors, as material affects appearance under different lighting."
      ]
    },
    print: {
      title: "Print Production",
      contexts: {
        vibrant: [
          "High saturation values may shift during RGB-to-CMYK conversion; request press proofs for critical brand colors.",
          "Consider Pantone spot color matching for consistent reproduction across print vendors and materials.",
          "Allow for paper absorption differences between coated and uncoated stocks."
        ],
        muted: [
          "Desaturated values reproduce more predictably across different paper stocks and printing methods.",
          "Performs well on uncoated and textured stocks where highly saturated inks may absorb unevenly.",
          "Reduces registration sensitivity for multi-color process printing."
        ],
        general: [
          "Verify sufficient tonal separation for clear reproduction in grayscale printing scenarios.",
          "Test on target paper stock, as substrate color temperature affects final appearance.",
          "Consider environmental factors like lighting conditions where printed materials will be viewed."
        ]
      }
    },
    photography: {
      title: "Photography and Color Grading",
      contexts: {
        dark: [
          "Provides foundation for moody editorial photography and cinematic color grading.",
          "Supports low-key lighting setups and dramatic portrait work.",
          "Effective reference for shadow color in controlled studio environments."
        ],
        light: [
          "Suited for high-key photography and bright editorial aesthetics.",
          "Supports clean product photography requiring neutral, airy backgrounds.",
          "Provides reference for highlight and fill light coloring."
        ],
        general: [
          "Informs preset development for batch processing in Lightroom, Capture One, or DaVinci Resolve.",
          "Provides reference for gel selection in studio lighting setups.",
          "Guides color harmony decisions for styled shoots and art direction."
        ]
      }
    },
    accessibility: {
      title: "Accessibility Considerations",
      contrastGuidance: {
        high: [
          "The contrast range supports WCAG 2.1 Level AA requirements for normal body text at 4.5:1 minimum.",
          "Provides sufficient luminance differentiation for users with contrast sensitivity conditions.",
          "Enables clear visual hierarchy for screen reader users who may also have partial vision."
        ],
        low: [
          "Additional contrast enhancement needed for text applications to meet WCAG guidelines.",
          "Reserve highest and lowest lightness values for critical text and interactive elements.",
          "Consider using pure black or white for text overlays to ensure adequate readability."
        ]
      },
      colorBlindnessNotes: {
        redGreen: "Red and green combinations should be validated with deuteranopia and protanopia simulation tools. Add pattern, texture, or label differentiation for color-coded information.",
        blueYellow: "Blue and yellow combinations should be tested with tritanopia simulation, though this affects a smaller percentage of users.",
        general: "Ensure color is never the sole means of conveying critical information. Provide redundant cues through icons, patterns, or text labels."
      }
    }
  }
};

// ============================================
// 8. CONTENT GENERATION FUNCTIONS
// ============================================

const generateTitle = (traits, colorCount, seedGen) => {
  const hue = traits.hueInfo.primary;
  const detailed = traits.hueInfo.detailed;
  const harmony = traits.harmony;
  
  const templates = [];
  
  // Characteristic-based templates
  if (traits.isVibrant) {
    templates.push(
      `${colorCount}-Color ${capitalize(hue)} Palette with Bold Saturation`,
      `Vibrant ${capitalize(detailed)} Color Scheme for Design Projects`,
      `High-Energy ${capitalize(hue)} Palette: ${colorCount} Coordinated Colors`
    );
  }
  
  if (traits.isMuted) {
    templates.push(
      `Muted ${capitalize(hue)} Palette: ${colorCount} Sophisticated Tones`,
      `Subtle ${capitalize(detailed)} Color Scheme for Refined Design`,
      `${colorCount}-Color Desaturated ${capitalize(hue)} Palette`
    );
  }
  
  if (traits.isPastel) {
    templates.push(
      `Soft Pastel ${capitalize(hue)} Palette: ${colorCount} Light Tones`,
      `Gentle ${capitalize(detailed)} Color Scheme for Delicate Design`,
      `${colorCount}-Color Light ${capitalize(hue)} Pastel Collection`
    );
  }
  
  if (traits.isDark) {
    templates.push(
      `Deep ${capitalize(hue)} Palette: ${colorCount} Rich Dark Tones`,
      `Dramatic ${capitalize(detailed)} Color Scheme for Bold Design`,
      `${colorCount}-Color Dark ${capitalize(hue)} Collection`
    );
  }
  
  // Harmony-based templates
  if (harmony === "monochromatic") {
    templates.push(
      `Monochromatic ${capitalize(hue)} Palette: ${colorCount} Tonal Variations`,
      `Single-Hue ${capitalize(detailed)} Color System`
    );
  }
  
  if (harmony === "analogous") {
    templates.push(
      `Analogous ${capitalize(hue)} Color Harmony: ${colorCount} Adjacent Hues`,
      `Harmonious ${capitalize(detailed)} Gradient Palette`
    );
  }
  
  if (harmony === "complementary") {
    templates.push(
      `Complementary ${capitalize(hue)} Color Scheme: ${colorCount} Contrasting Tones`,
      `High-Contrast ${capitalize(detailed)} Palette`
    );
  }
  
  // General fallbacks
  templates.push(
    `${capitalize(detailed)} Color Palette: ${colorCount} Curated Shades`,
    `${colorCount}-Color ${capitalize(hue)} Scheme for Creative Projects`,
    `Professional ${capitalize(hue)} Palette: ${colorCount} Coordinated Colors`
  );
  
  return pickOne(templates, seedGen());
};

const generateMetaDescription = (traits, colorCount, seedGen) => {
  const hue = traits.hueInfo.primary;
  const harmony = contentDatabase.harmonyDescriptions[traits.harmony]?.name || "custom";
  
  const templates = [];
  
  if (traits.isVibrant) {
    templates.push(
      `A ${colorCount}-color ${hue} palette with bold saturation levels. Includes hex codes optimized for web design, branding, and digital illustration projects.`,
      `Vibrant ${hue} color scheme featuring ${colorCount} coordinated shades. Ready for UI design, brand identity, and creative applications with full hex values.`
    );
  }
  
  if (traits.isMuted) {
    templates.push(
      `Refined ${colorCount}-color ${hue} palette with sophisticated muted tones. Hex codes included for professional design, editorial work, and understated branding.`,
      `A subtle ${hue} color scheme with ${colorCount} desaturated shades. Suitable for elegant design projects and mature brand applications.`
    );
  }
  
  if (traits.isPastel) {
    templates.push(
      `Soft pastel ${hue} palette with ${colorCount} gentle, light tones. Ideal for wellness branding, feminine design, and approachable digital experiences.`,
      `Delicate ${colorCount}-color ${hue} scheme with airy pastel values. Hex codes ready for web, print, and interior design applications.`
    );
  }
  
  if (traits.isDark) {
    templates.push(
      `Deep ${hue} color palette featuring ${colorCount} rich dark values. Optimized for dramatic branding, dark mode interfaces, and premium design work.`,
      `A ${colorCount}-color dark ${hue} scheme with substantial depth. Includes hex codes for sophisticated web interfaces and luxury brand applications.`
    );
  }
  
  // Harmony-based
  templates.push(
    `A ${harmony} ${hue} palette with ${colorCount} colors. Export hex, RGB, and HSL values for web design, branding, and creative projects.`,
    `Curated ${hue} color scheme featuring ${colorCount} ${harmony} shades. Professional palette with accessibility considerations and export options.`
  );
  
  return pickOne(templates, seedGen());
};

const generateOpeningParagraph = (traits, colorCount, seedGen) => {
  const charType = traits.isVibrant ? 'vibrant' : 
                   traits.isMuted ? 'muted' : 
                   traits.isPastel ? 'pastel' :
                   traits.isDark ? 'dark' :
                   traits.isLight ? 'light' :
                   traits.temperature.type === 'warm' ? 'warm' : 
                   traits.temperature.type === 'cool' ? 'cool' : 'muted';
  
  const charData = contentDatabase.paletteCharacteristics[charType];
  const adjective = pickOne(charData.adjectives, seedGen());
  const description = pickOne(charData.descriptions, seedGen());
  const harmonyData = contentDatabase.harmonyDescriptions[traits.harmony];
  
  const openings = [
    `This ${adjective} color palette presents ${colorCount} coordinated ${traits.hueInfo.primary} tones that ${description}.`,
    `Featuring ${colorCount} carefully selected ${traits.hueInfo.detailed} shades, this ${adjective} palette ${description}.`,
    `A ${adjective} collection of ${colorCount} ${traits.hueInfo.primary}-based colors that ${description}.`
  ];
  
  const opening = pickOne(openings, seedGen());
  
  const harmonyExplanation = `The palette ${harmonyData.explanation}, which ${harmonyData.benefits}. This harmony type is ${harmonyData.bestFor}.`;
  
  return `${opening}\n\n${harmonyExplanation}`;
};

const generateIndustrySection = (sectionKey, traits, seedGen) => {
  const section = contentDatabase.industryApplications[sectionKey];
  if (!section) return null;
  
  let content = `${section.title}: `;
  const contexts = [];
  
  switch (sectionKey) {
    case 'webDesign': {
      if (traits.isHighContrast) {
        contexts.push(...pickMultiple(section.contexts.highContrast, seedGen, 2));
      } else if (traits.isLowContrast) {
        contexts.push(...pickMultiple(section.contexts.lowContrast, seedGen, 2));
      }
      
      if (traits.isDark) {
        contexts.push(pickOne(section.contexts.dark, seedGen()));
      } else if (traits.isLight) {
        contexts.push(pickOne(section.contexts.light, seedGen()));
      }
      
      if (traits.isVibrant) {
        contexts.push(pickOne(section.contexts.vibrant, seedGen()));
      } else if (traits.isMuted) {
        contexts.push(pickOne(section.contexts.muted, seedGen()));
      }
      break;
    }
    
    case 'branding': {
      const hue = traits.hueInfo.primary;
      const hueAssoc = section.hueAssociations[hue];
      if (hueAssoc) {
        contexts.push(`${capitalize(hue)} communicates ${hueAssoc}.`);
      }
      
      const satImpact = traits.isVibrant ? section.saturationImpact.high : section.saturationImpact.low;
      contexts.push(satImpact);
      break;
    }
    
    case 'interiorDesign': {
      const tempContexts = section.temperatureContexts[traits.temperature.type] || section.temperatureContexts.balanced;
      contexts.push(pickOne(tempContexts, seedGen()));
      
      if (traits.isLight) {
        contexts.push(pickOne(section.lightnessContexts.light, seedGen()));
      } else if (traits.isDark) {
        contexts.push(pickOne(section.lightnessContexts.dark, seedGen()));
      }
      break;
    }
    
    case 'digitalArt': {
      if (traits.isHighContrast) {
        contexts.push(pickOne(section.contexts.highContrast, seedGen()));
      }
      
      if (traits.harmony === 'analogous') {
        contexts.push(pickOne(section.contexts.analogous, seedGen()));
      } else if (traits.harmony === 'monochromatic') {
        contexts.push(pickOne(section.contexts.monochromatic, seedGen()));
      }
      
      if (traits.isVibrant) {
        contexts.push(pickOne(section.contexts.vibrant, seedGen()));
      }
      break;
    }
    
    case 'fashion': {
      const tempGuidance = section.temperatureGuidance[traits.temperature.type] || section.temperatureGuidance.warm;
      contexts.push(pickOne(tempGuidance, seedGen()));
      contexts.push(pickOne(section.practicalNotes, seedGen()));
      break;
    }
    
    case 'print': {
      if (traits.isVibrant) {
        contexts.push(pickOne(section.contexts.vibrant, seedGen()));
      } else if (traits.isMuted) {
        contexts.push(pickOne(section.contexts.muted, seedGen()));
      }
      contexts.push(pickOne(section.contexts.general, seedGen()));
      break;
    }
    
    case 'photography': {
      if (traits.isDark) {
        contexts.push(pickOne(section.contexts.dark, seedGen()));
      } else if (traits.isLight) {
        contexts.push(pickOne(section.contexts.light, seedGen()));
      }
      contexts.push(pickOne(section.contexts.general, seedGen()));
      break;
    }
    
    case 'accessibility': {
      if (traits.isHighContrast) {
        contexts.push(pickOne(section.contrastGuidance.high, seedGen()));
      } else {
        contexts.push(pickOne(section.contrastGuidance.low, seedGen()));
      }
      
      const hue = traits.hueInfo.primary;
      if (hue === 'red' || hue === 'green') {
        contexts.push(section.colorBlindnessNotes.redGreen);
      } else {
        contexts.push(section.colorBlindnessNotes.general);
      }
      break;
    }
  }
  
  return contexts.length > 0 ? content + contexts.join(' ') : null;
};

const generateTechnicalSpecs = (colors, traits) => {
  const specs = [
    `Palette Size: ${colors.length} colors`,
    `Primary Hue: ${Math.round(traits.hueInfo.detailed === traits.hueInfo.primary ? hexToHsl(colors[0]).h : hexToHsl(colors[0]).h)} degrees`,
    `Color Harmony: ${traits.harmony}`,
    `Saturation Range: ${Math.round(traits.avgS)}% average`,
    `Lightness Range: ${Math.round(traits.minL)}% to ${Math.round(traits.maxL)}%`,
    `Contrast Ratio: ${traits.contrastRatio}:1`,
    `Temperature: ${traits.temperature.type}`,
    `Accessibility Rating: ${traits.accessibilityScore} contrast separation`
  ];
  
  return `Technical Specifications: ${specs.join('. ')}.`;
};

const generateExportInfo = () => {
  return `Format Availability: This palette exports to HEX, RGB, HSL, OKLCH, and CMYK formats. CSS custom properties, Tailwind configuration, and design token formats support systematic implementation across development workflows and design tools.`;
};

const capitalize = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1) : '';

// ============================================
// 9. KEYWORD GENERATION
// ============================================

const generateKeywords = (traits, colorCount) => {
  const hue = traits.hueInfo.primary;
  const detailed = traits.hueInfo.detailed;
  const keywords = [];
  
  // Primary search terms
  keywords.push(`${hue} color palette`);
  keywords.push(`${hue} color scheme`);
  keywords.push(`${colorCount} color palette`);
  keywords.push(`${hue} hex codes`);
  
  // Characteristic-based
  if (traits.isVibrant) {
    keywords.push(`vibrant ${hue} palette`, `bold ${hue} colors`, `saturated ${hue} scheme`);
  }
  if (traits.isMuted) {
    keywords.push(`muted ${hue} palette`, `subtle ${hue} colors`, `desaturated ${hue} scheme`);
  }
  if (traits.isPastel) {
    keywords.push(`pastel ${hue} palette`, `soft ${hue} colors`, `light ${hue} scheme`);
  }
  if (traits.isDark) {
    keywords.push(`dark ${hue} palette`, `deep ${hue} colors`, `moody ${hue} scheme`);
  }
  
  // Harmony-based
  keywords.push(`${traits.harmony} color palette`, `${traits.harmony} ${hue} colors`);
  
  // Application-based
  keywords.push(`${hue} web design colors`, `${hue} branding palette`, `${hue} ui colors`);
  keywords.push(`${hue} interior design`, `${hue} graphic design`);
  
  // Detailed hue variations
  if (detailed !== hue) {
    keywords.push(`${detailed} color palette`, `${detailed} color scheme`);
  }
  
  return keywords;
};

// ============================================
// 10. MAIN SEO GENERATOR
// ============================================

export const generateRichSEO = (colors, mode = 'auto', mood = 'any') => {
  if (!colors || colors.length === 0) {
    return { title: "", meta: "", content: "", keywords: [], traits: null };
  }

  const hsls = colors.map(hexToHsl);
  const traits = getComprehensiveTraits(hsls);
  const seedString = colors.join('');
  const seedGen = createSeededGenerator(seedString);
  const colorCount = colors.length;
  
  // Generate core SEO elements
  const title = generateTitle(traits, colorCount, seedGen);
  const meta = generateMetaDescription(traits, colorCount, seedGen);
  
  // Build content sections
  const contentSections = [];
  
  // Opening paragraph with harmony explanation
  contentSections.push(generateOpeningParagraph(traits, colorCount, seedGen));
  
  // Industry application sections
  const industries = ['webDesign', 'branding', 'interiorDesign', 'digitalArt', 'fashion', 'print', 'photography', 'accessibility'];
  
  industries.forEach(industry => {
    const section = generateIndustrySection(industry, traits, seedGen);
    if (section) {
      contentSections.push(section);
    }
  });
  
  // Technical specifications
  contentSections.push(generateTechnicalSpecs(colors, traits));
  
  // Export information
  contentSections.push(generateExportInfo());
  
  // Generate keywords
  const keywords = generateKeywords(traits, colorCount);
  
  return {
    title,
    meta,
    content: contentSections.join('\n\n'),
    keywords,
    traits: {
      harmony: traits.harmony,
      temperature: traits.temperature.type,
      saturation: traits.isVibrant ? 'vibrant' : traits.isMuted ? 'muted' : 'moderate',
      lightness: traits.isDark ? 'dark' : traits.isLight ? 'light' : traits.isPastel ? 'pastel' : 'balanced',
      primaryHue: traits.hueInfo.primary,
      detailedHue: traits.hueInfo.detailed,
      contrastRatio: traits.contrastRatio,
      accessibilityScore: traits.accessibilityScore
    }
  };
};