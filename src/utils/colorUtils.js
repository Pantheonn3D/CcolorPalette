// src/utils/colorUtils.js

// ============================================
// 1. COLOR SPACE CONVERSION UTILITIES
// ============================================

// HSL <-> HEX (kept for display compatibility)
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

// ============================================
// OKLCH COLOR SPACE CONVERSION
// ============================================

const srgbToLinear = (c) => {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
};

const linearToSrgb = (c) => {
  return c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
};

const linearRgbToOklab = (r, g, b) => {
  const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
  const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
  const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;

  const l_ = Math.cbrt(l);
  const m_ = Math.cbrt(m);
  const s_ = Math.cbrt(s);

  return {
    L: 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_,
    a: 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_,
    b: 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_
  };
};

const oklabToLinearRgb = (L, a, b) => {
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.2914855480 * b;

  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;

  return {
    r: +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    g: -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    b: -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s
  };
};

const oklabToOklch = (L, a, b) => {
  const C = Math.sqrt(a * a + b * b);
  let h = Math.atan2(b, a) * 180 / Math.PI;
  if (h < 0) h += 360;
  return { L, C, h };
};

const oklchToOklab = (L, C, h) => {
  const hRad = h * Math.PI / 180;
  return {
    L,
    a: C * Math.cos(hRad),
    b: C * Math.sin(hRad)
  };
};

const hexToOklab = (hex) => {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const lr = srgbToLinear(r);
  const lg = srgbToLinear(g);
  const lb = srgbToLinear(b);

  return linearRgbToOklab(lr, lg, lb);
};

// Single unified deltaE function for OKLab
const deltaEOK = (lab1, lab2) => {
  const dL = lab1.L - lab2.L;
  const da = lab1.a - lab2.a;
  const db = lab1.b - lab2.b;
  return Math.sqrt(dL * dL + da * da + db * db);
};

export const hexToOklch = (hex) => {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const lr = srgbToLinear(r);
  const lg = srgbToLinear(g);
  const lb = srgbToLinear(b);

  const lab = linearRgbToOklab(lr, lg, lb);
  return oklabToOklch(lab.L, lab.a, lab.b);
};

const isInGamut = (r, g, b) => {
  const epsilon = 0.0001;
  return r >= -epsilon && r <= 1 + epsilon &&
         g >= -epsilon && g <= 1 + epsilon &&
         b >= -epsilon && b <= 1 + epsilon;
};

const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);

const clipLinearRgb01 = (rgb) => ({
  r: clamp01(rgb.r),
  g: clamp01(rgb.g),
  b: clamp01(rgb.b),
});

// Gamut mapping: binary search chroma, plus "clip if already within JND"
const gamutMapOklch = (L, C, h) => {
  if (C === 0) return { L, C, h };

  const initialLab = oklchToOklab(L, C, h);
  const initialRgb = oklabToLinearRgb(initialLab.L, initialLab.a, initialLab.b);
  if (isInGamut(initialRgb.r, initialRgb.g, initialRgb.b)) return { L, C, h };

  const JND = 0.02;

  let lo = 0;
  let hi = C;

  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2;

    const lab = oklchToOklab(L, mid, h);
    const rgb = oklabToLinearRgb(lab.L, lab.a, lab.b);

    if (isInGamut(rgb.r, rgb.g, rgb.b)) {
      lo = mid;
      continue;
    }

    // Local clip check: if clipping is below JND, accept it
    const clippedRgb = clipLinearRgb01(rgb);
    const clippedLab = linearRgbToOklab(clippedRgb.r, clippedRgb.g, clippedRgb.b);
    if (deltaEOK(lab, clippedLab) < JND) {
      return oklabToOklch(clippedLab.L, clippedLab.a, clippedLab.b);
    }

    hi = mid;
  }

  return { L, C: lo, h };
};

