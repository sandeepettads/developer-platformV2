import React from 'react';
import { X } from 'lucide-react';
import { Tooltip } from './Tooltip';

interface ContextFile {
  path: string;
  content: string;
}

interface ContextFilesProps {
  files: ContextFile[];
  onRemove: (path: string) => void;
}

export const ContextFiles: React.FC<ContextFilesProps> = ({ files, onRemove }) => {
  if (files.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {files.map((file) => (
        <div
          key={file.path}
          className="flex items-center gap-1 bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-md text-sm group"
        >
          <Tooltip content={file.path}>
            <span className="truncate max-w-[150px]">{file.path}</span>
          </Tooltip>
          <button
            onClick={() => onRemove(file.path)}
            className="opacity-60 hover:opacity-100 hover:text-red-500 transition-opacity"
            aria-label="Remove file"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
};