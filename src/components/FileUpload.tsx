import React, { useCallback, useRef } from 'react';
import { Upload, FolderUp } from 'lucide-react';
import { useFileStore } from '../store/useFileStore';
import { processFileUpload, processDirectoryEntry } from '../utils/fileSystem';

export const FileUpload: React.FC = () => {
  const { addFile } = useFileStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    for (const file of Array.from(files)) {
      const fileNode = await processFileUpload(file);
      await addFile(fileNode);
    }
    
    event.target.value = '';
  }, [addFile]);

  const handleFolderDrop = useCallback(async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();

    const items = event.dataTransfer.items;
    if (!items) return;

    for (const item of Array.from(items)) {
      const entry = item.webkitGetAsEntry();
      if (entry) {
        const node = await processDirectoryEntry(entry);
        if (node) {
          await addFile(node);
        }
      }
    }
  }, [addFile]);

  const handleFolderSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    // Create a root directory node
    const rootPath = files[0].webkitRelativePath.split('/')[0];
    let rootNode = {
      id: crypto.randomUUID(),
      name: rootPath,
      type: 'directory' as const,
      path: rootPath,
      children: []
    };

    // Process all files
    for (const file of Array.from(files)) {
      const pathParts = file.webkitRelativePath.split('/');
      let currentPath = '';
      let currentNode = rootNode;

      // Skip the first part as it's the root directory name
      for (let i = 1; i < pathParts.length; i++) {
        const part = pathParts[i];
        currentPath = currentPath ? `${currentPath}/${part}` : part;

        if (i === pathParts.length - 1) {
          // This is a file
          const content = await file.text();
          const fileNode = {
            id: crypto.randomUUID(),
            name: part,
            type: 'file' as const,
            path: `${rootPath}/${currentPath}`,
            content,
            language: file.name.split('.').pop()?.toLowerCase() || 'plaintext'
          };
          currentNode.children?.push(fileNode);
        } else {
          // This is a directory
          let dirNode = currentNode.children?.find(
            child => child.type === 'directory' && child.name === part
          );
          if (!dirNode) {
            dirNode = {
              id: crypto.randomUUID(),
              name: part,
              type: 'directory' as const,
              path: `${rootPath}/${currentPath}`,
              children: []
            };
            currentNode.children?.push(dirNode);
          }
          currentNode = dirNode;
        }
      }
    }

    await addFile(rootNode);
    event.target.value = '';
  }, [addFile]);

  return (
    <div 
      className="flex space-x-2"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleFolderDrop}
    >
      <div className="relative">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileUpload}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          title="Upload files"
        />
        <button
          className="p-2 hover:bg-[#2C313A] rounded-md text-gray-400 hover:text-gray-200"
          title="Upload files"
        >
          <Upload size={20} />
        </button>
      </div>
      <div className="relative">
        <input
          ref={folderInputRef}
          type="file"
          webkitdirectory=""
          directory=""
          onChange={handleFolderSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          title="Upload folder"
        />
        <button
          className="p-2 hover:bg-[#2C313A] rounded-md text-gray-400 hover:text-gray-200"
          title="Upload folder"
        >
          <FolderUp size={20} />
        </button>
      </div>
    </div>
  );
};