// src/utils/colorUtils.js

// ============================================
// 1. COLOR SPACE CONVERSION UTILITIES
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

const clamp = (x, min, max) => Math.max(min, Math.min(max, x));

const randn = (rng) => {
  // Box-Muller transform
  let u = 0;
  let v = 0;
  while (u === 0) u = rng();
  while (v === 0) v = rng();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
};

const jitterWeights = (weights, rng, sigma = 0.16) => {
  // log-normal jitter, preserves positivity, feels "alive" but not chaotic
  const out = {};
  for (const k of Object.keys(weights)) {
    const w = weights[k];
    if (w <= 0) {
      out[k] = 0;
      continue;
    }
    out[k] = w * Math.exp(randn(rng) * sigma);
  }
  return out;
};

const normalizeWeights = (weights) => {
  let sum = 0;
  for (const k of Object.keys(weights)) sum += weights[k];
  if (sum <= 0) return weights;

  const out = {};
  for (const k of Object.keys(weights)) out[k] = weights[k] / sum;
  return out;
};

const weightedPick = (weights, rng) => {
  // assumes weights are non-negative, normalization not required
  let total = 0;
  const keys = Object.keys(weights);
  for (const k of keys) total += weights[k];
  if (total <= 0) return keys[keys.length - 1];

  let r = rng() * total;
  for (const k of keys) {
    r -= weights[k];
    if (r <= 0) return k;
  }
  return keys[keys.length - 1];
};

const circularHueDiff = (a, b) => {
  let d = Math.abs(a - b);
  if (d > 180) d = 360 - d;
  return d;
};

const getLockedStats = (lockedColors) => {
  const oklchs = lockedColors.map(hexToOklch);
  const Ls = oklchs.map(c => c.L);
  const Cs = oklchs.map(c => c.C);
  const Hs = oklchs.map(c => c.h);

  const avgL = Ls.reduce((s, v) => s + v, 0) / Ls.length;
  const avgC = Cs.reduce((s, v) => s + v, 0) / Cs.length;

  let maxHueSpread = 0;
  for (let i = 0; i < Hs.length; i++) {
    for (let j = i + 1; j < Hs.length; j++) {
      maxHueSpread = Math.max(maxHueSpread, circularHueDiff(Hs[i], Hs[j]));
    }
  }

  return {
    count: lockedColors.length,
    avgL,
    avgC,
    hues: Hs,
    maxHueSpread,
  };
};

const inferMoodWeightsFromLocked = (lockedStats) => {
  const { avgL, avgC } = lockedStats;

  // Simple, tasteful mapping:
  // - high L + low C => pastel
  // - low L => dark
  // - high C => vibrant
  // - otherwise muted/light/any mix
  const pastel = avgL > 0.74 && avgC < 0.12;
  const dark = avgL < 0.42;
  const vibrant = avgC > 0.15;
  const light = avgL > 0.72 && avgC >= 0.12;

  if (pastel) {
    return { pastel: 0.72, muted: 0.14, light: 0.10, any: 0.04 };
  }
  if (dark) {
    return { dark: 0.72, muted: 0.16, vibrant: 0.08, any: 0.04 };
  }
  if (vibrant) {
    return { vibrant: 0.68, muted: 0.16, dark: 0.08, any: 0.08 };
  }
  if (light) {
    return { light: 0.62, pastel: 0.18, muted: 0.12, any: 0.08 };
  }
  return { muted: 0.50, vibrant: 0.18, pastel: 0.16, light: 0.10, any: 0.06 };
};

const buildHarmonyWeights = ({ count, hasLockedColors, lockedStats }) => {
  // Base priors, then modulate.
  // Values are intentionally not normalized; we normalize later.
  let w = {
    analogous: 0.90,
    splitComplementary: 0.65,
    complementary: 0.55,
    triadic: 0.35,
    mono: 0.45,
    tetradic: 0.18,
  };

  // Respect palette size
  if (count <= 2) {
    w = { complementary: 0.95, mono: 0.70, analogous: 0.55 };
  } else if (count === 3) {
    w.tetradic = 0;
    w.triadic *= 1.25;
    w.splitComplementary *= 1.10;
    w.mono *= 0.90;
  } else if (count === 4) {
    w.tetradic *= 1.15;
  } else if (count >= 6) {
    // Big palettes get noisy fast; push toward cohesive schemes
    w.analogous *= 1.20;
    w.mono *= 1.10;
    w.tetradic *= 0.65;
    w.triadic *= 0.85;
  }

  // Disable tetradic if it cannot express itself
  if (count < 4) w.tetradic = 0;

  // Locked color conditioning
  if (hasLockedColors && lockedStats) {
    const vivid = clamp((lockedStats.avgC - 0.07) / 0.14, 0, 1);
    const extremeL = clamp((Math.abs(lockedStats.avgL - 0.5) - 0.22) / 0.28, 0, 1);

    // Vivid locked colors clash more with far-apart harmonies
    w.analogous *= 1 + 0.65 * vivid;
    w.splitComplementary *= 1 + 0.25 * vivid;
    w.complementary *= 1 - 0.55 * vivid;
    w.triadic *= 1 - 0.60 * vivid;
    w.tetradic *= 1 - 0.70 * vivid;

    // Very dark or very light locked colors prefer smaller hue moves
    w.analogous *= 1 + 0.30 * extremeL;
    w.mono *= 1 + 0.25 * extremeL;
    w.complementary *= 1 - 0.25 * extremeL;
    w.triadic *= 1 - 0.25 * extremeL;

    // If multiple locks exist, use hue spread to steer harmony
    if (lockedStats.count >= 2) {
      const spread = lockedStats.maxHueSpread;

      if (spread < 45) {
        w.analogous *= 1.55;
        w.mono *= 1.25;
        w.complementary *= 0.55;
        w.splitComplementary *= 0.75;
        w.triadic *= 0.55;
        w.tetradic *= 0.45;
      } else if (spread > 140) {
        w.complementary *= 1.35;
        w.splitComplementary *= 1.20;
        w.analogous *= 0.75;
        w.mono *= 0.70;
        w.triadic *= 0.85;
      } else {
        w.splitComplementary *= 1.25;
        w.triadic *= 1.10;
        w.analogous *= 0.90;
        w.mono *= 0.90;
      }
    }
  }

  return normalizeWeights(w);
};

