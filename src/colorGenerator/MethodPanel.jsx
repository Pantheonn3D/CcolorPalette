import { X, Sparkles } from 'lucide-react';
import '../styles/PanelStyles.css';

const modes = [
  { id: 'auto', label: 'Auto', description: 'Random harmony' },
  { id: 'mono', label: 'Monochromatic', description: 'Single hue variations' },
  { id: 'analogous', label: 'Analogous', description: 'Adjacent hues' },
  { id: 'complementary', label: 'Complementary', description: 'Opposite hues' },
  {
    id: 'splitComplementary',
    label: 'Split Comp.',
    description: 'Opposite + adjacent',
  },
  { id: 'triadic', label: 'Triadic', description: 'Three-way split' },
];

const moods = [
  { id: 'any', label: 'Any' },
  { id: 'muted', label: 'Muted' },
  { id: 'pastel', label: 'Pastel' },
  { id: 'vibrant', label: 'Vibrant' },
  { id: 'dark', label: 'Dark' },
];

function MethodPanel({
  isOpen,
  onClose,
  value,
  onChange,
  constraints,
  onConstraintsChange,
}) {
  return (
    <div
      className={`panel-column ${isOpen ? 'open' : ''}`}
      style={{ flexBasis: isOpen ? '240px' : '0px' }}
    >
      <div className="panel-inner" style={{ width: '240px' }}>
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
          <div className="panel-section">
            <label className="panel-label">Harmony</label>
            <div className="panel-list">
              {modes.map((mode) => (
                <button
                  key={mode.id}
                  className={`panel-list-item ${
                    value === mode.id ? 'selected' : ''
                  }`}
                  onClick={(e) => {
                    onChange(mode.id);
                    e.currentTarget.blur();
                  }}
                >
                  <div className="panel-list-item-content">
                    <span className="panel-list-item-title">{mode.label}</span>
                    <span className="panel-list-item-desc">
                      {mode.description}
                    </span>
                  </div>
                  {value === mode.id && <div className="panel-check" />}
                </button>
              ))}
            </div>
          </div>

          <div className="panel-section">
            <label className="panel-label">Mood</label>
            <div className="panel-btn-grid">
              {moods.map((mood) => (
                <button
                  key={mood.id}
                  className={`panel-btn ${
                    constraints.mood === mood.id ? 'active' : ''
                  }`}
                  onClick={(e) => {
                    onConstraintsChange({ ...constraints, mood: mood.id });
                    e.currentTarget.blur();
                  }}
                >
                  {mood.label}
                </button>
              ))}
            </div>
          </div>

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
              onChange={(e) =>
                onConstraintsChange({
                  ...constraints,
                  minContrast: Number(e.target.value),
                })
              }
              className="panel-slider"
            />
            <div className="panel-slider-labels">
              <span>Low</span>
              <span>High</span>
            </div>
          </div>

          <div className="panel-section">
            <button
              className={`panel-toggle ${
                constraints.darkModeFriendly ? 'active' : ''
              }`}
              onClick={(e) => {
                onConstraintsChange({
                  ...constraints,
                  darkModeFriendly: !constraints.darkModeFriendly,
                });
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
