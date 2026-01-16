import { X, Sparkles } from 'lucide-react';
import '../styles/PanelStyles.css';
import { trackEvent } from '../utils/analytics';

const HARMONY_MODES = [
  { id: 'auto', label: 'Auto', description: 'Random harmony' },
  { id: 'mono', label: 'Monochromatic', description: 'Single hue variations' },
  { id: 'analogous', label: 'Analogous', description: 'Adjacent hues' },
  { id: 'complementary', label: 'Complementary', description: 'Opposite hues' },
  { id: 'splitComplementary', label: 'Split Comp.', description: 'Opposite + adjacent' },
  { id: 'triadic', label: 'Triadic', description: 'Three-way split' },
];

const MOOD_OPTIONS = [
  { id: 'any', label: 'Any' },
  { id: 'vibrant', label: 'Vibrant' },
  { id: 'bright', label: 'Bright' },
  { id: 'pastel', label: 'Pastel' },
  { id: 'soft', label: 'Soft' },
  { id: 'muted', label: 'Muted' },
  { id: 'moody', label: 'Moody' },
  { id: 'dark', label: 'Dark' },
  { id: 'warm', label: 'Warm' },
  { id: 'cool', label: 'Cool' },
  { id: 'earthy', label: 'Earthy' },
  { id: 'playful', label: 'Playful' },
  { id: 'elegant', label: 'Elegant' },
  { id: 'retro', label: 'Retro' },
  { id: 'neon', label: 'Neon' },
];

const PANEL_WIDTH = 280;

function MethodPanel({
  isOpen,
  onClose,
  value,
  onChange,
  constraints,
  onConstraintsChange,
}) {
  const handleMoodChange = (mood) => {
    trackEvent('change_mood', { mood });
    onConstraintsChange({ ...constraints, mood });
  };

  return (
    <div
      className={`panel-column ${isOpen ? 'open' : ''}`}
      style={{ flexBasis: isOpen ? `${PANEL_WIDTH}px` : '0px' }}
    >
      <div className="panel-inner" style={{ width: `${PANEL_WIDTH}px` }}>
        <div className="panel-header">
          <div className="panel-title">
            <Sparkles size={18} />
            <span>Method</span>
          </div>
          <button className="panel-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="panel-scroll">
          {/* Harmony */}
          <div className="panel-section">
            <label className="panel-label">Harmony</label>
            <div className="panel-list">
              {HARMONY_MODES.map((mode) => (
                <button
                  key={mode.id}
                  className={`panel-list-item ${value === mode.id ? 'selected' : ''}`}
                  onClick={(e) => {
                    trackEvent('change_harmony', { mode: mode.id });
                    onChange(mode.id);
                    e.currentTarget.blur();
                  }}
                >
                  <div className="panel-list-item-content">
                    <span className="panel-list-item-title">{mode.label}</span>
                    <span className="panel-list-item-desc">{mode.description}</span>
                  </div>
                  {value === mode.id && <div className="panel-check" />}
                </button>
              ))}
            </div>
          </div>

          {/* Mood */}
          <div className="panel-section">
            <label className="panel-label">Mood</label>
            <div className="panel-btn-grid mood-grid">
              {MOOD_OPTIONS.map((mood) => (
                <button
                  key={mood.id}
                  className={`panel-btn ${constraints.mood === mood.id ? 'active' : ''}`}
                  onClick={(e) => {
                    handleMoodChange(mood.id);
                    e.currentTarget.blur();
                  }}
                >
                  {mood.label}
                </button>
              ))}
            </div>
          </div>

          {/* Contrast */}
          <div className="panel-section">
            <label className="panel-label">
              Min Adjacent Contrast
              <span>{constraints.minContrast.toFixed(1)}:1</span>
            </label>
            <input
              type="range"
              min="1"
              max="4.5"
              step="0.1"
              value={constraints.minContrast}
              onChange={(e) => onConstraintsChange({ ...constraints, minContrast: Number(e.target.value) })}
              className="panel-slider"
            />
            <div className="panel-slider-labels">
              <span>Low</span>
              <span>High</span>
            </div>
          </div>

          {/* Dark Mode */}
          <div className="panel-section">
            <button
              className={`panel-toggle ${constraints.darkModeFriendly ? 'active' : ''}`}
              onClick={(e) => {
                onConstraintsChange({ ...constraints, darkModeFriendly: !constraints.darkModeFriendly });
                e.currentTarget.blur();
              }}
            >
              <span className="panel-toggle-indicator" />
              <span>Dark mode friendly</span>
            </button>
            <p className="panel-hint">
              Ensures colors work well on dark backgrounds
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MethodPanel;