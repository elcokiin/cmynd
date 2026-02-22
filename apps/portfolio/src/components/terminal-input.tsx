"use client";

import type { KeyboardEvent } from "react";
import { useState, useRef, useEffect } from "react";
import { Input } from "@elcokiin/ui/input";

export interface TerminalInputProps {
  onSubmit: (command: string) => void;
  prompt?: string;
  className?: string;
}

export function TerminalInput({
  onSubmit,
  prompt = "elcokiin@github ~ $",
  className,
}: TerminalInputProps) {
  const [value, setValue] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  // Enforce auto-focus on click anywhere in the window
  useEffect(() => {
    const handleGlobalClick = () => {
      inputRef.current?.focus();
    };
    
    // Initial focus
    inputRef.current?.focus();

    window.addEventListener("click", handleGlobalClick);
    return () => {
      window.removeEventListener("click", handleGlobalClick);
    };
  }, []);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (value.trim()) {
        onSubmit(value);
        setHistory((prev) => [...prev, value]);
      } else {
        onSubmit("");
      }
      setValue("");
      setHistoryIndex(-1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (history.length > 0) {
        const nextIndex =
          historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(nextIndex);
        const historyValue = history[nextIndex];
        if (historyValue !== undefined) setValue(historyValue);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex !== -1) {
        const nextIndex = historyIndex + 1;
        if (nextIndex >= history.length) {
          setHistoryIndex(-1);
          setValue("");
        } else {
          setHistoryIndex(nextIndex);
          const historyValue = history[nextIndex];
          if (historyValue !== undefined) setValue(historyValue);
        }
      }
    }
  };

  return (
    <div className={`flex items-center w-full ${className || ""}`}>
      <span className="text-zinc-400 mr-2 whitespace-nowrap">{prompt}</span>
      <Input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        className="flex-1 bg-transparent border-none p-0 h-auto rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 text-white shadow-none"
        autoFocus
        spellCheck={false}
        autoComplete="off"
      />
    </div>
  );
}
