"use client";

import {
  useState,
  useRef,
  useCallback,
  useEffect,
  useMemo,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { useSearchParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@elcokiin/backend/convex/_generated/api";
import { useUIMessages } from "@convex-dev/agent/react";
import { ScrollArea } from "@elcokiin/ui/scroll-area";
import {
  TerminalInput,
  type TerminalInputHandle,
} from "@/components/terminal-input";
import {
  executeCommand,
  getCompletions,
  type TerminalState,
} from "@/lib/vfs/command-parser";
import { buildVfs } from "@/lib/build-vfs";
import { buildNeofetch } from "@/lib/neofetch";
import { useIsMobile } from "@/hooks/use-mobile";

interface HistoryEntry {
  command: string;
  output: string;
  prompt: string;
}

export function TerminalView() {
  const searchParams = useSearchParams();
  const isMobile = useIsMobile();
  const hideNeofetch = searchParams.get("neofetch") === "hidden" || isMobile;

  const profile = useQuery(api["portfolio/queries"].getProfile);
  const skills = useQuery(api["portfolio/queries"].listPublicSkills, {});
  const projects = useQuery(api["portfolio/queries"].listPublicProjects);
  const experience = useQuery(api["portfolio/queries"].listPublicExperience);

  const createThread = useMutation(api.chat.mutations.createThread);
  const sendMessage = useMutation(api.chat.mutations.sendMessage);

  const [state, setState] = useState<TerminalState>({ cwd: "/" });
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [threadError, setThreadError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputHandleRef = useRef<TerminalInputHandle>(null);

  const { results: chatMessages } = useUIMessages(
    api.chat.queries.listMessages,
    threadId ? { threadId } : "skip",
    { initialNumItems: 50, stream: true },
  );

  const THREAD_STORAGE_KEY = "cmynd-chat-thread-id";

  const initThread = useCallback(async () => {
    setThreadError(null);
    try {
      const stored = localStorage.getItem(THREAD_STORAGE_KEY);
      if (stored) {
        setThreadId(stored);
      } else {
        const { threadId: id } = await createThread();
        setThreadId(id);
        localStorage.setItem(THREAD_STORAGE_KEY, id);
      }
    } catch {
      setThreadError("Failed to initialize chat. Try again.");
    }
  }, [createThread]);

  useEffect(() => {
    initThread();
  }, [initThread]);

  const isLoading = profile === undefined || skills === undefined || projects === undefined || experience === undefined;

  const vfsRoot = useMemo(() => {
    if (profile === undefined || skills === undefined || projects === undefined || experience === undefined) {
      return null;
    }
    return buildVfs(profile, skills, projects, experience);
  }, [profile, skills, projects, experience]);

  const neofetch = useMemo(() => {
    if (profile === undefined) return null;
    return buildNeofetch(profile);
  }, [profile]);

  const promptName = useMemo(() => {
    if (profile === undefined) return "portfolio";
    return profile.name.split(" ")[0]?.toLowerCase() ?? "portfolio";
  }, [profile]);

  const getPrompt = (cwd: string) => {
    if (cwd === "/") {
      return `diego@${promptName} ~ $`;
    }
    const displayPath = cwd.replace(/^\//, "~/");
    return `diego@${promptName} ${displayPath} $`;
  };

  useEffect(() => {
    if (isLoading || !neofetch) return;

    const initial: HistoryEntry[] = [];

    if (!hideNeofetch) {
      initial.push({
        command: "neofetch",
        output: neofetch,
        prompt: getPrompt("/"),
      });
    }

    initial.push({
      command: "",
      output: 'Type "help" to see available commands.',
      prompt: "",
    });

    setHistory(initial);
  }, [isLoading, hideNeofetch, neofetch, promptName]);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [history, chatMessages]);

  const handleTerminalClick = (event: ReactMouseEvent<HTMLElement>) => {
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) {
      return;
    }

    if (!(event.target instanceof HTMLElement)) {
      inputHandleRef.current?.focus();
      return;
    }

    if (
      event.target.closest(
        "[data-slot='scroll-area-scrollbar'], [data-slot='scroll-area-thumb']",
      )
    ) {
      return;
    }

    if (
      event.target.closest(
        "input, textarea, button, select, a, [contenteditable='true']",
      )
    ) {
      return;
    }

    inputHandleRef.current?.focus();
  };

  const chatOutput = useMemo(() => {
    if (!chatMessages || chatMessages.length === 0) return "";

    const assistantMessages = chatMessages.filter((m) => m.role === "assistant");
    return assistantMessages
      .map((msg) => {
        const text = msg.parts.map((p) => ("text" in p ? p.text : "")).join("");
        return `[${promptName}] ${text}`;
      })
      .join("\n\n");
  }, [chatMessages, promptName]);

  const handleCommandSubmit = async (commandLine: string) => {
    if (!vfsRoot || !neofetch) return;

    const prompt = getPrompt(state.cwd);

    if (!commandLine.trim()) {
      setHistory((prev) => [
        ...prev,
        { command: commandLine, output: "", prompt },
      ]);
      return;
    }

    const { newState, output, clear, isAsync } = executeCommand(
      commandLine,
      state,
      vfsRoot,
      neofetch,
    );

    if (clear) {
      setHistory([]);
      setShowChat(false);
      setState(newState);
      return;
    }

    if (isAsync) {
      setShowChat(true);
      const query = commandLine.replace(/^ask-diego\s+/, "").trim();

      if (threadId) {
        setHistory((prev) => [
          ...prev,
          { command: commandLine, output: "", prompt },
        ]);
        sendMessage({ threadId, prompt: query });
      } else {
        setHistory((prev) => [
          ...prev,
          { command: commandLine, output: "\nChat not initialized yet. Try again.", prompt },
        ]);
      }
    } else {
      setHistory((prev) => [...prev, { command: commandLine, output, prompt }]);
      setState(newState);
    }
  };

  const handleCompletionCandidates = (candidates: string[]) => {
    if (candidates.length === 0) return;
    setHistory((prev) => [
      ...prev,
      {
        command: "",
        output: candidates.join("  "),
        prompt: "",
      },
    ]);
  };

  const currentPrompt = getPrompt(state.cwd);

  const hasChat = chatMessages && chatMessages.length > 0;

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="text-zinc-500 text-sm font-mono">Loading portfolio...</div>
      </div>
    );
  }

  return (
    <div
      className="h-full w-full min-h-0"
      onClickCapture={handleTerminalClick}
    >
      <ScrollArea className="h-full w-full">
        <div className="flex flex-col p-4 pb-16 min-h-full">
          {history.map((entry, i) => (
            <div key={i} className="flex flex-col mb-2">
              {entry.prompt !== "" && (
                <div className="flex items-center">
                  <span className="text-zinc-200 mr-2 whitespace-nowrap">
                    {entry.prompt}
                  </span>
                  <span className="text-white">{entry.command}</span>
                </div>
              )}
              {entry.output && (
                <div className="text-zinc-300 whitespace-pre-wrap mt-1 font-mono text-sm leading-relaxed">
                  {entry.output}
                </div>
              )}
            </div>
          ))}
          {threadError && (
            <div className="text-red-400 whitespace-pre-wrap mt-1 font-mono text-sm leading-relaxed">
              Error: {threadError}
            </div>
          )}
          {showChat && hasChat && (
            <div className="text-zinc-300 whitespace-pre-wrap mt-1 font-mono text-sm leading-relaxed">
              {chatOutput}
            </div>
          )}
          <div className="flex items-center mt-2">
            <TerminalInput
              ref={inputHandleRef}
              onSubmit={handleCommandSubmit}
              getCompletions={vfsRoot ? (input) => getCompletions(input, state, vfsRoot) : undefined}
              onCompletionCandidates={handleCompletionCandidates}
              prompt={currentPrompt}
            />
          </div>
          <div ref={bottomRef} />
        </div>
      </ScrollArea>
    </div>
  );
}
