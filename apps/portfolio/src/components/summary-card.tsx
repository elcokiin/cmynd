"use client"

import { useState } from "react"
import { Button } from "@elcokiin/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@elcokiin/ui/card"
import { ScrollArea } from "@elcokiin/ui/scroll-area"

export function SummaryCard() {
  const [summary, setSummary] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSummarize = async () => {
    setIsLoading(true)
    setError(null)
    setSummary("")

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: "Summarize this developer's profile." }]
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to fetch summary')
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
        setSummary((prev) => prev + chunk)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="flex flex-col h-full bg-zinc-950 border-zinc-800 text-zinc-100">
      <CardHeader className="pb-4 shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg text-zinc-100">AI Summary</CardTitle>
            <CardDescription className="text-zinc-400">
              Generate an AI-powered summary of my profile.
            </CardDescription>
          </div>
          <Button
            onClick={handleSummarize}
            disabled={isLoading}
            variant="secondary"
            className="bg-zinc-800 text-zinc-100 hover:bg-zinc-700 disabled:opacity-50"
          >
            {isLoading ? "Summarizing..." : "Summarize"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0 min-h-0">
        <ScrollArea className="h-full px-6 pb-6">
          {error ? (
            <div className="text-red-400 text-sm p-4 bg-red-950/20 rounded-md border border-red-900/50">
              {error}
            </div>
          ) : summary ? (
            <div className="text-zinc-300 text-sm whitespace-pre-wrap leading-relaxed prose prose-invert max-w-none">
              {summary}
            </div>
          ) : (
            <div className="text-zinc-500 text-sm flex h-full items-center justify-center italic h-32">
              No summary generated yet. Click the button above to start.
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
