/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

type ENV = {
  CONVEX_URL: string;
};

type Runtime = import("@astrojs/cloudflare").Runtime<ENV>;

declare namespace App {
  interface Locals extends Runtime {}
}

interface ImportMetaEnv {
  readonly CONVEX_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
