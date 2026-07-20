/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as _lib_auth from "../_lib/auth.js";
import type * as auth from "../auth.js";
import type * as authors_helpers from "../authors/helpers.js";
import type * as authors_mutations from "../authors/mutations.js";
import type * as authors_projections from "../authors/projections.js";
import type * as authors_queries from "../authors/queries.js";
import type * as documents_helpers from "../documents/helpers.js";
import type * as documents_mutations from "../documents/mutations.js";
import type * as documents_mutations_admin from "../documents/mutations_admin.js";
import type * as documents_mutations_inspirations from "../documents/mutations_inspirations.js";
import type * as documents_projections from "../documents/projections.js";
import type * as documents_queries from "../documents/queries.js";
import type * as documents_slug_helpers from "../documents/slug_helpers.js";
import type * as documents_stats_helpers from "../documents/stats_helpers.js";
import type * as email_client from "../email/client.js";
import type * as email_index from "../email/index.js";
import type * as email_resend from "../email/resend.js";
import type * as email_send from "../email/send.js";
import type * as email_templates_password_reset from "../email/templates/password_reset.js";
import type * as email_templates_verification from "../email/templates/verification.js";
import type * as healthCheck from "../healthCheck.js";
import type * as http from "../http.js";
import type * as r2 from "../r2.js";
import type * as storage from "../storage.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "_lib/auth": typeof _lib_auth;
  auth: typeof auth;
  "authors/helpers": typeof authors_helpers;
  "authors/mutations": typeof authors_mutations;
  "authors/projections": typeof authors_projections;
  "authors/queries": typeof authors_queries;
  "documents/helpers": typeof documents_helpers;
  "documents/mutations": typeof documents_mutations;
  "documents/mutations_admin": typeof documents_mutations_admin;
  "documents/mutations_inspirations": typeof documents_mutations_inspirations;
  "documents/projections": typeof documents_projections;
  "documents/queries": typeof documents_queries;
  "documents/slug_helpers": typeof documents_slug_helpers;
  "documents/stats_helpers": typeof documents_stats_helpers;
  "email/client": typeof email_client;
  "email/index": typeof email_index;
  "email/resend": typeof email_resend;
  "email/send": typeof email_send;
  "email/templates/password_reset": typeof email_templates_password_reset;
  "email/templates/verification": typeof email_templates_verification;
  healthCheck: typeof healthCheck;
  http: typeof http;
  r2: typeof r2;
  storage: typeof storage;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  betterAuth: import("@convex-dev/better-auth/_generated/component.js").ComponentApi<"betterAuth">;
  resend: import("@convex-dev/resend/_generated/component.js").ComponentApi<"resend">;
  r2: import("@convex-dev/r2/_generated/component.js").ComponentApi<"r2">;
};
