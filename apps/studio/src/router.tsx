import type { Router } from "@tanstack/react-router";

import { ConvexQueryClient } from "@convex-dev/react-query";
import { env } from "@elcokiin/env/studio";
import { ConfigurationError } from "@elcokiin/errors/frontend";
import { QueryClient } from "@tanstack/react-query";
import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";

import { Loader } from "./components/loader";
import "./index.css";
import { routeTree } from "./routeTree.gen";

export function getRouter(): Router<typeof routeTree, "preserve"> {
  const convexUrl = env.VITE_CONVEX_URL;
  if (!convexUrl) {
    throw new ConfigurationError("VITE_CONVEX_URL is not set");
  }

  const convexQueryClient = new ConvexQueryClient(convexUrl);

  const queryClient: QueryClient = new QueryClient({
    defaultOptions: {
      queries: {
        queryKeyHashFn: convexQueryClient.hashFn(),
        queryFn: convexQueryClient.queryFn(),
      },
    },
  });
  convexQueryClient.connect(queryClient);

  const router = createTanStackRouter({
    routeTree,
    defaultPreload: "intent",
    defaultPendingComponent: () => <Loader />,
    defaultNotFoundComponent: () => <div>Not Found</div>,
    context: { queryClient, convexQueryClient },
  });

  setupRouterSsrQueryIntegration({
    router,
    queryClient,
  });

  return router;
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
