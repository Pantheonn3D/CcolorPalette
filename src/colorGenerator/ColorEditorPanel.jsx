import { useState, useEffect } from 'react';
import { X, Sun, Moon, Flame, Snowflake, Pipette } from 'lucide-react';
import { hexToHsl, hslToHex } from '../utils/colorUtils';
import './ColorEditorPanel.css';

function ColorEditorPanel({ isOpen, onClose, color, onColorChange }) {
  const [hsl, setHsl] = useState({ h: 0, s: 50, l: 50 });
  const [hexInput, setHexInput] = useState('');

  useEffect(() => {
    if (color?.hex) {
      const converted = hexToHsl(color.hex);
      setHsl(converted);
      setHexInput(color.hex.replace('#', ''));
    }
  }, [color?.hex]);

  const updateColor = (newHsl) => {
    const clamped = {
      h: ((newHsl.h % 360) + 360) % 360,
      s: Math.max(0, Math.min(100, newHsl.s)),
      l: Math.max(0, Math.min(100, newHsl.l)),
    };
    setHsl(clamped);
    const newHex = hslToHex(clamped.h, clamped.s, clamped.l);
    setHexInput(newHex.replace('#', ''));
    onColorChange(color.id, newHex);
  };

  const handleHexInput = (value) => {
    setHexInput(value);
    if (/^[0-9A-Fa-f]{6}$/.test(value)) {
      const hex = `#${value.toUpperCase()}`;
      const converted = hexToHsl(hex);
      setHsl(converted);
      onColorChange(color.id, hex);
    }
  };

  const adjustments = [
    {
      icon: Sun,
      label: 'Lighter',
      action: () => updateColor({ ...hsl, l: hsl.l + 10 }),
    },
    {
      icon: Moon,
      label: 'Darker',
      action: () => updateColor({ ...hsl, l: hsl.l - 10 }),
    },
    {
      icon: Flame,
      label: 'Warmer',
      action: () => updateColor({ ...hsl, h: hsl.h - 15 }),
    },
    {
      icon: Snowflake,
      label: 'Cooler',
      action: () => updateColor({ ...hsl, h: hsl.h + 15 }),
    },
    {
      icon: Pipette,
      label: 'Saturate',
      action: () => updateColor({ ...hsl, s: hsl.s + 15 }),
    },
  ];

  if (!color) return null;

  return (
    <div className={`editor-column ${isOpen ? 'open' : ''}`}>
      <div className="editor-inner">
        <div className="editor-header">
          <span className="editor-title">Edit Color</span>
          <button className="editor-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="editor-scroll">
          {/* Color Preview */}
          <div
            className="editor-preview"
            style={{ backgroundColor: color.hex }}
          >
            <span
              className="editor-preview-hex"
              style={{ color: hsl.l > 60 ? '#000' : '#fff' }}
            >
              {color.hex}
            </span>
          </div>

          {/* Hex Input */}
          <div className="editor-field">
            <label>Hex</label>
            <div className="editor-hex-input">
              <span>#</span>
              <input
                type="text"
                value={hexInput}
                onChange={(e) => handleHexInput(e.target.value.toUpperCase())}
                maxLength={6}
                spellCheck={false}
              />
            </div>
          </div>

          {/* HSL Sliders */}
          <div className="editor-field">
            <label>
              Hue <span>{Math.round(hsl.h)}°</span>
            </label>
            <input
              type="range"
              min="0"
              max="360"
              value={hsl.h}
              onChange={(e) =>
                updateColor({ ...hsl, h: Number(e.target.value) })
              }
              className="slider slider-hue"
            />
          </div>

          <div className="editor-field">
            <label>
              Saturation <span>{Math.round(hsl.s)}%</span>
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={hsl.s}
              onChange={(e) =>
                updateColor({ ...hsl, s: Number(e.target.value) })
              }
              className="slider slider-saturation"
              style={{
                '--sat-color': hslToHex(hsl.h, 100, 50),
              }}
            />
          </div>

          <div className="editor-field">
            <label>
              Lightness <span>{Math.round(hsl.l)}%</span>
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={hsl.l}
              onChange={(e) =>
                updateColor({ ...hsl, l: Number(e.target.value) })
              }
              className="slider slider-lightness"
              style={{
                '--light-mid': hslToHex(hsl.h, hsl.s, 50),
              }}
            />
          </div>

          {/* Quick Adjustments */}
          <div className="editor-adjustments">
            <label>Quick Adjust</label>
            <div className="adjustment-buttons">
              {adjustments.map((adj) => (
                <button
                  key={adj.label}
                  className="adjustment-btn"
                  onClick={adj.action}
                  title={adj.label}
                >
                  <adj.icon size={16} />
                  <span>{adj.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ColorEditorPanel;
