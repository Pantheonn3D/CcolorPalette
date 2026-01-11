import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Plus,
  X,
  Copy,
  Lock,
  Unlock,
  ArrowLeftRight,
  ArrowDownUp,
  SwatchBook,
  Check,
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
import './ColorGenerator.css';
import { trackEvent } from '../utils/analytics';

import {
  generateRandomPalette,
  getContrastColor,
  generateBridgeColor,
  simulateColorBlindness,
  generateShades,
  generateRichSEO,
  hexToHsl,
} from '../utils/colorUtils';

// Constants
const MAX_HISTORY = 50;
const MAX_COLORS = 8;
const MIN_COL_PX = 128;
const MOBILE_BREAKPOINT = 768;
const MOBILE_SHADE_COUNT = 6;
const DESKTOP_SHADE_COUNT = 20;

// Helpers
const generateId = () => Math.random().toString(36).substring(2, 11);

const createColorObjects = (hexArray) =>
  hexArray.map((hex) => ({
    id: generateId(),
    hex,
    locked: false,
  }));

const isMobileView = () => window.innerWidth <= MOBILE_BREAKPOINT;

const getMaxOpenPanels = () => (isMobileView() ? 1 : 3);

const hexToRgb = (hex) => ({
  r: parseInt(hex.slice(1, 3), 16),
  g: parseInt(hex.slice(3, 5), 16),
  b: parseInt(hex.slice(5, 7), 16),
});

const formatContentSections = (content) => {
  if (!content) return [];
  return content.split('\n\n').map((section, index) => {
    const colonIndex = section.indexOf(':');
    if (colonIndex > 0 && colonIndex < 50) {
      return {
        id: index,
        title: section.substring(0, colonIndex).trim(),
        body: section.substring(colonIndex + 1).trim(),
        hasTitle: true,
      };
    }
    return { id: index, title: '', body: section, hasTitle: false };
  });
};

