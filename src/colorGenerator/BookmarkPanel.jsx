import { useState } from 'react';
import { X, Bookmark, Star, Copy, Check } from 'lucide-react';
import '../styles/PanelStyles.css';
import './BookmarkPanel.css';

const PANEL_WIDTH = 280;

function BookmarkPanel({ isOpen, onClose, currentUrl }) {
  const [copied, setCopied] = useState(false);

  const isMac =
    typeof navigator !== 'undefined' &&
    navigator.platform.toUpperCase().indexOf('MAC') >= 0;

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div
      className={`panel-column ${isOpen ? 'open' : ''}`}
      style={{ flexBasis: isOpen ? `${PANEL_WIDTH}px` : '0px' }}
    >
      <div className="panel-inner" style={{ width: `${PANEL_WIDTH}px` }}>
        <div className="panel-header">
          <div className="panel-title">
            <Bookmark size={18} />
            <span>Bookmark</span>
          </div>
          <button className="panel-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="panel-scroll">
          {/* Main Instruction */}
          <div className="bookmark-main">
            <div className="bookmark-icon-large">
              <Star size={32} />
            </div>
            <h3>Save this palette</h3>
            <p>
              Bookmark this page to quickly access your current color palette
              anytime.
            </p>
          </div>

          {/* Keyboard Shortcut */}
          <div className="panel-section">
            <label className="panel-label">Keyboard Shortcut</label>
            <div className="bookmark-shortcut-box">
              <div className="bookmark-keys">
                <kbd>{isMac ? '⌘' : 'Ctrl'}</kbd>
                <span>+</span>
                <kbd>D</kbd>
              </div>
              <span className="bookmark-shortcut-label">Add to bookmarks</span>
            </div>
          </div>

          {/* Current URL Preview */}
          <div className="panel-section">
            <label className="panel-label">Current Palette URL</label>
            <div className="bookmark-url-box">
              <code className="bookmark-url">{currentUrl}</code>
              <button
                className={`bookmark-copy-btn ${copied ? 'copied' : ''}`}
                onClick={handleCopyUrl}
                title="Copy URL"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>
            <p className="panel-hint">
              This URL contains your exact palette. Share it or bookmark it!
            </p>
          </div>

          {/* Browser Instructions */}
          <div className="panel-section">
            <label className="panel-label">Or manually</label>
            <div className="panel-list">
              <div className="bookmark-step">
                <span className="bookmark-step-num">1</span>
                <span>Click the star icon in your browser's address bar</span>
              </div>
              <div className="bookmark-step">
                <span className="bookmark-step-num">2</span>
                <span>Choose a folder and save</span>
              </div>
              <div className="bookmark-step">
                <span className="bookmark-step-num">3</span>
                <span>Access your palette anytime from bookmarks</span>
              </div>
            </div>
          </div>

          {/* Pro Tip */}
          <div className="bookmark-tip">
            <strong>Pro tip:</strong> Generate a palette you love, then bookmark
            it. Each palette has a unique URL!
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookmarkPanel;