import React, { useEffect, useState, useRef } from 'react';
import { Search } from 'lucide-react';
import { FileNode } from '../types/file';

interface FileSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filteredFiles: FileNode[];
  onFileSelect: (file: FileNode) => void;
  className?: string;
}

export const FileSearch: React.FC<FileSearchProps> = ({
  searchQuery,
  onSearchChange,
  filteredFiles,
  onFileSelect,
  className = ''
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setShowDropdown(searchQuery.length > 0);
    setHighlightedIndex(-1);
  }, [searchQuery]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredFiles.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredFiles.length) {
          onFileSelect(filteredFiles[highlightedIndex]);
          setShowDropdown(false);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setShowDropdown(false);
        break;
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div className="relative">
        <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowDropdown(searchQuery.length > 0)}
          placeholder="Search files..."
          className="w-full pl-9 pr-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-md text-sm border border-transparent focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          autoComplete="off"
          spellCheck="false"
        />
      </div>
      
      {showDropdown && filteredFiles.length > 0 && (
        <div className="absolute left-0 right-0 mt-1 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 max-h-60 overflow-y-auto z-50">
          {filteredFiles.map((file, index) => (
            <button
              key={file.id}
              onClick={() => {
                onFileSelect(file);
                setShowDropdown(false);
              }}
              onMouseEnter={() => setHighlightedIndex(index)}
              className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                index === highlightedIndex
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <div className="flex items-center">
                <span className="flex-1 truncate">{file.path}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};