'use client';

import { useCallback, useRef } from 'react';

interface UseLongPressOptions {
  onLongPress: (event: React.MouseEvent | React.TouchEvent) => void;
  onClick?: () => void;
  threshold?: number; // Duration in ms for long press
}

export function useLongPress({
  onLongPress,
  onClick,
  threshold = 500
}: UseLongPressOptions) {
  const longPressTimeout = useRef<NodeJS.Timeout | null>(null);
  const isLongPress = useRef(false);
  const startTime = useRef(0);
  const startEvent = useRef<React.MouseEvent | React.TouchEvent | null>(null);

  const handleStart = useCallback((event: React.MouseEvent | React.TouchEvent) => {
    isLongPress.current = false;
    startTime.current = Date.now();
    startEvent.current = event;
    
    longPressTimeout.current = setTimeout(() => {
      isLongPress.current = true;
      onLongPress(event);
    }, threshold);
  }, [onLongPress, threshold]);

  const handleEnd = useCallback(() => {
    if (longPressTimeout.current) {
      clearTimeout(longPressTimeout.current);
    }
    
    // If it wasn't a long press and we have an onClick handler, call it
    if (!isLongPress.current && onClick) {
      const pressDuration = Date.now() - startTime.current;
      // Only trigger click if it was a short press (less than threshold)
      if (pressDuration < threshold) {
        onClick();
      }
    }
  }, [onClick, threshold]);

  const handleCancel = useCallback(() => {
    if (longPressTimeout.current) {
      clearTimeout(longPressTimeout.current);
    }
    isLongPress.current = false;
  }, []);

  return {
    onMouseDown: handleStart,
    onMouseUp: handleEnd,
    onMouseLeave: handleCancel,
    onTouchStart: handleStart,
    onTouchEnd: handleEnd,
    onTouchCancel: handleCancel,
    onContextMenu: (e: React.MouseEvent) => {
      // Prevent browser context menu
      e.preventDefault();
    }
  };
}
