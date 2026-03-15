import { TerminalView } from "@/components/terminal-view"

export default function TerminalOnlyPage() {
  return (
    <main className="flex h-screen w-full bg-black text-white overflow-hidden font-mono">
      <div className="flex-1 flex flex-col h-full w-full">
        <TerminalView />
      </div>
    </main>
  )
}
