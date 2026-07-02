import { type JSX, createContext, useContext } from "react";

import type { UploadFn } from "src/components/editor";

const Context = createContext<{
  uploadFn: UploadFn | null;
}>({
  uploadFn: null,
});

export function EditorConfigProvider({
  uploadFn,
  children,
}: {
  uploadFn: UploadFn | null;
  children: React.ReactNode;
}): JSX.Element {
  return (
    <Context.Provider value={{ uploadFn }}>{children}</Context.Provider>
  );
}

export function useEditorConfig() {
  return useContext(Context);
}
