import React, { useState } from 'react';
import { Save, Play, Bug, Plus } from 'lucide-react';
import { useFileStore } from '../store/useFileStore';
import { FileUpload } from './FileUpload';
import { NewFileDialog } from './NewFileDialog';

export const Toolbar: React.FC = () => {
  const [isNewFileDialogOpen, setIsNewFileDialogOpen] = useState(false);

  return (
    <div className="h-12 flex items-center px-4 bg-[#21252B] border-b border-gray-800">
      <div className="flex items-center space-x-2">
        <button
          className="p-2 hover:bg-[#2C313A] rounded-md text-gray-400 hover:text-gray-200"
          title="Save"
        >
          <Save size={20} />
        </button>
        <button
          className="p-2 hover:bg-[#2C313A] rounded-md text-gray-400 hover:text-gray-200"
          title="Run"
        >
          <Play size={20} />
        </button>
        <button
          className="p-2 hover:bg-[#2C313A] rounded-md text-gray-400 hover:text-gray-200"
          title="Debug"
        >
          <Bug size={20} />
        </button>
      </div>

      <div className="flex-1" />

      <div className="flex items-center space-x-2">
        <FileUpload />
        <button
          onClick={() => setIsNewFileDialogOpen(true)}
          className="p-2 hover:bg-[#2C313A] rounded-md text-gray-400 hover:text-gray-200"
          title="New File"
        >
          <Plus size={20} />
        </button>
      </div>

      <NewFileDialog
        isOpen={isNewFileDialogOpen}
        onClose={() => setIsNewFileDialogOpen(false)}
      />
    </div>
  );
};