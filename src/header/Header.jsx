import { Undo2, Redo2, Clock, Upload, Sparkles, Eye, Bookmark } from 'lucide-react';
import './Header.css';

function Header({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onToggleMethod,
  isMethodOpen,
  onToggleA11y,
  isA11yOpen,
  onToggleHistory,
  isHistoryOpen,
  onToggleExport,
  isExportOpen,
  onToggleBookmark,
  isBookmarkOpen,
  logoColors = [],
  onLogoClick,
}) {
  return (
    <header className="header">
      <div className="leftSection">
        <button className="logoContainer" onClick={onLogoClick} title="CColorPalette">
          <div className="logoMark">
            {logoColors.slice(0, 3).map((color, i) => (
              <span 
                key={i}
                className="logoSwatch" 
                style={{ backgroundColor: color.hex }} 
              />
            ))}
          </div>
          <span className="logoText">CColorPalette</span>
        </button>
        <span className="hint">Press spacebar to generate</span>
      </div>

      <div className="rightSection">
        <button
          className={`iconBtn ${!canUndo ? 'disabled' : ''}`}
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
        >
          <Undo2 size={20} />
        </button>

        <button
          className={`iconBtn ${!canRedo ? 'disabled' : ''}`}
          onClick={onRedo}
          disabled={!canRedo}
          title="Redo (Ctrl+Y)"
        >
          <Redo2 size={20} />
        </button>

        <div className="separator" />

        <button 
          className={`iconBtn ${isMethodOpen ? 'active' : ''}`}
          onClick={onToggleMethod}
          title="Generation Method"
        >
          <Sparkles size={20} />
        </button>

        <button 
          className={`iconBtn ${isA11yOpen ? 'active' : ''}`}
          onClick={onToggleA11y}
          title="Accessibility"
        >
          <Eye size={20} />
        </button>

        <button 
          className={`iconBtn ${isHistoryOpen ? 'active' : ''}`}
          onClick={onToggleHistory}
          title="History"
        >
          <Clock size={20} />
        </button>

        <button 
          className={`iconBtn ${isExportOpen ? 'active' : ''}`}
          onClick={onToggleExport}
          title="Export"
        >
          <Upload size={20} />
        </button>

        <button 
          className={`iconBtn ${isBookmarkOpen ? 'active' : ''}`}
          onClick={onToggleBookmark}
          title="Bookmark"
        >
          <Bookmark size={20} />
        </button>
      </div>
    </header>
  );
}

export default Header;