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
} from 'lucide-react';
import { hexToHsl, simulateColorBlindness } from '../utils/colorUtils';
import '../styles/PanelStyles.css';
import './ExportPanel.css';
import { trackEvent } from '../utils/analytics';
import { submitToIndexNow } from '../utils/seo';

const PANEL_WIDTH = 320;

const NAMING_SCHEMES = {
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
  const [namingScheme, setNamingScheme] = useState('numbered');
  const [showSettings, setShowSettings] = useState(false);
  const [cssFormat, setCssFormat] = useState('vars');
  const [tailwindFormat, setTailwindFormat] = useState('v4');

  // ADD THIS LINE HERE (Ensure it is above the useMemo)
  const [applySimulation, setApplySimulation] = useState(false);

  const rawHexColors = colors.map((c) => c.hex);
  const getName = NAMING_SCHEMES[namingScheme];

  // Apply simulation if toggled AND a mode is selected
  const hexColors = useMemo(() => {
    if (applySimulation && colorBlindMode !== 'normal') {
      return rawHexColors.map(hex => simulateColorBlindness(hex, colorBlindMode));
    }
    return rawHexColors;
  }, [rawHexColors, applySimulation, colorBlindMode]);

  const showCopied = (option) => {
    setCopiedOption(option);
    setTimeout(() => setCopiedOption(null), 2000);
  };

  const getColorData = () =>
    hexColors.map((hex, i) => {
      const hsl = hexToHsl(hex);
      return {
        name: getName(i),
        hex,
        hsl: { h: Math.round(hsl.h), s: Math.round(hsl.s), l: Math.round(hsl.l) },
        hslString: `hsl(${Math.round(hsl.h)}, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%)`,
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
          css = `:root {\n${hexColors.map((c, i) => `  --${getName(i)}: ${c};`).join('\n')}\n}`;
        } else {
          css = hexColors
            .map((c, i) => `.bg-${getName(i)} { background-color: ${c}; }\n.text-${getName(i)} { color: ${c}; }`)
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
        
        if (tailwindFormat === 'v4') {
          // Tailwind v4 CSS-first configuration
          // HELPER: Strip "color-" prefix if present to avoid "--color-color-1"
          const getV4Name = (i) => getName(i).replace(/^color-/, '');
          
          config = `@import "tailwindcss";

@theme {
  /* Usage: bg-${getV4Name(0)}, text-${getV4Name(1)} */
${hexColors.map((c, i) => `  --color-${getV4Name(i)}: ${c};`).join('\n')}
}`;
        } else if (tailwindFormat === 'v3-config') {
          // Tailwind v3 JS Configuration
          config = `// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
${hexColors.map((c, i) => `        '${getName(i)}': '${c}',`).join('\n')}
      },
    },
  },
}`;
        } else {
          // Tailwind v3 CSS Variables + Config
          config = `/* Add to your CSS */
@layer base {
  :root {
${hexColors.map((c, i) => `    --${getName(i)}: ${c};`).join('\n')}
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
${hexColors.map((c, i) => `$${getName(i)}: ${c};`).join('\n')}

// As a map
$palette: (
${hexColors.map((c, i) => `  '${getName(i)}': ${c},`).join('\n')}
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
        };
        navigator.clipboard.writeText(JSON.stringify(data, null, 2));
        showCopied('json');
      },
    },
    {
      id: 'array',
      icon: Code,
      label: 'JS Object',
      description: 'Named object',
      action: () => {
        const obj = `const palette = {\n${hexColors
          .map((c, i) => `  ${getName(i).replace(/-/g, '_')}: '${c}',`)
          .join('\n')}\n};`;
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
        if (!hexColors?.length) return;
    
        const width = 1200;
        const height = 630;
        const colorWidth = width / hexColors.length;
        const cornerRadius = 16;
    
        const lastColor = hexColors[hexColors.length - 1] || '#000000';
        const lastHsl = hexToHsl(lastColor);
        const wmIsLight = lastHsl.l > 55;
        const wmFill = wmIsLight ? '#000000' : '#FFFFFF';
        const wmFillOpacity = wmIsLight ? '0.80' : '0.95';
        const wmStroke = wmIsLight ? '#FFFFFF' : '#000000';
        const wmStrokeOpacity = '0.25';
    
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <defs>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@500;600;700&amp;display=swap');
          .hex-label {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            font-weight: 600;
            letter-spacing: 0.05em;
          }
          .watermark {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            font-weight: 500;
          }
        </style>
        ${
          cornerRadius > 0
            ? `<clipPath id="rounded" clipPathUnits="userSpaceOnUse">
          <rect x="0" y="0" width="${width}" height="${height}" rx="${cornerRadius}" ry="${cornerRadius}" />
        </clipPath>`
            : ''
        }
      </defs>
    
      <g ${cornerRadius > 0 ? 'clip-path="url(#rounded)"' : ''}>
    ${hexColors
      .map(
        (c, i) =>
          `    <rect x="${i * colorWidth}" y="0" width="${colorWidth + 1}" height="${height}" fill="${c}" shape-rendering="crispEdges"/>`
      )
      .join('\n')}
    
    ${hexColors
      .map((c, i) => {
        const hsl = hexToHsl(c);
        const isLight = hsl.l > 55;
    
        const textFill = isLight ? '#000000' : '#FFFFFF';
        const textOpacity = isLight ? '0.85' : '0.95';
        const textStroke = isLight ? '#FFFFFF' : '#000000';
        const textStrokeOpacity = '0.18';
    
        const x = i * colorWidth + colorWidth / 2;
        const hexText = c.replace('#', '');
    
        return `    <text
          x="${x}"
          y="${height / 2 + 8}"
          text-anchor="middle"
          class="hex-label"
          font-size="32"
          fill="${textFill}"
          fill-opacity="${textOpacity}"
          stroke="${textStroke}"
          stroke-opacity="${textStrokeOpacity}"
          stroke-width="3"
          paint-order="stroke fill"
        >${hexText}</text>`;
      })
      .join('\n')}
    
        <text
          x="${width - 24}"
          y="${height - 20}"
          text-anchor="end"
          class="watermark"
          font-size="24"
          fill="${wmFill}"
          fill-opacity="${wmFillOpacity}"
          stroke="${wmStroke}"
          stroke-opacity="${wmStrokeOpacity}"
          stroke-width="4"
          paint-order="stroke fill"
        >ccolorpalette.com</text>
      </g>
    </svg>`;
    
        const blob = new Blob([svg], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `palette-${hexColors.map(c => c.replace('#', '')).join('-')}.svg`;
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
      action: async () => {
        if (!hexColors?.length) return;
    
        const canvas = document.createElement('canvas');
        const scale = 2;
        canvas.width = 1200 * scale;
        canvas.height = 630 * scale;
    
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
    
        ctx.scale(scale, scale);
    
        const width = 1200;
        const height = 630;
        const colorWidth = width / hexColors.length;
    
        // Draw color blocks
        hexColors.forEach((color, i) => {
          ctx.fillStyle = color;
          ctx.fillRect(i * colorWidth, 0, colorWidth + 1, height);
        });
    
        // Load font before drawing text
        try {
          await document.fonts.load('600 32px "Inter"');
          await document.fonts.load('500 24px "Inter"');
        } catch (e) {
          // fallback fonts will be used
        }
    
        // Draw hex labels
        hexColors.forEach((color, i) => {
          const hsl = hexToHsl(color);
          const isLight = hsl.l > 55;
    
          const x = i * colorWidth + colorWidth / 2;
          const y = height / 2;
          const hexText = color.replace('#', '');
    
          ctx.font = '600 32px Inter, -apple-system, BlinkMacSystemFont, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
    
          // subtle outline for contrast
          ctx.lineWidth = 6;
          ctx.strokeStyle = isLight ? 'rgba(255, 255, 255, 0.18)' : 'rgba(0, 0, 0, 0.18)';
          ctx.strokeText(hexText, x, y);
    
          ctx.fillStyle = isLight ? 'rgba(0, 0, 0, 0.85)' : 'rgba(255, 255, 255, 0.95)';
          ctx.fillText(hexText, x, y);
        });
    
        // Watermark that adapts to the last swatch
        const lastColor = hexColors[hexColors.length - 1] || '#000000';
        const lastHsl = hexToHsl(lastColor);
        const wmIsLight = lastHsl.l > 55;
    
        const wmX = width - 32;
        const wmY = height - 28;
    
        ctx.font = '500 24px Inter, -apple-system, BlinkMacSystemFont, sans-serif';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'bottom';
    
        ctx.lineWidth = 6;
        ctx.strokeStyle = wmIsLight ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 0, 0, 0.25)';
        ctx.strokeText('ccolorpalette.com', wmX, wmY);
    
        ctx.fillStyle = wmIsLight ? 'rgba(0, 0, 0, 0.80)' : 'rgba(255, 255, 255, 0.95)';
        ctx.fillText('ccolorpalette.com', wmX, wmY);
    
        canvas.toBlob((blob) => {
          if (!blob) return;
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `palette-${hexColors.map(c => c.replace('#', '')).join('-')}.png`;
          a.click();
          URL.revokeObjectURL(url);
        }, 'image/png');
    
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
                <div className="export-setting-options">
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
              <div className="export-setting">
                <label>Vision Simulation</label>
                <div className="export-setting-options">
                  <button
                    className={`panel-btn ${!applySimulation ? 'active' : ''}`}
                    onClick={() => setApplySimulation(false)}
                  >
                    Raw Colors
                  </button>
                  <button
                    className={`panel-btn ${applySimulation ? 'active' : ''}`}
                    onClick={() => {
                      setApplySimulation(true);
                      trackEvent('enable_colorblind_export', { mode: colorBlindMode });
                    }}
                    // Grey out and disable if vision mode is normal
                    disabled={colorBlindMode === 'normal'}
                    style={{ 
                      opacity: colorBlindMode === 'normal' ? 0.5 : 1,
                    }}
                    title={colorBlindMode === 'normal' ? 'Select a vision mode in Accessibility panel first' : ''}
                  >
                    Simulated
                  </button>
                </div>
                {applySimulation && colorBlindMode !== 'normal' && (
                  <span className="export-setting-preview">
                    Exporting for: {colorBlindMode.charAt(0).toUpperCase() + colorBlindMode.slice(1)}
                  </span>
                )}
              </div>
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
                />
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