import { useState, useRef, useEffect } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import './ModeDropdown.css';

const MODES = [
  { id: 'auto', label: 'Auto', description: 'Random harmony' },
  { id: 'mono', label: 'Monochromatic', description: 'Single hue' },
  { id: 'analogous', label: 'Analogous', description: 'Adjacent hues' },
  { id: 'complementary', label: 'Complementary', description: 'Opposite hues' },
  { id: 'splitComplementary', label: 'Split Comp.', description: 'Opposite + adjacent' },
  { id: 'triadic', label: 'Triadic', description: 'Three-way split' },
];

function ModeDropdown({ value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const currentMode = MODES.find((m) => m.id === value) || MODES[0];

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (modeId) => {
    onChange(modeId);
    setIsOpen(false);
  };

  return (
    <div className="modeDropdown" ref={dropdownRef}>
      <button
        className={`modeIconBtn ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title={`Mode: ${currentMode.label}`}
      >
        <SlidersHorizontal size={20} />
      </button>

      {isOpen && (
        <div className="modeDropdownMenu">
          <div className="modeDropdownHeader">Generate Method</div>
          {MODES.map((mode) => (
            <button
              key={mode.id}
              className={`modeDropdownItem ${mode.id === value ? 'selected' : ''}`}
              onClick={() => handleSelect(mode.id)}
            >
              <span className="modeLabel">{mode.label}</span>
              <span className="modeDescription">{mode.description}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default ModeDropdown;