import { useState } from 'react';
import { X, Bookmark, Star, Copy, Check } from 'lucide-react';
import '../styles/PanelStyles.css';
import './BookmarkPanel.css';

const PANEL_WIDTH = 280;

function BookmarkPanel({ isOpen, onClose, currentUrl }) {
  const [copied, setCopied] = useState(false);

  const isMac = typeof navigator !== 'undefined' && 
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
          {/* Main Card */}
          <div className="bookmark-hero">
            <div className="bookmark-icon">
              <Star size={28} />
            </div>
            <h3>Save this palette</h3>
            <p>Bookmark this page to access your colors anytime.</p>
          </div>

          {/* Keyboard Shortcut */}
          <div className="panel-section">
            <label className="panel-label">Keyboard Shortcut</label>
            <div className="bookmark-shortcut">
              <div className="bookmark-keys">
                <kbd>{isMac ? '⌘' : 'Ctrl'}</kbd>
                <span>+</span>
                <kbd>D</kbd>
              </div>
              <span className="bookmark-shortcut-hint">Add to bookmarks</span>
            </div>
          </div>

          {/* URL */}
          <div className="panel-section">
            <label className="panel-label">Palette URL</label>
            <div className="bookmark-url-row">
              <code className="bookmark-url">{currentUrl}</code>
              <button
                className={`bookmark-copy ${copied ? 'copied' : ''}`}
                onClick={handleCopyUrl}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>
            <p className="panel-hint">Share or bookmark this unique URL!</p>
          </div>

          {/* Steps */}
          <div className="panel-section">
            <label className="panel-label">Or manually</label>
            <div className="bookmark-steps">
              <div className="bookmark-step">
                <span className="bookmark-step-num">1</span>
                <span>Click the star in your address bar</span>
              </div>
              <div className="bookmark-step">
                <span className="bookmark-step-num">2</span>
                <span>Choose a folder and save</span>
              </div>
              <div className="bookmark-step">
                <span className="bookmark-step-num">3</span>
                <span>Access anytime from bookmarks</span>
              </div>
            </div>
          </div>

          {/* Tip */}
          <div className="bookmark-tip">
            <strong>Pro tip:</strong> Each palette has a unique URL! Generate one you love, then bookmark it!
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookmarkPanel;