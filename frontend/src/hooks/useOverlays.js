import { useState, useCallback } from 'react';
import { OVERLAY_DEFAULTS } from '../utils/constants';

export const useOverlays = (currentTime, duration) => {
  const [overlays, setOverlays] = useState([]);
  const [selectedOverlay, setSelectedOverlay] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const generateId = () => `overlay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Save state to history
  const saveToHistory = useCallback((newOverlays) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(newOverlays)));
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  const addTextOverlay = () => {
    const newOverlay = {
      id: generateId(),
      type: 'text',
      content: 'Sample Text',
      x: 50,
      y: 50,
      width: OVERLAY_DEFAULTS.text.width,
      height: OVERLAY_DEFAULTS.text.height,
      fontSize: OVERLAY_DEFAULTS.text.fontSize,
      color: OVERLAY_DEFAULTS.text.color,
      startTime: currentTime,
      endTime: Math.min(currentTime + 3, duration),
    };
    const newOverlays = [...overlays, newOverlay];
    setOverlays(newOverlays);
    setSelectedOverlay(newOverlay.id);
    saveToHistory(newOverlays);
    return newOverlay;
  };

  const addImageOverlay = async (imageAsset) => {
    if (!imageAsset) return null;
    
    const newOverlay = {
      id: generateId(),
      type: 'image',
      uri: imageAsset.uri,
      x: 50,
      y: 50,
      width: OVERLAY_DEFAULTS.image.width,
      height: OVERLAY_DEFAULTS.image.height,
      startTime: currentTime,
      endTime: Math.min(currentTime + 3, duration),
    };
    const newOverlays = [...overlays, newOverlay];
    setOverlays(newOverlays);
    setSelectedOverlay(newOverlay.id);
    saveToHistory(newOverlays);
    return newOverlay;
  };

  const addVideoOverlay = async (videoAsset) => {
    if (!videoAsset) return null;
    
    const newOverlay = {
      id: generateId(),
      type: 'video',
      uri: videoAsset.uri,
      x: 50,
      y: 50,
      width: OVERLAY_DEFAULTS.video.width,
      height: OVERLAY_DEFAULTS.video.height,
      startTime: currentTime,
      endTime: Math.min(currentTime + 3, duration > 0 ? duration : currentTime + 3),
    };
    const newOverlays = [...overlays, newOverlay];
    setOverlays(newOverlays);
    setSelectedOverlay(newOverlay.id);
    saveToHistory(newOverlays);
    return newOverlay;
  };

  const updateOverlay = (id, updates) => {
    const newOverlays = overlays.map(overlay => 
      overlay.id === id ? { ...overlay, ...updates } : overlay
    );
    setOverlays(newOverlays);
    saveToHistory(newOverlays);
  };

  const deleteOverlay = (id) => {
    const newOverlays = overlays.filter(overlay => overlay.id !== id);
    setOverlays(newOverlays);
    if (selectedOverlay === id) {
      setSelectedOverlay(null);
    }
    saveToHistory(newOverlays);
  };

  const resetOverlays = () => {
    setOverlays([]);
    setSelectedOverlay(null);
    setHistory([]);
    setHistoryIndex(-1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setOverlays(JSON.parse(JSON.stringify(history[newIndex])));
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setOverlays(JSON.parse(JSON.stringify(history[newIndex])));
    }
  };

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  return {
    overlays,
    selectedOverlay,
    setSelectedOverlay,
    addTextOverlay,
    addImageOverlay,
    addVideoOverlay,
    updateOverlay,
    deleteOverlay,
    resetOverlays,
    undo,
    redo,
    canUndo,
    canRedo,
  };
};
