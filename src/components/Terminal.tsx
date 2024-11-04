import React, { useState, useRef, useEffect } from 'react';
import { Terminal as LucideTerminal } from 'lucide-react';

interface CommandHistory {
  command: string;
  output: string;
}

export const Terminal: React.FC = () => {
  const [input, setInput] = useState('');
  const [currentDirectory, setCurrentDirectory] = useState('/home/project');
  const [history, setHistory] = useState<CommandHistory[]>([{
    command: '',
    output: 'Welcome to Web IDE Terminal\nType a command to begin...'
  }]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const executeCommand = async (command: string) => {
    try {
      setIsProcessing(true);
      
      // Use WebContainer's shell API
      const response = await fetch('/__webcontainer/shell/command', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          command,
          cwd: currentDirectory,
          env: {
            TERM: 'xterm-256color',
            PATH: '/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin',
            HOME: '/home/project'
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Command failed: ${response.statusText}`);
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response stream available');
      }

      let output = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const text = new TextDecoder().decode(value);
        output += text;
        
        // Update history in real-time
        setHistory(prev => {
          const newHistory = [...prev];
          const lastEntry = newHistory[newHistory.length - 1];
          if (lastEntry.command === command) {
            lastEntry.output = output;
          } else {
            newHistory.push({ command, output });
          }
          return newHistory;
        });
      }

      // Handle cd commands to update current directory
      if (command.startsWith('cd ')) {
        const newPath = command.slice(3).trim();
        try {
          const pwdResponse = await fetch('/__webcontainer/shell/command', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ command: 'pwd', cwd: currentDirectory })
          });
          
          if (pwdResponse.ok) {
            const pwdReader = pwdResponse.body?.getReader();
            if (pwdReader) {
              const { value } = await pwdReader.read();
              const pwd = new TextDecoder().decode(value).trim();
              setCurrentDirectory(pwd);
            }
          }
        } catch (error) {
          console.error('Failed to update current directory:', error);
        }
      }

    } catch (error) {
      setHistory(prev => [...prev, {
        command,
        output: `Error: ${(error as Error).message}`
      }]);
    } finally {
      setIsProcessing(false);
      setInput('');
      setHistoryIndex(-1);
    }
  };

  const handleKeyDown = async (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && input.trim() && !isProcessing) {
      e.preventDefault();
      const command = input.trim();
      setHistory(prev => [...prev, { command, output: '' }]);
      await executeCommand(command);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex < history.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setInput(history[history.length - 1 - newIndex].command);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(history[history.length - 1 - newIndex].command);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput('');
      }
    } else if (e.ctrlKey && e.key === 'c' && isProcessing) {
      // Handle Ctrl+C to cancel running commands
      try {
        await fetch('/__webcontainer/shell/signal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ signal: 'SIGINT' })
        });
      } catch (error) {
        console.error('Failed to send SIGINT:', error);
      }
    }
  };

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="flex flex-col h-full bg-gray-900 text-gray-100">
      <div className="flex items-center px-4 py-2 bg-gray-800 border-b border-gray-700">
        <LucideTerminal size={16} className="mr-2" />
        <span className="text-sm font-medium">Terminal</span>
      </div>
      <div 
        ref={terminalRef}
        className="flex-1 p-4 font-mono text-sm overflow-y-auto"
        onClick={() => inputRef.current?.focus()}
      >
        {history.map((entry, i) => (
          <div key={i} className="mb-2">
            {entry.command && (
              <div className="flex items-center">
                <span className="text-green-400">{currentDirectory}$</span>
                <span className="ml-2">{entry.command}</span>
              </div>
            )}
            <div className="whitespace-pre-wrap text-gray-300">{entry.output}</div>
          </div>
        ))}
        <div className="flex items-center">
          <span className="text-green-400">{currentDirectory}$</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 ml-2 bg-transparent outline-none"
            spellCheck={false}
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            disabled={isProcessing}
          />
        </div>
      </div>
    </div>
  );
};