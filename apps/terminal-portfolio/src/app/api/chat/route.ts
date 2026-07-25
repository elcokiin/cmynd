import { google } from "@ai-sdk/google";
import type { ModelMessage } from "ai";
import { streamText } from "ai";
import { fetchPortfolioData } from "@/lib/convex-server";

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const payload = (await req.json()) as { messages?: ModelMessage[] };
    const incomingMessages = payload.messages;

    if (!Array.isArray(incomingMessages) || incomingMessages.length === 0) {
      return new Response(
        JSON.stringify({ error: "Invalid request: messages are required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const messages = incomingMessages.slice(-20);

    const { profile, skills, projects, experience } = await fetchPortfolioData();

    const systemPrompt = `You are an AI assistant representing ${profile.name} (a ${profile.headline}).
${profile.philosophy ? `\nPhilosophy: ${profile.philosophy}\n` : ""}
You have access to the following data:

## Skills
${skills.map((s) => `- ${s.name} (${s.category})${s.proficiency ? ` - proficiency: ${s.proficiency}` : ""}`).join("\n")}

## Projects
${projects.map((p) => `- ${p.title}${p.description ? `: ${p.description}` : ""}${p.technologies?.length ? ` [${p.technologies.join(", ")}]` : ""}`).join("\n")}

## Experience
${experience.map((e) => `- ${e.title} at ${e.organization}${e.startDate ? ` (${e.startDate} - ${e.isCurrent ? "Present" : e.endDate ?? "Present"})` : ""}${e.description ? `: ${e.description}` : ""}`).join("\n")}

Answer questions accurately based on this information. Be concise, professional, and directly address the user's queries. Keep your tone aligned with an experienced software engineer.`;

    const result = streamText({
      model: google("gemini-2.5-flash"),
      messages,
      system: systemPrompt,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("API Error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate response" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}