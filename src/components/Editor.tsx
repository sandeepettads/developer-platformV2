import React, { useEffect } from 'react';
import MonacoEditor from '@monaco-editor/react';
import { useFileStore } from '../store/useFileStore';
import { editor } from 'monaco-editor';

const EDITOR_THEME_NAME = 'webideTheme';

export const Editor: React.FC = () => {
  const { activeFile } = useFileStore();
  
  useEffect(() => {
    // Define custom theme
    editor.defineTheme(EDITOR_THEME_NAME, {
      base: 'vs-dark',
      inherit: true,
      rules: [
        // Python-specific rules
        { token: 'keyword.python', foreground: 'C678DD' },
        { token: 'string.python', foreground: '98C379' },
        { token: 'comment.python', foreground: '5C6370' },
        { token: 'variable.python', foreground: 'E06C75' },
        { token: 'support.function.python', foreground: '61AFEF' },
        { token: 'constant.numeric.python', foreground: 'D19A66' },
        
        // TypeScript/JavaScript
        { token: 'keyword', foreground: 'C678DD' },
        { token: 'string', foreground: '98C379' },
        { token: 'identifier', foreground: 'E06C75' },
        { token: 'type', foreground: '61AFEF' },
        { token: 'interface', foreground: '61AFEF' },
        { token: 'number', foreground: 'D19A66' },
        { token: 'comment', foreground: '5C6370' },
        
        // Python
        { token: 'def', foreground: '61AFEF' },
        { token: 'class', foreground: '61AFEF' },
        { token: 'self', foreground: 'E06C75' },
        { token: 'builtin', foreground: '56B6C2' },
        
        // HTML/JSX
        { token: 'tag', foreground: 'E06C75' },
        { token: 'attribute.name', foreground: 'D19A66' },
        { token: 'attribute.value', foreground: '98C379' },
        
        // CSS
        { token: 'property', foreground: '56B6C2' },
        { token: 'value', foreground: '98C379' },
        
        // Common
        { token: 'function', foreground: '61AFEF' },
        { token: 'variable', foreground: 'ABB2BF' },
        { token: 'operator', foreground: '56B6C2' },
        { token: 'punctuation', foreground: 'ABB2BF' },
      ],
      colors: {
        'editor.background': '#21252B',
        'editor.foreground': '#ABB2BF',
        'editor.lineHighlightBackground': '#2C313A',
        'editor.selectionBackground': '#3E4451',
        'editor.inactiveSelectionBackground': '#3E4451',
        'editorCursor.foreground': '#528BFF',
        'editorWhitespace.foreground': '#3B4048',
        'editorIndentGuide.background': '#3B4048',
        'editorLineNumber.foreground': '#495162',
        'editorLineNumber.activeForeground': '#6B717D',
        'editor.findMatchBackground': '#42557B',
        'editor.findMatchHighlightBackground': '#314365',
        'editorOverviewRuler.border': '#21252B',
        'editorGutter.background': '#21252B',
        'editorWidget.background': '#21252B',
        'editorSuggestWidget.background': '#21252B',
        'editorSuggestWidget.border': '#181A1F',
        'editorSuggestWidget.selectedBackground': '#2C313A',
        'list.hoverBackground': '#2C313A',
        'list.activeSelectionBackground': '#2C313A',
      }
    });
  }, []);

  const handleEditorWillMount = (monaco: any) => {
    monaco.editor.setTheme(EDITOR_THEME_NAME);
  };

  if (!activeFile) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500 bg-[#21252B]">
        Select a file to start editing
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-[#21252B]">
      <MonacoEditor
        height="100%"
        defaultLanguage={activeFile.language || 'plaintext'}
        value={activeFile.content}
        theme={EDITOR_THEME_NAME}
        beforeMount={handleEditorWillMount}
        options={{
          minimap: { enabled: true },
          fontSize: 14,
          wordWrap: 'on',
          automaticLayout: true,
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          folding: true,
          renderLineHighlight: 'all',
          fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, 'Courier New', monospace",
          fontLigatures: true,
          theme: EDITOR_THEME_NAME,
        }}
      />
    </div>
  );
};