"use client"

import { type FormEvent, useCallback, useEffect, useState } from "react"
import { useMutation } from "convex/react"
import { api } from "@elcokiin/backend/convex/_generated/api"
import { useUIMessages } from "@convex-dev/agent/react"
import { Button } from "@elcokiin/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@elcokiin/ui/card"
import { Input } from "@elcokiin/ui/input"
import { Avatar, AvatarFallback } from "@elcokiin/ui/avatar"
import { Message, MessageAvatar, MessageContent } from "@elcokiin/ui/message"
import { Bubble, BubbleContent } from "@elcokiin/ui/bubble"
import {
  MessageScrollerProvider,
  MessageScroller,
  MessageScrollerViewport,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerButton,
} from "@elcokiin/ui/message-scroller"
import { Marker, MarkerContent } from "@elcokiin/ui/marker"
import ReactMarkdown from "react-markdown"
import { useMarkdownResponse } from "@/hooks/use-markdown-response"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@elcokiin/ui/alert-dialog"

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
  const [threadError, setThreadError] = useState<string | null>(null)

  const createThread = useMutation(api.chat.mutations.createThread)

  const initThread = useCallback(async () => {
    setIsInitializing(true)
    setThreadError(null)
    try {
      const { threadId: id } = await createThread()
      setThreadId(id)
      localStorage.setItem(THREAD_STORAGE_KEY, id)
    } catch {
      setThreadError("Failed to initialize chat. Please try again.")
    } finally {
      setIsInitializing(false)
    }
  }, [createThread])

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
      initThread()
    }
  }, [initThread])

  const handleSendMessage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const userMessage = input.trim()
    if (!userMessage || !threadId || messagesStatus === "LoadingFirstPage") return

    setInput("")
    sendMessage({ threadId, prompt: userMessage })
  }

  const handleClearHistory = async () => {
    if (!threadId) return

    localStorage.removeItem(THREAD_STORAGE_KEY)
    await resetThread({ threadId })
    await initThread()
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

  if (threadError) {
    return (
      <Card className="flex flex-col h-full bg-zinc-950 border-zinc-800 text-zinc-100">
        <CardHeader className="pb-4 shrink-0">
          <CardTitle className="text-lg text-zinc-100">AI Summary</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="text-red-400 text-sm">{threadError}</div>
            <Button
              variant="secondary"
              size="sm"
              onClick={initThread}
              className="bg-zinc-800 text-zinc-100 hover:bg-zinc-700"
            >
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="flex flex-col h-full bg-zinc-950 border-zinc-800 text-zinc-100">
      <CardHeader className="pb-4 shrink-0">
        <div>
          <CardTitle className="text-lg text-zinc-100">AI Summary</CardTitle>
          <CardDescription className="text-zinc-400">
            Chat with an AI version of me powered by my portfolio files.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0 min-h-0">
        <MessageScrollerProvider autoScroll>
          <MessageScroller>
            <MessageScrollerViewport>
              <MessageScrollerContent>
                {messages.length === 0 ? (
                  <div className="flex h-full items-center justify-center italic text-zinc-500 text-sm">
                    Ask me anything about my experience, projects, or skills.
                  </div>
                ) : (
                  messages.map((message) => {
                    const text = extractText(message)
                    const msgId = message.id ?? message.key

                    return (
                      <MessageScrollerItem
                        key={msgId}
                        messageId={msgId}
                        scrollAnchor={message.role === "user"}
                      >
                        <Message align={message.role === "user" ? "end" : "start"}>
                          {message.role === "assistant" && (
                            <MessageAvatar>
                              <Avatar className="size-6">
                                <AvatarFallback className="text-[10px] bg-zinc-800 text-zinc-300">
                                  AI
                                </AvatarFallback>
                              </Avatar>
                            </MessageAvatar>
                          )}
                          <MessageContent>
                            <Bubble
                              variant={message.role === "user" ? "default" : "ghost"}
                            >
                              <BubbleContent>
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
                              </BubbleContent>
                            </Bubble>
                          </MessageContent>
                        </Message>
                      </MessageScrollerItem>
                    )
                  })
                )}
                {isResponding && (
                  <Marker role="status">
                    <MarkerContent>Thinking...</MarkerContent>
                  </Marker>
                )}
              </MessageScrollerContent>
            </MessageScrollerViewport>
            <MessageScrollerButton className="bg-zinc-800 text-zinc-100 border-zinc-700 hover:bg-zinc-700" />
          </MessageScroller>
        </MessageScrollerProvider>
      </CardContent>
      <div className="shrink-0 border-t border-zinc-800 p-3 pb-2 space-y-2">
        {messages.length > 0 && (
          <div className="flex justify-center">
            <AlertDialog>
              <AlertDialogTrigger
                render={
                  <button
                    type="button"
                    className="text-[11px] text-zinc-600 hover:text-zinc-400 transition-colors"
                  >
                    Clear conversation
                  </button>
                }
              />
              <AlertDialogContent size="sm">
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear conversation?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will delete the entire AI conversation and start a new one.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleClearHistory}>
                    Clear
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <Input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onFocus={() => {
              setTimeout(() => {
                const form = document.querySelector("[data-slot='message-scroller-viewport']")
                if (form) form.scrollTop = form.scrollHeight
              }, 300)
            }}
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
