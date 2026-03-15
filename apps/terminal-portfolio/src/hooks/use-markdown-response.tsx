"use client"

import { type ReactNode, useMemo } from "react"
import type { Components } from "react-markdown"
import rehypeSanitize from "rehype-sanitize"
import remarkGfm from "remark-gfm"

export function useMarkdownResponse() {
  const components = useMemo<Components>(
    () => ({
      p: ({ children }: { children?: ReactNode }) => <p className="mb-2 last:mb-0">{children}</p>,
      ul: ({ children }: { children?: ReactNode }) => <ul className="mb-2 list-disc pl-5 last:mb-0">{children}</ul>,
      ol: ({ children }: { children?: ReactNode }) => <ol className="mb-2 list-decimal pl-5 last:mb-0">{children}</ol>,
      li: ({ children }: { children?: ReactNode }) => <li className="mb-1 last:mb-0">{children}</li>,
      a: ({ href, children }: { href?: string; children?: ReactNode }) => (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="text-sky-300 underline underline-offset-2 transition-colors hover:text-sky-200"
        >
          {children}
        </a>
      ),
      code: ({ children, className }: { children?: ReactNode; className?: string }) => {
        const isBlockCode = Boolean(className)

        if (isBlockCode) {
          return (
            <code className="block overflow-x-auto rounded-md bg-zinc-950 px-3 py-2 text-xs text-zinc-200">{children}</code>
          )
        }

        return <code className="rounded bg-zinc-800 px-1 py-0.5 text-xs text-zinc-100">{children}</code>
      },
      pre: ({ children }: { children?: ReactNode }) => (
        <pre className="mb-2 overflow-x-auto rounded-md border border-zinc-700 bg-zinc-950 p-0 last:mb-0">{children}</pre>
      ),
      blockquote: ({ children }: { children?: ReactNode }) => (
        <blockquote className="mb-2 border-l-2 border-zinc-600 pl-3 italic text-zinc-400 last:mb-0">{children}</blockquote>
      ),
      h1: ({ children }: { children?: ReactNode }) => <h1 className="mb-2 text-base font-semibold text-zinc-100">{children}</h1>,
      h2: ({ children }: { children?: ReactNode }) => <h2 className="mb-2 text-sm font-semibold text-zinc-100">{children}</h2>,
      h3: ({ children }: { children?: ReactNode }) => <h3 className="mb-1 text-sm font-medium text-zinc-100">{children}</h3>,
    }),
    [],
  )

  const remarkPlugins = useMemo(() => [remarkGfm], [])
  const rehypePlugins = useMemo(() => [rehypeSanitize], [])

  return {
    components,
    remarkPlugins,
    rehypePlugins,
  }
}
