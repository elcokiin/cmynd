import type { ComponentProps } from "react";

import { Suspense, lazy } from "react";

const AdvancedEditor = lazy(async () => {
  const mod = await import("./advanced-editor");
  return { default: mod.AdvancedEditor };
});

type AdvancedEditorProps = ComponentProps<typeof AdvancedEditor>;

export function ClientOnlyEditor(props: AdvancedEditorProps) {
  if (typeof window === "undefined") {
    return <div className="min-h-[300px] w-full" />;
  }

  return (
    <Suspense fallback={<div className="min-h-[300px] w-full" />}>
      <AdvancedEditor {...props} />
    </Suspense>
  );
}