export const oklchToHex = (L, C, h) => {
  const mapped = gamutMapOklch(L, C, h);

  const lab = oklchToOklab(mapped.L, mapped.C, mapped.h);
  const rgb = oklabToLinearRgb(lab.L, lab.a, lab.b);

  const r = Math.round(clamp01(linearToSrgb(clamp01(rgb.r))) * 255);
  const g = Math.round(clamp01(linearToSrgb(clamp01(rgb.g))) * 255);
  const b = Math.round(clamp01(linearToSrgb(clamp01(rgb.b))) * 255);

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`.toUpperCase();
};

const random = (min, max, rng) => rng() * (max - min) + min;

// ============================================
// 2. GAMUT-AWARE CHROMA UTILITIES
// ============================================

// Memoization cache for findMaxChroma
const maxChromaCache = new Map();
const MAX_CHROMA_CACHE_SIZE = 5000;

// Find maximum in-gamut chroma for a given L and h (with memoization)
// FIX 1 & 3: Normalize hue to 0-359, and use quantized values for computation
const findMaxChroma = (L, h, precision = 0.001) => {
  // Quantize L to 0.001 and h to 1 degree for cache key
  const quantizedL = Math.round(L * 1000) / 1000;
  // FIX 1: Normalize hue to 0-359 range (360 becomes 0)
  let quantizedH = Math.round(h) % 360;
  if (quantizedH < 0) quantizedH += 360;
  
  const cacheKey = `${quantizedL}-${quantizedH}`;
  
  // Check cache
  if (maxChromaCache.has(cacheKey)) {
    return maxChromaCache.get(cacheKey);
  }
  
  // FIX 3: Use quantized values for computation to ensure cache consistency
  const computeL = quantizedL;
  const computeH = quantizedH;
  
  let lo = 0;
  let hi = 0.4;
  
  while (hi - lo > precision) {
    const mid = (lo + hi) / 2;
    const lab = oklchToOklab(computeL, mid, computeH);
    const rgb = oklabToLinearRgb(lab.L, lab.a, lab.b);
    
    if (isInGamut(rgb.r, rgb.g, rgb.b)) {
      lo = mid;
    } else {
      hi = mid;
    }
  }
  
  // Cache management: clear if too large
  if (maxChromaCache.size >= MAX_CHROMA_CACHE_SIZE) {
    const keysToDelete = Array.from(maxChromaCache.keys()).slice(0, MAX_CHROMA_CACHE_SIZE / 2);
    keysToDelete.forEach(key => maxChromaCache.delete(key));
  }
  
  maxChromaCache.set(cacheKey, lo);
  return lo;
};

// ============================================
// 3. IMPROVED VIBRANCY & HARMONY LOGIC
// ============================================

// Hue-specific adjustments for perceptually pleasing colors
const getHueAdjustments = (h) => {
  // Normalize hue
  const hue = ((h % 360) + 360) % 360;
  
  // Different hue regions have different optimal L/C relationships
  if (hue >= 80 && hue <= 115) {
    // Yellow-green: needs higher lightness to look good
    return { minL: 0.55, maxL: 0.92, chromaBoost: 1.0 };
  } else if (hue >= 55 && hue < 80) {
    // Yellow: needs high lightness, can handle high chroma
    return { minL: 0.65, maxL: 0.95, chromaBoost: 1.1 };
  } else if (hue >= 200 && hue <= 270) {
    // Blue-purple: can go darker, rich at lower lightness
    return { minL: 0.25, maxL: 0.75, chromaBoost: 1.0 };
  } else if (hue >= 150 && hue < 200) {
    // Cyan-teal: limited chroma, be conservative
    return { minL: 0.35, maxL: 0.80, chromaBoost: 0.85 };
  } else if (hue >= 0 && hue < 30 || hue >= 330) {
    // Red: versatile, can be vibrant across many lightness levels
    return { minL: 0.30, maxL: 0.75, chromaBoost: 1.0 };
  } else if (hue >= 270 && hue < 330) {
    // Magenta-pink: can be vibrant, works at various lightness
    return { minL: 0.35, maxL: 0.85, chromaBoost: 1.05 };
  }
  
  // Default for orange, green, etc.
  return { minL: 0.35, maxL: 0.85, chromaBoost: 1.0 };
};

// chromaBoost is applied HERE only (removed from generateCohesiveVariationsOklch)
const adjustForVibrancyOklch = (L, C, h) => {
  const hueAdj = getHueAdjustments(h);
  
  // Clamp L to hue-appropriate range
  let newL = Math.max(hueAdj.minL, Math.min(hueAdj.maxL, L));
  
  // Find maximum achievable chroma at this L and h
  const maxC = findMaxChroma(newL, h);
  
  // Apply chroma boost for certain hues, but stay within gamut
  let targetC = C * hueAdj.chromaBoost;
  
  // Keep 8% headroom from gamut edge for smoother colors
  let newC = Math.min(targetC, maxC * 0.92);
  
  // Ensure minimum chroma for chromatic colors
  if (C > 0.01) {
    newC = Math.max(newC, 0.015);
  }
  
  // Special handling for problematic regions
  
  // Deep blues at high lightness look washed out
  if (h > 230 && h < 280 && newL > 0.78) {
    newL = 0.78;
    newC = Math.min(newC, findMaxChroma(newL, h) * 0.9);
  }
  
  // Yellows at low lightness look muddy
  if (h > 70 && h < 110 && newL < 0.55) {
    newL = 0.55;
    newC = Math.min(newC, findMaxChroma(newL, h) * 0.9);
  }
  
  // Cyans have very limited gamut - be extra conservative
  if (h > 170 && h < 200) {
    newC = Math.min(newC, maxC * 0.85);
  }
  
  return { L: newL, C: newC, h };
};

const generateHarmoniousHues = (mode, count, constraints, rng) => {
  let base;

  if (constraints && typeof constraints.baseHue === 'number') {
    base = constraints.baseHue;
  } else {
    // Bias slightly toward "golden" hues that photograph well
    const goldenHues = [15, 35, 55, 145, 210, 265, 320];
    if (rng() < 0.4) {
      base = goldenHues[Math.floor(rng() * goldenHues.length)] + random(-15, 15, rng);
    } else {
      base = random(0, 360, rng);
    }
  }

  const hues = [];
  
  // Refined jitter function
  const jitter = (amount = 15) => {
    return random(-amount, amount, rng);
  };
  
  // Avoid hue dead zones (muddy transitions)
  const avoidDeadZones = (hue) => {
    const normalized = ((hue % 360) + 360) % 360;
    // Slight adjustments to avoid muddy yellow-green transition zone
    if (normalized > 68 && normalized < 78) {
      return normalized < 73 ? 65 : 80;
    }
    return normalized;
  };

  switch (mode) {
    case 'mono':
      // Monochromatic with subtle hue shifts for visual interest
      for (let i = 0; i < count; i++) {
        const shift = ((i / Math.max(1, count - 1)) - 0.5) * 8;
        hues.push(avoidDeadZones((base + shift + 360) % 360));
      }
      break;
      
    case 'analogous':
      // Tighter analogous range for more cohesive palettes
      const range = Math.min(45, 25 + count * 4);
      for (let i = 0; i < count; i++) {
        const progress = count > 1 ? i / (count - 1) : 0.5;
        const offset = progress * range - (range / 2);
        hues.push(avoidDeadZones((base + offset + jitter(5) + 360) % 360));
      }
      break;
      
    case 'complementary':
      // Distribute colors between two complementary anchors
      const compOffset = 180 + random(-10, 10, rng);
      for (let i = 0; i < count; i++) {
        if (i < Math.ceil(count / 2)) {
          hues.push(avoidDeadZones((base + jitter(12) + 360) % 360));
        } else {
          hues.push(avoidDeadZones((base + compOffset + jitter(12) + 360) % 360));
        }
      }
      break;
      
    case 'splitComplementary':
      // Simplified anchors array
      const splitAngle = 150 + random(-5, 5, rng);
      const splitAnchors = [0, splitAngle, 360 - splitAngle];
      for (let i = 0; i < count; i++) {
        const anchor = splitAnchors[i % splitAnchors.length];
        hues.push(avoidDeadZones((base + anchor + jitter(8) + 360) % 360));
      }
      break;
      
    case 'triadic':
      // True triadic with slight organic variation
      const triadicAnchors = [0, 120 + random(-5, 5, rng), 240 + random(-5, 5, rng)];
      for (let i = 0; i < count; i++) {
        const anchor = triadicAnchors[i % triadicAnchors.length];
        hues.push(avoidDeadZones((base + anchor + jitter(7) + 360) % 360));
      }
      break;
      
    case 'tetradic':
      // Four colors in rectangle pattern
      const tetAnchors = [0, 90, 180, 270];
      for (let i = 0; i < count; i++) {
        const anchor = tetAnchors[i % tetAnchors.length];
        hues.push(avoidDeadZones((base + anchor + jitter(10) + 360) % 360));
      }
      break;
      
    default:
      for (let i = 0; i < count; i++) {
        hues.push(avoidDeadZones((base + (i * 30) + 360) % 360));
      }
  }
  
  return hues;
};

// FIX 2: Removed chromaBoost multiplication - it's now only applied in adjustForVibrancyOklch
const generateCohesiveVariationsOklch = (hues, mood, count, rng) => {
  const result = [];
  
  // Determine base strategy
  const useLightnessProgression = rng() < 0.7;
  const progressionDirection = rng() < 0.5 ? 'ascending' : 'descending';
  
  // Calculate target chroma consistency
  let targetChromaRatio;
  let lightnessRange;
  
  switch (mood) {
    case 'pastel':
      targetChromaRatio = { min: 0.25, max: 0.45 };
      lightnessRange = { min: 0.82, max: 0.94 };
      break;
      case 'vibrant':
        targetChromaRatio = { min: 0.80, max: 0.98 }; // Was 0.70-0.90
        lightnessRange = { min: 0.48, max: 0.80 };
        break;
      case 'pastel':
        targetChromaRatio = { min: 0.35, max: 0.55 }; // Was 0.25-0.45 - richer pastels
        lightnessRange = { min: 0.80, max: 0.92 };
        break;
      case 'muted':
        targetChromaRatio = { min: 0.20, max: 0.45 }; // Was 0.15-0.35 - not so dead
        lightnessRange = { min: 0.38, max: 0.68 };
        break;
      default: // 'any'
        targetChromaRatio = { min: 0.50, max: 0.85 }; // Was 0.40-0.70
        lightnessRange = { min: 0.28, max: 0.88 };
  }
  
  // Generate base lightness values with good distribution
  const lightnessValues = [];
  
  if (useLightnessProgression && count >= 3) {
    for (let i = 0; i < count; i++) {
      const t = count > 1 ? i / (count - 1) : 0.5;
      const eased = t * t * (3 - 2 * t); // Smoothstep
      
      let L;
      if (progressionDirection === 'ascending') {
        L = lightnessRange.min + eased * (lightnessRange.max - lightnessRange.min);
      } else {
        L = lightnessRange.max - eased * (lightnessRange.max - lightnessRange.min);
      }
      
      L += random(-0.03, 0.03, rng);
      lightnessValues.push(Math.max(lightnessRange.min, Math.min(lightnessRange.max, L)));
    }
  } else {
    const segments = count;
    const segmentSize = (lightnessRange.max - lightnessRange.min) / segments;
    
    for (let i = 0; i < count; i++) {
      const segmentStart = lightnessRange.min + i * segmentSize;
      const L = segmentStart + random(0.02, segmentSize - 0.02, rng);
      lightnessValues.push(Math.max(lightnessRange.min, Math.min(lightnessRange.max, L)));
    }
    
    // Shuffle for variety
    for (let i = lightnessValues.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [lightnessValues[i], lightnessValues[j]] = [lightnessValues[j], lightnessValues[i]];
    }
  }
  
  // Generate chroma values based on each hue's gamut and target ratio
  for (let i = 0; i < count; i++) {
    const h = hues[i];
    let L = lightnessValues[i];
    
    // Apply hue-specific lightness constraints
    const hueAdj = getHueAdjustments(h);
    L = Math.max(hueAdj.minL, Math.min(hueAdj.maxL, L));
    
    const maxC = findMaxChroma(L, h);
    const ratio = random(targetChromaRatio.min, targetChromaRatio.max, rng);
    
    // FIX 2: Just use the ratio of maxC, no chromaBoost here
    // chromaBoost will be applied later in adjustForVibrancyOklch
    let C = maxC * ratio;
    
    // Stay safely in gamut
    C = Math.min(C, maxC * 0.92);
    
    result.push({ C, L });
  }
  
  return result;
};

// ============================================
// 4. MINIMUM DISTANCE ENFORCEMENT
// ============================================

const calculatePerceptualDistance = (hex1, hex2) => {
  const lab1 = hexToOklab(hex1);
  const lab2 = hexToOklab(hex2);
  return deltaEOK(lab1, lab2);
};

const enforceMinimumDistance = (colors, minDistance = 0.08, maxAttempts = 50) => {
  const result = [...colors];
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    let allGood = true;
    
    for (let i = 0; i < result.length; i++) {
      for (let j = i + 1; j < result.length; j++) {
        const dist = calculatePerceptualDistance(result[i], result[j]);
        
        if (dist < minDistance) {
          allGood = false;
          
          const oklch1 = hexToOklch(result[i]);
          const oklch2 = hexToOklch(result[j]);
          
          let newL = oklch2.L;
          if (oklch2.L > oklch1.L) {
            newL = Math.min(0.95, oklch2.L + 0.08);
          } else {
            newL = Math.max(0.10, oklch2.L - 0.08);
          }
          
          let newC = oklch2.C;
          if (oklch2.C < 0.15) {
            newC = Math.min(oklch2.C + 0.03, findMaxChroma(newL, oklch2.h) * 0.9);
          }
          
          result[j] = oklchToHex(newL, newC, oklch2.h);
        }
      }
    }
    
    if (allGood) break;
  }
  
  return result;
};

// ============================================
// 5. MAIN PALETTE GENERATOR
// ============================================

export const generateRandomPalette = (mode = 'auto', count = 5, constraints = {}, rng = Math.random) => {
  let harmonyMode = mode;
  let activeMood = constraints.mood || 'any';

  if (mode === 'auto') {
    const roll = rng();

    if (count <= 2) {
      if (roll < 0.45) harmonyMode = 'complementary';
      else if (roll < 0.75) harmonyMode = 'mono';
      else harmonyMode = 'analogous';
    } else if (count === 3) {
      if (roll < 0.35) harmonyMode = 'triadic';
      else if (roll < 0.60) harmonyMode = 'splitComplementary';
      else if (roll < 0.85) harmonyMode = 'analogous';
      else harmonyMode = 'mono';
    } else if (count === 4) {
      if (roll < 0.30) harmonyMode = 'tetradic';
      else if (roll < 0.55) harmonyMode = 'analogous';
      else if (roll < 0.75) harmonyMode = 'splitComplementary';
      else if (roll < 0.90) harmonyMode = 'complementary';
      else harmonyMode = 'mono';
    } else if (count >= 6) {
      if (roll < 0.55) harmonyMode = 'analogous';
      else if (roll < 0.80) harmonyMode = 'mono';
      else harmonyMode = 'splitComplementary';
    } else {
      if (roll < 0.40) harmonyMode = 'analogous';
      else if (roll < 0.60) harmonyMode = 'mono';
      else if (roll < 0.80) harmonyMode = 'complementary';
      else if (roll < 0.92) harmonyMode = 'splitComplementary';
      else harmonyMode = 'triadic';
    }

    if (!constraints.mood || constraints.mood === 'any') {
      const moodRoll = rng();
    
      if (moodRoll < 0.45) {        // Was 0.30 - more vibrant
        activeMood = 'vibrant';
      } else if (moodRoll < 0.58) { // Was 0.50 - less muted
        activeMood = 'muted';
      } else if (moodRoll < 0.72) { // Was 0.65
        activeMood = 'pastel';
      } else if (moodRoll < 0.85) { // Was 0.80
        activeMood = 'dark';
      } else if (moodRoll < 0.93) {
        activeMood = 'light';
      } else {
        activeMood = 'any';
      }
    }
  }

  const hues = generateHarmoniousHues(harmonyMode, count, constraints, rng);
  const clValues = generateCohesiveVariationsOklch(hues, activeMood, count, rng);

  let palette = [];
  for (let i = 0; i < count; i++) {
    const h = hues[i];
    let { C, L } = clValues[i];

    const polished = adjustForVibrancyOklch(L, C, h);

    if (constraints.darkModeFriendly && polished.L > 0.85) {
      polished.L = 0.85;
      const maxC = findMaxChroma(polished.L, polished.h);
      polished.C = Math.min(polished.C, maxC * 0.9);
    }

    palette.push(oklchToHex(polished.L, polished.C, polished.h));
  }

  palette = enforceMinimumDistance(palette, 0.06);

  return optimizeColorOrder(palette);
};

// ============================================
// 6. UTILITIES (Sorting, Contrast, Shades)
// ============================================

const optimizeColorOrder = (colors) => {
  if (colors.length <= 2) return colors;
  
  const colorData = colors.map((hex) => ({
    hex,
    oklch: hexToOklch(hex),
    oklab: hexToOklab(hex),
  }));

  const hues = colorData.map(c => c.oklch.h);
  const minHue = Math.min(...hues);
  const maxHue = Math.max(...hues);
  let hueSpread = maxHue - minHue;
  if (hueSpread > 180) hueSpread = 360 - hueSpread;

  // For monochromatic/analogous, sort by lightness
  if (hueSpread < 45) {
    return colorData.sort((a, b) => a.oklch.L - b.oklch.L).map(c => c.hex);
  }
  
  // For diverse hues, use OKLab deltaE for nearest neighbor
  let current = colorData.reduce((prev, curr) => (curr.oklch.L < prev.oklch.L ? curr : prev));
  const sorted = [current];
  let remaining = colorData.filter(c => c !== current);

  while (remaining.length > 0) {
    let nearest = null;
    let minDist = Infinity;
    
    for (const candidate of remaining) {
      const dist = deltaEOK(current.oklab, candidate.oklab);
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

const relativeLuminance = (hex) => {
  const r = srgbToLinear(parseInt(hex.slice(1, 3), 16) / 255);
  const g = srgbToLinear(parseInt(hex.slice(3, 5), 16) / 255);
  const b = srgbToLinear(parseInt(hex.slice(5, 7), 16) / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const wcagContrastRatio = (hexA, hexB) => {
  const lA = relativeLuminance(hexA);
  const lB = relativeLuminance(hexB);
  const lighter = Math.max(lA, lB);
  const darker = Math.min(lA, lB);
  return (lighter + 0.05) / (darker + 0.05);
};

export const getContrastColor = (hex) => {
  const contrastWithBlack = wcagContrastRatio(hex, '#000000');
  const contrastWithWhite = wcagContrastRatio(hex, '#FFFFFF');
  return contrastWithBlack > contrastWithWhite ? '#000000' : '#FFFFFF';
};

export const generateBridgeColor = (colorBefore, colorAfter) => {
  const c1 = hexToOklch(colorBefore);
  const c2 = hexToOklch(colorAfter);

  let h1 = c1.h;
  let h2 = c2.h;
  let diff = h2 - h1;
  if (diff > 180) h2 -= 360;
  if (diff < -180) h2 += 360;

  let h = (h1 + h2) / 2;
  if (h < 0) h += 360;
  if (h >= 360) h -= 360;

  const C = (c1.C + c2.C) / 2;
  const L = (c1.L + c2.L) / 2;

  const polished = adjustForVibrancyOklch(L, C, h);
  return oklchToHex(polished.L, polished.C, polished.h);
};

export const generateShades = (hex, totalSteps = 20) => {
  const { L, C, h } = hexToOklch(hex);
  const shades = [];
  const maxLight = 0.97;
  const minLight = 0.08;

  for (let i = 0; i < totalSteps; i++) {
    const t = i / (totalSteps - 1);
    const newL = maxLight - t * (maxLight - minLight);
    
    const maxC = findMaxChroma(newL, h);
    
    let targetC;
    if (newL > L) {
      const ratio = (newL - L) / (maxLight - L);
      targetC = C * (1 - ratio * 0.6);
    } else {
      const ratio = (L - newL) / (L - minLight);
      targetC = C * (1 - ratio * 0.5);
    }
    
    targetC = Math.min(targetC, maxC * 0.92);
    targetC = Math.max(0.005, targetC);
    
    shades.push(oklchToHex(newL, targetC, h));
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
// 7. DETERMINISTIC SEED SYSTEM
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
// 8. COMPREHENSIVE COLOR ANALYSIS
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

const analyzeColorTemperatureFromHues = (hues) => {
  const warmRanges = [[0, 70], [320, 360]];
  const coolRanges = [[170, 280]];

  let warmCount = 0;
  let coolCount = 0;

  for (const h of hues) {
    const inWarm = warmRanges.some(([min, max]) => h >= min && h < max);
    const inCool = coolRanges.some(([min, max]) => h >= min && h < max);
    if (inWarm) warmCount++;
    if (inCool) coolCount++;
  }

  const total = hues.length || 1;
  if (warmCount > total * 0.6) return { type: "warm", ratio: warmCount / total };
  if (coolCount > total * 0.6) return { type: "cool", ratio: coolCount / total };
  return { type: "balanced", ratio: 0.5 };
};

const detectHarmonyTypeFromHues = (hues) => {
  if (hues.length < 2) return "single";

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

// Category flags based entirely on OKLCH values
const getComprehensiveTraits = (hsls, hexColors) => {
  // HSL averages (kept for backward compatibility / display only)
  const avgS = hsls.reduce((a, c) => a + c.s, 0) / hsls.length;
  const avgL = hsls.reduce((a, c) => a + c.l, 0) / hsls.length;
  const maxL = Math.max(...hsls.map(c => c.l));
  const minL = Math.min(...hsls.map(c => c.l));
  const lightnessRange = maxL - minL;

  const satStdDev = Math.sqrt(hsls.reduce((a, c) => a + Math.pow(c.s - avgS, 2), 0) / hsls.length);
  const lightStdDev = Math.sqrt(hsls.reduce((a, c) => a + Math.pow(c.l - avgL, 2), 0) / hsls.length);

  // OKLCH values for accurate perceptual analysis
  const oklchs = hexColors.map(hexToOklch);
  const hues = oklchs.map(c => c.h);
  
  // OKLCH averages for category flags
  const avgOklchL = oklchs.reduce((a, c) => a + c.L, 0) / oklchs.length;
  const avgOklchC = oklchs.reduce((a, c) => a + c.C, 0) / oklchs.length;
  const maxOklchL = Math.max(...oklchs.map(c => c.L));
  const minOklchL = Math.min(...oklchs.map(c => c.L));
  const maxOklchC = Math.max(...oklchs.map(c => c.C));
  const minOklchC = Math.min(...oklchs.map(c => c.C));
  
  // Find dominant color by OKLCH chroma
  const dominant = oklchs.reduce((prev, curr) => (curr.C > prev.C ? curr : prev));
  const hueInfo = getDetailedHueInfo(dominant.h);
  
  const temperature = analyzeColorTemperatureFromHues(hues);
  const harmony = detectHarmonyTypeFromHues(hues);

  // Find darkest and lightest by relative luminance for WCAG
  let darkestHex = hexColors[0];
  let lightestHex = hexColors[0];
  let minLum = relativeLuminance(hexColors[0]);
  let maxLum = minLum;

  for (const hex of hexColors) {
    const lum = relativeLuminance(hex);
    if (lum < minLum) {
      minLum = lum;
      darkestHex = hex;
    }
    if (lum > maxLum) {
      maxLum = lum;
      lightestHex = hex;
    }
  }

  const contrastRatio = wcagContrastRatio(lightestHex, darkestHex).toFixed(2);
  const contrastValue = parseFloat(contrastRatio);

  // Category flags based on OKLCH values (perceptually accurate)
  const isVibrant = avgOklchC > 0.15;
  const isMuted = avgOklchC < 0.08;
  const isPastel = avgOklchC < 0.12 && avgOklchL > 0.75;
  const isDark = avgOklchL < 0.40;
  const isLight = avgOklchL > 0.70;
  const isHighContrast = contrastValue >= 4.5;
  const isLowContrast = contrastValue < 2;
  const isUniform = satStdDev < 12 && lightStdDev < 15;
  const hasNeutrals = oklchs.some(c => c.C < 0.03);

  return {
    // HSL values (for display/backward compat)
    avgS, avgL, maxL, minL, lightnessRange,
    satStdDev, lightStdDev,
    
    // OKLCH values (for display and technical specs)
    avgOklchL, avgOklchC, maxOklchL, minOklchL, maxOklchC, minOklchC,
    dominantHueDeg: Math.round(dominant.h),
    
    // Analysis results
    hueInfo, temperature, harmony, contrastRatio,

    // Category flags (based on OKLCH)
    isVibrant,
    isMuted,
    isPastel,
    isDark,
    isLight,
    isHighContrast,
    isLowContrast,
    isUniform,
    hasNeutrals,

    vibrancyScore: Math.round((avgOklchC * 500) + (maxOklchL - minOklchL) * 50),
    accessibilityScore: contrastValue >= 4.5 ? "good" : contrastValue >= 3 ? "moderate" : "limited"
  };
};

// ============================================
// 9. SEMANTIC CONTENT DATABASE
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
// 10. CONTENT GENERATION FUNCTIONS
// ============================================

const generateTitle = (traits, colorCount, seedGen) => {
  const hue = traits.hueInfo.primary;
  const detailed = traits.hueInfo.detailed;

  const templates = [];

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

  if (traits.harmony === "monochromatic") {
    templates.push(
      `Monochromatic ${capitalize(hue)} Palette: ${colorCount} Tonal Variations`,
      `Single-Hue ${capitalize(detailed)} Color System`
    );
  }

  if (traits.harmony === "analogous") {
    templates.push(
      `Analogous ${capitalize(hue)} Color Harmony: ${colorCount} Adjacent Hues`,
      `Harmonious ${capitalize(detailed)} Gradient Palette`
    );
  }

  if (traits.harmony === "complementary") {
    templates.push(
      `Complementary ${capitalize(hue)} Color Scheme: ${colorCount} Contrasting Tones`,
      `High-Contrast ${capitalize(detailed)} Palette`
    );
  }

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

// FIX 4: Technical specs now use OKLCH values consistently
const generateTechnicalSpecs = (colors, traits) => {
  // Convert OKLCH L to percentage for display (0-1 -> 0-100%)
  const avgLPercent = Math.round(traits.avgOklchL * 100);
  const minLPercent = Math.round(traits.minOklchL * 100);
  const maxLPercent = Math.round(traits.maxOklchL * 100);
  
  // Convert OKLCH C to a more readable scale (typical range 0-0.4 -> 0-100)
  const avgCPercent = Math.round(traits.avgOklchC * 250); // Scale so 0.4 ≈ 100
  
  const specs = [
    `Palette Size: ${colors.length} colors`,
    `Primary Hue: ${traits.dominantHueDeg}°`,
    `Color Harmony: ${traits.harmony}`,
    `Chroma: ${avgCPercent}% average (OKLCH)`,
    `Lightness Range: ${minLPercent}% to ${maxLPercent}% (OKLCH)`,
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
// 11. KEYWORD GENERATION
// ============================================

const generateKeywords = (traits, colorCount) => {
  const hue = traits.hueInfo.primary;
  const detailed = traits.hueInfo.detailed;
  const keywords = [];

  keywords.push(`${hue} color palette`);
  keywords.push(`${hue} color scheme`);
  keywords.push(`${colorCount} color palette`);
  keywords.push(`${hue} hex codes`);

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

  keywords.push(`${traits.harmony} color palette`, `${traits.harmony} ${hue} colors`);

  keywords.push(`${hue} web design colors`, `${hue} branding palette`, `${hue} ui colors`);
  keywords.push(`${hue} interior design`, `${hue} graphic design`);

  if (detailed !== hue) {
    keywords.push(`${detailed} color palette`, `${detailed} color scheme`);
  }

  return keywords;
};

// ============================================
// 12. MAIN SEO GENERATOR
// ============================================

export const generateRichSEO = (colors, mode = 'auto', mood = 'any') => {
  if (!colors || colors.length === 0) {
    return { title: "", meta: "", content: "", keywords: [], traits: null };
  }

  const hsls = colors.map(hexToHsl);
  const traits = getComprehensiveTraits(hsls, colors);
  const seedString = colors.join('');
  const seedGen = createSeededGenerator(seedString);
  const colorCount = colors.length;

  const title = generateTitle(traits, colorCount, seedGen);
  const meta = generateMetaDescription(traits, colorCount, seedGen);

  const contentSections = [];

  contentSections.push(generateOpeningParagraph(traits, colorCount, seedGen));

  const industries = ['webDesign', 'branding', 'interiorDesign', 'digitalArt', 'fashion', 'print', 'photography', 'accessibility'];

  industries.forEach(industry => {
    const section = generateIndustrySection(industry, traits, seedGen);
    if (section) {
      contentSections.push(section);
    }
  });

  contentSections.push(generateTechnicalSpecs(colors, traits));

  contentSections.push(generateExportInfo());

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