function ColorGenerator() {
  // Refs
  const containerRef = useRef(null);
  const colorsAreaRef = useRef(null);

  // Layout State
  const [stackColors, setStackColors] = useState(false);

  const isVerticalLayout = useCallback(
    () => isMobileView() || stackColors,
    [stackColors]
  );

  const DragIcon = isVerticalLayout() ? ArrowDownUp : ArrowLeftRight;

  // History State
  const [history, setHistory] = useState(() => [
    { 
      colors: createColorObjects(generateRandomPalette()), 
      visionMode: 'normal' 
    },
  ]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // FIX 1: Create a ref to track the live history index
  const historyIndexRef = useRef(historyIndex);

  // FIX 2: Keep the ref synced with state
  useEffect(() => {
    historyIndexRef.current = historyIndex;
  }, [historyIndex]);

  // Panel State
  const [openPanels, setOpenPanels] = useState([]);

  // Generation Settings
  const [generationMode, setGenerationMode] = useState('auto');
  const [constraints, setConstraints] = useState({
    mood: 'any',
    minContrast: 1.5,
    darkModeFriendly: false,
  });

  // Accessibility
  const [colorBlindMode, setColorBlindMode] = useState('normal');

  // Core Data
  const currentEntry = history[historyIndex] || history[history.length - 1];
  const colors = currentEntry ? (Array.isArray(currentEntry) ? currentEntry : currentEntry.colors) : [];

  // UI State
  const [newColorId, setNewColorId] = useState(null);
  const [removingId, setRemovingId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [activeShadeId, setActiveShadeId] = useState(null);
  const [editingId, setEditingId] = useState(null); // ID of the color being edited
  const [editValue, setEditValue] = useState('');   // Temporary value of the input

  // Drag State
  const [dragState, setDragState] = useState(null);
  const [isSnapping, setIsSnapping] = useState(false);

  // Computed Values
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;
  const canAddMoreColors = colors.length < MAX_COLORS;

  // Panel Helpers
  const isPanelOpen = (name) => openPanels.includes(name);
  const isMethodOpen = isPanelOpen('method');
  const isA11yOpen = isPanelOpen('a11y');
  const isHistoryOpen = isPanelOpen('history');
  const isExportOpen = isPanelOpen('export');
  const isBookmarkOpen = isPanelOpen('bookmark');

  const togglePanel = (panelName) => {
    setOpenPanels((prev) => {
      if (prev.includes(panelName)) {
        return prev.filter((p) => p !== panelName);
      }
      const maxPanels = getMaxOpenPanels();
      let newPanels = [...prev, panelName];
      if (newPanels.length > maxPanels) {
        newPanels = newPanels.slice(-maxPanels);
      }
      return newPanels;
    });
  };

  const closePanel = (panelName) => {
    setOpenPanels((prev) => prev.filter((p) => p !== panelName));
  };

  // URL Helpers
  const getCurrentUrl = useCallback(() => {
    if (typeof window === 'undefined') return '';
    const hexPath = colors.map(c => c.hex.replace('#', '')).join('-');
    return `${window.location.origin}/${hexPath}`;
  }, [colors]);

  const getShareUrl = useCallback(() => {
    const hexes = colors.map((c) => c.hex.replace('#', '')).join('-');
    const params = new URLSearchParams();

    if (generationMode !== 'auto') params.set('mode', generationMode);
    if (constraints.mood !== 'any') params.set('mood', constraints.mood);
    if (constraints.minContrast !== 1.5) params.set('contrast', constraints.minContrast.toString());
    if (constraints.darkModeFriendly) params.set('dark', '1');
    if (colorBlindMode !== 'normal') params.set('vision', colorBlindMode);

    const queryString = params.toString();
    return `${window.location.origin}/${hexes}${queryString ? '?' + queryString : ''}`;
  }, [colors, generationMode, constraints, colorBlindMode]);

  // History Management
  const updateColors = useCallback(
    (newColors) => {
      setHistory((prev) => {
        const currentIndex = historyIndexRef.current;
        const newHistory = prev.slice(0, currentIndex + 1);
        
        // NEW: Store as an object so HistoryPanel can see the vision mode
        newHistory.push({
          colors: newColors,
          visionMode: colorBlindMode // This captures the current state
        });
        
        if (newHistory.length > MAX_HISTORY) {
          newHistory.shift();
          return newHistory;
        }
        return newHistory;
      });
      setHistoryIndex((prev) => {
        const nextIndex = prev + 1;
        return nextIndex >= MAX_HISTORY ? MAX_HISTORY - 1 : nextIndex;
      });
    },
    [historyIndex, colorBlindMode] // Added colorBlindMode to dependencies
  );

  const undo = useCallback(() => {
    if (canUndo) {
      trackEvent('palette_undo');
      setHistoryIndex((prev) => prev - 1);
    }
  }, [canUndo]);

  const redo = useCallback(() => {
    if (canRedo) {
      trackEvent('palette_redo');
      setHistoryIndex((prev) => prev + 1);
    }
  }, [canRedo]);

  const goToHistoryIndex = useCallback(
    (index) => {
      if (index >= 0 && index < history.length) {
        setHistoryIndex(index);
      }
    },
    [history.length]
  );

  // Palette Generation
  const generatePalette = useCallback(
    (count = 5) => {
      const lockedColors = colors.filter((c) => c.locked);
      const unlockedCount = count - lockedColors.length;

      if (unlockedCount <= 0) return;

      // FIX: Calculate a "seed" from the locked colors
      let generationConstraints = { ...constraints };
      
      if (lockedColors.length > 0) {
        // Use the first locked color as the anchor for harmony
        // (You could also average them, but using the first is safer)
        const lockedHsl = hexToHsl(lockedColors[0].hex);
        generationConstraints.baseHue = lockedHsl.h;
      }

      // Pass the updated constraints
      const newPalette = generateRandomPalette(generationMode, unlockedCount, generationConstraints);
      
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

  // Color Actions
  const addColorAtIndex = (index) => {
    trackEvent('add_color', { current_count: colors.length });
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
    trackEvent('remove_color', { current_count: colors.length });
    if (colors.length <= 2) return;

    setRemovingId(id);
    setTimeout(() => {
      updateColors(colors.filter((c) => c.id !== id));
      setRemovingId(null);
    }, 350);
  };

  const toggleLock = (id) => {
    const isLocking = !colors.find(c => c.id === id).locked;
    trackEvent('toggle_lock', { action: isLocking ? 'lock' : 'unlock' });
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

  // --- Hex Editing Handlers ---

  const handleHexClick = (id, currentHex, e) => {
    e.stopPropagation(); // Prevent dragging or other card clicks
    setEditingId(id);
    setEditValue(currentHex.replace('#', '')); // Show without hash for easier typing
  };

  const commitHexChange = (id) => {
    if (!editValue) {
      setEditingId(null);
      return;
    }

    // Validate Hex (allow 3 or 6 chars)
    const validHexPattern = /^([0-9A-F]{3}){1,2}$/i;
    let cleanHex = editValue.replace(/[^0-9A-F]/gi, '').toUpperCase();

    if (validHexPattern.test(cleanHex)) {
      // Expand 3-char hex to 6-char
      if (cleanHex.length === 3) {
        cleanHex = cleanHex.split('').map(char => char + char).join('');
      }
      
      const newFullHex = `#${cleanHex}`;
      
      // Update state: Set new hex AND lock the color
      updateColors(colors.map(c => {
        if (c.id === id) {
          return { ...c, hex: newFullHex, locked: true }; // Lock it!
        }
        return c;
      }));
    } 
    
    // Reset editing state
    setEditingId(null);
    setEditValue('');
  };

  const handleHexKeyDown = (e, id) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      commitHexChange(id);
    } else if (e.key === 'Escape') {
      // Cancel editing
      setEditingId(null);
      setEditValue('');
    }
  };

  // Shade Picker
  const toggleShadePicker = (id) => {
    setActiveShadeId((prev) => (prev === id ? null : id));
  };

  const pickShade = (originalId, newHex) => {
    trackEvent('pick_shade_variation');
    updateColors(colors.map((c) => (c.id === originalId ? { ...c, hex: newHex } : c)));
    setActiveShadeId(null);
  };

  const handleMouseLeave = () => {
    if (window.innerWidth > MOBILE_BREAKPOINT) {
      setActiveShadeId(null);
    }
  };

  // Click Outside Handler for Shade Picker
  useEffect(() => {
    if (!activeShadeId) return;

    const handleClickOutside = (e) => {
      if (e.target.closest('.shade-container')) return;
      setActiveShadeId(null);
    };

    window.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('touchstart', handleClickOutside);

    return () => {
      window.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('touchstart', handleClickOutside);
    };
  }, [activeShadeId]);

  // Constants - add this new one
const HEADER_OFFSET = 100; // Height reserved for floating header in stacked mode


// Updated getColumnSize function
const getColumnSize = useCallback(() => {
  if (!containerRef.current) return 0;

  const vertical = isVerticalLayout();
  const isMobile = isMobileView();

  if (vertical) {
    const colorsArea = colorsAreaRef.current;
    if (!colorsArea) return 0;

    const areaHeight = colorsArea.offsetHeight;

    // On desktop stacked mode, the first color has extra padding for the header
    // We need to calculate the "uniform" size for drag calculations
    if (stackColors && !isMobile && colors.length > 0) {
      // Subtract the header offset from total height, then divide evenly
      const effectiveHeight = areaHeight - HEADER_OFFSET;
      return effectiveHeight / colors.length;
    }

    // Mobile - all colors are uniform
    return areaHeight / colors.length;
  } else {
    // Horizontal mode
    let panelWidth = 0;
    if (isMethodOpen) panelWidth += 240;
    if (isA11yOpen) panelWidth += 280;
    if (isHistoryOpen) panelWidth += 260;
    if (isExportOpen) panelWidth += 320;
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
  stackColors,
]);

// Updated handleDragStart to account for header offset
const handleDragStart = (e, id, index) => {
  if (e.type === 'touchstart') e.preventDefault();

  const columnSize = getColumnSize();
  const vertical = isVerticalLayout();
  const isMobile = isMobileView();

  let clientPos;
  if (e.type === 'touchstart') {
    clientPos = vertical ? e.touches[0].clientY : e.touches[0].clientX;
  } else {
    e.preventDefault();
    clientPos = vertical ? e.clientY : e.clientX;
  }

  // In desktop stacked mode, adjust startPos to account for header offset
  // This makes the drag math work correctly
  let adjustedStartPos = clientPos;
  if (stackColors && !isMobile && vertical) {
    // The first color starts after the header offset
    // Normalize the position as if all colors were uniform from the top
    const colorsArea = colorsAreaRef.current;
    if (colorsArea) {
      const areaRect = colorsArea.getBoundingClientRect();
      const relativePos = clientPos - areaRect.top - HEADER_OFFSET;
      adjustedStartPos = areaRect.top + relativePos;
    }
  }

  setDragState({
    id,
    startIndex: index,
    currentIndex: index,
    startPos: adjustedStartPos,
    currentPos: adjustedStartPos,
    columnSize,
    isMobile: vertical,
    isDesktopStacked: stackColors && !isMobile && vertical,
    areaTop: colorsAreaRef.current?.getBoundingClientRect().top || 0,
  });
};

// Updated handleMouseMove to handle desktop stacked mode correctly
const handleMouseMove = useCallback(
  (e) => {
    if (!dragState || isSnapping) return;

    const { startIndex, columnSize, isMobile, isDesktopStacked, areaTop } = dragState;

    let clientPos;
    if (e.type === 'touchmove') {
      clientPos = isMobile ? e.touches[0].clientY : e.touches[0].clientX;
    } else {
      clientPos = isMobile ? e.clientY : e.clientX;
    }

    // Adjust position for desktop stacked mode
    let adjustedCurrentPos = clientPos;
    if (isDesktopStacked) {
      const relativePos = clientPos - areaTop - HEADER_OFFSET;
      adjustedCurrentPos = areaTop + relativePos;
    }

    let delta = adjustedCurrentPos - dragState.startPos;

    // Clamp delta to valid range
    const maxNegativeOffset = -startIndex * columnSize;
    const maxPositiveOffset = (colors.length - 1 - startIndex) * columnSize;
    delta = Math.max(maxNegativeOffset, Math.min(maxPositiveOffset, delta));

    const indexOffset = Math.round(delta / columnSize);
    const newIndex = Math.max(0, Math.min(colors.length - 1, startIndex + indexOffset));

    setDragState((prev) => ({
      ...prev,
      currentPos: adjustedCurrentPos,
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

  // Drag Event Listeners
  useEffect(() => {
    if (!dragState) return;

    const handleMove = (e) => {
      if (e.type === 'touchmove') e.preventDefault();
      handleMouseMove(e);
    };

    const handleEnd = () => handleMouseUp();

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
  }, [dragState, handleMouseMove, handleMouseUp]);

// Updated getColumnStyle to handle desktop stacked mode
const getColumnStyle = (index, id) => {
  if (!dragState) return {};

  const { startIndex, currentIndex, startPos, currentPos, columnSize, isMobile, isDesktopStacked } =
    dragState;
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
    }

    const offset = currentPos - startPos;
    return {
      transform: `${transformProp}(${offset}px)`,
      zIndex: 100,
      transition: 'none',
    };
  }

  // Calculate shift for non-dragged items
  let shift = 0;
  if (startIndex < currentIndex && index > startIndex && index <= currentIndex) {
    shift = -1;
  }
  if (startIndex > currentIndex && index >= currentIndex && index < startIndex) {
    shift = 1;
  }

  return {
    transform: shift !== 0 ? `${transformProp}(${shift * columnSize}px)` : `${transformProp}(0)`,
    transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
  };
};

// Updated layout detection - ensure mobile always works correctly
useEffect(() => {
  const el = colorsAreaRef.current;
  if (!el) return;

  const update = () => {
    // On mobile, don't use stackColors - CSS handles the layout
    // stackColors is ONLY for desktop narrow-width scenarios
    if (isMobileView()) {
      setStackColors(false);
      return;
    }

    const w = el.getBoundingClientRect().width;
    const perCol = w / Math.max(1, colors.length);
    setStackColors(perCol < MIN_COL_PX);
  };

  update();

  let ro;
  if (typeof ResizeObserver !== 'undefined') {
    ro = new ResizeObserver(update);
    ro.observe(el);
  } else {
    window.addEventListener('resize', update);
  }

  return () => {
    if (ro) ro.disconnect();
    else window.removeEventListener('resize', update);
  };
}, [colors.length]);

  // URL Parsing on Mount
  useEffect(() => {
    const parseUrlState = () => {
      const path = window.location.pathname.slice(1);
      const params = new URLSearchParams(window.location.search);

      if (path === 'home') return;

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

      // Parse query params
      const mode = params.get('mode');
      const mood = params.get('mood');
      const contrast = parseFloat(params.get('contrast'));
      const dark = params.get('dark');
      const vision = params.get('vision');

      if (['auto', 'mono', 'analogous', 'complementary', 'splitComplementary', 'triadic'].includes(mode)) {
        setGenerationMode(mode);
      }
      if (['any', 'muted', 'pastel', 'vibrant', 'dark'].includes(mood)) {
        setConstraints((prev) => ({ ...prev, mood }));
      }
      if (!isNaN(contrast) && contrast >= 1 && contrast <= 4.5) {
        setConstraints((prev) => ({ ...prev, minContrast: contrast }));
      }
      if (dark === '1') {
        setConstraints((prev) => ({ ...prev, darkModeFriendly: true }));
      }
      if (['normal', 'protanopia', 'deuteranopia', 'tritanopia', 'achromatopsia'].includes(vision)) {
        setColorBlindMode(vision);
      }
    };

    parseUrlState();
  }, []);

  // Update URL on State Change
  useEffect(() => {
    const hexes = colors.map((c) => c.hex.replace('#', '')).join('-');
    const params = new URLSearchParams();

    if (generationMode !== 'auto') params.set('mode', generationMode);
    if (constraints.mood !== 'any') params.set('mood', constraints.mood);
    if (constraints.minContrast !== 1.5) params.set('contrast', constraints.minContrast.toString());
    if (constraints.darkModeFriendly) params.set('dark', '1');
    if (colorBlindMode !== 'normal') params.set('vision', colorBlindMode);

    const queryString = params.toString();
    window.history.replaceState({}, '', `/${hexes}${queryString ? '?' + queryString : ''}`);
  }, [colors, generationMode, constraints, colorBlindMode]);

  // Expose API
  useEffect(() => {
    window.chromaAPI = {
      undo,
      redo,
      canUndo: () => canUndo,
      canRedo: () => canRedo,
      getShareUrl,
    };
  }, [undo, redo, canUndo, canRedo, getShareUrl]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
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
  }, [undo, redo, colors.length, generatePalette]);

  // Color Display
  const getDisplayColor = (hex) => {
    if (colorBlindMode === 'normal') return hex;
    return simulateColorBlindness(hex, colorBlindMode);
  };

  // SEO Data
  const currentHexes = useMemo(() => colors.map((c) => c.hex), [colors]);
  const seoData = useMemo(
    () => generateRichSEO(currentHexes, generationMode, constraints.mood),
    [currentHexes, generationMode, constraints.mood]
  );

  const currentCanonical = useMemo(() => {
    if (typeof window === 'undefined') return '';
    const hexPath = colors.map(c => c.hex.replace('#', '')).join('-');
    return `${window.location.origin}/${hexPath}`;
  }, [colors]);
  const contentSections = useMemo(() => formatContentSections(seoData.content), [seoData.content]);

  const ogImageUrl = useMemo(() => {
    if (typeof window === 'undefined') return 'https://ccolorpalette.com/og-image.png'; // Fallback
    const hexPath = colors.map(c => c.hex.replace('#', '')).join('-');
    // Point to the Netlify function
    return `${window.location.origin}/.netlify/functions/og-image?colors=${hexPath}`;
  }, [colors]);

  const structuredData = useMemo(() => {
    const colorItems = colors.map((c, index) => {
      const rgb = hexToRgb(c.hex);
      const hsl = hexToHsl(c.hex);
      return {
        '@type': 'Thing',
        name: `Color ${index + 1}`,
        description: `${c.hex} - RGB(${rgb.r}, ${rgb.g}, ${rgb.b}) - HSL(${Math.round(hsl.h)}, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%)`,
        identifier: c.hex,
      };
    });

    return {
      '@context': 'https://schema.org',
      '@type': 'CreativeWork',
      name: seoData.title,
      description: seoData.meta,
      url: currentCanonical,
      creator: { '@type': 'Organization', name: 'CcolorPalette' },
      keywords: seoData.keywords?.join(', ') || '',
      about: colorItems,
      additionalProperty: seoData.traits
        ? [
            { '@type': 'PropertyValue', name: 'Color Harmony', value: seoData.traits.harmony },
            { '@type': 'PropertyValue', name: 'Color Temperature', value: seoData.traits.temperature },
            { '@type': 'PropertyValue', name: 'Saturation Level', value: seoData.traits.saturation },
            { '@type': 'PropertyValue', name: 'Primary Hue', value: seoData.traits.primaryHue },
            { '@type': 'PropertyValue', name: 'Accessibility Score', value: seoData.traits.accessibilityScore },
          ]
        : [],
    };
  }, [colors, seoData, currentCanonical]);

  return (
    <div className="app-wrapper">
      <Helmet>
        <title>{seoData.title} | CcolorPalette</title>
        <meta name="description" content={seoData.meta} />
        <link rel="canonical" href={currentCanonical} />
        {seoData.keywords?.length > 0 && (
          <meta name="keywords" content={seoData.keywords.slice(0, 10).join(', ')} />
        )}
        <meta property="og:image" content={ogImageUrl} />
        <meta property="og:description" content={seoData.meta} />
        <meta property="og:url" content={currentCanonical} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="CcolorPalette" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={ogImageUrl} />
        <meta name="twitter:title" content={seoData.title} />
        <meta name="twitter:description" content={seoData.meta} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="CcolorPalette" />
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      </Helmet>

      <div className="page-section visible">
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
          onLogoClick={() => generatePalette(colors.length)}
        />

        <main className="generator-container" ref={containerRef}>
          {/* Mobile Header */}
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

          {/* Colors Area */}
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
              const isShadePicking = activeShadeId === color.id;
              const columnStyle = getColumnStyle(index, color.id);

              return (
                <React.Fragment key={color.id}>
                  <div
                    className={`color-column ${isNew ? 'color-entering' : ''} ${isRemoving ? 'color-removing' : ''} ${isDragging ? 'is-dragging' : ''} ${dragState && !isDragging ? 'is-shifting' : ''}`}
                    style={{ backgroundColor: displayHex, ...columnStyle }}
                  >
                    {isShadePicking ? (
                      <div className="shade-container" onMouseLeave={handleMouseLeave}>
                        {generateShades(color.hex, isMobileView() ? MOBILE_SHADE_COUNT : DESKTOP_SHADE_COUNT).map(
                          (shadeHex) => (
                            <button
                              key={shadeHex}
                              className="shade-step"
                              style={{ backgroundColor: shadeHex }}
                              onClick={(e) => {
                                e.stopPropagation();
                                pickShade(color.id, shadeHex);
                              }}
                              title={shadeHex}
                            />
                          )
                        )}
                        <button
                          className="shade-close-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleShadePicker(null);
                          }}
                        >
                          <X size={20} />
                        </button>
                      </div>
                    ) : (
                      <>
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

                          <button
                            className={`toolbar-btn ${isShadePicking ? 'active' : ''}`}
                            title="Adjust shade"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleShadePicker(color.id);
                              e.currentTarget.blur();
                            }}
                            style={{ color: textColor }}
                          >
                            <SwatchBook size={20} />
                          </button>

                          <div
                            className="toolbar-btn drag-handle"
                            title="Drag to reorder"
                            style={{ color: textColor }}
                            onMouseDown={(e) => handleDragStart(e, color.id, index)}
                            onTouchStart={(e) => handleDragStart(e, color.id, index)}
                          >
                            <DragIcon size={20} />
                          </div>
                        </div>

                        <div className="color-content">
                          {editingId === color.id ? (
                            <div className="hex-input-wrapper">
                                <input
                                  autoFocus
                                  className="hex-input"
                                  style={{ color: textColor }}
                                  value={editValue}
                                  onChange={(e) => {
                                    // 1. Strip the '#' and any non-hex characters immediately
                                    let val = e.target.value.replace(/[^0-9A-F]/gi, '').toUpperCase();
                                    
                                    // 2. Limit to 6 characters so it doesn't overflow
                                    if (val.length > 6) val = val.slice(0, 6);
                                    
                                    setEditValue(val);
                                  }}
                                  onBlur={() => commitHexChange(color.id)}
                                  onKeyDown={(e) => handleHexKeyDown(e, color.id)}
                                  onClick={(e) => e.stopPropagation()}
                                />
                            </div>
                          ) : (
                            <h2
                              className={`color-hex ${isCopied ? 'copied' : ''}`}
                              style={{ color: textColor }}
                              onClick={(e) => handleHexClick(color.id, color.hex, e)}
                              title="Click to edit"
                            >
                              {isCopied ? 'Copied!' : color.hex.replace('#', '')}
                            </h2>
                          )}
                        </div>

                        {color.locked && (
                          <div className="lock-indicator" style={{ color: textColor }}>
                            <Lock size={16} />
                          </div>
                        )}
                      </>
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

          {/* Panels */}
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
            generationMode={generationMode}
            constraints={constraints}
            colorBlindMode={colorBlindMode}
          />

          <BookmarkPanel
            isOpen={isBookmarkOpen}
            onClose={() => closePanel('bookmark')}
            currentUrl={getCurrentUrl()}
          />
        </main>
      </div>

      {/* SEO Footer */}
      <footer className="seo-content-footer">
        <div className="seo-content-wrapper">
          <h1 className="seo-main-title">{seoData.title}</h1>

          {seoData.traits && (
            <div className="seo-palette-summary">
              <span className="seo-trait">{seoData.traits.harmony} harmony</span>
              <span className="seo-trait-separator">|</span>
              <span className="seo-trait">{seoData.traits.temperature} temperature</span>
              <span className="seo-trait-separator">|</span>
              <span className="seo-trait">{seoData.traits.saturation} saturation</span>
              <span className="seo-trait-separator">|</span>
              <span className="seo-trait">{seoData.traits.accessibilityScore} accessibility</span>
            </div>
          )}

          
          <div className="seo-related-links">
            <h3 className="seo-section-title">Explore Related Palettes</h3>
            <div>
              {Array.from({ length: 6 }).map((_, i) => {
                // NEW: Use the first color of the CURRENT palette as a "seed"
                // This ensures this page always suggests similar "vibe" palettes
                const baseHex = colors[0].hex; 
                const randomHexes = generateRandomPalette('analogous', 5, { seed: baseHex + i })
                  .map((h) => h.replace('#', ''));
                  
                return (
                  <a key={i} href={`/${randomHexes.join('-')}`}>
                    {/* Use the traits to give the link a better name for SEO */}
                    Similar {seoData.traits?.temperature || 'Modern'} Palette {i + 1}
                  </a>
                );
              })}
            </div>
          </div>
          

          <div className="seo-color-reference">
            <h2 className="seo-section-title">Color Values</h2>
            <div className="seo-color-grid">
              {colors.map((c) => {
                const rgb = hexToRgb(c.hex);
                const hsl = hexToHsl(c.hex);
                return (
                  <div key={c.id} className="seo-color-item">
                    <div className="seo-color-swatch" style={{ backgroundColor: c.hex }} />
                    <div className="seo-color-values">
                      <span className="seo-hex">{c.hex}</span>
                      <span className="seo-rgb">RGB({rgb.r}, {rgb.g}, {rgb.b})</span>
                      <span className="seo-hsl">HSL({Math.round(hsl.h)}, {Math.round(hsl.s)}%, {Math.round(hsl.l)}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <article className="seo-article">
            {contentSections.map((section) => (
              <section key={section.id} className="seo-section">
                {section.hasTitle && <h2 className="seo-section-title">{section.title}</h2>}
                <p className="seo-section-body">{section.body}</p>
              </section>
            ))}
          </article>

          {seoData.keywords?.length > 0 && (
            <div className="seo-keywords">
              <span className="seo-keywords-label">Related searches: </span>
              {seoData.keywords.slice(0, 8).map((keyword, index) => (
                <span key={index} className="seo-keyword">
                  {keyword}
                  {index < Math.min(seoData.keywords.length, 8) - 1 && ', '}
                </span>
              ))}
            </div>
          )}
        </div>
      </footer>
    </div>
  );
}

export default ColorGenerator;