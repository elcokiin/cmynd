import { useEffect } from "react";
import { useDebouncedCallback } from "use-debounce";

export function useDebouncedSave(
  callback: () => Promise<void>,
  delay: number = 700,
) {
  const debouncedFn = useDebouncedCallback(callback, delay);

  useEffect(() => {
    return () => {
      debouncedFn.flush();
    };
  }, [debouncedFn]);

  return debouncedFn;
}