const applyStickiness = (weights, preferredKey, stickiness = 0.55) => {
  // If preferredKey exists, bias it without forcing it.
  if (!preferredKey || !weights[preferredKey]) return weights;

  const out = { ...weights };
  out[preferredKey] = out[preferredKey] * (1 + stickiness);
  return normalizeWeights(out);
};


// ============================================
// 2. GAMUT-AWARE CHROMA UTILITIES
// ============================================

const maxChromaCache = new Map();
const MAX_CHROMA_CACHE_SIZE = 5000;

const findMaxChroma = (L, h, precision = 0.001) => {
  const quantizedL = Math.round(L * 1000) / 1000;
  let quantizedH = Math.round(h) % 360;
  if (quantizedH < 0) quantizedH += 360;
  
  const cacheKey = `${quantizedL}-${quantizedH}`;
  
  if (maxChromaCache.has(cacheKey)) {
    return maxChromaCache.get(cacheKey);
  }
  
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
  
  if (maxChromaCache.size >= MAX_CHROMA_CACHE_SIZE) {
    const keysToDelete = Array.from(maxChromaCache.keys()).slice(0, MAX_CHROMA_CACHE_SIZE / 2);
    keysToDelete.forEach(key => maxChromaCache.delete(key));
  }
  
  maxChromaCache.set(cacheKey, lo);
  return lo;
};

// ============================================
// 3. VIBRANCY & HARMONY LOGIC
// ============================================

const getHueAdjustments = (h) => {
  const hue = ((h % 360) + 360) % 360;
  
  if (hue >= 80 && hue <= 115) {
    return { minL: 0.55, maxL: 0.92, chromaBoost: 1.0 };
  } else if (hue >= 55 && hue < 80) {
    return { minL: 0.65, maxL: 0.95, chromaBoost: 1.1 };
  } else if (hue >= 200 && hue <= 270) {
    return { minL: 0.25, maxL: 0.75, chromaBoost: 1.0 };
  } else if (hue >= 150 && hue < 200) {
    return { minL: 0.35, maxL: 0.80, chromaBoost: 0.85 };
  } else if (hue >= 0 && hue < 30 || hue >= 330) {
    return { minL: 0.30, maxL: 0.75, chromaBoost: 1.0 };
  } else if (hue >= 270 && hue < 330) {
    return { minL: 0.35, maxL: 0.85, chromaBoost: 1.05 };
  }
  
  return { minL: 0.35, maxL: 0.85, chromaBoost: 1.0 };
};

const adjustForVibrancyOklch = (L, C, h) => {
  const hueAdj = getHueAdjustments(h);
  
  let newL = Math.max(hueAdj.minL, Math.min(hueAdj.maxL, L));
  const maxC = findMaxChroma(newL, h);
  
  let targetC = C * hueAdj.chromaBoost;
  let newC = Math.min(targetC, maxC * 0.96);
  
  if (C > 0.01) {
    newC = Math.max(newC, 0.015);
  }
  
  if (h > 230 && h < 280 && newL > 0.78) {
    newL = 0.78;
    newC = Math.min(newC, findMaxChroma(newL, h) * 0.9);
  }
  
  if (h > 70 && h < 110 && newL < 0.55) {
    newL = 0.55;
    newC = Math.min(newC, findMaxChroma(newL, h) * 0.9);
  }
  
  if (h > 170 && h < 200) {
    newC = Math.min(newC, maxC * 0.85);
  }
  
  return { L: newL, C: newC, h };
};

