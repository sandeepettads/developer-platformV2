import React, { useCallback, useEffect, useState } from 'react';

interface HorizontalResizeHandleProps {
  onResize: (height: number) => void;
  minHeight?: number;
  maxHeight?: number;
}

export const HorizontalResizeHandle: React.FC<HorizontalResizeHandleProps> = ({
  onResize,
  minHeight = 100,
  maxHeight = 800
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    
    const windowHeight = window.innerHeight;
    const newHeight = Math.min(
      Math.max(windowHeight - e.clientY, minHeight),
      maxHeight
    );
    onResize(newHeight);
  }, [isDragging, minHeight, maxHeight, onResize]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'ns-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div
      onMouseDown={handleMouseDown}
      className={`h-1 hover:h-1.5 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 cursor-ns-resize transition-all duration-150 active:bg-blue-500 dark:active:bg-blue-600 ${
        isDragging ? 'bg-blue-500 dark:bg-blue-600 h-1.5' : ''
      }`}
    />
  );
};