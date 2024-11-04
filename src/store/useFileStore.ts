import { create } from 'zustand';
import { FileNode } from '../types/file';
import { openDB } from 'idb';

interface FileStore {
  files: FileNode[];
  activeFile: FileNode | null;
  openFiles: FileNode[];
  setActiveFile: (file: FileNode | null) => void;
  addFile: (file: FileNode) => Promise<void>;
  updateFile: (file: FileNode) => Promise<void>;
  deleteFile: (fileId: string) => Promise<void>;
  loadFiles: () => Promise<void>;
  openFile: (file: FileNode) => void;
  closeFile: (file: FileNode) => void;
}

const DB_NAME = 'web-ide-db';
const STORE_NAME = 'files';

const initDB = async () => {
  const db = await openDB(DB_NAME, 1, {
    upgrade(db) {
      db.createObjectStore(STORE_NAME, { keyPath: 'id' });
    },
  });
  return db;
};

const findDuplicatePath = (files: FileNode[], path: string): boolean => {
  return files.some(file => file.path === path);
};

const ensureUniquePath = (files: FileNode[], basePath: string): string => {
  let path = basePath;
  let counter = 1;
  
  while (findDuplicatePath(files, path)) {
    const lastDotIndex = basePath.lastIndexOf('.');
    if (lastDotIndex === -1) {
      path = `${basePath} (${counter})`;
    } else {
      path = `${basePath.substring(0, lastDotIndex)} (${counter})${basePath.substring(lastDotIndex)}`;
    }
    counter++;
  }
  
  return path;
};

export const useFileStore = create<FileStore>((set, get) => ({
  files: [],
  activeFile: null,
  openFiles: [],
  
  setActiveFile: (file) => set({ activeFile: file }),
  
  addFile: async (file) => {
    const currentFiles = get().files;
    const uniquePath = ensureUniquePath(currentFiles, file.path);
    
    if (uniquePath !== file.path) {
      file = {
        ...file,
        path: uniquePath,
        name: uniquePath.split('/').pop() || file.name
      };
    }
    
    const db = await initDB();
    await db.add(STORE_NAME, file);
    const files = [...currentFiles, file];
    set({ files });
  },
  
  updateFile: async (file) => {
    const db = await initDB();
    await db.put(STORE_NAME, file);
    const files = get().files.map((f) => 
      f.id === file.id ? file : f
    );
    set({ files });
  },
  
  deleteFile: async (fileId) => {
    const db = await initDB();
    await db.delete(STORE_NAME, fileId);
    const files = get().files.filter((f) => f.id !== fileId);
    set({ files });
  },
  
  loadFiles: async () => {
    const db = await initDB();
    const files = await db.getAll(STORE_NAME);
    set({ files });
  },

  openFile: (file) => {
    set(state => {
      const isAlreadyOpen = state.openFiles.some(f => f.id === file.id);
      if (!isAlreadyOpen) {
        return {
          openFiles: [...state.openFiles, file],
          activeFile: file
        };
      }
      return { activeFile: file };
    });
  },

  closeFile: (file) => {
    set(state => {
      const newOpenFiles = state.openFiles.filter(f => f.id !== file.id);
      const newActiveFile = state.activeFile?.id === file.id
        ? newOpenFiles[newOpenFiles.length - 1] || null
        : state.activeFile;
      return {
        openFiles: newOpenFiles,
        activeFile: newActiveFile
      };
    });
  }
}));