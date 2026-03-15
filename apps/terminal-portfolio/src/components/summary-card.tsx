"use client"

import { type FormEvent, useEffect, useRef, useState } from "react"
import { Button } from "@elcokiin/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@elcokiin/ui/card"
import { Input } from "@elcokiin/ui/input"
import { ScrollArea } from "@elcokiin/ui/scroll-area"
import ReactMarkdown from "react-markdown"
import { useMarkdownResponse } from "@/hooks/use-markdown-response"

interface ChatMessage {
  role: "user" | "assistant"
  content: string
}

export function SummaryCard() {
  const { components, remarkPlugins, rehypePlugins } = useMarkdownResponse()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isLoading])

  const handleSendMessage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const userMessage = input.trim()
    if (!userMessage || isLoading) return

    setIsLoading(true)
    setError(null)
    setInput("")

    const conversation = [...messages, { role: "user" as const, content: userMessage }]
    setMessages((prev) => [...prev, { role: "user", content: userMessage }, { role: "assistant", content: "" }])

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: conversation
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to fetch response')
      }

      if (!response.body) {
        throw new Error('No body in response')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        setMessages((prev) => {
          const next = [...prev]
          const lastIndex = next.length - 1
          const lastMessage = next[lastIndex]

          if (lastMessage && lastMessage.role === "assistant") {
            next[lastIndex] = {
              ...lastMessage,
              content: `${lastMessage.content}${chunk}`,
            }
          }

          return next
        })
      }
    } catch (err) {
      setMessages((prev) => {
        const next = [...prev]
        const lastIndex = next.length - 1
        const lastMessage = next[lastIndex]

        if (lastMessage && lastMessage.role === "assistant" && !lastMessage.content) {
          next.pop()
        }

        return next
      })
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
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
        <ScrollArea className="h-full px-6 pb-4">
          {error ? (
            <div className="text-red-400 text-sm p-4 bg-red-950/20 rounded-md border border-red-900/50">
              {error}
            </div>
          ) : messages.length > 0 ? (
            <div className="space-y-3">
              {messages.map((message, index) => (
                <div key={`${message.role}-${index}`} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[90%] rounded-md px-3 py-2 text-sm whitespace-pre-wrap leading-relaxed ${
                      message.role === "user"
                        ? "bg-zinc-800 text-zinc-100"
                        : "bg-zinc-900 text-zinc-300 border border-zinc-800 whitespace-normal"
                    }`}
                  >
                    {message.role === "assistant" ? (
                      message.content ? (
                        <ReactMarkdown
                          remarkPlugins={remarkPlugins}
                          rehypePlugins={rehypePlugins}
                          components={components}
                        >
                          {message.content}
                        </ReactMarkdown>
                      ) : isLoading ? (
                        "Thinking..."
                      ) : (
                        ""
                      )
                    ) : (
                      message.content
                    )}
                  </div>
                </div>
              ))}
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
            placeholder="Ask about Diego's profile..."
            className="bg-zinc-900 border-zinc-700 text-zinc-100 placeholder:text-zinc-500"
            disabled={isLoading}
          />
          <Button
            type="submit"
            disabled={isLoading || !input.trim()}
            variant="secondary"
            className="bg-zinc-800 text-zinc-100 hover:bg-zinc-700 disabled:opacity-50"
          >
            {isLoading ? "Sending..." : "Send"}
          </Button>
        </form>
      </div>
    </Card>
  )
}