const generateHarmoniousHues = (mode, count, constraints, rng) => {
  let base;
  const lockedHues = [];

  // Extract hues from locked colors if present
  if (constraints.lockedColors && constraints.lockedColors.length > 0) {
    constraints.lockedColors.forEach(hex => {
      lockedHues.push(hexToOklch(hex).h);
    });
    base = lockedHues[0];
  } else if (constraints && typeof constraints.baseHue === 'number') {
    base = constraints.baseHue;
  } else {
    const goldenHues = [15, 35, 55, 145, 210, 265, 320];
    if (rng() < 0.25) {
      base = goldenHues[Math.floor(rng() * goldenHues.length)] + random(-20, 20, rng);
    } else {
      base = random(0, 360, rng);
    }
  }

  const hues = [];
  const jitter = (amount = 15) => random(-amount, amount, rng);
  
// Replace the avoidDeadZones function in generateHarmoniousHues
  const avoidDeadZones = (hue) => {
    const normalized = ((hue % 360) + 360) % 360;
    
    // Muddy yellow-green zone (65-85) - push to cleaner yellow or green
    if (normalized > 62 && normalized < 88) {
      return normalized < 75 ? 58 : 92;
    }
    
    // Muddy olive/brown zone (40-55) at certain conditions handled elsewhere
    // Muddy yellow-brown (42-52) - push to cleaner orange or yellow
    if (normalized > 42 && normalized < 52) {
      return normalized < 47 ? 38 : 55;
    }
    
    return normalized;
  };
  
  // Find hue that harmonizes with all locked hues
  const findHarmoniousHue = (targetOffset, jitterAmount = 8) => {
    if (lockedHues.length <= 1) {
      return avoidDeadZones((base + targetOffset + jitter(jitterAmount) + 360) % 360);
    }
    
    let sumX = 0, sumY = 0;
    lockedHues.forEach(h => {
      const rad = (h + targetOffset) * Math.PI / 180;
      sumX += Math.cos(rad);
      sumY += Math.sin(rad);
    });
    let avgHue = Math.atan2(sumY, sumX) * 180 / Math.PI;
    if (avgHue < 0) avgHue += 360;
    
    return avoidDeadZones((avgHue + jitter(jitterAmount * 0.75) + 360) % 360);
  };

  switch (mode) {
    case 'mono':
      for (let i = 0; i < count; i++) {
        const shift = ((i / Math.max(1, count - 1)) - 0.5) * 10;
        hues.push(findHarmoniousHue(shift, 4));
      }
      break;
      
    case 'analogous':
      const range = Math.min(50, 28 + count * 4);
      for (let i = 0; i < count; i++) {
        const progress = count > 1 ? i / (count - 1) : 0.5;
        const offset = progress * range - (range / 2);
        hues.push(findHarmoniousHue(offset, 10));
      }
      break;
      
    case 'complementary':
      const compOffset = 180 + random(-12, 12, rng);
      for (let i = 0; i < count; i++) {
        if (i < Math.ceil(count / 2)) {
          hues.push(findHarmoniousHue(jitter(18), 12));
        } else {
          hues.push(findHarmoniousHue(compOffset, 18));
        }
      }
      break;
      
    case 'splitComplementary':
      const splitAngle = 150 + random(-8, 8, rng);
      const splitAnchors = [0, splitAngle, 360 - splitAngle];
      for (let i = 0; i < count; i++) {
        const anchor = splitAnchors[i % splitAnchors.length];
        hues.push(findHarmoniousHue(anchor, 12));
      }
      break;
      
    case 'triadic':
      const triadicAnchors = [0, 120 + random(-8, 8, rng), 240 + random(-8, 8, rng)];
      for (let i = 0; i < count; i++) {
        const anchor = triadicAnchors[i % triadicAnchors.length];
        hues.push(findHarmoniousHue(anchor, 10));
      }
      break;
      
    case 'tetradic':
      const tetAnchors = [0, 90, 180, 270];
      for (let i = 0; i < count; i++) {
        const anchor = tetAnchors[i % tetAnchors.length];
        hues.push(findHarmoniousHue(anchor, 12));
      }
      break;
      
    default:
      for (let i = 0; i < count; i++) {
        hues.push(avoidDeadZones((base + (i * 30) + 360) % 360));
      }
  }
  
  return hues;
};

