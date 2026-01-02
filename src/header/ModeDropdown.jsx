import { useState, useRef, useEffect } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import './ModeDropdown.css';

const modes = [
  { id: 'auto', label: 'Auto', description: 'Random harmony' },
  { id: 'mono', label: 'Monochromatic', description: 'Single hue' },
  { id: 'analogous', label: 'Analogous', description: 'Adjacent hues' },
  { id: 'complementary', label: 'Complementary', description: 'Opposite hues' },
  {
    id: 'splitComplementary',
    label: 'Split Comp.',
    description: 'Opposite + adjacent',
  },
  { id: 'triadic', label: 'Triadic', description: 'Three-way split' },
];

function ModeDropdown({ value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const currentMode = modes.find((m) => m.id === value) || modes[0];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
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
          {modes.map((mode) => {
            const isSelected = mode.id === value;

            return (
              <button
                key={mode.id}
                className={`modeDropdownItem ${isSelected ? 'selected' : ''}`}
                onClick={() => handleSelect(mode.id)}
              >
                <span className="modeLabel">{mode.label}</span>
                <span className="modeDescription">{mode.description}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ModeDropdown;
