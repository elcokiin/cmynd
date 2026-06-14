import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";

import { useDebouncedValue } from "@/hooks/use-debounced-value";

type UseSearchUrlSyncOptions = {
  urlSearch: string;
  baseRoute: string;
  debounceMs?: number;
};

export function useSearchUrlSync({
  urlSearch,
  baseRoute,
  debounceMs = 300,
}: UseSearchUrlSyncOptions) {
  const navigate = useNavigate();
  const [localSearch, setLocalSearch] = useState(urlSearch);
  const debouncedSearch = useDebouncedValue(localSearch, debounceMs);

  useEffect(() => {
    if (urlSearch !== localSearch) {
      setLocalSearch(urlSearch);
    }
  }, [urlSearch]);

  useEffect(() => {
    if (debouncedSearch !== urlSearch) {
      navigate({
        to: baseRoute,
        search: (old: Record<string, unknown>) => ({
          ...old,
          search: debouncedSearch,
          page: 1,
        }),
      });
    }
  }, [debouncedSearch, urlSearch, navigate, baseRoute]);

  return { localSearch, setLocalSearch, debouncedSearch };
}
