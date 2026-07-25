"use client"

import { type FormEvent, useEffect, useRef, useState } from "react"
import { useMutation } from "convex/react"
import { api } from "@elcokiin/backend/convex/_generated/api"
import { useUIMessages } from "@convex-dev/agent/react"
import { Button } from "@elcokiin/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@elcokiin/ui/card"
import { Input } from "@elcokiin/ui/input"
import { ScrollArea } from "@elcokiin/ui/scroll-area"
import ReactMarkdown from "react-markdown"
import { useMarkdownResponse } from "@/hooks/use-markdown-response"

interface SummaryCardProps {
  portfolioName?: string
}

function extractText(msg: { parts: { type: string; text?: string }[] }): string {
  return msg.parts.map((p) => ("text" in p ? p.text ?? "" : "")).join("")
}

const THREAD_STORAGE_KEY = "cmynd-chat-thread-id"

export function SummaryCard({ portfolioName = "Diego" }: SummaryCardProps) {
  const { components, remarkPlugins, rehypePlugins } = useMarkdownResponse()
  const [input, setInput] = useState("")
  const [threadId, setThreadId] = useState<string | null>(null)
  const [isInitializing, setIsInitializing] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)

  const createThread = useMutation(api.chat.mutations.createThread)
  const sendMessage = useMutation(api.chat.mutations.sendMessage)
  const resetThread = useMutation(api.chat.mutations.resetThread)

  const { results: messages, status: messagesStatus } = useUIMessages(
    api.chat.queries.listMessages,
    threadId ? { threadId } : "skip",
    { initialNumItems: 50, stream: true },
  )

  useEffect(() => {
    const stored = localStorage.getItem(THREAD_STORAGE_KEY)
    if (stored) {
      setThreadId(stored)
      setIsInitializing(false)
    } else {
      createThread().then(({ threadId: id }) => {
        setThreadId(id)
        localStorage.setItem(THREAD_STORAGE_KEY, id)
        setIsInitializing(false)
      })
    }
  }, [createThread])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const userMessage = input.trim()
    if (!userMessage || !threadId || messagesStatus === "loading") return

    setInput("")
    sendMessage({ threadId, prompt: userMessage })
  }

  const handleClearHistory = async () => {
    if (!threadId) return

    localStorage.removeItem(THREAD_STORAGE_KEY)
    await resetThread({ threadId })

    const { threadId: newId } = await createThread()
    setThreadId(newId)
    localStorage.setItem(THREAD_STORAGE_KEY, newId)
  }

  const isResponding = messages.some(
    (m) => m.status === "streaming" || m.status === "pending",
  )

  if (isInitializing) {
    return (
      <Card className="flex flex-col h-full bg-zinc-950 border-zinc-800 text-zinc-100">
        <CardHeader className="pb-4 shrink-0">
          <CardTitle className="text-lg text-zinc-100">AI Summary</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="text-zinc-500 text-sm">Initializing chat...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="flex flex-col h-full bg-zinc-950 border-zinc-800 text-zinc-100">
      <CardHeader className="pb-4 shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg text-zinc-100">AI Summary</CardTitle>
            <CardDescription className="text-zinc-400">
              Chat with an AI version of me powered by my portfolio files.
            </CardDescription>
          </div>
          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearHistory}
              className="text-zinc-500 hover:text-zinc-300"
            >
              Clear
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0 min-h-0">
        <ScrollArea className="h-full px-6 pb-4">
          {messages.length > 0 ? (
            <div className="space-y-3">
              {messages.map((message, index) => {
                const text = extractText(message)
                return (
                  <div
                    key={`${message.role}-${message.order}-${index}`}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[90%] rounded-md px-3 py-2 text-sm whitespace-pre-wrap leading-relaxed ${
                        message.role === "user"
                          ? "bg-zinc-800 text-zinc-100"
                          : "bg-zinc-900 text-zinc-300 border border-zinc-800 whitespace-normal"
                      }`}
                    >
                      {message.role === "assistant" ? (
                        text ? (
                          <ReactMarkdown
                            remarkPlugins={remarkPlugins}
                            rehypePlugins={rehypePlugins}
                            components={components}
                          >
                            {text}
                          </ReactMarkdown>
                        ) : isResponding ? (
                          "Thinking..."
                        ) : null
                      ) : (
                        text
                      )}
                    </div>
                  </div>
                )
              })}
              <div ref={bottomRef} />
            </div>
          ) : (
            <div className="text-zinc-500 text-sm flex h-full items-center justify-center italic h-32">
              Ask me anything about my experience, projects, or skills.
            </div>
          )}
        </ScrollArea>
      </CardContent>
      <div className="shrink-0 border-t border-zinc-800 p-4">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <Input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder={`Ask about ${portfolioName}'s profile...`}
            className="bg-zinc-900 border-zinc-700 text-zinc-100 placeholder:text-zinc-500"
            disabled={isResponding}
          />
          <Button
            type="submit"
            disabled={isResponding || !input.trim()}
            variant="secondary"
            className="bg-zinc-800 text-zinc-100 hover:bg-zinc-700 disabled:opacity-50"
          >
            {isResponding ? "Thinking..." : "Send"}
          </Button>
        </form>
      </div>
    </Card>
  )
}
