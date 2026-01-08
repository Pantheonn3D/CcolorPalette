import { X, Eye, Check, AlertTriangle } from 'lucide-react';
import '../styles/PanelStyles.css';
import { trackEvent } from '../utils/analytics';

const PANEL_WIDTH = 280;

const COLOR_BLIND_MODES = [
  { id: 'normal', label: 'Normal Vision' },
  { id: 'protanopia', label: 'Protanopia (Red-Blind)' },
  { id: 'deuteranopia', label: 'Deuteranopia (Green-Blind)' },
  { id: 'tritanopia', label: 'Tritanopia (Blue-Blind)' },
  { id: 'achromatopsia', label: 'Achromatopsia (Monochrome)' },
];

const getLuminance = (hex) => {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const toLinear = (c) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);

  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
};

const getContrastRatio = (hex1, hex2) => {
  const l1 = getLuminance(hex1);
  const l2 = getLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
};

const getWCAGRating = (ratio) => {
  if (ratio >= 7) return { level: 'AAA', pass: true };
  if (ratio >= 4.5) return { level: 'AA', pass: true };
  if (ratio >= 3) return { level: 'AA+', pass: true };
  return { level: 'Fail', pass: false };
};

function AccessibilityPanel({
  isOpen,
  onClose,
  colors,
  colorBlindMode,
  onColorBlindModeChange,
}) {
  return (
    <div
      className={`panel-column ${isOpen ? 'open' : ''}`}
      style={{ flexBasis: isOpen ? `${PANEL_WIDTH}px` : '0px' }}
    >
      <div className="panel-inner" style={{ width: `${PANEL_WIDTH}px` }}>
        <div className="panel-header">
          <div className="panel-title">
            <Eye size={18} />
            <span>Accessibility</span>
          </div>
          <button className="panel-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="panel-scroll">
          {/* Color Vision Simulation */}
          <div className="panel-section">
            <label className="panel-label">Color Vision Simulation</label>
            <div className="panel-list">
              {COLOR_BLIND_MODES.map((mode) => (
                <button
                  key={mode.id}
                  className={`panel-list-item ${colorBlindMode === mode.id ? 'selected' : ''}`} // RE-ADD THIS
                  onClick={(e) => {
                    trackEvent('view_vision_simulation', { mode: mode.id });
                    onColorBlindModeChange(mode.id);
                    e.currentTarget.blur();
                  }}
                >
                  <span className="panel-list-item-title">{mode.label}</span>
                  {colorBlindMode === mode.id && <div className="panel-check" />}
                </button>
              ))}
            </div>
          </div>

          {/* Text Contrast */}
          <div className="panel-section">
            <label className="panel-label">Text Contrast (on each color)</label>
            <div className="panel-list">
              {colors.map((color) => {
                const whiteRatio = getContrastRatio(color.hex, '#FFFFFF');
                const blackRatio = getContrastRatio(color.hex, '#000000');
                const bestColor = whiteRatio > blackRatio ? '#FFFFFF' : '#000000';
                const bestRatio = Math.max(whiteRatio, blackRatio);
                const rating = getWCAGRating(bestRatio);

                return (
                  <div key={color.id} className="panel-contrast-item">
                    <div
                      className="panel-contrast-swatch"
                      style={{ backgroundColor: color.hex, color: bestColor }}
                    >
                      Aa
                    </div>
                    <div className="panel-contrast-info">
                      <span className="panel-contrast-hex">{color.hex}</span>
                      <span className="panel-contrast-ratio">
                        {bestRatio.toFixed(1)}:1
                      </span>
                    </div>
                    <div className={`panel-badge ${rating.pass ? 'pass' : 'fail'}`}>
                      {rating.pass ? <Check size={12} /> : <AlertTriangle size={12} />}
                      {rating.level}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Adjacent Color Contrast */}
          <div className="panel-section">
            <label className="panel-label">Adjacent Color Contrast</label>
            <div className="panel-list">
              {colors.slice(0, -1).map((color, i) => {
                const nextColor = colors[i + 1];
                const ratio = getContrastRatio(color.hex, nextColor.hex);
                const pass = ratio >= 3;

                return (
                  <div key={color.id} className="panel-adjacent-item">
                    <div className="panel-adjacent-swatches">
                      <div style={{ backgroundColor: color.hex }} />
                      <div style={{ backgroundColor: nextColor.hex }} />
                    </div>
                    <span className="panel-adjacent-ratio">
                      {ratio.toFixed(1)}:1
                    </span>
                    <div className={`panel-badge ${pass ? 'pass' : 'fail'}`}>
                      {pass ? <Check size={12} /> : <AlertTriangle size={12} />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AccessibilityPanel;