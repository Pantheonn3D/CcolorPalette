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

const gamutMapOklch = (L, C, h) => {
  if (C === 0) return { L, C, h };
  
  const lab = oklchToOklab(L, C, h);
  const rgb = oklabToLinearRgb(lab.L, lab.a, lab.b);

  if (isInGamut(rgb.r, rgb.g, rgb.b)) {
    return { L, C, h };
  }

  let lo = 0;
  let hi = C;

  for (let i = 0; i < 20; i++) {
    const mid = (lo + hi) / 2;
    const testLab = oklchToOklab(L, mid, h);
    const testRgb = oklabToLinearRgb(testLab.L, testLab.a, testLab.b);

    if (isInGamut(testRgb.r, testRgb.g, testRgb.b)) {
      lo = mid;
    } else {
      hi = mid;
    }
  }

  return { L, C: lo, h };
};

export const oklchToHex = (L, C, h) => {
  const mapped = gamutMapOklch(L, C, h);

  const lab = oklchToOklab(mapped.L, mapped.C, mapped.h);
  const rgb = oklabToLinearRgb(lab.L, lab.a, lab.b);

  const r = Math.round(Math.max(0, Math.min(255, linearToSrgb(rgb.r) * 255)));
  const g = Math.round(Math.max(0, Math.min(255, linearToSrgb(rgb.g) * 255)));
  const b = Math.round(Math.max(0, Math.min(255, linearToSrgb(rgb.b) * 255)));

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`.toUpperCase();
};

const random = (min, max, rng) => rng() * (max - min) + min;

// ============================================
// 2. OKLCH VIBRANCY & HARMONY LOGIC
// ============================================

const adjustForVibrancyOklch = (L, C, h) => {
  let newL = L;
  let newC = C;
  let newH = h;

  // OKLCH is perceptually uniform, so fewer hue-specific fixes needed
  // Slight boost for yellow-green region which can handle more chroma
  if (h > 110 && h < 160) {
    newC = Math.min(newC * 1.1, 0.32);
  }

  // Blues at high lightness can look washed out
  if (h > 250 && h < 290 && newL > 0.75) {
    newC = Math.max(newC, 0.08);
  }

  // Ensure minimum chroma for chromatic colors
  if (C > 0.01) {
    newC = Math.max(newC, 0.025);
  }

  // Cap extremes
  newC = Math.max(0, Math.min(0.37, newC));
  newL = Math.max(0.07, Math.min(0.97, newL));

  return { L: newL, C: newC, h: newH };
};

// ============================================
// MOOD-BASED HUE GENERATION
// ============================================

const getMoodBaseHue = (mood, rng) => {
  switch (mood) {
    case 'warm':
      // Warm hues: reds, oranges, yellows (330-60, wrapping around 0)
      return rng() < 0.7 ? random(0, 65, rng) : random(330, 360, rng);
    
    case 'cool':
      // Cool hues: cyans, blues, cool purples
      return random(180, 280, rng);
    
    case 'earthy':
      // Earthy: browns, olive greens, muted oranges, terracotta
      return random(25, 120, rng);
    
    case 'neon':
      // Neon can be any hue but favors magentas, cyans, greens
      const neonRoll = rng();
      if (neonRoll < 0.33) return random(300, 330, rng); // Magenta/pink
      if (neonRoll < 0.66) return random(160, 200, rng); // Cyan/teal
      return random(90, 130, rng); // Green
    
    default:
      return random(0, 360, rng);
  }
};

const generateHarmoniousHues = (mode, count, constraints, rng) => {
  let base;
  const mood = constraints?.mood;

  if (constraints && typeof constraints.baseHue === 'number') {
    base = constraints.baseHue;
  } else if (mood === 'warm' || mood === 'cool' || mood === 'earthy' || mood === 'neon') {
    base = getMoodBaseHue(mood, rng);
  } else {
    base = random(0, 360, rng);
  }

  const hues = [];
  const jitter = (amount = 15) => random(-amount, amount, rng);

  // For warm/cool/earthy moods, reduce jitter to maintain temperature consistency
  const moodJitterMultiplier = (mood === 'warm' || mood === 'cool' || mood === 'earthy') ? 0.5 : 1;

  switch (mode) {
    case 'mono':
      for (let i = 0; i < count; i++) hues.push((base + jitter(5 * moodJitterMultiplier) + 360) % 360);
      break;
    case 'analogous':
      const range = mood === 'warm' || mood === 'cool' ? 35 : 50;
      for (let i = 0; i < count; i++) {
        const progress = count > 1 ? i / (count - 1) : 0.5;
        const offset = progress * range - (range / 2);
        hues.push((base + offset + jitter(8 * moodJitterMultiplier) + 360) % 360);
      }
      break;
    case 'complementary':
      for (let i = 0; i < count; i++) {
        if (i < Math.ceil(count / 2)) hues.push((base + jitter(15 * moodJitterMultiplier) + 360) % 360);
        else hues.push((base + 180 + jitter(15 * moodJitterMultiplier) + 360) % 360);
      }
      break;
    case 'splitComplementary':
    case 'triadic':
      const anchors = mode === 'triadic' ? [0, 120, 240] : [0, 150, 210];
      for (let i = 0; i < count; i++) {
        const anchor = anchors[i % anchors.length];
        hues.push((base + anchor + jitter(10 * moodJitterMultiplier) + 360) % 360);
      }
      break;
    default:
      for (let i = 0; i < count; i++) hues.push((base + (i * 30) + 360) % 360);
  }
  return hues;
};

// ============================================
// MOOD-BASED CHROMA/LIGHTNESS GENERATION
// ============================================

const generateCohesiveVariationsOklch = (hues, mood, count, rng) => {
  const result = [];
  const strategy = rng();

  for (let i = 0; i < count; i++) {
    const t = count > 1 ? i / (count - 1) : 0.5;
    let C, L;

    switch (mood) {
      // === SATURATION-BASED MOODS ===
      case 'pastel':
        // Soft, light, low-medium saturation
        C = random(0.04, 0.10, rng);
        L = random(0.84, 0.94, rng);
        break;

      case 'vibrant':
        // Bold, saturated, punchy
        C = random(0.15, 0.28, rng);
        L = random(0.48, 0.72, rng);
        break;

      case 'muted':
        // Desaturated, subtle, sophisticated
        C = random(0.02, 0.07, rng);
        L = random(0.38, 0.72, rng);
        break;

      // === LIGHTNESS-BASED MOODS ===
      case 'dark':
        // Deep, rich, dramatic darks
        C = random(0.06, 0.18, rng);
        L = random(0.15, 0.38, rng);
        break;

      case 'bright':
        // High luminosity, energetic
        C = random(0.10, 0.22, rng);
        L = random(0.72, 0.92, rng);
        break;

      case 'moody':
        // Dramatic, emotional, medium-dark with presence
        C = random(0.08, 0.18, rng);
        L = random(0.20, 0.50, rng);
        break;

      // === FEELING-BASED MOODS ===
      case 'soft':
        // Gentle, calming, approachable
        C = random(0.03, 0.09, rng);
        L = random(0.68, 0.88, rng);
        break;

      case 'elegant':
        // Sophisticated, refined, balanced
        C = random(0.04, 0.12, rng);
        L = random(0.32, 0.68, rng);
        break;

      case 'playful':
        // Fun, varied, colorful energy
        C = random(0.14, 0.26, rng);
        L = random(0.52, 0.82, rng);
        break;

      // === TEMPERATURE-BASED MOODS ===
      case 'warm':
        // Inviting, cozy warmth
        C = random(0.08, 0.18, rng);
        L = random(0.42, 0.78, rng);
        break;

      case 'cool':
        // Calm, serene, professional
        C = random(0.06, 0.15, rng);
        L = random(0.42, 0.78, rng);
        break;

      // === STYLE-BASED MOODS ===
      case 'earthy':
        // Natural, organic, grounded
        C = random(0.04, 0.14, rng);
        L = random(0.28, 0.62, rng);
        break;

      case 'retro':
        // Vintage-inspired, slightly desaturated with character
        C = random(0.08, 0.16, rng);
        L = random(0.42, 0.72, rng);
        break;

      case 'neon':
        // Electric, high-energy, maximum saturation
        C = random(0.22, 0.35, rng);
        L = random(0.55, 0.78, rng);
        break;

      // === DEFAULT / ANY ===
      default:
        // Original behavior with natural light-to-dark gradient variation
        C = 0.07 + (Math.sin(t * Math.PI) * 0.07) + random(-0.02, 0.02, rng);

        if (strategy < 0.40) {
          // Light to dark gradient
          L = 0.22 + (t * 0.62) + random(-0.05, 0.05, rng);
        } else if (strategy < 0.80) {
          // Dark to light gradient
          L = 0.84 - (t * 0.62) + random(-0.05, 0.05, rng);
        } else {
          // Anchored extremes with varied midtones
          if (i === 0) L = random(0.20, 0.35, rng);
          else if (i === count - 1) L = random(0.78, 0.92, rng);
          else L = random(0.38, 0.72, rng);
        }
        break;
    }

    result.push({ C, L });
  }
  return result;
};

// NEW: Sorts colors to maximize adjacent contrast (Zig-Zag: Dark, Light, Dark, Light)
const optimizeForContrast = (colors, targetRatio) => {
  // 1. Sort by Luminance first (Darkest to Lightest)
  const sortedByLum = colors.map(hex => ({
    hex,
    lum: relativeLuminance(hex),
    oklch: hexToOklch(hex)
  })).sort((a, b) => a.lum - b.lum);

  // 2. Zipper Merge to maximize difference
  const result = [];
  let left = 0;
  let right = sortedByLum.length - 1;

  while (left <= right) {
    if (left === right) {
      result.push(sortedByLum[left]);
    } else {
      result.push(sortedByLum[left]); // Add Dark
      result.push(sortedByLum[right]); // Add Light
    }
    left++;
    right--;
  }

  // 3. Enforce Minimum Contrast (Nudge values if sorting isn't enough)
  if (targetRatio > 1.5) {
    for (let i = 0; i < result.length - 1; i++) {
      const c1 = result[i];
      let c2 = result[i + 1];

      const currentRatio = wcagContrastRatio(c1.hex, c2.hex);

      if (currentRatio < targetRatio) {
        let { L, C, h } = c2.oklch;
        
        const step = 0.05; 
        const maxAttempts = 10;
        let attempts = 0;

        let bestHex = c2.hex;
        let bestRatio = currentRatio;

        while (attempts < maxAttempts && bestRatio < targetRatio) {
          if (c1.lum < 0.5) {
            L = Math.min(0.98, L + step);
          } else {
            L = Math.max(0.02, L - step);
          }
          
          const newHex = oklchToHex(L, C, h);
          const newRatio = wcagContrastRatio(c1.hex, newHex);
          
          if (newRatio > bestRatio) {
            bestRatio = newRatio;
            bestHex = newHex;
          }
          
          if (L >= 0.98 || L <= 0.02) break;
          attempts++;
        }
        
        result[i + 1] = { ...c2, hex: bestHex, oklch: { L, C, h }, lum: relativeLuminance(bestHex) };
      }
    }
  }

  return result.map(c => c.hex);
};

// ============================================
// 3. MAIN PALETTE GENERATOR (OKLCH-based)
// ============================================

export const generateRandomPalette = (mode = 'auto', count = 5, constraints = {}, rng = Math.random) => {
  let harmonyMode = mode;

  if (mode === 'auto') {
    const roll = rng();

    if (count <= 2) {
      if (roll < 0.50) harmonyMode = 'complementary';
      else if (roll < 0.80) harmonyMode = 'mono';
      else harmonyMode = 'analogous';
    } else if (count === 3) {
      if (roll < 0.40) harmonyMode = 'splitComplementary';
      else if (roll < 0.70) harmonyMode = 'triadic';
      else if (roll < 0.90) harmonyMode = 'analogous';
      else harmonyMode = 'mono';
    } else if (count >= 6) {
      if (roll < 0.60) harmonyMode = 'analogous';
      else if (roll < 0.85) harmonyMode = 'mono';
      else harmonyMode = 'splitComplementary';
    } else {
      if (roll < 0.45) harmonyMode = 'analogous';
      else if (roll < 0.65) harmonyMode = 'mono';
      else if (roll < 0.85) harmonyMode = 'complementary';
      else if (roll < 0.95) harmonyMode = 'splitComplementary';
      else harmonyMode = 'triadic';
    }
  }

  const hues = generateHarmoniousHues(harmonyMode, count, constraints, rng);
  const clValues = generateCohesiveVariationsOklch(hues, constraints.mood || 'any', count, rng);

  let palette = [];
  for (let i = 0; i < count; i++) {
    const h = hues[i];
    let { C, L } = clValues[i];

    // If High Contrast is requested, force wider spread of Lightness
    if (constraints.minContrast && constraints.minContrast > 2.5) {
      if (i % 2 === 0) L = Math.max(0.15, Math.min(0.4, L));
      else L = Math.max(0.6, Math.min(0.95, L));
    }

    const polished = adjustForVibrancyOklch(L, C, h);

    if (constraints.darkModeFriendly && polished.L > 0.85) polished.L = 0.85;

    palette.push(oklchToHex(polished.L, polished.C, polished.h));
  }

  if (constraints.minContrast && constraints.minContrast > 1.5) {
    return optimizeForContrast(palette, constraints.minContrast);
  } else {
    return optimizeColorOrder(palette);
  }
};

// ============================================
// 4. UTILITIES (Sorting, Contrast, Shades)
// ============================================

const getHueDistance = (h1, h2) => {
  let diff = Math.abs(h1 - h2);
  return diff > 180 ? 360 - diff : diff;
};

const getColorDistanceOklch = (c1, c2) => {
  const hDist = getHueDistance(c1.h, c2.h);
  const cDist = Math.abs(c1.C - c2.C) * 500;
  const lDist = Math.abs(c1.L - c2.L) * 100;
  return Math.sqrt((hDist * hDist * 0.3) + (cDist * cDist) + (lDist * lDist * 2));
};

const optimizeColorOrder = (colors) => {
  const colorData = colors.map((hex) => ({
    hex,
    hsl: hexToHsl(hex),
    oklch: hexToOklch(hex)
  }));

  const hues = colorData.map(c => c.oklch.h);
  const minHue = Math.min(...hues);
  const maxHue = Math.max(...hues);
  let hueSpread = maxHue - minHue;
  if (hueSpread > 180) hueSpread = 360 - hueSpread;

  if (hueSpread < 40) {
    return colorData.sort((a, b) => a.oklch.L - b.oklch.L).map(c => c.hex);
  }

  let current = colorData.reduce((prev, curr) => (curr.oklch.L < prev.oklch.L ? curr : prev));
  const sorted = [current];
  let remaining = colorData.filter(c => c !== current);

  while (remaining.length > 0) {
    let nearest = null;
    let minDist = Infinity;
    for (const candidate of remaining) {
      const dist = getColorDistanceOklch(current.oklch, candidate.oklch);
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

  const currentIndex = Math.round((1 - ((L - minLight) / (maxLight - minLight))) * (totalSteps - 1));
  const clampedIndex = Math.max(0, Math.min(totalSteps - 1, currentIndex));

  if (clampedIndex > 0) {
    const stepSize = (maxLight - L) / clampedIndex;
    for (let i = 0; i < clampedIndex; i++) {
      const newL = maxLight - (stepSize * i);
      const newC = C * (0.5 + 0.5 * (1 - (newL - L) / (maxLight - L)));
      shades.push(oklchToHex(newL, Math.max(0.01, newC), h));
    }
  }

  shades.push(hex);

  const remainingSteps = totalSteps - 1 - clampedIndex;
  if (remainingSteps > 0) {
    const stepSize = (L - minLight) / remainingSteps;
    for (let i = 1; i <= remainingSteps; i++) {
      const newL = L - (stepSize * i);
      const newC = C * (0.6 + 0.4 * ((newL - minLight) / (L - minLight)));
      shades.push(oklchToHex(newL, Math.max(0.01, newC), h));
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

const createSeededRandom = (seed) => {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
};

const hashString = (str) => {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) ^ str.charCodeAt(i);
  }
  return Math.abs(hash);
};

const pickFromArray = (arr, rng) => arr[Math.floor(rng() * arr.length)];

const shuffleArray = (arr, rng) => {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

// ============================================
// 6. PRECISE COLOR NAMING SYSTEM
// ============================================

const getColorName = (h, s, l, C) => {
  // Normalize values
  h = ((h % 360) + 360) % 360;
  
  // Handle achromatic colors (very low saturation)
  if (s < 8 || C < 0.02) {
    if (l < 8) return { name: 'black', family: 'neutral', descriptor: 'deep', mood: 'dramatic' };
    if (l < 18) return { name: 'charcoal', family: 'neutral', descriptor: 'dark', mood: 'sophisticated' };
    if (l < 30) return { name: 'dark gray', family: 'neutral', descriptor: 'deep', mood: 'grounded' };
    if (l < 45) return { name: 'gray', family: 'neutral', descriptor: 'medium', mood: 'balanced' };
    if (l < 60) return { name: 'silver', family: 'neutral', descriptor: 'cool', mood: 'refined' };
    if (l < 75) return { name: 'light gray', family: 'neutral', descriptor: 'soft', mood: 'gentle' };
    if (l < 88) return { name: 'pale gray', family: 'neutral', descriptor: 'airy', mood: 'minimal' };
    if (l < 96) return { name: 'off-white', family: 'neutral', descriptor: 'warm', mood: 'clean' };
    return { name: 'white', family: 'neutral', descriptor: 'pure', mood: 'fresh' };
  }

  // Near-neutral warm tones (low saturation, warm hue)
  if (s < 20 && ((h >= 20 && h <= 50) || l < 40)) {
    if (l < 25) return { name: 'espresso', family: 'brown', descriptor: 'rich', mood: 'grounded' };
    if (l < 40) return { name: 'taupe', family: 'brown', descriptor: 'earthy', mood: 'natural' };
    if (l < 55) return { name: 'mushroom', family: 'brown', descriptor: 'muted', mood: 'organic' };
    if (l < 70) return { name: 'greige', family: 'neutral', descriptor: 'warm', mood: 'sophisticated' };
    if (l < 85) return { name: 'cream', family: 'neutral', descriptor: 'soft', mood: 'inviting' };
    return { name: 'ivory', family: 'neutral', descriptor: 'delicate', mood: 'elegant' };
  }

  // Chromatic color naming with saturation and lightness modifiers
  const getModifier = (sat, light) => {
    if (light < 20) return { prefix: 'dark', mood: 'dramatic' };
    if (light < 35) return { prefix: 'deep', mood: 'rich' };
    if (light > 85) return { prefix: 'pale', mood: 'gentle' };
    if (light > 75) return { prefix: 'light', mood: 'airy' };
    if (sat < 30) return { prefix: 'muted', mood: 'subtle' };
    if (sat < 50) return { prefix: 'soft', mood: 'calm' };
    if (sat > 80) return { prefix: 'vivid', mood: 'energetic' };
    if (sat > 65) return { prefix: 'bright', mood: 'vibrant' };
    return { prefix: '', mood: 'balanced' };
  };

  const mod = getModifier(s, l);

  // Detailed hue-based naming
  let baseColor;
  
  // Reds (345-360, 0-10)
  if (h >= 345 || h < 10) {
    if (l < 30) baseColor = { name: 'burgundy', family: 'red', descriptor: 'wine-toned' };
    else if (l < 45 && s > 50) baseColor = { name: 'crimson', family: 'red', descriptor: 'bold' };
    else if (l > 70 && s < 50) baseColor = { name: 'rose', family: 'red', descriptor: 'romantic' };
    else if (l > 75) baseColor = { name: 'blush', family: 'red', descriptor: 'delicate' };
    else if (s > 70) baseColor = { name: 'scarlet', family: 'red', descriptor: 'striking' };
    else baseColor = { name: 'red', family: 'red', descriptor: 'classic' };
  }
  // Red-orange (10-20)
  else if (h >= 10 && h < 20) {
    if (l < 35) baseColor = { name: 'rust', family: 'orange', descriptor: 'earthy' };
    else if (l < 50) baseColor = { name: 'terracotta', family: 'orange', descriptor: 'warm' };
    else if (s > 70) baseColor = { name: 'vermilion', family: 'orange', descriptor: 'fiery' };
    else if (l > 70) baseColor = { name: 'peach', family: 'orange', descriptor: 'soft' };
    else baseColor = { name: 'burnt orange', family: 'orange', descriptor: 'rich' };
  }
  // Orange (20-35)
  else if (h >= 20 && h < 35) {
    if (l < 35) baseColor = { name: 'brown', family: 'brown', descriptor: 'grounded' };
    else if (l < 50 && s < 50) baseColor = { name: 'caramel', family: 'brown', descriptor: 'warm' };
    else if (l > 75) baseColor = { name: 'apricot', family: 'orange', descriptor: 'gentle' };
    else if (s > 70) baseColor = { name: 'tangerine', family: 'orange', descriptor: 'energetic' };
    else baseColor = { name: 'orange', family: 'orange', descriptor: 'warm' };
  }
  // Orange-yellow (35-48)
  else if (h >= 35 && h < 48) {
    if (l < 40) baseColor = { name: 'bronze', family: 'brown', descriptor: 'metallic' };
    else if (l > 75) baseColor = { name: 'champagne', family: 'yellow', descriptor: 'elegant' };
    else if (s > 70) baseColor = { name: 'amber', family: 'orange', descriptor: 'golden' };
    else if (s < 40) baseColor = { name: 'sand', family: 'neutral', descriptor: 'natural' };
    else baseColor = { name: 'gold', family: 'yellow', descriptor: 'luxurious' };
  }
  // Yellow (48-65)
  else if (h >= 48 && h < 65) {
    if (l < 45) baseColor = { name: 'olive', family: 'green', descriptor: 'earthy' };
    else if (l > 80 && s < 50) baseColor = { name: 'cream', family: 'yellow', descriptor: 'soft' };
    else if (l > 75) baseColor = { name: 'lemon', family: 'yellow', descriptor: 'fresh' };
    else if (s > 70) baseColor = { name: 'canary', family: 'yellow', descriptor: 'bright' };
    else if (s < 40) baseColor = { name: 'khaki', family: 'yellow', descriptor: 'muted' };
    else baseColor = { name: 'yellow', family: 'yellow', descriptor: 'sunny' };
  }
  // Yellow-green (65-80)
  else if (h >= 65 && h < 80) {
    if (l < 40) baseColor = { name: 'moss', family: 'green', descriptor: 'organic' };
    else if (l > 75) baseColor = { name: 'honeydew', family: 'green', descriptor: 'fresh' };
    else if (s > 60) baseColor = { name: 'chartreuse', family: 'green', descriptor: 'electric' };
    else baseColor = { name: 'lime', family: 'green', descriptor: 'zesty' };
  }
  // Green (80-150)
  else if (h >= 80 && h < 150) {
    if (h < 100) {
      if (l < 35) baseColor = { name: 'forest', family: 'green', descriptor: 'deep' };
      else if (s > 60) baseColor = { name: 'grass', family: 'green', descriptor: 'natural' };
      else baseColor = { name: 'green', family: 'green', descriptor: 'fresh' };
    } else if (h < 130) {
      if (l < 30) baseColor = { name: 'hunter', family: 'green', descriptor: 'classic' };
      else if (l > 70) baseColor = { name: 'mint', family: 'green', descriptor: 'cool' };
      else if (s > 50) baseColor = { name: 'emerald', family: 'green', descriptor: 'jewel-toned' };
      else baseColor = { name: 'sage', family: 'green', descriptor: 'muted' };
    } else {
      if (l < 35) baseColor = { name: 'pine', family: 'green', descriptor: 'deep' };
      else if (l > 70) baseColor = { name: 'seafoam', family: 'green', descriptor: 'soft' };
      else baseColor = { name: 'jade', family: 'green', descriptor: 'rich' };
    }
  }
  // Cyan-green (150-170)
  else if (h >= 150 && h < 170) {
    if (l < 35) baseColor = { name: 'dark teal', family: 'teal', descriptor: 'sophisticated' };
    else if (l > 70) baseColor = { name: 'aquamarine', family: 'teal', descriptor: 'refreshing' };
    else if (s > 50) baseColor = { name: 'teal', family: 'teal', descriptor: 'balanced' };
    else baseColor = { name: 'sea green', family: 'teal', descriptor: 'oceanic' };
  }
  // Cyan (170-195)
  else if (h >= 170 && h < 195) {
    if (l < 35) baseColor = { name: 'dark cyan', family: 'cyan', descriptor: 'deep' };
    else if (l > 75) baseColor = { name: 'pale cyan', family: 'cyan', descriptor: 'icy' };
    else if (s > 60) baseColor = { name: 'cyan', family: 'cyan', descriptor: 'electric' };
    else baseColor = { name: 'aqua', family: 'cyan', descriptor: 'fresh' };
  }
  // Sky blue (195-215)
  else if (h >= 195 && h < 215) {
    if (l < 35) baseColor = { name: 'prussian', family: 'blue', descriptor: 'historic' };
    else if (l > 75) baseColor = { name: 'sky', family: 'blue', descriptor: 'open' };
    else if (s > 50) baseColor = { name: 'cerulean', family: 'blue', descriptor: 'clear' };
    else baseColor = { name: 'steel blue', family: 'blue', descriptor: 'professional' };
  }
  // Blue (215-250)
  else if (h >= 215 && h < 250) {
    if (h < 230) {
      if (l < 30) baseColor = { name: 'navy', family: 'blue', descriptor: 'classic' };
      else if (l > 70) baseColor = { name: 'periwinkle', family: 'blue', descriptor: 'soft' };
      else if (s > 60) baseColor = { name: 'royal blue', family: 'blue', descriptor: 'regal' };
      else baseColor = { name: 'blue', family: 'blue', descriptor: 'trustworthy' };
    } else {
      if (l < 30) baseColor = { name: 'midnight', family: 'blue', descriptor: 'dramatic' };
      else if (l > 70) baseColor = { name: 'lavender blue', family: 'blue', descriptor: 'dreamy' };
      else if (s > 60) baseColor = { name: 'cobalt', family: 'blue', descriptor: 'bold' };
      else baseColor = { name: 'slate blue', family: 'blue', descriptor: 'sophisticated' };
    }
  }
  // Blue-violet (250-270)
  else if (h >= 250 && h < 270) {
    if (l < 30) baseColor = { name: 'indigo', family: 'purple', descriptor: 'deep' };
    else if (l > 75) baseColor = { name: 'lavender', family: 'purple', descriptor: 'gentle' };
    else if (s > 50) baseColor = { name: 'violet', family: 'purple', descriptor: 'vivid' };
    else baseColor = { name: 'purple', family: 'purple', descriptor: 'creative' };
  }
  // Purple (270-295)
  else if (h >= 270 && h < 295) {
    if (l < 30) baseColor = { name: 'eggplant', family: 'purple', descriptor: 'rich' };
    else if (l > 75) baseColor = { name: 'lilac', family: 'purple', descriptor: 'delicate' };
    else if (s > 60) baseColor = { name: 'purple', family: 'purple', descriptor: 'royal' };
    else baseColor = { name: 'plum', family: 'purple', descriptor: 'muted' };
  }
  // Magenta (295-320)
  else if (h >= 295 && h < 320) {
    if (l < 35) baseColor = { name: 'dark magenta', family: 'magenta', descriptor: 'intense' };
    else if (l > 75) baseColor = { name: 'orchid', family: 'magenta', descriptor: 'exotic' };
    else if (s > 60) baseColor = { name: 'magenta', family: 'magenta', descriptor: 'bold' };
    else baseColor = { name: 'mauve', family: 'magenta', descriptor: 'vintage' };
  }
  // Pink (320-345)
  else {
    if (l < 40) baseColor = { name: 'maroon', family: 'red', descriptor: 'deep' };
    else if (l > 80 && s < 40) baseColor = { name: 'blush', family: 'pink', descriptor: 'subtle' };
    else if (l > 75) baseColor = { name: 'pink', family: 'pink', descriptor: 'soft' };
    else if (s > 60) baseColor = { name: 'hot pink', family: 'pink', descriptor: 'energetic' };
    else if (s > 40) baseColor = { name: 'rose', family: 'pink', descriptor: 'romantic' };
    else baseColor = { name: 'dusty rose', family: 'pink', descriptor: 'muted' };
  }

  // Combine modifier with base color
  const fullName = mod.prefix ? `${mod.prefix} ${baseColor.name}` : baseColor.name;
  
  return {
    name: fullName,
    baseName: baseColor.name,
    family: baseColor.family,
    descriptor: baseColor.descriptor,
    mood: mod.mood,
    prefix: mod.prefix
  };
};

// ============================================
// 7. DEEP COLOR ANALYSIS
// ============================================

const analyzeColorDeeply = (hex) => {
  const hsl = hexToHsl(hex);
  const oklch = hexToOklch(hex);
  const rgb = {
    r: parseInt(hex.slice(1, 3), 16),
    g: parseInt(hex.slice(3, 5), 16),
    b: parseInt(hex.slice(5, 7), 16)
  };
  
  const naming = getColorName(hsl.h, hsl.s, hsl.l, oklch.C);
  
  // Determine temperature
  let temperature;
  const h = hsl.h;
  if (hsl.s < 10) {
    temperature = 'neutral';
  } else if ((h >= 0 && h < 70) || h >= 320) {
    temperature = 'warm';
  } else if (h >= 170 && h < 280) {
    temperature = 'cool';
  } else {
    temperature = 'neutral-leaning';
  }

  // Determine visual weight
  let weight;
  if (hsl.l < 30) weight = 'heavy';
  else if (hsl.l < 50) weight = 'substantial';
  else if (hsl.l < 70) weight = 'medium';
  else if (hsl.l < 85) weight = 'light';
  else weight = 'airy';

  // Determine energy level
  let energy;
  if (hsl.s > 70 && hsl.l > 40 && hsl.l < 70) energy = 'high';
  else if (hsl.s > 50 || (hsl.l > 70 && hsl.s > 30)) energy = 'medium';
  else if (hsl.s < 20 || hsl.l < 25) energy = 'low';
  else energy = 'moderate';

  return {
    hex,
    hsl,
    oklch,
    rgb,
    naming,
    temperature,
    weight,
    energy,
    isNeutral: hsl.s < 15,
    isDark: hsl.l < 35,
    isLight: hsl.l > 70,
    isPastel: hsl.s < 50 && hsl.l > 70,
    isVivid: hsl.s > 65 && hsl.l > 35 && hsl.l < 75,
    isMuted: hsl.s < 40 && hsl.l > 25 && hsl.l < 75
  };
};

const analyzePaletteRelationships = (colorAnalyses) => {
  const relationships = [];
  
  for (let i = 0; i < colorAnalyses.length - 1; i++) {
    const c1 = colorAnalyses[i];
    const c2 = colorAnalyses[i + 1];
    
    // Calculate hue difference
    let hueDiff = Math.abs(c1.hsl.h - c2.hsl.h);
    if (hueDiff > 180) hueDiff = 360 - hueDiff;
    
    // Calculate contrast
    const contrast = wcagContrastRatio(c1.hex, c2.hex);
    
    // Determine relationship type
    let relationshipType;
    if (c1.isNeutral || c2.isNeutral) {
      relationshipType = 'neutral-chromatic';
    } else if (hueDiff < 20) {
      relationshipType = 'tonal';
    } else if (hueDiff < 45) {
      relationshipType = 'analogous';
    } else if (hueDiff > 150 && hueDiff < 210) {
      relationshipType = 'complementary';
    } else if (hueDiff > 90 && hueDiff < 150) {
      relationshipType = 'triadic-adjacent';
    } else {
      relationshipType = 'contrasting';
    }

    // Temperature transition
    let tempTransition;
    if (c1.temperature === c2.temperature) {
      tempTransition = `maintains ${c1.temperature} temperature`;
    } else {
      tempTransition = `transitions from ${c1.temperature} to ${c2.temperature}`;
    }

    relationships.push({
      from: c1,
      to: c2,
      hueDifference: hueDiff,
      contrast: contrast,
      relationshipType,
      tempTransition,
      isHighContrast: contrast >= 4.5,
      isLowContrast: contrast < 2
    });
  }
  
  return relationships;
};

const identifyPaletteRoles = (colorAnalyses) => {
  const roles = {
    dominant: null,
    accents: [],
    neutrals: [],
    backgrounds: [],
    text: []
  };
  
  // Sort by visual prominence (saturation * middle-lightness factor)
  const prominence = colorAnalyses.map((c, i) => {
    const middleness = 1 - Math.abs(c.hsl.l - 50) / 50;
    const score = c.hsl.s * middleness;
    return { color: c, score, index: i };
  }).sort((a, b) => b.score - a.score);
  
  colorAnalyses.forEach((c, i) => {
    if (c.isNeutral) {
      roles.neutrals.push({ color: c, index: i });
      if (c.hsl.l > 85) roles.backgrounds.push({ color: c, index: i });
      if (c.hsl.l < 25) roles.text.push({ color: c, index: i });
    } else if (c.hsl.l > 80) {
      roles.backgrounds.push({ color: c, index: i });
    } else if (c.hsl.l < 20) {
      roles.text.push({ color: c, index: i });
    }
  });
  
  // Most prominent chromatic color is dominant
  const dominantCandidate = prominence.find(p => !p.color.isNeutral);
  if (dominantCandidate) {
    roles.dominant = { color: dominantCandidate.color, index: dominantCandidate.index };
  }
  
  // Other chromatic colors are accents
  prominence.forEach(p => {
    if (!p.color.isNeutral && p !== dominantCandidate) {
      roles.accents.push({ color: p.color, index: p.index });
    }
  });
  
  return roles;
};

// ============================================
// 8. CONTENT TEMPLATES & VARIATION SYSTEM
// ============================================

const templates = {  
  // Opening sentence variations
  openings: {
    vibrant: [
      "This ${count}-color palette delivers bold visual impact through carefully balanced saturation levels.",
      "A striking collection of ${count} colors designed to command attention and create memorable impressions.",
      "These ${count} vibrant hues work together to produce energetic, eye-catching compositions.",
      "Built around high-saturation values, this ${count}-color scheme brings dynamic energy to any project."
    ],
    muted: [
      "This sophisticated ${count}-color palette employs restrained saturation for refined elegance.",
      "A thoughtfully desaturated collection of ${count} tones that prioritizes subtlety over boldness.",
      "These ${count} muted colors create understated harmony suitable for content-focused design.",
      "With carefully reduced chroma, this ${count}-color scheme delivers quiet sophistication."
    ],
    pastel: [
      "This gentle ${count}-color palette combines soft saturation with high luminosity for an airy aesthetic.",
      "A delicate collection of ${count} pastel tones that creates approachable, welcoming visuals.",
      "These ${count} light-touched colors balance chromatic interest with visual softness.",
      "Built on pale values, this ${count}-color scheme offers calm, non-aggressive visual presence."
    ],
    dark: [
      "This dramatic ${count}-color palette leverages deep values for substantial visual weight.",
      "A rich collection of ${count} dark tones that establishes authority and sophistication.",
      "These ${count} low-lightness colors create moody atmospheres with inherent depth.",
      "Anchored in shadow, this ${count}-color scheme provides grounding visual foundation."
    ],
    balanced: [
      "This versatile ${count}-color palette balances chromatic variety with cohesive harmony.",
      "A well-structured collection of ${count} colors offering both contrast and unity.",
      "These ${count} thoughtfully selected hues provide flexibility across diverse applications.",
      "With measured variety, this ${count}-color scheme adapts to multiple design contexts."
    ]
  },

  // Individual color descriptions
  colorDescriptions: {
    dominant: [
      "${colorName} (${hex}) serves as the palette's visual anchor, ${descriptor} character drawing the eye and establishing chromatic identity.",
      "The ${descriptor} ${colorName} at ${hex} provides the palette's primary visual weight, commanding attention as the dominant element.",
      "At ${hex}, ${colorName} functions as the palette's focal point, its ${descriptor} quality creating a clear visual hierarchy."
    ],
    accent: [
      "${colorName} (${hex}) acts as an accent tone, its ${descriptor} nature providing contrast without competing for dominance.",
      "The ${descriptor} ${colorName} at ${hex} offers supporting visual interest, complementing the dominant hue.",
      "At ${hex}, this ${colorName} contributes ${descriptor} energy as a secondary element in the composition."
    ],
    neutral: [
      "${colorName} (${hex}) provides essential breathing room, its ${descriptor} presence allowing chromatic colors to shine.",
      "The ${descriptor} ${colorName} at ${hex} offers visual rest, balancing the palette's more saturated elements.",
      "At ${hex}, ${colorName} functions as a grounding element, its ${descriptor} quality supporting overall harmony."
    ],
    background: [
      "${colorName} (${hex}) works effectively as a background tone, its ${descriptor} lightness creating spatial depth.",
      "The ${descriptor} ${colorName} at ${hex} provides excellent canvas potential for overlaid elements.",
      "At ${hex}, this ${colorName} offers ${descriptor} foundation suitable for text and graphic placement."
    ]
  },

  // Relationship descriptions
  transitions: {
    tonal: [
      "The shift from ${color1} to ${color2} creates tonal continuity, maintaining hue consistency while varying lightness.",
      "Moving between ${color1} and ${color2} produces a smooth tonal gradient within the same color family.",
      "${color1} flows naturally into ${color2}, the tonal relationship creating seamless visual connection."
    ],
    analogous: [
      "The progression from ${color1} to ${color2} follows analogous harmony, adjacent hues creating natural flow.",
      "${color1} and ${color2} share the comfortable relationship of neighboring wheel positions.",
      "Moving from ${color1} into ${color2} demonstrates analogous color theory's inherent visual comfort."
    ],
    complementary: [
      "The jump from ${color1} to ${color2} introduces complementary tension, opposite hues generating visual energy.",
      "${color1} and ${color2} create dynamic contrast through their complementary relationship.",
      "The opposition between ${color1} and ${color2} follows complementary principles for maximum chromatic contrast."
    ],
    contrasting: [
      "${color1} and ${color2} create deliberate visual contrast, their difference adding compositional interest.",
      "The distinction between ${color1} and ${color2} provides clear visual separation.",
      "Moving from ${color1} to ${color2} introduces intentional variety into the palette's flow."
    ],
    'neutral-chromatic': [
      "The pairing of ${color1} with ${color2} balances chromatic and neutral elements.",
      "${color1} alongside ${color2} demonstrates effective use of neutrals to frame color.",
      "The contrast between ${color1} and ${color2} leverages neutral space to enhance chromatic impact."
    ]
  },

  // Application contexts
  applications: {
    webUI: {
      light: [
        "The palette's light values excel in interface design, providing comfortable backgrounds for extended screen time.",
        "High luminosity supports readability, making these colors suitable for content-heavy web applications.",
        "Light backgrounds from this palette reduce eye strain during prolonged digital interaction."
      ],
      dark: [
        "These deep values support modern dark mode interfaces, reducing light emission while maintaining visual hierarchy.",
        "The palette's dark foundation provides immersive experiences for media-focused applications.",
        "Low-lightness colors here create sophisticated UI aesthetics popular in professional software."
      ],
      contrast: [
        "With ${contrastRatio}:1 maximum contrast, the palette ${contrastAssessment} WCAG accessibility guidelines.",
        "The ${contrastRatio}:1 contrast ratio between lightest and darkest values ${contrastAdvice}.",
        "Accessibility testing shows ${contrastRatio}:1 internal contrast, ${contrastRecommendation}."
      ]
    },
    branding: {
      warm: [
        "Warm tones here communicate approachability and energy, suitable for hospitality, food service, and lifestyle brands.",
        "The palette's warm character creates emotional resonance appropriate for personal and community-focused branding.",
        "These inviting warm hues support brands seeking friendly, accessible market positioning."
      ],
      cool: [
        "Cool tones establish professionalism and clarity, appropriate for technology, healthcare, and financial services.",
        "The palette's cool character projects competence and trustworthiness in corporate applications.",
        "These measured cool hues support brands requiring professional credibility."
      ],
      vibrant: [
        "High saturation creates brand recognition through chromatic distinctiveness in competitive markets.",
        "Bold color values here support attention-demanding marketing and youth-oriented positioning.",
        "The palette's vibrancy enables memorable brand presence across physical and digital touchpoints."
      ],
      muted: [
        "Restrained saturation projects sophistication appropriate for luxury, professional services, and heritage brands.",
        "Muted tones here support premium positioning where aggressive color would undermine brand values.",
        "The palette's subtlety communicates maturity and established credibility."
      ]
    },
    print: {
      vivid: [
        "High saturation requires attention during RGB-to-CMYK conversion. Request press proofs for critical applications.",
        "Vivid values may shift in print; consider Pantone matching for brand-critical color reproduction.",
        "Allow for substrate influence on saturated colors; uncoated papers will absorb more ink, reducing intensity."
      ],
      muted: [
        "Desaturated colors reproduce more predictably across printing methods and paper stocks.",
        "These muted values maintain consistency between screen preview and printed output.",
        "Lower saturation reduces registration sensitivity in multi-color process printing."
      ],
      contrast: [
        "The palette's tonal range supports clear reproduction in both color and grayscale printing scenarios.",
        "Strong value differentiation ensures readability when printed on various paper qualities.",
        "Internal contrast levels maintain hierarchy whether printed digitally or via offset methods."
      ]
    },
    interior: {
      light: [
        "High-lightness colors maximize perceived space, ideal for compact rooms and apartments.",
        "Light values reflect ambient illumination, brightening spaces with limited natural light.",
        "These airy tones create gallery-like neutrality, allowing furnishings and art to command attention."
      ],
      dark: [
        "Deep values add drama suitable for feature walls, libraries, and entertainment spaces.",
        "Dark tones create intimate atmospheres in social spaces where conversation is prioritized.",
        "These grounding colors anchor open-plan spaces when applied to architectural elements."
      ],
      warm: [
        "Warm colors compensate for north-facing orientation and create psychological comfort.",
        "These inviting tones support residential spaces prioritizing relaxation and social gathering.",
        "Warm palettes photograph well under typical interior lighting conditions."
      ],
      cool: [
        "Cool values provide visual relief in sun-drenched south-facing spaces.",
        "These calming tones suit bedrooms, bathrooms, and spaces dedicated to rest or focus.",
        "Cool colors support professional environments where measured atmosphere is appropriate."
      ]
    }
  },

  // Technical accuracy statements
  technical: {
    harmony: {
      monochromatic: "The palette follows monochromatic harmony, deriving all colors from variations of a single hue at ${baseHue}° on the color wheel.",
      analogous: "Analogous harmony structures the palette, with hues spanning ${hueRange}° of adjacent color wheel territory.",
      complementary: "Complementary opposition drives the palette's energy, with hues separated by approximately ${hueSeparation}° across the wheel.",
      triadic: "Triadic structure distributes hues across three color wheel regions, creating balanced chromatic variety.",
      'split-complementary': "Split-complementary relationships provide contrast with less tension than direct opposition.",
      custom: "The palette follows a custom color relationship tailored to specific aesthetic requirements."
    },
    temperature: {
      warm: "Color temperature leans warm, with ${warmPercent}% of palette hues falling in the red-orange-yellow spectrum.",
      cool: "Color temperature trends cool, with ${coolPercent}% of palette colors in the blue-cyan-green range.",
      balanced: "Color temperature balances between warm and cool, providing thermal neutrality.",
      mixed: "Mixed temperature creates dynamic contrast between warm and cool elements."
    },
    saturation: {
      high: "Average saturation of ${avgSat}% places the palette in high-chroma territory, maximizing color intensity.",
      medium: "Moderate ${avgSat}% average saturation balances chromatic interest with visual comfort.",
      low: "With ${avgSat}% average saturation, the palette prioritizes subtlety over chromatic intensity."
    },
    lightness: {
      light: "Averaging ${avgLight}% lightness, the palette occupies the high-value end of the tonal spectrum.",
      dark: "At ${avgLight}% average lightness, the palette establishes deep, grounding visual presence.",
      balanced: "The ${avgLight}% average lightness positions the palette in the middle tonal range.",
      varied: "Lightness values spanning ${lightRange}% provide strong internal contrast."
    }
  }
};

// ============================================
// 9. CONTENT GENERATION ENGINE
// ============================================

const generateColorSection = (colorAnalysis, role, position, totalColors, rng) => {
  const { naming, hex, hsl, temperature, weight, energy } = colorAnalysis;
  
  // Position-aware descriptors
  const positionDescriptors = {
    first: ['opens', 'begins', 'leads', 'anchors the start of'],
    last: ['concludes', 'closes', 'completes', 'anchors the end of'],
    middle: ['continues', 'bridges', 'extends', 'develops']
  };
  
  const positionType = position === 0 ? 'first' : 
                       position === totalColors - 1 ? 'last' : 'middle';
  const positionVerb = pickFromArray(positionDescriptors[positionType], rng);
  
  // Role-specific templates with position awareness
  const roleTemplates = {
    dominant: [
      `Position ${position + 1}: ${naming.name} (${hex}) serves as the palette's visual anchor. This ${naming.descriptor} ${naming.family} tone ${positionVerb} the sequence with ${weight} visual weight and ${energy} energy. At HSL(${Math.round(hsl.h)}°, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%), it establishes the palette's ${temperature} character.`,
      `Position ${position + 1}: The ${naming.descriptor} ${naming.name} at ${hex} functions as the dominant color, its ${temperature} presence commanding attention. With ${Math.round(hsl.s)}% saturation and ${Math.round(hsl.l)}% lightness, this ${naming.family} provides the primary chromatic identity.`,
      `Position ${position + 1}: ${naming.name} (${hex}) anchors the composition as the dominant hue. This ${naming.descriptor} shade carries ${weight} visual weight, its ${naming.family} character ${positionVerb} the palette with ${energy} energy and ${temperature} temperature.`
    ],
    accent: [
      `Position ${position + 1}: ${naming.name} (${hex}) contributes as an accent tone, its ${naming.descriptor} quality adding chromatic interest without overwhelming. This ${temperature} ${naming.family} at ${Math.round(hsl.s)}% saturation ${positionVerb} the palette with ${energy} energy.`,
      `Position ${position + 1}: The ${naming.descriptor} ${naming.name} at ${hex} provides supporting visual interest. At HSL(${Math.round(hsl.h)}°, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%), this ${naming.family} accent ${positionVerb} the sequence with ${weight} presence.`,
      `Position ${position + 1}: ${naming.name} (${hex}) functions as an accent element, ${positionVerb} the palette with its ${naming.descriptor} ${naming.family} character. The ${temperature} tone carries ${energy} energy at ${Math.round(hsl.l)}% lightness.`
    ],
    neutral: [
      `Position ${position + 1}: ${naming.name} (${hex}) provides essential neutral balance. This ${naming.descriptor} tone ${positionVerb} the palette with visual breathing room, its ${Math.round(hsl.s)}% saturation allowing chromatic colors to resonate without competition.`,
      `Position ${position + 1}: The ${naming.descriptor} ${naming.name} at ${hex} serves as a grounding neutral element. At ${Math.round(hsl.l)}% lightness, it ${positionVerb} the sequence with ${weight} but unobtrusive presence.`,
      `Position ${position + 1}: ${naming.name} (${hex}) functions as neutral infrastructure, its ${naming.descriptor} character ${positionVerb} the palette while supporting more saturated companions.`
    ],
    background: [
      `Position ${position + 1}: ${naming.name} (${hex}) offers excellent background potential. This ${naming.descriptor} ${naming.family} at ${Math.round(hsl.l)}% lightness ${positionVerb} the palette with ${weight} foundation suitable for text and graphic overlay.`,
      `Position ${position + 1}: The ${naming.descriptor} ${naming.name} at ${hex} provides canvas-ready lightness. At HSL(${Math.round(hsl.h)}°, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%), it ${positionVerb} the sequence with spatial depth.`,
      `Position ${position + 1}: ${naming.name} (${hex}) serves as a background-capable tone, its ${naming.descriptor} ${Math.round(hsl.l)}% lightness ${positionVerb} the palette with airy foundation.`
    ],
    dark: [
      `Position ${position + 1}: ${naming.name} (${hex}) provides deep anchor weight. This ${naming.descriptor} ${naming.family} at ${Math.round(hsl.l)}% lightness ${positionVerb} the palette with ${weight} presence suitable for text or grounding elements.`,
      `Position ${position + 1}: The ${naming.descriptor} ${naming.name} at ${hex} contributes substantial darkness. At HSL(${Math.round(hsl.h)}°, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%), it ${positionVerb} the sequence with dramatic depth.`,
      `Position ${position + 1}: ${naming.name} (${hex}) anchors with ${weight} darkness, its ${naming.descriptor} ${naming.family} character ${positionVerb} the palette with grounding intensity.`
    ]
  };

  // Select appropriate role
  let effectiveRole = role;
  if (colorAnalysis.isNeutral) {
    effectiveRole = 'neutral';
  } else if (colorAnalysis.hsl.l > 80) {
    effectiveRole = 'background';
  } else if (colorAnalysis.hsl.l < 25) {
    effectiveRole = 'dark';
  }
  
  const templates = roleTemplates[effectiveRole] || roleTemplates.accent;
  return pickFromArray(templates, rng);
};

const generateTransitionSection = (relationship, index, rng) => {
  const { from, to, contrast, relationshipType, hueDifference } = relationship;
  
  const transitionTemplates = {
    tonal: [
      `Transition ${index + 1}-${index + 2}: The shift from ${from.naming.name} to ${to.naming.name} (${contrast.toFixed(2)}:1 contrast) creates tonal continuity within the ${from.naming.family} family, varying lightness while maintaining hue consistency across ${Math.round(hueDifference)}° of separation.`,
      `Transition ${index + 1}-${index + 2}: Moving from ${from.naming.name} (${from.hex}) to ${to.naming.name} (${to.hex}) produces smooth tonal progression. The ${contrast.toFixed(2)}:1 contrast ratio maintains readability while the ${Math.round(hueDifference)}° hue shift preserves family cohesion.`,
      `Transition ${index + 1}-${index + 2}: ${from.naming.name} flows into ${to.naming.name} with ${contrast.toFixed(2)}:1 contrast, the tonal relationship creating seamless ${from.naming.family}-to-${to.naming.family} connection.`
    ],
    analogous: [
      `Transition ${index + 1}-${index + 2}: The progression from ${from.naming.name} to ${to.naming.name} follows analogous harmony across ${Math.round(hueDifference)}° of hue rotation. At ${contrast.toFixed(2)}:1 contrast, adjacent wheel positions create natural visual flow.`,
      `Transition ${index + 1}-${index + 2}: ${from.naming.name} (${from.hex}) and ${to.naming.name} (${to.hex}) share analogous relationship, their ${Math.round(hueDifference)}° separation producing comfortable chromatic transition with ${contrast.toFixed(2)}:1 contrast.`,
      `Transition ${index + 1}-${index + 2}: Moving from ${from.naming.family} into ${to.naming.family} demonstrates analogous color theory, the ${Math.round(hueDifference)}° shift maintaining visual comfort at ${contrast.toFixed(2)}:1 contrast.`
    ],
    complementary: [
      `Transition ${index + 1}-${index + 2}: The jump from ${from.naming.name} to ${to.naming.name} introduces complementary tension across ${Math.round(hueDifference)}° of wheel opposition. The ${contrast.toFixed(2)}:1 contrast ratio amplifies this chromatic energy.`,
      `Transition ${index + 1}-${index + 2}: ${from.naming.name} (${from.hex}) and ${to.naming.name} (${to.hex}) create dynamic complementary contrast, their ${Math.round(hueDifference)}° separation generating ${contrast.toFixed(2)}:1 visual tension.`,
      `Transition ${index + 1}-${index + 2}: The opposition between ${from.naming.family} and ${to.naming.family} follows complementary principles, ${Math.round(hueDifference)}° of hue distance producing ${contrast.toFixed(2)}:1 maximum chromatic contrast.`
    ],
    contrasting: [
      `Transition ${index + 1}-${index + 2}: ${from.naming.name} and ${to.naming.name} create deliberate visual contrast at ${contrast.toFixed(2)}:1, their ${Math.round(hueDifference)}° hue difference adding compositional interest.`,
      `Transition ${index + 1}-${index + 2}: The distinction between ${from.naming.name} (${from.hex}) and ${to.naming.name} (${to.hex}) provides ${contrast.toFixed(2)}:1 separation across ${Math.round(hueDifference)}° of hue space.`,
      `Transition ${index + 1}-${index + 2}: Moving from ${from.naming.family} to ${to.naming.family} introduces ${Math.round(hueDifference)}° of intentional variety with ${contrast.toFixed(2)}:1 contrast supporting visual hierarchy.`
    ],
    'neutral-chromatic': [
      `Transition ${index + 1}-${index + 2}: The pairing of ${from.naming.name} with ${to.naming.name} balances ${from.isNeutral ? 'neutral' : 'chromatic'} and ${to.isNeutral ? 'neutral' : 'chromatic'} elements at ${contrast.toFixed(2)}:1 contrast.`,
      `Transition ${index + 1}-${index + 2}: ${from.naming.name} (${from.hex}) alongside ${to.naming.name} (${to.hex}) demonstrates effective neutral-chromatic framing with ${contrast.toFixed(2)}:1 separation.`,
      `Transition ${index + 1}-${index + 2}: The ${contrast.toFixed(2)}:1 contrast between ${from.naming.name} and ${to.naming.name} leverages neutral space to enhance chromatic impact.`
    ],
    'triadic-adjacent': [
      `Transition ${index + 1}-${index + 2}: ${from.naming.name} to ${to.naming.name} spans ${Math.round(hueDifference)}° suggesting triadic relationship. The ${contrast.toFixed(2)}:1 contrast maintains balance across this structural color jump.`,
      `Transition ${index + 1}-${index + 2}: The ${Math.round(hueDifference)}° separation between ${from.naming.name} (${from.hex}) and ${to.naming.name} (${to.hex}) reflects triadic harmony principles at ${contrast.toFixed(2)}:1 contrast.`,
      `Transition ${index + 1}-${index + 2}: Moving from ${from.naming.family} to ${to.naming.family} across ${Math.round(hueDifference)}° creates triadic-adjacent relationship with ${contrast.toFixed(2)}:1 visual distinction.`
    ]
  };

  const templates = transitionTemplates[relationshipType] || transitionTemplates.contrasting;
  return pickFromArray(templates, rng);
};

// Small palettes need different handling
const generateSmallPaletteNarrative = (colorAnalyses, relationships, roles, rng) => {
  const count = colorAnalyses.length;
  
  if (count === 2) {
    const c1 = colorAnalyses[0];
    const c2 = colorAnalyses[1];
    const rel = relationships[0];
    
    const twoColorTemplates = [
      `This minimalist two-color palette pairs ${c1.naming.name} (${c1.hex}) with ${c2.naming.name} (${c2.hex}). The ${rel.relationshipType} relationship creates ${rel.contrast.toFixed(2)}:1 contrast, ${rel.isHighContrast ? 'sufficient for text applications' : 'suitable for decorative use'}. ${c1.naming.name} brings ${c1.naming.descriptor} ${c1.temperature} energy while ${c2.naming.name} contributes ${c2.naming.descriptor} ${c2.temperature} balance.`,
      `Two colors in ${rel.relationshipType} harmony: ${c1.naming.name} (${c1.hex}) and ${c2.naming.name} (${c2.hex}) achieve ${rel.contrast.toFixed(2)}:1 contrast across ${Math.round(rel.hueDifference)}° of hue separation. The ${c1.naming.family}-${c2.naming.family} combination balances ${c1.weight} and ${c2.weight} visual weights.`,
      `This focused duo combines ${c1.naming.descriptor} ${c1.naming.name} with ${c2.naming.descriptor} ${c2.naming.name}. At ${c1.hex} and ${c2.hex} respectively, they produce ${rel.contrast.toFixed(2)}:1 contrast through ${rel.relationshipType} color relationship.`
    ];
    
    return pickFromArray(twoColorTemplates, rng);
  }
  
  if (count === 3) {
    const [c1, c2, c3] = colorAnalyses;
    
    const threeColorTemplates = [
      `This triad palette balances ${c1.naming.name} (${c1.hex}), ${c2.naming.name} (${c2.hex}), and ${c3.naming.name} (${c3.hex}). The three-color structure provides ${roles.dominant ? `${roles.dominant.color.naming.name} as focal point` : 'balanced visual weight'} with supporting tones for compositional flexibility.`,
      `Three colors in harmony: ${c1.naming.descriptor} ${c1.naming.name} opens, ${c2.naming.descriptor} ${c2.naming.name} bridges, and ${c3.naming.descriptor} ${c3.naming.name} closes the sequence. This ${c1.naming.family}-${c2.naming.family}-${c3.naming.family} combination spans ${c1.temperature} to ${c3.temperature} temperature.`,
      `The palette's three elements, ${c1.naming.name}, ${c2.naming.name}, and ${c3.naming.name}, create complete yet focused color story. Each contributes distinct character: ${c1.naming.descriptor} opening, ${c2.naming.descriptor} middle, ${c3.naming.descriptor} conclusion.`
    ];
    
    return pickFromArray(threeColorTemplates, rng);
  }
  
  return null; // Use standard generation for 4+ colors
};

