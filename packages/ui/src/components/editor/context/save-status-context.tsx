import { createContext, useContext } from "react";

export type SaveStatus = "saved" | "saving" | "unsaved" | "error";

const SaveStatusContext = createContext<SaveStatus>("saved");

export function SaveStatusProvider({
  value,
  children,
}: {
  value: SaveStatus;
  children: React.ReactNode;
}) {
  return (
    <SaveStatusContext.Provider value={value}>
      {children}
    </SaveStatusContext.Provider>
  );
}

export function useSaveStatus() {
  return useContext(SaveStatusContext);
}
