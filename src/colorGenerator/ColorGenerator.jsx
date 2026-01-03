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
  Undo2,
  Redo2,
  Sparkles,
  Eye,
  Clock,
  Upload,
  Bookmark,
} from 'lucide-react';
import Header from '../header/Header';
import MethodPanel from './MethodPanel';
import AccessibilityPanel from './AccessibilityPanel';
import HistoryPanel from './HistoryPanel';
import ExportPanel from './ExportPanel';
import BookmarkPanel from './BookmarkPanel';
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
const MIN_COL_PX = 128;

const isMobileView = () => window.innerWidth <= 768;

// Dynamic max panels based on screen size
const getMaxOpenPanels = () => {
  if (typeof window !== 'undefined' && window.innerWidth <= 768) {
    return 1;
  }
  return 3;
};

function ColorGenerator() {
  // Refs - moved inside component
  const containerRef = useRef(null);
  const colorsAreaRef = useRef(null);

  // State for stacked colors layout - moved inside component
  const [stackColors, setStackColors] = useState(false);

  // Helper function to check vertical layout - now uses state properly
  const isVerticalLayout = useCallback(() => {
    return isMobileView() || stackColors;
  }, [stackColors]);

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
        const maxPanels = getMaxOpenPanels();
        let newPanels = [...prev, panelName];
        if (newPanels.length > maxPanels) {
          newPanels = newPanels.slice(-maxPanels);
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
  const isBookmarkOpen = isPanelOpen('bookmark');

  const canAddMoreColors = colors.length < MAX_COLORS;

  // Get current URL for bookmark panel
  const getCurrentUrl = () => {
    if (typeof window === 'undefined') return '';
    return window.location.href;
  };

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

      const navEntries = performance.getEntriesByType('navigation');
      const isReload = navEntries.length > 0 && navEntries[0].type === 'reload';
      const wasAlreadyHere = sessionStorage.getItem('ccolorpalette_session');

      if (isReload || wasAlreadyHere) {
        window.history.replaceState({}, '', '/');
        sessionStorage.setItem('ccolorpalette_session', 'true');
        return;
      }

      sessionStorage.setItem('ccolorpalette_session', 'true');

      if (path && path.length > 0) {
        const hexCodes = path
          .split('-')
          .map((h) => {
            const cleaned = h.toUpperCase().replace(/[^0-9A-F]/g, '');
            return cleaned.length === 6 ? `#${cleaned}` : null;
          })
          .filter(Boolean);

        if (hexCodes.length >= 2) {
          const initialColors = hexCodes.map((hex) => ({
            id: generateId(),
            hex,
            locked: false,
          }));
          setHistory([initialColors]);
          setHistoryIndex(0);
        }
      }

      if (params.has('mode')) {
        const mode = params.get('mode');
        if (
          ['auto', 'mono', 'analogous', 'complementary', 'splitComplementary', 'triadic'].includes(mode)
        ) {
          setGenerationMode(mode);
        }
      }
      if (params.has('mood')) {
        const mood = params.get('mood');
        if (['any', 'muted', 'pastel', 'vibrant', 'dark'].includes(mood)) {
          setConstraints((prev) => ({ ...prev, mood }));
        }
      }
      if (params.has('contrast')) {
        const contrast = parseFloat(params.get('contrast'));
        if (!isNaN(contrast) && contrast >= 1 && contrast <= 4.5) {
          setConstraints((prev) => ({ ...prev, minContrast: contrast }));
        }
      }
      if (params.has('dark')) {
        setConstraints((prev) => ({
          ...prev,
          darkModeFriendly: params.get('dark') === '1',
        }));
      }
      if (params.has('vision')) {
        const vision = params.get('vision');
        if (['normal', 'protanopia', 'deuteranopia', 'tritanopia', 'achromatopsia'].includes(vision)) {
          setColorBlindMode(vision);
        }
      }
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
        return `${window.location.origin}/${hexes}${queryString ? '?' + queryString : ''}`;
      },
    };
  }, [undo, redo, canUndo, canRedo, colors, generationMode, constraints, colorBlindMode]);

  const generatePalette = useCallback(
    (count = 5) => {
      const lockedColors = colors.filter((c) => c.locked);
      const unlockedCount = count - lockedColors.length;

      if (unlockedCount <= 0) return;

      const newPalette = generateRandomPalette(generationMode, unlockedCount, constraints);
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
    },
    [colors, generationMode, constraints, updateColors]
  );

  // Keyboard shortcuts
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
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        redo();
      }
      if (e.key === 'Escape') {
        setOpenPanels([]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, colors.length, generatePalette, currentPage]);

  // Update URL whenever colors change
  useEffect(() => {
    const hexes = colors.map((c) => c.hex.replace('#', '')).join('-');
    const params = new URLSearchParams();

    if (generationMode !== 'auto') params.set('mode', generationMode);
    if (constraints.mood !== 'any') params.set('mood', constraints.mood);
    if (constraints.minContrast !== 1.5)
      params.set('contrast', constraints.minContrast.toString());
    if (constraints.darkModeFriendly) params.set('dark', '1');
    if (colorBlindMode !== 'normal') params.set('vision', colorBlindMode);

    const queryString = params.toString();
    const newUrl = `/${hexes}${queryString ? '?' + queryString : ''}`;

    window.history.replaceState({}, '', newUrl);
  }, [colors, generationMode, constraints, colorBlindMode]);

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
    updateColors(colors.map((c) => (c.id === id ? { ...c, locked: !c.locked } : c)));
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

  // Calculate size by measuring actual elements
  const getColumnSize = useCallback(() => {
    if (!containerRef.current) return 0;

    const firstColumn = containerRef.current.querySelector('.color-column');
    const vertical = isVerticalLayout();

    if (firstColumn) {
      return vertical ? firstColumn.offsetHeight : firstColumn.offsetWidth;
    }

    if (vertical) {
      const containerHeight = containerRef.current.offsetHeight;
      const headerHeight = 56;
      return (containerHeight - headerHeight) / colors.length;
    } else {
      let panelWidth = 0;
      if (isMethodOpen) panelWidth += 240;
      if (isA11yOpen) panelWidth += 280;
      if (isHistoryOpen) panelWidth += 260;
      if (isExportOpen) panelWidth += 300;
      if (isBookmarkOpen) panelWidth += 280;

      const availableWidth = containerRef.current.offsetWidth - panelWidth;
      return availableWidth / colors.length;
    }
  }, [
    colors.length,
    isMethodOpen,
    isA11yOpen,
    isHistoryOpen,
    isExportOpen,
    isBookmarkOpen,
    isVerticalLayout,
  ]);

  // Handle both mouse and touch, both orientations
  const handleDragStart = (e, id, index) => {
    if (e.type === 'touchstart') {
      e.preventDefault();
    }

    const columnSize = getColumnSize();
    const vertical = isVerticalLayout();

    let clientPos;
    if (e.type === 'touchstart') {
      clientPos = vertical ? e.touches[0].clientY : e.touches[0].clientX;
    } else {
      e.preventDefault();
      clientPos = vertical ? e.clientY : e.clientX;
    }

    setDragState({
      id,
      startIndex: index,
      currentIndex: index,
      startPos: clientPos,
      currentPos: clientPos,
      columnSize,
      isMobile: vertical,
    });
  };

  // Handle movement in correct direction
  const handleMouseMove = useCallback(
    (e) => {
      if (!dragState || isSnapping) return;

      const { startIndex, columnSize, isMobile } = dragState;

      let clientPos;
      if (e.type === 'touchmove') {
        clientPos = isMobile ? e.touches[0].clientY : e.touches[0].clientX;
      } else {
        clientPos = isMobile ? e.clientY : e.clientX;
      }

      let delta = clientPos - dragState.startPos;

      const maxNegativeOffset = -startIndex * columnSize;
      const maxPositiveOffset = (colors.length - 1 - startIndex) * columnSize;
      delta = Math.max(maxNegativeOffset, Math.min(maxPositiveOffset, delta));

      const indexOffset = Math.round(delta / columnSize);
      const newIndex = Math.max(0, Math.min(colors.length - 1, startIndex + indexOffset));

      setDragState((prev) => ({
        ...prev,
        currentPos: dragState.startPos + delta,
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

  // Event listeners for drag - FIXED: separated from nested useEffect
  useEffect(() => {
    if (dragState) {
      const handleMove = (e) => {
        if (e.type === 'touchmove') {
          e.preventDefault();
        }
        handleMouseMove(e);
      };

      const handleEnd = () => {
        handleMouseUp();
      };

      window.addEventListener('mousemove', handleMove);
      window.addEventListener('mouseup', handleEnd);
      window.addEventListener('touchmove', handleMove, { passive: false });
      window.addEventListener('touchend', handleEnd);
      window.addEventListener('touchcancel', handleEnd);

      document.body.style.cursor = 'grabbing';
      document.body.style.overflow = 'hidden';

      return () => {
        window.removeEventListener('mousemove', handleMove);
        window.removeEventListener('mouseup', handleEnd);
        window.removeEventListener('touchmove', handleMove);
        window.removeEventListener('touchend', handleEnd);
        window.removeEventListener('touchcancel', handleEnd);
        document.body.style.cursor = '';
        document.body.style.overflow = '';
      };
    }
  }, [dragState, handleMouseMove, handleMouseUp]);

  // ResizeObserver for stacked layout detection - FIXED: now separate useEffect
  useEffect(() => {
    const el = colorsAreaRef.current;
    if (!el) return;

    const update = () => {
      const w = el.getBoundingClientRect().width;
      const perCol = w / Math.max(1, colors.length);
      setStackColors(perCol < MIN_COL_PX);
    };

    update();

    let ro;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => update());
      ro.observe(el);
    } else {
      window.addEventListener('resize', update);
    }

    return () => {
      if (ro) ro.disconnect();
      else window.removeEventListener('resize', update);
    };
  }, [colors.length]);

  // Use correct transform direction based on orientation
  const getColumnStyle = (index, id) => {
    if (!dragState) return {};

    const { startIndex, currentIndex, startPos, currentPos, columnSize, isMobile } = dragState;
    const isDragged = id === dragState.id;
    const transformProp = isMobile ? 'translateY' : 'translateX';

    if (isDragged) {
      if (isSnapping) {
        const snapOffset = (currentIndex - startIndex) * columnSize;
        return {
          transform: `${transformProp}(${snapOffset}px)`,
          zIndex: 100,
          transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
        };
      } else {
        const offset = currentPos - startPos;
        return {
          transform: `${transformProp}(${offset}px)`,
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
      transform: shift !== 0 ? `${transformProp}(${shift * columnSize}px)` : `${transformProp}(0)`,
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
      <div className={`page-section ${currentPage === 0 ? 'visible' : 'hidden'}`}>
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
          onToggleBookmark={() => togglePanel('bookmark')}
          isBookmarkOpen={isBookmarkOpen}
          logoColors={colors}
          onLogoClick={goToGenerator}
        />

        <main className="generator-container" ref={containerRef}>
          {/* Mobile Header Row */}
          <div className="mobile-header">
            <button className="mobile-hint" onClick={() => generatePalette(colors.length)}>
              Tap to generate
            </button>

            <div className="mobile-actions">
              <button
                className={`mobile-icon-btn ${!canUndo ? 'disabled' : ''}`}
                onClick={undo}
                disabled={!canUndo}
              >
                <Undo2 size={18} />
              </button>
              <button
                className={`mobile-icon-btn ${!canRedo ? 'disabled' : ''}`}
                onClick={redo}
                disabled={!canRedo}
              >
                <Redo2 size={18} />
              </button>

              <div className="mobile-separator" />

              <button
                className={`mobile-icon-btn ${isMethodOpen ? 'active' : ''}`}
                onClick={() => togglePanel('method')}
              >
                <Sparkles size={18} />
              </button>
              <button
                className={`mobile-icon-btn ${isA11yOpen ? 'active' : ''}`}
                onClick={() => togglePanel('a11y')}
              >
                <Eye size={18} />
              </button>
              <button
                className={`mobile-icon-btn ${isHistoryOpen ? 'active' : ''}`}
                onClick={() => togglePanel('history')}
              >
                <Clock size={18} />
              </button>
              <button
                className={`mobile-icon-btn ${isExportOpen ? 'active' : ''}`}
                onClick={() => togglePanel('export')}
              >
                <Upload size={18} />
              </button>
            </div>
          </div>

          <section
            ref={colorsAreaRef}
            className={`colors-area ${stackColors ? 'stacked' : ''}`}
          >
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
                        onTouchStart={(e) => handleDragStart(e, color.id, index)}
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
                      <div className="lock-indicator" style={{ color: textColor }}>
                        <Lock size={16} />
                      </div>
                    )}
                  </div>

                  {index < colors.length - 1 && !dragState && canAddMoreColors && (
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
          </section>

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

          <BookmarkPanel
            isOpen={isBookmarkOpen}
            onClose={() => closePanel('bookmark')}
            currentUrl={getCurrentUrl()}
          />
        </main>

        {/* Chevron to landing */}
        <button className={`nav-chevron ${openPanels.length > 0 ? 'panels-open' : ''}`} onClick={goToLanding}>
          <span className="nav-chevron-label">About</span>
          <ChevronDown size={16} className="nav-chevron-icon" />
        </button>
      </div>

      {/* Landing Page */}
      <div className={`page-section landing-page ${currentPage === 1 ? 'visible' : 'hidden'}`}>
        <LandingContent onBackToGenerator={goToGenerator} />

        <button className="nav-chevron up on-light" onClick={goToGenerator}>
          <ChevronDown size={16} className="nav-chevron-icon" />
          <span className="nav-chevron-label">Generator</span>
        </button>
      </div>
    </div>
  );
}

export default ColorGenerator;