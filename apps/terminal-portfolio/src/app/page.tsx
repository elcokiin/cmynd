"use client"

import * as React from "react"
import { Suspense } from "react"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@elcokiin/ui/resizable"
import { TerminalView } from "@/components/terminal-view"
import { ConvexErrorBoundary } from "@/components/convex-error-boundary"
import { SummaryCard } from "@/components/summary-card"
import { useIsMobile } from "@/hooks/use-mobile"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@elcokiin/ui/dialog"
import { Button } from "@elcokiin/ui/button"
import { Sparkles } from "lucide-react"

export default function Home() {
  const isMobile = useIsMobile()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <main className="flex h-screen w-full bg-black text-white overflow-hidden font-mono bg-zinc-950" />
    )
  }

  // On mobile, just render the terminal taking full screen and a floating button to open the Sheet
  if (isMobile) {
    return (
      <main className="flex h-screen w-full bg-black text-white overflow-hidden font-mono relative">
        <div className="flex-1 flex flex-col h-full w-full">
          <ConvexErrorBoundary>
            <Suspense fallback={<div className="flex-1 h-full" />}>
              <TerminalView />
            </Suspense>
          </ConvexErrorBoundary>
        </div>
        
        <Dialog>
          <DialogTrigger
            render={
              <Button
                variant="outline"
                size="icon"
                className="absolute top-4 right-4 z-50 bg-zinc-950 border-zinc-800 text-zinc-100 hover:bg-zinc-800 size-9"
              />
            }
          >
            <Sparkles className="h-5 w-5" />
          </DialogTrigger>
          <DialogContent className="bg-zinc-950 border-zinc-800 text-zinc-100 inset-0 top-0 left-0 w-full h-dvh max-w-none translate-x-0 translate-y-0 m-0 rounded-none p-0 flex flex-col overscroll-contain">
            <DialogHeader className="sr-only">
              <DialogTitle>AI Summary</DialogTitle>
            </DialogHeader>
            <SummaryCard />
          </DialogContent>
        </Dialog>
      </main>
    )
  }

  // On desktop, render the split pane
  return (
    <main className="flex h-screen w-full bg-black text-white overflow-hidden font-mono">
      <ResizablePanelGroup
        orientation="horizontal"
        className="h-full w-full"
      >
        <ResizablePanel defaultSize={60} minSize={30} className="flex flex-col min-h-0">
          {/* Terminal View Pane */}
          <div className="flex-1 min-h-0">
            <ConvexErrorBoundary>
              <Suspense fallback={<div className="flex-1 h-full" />}>
                <TerminalView />
              </Suspense>
            </ConvexErrorBoundary>
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle className="bg-zinc-800" />
        <ResizablePanel defaultSize={40} minSize={20} className="flex flex-col bg-zinc-950 p-4 relative">
          {/* Information / GUI Pane */}
          <SummaryCard />
        </ResizablePanel>
      </ResizablePanelGroup>
    </main>
  )
}
