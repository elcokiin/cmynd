"use client";

import { useState, useRef, useEffect } from "react";
import { ScrollArea } from "@elcokiin/ui/scroll-area";
import { TerminalInput } from "@/components/terminal-input";
import { executeCommand, type TerminalState } from "@/lib/vfs/command-parser";
import { neofetchOutput } from "@/lib/neofetch";

interface HistoryEntry {
  command: string;
  output: string;
  prompt: string;
}

export function TerminalView() {
  const [state, setState] = useState<TerminalState>({ cwd: "/" });
  const [history, setHistory] = useState<HistoryEntry[]>([
    {
      command: "neofetch",
      output: neofetchOutput,
      prompt: "elcokiin@github ~ $",
    },
    {
      command: "",
      output: 'Type "help" to see available commands.',
      prompt: "",
    },
  ]);
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [history]);

  const getPrompt = (cwd: string) => {
    if (cwd === "/") {
      return "elcokiin@github ~ $";
    }
    const displayPath = cwd.replace(/^\//, "~/");
    return `elcokiin@github ${displayPath} $`;
  };

  const handleCommandSubmit = async (commandLine: string) => {
    const prompt = getPrompt(state.cwd);
    
    if (!commandLine.trim()) {
      setHistory((prev) => [...prev, { command: commandLine, output: "", prompt }]);
      return;
    }

    const { newState, output, clear, isAsync } = executeCommand(commandLine, state);

    if (clear) {
      setHistory([]);
      setState(newState);
      return;
    }

    if (isAsync) {
      setHistory((prev) => [...prev, { command: commandLine, output: "Contacting elcokiin's AI agent...\n\n", prompt }]);
      setState(newState);

      try {
        const query = commandLine.replace(/^ask-diego\s+/, '').trim();
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [{ role: 'user', content: query }]
          }),
        });

        if (!response.ok) throw new Error('Network response was not ok');
        if (!response.body) throw new Error('No body in response');

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        
        // Remove the loading message before streaming the actual response
        setHistory((prev) => {
          const newHistory = [...prev];
          const lastIndex = newHistory.length - 1;
          const lastEntry = newHistory[lastIndex];
          if (lastIndex >= 0 && lastEntry && lastEntry.command === commandLine) {
            lastEntry.output = "";
          }
          return newHistory;
        });
        
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          
          setHistory((prev) => {
            const newHistory = [...prev];
            const lastIndex = newHistory.length - 1;
            const lastEntry = newHistory[lastIndex];
            if (lastIndex >= 0 && lastEntry && lastEntry.command === commandLine) {
              lastEntry.output += chunk;
            }
            return newHistory;
          });
        }
      } catch {
        setHistory((prev) => {
          const newHistory = [...prev];
          const lastIndex = newHistory.length - 1;
          const lastEntry = newHistory[lastIndex];
          if (lastIndex >= 0 && lastEntry && lastEntry.command === commandLine) {
            lastEntry.output += '\nError: Failed to fetch response from AI.';
          }
          return newHistory;
        });
      }
    } else {
      setHistory((prev) => [...prev, { command: commandLine, output, prompt }]);
      setState(newState);
    }
  };

  const currentPrompt = getPrompt(state.cwd);

  return (
    <ScrollArea className="h-full w-full">
      <div className="flex flex-col p-4 pb-16 min-h-full">
        {history.map((entry, i) => (
          <div key={i} className="flex flex-col mb-2">
            <div className="flex items-center">
              <span className="text-zinc-400 mr-2 whitespace-nowrap">{entry.prompt}</span>
              <span className="text-white">{entry.command}</span>
            </div>
            {entry.output && (
              <div className="text-zinc-300 whitespace-pre-wrap mt-1 font-mono text-sm leading-relaxed">
                {entry.output}
              </div>
            )}
          </div>
        ))}
        <div className="flex items-center mt-2">
          <TerminalInput
            onSubmit={handleCommandSubmit}
            prompt={currentPrompt}
          />
        </div>
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}
