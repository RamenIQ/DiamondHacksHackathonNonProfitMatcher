import Anthropic from "@anthropic-ai/sdk";
import { foundations } from "@/data/foundations";

const client = new Anthropic();

export async function POST(request) {
  try {
    const { orgName, mission, causeArea, state, budgetRange } = await request.json();

    if (!orgName || !mission) {
      return Response.json({ error: "Organization name and mission are required." }, { status: 400 });
    }

    const foundationsList = foundations
      .map((f, i) =>
        `${i + 1}. Name: ${f.name}
   Focus Areas: ${f.focus_areas.join(", ")}
   Geographic Focus: ${f.geographic_focus.join(", ")}
   Grant Range: ${f.typical_grant_range}
   Eligibility: ${f.eligibility.join(", ")}
   Description: ${f.description}
   Website: ${f.website}`
      )
      .join("\n\n");

    const prompt = `You are an expert nonprofit grant researcher. Given the following nonprofit organization details, identify the top 5 best matching foundations from the provided list.

NONPROFIT ORGANIZATION:
- Name: ${orgName}
- Mission: ${mission}
- Primary Cause Area: ${causeArea || "Not specified"}
- State: ${state || "Not specified"}
- Annual Budget Range: ${budgetRange || "Not specified"}

AVAILABLE FOUNDATIONS:
${foundationsList}

Return ONLY a valid JSON array (no markdown, no code fences, no explanation) with exactly 5 objects. Each object must have these exact fields:
- name: foundation name (string)
- match_score: score from 1-100 (number)
- match_reason: 2-3 sentence explanation of why this is a good match (string)
- grant_range: the foundation's typical grant range (string)
- geographic_focus: array of geographic focus areas (array of strings)
- focus_areas: array of the foundation's focus areas (array of strings)
- website: the foundation's website URL (string)

Rank them from highest to lowest match score. Consider alignment of mission, geographic eligibility, cause area overlap, and budget fit.`;

    const response = await client.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 2048,
      messages: [{ role: "user", content: prompt }],
    });

    let text = response.content[0].text.trim();

    // Strip markdown code fences if present
    text = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();

    const matches = JSON.parse(text);

    return Response.json(matches);
  } catch (error) {
    console.error("Match API error:", error);
    return Response.json(
      { error: "Failed to find matches. Please try again." },
      { status: 500 }
    );
  }
}
