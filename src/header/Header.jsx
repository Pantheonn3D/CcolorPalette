import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Undo2,
  Redo2,
  Clock,
  Upload,
  Sparkles,
  Eye,
  Bookmark,
  ChevronRight,
} from 'lucide-react';
import './Header.css';

const DEFAULT_LOGO_COLORS = [
  { hex: '#0B2B29' },
  { hex: '#21A479' },
  { hex: '#95D2A6' },
];

// Keyboard shortcuts for tooltips
const SHORTCUTS = {
  undo: { key: 'Ctrl+Z', mac: '⌘Z' },
  redo: { key: 'Ctrl+Y', mac: '⌘Y' },
  generate: { key: 'Space', mac: 'Space' },
};

function Header({
  isLanding = false,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
  onToggleMethod,
  isMethodOpen = false,
  onToggleA11y,
  isA11yOpen = false,
  onToggleHistory,
  isHistoryOpen = false,
  onToggleExport,
  isExportOpen = false,
  onToggleBookmark,
  isBookmarkOpen = false,
  logoColors = [],
  onLogoClick,
  historyCount = 0,
}) {
  const [activeTooltip, setActiveTooltip] = useState(null);
  const tooltipTimeout = useRef(null);

  const isMac = typeof navigator !== 'undefined' && 
    navigator.platform.toUpperCase().indexOf('MAC') >= 0;

  const displayLogoColors = isLanding ? DEFAULT_LOGO_COLORS : 
    (logoColors.length > 0 ? logoColors : DEFAULT_LOGO_COLORS);

  // Show tooltip on hover with delay
  const handleMouseEnter = (id) => {
    tooltipTimeout.current = setTimeout(() => {
      setActiveTooltip(id);
    }, 600);
  };

  const handleMouseLeave = () => {
    if (tooltipTimeout.current) {
      clearTimeout(tooltipTimeout.current);
    }
    setActiveTooltip(null);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (tooltipTimeout.current) {
        clearTimeout(tooltipTimeout.current);
      }
    };
  }, []);

  const getShortcut = (action) => {
    const shortcut = SHORTCUTS[action];
    if (!shortcut) return null;
    return isMac ? shortcut.mac : shortcut.key;
  };

  // Check if any panel is open
  const anyPanelOpen = isMethodOpen || isA11yOpen || isHistoryOpen || isExportOpen || isBookmarkOpen;

  return (
    <header className={`header ${isLanding ? 'landing' : ''} ${anyPanelOpen ? 'panels-active' : ''}`}>
      <div className="header-left">
        {/* Logo */}
        <Link 
          to="/home" 
          className="header-logo"
          title="Go to Home"
        >
          <div className="logo-mark">
            {displayLogoColors.slice(0, 3).map((color, i) => (
              <span
                key={i}
                className="logo-swatch"
                style={{ 
                  backgroundColor: color.hex,
                  transitionDelay: `${i * 50}ms`
                }}
              />
            ))}
          </div>
          <span className="logo-text">CColorPalette</span>
        </Link>

        {/* Generate Hint */}
        {!isLanding && (
          <div className="header-hint">
            <span className="hint-text">Press</span>
            <kbd className="hint-key">space</kbd>
            <span className="hint-text">to generate</span>
          </div>
        )}
      </div>

      <div className="header-right">
        {isLanding ? (
          <nav className="header-nav">
            <Link to="/" className="header-cta">
              <span>Open Generator</span>
              <ChevronRight size={16} />
            </Link>
          </nav>
        ) : (
          <>
            {/* Undo/Redo Group */}
            <div className="header-group">
              <button
                className={`header-btn ${!canUndo ? 'disabled' : ''}`}
                onClick={onUndo}
                disabled={!canUndo}
                onMouseEnter={() => handleMouseEnter('undo')}
                onMouseLeave={handleMouseLeave}
                aria-label="Undo"
              >
                <Undo2 size={18} />
                {activeTooltip === 'undo' && (
                  <span className="header-tooltip">
                    Undo <kbd>{getShortcut('undo')}</kbd>
                  </span>
                )}
              </button>

              <button
                className={`header-btn ${!canRedo ? 'disabled' : ''}`}
                onClick={onRedo}
                disabled={!canRedo}
                onMouseEnter={() => handleMouseEnter('redo')}
                onMouseLeave={handleMouseLeave}
                aria-label="Redo"
              >
                <Redo2 size={18} />
                {activeTooltip === 'redo' && (
                  <span className="header-tooltip">
                    Redo <kbd>{getShortcut('redo')}</kbd>
                  </span>
                )}
              </button>
            </div>

            <div className="header-divider" />

            {/* Panel Toggles */}
            <div className="header-group">
              <button
                className={`header-btn ${isMethodOpen ? 'active' : ''}`}
                onClick={onToggleMethod}
                onMouseEnter={() => handleMouseEnter('method')}
                onMouseLeave={handleMouseLeave}
                aria-label="Generation Method"
                aria-pressed={isMethodOpen}
              >
                <Sparkles size={18} />
                {activeTooltip === 'method' && (
                  <span className="header-tooltip">Method</span>
                )}
              </button>

              <button
                className={`header-btn ${isA11yOpen ? 'active' : ''}`}
                onClick={onToggleA11y}
                onMouseEnter={() => handleMouseEnter('a11y')}
                onMouseLeave={handleMouseLeave}
                aria-label="Accessibility"
                aria-pressed={isA11yOpen}
              >
                <Eye size={18} />
                {activeTooltip === 'a11y' && (
                  <span className="header-tooltip">Accessibility</span>
                )}
              </button>

              <button
                className={`header-btn ${isHistoryOpen ? 'active' : ''}`}
                onClick={onToggleHistory}
                onMouseEnter={() => handleMouseEnter('history')}
                onMouseLeave={handleMouseLeave}
                aria-label="History"
                aria-pressed={isHistoryOpen}
              >
                <Clock size={18} />
                {historyCount > 1 && (
                  <span className="header-badge">{Math.min(historyCount, 99)}</span>
                )}
                {activeTooltip === 'history' && (
                  <span className="header-tooltip">History</span>
                )}
              </button>

              <button
                className={`header-btn ${isExportOpen ? 'active' : ''}`}
                onClick={onToggleExport}
                onMouseEnter={() => handleMouseEnter('export')}
                onMouseLeave={handleMouseLeave}
                aria-label="Export"
                aria-pressed={isExportOpen}
              >
                <Upload size={18} />
                {activeTooltip === 'export' && (
                  <span className="header-tooltip">Export</span>
                )}
              </button>

              <button
                className={`header-btn ${isBookmarkOpen ? 'active' : ''}`}
                onClick={onToggleBookmark}
                onMouseEnter={() => handleMouseEnter('bookmark')}
                onMouseLeave={handleMouseLeave}
                aria-label="Bookmark"
                aria-pressed={isBookmarkOpen}
              >
                <Bookmark size={18} />
                {activeTooltip === 'bookmark' && (
                  <span className="header-tooltip">Bookmark</span>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}

export default Header;