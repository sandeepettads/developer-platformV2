import { v4 as uuidv4 } from 'uuid';
import { FileNode } from '../types/file';

export const getFileLanguage = (fileName: string): string => {
  const ext = fileName.split('.').pop()?.toLowerCase();
  const languageMap: Record<string, string> = {
    js: 'javascript',
    jsx: 'javascript',
    ts: 'typescript',
    tsx: 'typescript',
    html: 'html',
    css: 'css',
    json: 'json',
    md: 'markdown',
    py: 'python',
    python: 'python'
  };
  return languageMap[ext || ''] || 'plaintext';
};

export const createFileNode = (
  name: string,
  type: 'file' | 'directory',
  parentPath = '',
  content = ''
): FileNode => {
  const path = parentPath ? `${parentPath}/${name}` : name;
  return {
    id: uuidv4(),
    name,
    type,
    path,
    content: type === 'file' ? content : undefined,
    language: type === 'file' ? getFileLanguage(name) : undefined,
    children: type === 'directory' ? [] : undefined,
  };
};

export const processFileUpload = async (file: File, parentPath = ''): Promise<FileNode> => {
  const content = await file.text();
  return createFileNode(file.name, 'file', parentPath, content);
};

export const processDirectoryEntry = async (entry: FileSystemEntry, parentPath = ''): Promise<FileNode | null> => {
  if (!entry) return null;

  const path = parentPath ? `${parentPath}/${entry.name}` : entry.name;

  if (entry.isFile) {
    const fileEntry = entry as FileSystemFileEntry;
    return new Promise((resolve, reject) => {
      fileEntry.file(async (file) => {
        const content = await file.text();
        resolve({
          id: uuidv4(),
          name: entry.name,
          type: 'file',
          path,
          content,
          language: getFileLanguage(entry.name)
        });
      }, reject);
    });
  }

  if (entry.isDirectory) {
    const dirEntry = entry as FileSystemDirectoryEntry;
    const node: FileNode = {
      id: uuidv4(),
      name: entry.name,
      type: 'directory',
      path,
      children: []
    };
    
    const entries = await new Promise<FileSystemEntry[]>((resolve, reject) => {
      const reader = dirEntry.createReader();
      const entries: FileSystemEntry[] = [];
      
      function readEntries() {
        reader.readEntries((results) => {
          if (results.length) {
            entries.push(...results);
            readEntries();
          } else {
            resolve(entries);
          }
        }, reject);
      }
      
      readEntries();
    });

    const children = await Promise.all(
      entries.map((entry) => processDirectoryEntry(entry, path))
    );

    node.children = children.filter((child): child is FileNode => child !== null);
    return node;
  }

  return null;
};

// Excluded paths for context analysis
export const EXCLUDED_PATHS = new Set([
  'node_modules',
  '.git',
  'dist',
  'build',
  'coverage',
  '.next',
  '.nuxt',
  '.output',
  '.cache'
]);

export const shouldExcludeFromContext = (path: string): boolean => {
  return EXCLUDED_PATHS.has(path.split('/')[0]) || 
         path.includes('/node_modules/') ||
         path.endsWith('package-lock.json') ||
         path.endsWith('yarn.lock') ||
         path.endsWith('pnpm-lock.yaml');
};

export const getAllFilesFromDirectory = (node: FileNode): FileNode[] => {
  let files: FileNode[] = [];
  
  // Skip excluded directories and files
  if (shouldExcludeFromContext(node.path)) {
    return files;
  }
  
  if (node.type === 'file') {
    files.push(node);
  } else if (node.type === 'directory' && node.children) {
    node.children.forEach(child => {
      files = files.concat(getAllFilesFromDirectory(child));
    });
  }
  
  return files;
};