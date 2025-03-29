import { useState, useEffect } from "react";

interface SwipeResult {
  isDown: boolean;
  isDragging: boolean;
  startX: number;
  startY: number;
  deltaX: number;
  deltaY: number;
  direction: 'left' | 'right' | null;
  progress: number;
  handleMouseDown: (e: React.MouseEvent | React.TouchEvent) => void;
  handleMouseMove: (e: React.MouseEvent | React.TouchEvent) => void;
  handleMouseUp: (e: React.MouseEvent | React.TouchEvent) => void;
  handleMouseLeave: () => void;
  resetSwipe: () => void;
}

export const useSwiping = (threshold: number = 100, onSwipeLeft?: () => void, onSwipeRight?: () => void): SwipeResult => {
  const [isDown, setIsDown] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [deltaX, setDeltaX] = useState(0);
  const [deltaY, setDeltaY] = useState(0);
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);
  const [progress, setProgress] = useState(0);

  // Reset if callbacks change
  useEffect(() => {
    resetSwipe();
  }, [onSwipeLeft, onSwipeRight]);

  const getClientX = (e: React.MouseEvent | React.TouchEvent): number => {
    if ('touches' in e) {
      return e.touches[0].clientX;
    }
    return e.clientX;
  };

  const getClientY = (e: React.MouseEvent | React.TouchEvent): number => {
    if ('touches' in e) {
      return e.touches[0].clientY;
    }
    return e.clientY;
  };

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDown(true);
    setStartX(getClientX(e));
    setStartY(getClientY(e));
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDown) return;

    const x = getClientX(e);
    const y = getClientY(e);
    const dx = x - startX;
    const dy = y - startY;

    // Only set dragging after a minimum movement
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
      setIsDragging(true);
    }

    setDeltaX(dx);
    setDeltaY(dy);

    // Calculate swipe progress as percentage of threshold
    const curProgress = Math.min(Math.abs(dx) / threshold, 1);
    setProgress(curProgress);

    // Determine direction
    if (dx < 0) {
      setDirection('left');
    } else {
      setDirection('right');
    }
  };

  const handleMouseUp = (e: React.MouseEvent | React.TouchEvent) => {
    if (isDown && isDragging) {
      // Check if exceeded threshold
      if (Math.abs(deltaX) >= threshold) {
        if (deltaX < 0 && onSwipeLeft) {
          onSwipeLeft();
        } else if (deltaX > 0 && onSwipeRight) {
          onSwipeRight();
        }
      }
    }

    resetSwipe();
  };

  const handleMouseLeave = () => {
    resetSwipe();
  };

  const resetSwipe = () => {
    setIsDown(false);
    setIsDragging(false);
    setDeltaX(0);
    setDeltaY(0);
    setDirection(null);
    setProgress(0);
  };

  return {
    isDown,
    isDragging,
    startX,
    startY,
    deltaX,
    deltaY,
    direction,
    progress,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleMouseLeave,
    resetSwipe
  };
};

export default useSwiping;
