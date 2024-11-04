import React, { useState } from 'react';
import { createFileNode } from '../utils/fileSystem';
import { useFileStore } from '../store/useFileStore';

interface NewFileDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewFileDialog: React.FC<NewFileDialogProps> = ({ isOpen, onClose }) => {
  const [fileName, setFileName] = useState('');
  const [fileType, setFileType] = useState<'file' | 'directory'>('file');
  const { addFile } = useFileStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileName.trim()) return;

    const newFile = createFileNode(fileName, fileType);
    await addFile(newFile);
    setFileName('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96">
        <h2 className="text-lg font-semibold mb-4">Create New</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
              autoFocus
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Type</label>
            <select
              value={fileType}
              onChange={(e) => setFileType(e.target.value as 'file' | 'directory')}
              className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="file">File</option>
              <option value="directory">Directory</option>
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};