const generateCohesiveVariationsOklch = (hues, mood, count, rng, targetChroma = null, targetLightness = null) => {
  const result = [];
  
  const useLightnessProgression = rng() < 0.65;
  const progressionDirection = rng() < 0.5 ? 'ascending' : 'descending';
  
  let targetChromaRatio;
  let lightnessRange;
  
  // If we have targets from locked colors, use those as anchors
  if (targetChroma !== null && targetLightness !== null) {
    const chromaVariance = 0.05;
    const lightnessVariance = 0.18;
    
    const baseRatio = Math.min(targetChroma / 0.22, 1.0);
    targetChromaRatio = { 
      min: Math.max(0.20, baseRatio - 0.12), 
      max: Math.min(0.98, baseRatio + 0.15) 
    };
    
    lightnessRange = {
      min: Math.max(0.12, targetLightness - lightnessVariance),
      max: Math.min(0.95, targetLightness + lightnessVariance)
    };
  } else {
    switch (mood) {
      case 'pastel':
        targetChromaRatio = { min: 0.35, max: 0.55 };
        lightnessRange = { min: 0.80, max: 0.92 };
        break;
      case 'vibrant':
        targetChromaRatio = { min: 0.80, max: 0.98 };
        lightnessRange = { min: 0.48, max: 0.80 };
        break;
      case 'muted':
        targetChromaRatio = { min: 0.20, max: 0.45 };
        lightnessRange = { min: 0.38, max: 0.68 };
        break;
      case 'dark':
        targetChromaRatio = { min: 0.40, max: 0.75 };
        lightnessRange = { min: 0.15, max: 0.40 };
        break;
      case 'light':
        targetChromaRatio = { min: 0.35, max: 0.60 };
        lightnessRange = { min: 0.75, max: 0.92 };
        break;
      default:
        targetChromaRatio = { min: 0.50, max: 0.85 };
        lightnessRange = { min: 0.28, max: 0.88 };
    }
  }
  
  const lightnessValues = [];
  
  if (useLightnessProgression && count >= 3) {
    for (let i = 0; i < count; i++) {
      const t = count > 1 ? i / (count - 1) : 0.5;
      const eased = t * t * (3 - 2 * t);
      
      let L;
      if (progressionDirection === 'ascending') {
        L = lightnessRange.min + eased * (lightnessRange.max - lightnessRange.min);
      } else {
        L = lightnessRange.max - eased * (lightnessRange.max - lightnessRange.min);
      }
      
      L += random(-0.04, 0.04, rng);
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
    
    for (let i = lightnessValues.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [lightnessValues[i], lightnessValues[j]] = [lightnessValues[j], lightnessValues[i]];
    }
  }
  
  // Apply subtle hue shifts based on lightness for depth
  const applyLightnessHueShift = rng() < 0.5;
  const hueShiftDirection = rng() < 0.5 ? 1 : -1;
  
  for (let i = 0; i < count; i++) {
    let h = hues[i];
    let L = lightnessValues[i];
    
    // Warm shift for darker colors, cool shift for lighter (or vice versa)
    if (applyLightnessHueShift) {
      const hueShift = (L - 0.5) * -12 * hueShiftDirection;
      h = (h + hueShift + 360) % 360;
    }
    
    const hueAdj = getHueAdjustments(h);
    L = Math.max(hueAdj.minL, Math.min(hueAdj.maxL, L));
    
    const maxC = findMaxChroma(L, h);
    const ratio = random(targetChromaRatio.min, targetChromaRatio.max, rng);
    let C = maxC * ratio;
    C = Math.min(C, maxC * 0.96);
    
    result.push({ C, L, h });
  }
  
  // Add accent "pop" color for larger palettes
  if (count >= 4 && mood !== 'muted' && targetChroma === null && rng() < 0.55) {
    const accentIndex = Math.floor(rng() * count);
    const maxC = findMaxChroma(result[accentIndex].L, result[accentIndex].h);
    result[accentIndex].C = Math.min(result[accentIndex].C * 1.3, maxC * 0.96);
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

// Add this new function after enforceMinimumDistance
const enforcePaletteCohesion = (colors, maxAttempts = 30) => {
  if (colors.length <= 2) return colors;
  
  const result = [...colors];
  const colorData = result.map(hex => ({
    hex,
    oklch: hexToOklch(hex),
    oklab: hexToOklab(hex),
  }));
  
  // Check for "outlier" colors that don't fit the palette
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    let worstIndex = -1;
    let worstScore = 0;
    
    for (let i = 0; i < colorData.length; i++) {
      // Calculate how "isolated" this color is from its neighbors
      const prevIdx = i > 0 ? i - 1 : colorData.length - 1;
      const nextIdx = i < colorData.length - 1 ? i + 1 : 0;
      
      const distToPrev = deltaEOK(colorData[i].oklab, colorData[prevIdx].oklab);
      const distToNext = deltaEOK(colorData[i].oklab, colorData[nextIdx].oklab);
      
      // Also check hue isolation
      const hueDiffPrev = Math.abs(colorData[i].oklch.h - colorData[prevIdx].oklch.h);
      const hueDiffNext = Math.abs(colorData[i].oklch.h - colorData[nextIdx].oklch.h);
      const normalizedHuePrev = hueDiffPrev > 180 ? 360 - hueDiffPrev : hueDiffPrev;
      const normalizedHueNext = hueDiffNext > 180 ? 360 - hueDiffNext : hueDiffNext;
      
      // A color is an "outlier" if it has large hue jumps on BOTH sides
      const minHueJump = Math.min(normalizedHuePrev, normalizedHueNext);
      const avgHueJump = (normalizedHuePrev + normalizedHueNext) / 2;
      
      // Score: high if both neighbors are far away in hue
      const isolationScore = minHueJump > 60 ? avgHueJump : 0;
      
      if (isolationScore > worstScore) {
        worstScore = isolationScore;
        worstIndex = i;
      }
    }
    
    // If we found an outlier with significant isolation, fix it
    if (worstIndex >= 0 && worstScore > 80) {
      const prevIdx = worstIndex > 0 ? worstIndex - 1 : colorData.length - 1;
      const nextIdx = worstIndex < colorData.length - 1 ? worstIndex + 1 : 0;
      
      // Blend the outlier toward its neighbors
      const prevHue = colorData[prevIdx].oklch.h;
      const nextHue = colorData[nextIdx].oklch.h;
      
      // Find midpoint hue (handling wrap-around)
      let h1 = prevHue, h2 = nextHue;
      let diff = h2 - h1;
      if (diff > 180) h2 -= 360;
      if (diff < -180) h2 += 360;
      let newHue = (h1 + h2) / 2;
      if (newHue < 0) newHue += 360;
      if (newHue >= 360) newHue -= 360;
      
      // Keep similar lightness and chroma, just fix the hue
      const newL = colorData[worstIndex].oklch.L;
      const newC = colorData[worstIndex].oklch.C;
      
      const newHex = oklchToHex(newL, newC, newHue);
      result[worstIndex] = newHex;
      colorData[worstIndex] = {
        hex: newHex,
        oklch: hexToOklch(newHex),
        oklab: hexToOklab(newHex),
      };
    } else {
      break; // No more outliers to fix
    }
  }
  
  return result;
};

// ============================================
// 5. MAIN PALETTE GENERATOR
// ============================================

export const generateRandomPalette = (mode = 'auto', count = 5, constraints = {}, rng = Math.random) => {
  let harmonyMode = mode;
  let activeMood = constraints.mood || 'any';
  
  const hasLockedColors = constraints.lockedColors && constraints.lockedColors.length > 0;
  let targetChroma = constraints.targetChroma;
  let targetLightness = constraints.targetLightness;
  
  if (hasLockedColors && (targetChroma == null || targetLightness == null)) {
    const lockedStats = getLockedStats(constraints.lockedColors);
    if (targetChroma == null) targetChroma = lockedStats.avgC;
    if (targetLightness == null) targetLightness = lockedStats.avgL;
  }

  if (mode === 'auto') {
    const lockedStats = hasLockedColors ? getLockedStats(constraints.lockedColors) : null;
  
    // Harmony choice (weighted, conditioned, gently jittered)
    let harmonyWeights = buildHarmonyWeights({ count, hasLockedColors, lockedStats });
    harmonyWeights = jitterWeights(harmonyWeights, rng, 0.16);
  
    // Optional: keep a little continuity if you provide prevHarmonyMode
    harmonyWeights = applyStickiness(harmonyWeights, constraints.prevHarmonyMode, 0.60);
  
    harmonyMode = weightedPick(harmonyWeights, rng);
  
    // Mood choice
    if (!constraints.mood || constraints.mood === 'any') {
      let moodWeights;
  
      if (hasLockedColors && lockedStats) {
        moodWeights = inferMoodWeightsFromLocked(lockedStats);
      } else {
        // Your old distribution, but as weights so we can jitter and tune
        moodWeights = {
          vibrant: 0.45,
          muted: 0.13,
          pastel: 0.14,
          dark: 0.13,
          light: 0.08,
          any: 0.07,
        };
  
        // Big palettes tend to look nicer with less saturation on average
        if (count >= 6) {
          moodWeights.muted *= 1.25;
          moodWeights.pastel *= 1.15;
          moodWeights.vibrant *= 0.85;
        }
      }
  
      moodWeights = normalizeWeights(jitterWeights(moodWeights, rng, 0.12));
      moodWeights = applyStickiness(moodWeights, constraints.prevMood, 0.50);
  
      activeMood = weightedPick(moodWeights, rng);
    }
  }

  const hues = generateHarmoniousHues(harmonyMode, count, constraints, rng);
  const clValues = generateCohesiveVariationsOklch(hues, activeMood, count, rng, targetChroma, targetLightness);

  let palette = [];
  for (let i = 0; i < count; i++) {
    const { C, L, h } = clValues[i];
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
// 6. UTILITIES
// ============================================

// ============================================
// IMPROVED COLOR SORTING
// ============================================

// Calculate the "smoothness" score of an ordering (lower is better)
const calculateOrderingSmoothness = (colorData) => {
  if (colorData.length <= 1) return 0;
  
  let totalDistance = 0;
  let maxStep = 0;
  const steps = [];
  
  for (let i = 1; i < colorData.length; i++) {
    const dist = deltaEOK(colorData[i - 1].oklab, colorData[i].oklab);
    steps.push(dist);
    totalDistance += dist;
    maxStep = Math.max(maxStep, dist);
  }
  
  // Calculate variance in step sizes (we want even steps)
  const avgStep = totalDistance / steps.length;
  const variance = steps.reduce((sum, s) => sum + Math.pow(s - avgStep, 2), 0) / steps.length;
  
  // Score combines: total distance, max single step, and variance
  // Weight max step heavily to avoid jarring transitions
  return totalDistance + (maxStep * 3) + (Math.sqrt(variance) * 2);
};

// Sort by hue with proper wrap-around handling
const sortByHue = (colorData) => {
  const sorted = [...colorData];
  
  // Find the largest gap in hues to determine where to "cut" the circle
  const hues = sorted.map(c => c.oklch.h).sort((a, b) => a - b);
  let maxGap = 0;
  let cutPoint = 0;
  
  for (let i = 0; i < hues.length; i++) {
    const nextI = (i + 1) % hues.length;
    let gap = hues[nextI] - hues[i];
    if (nextI === 0) gap += 360; // Wrap around
    
    if (gap > maxGap) {
      maxGap = gap;
      cutPoint = hues[nextI];
    }
  }
  
  // Sort by hue, offset by cutPoint to handle wrap-around
  sorted.sort((a, b) => {
    const hueA = (a.oklch.h - cutPoint + 360) % 360;
    const hueB = (b.oklch.h - cutPoint + 360) % 360;
    return hueA - hueB;
  });
  
  return sorted;
};

// Sort by lightness (can be ascending or descending)
const sortByLightness = (colorData, ascending = true) => {
  const sorted = [...colorData];
  sorted.sort((a, b) => ascending ? a.oklch.L - b.oklch.L : b.oklch.L - a.oklch.L);
  return sorted;
};

// Sort by chroma (saturation)
const sortByChroma = (colorData, ascending = true) => {
  const sorted = [...colorData];
  sorted.sort((a, b) => ascending ? a.oklch.C - b.oklch.C : b.oklch.C - a.oklch.C);
  return sorted;
};

// Nearest neighbor but try multiple starting points
const nearestNeighborBest = (colorData) => {
  let bestOrdering = null;
  let bestScore = Infinity;
  
  // Try starting from each color
  for (let startIdx = 0; startIdx < colorData.length; startIdx++) {
    const ordering = nearestNeighborFrom(colorData, startIdx);
    const score = calculateOrderingSmoothness(ordering);
    
    if (score < bestScore) {
      bestScore = score;
      bestOrdering = ordering;
    }
    
    // Also try the reverse
    const reversed = [...ordering].reverse();
    const reverseScore = calculateOrderingSmoothness(reversed);
    if (reverseScore < bestScore) {
      bestScore = reverseScore;
      bestOrdering = reversed;
    }
  }
  
  return bestOrdering;
};

const nearestNeighborFrom = (colorData, startIdx) => {
  const sorted = [colorData[startIdx]];
  const remaining = colorData.filter((_, i) => i !== startIdx);
  
  while (remaining.length > 0) {
    const current = sorted[sorted.length - 1];
    let nearestIdx = 0;
    let minDist = Infinity;
    
    for (let i = 0; i < remaining.length; i++) {
      const dist = deltaEOK(current.oklab, remaining[i].oklab);
      if (dist < minDist) {
        minDist = dist;
        nearestIdx = i;
      }
    }
    
    sorted.push(remaining[nearestIdx]);
    remaining.splice(nearestIdx, 1);
  }
  
  return sorted;
};

// 2-opt improvement: swap pairs to reduce total distance
const twoOptImprove = (colorData, maxIterations = 100) => {
  let improved = [...colorData];
  let bestScore = calculateOrderingSmoothness(improved);
  
  for (let iter = 0; iter < maxIterations; iter++) {
    let foundImprovement = false;
    
    for (let i = 0; i < improved.length - 2; i++) {
      for (let j = i + 2; j < improved.length; j++) {
        // Try reversing the segment between i+1 and j
        const newOrder = [
          ...improved.slice(0, i + 1),
          ...improved.slice(i + 1, j + 1).reverse(),
          ...improved.slice(j + 1)
        ];
        
        const newScore = calculateOrderingSmoothness(newOrder);
        if (newScore < bestScore) {
          improved = newOrder;
          bestScore = newScore;
          foundImprovement = true;
        }
      }
    }
    
    if (!foundImprovement) break;
  }
  
  return improved;
};

// Luminance-weighted hue sorting (good for rainbow-like progressions)
const sortByHueThenLightness = (colorData) => {
  const hueSorted = sortByHue(colorData);
  
  // Group by similar hues and sort within groups by lightness
  const groups = [];
  let currentGroup = [hueSorted[0]];
  
  for (let i = 1; i < hueSorted.length; i++) {
    const hueDiff = Math.abs(hueSorted[i].oklch.h - hueSorted[i - 1].oklch.h);
    const normalizedDiff = hueDiff > 180 ? 360 - hueDiff : hueDiff;
    
    if (normalizedDiff < 30) {
      currentGroup.push(hueSorted[i]);
    } else {
      // Sort current group by lightness before moving on
      currentGroup.sort((a, b) => a.oklch.L - b.oklch.L);
      groups.push(...currentGroup);
      currentGroup = [hueSorted[i]];
    }
  }
  
  // Don't forget the last group
  currentGroup.sort((a, b) => a.oklch.L - b.oklch.L);
  groups.push(...currentGroup);
  
  return groups;
};

// Main improved sorting function
const optimizeColorOrder = (colors) => {
  if (colors.length <= 2) return colors;
  
  const colorData = colors.map((hex) => ({
    hex,
    oklch: hexToOklch(hex),
    oklab: hexToOklab(hex),
  }));

  // Analyze the palette characteristics
  const hues = colorData.map(c => c.oklch.h);
  const lightnesses = colorData.map(c => c.oklch.L);
  const chromas = colorData.map(c => c.oklch.C);
  
  // Calculate hue spread (handling wrap-around)
  const sortedHues = [...hues].sort((a, b) => a - b);
  let maxHueGap = 0;
  for (let i = 0; i < sortedHues.length; i++) {
    const nextI = (i + 1) % sortedHues.length;
    let gap = sortedHues[nextI] - sortedHues[i];
    if (nextI === 0) gap += 360;
    maxHueGap = Math.max(maxHueGap, gap);
  }
  const hueSpread = 360 - maxHueGap;
  
  // Calculate lightness and chroma ranges
  const lightnessRange = Math.max(...lightnesses) - Math.min(...lightnesses);
  const chromaRange = Math.max(...chromas) - Math.min(...chromas);
  
  // Determine the best sorting strategy based on palette characteristics
  let candidates = [];
  
  if (hueSpread < 40) {
    // Monochromatic/analogous: lightness is the main differentiator
    candidates.push(sortByLightness(colorData, true));  // Dark to light
    candidates.push(sortByLightness(colorData, false)); // Light to dark
    
    // If chroma varies significantly, also try chroma-based
    if (chromaRange > 0.08) {
      candidates.push(sortByChroma(colorData, true));
      candidates.push(sortByChroma(colorData, false));
    }
  } else if (hueSpread > 180) {
    // Wide hue spread: try hue-based sorting
    candidates.push(sortByHue(colorData));
    candidates.push(sortByHueThenLightness(colorData));
    candidates.push(nearestNeighborBest(colorData));
  } else {
    // Medium hue spread: try multiple strategies
    candidates.push(sortByHue(colorData));
    candidates.push(sortByLightness(colorData, true));
    candidates.push(sortByLightness(colorData, false));
    candidates.push(nearestNeighborBest(colorData));
  }
  
  // Apply 2-opt improvement to each candidate
  candidates = candidates.map(c => twoOptImprove(c, 50));
  
  // Pick the best ordering
  let bestCandidate = candidates[0];
  let bestScore = calculateOrderingSmoothness(candidates[0]);
  
  for (let i = 1; i < candidates.length; i++) {
    const score = calculateOrderingSmoothness(candidates[i]);
    if (score < bestScore) {
      bestScore = score;
      bestCandidate = candidates[i];
    }
  }
  
  return bestCandidate.map(c => c.hex);
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

const getComprehensiveTraits = (hsls, hexColors) => {
  const avgS = hsls.reduce((a, c) => a + c.s, 0) / hsls.length;
  const avgL = hsls.reduce((a, c) => a + c.l, 0) / hsls.length;
  const maxL = Math.max(...hsls.map(c => c.l));
  const minL = Math.min(...hsls.map(c => c.l));
  const lightnessRange = maxL - minL;

  const satStdDev = Math.sqrt(hsls.reduce((a, c) => a + Math.pow(c.s - avgS, 2), 0) / hsls.length);
  const lightStdDev = Math.sqrt(hsls.reduce((a, c) => a + Math.pow(c.l - avgL, 2), 0) / hsls.length);

  const oklchs = hexColors.map(hexToOklch);
  const hues = oklchs.map(c => c.h);
  
  const avgOklchL = oklchs.reduce((a, c) => a + c.L, 0) / oklchs.length;
  const avgOklchC = oklchs.reduce((a, c) => a + c.C, 0) / oklchs.length;
  const maxOklchL = Math.max(...oklchs.map(c => c.L));
  const minOklchL = Math.min(...oklchs.map(c => c.L));
  const maxOklchC = Math.max(...oklchs.map(c => c.C));
  const minOklchC = Math.min(...oklchs.map(c => c.C));
  
  const dominant = oklchs.reduce((prev, curr) => (curr.C > prev.C ? curr : prev));
  const hueInfo = getDetailedHueInfo(dominant.h);
  
  const temperature = analyzeColorTemperatureFromHues(hues);
  const harmony = detectHarmonyTypeFromHues(hues);

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
    avgS, avgL, maxL, minL, lightnessRange,
    satStdDev, lightStdDev,
    avgOklchL, avgOklchC, maxOklchL, minOklchL, maxOklchC, minOklchC,
    dominantHueDeg: Math.round(dominant.h),
    hueInfo, temperature, harmony, contrastRatio,
    isVibrant, isMuted, isPastel, isDark, isLight,
    isHighContrast, isLowContrast, isUniform, hasNeutrals,
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
        red: "energy, urgency, passion, and appetite stimulation",
        orange: "friendliness, creativity, affordability, and youthful energy",
        yellow: "optimism, clarity, warmth, and attention-grabbing visibility",
        green: "growth, health, sustainability, wealth, and natural authenticity",
        teal: "sophistication, clarity, and balanced professionalism",
        cyan: "innovation, cleanliness, and technological advancement",
        blue: "reliability, trustworthiness, competence, and stability",
        purple: "creativity, luxury, wisdom, and imagination",
        pink: "nurturing, approachability, playfulness, and compassion"
      },
      saturationImpact: {
        high: "High saturation creates memorable brand recognition and works effectively for digital-first companies.",
        low: "Reduced saturation projects maturity, trustworthiness, and sophistication."
      }
    },
    interiorDesign: {
      title: "Interior Design and Architecture",
      temperatureContexts: {
        warm: [
          "Creates intimate, inviting atmospheres in residential living spaces and hospitality environments.",
          "Compensates for north-facing rooms with limited natural warmth.",
          "Supports social spaces where conversation and connection are priorities."
        ],
        cool: [
          "Provides visual relief in south-facing rooms with abundant direct sunlight.",
          "Creates calming environments appropriate for bedrooms, bathrooms, and spas.",
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
          "Adds drama and intimacy to feature walls and entertainment rooms.",
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
          "Natural choice for landscape and environmental concept art.",
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
        "Consider fabric type when evaluating colors, as material affects appearance."
      ]
    },
    print: {
      title: "Print Production",
      contexts: {
        vibrant: [
          "High saturation values may shift during RGB-to-CMYK conversion; request press proofs.",
          "Consider Pantone spot color matching for consistent reproduction.",
          "Allow for paper absorption differences between coated and uncoated stocks."
        ],
        muted: [
          "Desaturated values reproduce more predictably across different paper stocks.",
          "Performs well on uncoated and textured stocks.",
          "Reduces registration sensitivity for multi-color process printing."
        ],
        general: [
          "Verify sufficient tonal separation for clear reproduction in grayscale scenarios.",
          "Test on target paper stock, as substrate color temperature affects appearance.",
          "Consider environmental factors like lighting conditions where materials will be viewed."
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
          "Supports clean product photography requiring neutral backgrounds.",
          "Provides reference for highlight and fill light coloring."
        ],
        general: [
          "Informs preset development for batch processing in Lightroom or DaVinci Resolve.",
          "Provides reference for gel selection in studio lighting setups.",
          "Guides color harmony decisions for styled shoots and art direction."
        ]
      }
    },
    accessibility: {
      title: "Accessibility Considerations",
      contrastGuidance: {
        high: [
          "The contrast range supports WCAG 2.1 Level AA requirements for body text.",
          "Provides sufficient luminance differentiation for users with contrast sensitivity.",
          "Enables clear visual hierarchy for users with partial vision."
        ],
        low: [
          "Additional contrast enhancement needed for text applications.",
          "Reserve highest and lowest lightness values for critical elements.",
          "Consider using pure black or white for text overlays."
        ]
      },
      colorBlindnessNotes: {
        redGreen: "Red and green combinations should be validated with simulation tools. Add pattern or label differentiation.",
        blueYellow: "Blue and yellow combinations should be tested with tritanopia simulation.",
        general: "Ensure color is never the sole means of conveying critical information."
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
      `A ${colorCount}-color ${hue} palette with bold saturation. Includes hex codes for web design, branding, and illustration.`,
      `Vibrant ${hue} color scheme featuring ${colorCount} coordinated shades for UI design and brand identity.`
    );
  }

  if (traits.isMuted) {
    templates.push(
      `Refined ${colorCount}-color ${hue} palette with sophisticated muted tones for professional design.`,
      `A subtle ${hue} color scheme with ${colorCount} desaturated shades for elegant design projects.`
    );
  }

  if (traits.isPastel) {
    templates.push(
      `Soft pastel ${hue} palette with ${colorCount} gentle tones for wellness branding and approachable design.`,
      `Delicate ${colorCount}-color ${hue} scheme with airy pastel values for web and print applications.`
    );
  }

  if (traits.isDark) {
    templates.push(
      `Deep ${hue} palette featuring ${colorCount} rich dark values for dramatic branding and dark mode interfaces.`,
      `A ${colorCount}-color dark ${hue} scheme for sophisticated web interfaces and luxury brand applications.`
    );
  }

  templates.push(
    `A ${harmony} ${hue} palette with ${colorCount} colors. Export hex, RGB, and HSL values for creative projects.`,
    `Curated ${hue} color scheme featuring ${colorCount} ${harmony} shades with accessibility considerations.`
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
  const avgLPercent = Math.round(traits.avgOklchL * 100);
  const minLPercent = Math.round(traits.minOklchL * 100);
  const maxLPercent = Math.round(traits.maxOklchL * 100);
  const avgCPercent = Math.round(traits.avgOklchC * 250);
  
  const specs = [
    `Palette Size: ${colors.length} colors`,
    `Primary Hue: ${traits.dominantHueDeg}°`,
    `Color Harmony: ${traits.harmony}`,
    `Chroma: ${avgCPercent}% average (OKLCH)`,
    `Lightness Range: ${minLPercent}% to ${maxLPercent}% (OKLCH)`,
    `Contrast Ratio: ${traits.contrastRatio}:1`,
    `Temperature: ${traits.temperature.type}`,
    `Accessibility Rating: ${traits.accessibilityScore}`
  ];

  return `Technical Specifications: ${specs.join('. ')}.`;
};

const generateExportInfo = () => {
  return `Format Availability: This palette exports to HEX, RGB, HSL, OKLCH, and CMYK formats. CSS custom properties, Tailwind configuration, and design token formats support systematic implementation.`;
};

const capitalize = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1) : '';

// ============================================
// 11. KEYWORD GENERATION
// ============================================

const generateKeywords = (traits, colorCount) => {
  const hue = traits.hueInfo.primary;
  const detailed = traits.hueInfo.detailed;
  const keywords = [];

  keywords.push(`${hue} color palette`, `${hue} color scheme`, `${colorCount} color palette`, `${hue} hex codes`);

  if (traits.isVibrant) keywords.push(`vibrant ${hue} palette`, `bold ${hue} colors`, `saturated ${hue} scheme`);
  if (traits.isMuted) keywords.push(`muted ${hue} palette`, `subtle ${hue} colors`, `desaturated ${hue} scheme`);
  if (traits.isPastel) keywords.push(`pastel ${hue} palette`, `soft ${hue} colors`, `light ${hue} scheme`);
  if (traits.isDark) keywords.push(`dark ${hue} palette`, `deep ${hue} colors`, `moody ${hue} scheme`);

  keywords.push(`${traits.harmony} color palette`, `${traits.harmony} ${hue} colors`);
  keywords.push(`${hue} web design colors`, `${hue} branding palette`, `${hue} ui colors`);
  keywords.push(`${hue} interior design`, `${hue} graphic design`);

  if (detailed !== hue) keywords.push(`${detailed} color palette`, `${detailed} color scheme`);

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
    if (section) contentSections.push(section);
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