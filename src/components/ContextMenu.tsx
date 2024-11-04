import React from 'react';
import { FileNode } from '../types/file';

interface ContextMenuProps {
  x: number;
  y: number;
  file: FileNode;
  isInAnalysis: boolean;
  onAddToAnalysis: (file: FileNode) => void;
  onRemoveFromAnalysis: (file: FileNode) => void;
  onClose: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  x,
  y,
  file,
  isInAnalysis,
  onAddToAnalysis,
  onRemoveFromAnalysis,
  onClose,
}) => {
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      onClose();
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [onClose]);

  return (
    <div
      className="fixed z-50 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 min-w-[200px]"
      style={{
        left: x,
        top: y,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {isInAnalysis ? (
        <button
          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-red-500 dark:text-red-400"
          onClick={() => {
            onRemoveFromAnalysis(file);
            onClose();
          }}
        >
          Remove from Code Analysis
        </button>
      ) : (
        <button
          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-blue-500 dark:text-blue-400"
          onClick={() => {
            onAddToAnalysis(file);
            onClose();
          }}
        >
          Send to Code Analysis
        </button>
      )}
    </div>
  );
};