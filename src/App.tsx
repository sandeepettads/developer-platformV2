import React, { useState, useCallback } from 'react';
import { FileTree } from './components/FileTree';
import { Editor } from './components/Editor';
import { TabBar } from './components/TabBar';
import { Toolbar } from './components/Toolbar';
import { ResizeHandle } from './components/ResizeHandle';
import { InteractionPanel } from './components/InteractionPanel';
import { useFileStore } from './store/useFileStore';
import { FileNode } from './types/file';

export function App() {
  const { activeFile, openFiles, setActiveFile, closeFile } = useFileStore();
  const [leftPanelWidth, setLeftPanelWidth] = useState(280);
  const [rightPanelWidth, setRightPanelWidth] = useState(420);
  const [contextFiles, setContextFiles] = useState<{ path: string; content: string }[]>([]);

  const handleRightPanelResize = useCallback((width: number) => {
    requestAnimationFrame(() => {
      setRightPanelWidth(width);
    });
  }, []);

  const handleLeftPanelResize = useCallback((width: number) => {
    requestAnimationFrame(() => {
      setLeftPanelWidth(width);
    });
  }, []);

  const handleAddToAnalysis = useCallback((file: FileNode) => {
    if (file.type === 'directory' && file.children) {
      const filesToAdd = file.children
        .filter(child => 
          child.type === 'file' && 
          child.content &&
          !contextFiles.some(existing => existing.path === child.path)
        )
        .map(child => ({
          path: child.path,
          content: child.content!
        }));
      setContextFiles(prev => [...prev, ...filesToAdd]);
    } else if (file.type === 'file' && file.content) {
      if (!contextFiles.some(existing => existing.path === file.path)) {
        setContextFiles(prev => [...prev, { path: file.path, content: file.content! }]);
      }
    }
  }, [contextFiles]);

  const handleRemoveFromAnalysis = useCallback((file: FileNode) => {
    if (file.type === 'directory' && file.children) {
      const pathsToRemove = file.children
        .filter(child => child.type === 'file')
        .map(child => child.path);
      setContextFiles(prev => prev.filter(f => !pathsToRemove.includes(f.path)));
    } else {
      setContextFiles(prev => prev.filter(f => f.path !== file.path));
    }
  }, []);

  return (
    <div className="h-screen flex flex-col bg-[#282C34] text-gray-100">
      <Toolbar />
      <div className="flex-1 flex overflow-hidden">
        <div 
          className="border-r border-gray-800 bg-[#21252B] flex-shrink-0 overflow-hidden"
          style={{ 
            width: leftPanelWidth,
            minWidth: leftPanelWidth,
            maxWidth: leftPanelWidth
          }}
        >
          <FileTree
            contextFiles={contextFiles}
            onAddToAnalysis={handleAddToAnalysis}
            onRemoveFromAnalysis={handleRemoveFromAnalysis}
          />
        </div>
        
        <ResizeHandle 
          onResize={handleLeftPanelResize} 
          minSize={200}
          maxSize={480}
        />
        
        <div className="flex-1 flex min-w-0">
          <div className="flex-1 flex flex-col min-w-0">
            <TabBar
              openFiles={openFiles}
              activeFile={activeFile}
              onTabClick={setActiveFile}
              onTabClose={closeFile}
            />
            <div className="flex-1 relative">
              <Editor />
            </div>
          </div>
          <ResizeHandle 
            onResize={handleRightPanelResize}
            minSize={320}
            maxSize={960}
            isRightPanel
          />
          <div 
            className="border-l border-gray-800 flex-shrink-0 overflow-hidden"
            style={{ 
              width: rightPanelWidth,
              minWidth: rightPanelWidth,
              maxWidth: rightPanelWidth
            }}
          >
            <InteractionPanel
              contextFiles={contextFiles}
              onRemoveContext={(path) => setContextFiles(prev => prev.filter(f => f.path !== path))}
            />
          </div>
        </div>
      </div>
    </div>
  );
}