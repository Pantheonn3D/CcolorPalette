import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Plus,
  X,
  Copy,
  Lock,
  Unlock,
  GripVertical,
  Check,
  ChevronDown,
} from 'lucide-react';
import Header from '../header/Header';
import MethodPanel from './MethodPanel';
import AccessibilityPanel from './AccessibilityPanel';
import HistoryPanel from './HistoryPanel';
import ExportPanel from './ExportPanel';
import LandingContent from '../LandingContent';
import './ColorGenerator.css';
import {
  generateRandomPalette,
  getContrastColor,
  generateBridgeColor,
  simulateColorBlindness,
} from '../utils/colorUtils';

const generateId = () => Math.random().toString(36).substring(2, 11);

const createColorObjects = (hexArray) =>
  hexArray.map((hex) => ({
    id: generateId(),
    hex,
    locked: false,
  }));

const MAX_HISTORY = 50;
const MAX_COLORS = 8;
const MAX_OPEN_PANELS = 3;

function ColorGenerator() {
  // Page state (0 = generator, 1 = landing)
  const [currentPage, setCurrentPage] = useState(0);

  // History state
  const [history, setHistory] = useState(() => [
    createColorObjects(generateRandomPalette()),
  ]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Panel states
  const [openPanels, setOpenPanels] = useState([]);

  // Generation settings
  const [generationMode, setGenerationMode] = useState('auto');
  const [constraints, setConstraints] = useState({
    mood: 'any',
    minContrast: 1.5,
    darkModeFriendly: false,
  });

  // Accessibility
  const [colorBlindMode, setColorBlindMode] = useState('normal');

  const colors = history[historyIndex];

  // UI states
  const [newColorId, setNewColorId] = useState(null);
  const [removingId, setRemovingId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  // Drag states
  const [dragState, setDragState] = useState(null);
  const [isSnapping, setIsSnapping] = useState(false);
  const containerRef = useRef(null);

  // Page navigation
  const goToGenerator = () => setCurrentPage(0);
  const goToLanding = () => setCurrentPage(1);

  // Panel helper functions
  const isPanelOpen = (panelName) => openPanels.includes(panelName);

  const togglePanel = (panelName) => {
    setOpenPanels((prev) => {
      if (prev.includes(panelName)) {
        return prev.filter((p) => p !== panelName);
      } else {
        let newPanels = [...prev, panelName];
        if (newPanels.length > MAX_OPEN_PANELS) {
          newPanels = newPanels.slice(1);
        }
        return newPanels;
      }
    });
  };

  const closePanel = (panelName) => {
    setOpenPanels((prev) => prev.filter((p) => p !== panelName));
  };

  const isMethodOpen = isPanelOpen('method');
  const isA11yOpen = isPanelOpen('a11y');
  const isHistoryOpen = isPanelOpen('history');
  const isExportOpen = isPanelOpen('export');

  const canAddMoreColors = colors.length < MAX_COLORS;

  const updateColors = useCallback(
    (newColors) => {
      setHistory((prev) => {
        const newHistory = prev.slice(0, historyIndex + 1);
        newHistory.push(newColors);
        if (newHistory.length > MAX_HISTORY) {
          newHistory.shift();
          return newHistory;
        }
        return newHistory;
      });
      setHistoryIndex((prev) => Math.min(prev + 1, MAX_HISTORY - 1));
    },
    [historyIndex]
  );

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex((prev) => prev - 1);
    }
  }, [historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex((prev) => prev + 1);
    }
  }, [historyIndex, history.length]);

  const goToHistoryIndex = useCallback(
    (index) => {
      if (index >= 0 && index < history.length) {
        setHistoryIndex(index);
      }
    },
    [history.length]
  );

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  // Parse URL on mount
  useEffect(() => {
    const parseUrlState = () => {
      const path = window.location.pathname.slice(1);
      const params = new URLSearchParams(window.location.search);

      if (path) {
        const hexCodes = path.split('-').map((h) => `#${h.toUpperCase()}`);
        if (
          hexCodes.length >= 2 &&
          hexCodes.every((h) => /^#[0-9A-F]{6}$/.test(h))
        ) {
          const initialColors = hexCodes.map((hex) => ({
            id: generateId(),
            hex,
            locked: false,
          }));
          setHistory([initialColors]);
          setHistoryIndex(0);
        }
      }

      if (params.has('mode')) setGenerationMode(params.get('mode'));
      if (params.has('mood'))
        setConstraints((prev) => ({ ...prev, mood: params.get('mood') }));
      if (params.has('contrast'))
        setConstraints((prev) => ({
          ...prev,
          minContrast: parseFloat(params.get('contrast')),
        }));
      if (params.has('dark'))
        setConstraints((prev) => ({
          ...prev,
          darkModeFriendly: params.get('dark') === '1',
        }));
      if (params.has('vision')) setColorBlindMode(params.get('vision'));
    };

    parseUrlState();
  }, []);

  // Update chromaAPI
  useEffect(() => {
    window.chromaAPI = {
      undo,
      redo,
      canUndo: () => canUndo,
      canRedo: () => canRedo,
      getShareUrl: () => {
        const hexes = colors.map((c) => c.hex.replace('#', '')).join('-');
        const params = new URLSearchParams();

        if (generationMode !== 'auto') params.set('mode', generationMode);
        if (constraints.mood !== 'any') params.set('mood', constraints.mood);
        if (constraints.minContrast !== 1.5)
          params.set('contrast', constraints.minContrast.toString());
        if (constraints.darkModeFriendly) params.set('dark', '1');
        if (colorBlindMode !== 'normal') params.set('vision', colorBlindMode);

        const queryString = params.toString();
        return `${window.location.origin}/${hexes}${
          queryString ? '?' + queryString : ''
        }`;
      },
    };
  }, [
    undo,
    redo,
    canUndo,
    canRedo,
    colors,
    generationMode,
    constraints,
    colorBlindMode,
  ]);

  // Keyboard shortcuts (only on generator page)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (currentPage !== 0) return;

      if (e.code === 'Space') {
        if (document.activeElement instanceof HTMLButtonElement) {
          document.activeElement.blur();
        }
        e.preventDefault();
        generatePalette(colors.length);
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === 'y' || (e.key === 'z' && e.shiftKey))
      ) {
        e.preventDefault();
        redo();
      }
      if (e.key === 'Escape') {
        setOpenPanels([]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, colors.length, generationMode, constraints, currentPage]);

  const generatePalette = (count = 5) => {
    const lockedColors = colors.filter((c) => c.locked);
    const unlockedCount = count - lockedColors.length;

    if (unlockedCount <= 0) return;

    const newPalette = generateRandomPalette(
      generationMode,
      unlockedCount,
      constraints
    );
    const newColors = newPalette.map((hex) => ({
      id: generateId(),
      hex,
      locked: false,
    }));

    if (lockedColors.length === 0) {
      updateColors(newColors);
      return;
    }

    const result = [];
    let newIndex = 0;
    colors.forEach((c) => {
      if (c.locked) {
        result.push({ ...c });
      } else if (newIndex < newColors.length) {
        result.push(newColors[newIndex]);
        newIndex++;
      }
    });
    while (newIndex < newColors.length) {
      result.push(newColors[newIndex]);
      newIndex++;
    }

    updateColors(result);
    setNewColorId(null);
  };

  const addColorAtIndex = (index) => {
    if (!canAddMoreColors) return;

    const colorBefore = colors[index].hex;
    const colorAfter = colors[index + 1].hex;
    const newHex = generateBridgeColor(colorBefore, colorAfter);
    const newId = generateId();

    const newColors = [
      ...colors.slice(0, index + 1),
      { id: newId, hex: newHex, locked: false },
      ...colors.slice(index + 1),
    ];

    updateColors(newColors);
    setNewColorId(newId);
    setTimeout(() => setNewColorId(null), 600);
  };

  const removeColor = (id) => {
    if (colors.length <= 2) return;

    setRemovingId(id);
    setTimeout(() => {
      updateColors(colors.filter((c) => c.id !== id));
      setRemovingId(null);
    }, 350);
  };

  const toggleLock = (id) => {
    updateColors(
      colors.map((c) => (c.id === id ? { ...c, locked: !c.locked } : c))
    );
  };

  const copyHex = async (id, hex) => {
    try {
      await navigator.clipboard.writeText(hex);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getColumnWidth = useCallback(() => {
    if (!containerRef.current) return 0;

    let panelWidth = 0;
    if (isMethodOpen) panelWidth += 240;
    if (isA11yOpen) panelWidth += 280;
    if (isHistoryOpen) panelWidth += 260;
    if (isExportOpen) panelWidth += 300;

    const availableWidth = containerRef.current.offsetWidth - panelWidth;
    return availableWidth / colors.length;
  }, [colors.length, isMethodOpen, isA11yOpen, isHistoryOpen, isExportOpen]);

  const handleDragStart = (e, id, index) => {
    e.preventDefault();
    const columnWidth = getColumnWidth();

    setDragState({
      id,
      startIndex: index,
      currentIndex: index,
      startX: e.clientX,
      currentX: e.clientX,
      columnWidth,
    });
  };

  const handleMouseMove = useCallback(
    (e) => {
      if (!dragState || isSnapping) return;

      const { startIndex, columnWidth } = dragState;
      let deltaX = e.clientX - dragState.startX;

      const maxLeftOffset = -startIndex * columnWidth;
      const maxRightOffset = (colors.length - 1 - startIndex) * columnWidth;
      deltaX = Math.max(maxLeftOffset, Math.min(maxRightOffset, deltaX));

      const indexOffset = Math.round(deltaX / columnWidth);
      const newIndex = startIndex + indexOffset;

      setDragState((prev) => ({
        ...prev,
        currentX: dragState.startX + deltaX,
        currentIndex: newIndex,
      }));
    },
    [dragState, isSnapping, colors.length]
  );

  const handleMouseUp = useCallback(() => {
    if (!dragState) return;

    const { startIndex, currentIndex } = dragState;
    setIsSnapping(true);

    setTimeout(() => {
      if (startIndex !== currentIndex) {
        const newColors = [...colors];
        const [removed] = newColors.splice(startIndex, 1);
        newColors.splice(currentIndex, 0, removed);
        updateColors(newColors);
      }
      setDragState(null);
      setIsSnapping(false);
    }, 250);
  }, [dragState, colors, updateColors]);

  useEffect(() => {
    if (dragState) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'grabbing';
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = '';
      };
    }
  }, [dragState, handleMouseMove, handleMouseUp]);

  const getColumnStyle = (index, id) => {
    if (!dragState) return {};

    const { startIndex, currentIndex, startX, currentX, columnWidth } =
      dragState;
    const isDragged = id === dragState.id;

    if (isDragged) {
      if (isSnapping) {
        const snapOffset = (currentIndex - startIndex) * columnWidth;
        return {
          transform: `translateX(${snapOffset}px)`,
          zIndex: 100,
          transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
        };
      } else {
        const offset = currentX - startX;
        return {
          transform: `translateX(${offset}px)`,
          zIndex: 100,
          transition: 'none',
        };
      }
    }

    let shift = 0;
    if (startIndex < currentIndex) {
      if (index > startIndex && index <= currentIndex) shift = -1;
    } else if (startIndex > currentIndex) {
      if (index >= currentIndex && index < startIndex) shift = 1;
    }

    return {
      transform:
        shift !== 0 ? `translateX(${shift * columnWidth}px)` : 'translateX(0)',
      transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
    };
  };

  const getDisplayColor = (hex) => {
    if (colorBlindMode === 'normal') return hex;
    return simulateColorBlindness(hex, colorBlindMode);
  };

  return (
    <div className="app-wrapper">
      {/* Generator Page */}
      <div
        className={`page-section ${currentPage === 0 ? 'visible' : 'hidden'}`}
      >
        <Header
          canUndo={canUndo}
          canRedo={canRedo}
          onUndo={undo}
          onRedo={redo}
          onToggleMethod={() => togglePanel('method')}
          isMethodOpen={isMethodOpen}
          onToggleA11y={() => togglePanel('a11y')}
          isA11yOpen={isA11yOpen}
          onToggleHistory={() => togglePanel('history')}
          isHistoryOpen={isHistoryOpen}
          onToggleExport={() => togglePanel('export')}
          isExportOpen={isExportOpen}
          logoColors={colors}
          onLogoClick={goToGenerator}
        />

        <main className="generator-container" ref={containerRef}>
          {colors.map((color, index) => {
            const displayHex = getDisplayColor(color.hex);
            const textColor = getContrastColor(displayHex);
            const isNew = color.id === newColorId;
            const isRemoving = color.id === removingId;
            const isCopied = copiedId === color.id;
            const isDragging = dragState?.id === color.id;
            const columnStyle = getColumnStyle(index, color.id);

            return (
              <React.Fragment key={color.id}>
                <div
                  className={`color-column ${isNew ? 'color-entering' : ''} ${
                    isRemoving ? 'color-removing' : ''
                  } ${isDragging ? 'is-dragging' : ''} ${
                    dragState && !isDragging ? 'is-shifting' : ''
                  }`}
                  style={{ backgroundColor: displayHex, ...columnStyle }}
                >
                  <div className="color-toolbar" style={{ color: textColor }}>
                    {colors.length > 2 && (
                      <button
                        className="toolbar-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeColor(color.id);
                          e.currentTarget.blur();
                        }}
                        title="Remove"
                        style={{ color: textColor }}
                      >
                        <X size={20} />
                      </button>
                    )}

                    <button
                      className="toolbar-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        copyHex(color.id, color.hex);
                        e.currentTarget.blur();
                      }}
                      title="Copy hex"
                      style={{ color: textColor }}
                    >
                      {isCopied ? <Check size={20} /> : <Copy size={20} />}
                    </button>

                    <button
                      className={`toolbar-btn ${color.locked ? 'active' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLock(color.id);
                        e.currentTarget.blur();
                      }}
                      title={color.locked ? 'Unlock' : 'Lock'}
                      style={{ color: textColor }}
                    >
                      {color.locked ? <Lock size={20} /> : <Unlock size={20} />}
                    </button>

                    <div
                      className="toolbar-btn drag-handle"
                      title="Drag to reorder"
                      style={{ color: textColor }}
                      onMouseDown={(e) => handleDragStart(e, color.id, index)}
                    >
                      <GripVertical size={20} />
                    </div>
                  </div>

                  <div className="color-content">
                    <h2
                      className={`color-hex ${isCopied ? 'copied' : ''}`}
                      style={{ color: textColor }}
                      onClick={() => copyHex(color.id, color.hex)}
                    >
                      {isCopied ? 'Copied!' : color.hex.replace('#', '')}
                    </h2>
                  </div>

                  {color.locked && (
                    <div
                      className="lock-indicator"
                      style={{ color: textColor }}
                    >
                      <Lock size={16} />
                    </div>
                  )}
                </div>

                {index < colors.length - 1 &&
                  !dragState &&
                  canAddMoreColors && (
                    <div className="addColor">
                      <button
                        className="addBtn"
                        onClick={(e) => {
                          addColorAtIndex(index);
                          e.currentTarget.blur();
                        }}
                        aria-label="Add color"
                      >
                        <Plus size={24} strokeWidth={2.5} color="#161616" />
                      </button>
                    </div>
                  )}
              </React.Fragment>
            );
          })}

          <MethodPanel
            isOpen={isMethodOpen}
            onClose={() => closePanel('method')}
            value={generationMode}
            onChange={setGenerationMode}
            constraints={constraints}
            onConstraintsChange={setConstraints}
          />

          <AccessibilityPanel
            isOpen={isA11yOpen}
            onClose={() => closePanel('a11y')}
            colors={colors}
            colorBlindMode={colorBlindMode}
            onColorBlindModeChange={setColorBlindMode}
          />

          <HistoryPanel
            isOpen={isHistoryOpen}
            onClose={() => closePanel('history')}
            history={history}
            currentIndex={historyIndex}
            onSelectPalette={goToHistoryIndex}
          />

          <ExportPanel
            isOpen={isExportOpen}
            onClose={() => closePanel('export')}
            colors={colors}
          />
        </main>

        {/* Chevron to landing - only visible on generator page */}
        <button className="nav-chevron" onClick={goToLanding}>
          <span className="nav-chevron-label">About</span>
          <ChevronDown size={16} className="nav-chevron-icon" />
        </button>
      </div>

      {/* Landing Page */}
      <div
        className={`page-section landing-page ${
          currentPage === 1 ? 'visible' : 'hidden'
        }`}
      >
        <LandingContent onBackToGenerator={goToGenerator} />

        {/* Chevron back - only visible on landing page */}
        <button className="nav-chevron up on-light" onClick={goToGenerator}>
          <ChevronDown size={16} className="nav-chevron-icon" />
          <span className="nav-chevron-label">Generator</span>
        </button>
      </div>
    </div>
  );
}

export default ColorGenerator;
