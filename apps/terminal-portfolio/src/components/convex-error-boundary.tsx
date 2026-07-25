"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import { toast } from "sonner";
import { parseError } from "@elcokiin/errors";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

const PORTFOLIO_MESSAGES: Record<string, string> = {
  PORTFOLIO_7001:
    "Portfolio not found — the creator hasn't set up their profile yet.",
};

export class ConvexErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, errorMessage: "" };
  }

  static getDerivedStateFromError(error: Error): State {
    const { code } = parseError(error);
    const errorMessage =
      (code && PORTFOLIO_MESSAGES[code]) ?? "Something went wrong.";
    return { hasError: true, errorMessage };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { code } = parseError(error);
    const message =
      (code && PORTFOLIO_MESSAGES[code]) ?? "Something went wrong.";
    toast.error(message);
    console.error("[ConvexErrorBoundary]", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex h-full w-full items-center justify-center">
          <div className="text-zinc-500 text-sm font-mono text-center max-w-md">
            <p>{this.state.errorMessage}</p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
