"use client";

import type { KeyboardEvent } from "react";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { Input } from "@elcokiin/ui/input";

export interface TerminalInputProps {
  onSubmit: (command: string) => void;
  getCompletions?: (input: string) => string[];
  onCompletionCandidates?: (candidates: string[]) => void;
  prompt?: string;
  className?: string;
}

export interface TerminalInputHandle {
  focus: () => void;
}

export const TerminalInput = forwardRef<TerminalInputHandle, TerminalInputProps>(function TerminalInput({
  onSubmit,
  getCompletions,
  onCompletionCandidates,
  prompt = "diegotenjo@elcokiin ~ $",
  className,
}, ref) {
  const [value, setValue] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [lastTabSnapshot, setLastTabSnapshot] = useState<{
    input: string;
    candidates: string[];
  } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => ({
    focus: () => {
      inputRef.current?.focus();
    },
  }));

  const longestCommonPrefix = (items: string[]) => {
    if (items.length === 0) return "";
    let prefix = items[0] ?? "";

    for (let i = 1; i < items.length; i += 1) {
      const current = items[i] ?? "";
      let j = 0;
      while (j < prefix.length && j < current.length && prefix[j] === current[j]) {
        j += 1;
      }
      prefix = prefix.slice(0, j);
      if (!prefix) break;
    }

    return prefix;
  };

  const sameCandidates = (a: string[], b: string[]) => {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i += 1) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  };

  const replaceTokenAtCursor = (nextToken: string) => {
    const input = inputRef.current;
    const cursor = input?.selectionStart ?? value.length;
    const beforeCursor = value.slice(0, cursor);
    const afterCursor = value.slice(cursor);
    const tokenStart = beforeCursor.lastIndexOf(" ") + 1;
    const nextSpaceInTail = afterCursor.search(/\s/);
    const tokenEnd = nextSpaceInTail === -1 ? value.length : cursor + nextSpaceInTail;
    const nextValue = `${value.slice(0, tokenStart)}${nextToken}${value.slice(tokenEnd)}`;

    setValue(nextValue);
    return nextValue;
  };

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
      setLastTabSnapshot(null);
    } else if (e.key === "Tab") {
      e.preventDefault();
      if (!getCompletions) return;

      const candidates = getCompletions(value);
      if (candidates.length === 0) {
        setLastTabSnapshot(null);
        return;
      }

      const cursor = inputRef.current?.selectionStart ?? value.length;
      const beforeCursor = value.slice(0, cursor);
      const tokenStart = beforeCursor.lastIndexOf(" ") + 1;
      const tokenPrefix = value.slice(tokenStart, cursor);

      if (candidates.length === 1) {
        const only = candidates[0] as string;
        const completed = only.endsWith("/") ? only : `${only} `;
        replaceTokenAtCursor(completed);
        setLastTabSnapshot(null);
        return;
      }

      const sharedPrefix = longestCommonPrefix(candidates);
      if (sharedPrefix.length > tokenPrefix.length) {
        const nextValue = replaceTokenAtCursor(sharedPrefix);
        setLastTabSnapshot({ input: nextValue, candidates });
        return;
      }

      const isRepeatedTab =
        lastTabSnapshot?.input === value &&
        sameCandidates(lastTabSnapshot.candidates, candidates);

      if (isRepeatedTab) {
        onCompletionCandidates?.(candidates);
      }

      setLastTabSnapshot({ input: value, candidates });
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (history.length > 0) {
        const nextIndex =
          historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(nextIndex);
        const historyValue = history[nextIndex];
        if (historyValue !== undefined) setValue(historyValue);
      }
      setLastTabSnapshot(null);
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
      setLastTabSnapshot(null);
    } else {
      setLastTabSnapshot(null);
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
});
