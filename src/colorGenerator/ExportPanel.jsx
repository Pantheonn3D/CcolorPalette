import { useState, useMemo } from 'react';
import {
  X,
  Link,
  Code,
  FileCode,
  Image,
  Braces,
  Check,
  Wind,
  ChevronDown,
  Settings2,
  FileJson,
} from 'lucide-react';
import { hexToHsl, hexToOklch, simulateColorBlindness } from '../utils/colorUtils';
import '../styles/PanelStyles.css';
import './ExportPanel.css';
import { trackEvent } from '../utils/analytics';
import { submitToIndexNow } from '../utils/seo';

const PANEL_WIDTH = 320;

// ============================================
// COLOR NAMING FOR "SMART" SCHEME
// ============================================

const getColorName = (h, s, l) => {
  h = ((h % 360) + 360) % 360;
  
  // Achromatic
  if (s < 8) {
    if (l < 15) return 'black';
    if (l < 30) return 'charcoal';
    if (l < 45) return 'gray';
    if (l < 60) return 'silver';
    if (l < 75) return 'light-gray';
    if (l < 90) return 'off-white';
    return 'white';
  }

  // Get modifier
  let prefix = '';
  if (l < 25) prefix = 'dark-';
  else if (l > 80) prefix = 'pale-';
  else if (l > 70) prefix = 'light-';
  else if (s < 35) prefix = 'muted-';
  else if (s > 75) prefix = 'vivid-';

  // Base color by hue
  let base;
  if (h >= 345 || h < 10) base = l < 35 ? 'burgundy' : l > 70 ? 'rose' : 'red';
  else if (h < 25) base = l < 40 ? 'rust' : l > 70 ? 'peach' : 'vermilion';
  else if (h < 40) base = l < 40 ? 'brown' : l > 70 ? 'apricot' : 'orange';
  else if (h < 55) base = l < 45 ? 'bronze' : s > 60 ? 'amber' : 'gold';
  else if (h < 70) base = l < 45 ? 'olive' : l > 75 ? 'lemon' : 'yellow';
  else if (h < 85) base = l < 45 ? 'moss' : 'chartreuse';
  else if (h < 100) base = l < 40 ? 'forest' : 'green';
  else if (h < 140) base = l < 35 ? 'hunter' : l > 70 ? 'mint' : s > 50 ? 'emerald' : 'sage';
  else if (h < 170) base = l < 40 ? 'dark-teal' : l > 70 ? 'aquamarine' : 'teal';
  else if (h < 195) base = l < 40 ? 'dark-cyan' : 'cyan';
  else if (h < 220) base = l < 40 ? 'prussian' : l > 70 ? 'sky' : 'cerulean';
  else if (h < 250) base = l < 35 ? 'navy' : l > 70 ? 'periwinkle' : 'blue';
  else if (h < 280) base = l < 35 ? 'indigo' : l > 70 ? 'lavender' : 'violet';
  else if (h < 310) base = l < 35 ? 'eggplant' : l > 70 ? 'lilac' : 'purple';
  else if (h < 330) base = l < 40 ? 'dark-magenta' : l > 70 ? 'orchid' : 'magenta';
  else base = l < 40 ? 'maroon' : l > 75 ? 'pink' : 'rose';

  // Avoid redundant prefixes
  if (prefix && base.includes(prefix.replace('-', ''))) return base;
  return prefix ? `${prefix}${base}` : base;
};

// ============================================
// NAMING SCHEMES
// ============================================

const NAMING_SCHEMES = {
  smart: (i, hexColors) => {
    const hsl = hexToHsl(hexColors[i]);
    return getColorName(hsl.h, hsl.s, hsl.l);
  },
  numbered: (i) => `color-${i + 1}`,
  semantic: (i) =>
    ['primary', 'secondary', 'tertiary', 'accent', 'highlight', 'muted', 'subtle', 'background', 'surface', 'border'][i] ||
    `color-${i + 1}`,
  palette: (i) =>
    ['base', 'light', 'dark', 'accent-1', 'accent-2', 'neutral-1', 'neutral-2', 'neutral-3', 'neutral-4', 'neutral-5'][i] ||
    `color-${i + 1}`,
};

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
  return ((Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)).toFixed(2);
};

