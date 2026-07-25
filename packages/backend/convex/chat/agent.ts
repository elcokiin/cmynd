import { Agent } from "@convex-dev/agent";
import { google } from "@ai-sdk/google";
import { components } from "../_generated/api";

export const chatAgent = new Agent(components.agent, {
  name: "Diego",
  languageModel: google("gemini-2.5-flash"),
});
