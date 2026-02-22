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