const generateApplicationSection = (context, subContext, data, rng) => {
  const contextTemplates = templates.applications[context]?.[subContext];
  if (!contextTemplates) return null;
  
  let text = pickFromArray(contextTemplates, rng);
  
  Object.entries(data).forEach(([key, value]) => {
    text = text.replace(new RegExp(`\\$\\{${key}\\}`, 'g'), value);
  });
  
  return text;
};

const generateTechnicalSection = (category, type, data, rng) => {
  let template = templates.technical[category]?.[type];
  if (!template) return null;
  
  Object.entries(data).forEach(([key, value]) => {
    template = template.replace(new RegExp(`\\$\\{${key}\\}`, 'g'), value);
  });
  
  return template;
};

// ============================================
// 10. MAIN SEO GENERATOR
// ============================================

export const generateRichSEO = (colors, mode = 'auto', mood = 'any') => {
  if (!colors || colors.length === 0) {
    return { title: "", meta: "", content: "", keywords: [], traits: null };
  }

  // Create deterministic RNG from colors
  const seed = hashString(colors.join(''));
  const rng = createSeededRandom(seed);
  
  // Deep analysis of each color
  const colorAnalyses = colors.map(hex => analyzeColorDeeply(hex));
  
  // Analyze relationships between adjacent colors
  const relationships = analyzePaletteRelationships(colorAnalyses);
  
  // Identify roles within the palette
  const roles = identifyPaletteRoles(colorAnalyses);
  
  // Calculate overall palette statistics
  const avgSaturation = colorAnalyses.reduce((sum, c) => sum + c.hsl.s, 0) / colorAnalyses.length;
  const avgLightness = colorAnalyses.reduce((sum, c) => sum + c.hsl.l, 0) / colorAnalyses.length;
  const lightnesses = colorAnalyses.map(c => c.hsl.l);
  const lightnessRange = Math.max(...lightnesses) - Math.min(...lightnesses);
  
  // Find extremes for contrast calculation
  const sortedByLuminance = [...colorAnalyses].sort((a, b) => a.hsl.l - b.hsl.l);
  const darkest = sortedByLuminance[0];
  const lightest = sortedByLuminance[sortedByLuminance.length - 1];
  const maxContrast = wcagContrastRatio(darkest.hex, lightest.hex);
  
  // Determine dominant hue family
  const chromatic = colorAnalyses.filter(c => !c.isNeutral);
  const hueFamilies = chromatic.map(c => c.naming.family);
  const familyCounts = {};
  hueFamilies.forEach(f => { familyCounts[f] = (familyCounts[f] || 0) + 1; });
  const dominantFamily = Object.entries(familyCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'neutral';
  
  // Temperature analysis
  const warmCount = colorAnalyses.filter(c => c.temperature === 'warm').length;
  const coolCount = colorAnalyses.filter(c => c.temperature === 'cool').length;
  const temperatureType = warmCount > coolCount * 1.5 ? 'warm' : 
                          coolCount > warmCount * 1.5 ? 'cool' : 'balanced';
  
  // Determine harmony type from actual hue distribution
  const hues = chromatic.map(c => c.hsl.h);
  let harmonyType = 'custom';
  if (hues.length >= 2) {
    const hueSpread = Math.max(...hues) - Math.min(...hues);
    const adjustedSpread = hueSpread > 180 ? 360 - hueSpread : hueSpread;
    
    if (adjustedSpread < 30) harmonyType = 'monochromatic';
    else if (adjustedSpread < 60) harmonyType = 'analogous';
    else if (adjustedSpread > 150 && adjustedSpread < 200) harmonyType = 'complementary';
    else if (adjustedSpread > 100 && adjustedSpread < 140) harmonyType = 'triadic';
    else if (adjustedSpread > 120 && adjustedSpread < 160) harmonyType = 'split-complementary';
  }

  // Character classification
  const character = avgSaturation > 60 ? 'vibrant' :
                    avgSaturation < 30 ? 'muted' :
                    avgLightness > 70 && avgSaturation < 50 ? 'pastel' :
                    avgLightness < 35 ? 'dark' : 'balanced';

  // === GENERATE TITLE ===
  const dominantColorName = roles.dominant?.color.naming.name || colorAnalyses[0].naming.name;
  const titleTemplates = [
    `${colors.length}-Color ${capitalize(dominantFamily)} Palette: ${capitalize(character)} ${capitalize(harmonyType)} Scheme`,
    `${capitalize(dominantColorName)} Color Palette with ${colors.length} ${capitalize(character)} Tones`,
    `${capitalize(character)} ${capitalize(dominantFamily)} Color Scheme: ${colors.length} Coordinated Hues`,
    `${colors.length} ${capitalize(character)} ${capitalize(dominantFamily)} Colors in ${capitalize(harmonyType)} Harmony`
  ];
  const title = pickFromArray(titleTemplates, rng);

  // === GENERATE META DESCRIPTION ===
  const hexList = colors.slice(0, 3).map(c => c.replace('#', '')).join(', ');
  const metaTemplates = [
    `A ${character} ${colors.length}-color ${dominantFamily} palette featuring ${hexList} and more. ${capitalize(harmonyType)} harmony with ${maxContrast.toFixed(1)}:1 contrast ratio for web design, branding, and UI projects.`,
    `${capitalize(harmonyType)} ${dominantFamily} color scheme with ${colors.length} ${character} tones including ${hexList}. Export to HEX, RGB, HSL for design projects with ${maxContrast.toFixed(1)}:1 accessibility contrast.`,
    `Curated ${dominantFamily} palette: ${colors.length} ${character} colors (${hexList}) in ${harmonyType} harmony. Professional color scheme with ${temperatureType} temperature and ${maxContrast.toFixed(1)}:1 contrast.`
  ];
  const meta = pickFromArray(metaTemplates, rng);

  // === GENERATE MAIN CONTENT ===
  const contentSections = [];

  // 1. Opening paragraph
  const openingTemplate = pickFromArray(templates.openings[character] || templates.openings.balanced, rng);
  const opening = openingTemplate.replace(/\${count}/g, colors.length);
  contentSections.push(`Overview: ${opening}`);

  // 2. Palette narrative (special handling for 2-3 colors)
  const smallPaletteNarrative = generateSmallPaletteNarrative(colorAnalyses, relationships, roles, rng);
  if (smallPaletteNarrative) {
    contentSections.push(`Palette Composition: ${smallPaletteNarrative}`);
  }

  // 3. Color-by-color analysis (EXPLICIT for every color)
  const colorDescriptions = colorAnalyses.map((analysis, index) => {
    // Determine role for this specific color
    let role = 'accent';
    if (roles.dominant?.index === index) {
      role = 'dominant';
    } else if (roles.neutrals.some(n => n.index === index)) {
      role = 'neutral';
    } else if (roles.backgrounds.some(b => b.index === index)) {
      role = 'background';
    } else if (roles.text.some(t => t.index === index)) {
      role = 'dark';
    }
    
    return generateColorSection(analysis, role, index, colorAnalyses.length, rng);
  });
  
  contentSections.push(`Individual Color Analysis: ${colorDescriptions.join(' ')}`);

  // 4. Color relationships / flow (for 3+ colors)
  if (relationships.length > 0 && colorAnalyses.length >= 3) {
    const flowDescriptions = relationships.map((rel, idx) => 
      generateTransitionSection(rel, idx, rng)
    );
    contentSections.push(`Color Transitions: ${flowDescriptions.join(' ')}`);
  }

  // 5. Pairwise contrast matrix for larger palettes (5+ colors)
  if (colorAnalyses.length >= 5) {
    const contrastPairs = [];
    for (let i = 0; i < colorAnalyses.length; i++) {
      for (let j = i + 1; j < colorAnalyses.length; j++) {
        const c1 = colorAnalyses[i];
        const c2 = colorAnalyses[j];
        const ratio = wcagContrastRatio(c1.hex, c2.hex);
        if (ratio >= 4.5) {
          contrastPairs.push(`${c1.naming.name}/${c2.naming.name} (${ratio.toFixed(1)}:1)`);
        }
      }
    }
    
    if (contrastPairs.length > 0) {
      contentSections.push(`High-Contrast Pairings: The following color combinations achieve WCAG AA contrast (4.5:1+): ${contrastPairs.slice(0, 8).join(', ')}. These pairings support accessible text placement and clear visual hierarchy.`);
    } else {
      contentSections.push(`Contrast Note: No internal color pairings achieve WCAG AA contrast (4.5:1). Consider supplementing with pure black (#000000) or white (#FFFFFF) for text applications.`);
    }
  }

  // 6. Accessibility summary
  const a11yLevel = maxContrast >= 7 ? 'AAA' : maxContrast >= 4.5 ? 'AA' : maxContrast >= 3 ? 'AA-large' : 'decorative';
  const a11ySummary = `Accessibility: The palette achieves ${maxContrast.toFixed(2)}:1 maximum internal contrast between ${darkest.naming.name} (${darkest.hex}) and ${lightest.naming.name} (${lightest.hex}). This ${a11yLevel === 'decorative' ? 'limits text applications without supplementary colors' : `supports WCAG 2.1 Level ${a11yLevel} compliance for ${a11yLevel === 'AA-large' ? 'large text (18pt+)' : 'standard body text'}`}. ${colorAnalyses.filter(c => c.naming.family === 'red' || c.naming.family === 'green').length > 1 ? 'Note: Red-green combinations present should be validated with color blindness simulation.' : 'The palette avoids problematic red-green combinations.'}`;
  contentSections.push(a11ySummary);

  // 7. Color values reference
  const colorValues = colorAnalyses.map(c => 
    `${c.naming.name} (${c.hex}): RGB(${c.rgb.r}, ${c.rgb.g}, ${c.rgb.b}), HSL(${Math.round(c.hsl.h)}°, ${Math.round(c.hsl.s)}%, ${Math.round(c.hsl.l)}%), OKLCH(${(c.oklch.L * 100).toFixed(1)}%, ${c.oklch.C.toFixed(3)}, ${Math.round(c.oklch.h)}°)`
  ).join('. ');
  contentSections.push(`Color Values Reference: ${colorValues}.`);

  // 8. Export formats note
  contentSections.push(`Export Formats: This palette exports to HEX, RGB, HSL, OKLCH, and CMYK formats. CSS custom properties, Tailwind configuration, SCSS variables, and design token JSON support systematic implementation across development workflows.`);

  // === GENERATE KEYWORDS ===
  const keywords = [
    `${dominantFamily} color palette`,
    `${colors.length} color palette`,
    `${character} color scheme`,
    `${harmonyType} colors`,
    `${temperatureType} palette`,
    `${dominantColorName} palette`,
    `${dominantFamily} hex codes`,
    `${character} ${dominantFamily}`,
    `${dominantFamily} color combinations`,
    `${dominantFamily} design colors`,
    `${colors.length} color scheme`,
    `${harmonyType} harmony palette`,
    ...colorAnalyses.slice(0, 3).map(c => `${c.naming.name} color`),
    ...colorAnalyses.slice(0, 3).map(c => c.hex.toLowerCase())
  ];

  return {
    title,
    meta,
    content: contentSections.join('\n\n'),
    keywords: [...new Set(keywords)], // Remove duplicates
    traits: {
      harmony: harmonyType,
      temperature: temperatureType,
      saturation: character === 'vibrant' ? 'vibrant' : character === 'muted' ? 'muted' : 'moderate',
      lightness: avgLightness > 65 ? 'light' : avgLightness < 35 ? 'dark' : 'balanced',
      character,
      primaryHue: dominantFamily,
      dominantColor: dominantColorName,
      contrastRatio: maxContrast.toFixed(2),
      accessibilityLevel: a11yLevel,
      colorCount: colors.length,
      neutralCount: colorAnalyses.filter(c => c.isNeutral).length,
      warmCount,
      coolCount
    },
    // Expose detailed analysis for potential UI use
    analysis: {
      colors: colorAnalyses,
      relationships,
      roles
    }
  };
};

// Capitalize helper
const capitalize = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1) : '';