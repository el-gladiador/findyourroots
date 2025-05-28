'use client';

import { useCallback, useRef } from 'react';

interface UseLongPressOptions {
  onLongPress: (event: React.MouseEvent | React.TouchEvent) => void;
  onClick?: () => void;
  threshold?: number; // Duration in ms for long press
  moveThreshold?: number; // Movement threshold in pixels to cancel long press
}

export function useLongPress({
  onLongPress,
  onClick,
  threshold = 500,
  moveThreshold = 10
}: UseLongPressOptions) {
  const longPressTimeout = useRef<NodeJS.Timeout | null>(null);
  const isLongPress = useRef(false);
  const startTime = useRef(0);
  const startEvent = useRef<React.MouseEvent | React.TouchEvent | null>(null);
  const startPosition = useRef<{ x: number; y: number } | null>(null);
  const hasMoved = useRef(false);

  const getEventPosition = (event: React.MouseEvent | React.TouchEvent) => {
    if ('touches' in event && event.touches.length > 0) {
      return { x: event.touches[0].clientX, y: event.touches[0].clientY };
    } else if ('clientX' in event) {
      return { x: event.clientX, y: event.clientY };
    }
    return null;
  };

  const handleStart = useCallback((event: React.MouseEvent | React.TouchEvent) => {
    // Prevent text selection and default behaviors
    event.preventDefault();
    
    isLongPress.current = false;
    hasMoved.current = false;
    startTime.current = Date.now();
    startEvent.current = event;
    startPosition.current = getEventPosition(event);
    
    // Add CSS to prevent text selection on the entire document during interaction
    document.body.style.userSelect = 'none';
    document.body.style.webkitUserSelect = 'none';
    
    longPressTimeout.current = setTimeout(() => {
      // Only trigger long press if user hasn't moved significantly
      if (!hasMoved.current) {
        isLongPress.current = true;
        onLongPress(event);
      }
    }, threshold);
  }, [onLongPress, threshold]);

  const handleMove = useCallback((event: React.MouseEvent | React.TouchEvent) => {
    if (!startPosition.current) return;
    
    const currentPosition = getEventPosition(event);
    if (!currentPosition) return;
    
    const deltaX = Math.abs(currentPosition.x - startPosition.current.x);
    const deltaY = Math.abs(currentPosition.y - startPosition.current.y);
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    // If user has moved beyond threshold, cancel long press
    if (distance > moveThreshold) {
      hasMoved.current = true;
      if (longPressTimeout.current) {
        clearTimeout(longPressTimeout.current);
        longPressTimeout.current = null;
      }
    }
  }, [moveThreshold]);

  const handleEnd = useCallback(() => {
    // Restore text selection
    document.body.style.userSelect = '';
    document.body.style.webkitUserSelect = '';
    
    if (longPressTimeout.current) {
      clearTimeout(longPressTimeout.current);
      longPressTimeout.current = null;
    }
    
    // If it wasn't a long press, wasn't moved significantly, and we have an onClick handler, call it
    if (!isLongPress.current && !hasMoved.current && onClick) {
      const pressDuration = Date.now() - startTime.current;
      // Only trigger click if it was a short press (less than threshold)
      if (pressDuration < threshold) {
        onClick();
      }
    }
    
    // Reset state
    startPosition.current = null;
    hasMoved.current = false;
  }, [onClick, threshold]);

  const handleCancel = useCallback(() => {
    // Restore text selection
    document.body.style.userSelect = '';
    document.body.style.webkitUserSelect = '';
    
    if (longPressTimeout.current) {
      clearTimeout(longPressTimeout.current);
      longPressTimeout.current = null;
    }
    isLongPress.current = false;
    hasMoved.current = false;
    startPosition.current = null;
  }, []);

  return {
    onMouseDown: handleStart,
    onMouseMove: handleMove,
    onMouseUp: handleEnd,
    onMouseLeave: handleCancel,
    onTouchStart: handleStart,
    onTouchMove: handleMove,
    onTouchEnd: handleEnd,
    onTouchCancel: handleCancel,
    onContextMenu: (e: React.MouseEvent) => {
      // Prevent browser context menu
      e.preventDefault();
    },
    onDragStart: (e: React.DragEvent) => {
      // Prevent drag behavior that can interfere with long press
      e.preventDefault();
    },
    style: {
      // Prevent text selection and touch callouts
      userSelect: 'none' as const,
      WebkitUserSelect: 'none' as const,
      WebkitTouchCallout: 'none' as const,
      WebkitTapHighlightColor: 'transparent',
    }
  };
}
