import { X, Clock } from 'lucide-react';
import '../styles/PanelStyles.css';

function HistoryPanel({
  isOpen,
  onClose,
  history,
  currentIndex,
  onSelectPalette,
}) {
  return (
    <div
      className={`panel-column ${isOpen ? 'open' : ''}`}
      style={{ flexBasis: isOpen ? '260px' : '0px' }}
    >
      <div className="panel-inner" style={{ width: '260px' }}>
        <div className="panel-header">
          <div className="panel-title">
            <Clock size={18} />
            <span>History</span>
          </div>
          <button className="panel-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="panel-scroll">
          {history.length === 0 ? (
            <div className="panel-empty">
              <p>No history yet</p>
              <span>Press space to generate palettes</span>
            </div>
          ) : (
            <div className="panel-list" style={{ gap: '10px' }}>
              {[...history].reverse().map((palette, idx) => {
                const actualIndex = history.length - 1 - idx;
                const isCurrent = actualIndex === currentIndex;

                return (
                  <button
                    key={idx}
                    className={`panel-card ${isCurrent ? 'current' : ''}`}
                    onClick={(e) => {
                      onSelectPalette(actualIndex);
                      e.currentTarget.blur();
                    }}
                  >
                    <div
                      className="panel-preview-colors"
                      style={{ height: '40px', borderRadius: '8px' }}
                    >
                      {palette.map((color, colorIdx) => (
                        <div
                          key={colorIdx}
                          className="panel-preview-color"
                          style={{ backgroundColor: color.hex }}
                        />
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default HistoryPanel;
