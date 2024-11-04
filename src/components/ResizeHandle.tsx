import React, { useCallback, useEffect, useState } from 'react';

interface ResizeHandleProps {
  onResize: (size: number) => void;
  minSize?: number;
  maxSize?: number;
  isRightPanel?: boolean;
  isHorizontal?: boolean;
}

export const ResizeHandle: React.FC<ResizeHandleProps> = ({
  onResize,
  minSize = 200,
  maxSize = 800,
  isRightPanel = false,
  isHorizontal = false
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [initialPos, setInitialPos] = useState(0);
  const [initialSize, setInitialSize] = useState(0);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setInitialPos(isHorizontal ? e.clientY : e.clientX);
    
    const rect = e.currentTarget.parentElement?.getBoundingClientRect();
    if (rect) {
      setInitialSize(isHorizontal ? rect.height : (isRightPanel ? window.innerWidth - rect.right : rect.width));
    }
  }, [isHorizontal, isRightPanel]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;

    requestAnimationFrame(() => {
      const currentPos = isHorizontal ? e.clientY : e.clientX;
      const delta = currentPos - initialPos;

      let newSize;
      if (isHorizontal) {
        newSize = Math.min(Math.max(initialSize - delta, minSize), maxSize);
      } else if (isRightPanel) {
        newSize = Math.min(Math.max(initialSize - delta, minSize), maxSize);
      } else {
        newSize = Math.min(Math.max(initialSize + delta, minSize), maxSize);
      }

      onResize(newSize);
    });
  }, [isDragging, initialPos, initialSize, isHorizontal, isRightPanel, minSize, maxSize, onResize]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove, { passive: true });
      window.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = isHorizontal ? 'ns-resize' : 'ew-resize';
      document.body.style.userSelect = 'none';
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging, handleMouseMove, handleMouseUp, isHorizontal]);

  return (
    <div
      onMouseDown={handleMouseDown}
      className={`
        ${isHorizontal ? 'h-1 hover:h-1.5 w-full cursor-ns-resize' : 'w-1 hover:w-1.5 h-full cursor-ew-resize'}
        bg-gray-300 dark:bg-gray-600 
        hover:bg-gray-400 dark:hover:bg-gray-500 
        transition-all duration-75
        active:bg-blue-500 dark:active:bg-blue-600
        ${isDragging ? 'bg-blue-500 dark:bg-blue-600' : ''}
        z-10
      `}
      style={{
        touchAction: 'none',
        willChange: 'transform',
        transform: 'translate3d(0, 0, 0)',
      }}
    />
  );
};