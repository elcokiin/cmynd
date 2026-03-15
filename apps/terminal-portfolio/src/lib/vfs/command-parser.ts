import type { DirectoryNode, FileSystemNode } from "./schema";
import fsData from "./fs.json";
import { neofetchOutput } from "@/lib/neofetch";

const rootDir = fsData as DirectoryNode;

export interface TerminalState {
  cwd: string; // Always starts with '/', where '/' is the root
}

export interface CommandResponse {
  newState: TerminalState;
  output: string;
  clear?: boolean;
  isAsync?: boolean;
}

export function normalizePath(cwd: string, targetPath: string): string {
  let p = targetPath;
  if (p.startsWith("~")) {
    p = "/" + p.slice(1);
  }

  const isAbsolute = p.startsWith("/");
  const segments = (isAbsolute ? p : `${cwd}/${p}`).split("/");

  const resolved: string[] = [];
  for (const seg of segments) {
    if (seg === "" || seg === ".") continue;
    if (seg === "..") {
      resolved.pop();
    } else {
      resolved.push(seg);
    }
  }

  return "/" + resolved.join("/");
}

export function getNode(path: string): FileSystemNode | null {
  if (path === "/" || path === "") return rootDir;

  const segments = path.split("/").filter(Boolean);
  let current: FileSystemNode = rootDir;

  for (const seg of segments) {
    if (current.type !== "directory" || !current.children[seg]) {
      return null;
    }
    current = current.children[seg];
  }
  return current;
}

export const BUILT_IN_COMMANDS = [
  "neofetch",
  "ls",
  "cd",
  "cat",
  "pwd",
  "clear",
  "help",
  "ask-diego",
] as const;

function tokenizeInput(input: string): { tokens: string[]; endsWithSpace: boolean } {
  const endsWithSpace = /\s$/.test(input);
  const trimmed = input.trim();

  if (!trimmed) {
    return { tokens: [], endsWithSpace };
  }

  return { tokens: trimmed.split(/\s+/), endsWithSpace };
}

function listPathCompletions(cwd: string, rawToken: string): string[] {
  const token = rawToken || "";
  const trailingSlash = token.endsWith("/");
  const splitIndex = token.lastIndexOf("/");
  const hasPathPrefix = splitIndex !== -1;
  const dirPart = hasPathPrefix ? token.slice(0, splitIndex + 1) : "";
  const partial = hasPathPrefix ? token.slice(splitIndex + 1) : token;
  const basePathInput =
    hasPathPrefix || trailingSlash ? (dirPart || ".") : ".";
  const basePath = normalizePath(cwd, basePathInput);
  const baseNode = getNode(basePath);

  if (!baseNode || baseNode.type !== "directory") {
    return [];
  }

  return Object.values(baseNode.children)
    .filter((child) => child.name.startsWith(partial))
    .map((child) => {
      const suffix = child.type === "directory" ? "/" : "";
      return `${dirPart}${child.name}${suffix}`;
    })
    .sort((a, b) => a.localeCompare(b));
}

export function getCompletions(commandLine: string, state: TerminalState): string[] {
  const { tokens, endsWithSpace } = tokenizeInput(commandLine);

  if (tokens.length === 0) {
    return [...BUILT_IN_COMMANDS];
  }

  if (tokens.length === 1 && !endsWithSpace) {
    const prefix = tokens[0] ?? "";
    return BUILT_IN_COMMANDS.filter((cmd) => cmd.startsWith(prefix));
  }

  const cmd = tokens[0] ?? "";
  const tokenForPath = endsWithSpace ? "" : (tokens[tokens.length - 1] ?? "");

  if (cmd === "cd" || cmd === "ls" || cmd === "cat") {
    return listPathCompletions(state.cwd, tokenForPath);
  }

  return [];
}

export function executeCommand(
  commandLine: string,
  state: TerminalState,
): CommandResponse {
  const args = commandLine.trim().split(/\s+/);
  const cmd = args[0];

  if (!cmd) {
    return { newState: state, output: "" };
  }

  switch (cmd) {
    case "cd": {
      const target = args[1] || "/";
      const resolved = normalizePath(state.cwd, target);
      const node = getNode(resolved);

      if (!node) {
        return {
          newState: state,
          output: `cd: ${target}: No such file or directory`,
        };
      }
      if (node.type !== "directory") {
        return { newState: state, output: `cd: ${target}: Not a directory` };
      }

      return { newState: { ...state, cwd: resolved }, output: "" };
    }
    case "ls": {
      const target = args[1] || ".";
      const resolved = normalizePath(state.cwd, target);
      const node = getNode(resolved);

      if (!node) {
        return {
          newState: state,
          output: `ls: cannot access '${target}': No such file or directory`,
        };
      }
      if (node.type !== "directory") {
        return { newState: state, output: node.name };
      }

      const children = Object.values((node as DirectoryNode).children);
      const output = children.map((c) => c.name).join("  ");
      return { newState: state, output };
    }
    case "cat": {
      if (args.length < 2) {
        return { newState: state, output: "cat: missing file operand" };
      }
      const target = args[1] as string;
      const resolved = normalizePath(state.cwd, target);
      const node = getNode(resolved);

      if (!node) {
        return {
          newState: state,
          output: `cat: ${target}: No such file or directory`,
        };
      }
      if (node.type !== "file") {
        return { newState: state, output: `cat: ${target}: Is a directory` };
      }

      return { newState: state, output: node.content };
    }
    case "clear": {
      return { newState: state, output: "", clear: true };
    }
    case "pwd": {
      return { newState: state, output: state.cwd };
    }
    case "neofetch": {
      return { newState: state, output: neofetchOutput };
    }
    case "help": {
      const helpText = [
        "Available commands:",
        "",
        "  neofetch     - Display system info and resume",
        "  ls           - List directory contents",
        "  cd           - Change directory",
        "  cat          - Display file contents",
        "  pwd          - Print working directory",
        "  clear        - Clear terminal",
        "  ask-diego    - Ask Diego's AI agent a question",
      ].join("\n");
      return { newState: state, output: helpText };
    }
    case "ask-diego": {
      if (args.length < 2) {
        return {
          newState: state,
          output:
            "ask-diego: missing question operand\nUsage: ask-diego <your question>",
        };
      }
      return { newState: state, output: "", isAsync: true };
    }
    default: {
      return { newState: state, output: `command not found: ${cmd}` };
    }
  }
}
