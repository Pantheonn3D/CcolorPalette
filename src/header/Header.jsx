import { Link } from 'react-router-dom';
import { 
  Undo2, Redo2, Clock, Upload, Sparkles, Eye, Bookmark, 
  Share 
} from 'lucide-react';
import './Header.css';

function Header({
  isLanding = false,
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
}) {
  
  // Static logo colors for landing page
  const displayLogoColors = isLanding 
    ? [{hex: '#0B2B29'}, {hex: '#21A479'}, {hex: '#95D2A6'}] 
    : logoColors;

  return (
    <header className={`header ${isLanding ? 'landing-mode' : ''}`}>
      <div className="leftSection">
        <Link 
          to="/home" 
          className="logoContainer" 
          title="Go to Home"
          style={{ textDecoration: 'none' }}
        >
          <div className="logoMark">
            {displayLogoColors.slice(0, 3).map((color, i) => (
              <span 
                key={i}
                className="logoSwatch" 
                style={{ backgroundColor: color.hex }} 
              />
            ))}
          </div>
          <span className="logoText">CColorPalette</span>
        </Link>
        {!isLanding && <span className="hint">Press spacebar to generate</span>}
      </div>

      <div className="rightSection">
        {isLanding ? (
          /* LANDING PAGE NAVIGATION 
          (add these later): 
            <a href="#start" className="nav-link">Get started</a>
            <a href="#faq" className="nav-link">FAQ</a>
            <a href="#about" className="nav-link">About</a>
                        
            <div className="landing-icons">
              <button className="iconBtn" title="Share">
                <Share size={20} />
              </button>
              <button className="iconBtn" title="Saved">
                <Bookmark size={20} />
              </button>
            </div>
            */
          <div className="landing-nav">
          </div>
        ) : (
          /* GENERATOR TOOLS */
          <>
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
          </>
        )}
      </div>
    </header>
  );
}

export default Header;