function ExportPanel({
  isOpen,
  onClose,
  colors,
  generationMode,
  constraints,
  colorBlindMode,
}) {
  const [copiedOption, setCopiedOption] = useState(null);
  const [namingScheme, setNamingScheme] = useState('smart');
  const [showSettings, setShowSettings] = useState(false);
  const [cssFormat, setCssFormat] = useState('vars');
  const [tailwindFormat, setTailwindFormat] = useState('v4');
  const [applySimulation, setApplySimulation] = useState(false);

  const rawHexColors = colors.map((c) => c.hex);

  // Apply simulation if toggled AND a mode is selected
  const hexColors = useMemo(() => {
    if (applySimulation && colorBlindMode !== 'normal') {
      return rawHexColors.map(hex => simulateColorBlindness(hex, colorBlindMode));
    }
    return rawHexColors;
  }, [rawHexColors, applySimulation, colorBlindMode]);

  // Get color names for preview and exports
  const colorNames = useMemo(() => 
    hexColors.map(hex => {
      const hsl = hexToHsl(hex);
      return getColorName(hsl.h, hsl.s, hsl.l);
    }),
    [rawHexColors]
  );

  // Get name based on current scheme
  const getName = (i) => {
    if (namingScheme === 'smart') {
      return NAMING_SCHEMES.smart(i, rawHexColors);
    }
    return NAMING_SCHEMES[namingScheme](i);
  };

  const showCopied = (option) => {
    setCopiedOption(option);
    setTimeout(() => setCopiedOption(null), 2000);
  };

  const getColorData = () =>
    hexColors.map((hex, i) => {
      const hsl = hexToHsl(hex);
      const oklch = hexToOklch(hex);
      return {
        name: getName(i),
        colorName: colorNames[i],
        hex,
        rgb: {
          r: parseInt(hex.slice(1, 3), 16),
          g: parseInt(hex.slice(3, 5), 16),
          b: parseInt(hex.slice(5, 7), 16),
        },
        hsl: { h: Math.round(hsl.h), s: Math.round(hsl.s), l: Math.round(hsl.l) },
        hslString: `hsl(${Math.round(hsl.h)}, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%)`,
        oklch: {
          l: Number((oklch.L * 100).toFixed(1)),
          c: Number(oklch.C.toFixed(3)),
          h: Math.round(oklch.h),
        },
        oklchString: `oklch(${(oklch.L * 100).toFixed(1)}% ${oklch.C.toFixed(3)} ${Math.round(oklch.h)})`,
        contrastOnWhite: getContrastRatio(hex, '#FFFFFF'),
        contrastOnBlack: getContrastRatio(hex, '#000000'),
      };
    });

  const getTailwindDescription = () => {
    switch (tailwindFormat) {
      case 'v4': return 'CSS @theme (v4)';
      case 'v3-config': return 'Config extend (v3)';
      case 'v3-layer': return '@layer base (v3)';
      default: return 'Tailwind Config';
    }
  };

  const exportOptions = [
    {
      id: 'url',
      icon: Link,
      label: 'URL',
      description: 'Full state link',
      action: () => {
        const url = window.chromaAPI?.getShareUrl() || window.location.href;
        navigator.clipboard.writeText(url);
        showCopied('url');
      },
    },
    {
      id: 'css',
      icon: FileCode,
      label: 'CSS',
      description: cssFormat === 'vars' ? 'CSS Variables' : 'Utility Classes',
      action: () => {
        let css;
        if (cssFormat === 'vars') {
          css = `:root {\n${hexColors.map((c, i) => `  --${getName(i)}: ${c}; /* ${colorNames[i]} */`).join('\n')}\n}`;
        } else {
          css = hexColors
            .map((c, i) => `/* ${colorNames[i]} */\n.bg-${getName(i)} { background-color: ${c}; }\n.text-${getName(i)} { color: ${c}; }`)
            .join('\n\n');
        }
        navigator.clipboard.writeText(css);
        showCopied('css');
      },
    },
    {
      id: 'tailwind',
      icon: Wind,
      label: 'Tailwind',
      description: getTailwindDescription(),
      action: () => {
        let config;
        const getV4Name = (i) => getName(i).replace(/^color-/, '');
        
        if (tailwindFormat === 'v4') {
          config = `@import "tailwindcss";

@theme {
  /* Usage: bg-${getV4Name(0)}, text-${getV4Name(1)} */
${hexColors.map((c, i) => `  --color-${getV4Name(i)}: ${c}; /* ${colorNames[i]} */`).join('\n')}
}`;
        } else if (tailwindFormat === 'v3-config') {
          config = `// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
${hexColors.map((c, i) => `        '${getName(i)}': '${c}', // ${colorNames[i]}`).join('\n')}
      },
    },
  },
}`;
        } else {
          config = `/* Add to your CSS */
@layer base {
  :root {
${hexColors.map((c, i) => `    --${getName(i)}: ${c}; /* ${colorNames[i]} */`).join('\n')}
  }
}

/* tailwind.config.js */
module.exports = {
  theme: {
    extend: {
      colors: {
${hexColors.map((c, i) => `        '${getName(i)}': 'var(--${getName(i)})',`).join('\n')}
      },
    },
  },
}`;
        }
        navigator.clipboard.writeText(config);
        showCopied('tailwind');
      },
    },
    {
      id: 'scss',
      icon: Code,
      label: 'SCSS',
      description: 'Variables + Map',
      action: () => {
        const scss = `// Individual variables
${hexColors.map((c, i) => `$${getName(i)}: ${c}; // ${colorNames[i]}`).join('\n')}

// As a map
$palette: (
${hexColors.map((c, i) => `  '${getName(i)}': ${c}, // ${colorNames[i]}`).join('\n')}
);`;
        navigator.clipboard.writeText(scss);
        showCopied('scss');
      },
    },
    {
      id: 'json',
      icon: Braces,
      label: 'JSON',
      description: 'Full metadata',
      action: () => {
        const data = {
          palette: getColorData(),
          settings: {
            harmony: generationMode || 'auto',
            mood: constraints?.mood || 'any',
            minContrast: constraints?.minContrast || 1.5,
            darkModeFriendly: constraints?.darkModeFriendly || false,
          },
          generated: new Date().toISOString(),
          source: 'ccolorpalette.com',
        };
        navigator.clipboard.writeText(JSON.stringify(data, null, 2));
        showCopied('json');
      },
    },
    {
      id: 'tokens',
      icon: FileJson,
      label: 'Tokens',
      description: 'Design tokens',
      action: () => {
        const tokens = {
          color: {
            palette: hexColors.reduce((acc, hex, i) => {
              acc[getName(i)] = {
                $value: hex,
                $type: 'color',
                $description: colorNames[i],
              };
              return acc;
            }, {}),
          },
        };
        navigator.clipboard.writeText(JSON.stringify(tokens, null, 2));
        showCopied('tokens');
      },
    },
    {
      id: 'array',
      icon: Code,
      label: 'JS/TS',
      description: 'Typed object',
      action: () => {
        const obj = `export const palette = {
${hexColors.map((c, i) => {
  const key = getName(i).replace(/-([a-z])/g, (_, l) => l.toUpperCase());
  return `  /** ${colorNames[i]} */\n  ${key}: '${c}',`;
}).join('\n')}
} as const;

export type PaletteKey = keyof typeof palette;`;
        navigator.clipboard.writeText(obj);
        showCopied('array');
      },
    },
    {
      id: 'svg',
      icon: FileCode,
      label: 'SVG',
      description: 'Vector graphic',
      action: () => {
        const width = 1200;
        const height = 630;
        const colorWidth = width / hexColors.length;

        const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">
  <title>${colorNames.join(', ')} Color Palette</title>
${hexColors.map((c, i) => `  <rect x="${i * colorWidth}" y="0" width="${colorWidth}" height="${height}" fill="${c}"/>`).join('\n')}
${hexColors.map((c, i) => {
  const hsl = hexToHsl(c);
  const textColor = hsl.l > 55 ? '#000000' : '#FFFFFF';
  const x = i * colorWidth + colorWidth / 2;
  return `  <text x="${x}" y="${height - 50}" text-anchor="middle" fill="${textColor}" font-family="system-ui, sans-serif" font-size="14">${colorNames[i]}</text>
  <text x="${x}" y="${height - 26}" text-anchor="middle" fill="${textColor}" font-family="monospace" font-size="16" font-weight="bold">${c}</text>`;
}).join('\n')}
</svg>`;

        const blob = new Blob([svg], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `palette-${Date.now()}.svg`;
        a.click();
        URL.revokeObjectURL(url);
        showCopied('svg');
      },
    },
    {
      id: 'png',
      icon: Image,
      label: 'PNG',
      description: 'Social preview',
      action: () => {
        const canvas = document.createElement('canvas');
        canvas.width = 1200;
        canvas.height = 630;
        const ctx = canvas.getContext('2d');
        const colorWidth = canvas.width / hexColors.length;

        hexColors.forEach((color, i) => {
          ctx.fillStyle = color;
          ctx.fillRect(i * colorWidth, 0, colorWidth, canvas.height);
        });

        ctx.textAlign = 'center';
        hexColors.forEach((color, i) => {
          const hsl = hexToHsl(color);
          const textColor = hsl.l > 55 ? '#000000' : '#FFFFFF';
          const x = i * colorWidth + colorWidth / 2;

          // Color name
          ctx.font = '500 14px system-ui, sans-serif';
          ctx.fillStyle = textColor;
          ctx.fillText(colorNames[i], x, canvas.height - 50);

          // Hex code
          ctx.font = 'bold 16px monospace';
          ctx.fillText(color, x, canvas.height - 26);
        });

        ctx.font = '12px sans-serif';
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.textAlign = 'right';
        ctx.fillText('ccolorpalette.com', canvas.width - 20, canvas.height - 12);

        canvas.toBlob((blob) => {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `palette-${Date.now()}.png`;
          a.click();
          URL.revokeObjectURL(url);
        });
        showCopied('png');
      },
    },
  ];

  return (
    <div
      className={`panel-column ${isOpen ? 'open' : ''}`}
      style={{ flexBasis: isOpen ? `${PANEL_WIDTH}px` : '0px' }}
    >
      <div className="panel-inner" style={{ width: `${PANEL_WIDTH}px` }}>
        <div className="panel-header">
          <div className="panel-title">
            <span>Export Palette</span>
          </div>
          <button className="panel-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="panel-scroll">
          {/* Settings Toggle */}
          <button
            className={`export-settings-toggle ${showSettings ? 'active' : ''}`}
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings2 size={16} />
            <span>Export Settings</span>
            <ChevronDown size={16} className={`chevron ${showSettings ? 'open' : ''}`} />
          </button>

          {/* Settings Panel */}
          {showSettings && (
            <div className="export-settings">
              <div className="export-setting">
                <label>Naming Scheme</label>
                <div className="export-setting-options">
                  {Object.keys(NAMING_SCHEMES).map((scheme) => (
                    <button
                      key={scheme}
                      className={`panel-btn ${namingScheme === scheme ? 'active' : ''}`}
                      onClick={() => setNamingScheme(scheme)}
                    >
                      {scheme.charAt(0).toUpperCase() + scheme.slice(1)}
                    </button>
                  ))}
                </div>
                <span className="export-setting-preview">
                  e.g., {getName(0)}, {getName(1)}
                </span>
              </div>

              <div className="export-setting">
                <label>CSS Format</label>
                <div className="export-setting-options two-col">
                  <button
                    className={`panel-btn ${cssFormat === 'vars' ? 'active' : ''}`}
                    onClick={() => setCssFormat('vars')}
                  >
                    Variables
                  </button>
                  <button
                    className={`panel-btn ${cssFormat === 'classes' ? 'active' : ''}`}
                    onClick={() => setCssFormat('classes')}
                  >
                    Classes
                  </button>
                </div>
              </div>

              <div className="export-setting">
                <label>Tailwind Version</label>
                <div className="export-setting-options three-col">
                  <button
                    className={`panel-btn ${tailwindFormat === 'v4' ? 'active' : ''}`}
                    onClick={() => setTailwindFormat('v4')}
                    title="CSS @theme variable configuration"
                  >
                    v4 CSS
                  </button>
                  <button
                    className={`panel-btn ${tailwindFormat === 'v3-config' ? 'active' : ''}`}
                    onClick={() => setTailwindFormat('v3-config')}
                    title="Legacy JS config"
                  >
                    v3 Config
                  </button>
                  <button
                    className={`panel-btn ${tailwindFormat === 'v3-layer' ? 'active' : ''}`}
                    onClick={() => setTailwindFormat('v3-layer')}
                    title="Legacy @layer base"
                  >
                    v3 Layer
                  </button>
                </div>
              </div>

              {colorBlindMode !== 'normal' && (
                <div className="export-setting">
                  <label>Vision Simulation</label>
                  <div className="export-setting-options two-col">
                    <button
                      className={`panel-btn ${!applySimulation ? 'active' : ''}`}
                      onClick={() => setApplySimulation(false)}
                    >
                      Original
                    </button>
                    <button
                      className={`panel-btn ${applySimulation ? 'active' : ''}`}
                      onClick={() => {
                        setApplySimulation(true);
                        trackEvent('enable_colorblind_export', { mode: colorBlindMode });
                      }}
                    >
                      Simulated
                    </button>
                  </div>
                  {applySimulation && (
                    <span className="export-setting-preview">
                      Exporting for: {colorBlindMode.charAt(0).toUpperCase() + colorBlindMode.slice(1)}
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Export Grid */}
          <div className="panel-export-grid">
            {exportOptions.map((option) => {
              const Icon = option.icon;
              const isCopied = copiedOption === option.id;

              return (
                <button
                  key={option.id}
                  className={`panel-export-btn ${isCopied ? 'copied' : ''}`}
                  onClick={(e) => {
                    trackEvent('palette_export', { 
                      format: option.id, 
                      tailwind_version: tailwindFormat,
                      naming_scheme: namingScheme 
                    });
                    const currentUrl = window.location.href;
                    submitToIndexNow(currentUrl);
                    option.action();
                    e.currentTarget.blur();
                  }}
                >
                  <div className="panel-export-btn-icon">
                    {isCopied ? <Check size={24} /> : <Icon size={24} />}
                  </div>
                  <span className="panel-export-btn-label">
                    {isCopied ? 'Done!' : option.label}
                  </span>
                  <span className="panel-export-btn-desc">{option.description}</span>
                </button>
              );
            })}
          </div>

          {/* Preview */}
          <div className="panel-preview">
            <label className="panel-label">Preview</label>
            <div className="panel-preview-colors">
              {hexColors.map((color, i) => (
                <div
                  key={i}
                  className="panel-preview-color"
                  style={{ backgroundColor: color }}
                  title={`${colorNames[i]} (${rawHexColors[i]})`}  // <-- Use rawHexColors for the hex in tooltip
                />
              ))}
            </div>
            <div className="panel-preview-names">
              {colorNames.map((name, i) => (
                <span key={i} className="panel-preview-name">
                  {name}
                </span>
              ))}
            </div>
            <div className="panel-preview-hexes">
              {hexColors.map((color, i) => (
                <span key={i} className="panel-preview-hex">
                  {color.replace('#', '')}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExportPanel;