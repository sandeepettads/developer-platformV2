import React, { useState, useMemo, useRef } from 'react';
import { MessageSquare, Code, Loader2, X, Plus } from 'lucide-react';
import { analyzeCode } from '../services/codeAnalysis';
import { Tooltip } from './Tooltip';
import { processFileUpload } from '../utils/fileSystem';
import { FileNode } from '../types/file';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isLoading?: boolean;
}

interface ContextFile {
  path: string;
  content: string;
}

export const InteractionPanel: React.FC<{
  contextFiles: ContextFile[];
  onRemoveContext: (path: string) => void;
}> = ({ contextFiles, onRemoveContext }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Updated logic for folder and root folder detection
  const { isRootFolder, folderName } = useMemo(() => {
    if (contextFiles.length === 0) return { isRootFolder: false, folderName: null };

    const paths = contextFiles.map((f) => f.path);
    const firstPathParts = paths[0].split('/');
    const rootDir = firstPathParts[0];

    // Check if this is the root folder selection
    const isRoot = paths.every((path) => {
      const parts = path.split('/');
      return parts[0] === rootDir && !path.includes('/') && !parts.includes('node_modules');
    });

    // Check if this is a specific folder
    if (!isRoot && paths.length > 0) {
      const commonFolder = paths.every((path) => path.startsWith(`${rootDir}/`));
      const hasDeeperPaths = paths.some((path) => path.split('/').length > 2);

      if (commonFolder && hasDeeperPaths) {
        return {
          isRootFolder: false,
          folderName: rootDir,
        };
      }
    }

    return {
      isRootFolder: isRoot,
      folderName: isRoot ? null : rootDir,
    };
  }, [contextFiles]);

  const createMessage = (type: 'user' | 'assistant', content: string, isLoading = false): Message => ({
    id: crypto.randomUUID(),
    type,
    content,
    timestamp: new Date(),
    isLoading
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || contextFiles.length === 0) return;

    const userMessage = createMessage('user', input);
    const loadingMessage = createMessage('assistant', '', true);

    setMessages(prev => [...prev, userMessage, loadingMessage]);
    setInput('');
    setIsAnalyzing(true);

    try {
      const context = contextFiles.map(file => 
        `File: ${file.path}\n${file.content}`
      ).join('\n\n');

      const prompt = `Analyze only the following code context and answer the question. Do not use any external knowledge or assumptions outside of the provided context:\n\n${context}\n\nQuestion: ${input}`;
      
      const analysis = await analyzeCode(prompt);
      
      setMessages(prev => {
        const newMessages = [...prev];
        const loadingIndex = newMessages.length - 1;
        newMessages[loadingIndex] = createMessage('assistant', analysis);
        return newMessages;
      });
    } catch (error) {
      setMessages(prev => {
        const newMessages = [...prev];
        const loadingIndex = newMessages.length - 1;
        newMessages[loadingIndex] = createMessage(
          'assistant',
          error instanceof Error ? error.message : 'Failed to analyze code. Please try again.'
        );
        return newMessages;
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (const file of Array.from(files)) {
      const fileNode = await processFileUpload(file);
      if (fileNode.content) {
        const contextFile = {
          path: fileNode.path,
          content: fileNode.content
        };
        if (!contextFiles.some(f => f.path === contextFile.path)) {
          contextFiles.push(contextFile);
        }
      }
    }
    
    e.target.value = '';
  };

  return (
    <div className="flex flex-col h-full bg-[#21252B]">
      <div className="flex items-center justify-between px-4 py-2 bg-[#21252B] border-b border-gray-800">
        <div className="flex items-center">
          <MessageSquare size={16} className="mr-2 text-gray-400" />
          <span className="text-sm font-medium text-gray-300">Code Analysis</span>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col min-h-0">
        {contextFiles.length > 0 && (
          <div className="p-4 bg-[#2C313A] border-b border-gray-800">
            <div className="flex flex-col gap-2">
              <div className="text-sm font-medium text-gray-400">
                {isRootFolder ? (
                  'Entire codebase added to context'
                ) : folderName ? (
                  `Folder: ${folderName} (${contextFiles.length} files)`
                ) : (
                  `Selected ${contextFiles.length} file${contextFiles.length === 1 ? '' : 's'}`
                )}
              </div>
              {!isRootFolder && (
                <div className="max-h-24 overflow-y-auto pr-2 space-y-2">
                  {contextFiles.slice(0, 4).map((file) => (
                    <div
                      key={`context-file-${file.path}`}
                      className="flex items-center gap-1 bg-[#21252B] px-2 py-1 rounded-md text-sm group"
                    >
                      <Tooltip content={file.path}>
                        <span className="truncate max-w-[150px] text-gray-300">{file.path}</span>
                      </Tooltip>
                      <button
                        onClick={() => onRemoveContext(file.path)}
                        className="opacity-60 hover:opacity-100 hover:text-red-500 transition-opacity"
                        aria-label="Remove file"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  {contextFiles.length > 4 && (
                    <div className="text-sm text-gray-500">
                      +{contextFiles.length - 4} more files
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
        
        <div className="flex-1 p-4 space-y-4 overflow-y-auto">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`${msg.type === 'user' ? 'text-right' : 'text-left'}`}
            >
              <div
                className={`inline-block max-w-[80%] px-4 py-2 rounded-lg ${
                  msg.type === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-[#2C313A] text-gray-300'
                }`}
              >
                {msg.isLoading ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 size={16} className="animate-spin" />
                    <span>Analyzing code...</span>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="whitespace-pre-wrap text-sm leading-relaxed break-words">
                      {msg.content}
                    </p>
                    <span className="text-xs opacity-75 block">
                      {msg.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-gray-800 bg-[#21252B]">
          <form onSubmit={handleSubmit}>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={contextFiles.length > 0 ? "Ask about the code..." : "Select files to analyze using right-click"}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-700 bg-[#2C313A] text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isAnalyzing || contextFiles.length === 0}
              />
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                accept=".js,.jsx,.ts,.tsx,.py,.java,.html,.css,.json,.png,.jpg,.jpeg,.gif,.svg,.md,.txt"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 bg-[#2C313A] hover:bg-[#353B45] text-gray-400 hover:text-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                title="Add files from system"
              >
                <Plus size={20} />
              </button>
              <button
                type="submit"
                className={`p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                  isAnalyzing ? 'cursor-not-allowed' : ''
                }`}
                disabled={isAnalyzing || !input.trim() || contextFiles.length === 0}
              >
                {isAnalyzing ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <Code size={20} />
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};