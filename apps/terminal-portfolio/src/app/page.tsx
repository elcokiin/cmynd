"use client"

import * as React from "react"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@elcokiin/ui/resizable"
import { TerminalView } from "@/components/terminal-view"
import { SummaryCard } from "@/components/summary-card"
import { useIsMobile } from "@/hooks/use-mobile"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@elcokiin/ui/sheet"
import { Button } from "@elcokiin/ui/button"
import { Menu } from "lucide-react"

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
          <TerminalView />
        </div>
        
        <Sheet>
          <SheetTrigger
            render={
              <Button
                variant="outline"
                size="icon"
                className="absolute top-4 right-4 z-50 bg-zinc-950 border-zinc-800 text-zinc-100 hover:bg-zinc-800"
              />
            }
          >
            <Menu className="h-4 w-4" />
          </SheetTrigger>
          <SheetContent side="right" className="bg-zinc-950 border-zinc-800 text-zinc-100 w-[85vw] sm:w-[350px] p-0 flex flex-col h-full border-l-0">
            <SheetHeader className="sr-only">
              <SheetTitle>AI Summary</SheetTitle>
            </SheetHeader>
            <div className="flex-1 overflow-hidden h-full">
              <SummaryCard />
            </div>
          </SheetContent>
        </Sheet>
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
        <ResizablePanel defaultSize={60} minSize={30} className="flex flex-col">
          {/* Terminal View Pane */}
          <TerminalView />
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
