import React from 'react';
import { X } from 'lucide-react';
import { FileNode } from '../types/file';
import { Tooltip } from './Tooltip';

interface TabBarProps {
  openFiles: FileNode[];
  activeFile: FileNode | null;
  onTabClick: (file: FileNode) => void;
  onTabClose: (file: FileNode) => void;
}

export const TabBar: React.FC<TabBarProps> = ({
  openFiles,
  activeFile,
  onTabClick,
  onTabClose
}) => {
  if (openFiles.length === 0) return null;

  return (
    <div className="flex overflow-x-auto bg-[#21252B] border-b border-gray-800 h-9">
      {openFiles.map((file) => (
        <div
          key={file.id}
          className={`
            flex items-center min-w-0 max-w-[200px] px-3 py-1 border-r border-gray-800 cursor-pointer
            group hover:bg-[#2C313A] transition-colors
            ${activeFile?.id === file.id ? 'bg-[#282C34]' : 'bg-[#21252B]'}
          `}
          onClick={() => onTabClick(file)}
        >
          <Tooltip content={file.path}>
            <span className="truncate text-sm text-gray-300">
              {file.name}
            </span>
          </Tooltip>
          <button
            className="ml-2 p-0.5 rounded-sm opacity-0 group-hover:opacity-100 hover:bg-gray-700/50"
            onClick={(e) => {
              e.stopPropagation();
              onTabClose(file);
            }}
          >
            <X size={14} className="text-gray-400 hover:text-gray-200" />
          </button>
        </div>
      ))}
    </div>
  );
};