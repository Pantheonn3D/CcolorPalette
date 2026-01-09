import React from 'react';
import { X, Clock, Eye } from 'lucide-react';
import { simulateColorBlindness } from '../utils/colorUtils';
import '../styles/PanelStyles.css';

function HistoryPanel({
  isOpen,
  onClose,
  history,
  currentIndex,
  onSelectPalette,
}) {
  const reversedHistory = [...history].reverse();

  // Helper to safely check if an entry is "Normal" vision
  const checkIsNormal = (entry) => {
    if (!entry) return true; // Default to true for safety
    const mode = entry.visionMode || 'Normal';
    return mode.toLowerCase().includes('normal');
  };

  const renderDecoration = (colors, visionMode) => (
    <div className="panel-card-decoration">
      {colors.slice(0, 3).map((color, i) => (
        <span
          key={i}
          className="decoration-bar"
          style={{ 
            backgroundColor: simulateColorBlindness(color.hex, visionMode.toLowerCase()) 
          }}
        />
      ))}
    </div>
  );

  return (
    <div
      className={`panel-column ${isOpen ? 'open' : ''}`}
      style={{ flexBasis: isOpen ? `260px` : '0px' }}
    >
      <div className="panel-inner" style={{ width: `260px` }}>
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
            // 'seamless' class removes the default gap so "Normal" items touch
            <div className="panel-list seamless">
              {reversedHistory.map((entry, idx) => {
                const actualIndex = history.length - 1 - idx;
                const isCurrent = actualIndex === currentIndex;
                
                const colors = Array.isArray(entry) ? entry : entry.colors;
                const visionMode = entry.visionMode || 'Normal';
                const isNormal = checkIsNormal(entry);

                // LOGIC: Check the next item to decide on divider
                const nextEntry = reversedHistory[idx + 1];
                const nextIsNormal = checkIsNormal(nextEntry);
                
                // Show divider ONLY if we are NOT in a sequence of Normal items
                // i.e., show if Current is Sim OR Next is Sim
                const showDivider = idx < reversedHistory.length - 1 && !(isNormal && nextIsNormal);

                return (
                  <React.Fragment key={idx}>
                    <button
                      className={`panel-card ${isCurrent ? 'current' : ''}`}
                      onClick={(e) => {
                        onSelectPalette(actualIndex);
                        e.currentTarget.blur();
                      }}
                    >
                      {!isNormal && (
                        <div className="panel-card-sim-label">
                          <Eye size={10} />
                          <span>{visionMode}</span>
                        </div>
                      )}
                      
                      <div className="panel-preview-colors">
                        {colors.map((color, colorIdx) => {
                          const displayHex = isNormal
                            ? color.hex 
                            : simulateColorBlindness(color.hex, visionMode.toLowerCase());

                          return (
                            <div
                              key={colorIdx}
                              className="panel-preview-color"
                              style={{ backgroundColor: displayHex }}
                            />
                          );
                        })}
                      </div>

                      {!isNormal && renderDecoration(colors, visionMode)}
                    </button>

                    {/* Conditional Divider */}
                    {showDivider && <div className="panel-entry-divider" />}
                  </React.Fragment>
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