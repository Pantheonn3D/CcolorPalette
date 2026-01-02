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
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
      default:
        h = 0;
    }
    h *= 360;
  }

  return { h, s: s * 100, l: l * 100 };
};

const random = (min, max) => Math.random() * (max - min) + min;

// ============================================
// HUE DISTANCE CALCULATION (circular)
// ============================================
const getHueDistance = (h1, h2) => {
  let diff = Math.abs(h1 - h2);
  return diff > 180 ? 360 - diff : diff;
};

// ============================================
// CONTRAST RATIO CALCULATION
// ============================================
const getContrastRatio = (hex1, hex2) => {
  const getLuminance = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const toLinear = (c) =>
      c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);

    return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
  };

  const l1 = getLuminance(hex1);
  const l2 = getLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
};

// ============================================
// ADJACENCY SCORING
// ============================================
const scoreAdjacency = (color1, color2) => {
  const hsl1 = hexToHsl(color1);
  const hsl2 = hexToHsl(color2);

  let score = 0;

  const hueDiff = getHueDistance(hsl1.h, hsl2.h);
  const satDiff = Math.abs(hsl1.s - hsl2.s);
  const lightDiff = Math.abs(hsl1.l - hsl2.l);

  const isNeutral1 = hsl1.s < 15;
  const isNeutral2 = hsl2.s < 15;
  const hasNeutral = isNeutral1 || isNeutral2;

  if (hueDiff < 20) {
    score += 80;
  } else if (hueDiff < 40) {
    score += 50;
  } else if (hueDiff < 60) {
    score += 20;
  } else if (hueDiff > 80 && hueDiff < 160) {
    score -= 40;
  } else if (hueDiff >= 160) {
    score += 10;
  }

  if (hasNeutral) {
    score += 30;
    if (isNeutral1 || isNeutral2) {
      score += 15;
    }
  }

  if (lightDiff > 10 && lightDiff < 35) {
    score += 25;
  } else if (lightDiff >= 35 && lightDiff < 55) {
    score += 15;
  } else if (lightDiff < 10 && hueDiff < 30) {
    score += 10;
  }

  if (satDiff < 20) {
    score += 15;
  } else if (satDiff > 40 && !hasNeutral) {
    score -= 15;
  }

  const bothVibrant = hsl1.s > 60 && hsl2.s > 60;
  if (bothVibrant && hueDiff > 50 && hueDiff < 150) {
    score -= 50;
  }

  if (hueDiff < 8 && satDiff < 8 && lightDiff < 8) {
    score -= 30;
  }

  return score;
};

// ============================================
// CLUSTER-BASED OPTIMIZATION
// ============================================
const clusterByHue = (colors) => {
  const colorData = colors.map((hex) => ({
    hex,
    hsl: hexToHsl(hex),
  }));

  const neutrals = colorData.filter((c) => c.hsl.s < 15);
  const chromatic = colorData.filter((c) => c.hsl.s >= 15);

  chromatic.sort((a, b) => a.hsl.h - b.hsl.h);

  if (chromatic.length > 1) {
    let maxGap = 0;
    let cutIndex = 0;

    for (let i = 0; i < chromatic.length; i++) {
      const next = (i + 1) % chromatic.length;
      let gap = chromatic[next].hsl.h - chromatic[i].hsl.h;
      if (next === 0) gap += 360;

      if (gap > maxGap) {
        maxGap = gap;
        cutIndex = next;
      }
    }

    const rotated = [
      ...chromatic.slice(cutIndex),
      ...chromatic.slice(0, cutIndex),
    ];
    chromatic.length = 0;
    chromatic.push(...rotated);
  }

  const grouped = [];
  let currentGroup = [];
  const HUE_THRESHOLD = 35;

  for (const color of chromatic) {
    if (currentGroup.length === 0) {
      currentGroup.push(color);
    } else {
      const lastHue = currentGroup[currentGroup.length - 1].hsl.h;
      const hueDiff = getHueDistance(color.hsl.h, lastHue);

      if (hueDiff < HUE_THRESHOLD) {
        currentGroup.push(color);
      } else {
        currentGroup.sort((a, b) => a.hsl.l - b.hsl.l);
        grouped.push(...currentGroup);
        currentGroup = [color];
      }
    }
  }

  if (currentGroup.length > 0) {
    currentGroup.sort((a, b) => a.hsl.l - b.hsl.l);
    grouped.push(...currentGroup);
  }

  neutrals.sort((a, b) => a.hsl.l - b.hsl.l);

  const result = grouped.map((c) => c.hex);

  if (neutrals.length > 0) {
    if (result.length > 0) {
      const firstChromatic = hexToHsl(result[0]);
      const lastChromatic = hexToHsl(result[result.length - 1]);

      for (const neutral of neutrals) {
        if (neutral.hsl.l < 40) {
          if (firstChromatic.l < lastChromatic.l) {
            result.unshift(neutral.hex);
          } else {
            result.push(neutral.hex);
          }
        } else {
          if (firstChromatic.l > lastChromatic.l) {
            result.unshift(neutral.hex);
          } else {
            result.push(neutral.hex);
          }
        }
      }
    } else {
      return neutrals.map((c) => c.hex);
    }
  }

  return result;
};

