import { useState } from 'react';
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
import { hexToHsl } from '../utils/colorUtils';
import '../styles/PanelStyles.css';
import './ExportPanel.css';

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
}) {
  const [copiedOption, setCopiedOption] = useState(null);
  const [namingScheme, setNamingScheme] = useState('numbered');
  const [showSettings, setShowSettings] = useState(false);
  const [cssFormat, setCssFormat] = useState('vars');
  const [tailwindFormat, setTailwindFormat] = useState('v4');

  const hexColors = colors.map((c) => c.hex);
  const getName = NAMING_SCHEMES[namingScheme];

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
        const width = 1200;
        const height = 630;
        const colorWidth = width / hexColors.length;

        const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">
${hexColors.map((c, i) => `  <rect x="${i * colorWidth}" y="0" width="${colorWidth}" height="${height}" fill="${c}"/>`).join('\n')}
${hexColors.map((c, i) => {
  const hsl = hexToHsl(c);
  const textColor = hsl.l > 60 ? '#000000' : '#FFFFFF';
  const x = i * colorWidth + colorWidth / 2;
  return `  <text x="${x}" y="${height - 30}" text-anchor="middle" fill="${textColor}" font-family="monospace" font-size="14" font-weight="bold">${c}</text>`;
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

        ctx.font = 'bold 16px monospace';
        ctx.textAlign = 'center';
        hexColors.forEach((color, i) => {
          const hsl = hexToHsl(color);
          ctx.fillStyle = hsl.l > 60 ? '#000000' : '#FFFFFF';
          const x = i * colorWidth + colorWidth / 2;
          ctx.fillText(color, x, canvas.height - 30);
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