// ============================================
// OPTIMIZE COLOR ORDER
// ============================================
const scorePaletteOrder = (colors) => {
  let totalScore = 0;
  for (let i = 0; i < colors.length - 1; i++) {
    totalScore += scoreAdjacency(colors[i], colors[i + 1]);
  }
  return totalScore;
};

const getPermutations = (arr) => {
  if (arr.length <= 1) return [arr];
  const result = [];
  for (let i = 0; i < arr.length; i++) {
    const rest = [...arr.slice(0, i), ...arr.slice(i + 1)];
    for (const perm of getPermutations(rest)) {
      result.push([arr[i], ...perm]);
    }
  }
  return result;
};

const optimizeColorOrder = (colors) => {
  const clustered = clusterByHue(colors);

  if (colors.length <= 6) {
    const permutations = getPermutations(colors);
    let bestOrder = clustered;
    let bestScore = scorePaletteOrder(clustered);

    for (const perm of permutations) {
      const score = scorePaletteOrder(perm);
      if (score > bestScore) {
        bestScore = score;
        bestOrder = perm;
      }
    }

    const reversedClustered = [...clustered].reverse();
    const reversedScore = scorePaletteOrder(reversedClustered);
    if (reversedScore > bestScore) {
      bestScore = reversedScore;
      bestOrder = reversedClustered;
    }

    return bestOrder;
  }

  const reversedScore = scorePaletteOrder([...clustered].reverse());
  const normalScore = scorePaletteOrder(clustered);

  return reversedScore > normalScore ? [...clustered].reverse() : clustered;
};

// ============================================
// HELPER FUNCTIONS
// ============================================
const shuffleArray = (arr) => {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

// ============================================
// PALETTE PROFILE GENERATION
// ============================================
const generatePaletteProfile = (constraints = {}) => {
  const { mood, darkModeFriendly } = constraints;

  if (mood && mood !== 'any') {
    switch (mood) {
      case 'muted':
        return { satRange: [10, 40], lightRange: [25, 75], mood: 'muted' };
      case 'pastel':
        return { satRange: [20, 50], lightRange: [75, 92], mood: 'pastel' };
      case 'vibrant':
        return { satRange: [60, 95], lightRange: [40, 70], mood: 'vibrant' };
      case 'dark':
        return { satRange: [20, 60], lightRange: [10, 40], mood: 'dark' };
      default:
        break;
    }
  }

  if (darkModeFriendly) {
    return { satRange: [30, 70], lightRange: [50, 85], mood: 'darkFriendly' };
  }

  const roll = Math.random();
  if (roll < 0.3) {
    return { satRange: [10, 40], lightRange: [25, 80], mood: 'muted' };
  } else if (roll < 0.5) {
    return { satRange: [15, 45], lightRange: [25, 75], mood: 'earthy' };
  } else if (roll < 0.7) {
    return { satRange: [20, 50], lightRange: [70, 92], mood: 'pastel' };
  } else if (roll < 0.85) {
    return { satRange: [25, 85], lightRange: [30, 75], mood: 'vibrant' };
  } else {
    return { satRange: [15, 70], lightRange: [15, 90], mood: 'contrast' };
  }
};

// ============================================
// HUE GENERATION
// ============================================
const generateFlowingHues = (mode, count = 5) => {
  const base = random(0, 360);

  switch (mode) {
    case 'mono':
      return Array(count)
        .fill(0)
        .map(() => (base + random(-3, 3) + 360) % 360);

    case 'analogous': {
      const spread = 60;
      return Array(count)
        .fill(0)
        .map(
          (_, i) =>
            (base -
              spread / 2 +
              (i * spread) / (count - 1) +
              random(-5, 5) +
              360) %
            360
        );
    }

    case 'complementary': {
      const hues = [];
      for (let i = 0; i < count; i++) {
        const isComplement = i % 2 === 1;
        const hue = isComplement ? base + 180 : base;
        hues.push((hue + random(-10, 10) + 360) % 360);
      }
      return hues;
    }

    case 'splitComplementary': {
      const hues = [];
      const splits = [0, 150, 210];
      for (let i = 0; i < count; i++) {
        const splitIndex = i % 3;
        const hue = base + splits[splitIndex];
        hues.push((hue + random(-10, 10) + 360) % 360);
      }
      return hues;
    }

    case 'triadic': {
      const hues = [];
      for (let i = 0; i < count; i++) {
        const third = i % 3;
        const hue = base + third * 120;
        hues.push((hue + random(-8, 8) + 360) % 360);
      }
      return hues;
    }

    default:
      return Array(count)
        .fill(0)
        .map(() => random(0, 360));
  }
};

// ============================================
// SATURATION DISTRIBUTION
// ============================================
const generateSaturationDistribution = (count, mood, harmonyMode) => {
  const saturations = [];

  if (harmonyMode === 'mono') {
    for (let i = 0; i < count; i++) {
      const t = i / (count - 1 || 1);
      saturations.push(15 + t * 55 + random(-8, 8));
    }
    return shuffleArray(saturations);
  }

  switch (mood) {
    case 'muted':
      for (let i = 0; i < count; i++) {
        saturations.push(random(10, 40));
      }
      break;

    case 'earthy':
      for (let i = 0; i < count; i++) {
        saturations.push(random(15, 50));
      }
      break;

    case 'pastel':
      for (let i = 0; i < count; i++) {
        saturations.push(random(25, 55));
      }
      break;

    case 'vibrant':
    case 'darkFriendly': {
      const heroCount = Math.min(2, Math.ceil(count / 3));
      for (let i = 0; i < count; i++) {
        if (i < heroCount) {
          saturations.push(random(65, 90));
        } else {
          saturations.push(random(15, 40));
        }
      }
      return shuffleArray(saturations);
    }

    case 'dark':
      for (let i = 0; i < count; i++) {
        saturations.push(random(30, 70));
      }
      break;

    case 'contrast':
      for (let i = 0; i < count; i++) {
        saturations.push(random(20, 70));
      }
      break;

    default:
      for (let i = 0; i < count; i++) {
        saturations.push(random(20, 60));
      }
  }

  return saturations;
};

// ============================================
// LIGHTNESS FLOW
// ============================================
const generateLightnessFlow = (profile, count, harmonyMode) => {
  const { lightRange, mood } = profile;
  let [minL, maxL] = lightRange;

  if (harmonyMode === 'mono') {
    minL = 25;
    maxL = 85;
  }

  const values = [];
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1 || 1);
    const base = minL + t * (maxL - minL);
    values.push(base + random(-5, 5));
  }

  if (mood !== 'contrast' || harmonyMode === 'mono') {
    return shuffleArray(values);
  }

  if (mood === 'contrast' && count >= 2) {
    values[0] = random(10, 25);
    values[count - 1] = random(80, 92);
  }

  return values;
};

// ============================================
// ENFORCE MINIMUM CONTRAST
// ============================================
const enforceMinContrast = (colors, minContrast) => {
  const result = [...colors];
  const maxAttempts = 50;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    let allPass = true;

    for (let i = 0; i < result.length - 1; i++) {
      const contrast = getContrastRatio(result[i], result[i + 1]);

      if (contrast < minContrast) {
        allPass = false;
        const hsl = hexToHsl(result[i + 1]);
        const hsl1 = hexToHsl(result[i]);

        if (hsl.l > hsl1.l) {
          hsl.l = Math.min(90, hsl.l + 10);
        } else {
          hsl.l = Math.max(10, hsl.l - 10);
        }

        result[i + 1] = hslToHex(hsl.h, hsl.s, hsl.l);
      }
    }

    if (allPass) break;
  }

  return result;
};

// ============================================
// MAIN PALETTE GENERATION
// ============================================
export const generateRandomPalette = (
  mode = 'auto',
  count = 5,
  constraints = {}
) => {
  const modes = [
    'mono',
    'analogous',
    'complementary',
    'splitComplementary',
    'triadic',
  ];
  const harmonyMode =
    mode === 'auto' ? modes[Math.floor(Math.random() * modes.length)] : mode;

  const profile = generatePaletteProfile(constraints);
  const hues = generateFlowingHues(harmonyMode, count);
  const saturations = generateSaturationDistribution(
    count,
    profile.mood,
    harmonyMode
  );
  const lightnessValues = generateLightnessFlow(profile, count, harmonyMode);

  let palette = [];
  for (let i = 0; i < count; i++) {
    const h = hues[i];
    let s = saturations[i];
    let l = lightnessValues[i];

    if (l > 85) s *= 0.5;
    if (l < 20) s *= 0.6;

    s = Math.max(5, Math.min(95, s));
    l = Math.max(10, Math.min(90, l));

    palette.push(hslToHex(h, s, l));
  }

  if (constraints.minContrast && constraints.minContrast > 1) {
    palette = enforceMinContrast(palette, constraints.minContrast);
  }

  return optimizeColorOrder(palette);
};

// ============================================
// UTILITY EXPORTS
// ============================================
export const getContrastColor = (hex) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? '#000000' : '#FFFFFF';
};

export const generateBridgeColor = (colorBefore, colorAfter) => {
  const hsl1 = hexToHsl(colorBefore);
  const hsl2 = hexToHsl(colorAfter);

  const t = 0.35 + Math.random() * 0.3;

  let hueDiff = hsl2.h - hsl1.h;
  if (hueDiff > 180) hueDiff -= 360;
  if (hueDiff < -180) hueDiff += 360;
  let h = (hsl1.h + hueDiff * t + 360) % 360;
  h = (h + (Math.random() - 0.5) * 20 + 360) % 360;

  const avgSat = (hsl1.s + hsl2.s) / 2;
  let s = avgSat * 0.7 + (Math.random() - 0.5) * 15;

  let l = hsl1.l + (hsl2.l - hsl1.l) * t + (Math.random() - 0.5) * 10;

  s = Math.max(10, Math.min(70, s));
  l = Math.max(15, Math.min(85, l));

  return hslToHex(h, s, l);
};

// ============================================
// COLOR BLINDNESS SIMULATION
// ============================================
const colorBlindnessMatrices = {
  protanopia: [
    [0.567, 0.433, 0],
    [0.558, 0.442, 0],
    [0, 0.242, 0.758],
  ],
  deuteranopia: [
    [0.625, 0.375, 0],
    [0.7, 0.3, 0],
    [0, 0.3, 0.7],
  ],
  tritanopia: [
    [0.95, 0.05, 0],
    [0, 0.433, 0.567],
    [0, 0.475, 0.525],
  ],
  achromatopsia: [
    [0.299, 0.587, 0.114],
    [0.299, 0.587, 0.114],
    [0.299, 0.587, 0.114],
  ],
};

export const simulateColorBlindness = (hex, type) => {
  if (type === 'normal' || !colorBlindnessMatrices[type]) return hex;

  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  const matrix = colorBlindnessMatrices[type];
  const newR = Math.round(
    matrix[0][0] * r + matrix[0][1] * g + matrix[0][2] * b
  );
  const newG = Math.round(
    matrix[1][0] * r + matrix[1][1] * g + matrix[1][2] * b
  );
  const newB = Math.round(
    matrix[2][0] * r + matrix[2][1] * g + matrix[2][2] * b
  );

  const clamp = (v) => Math.max(0, Math.min(255, v));

  return `#${clamp(newR).toString(16).padStart(2, '0')}${clamp(newG)
    .toString(16)
    .padStart(2, '0')}${clamp(newB)
    .toString(16)
    .padStart(2, '0')}`.toUpperCase();
};
