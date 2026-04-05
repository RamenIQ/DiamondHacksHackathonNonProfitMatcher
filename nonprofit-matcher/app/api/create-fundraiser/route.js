import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export async function POST(request) {
  try {
    const { orgName, cause, state, purpose, beneficiaries, timeline, story, urgency } =
      await request.json();

    if (!orgName || !purpose) {
      return Response.json(
        { error: "Organization name and campaign purpose are required." },
        { status: 400 }
      );
    }

    const prompt = `You are an expert nonprofit fundraising strategist. Based on the information below, create a compelling fundraising campaign.

ORGANIZATION:
- Name: ${orgName}
- Cause: ${cause || "General nonprofit"}
- State: ${state || "Not specified"}

CAMPAIGN DETAILS:
- Purpose: ${purpose}
- Who it helps: ${beneficiaries || "Not specified"}
- Timeline: ${timeline || "60 days"}
- Story / Urgency: ${story || "Not provided"}
- Additional urgency: ${urgency || "None"}

Return ONLY valid JSON (no markdown, no code fences) with exactly these fields:
{
  "campaign_title": "A compelling, specific campaign title (string)",
  "tagline": "One punchy sentence hook under 15 words (string)",
  "story_paragraphs": ["paragraph 1", "paragraph 2", "paragraph 3"],
  "goal_amount": realistic fundraising goal as integer dollars based on the purpose and scale (number),
  "days_left": number of days for the campaign based on timeline (number),
  "impact_items": [
    { "amount": 25, "description": "Specific impact of $25 donation" },
    { "amount": 100, "description": "Specific impact of $100 donation" },
    { "amount": 500, "description": "Specific impact of $500 donation" }
  ],
  "donation_tiers": [10, 25, 50, 100, 250, 500],
  "campaign_type": "emergency" | "project" | "ongoing",
  "updates": [
    { "date": "Campaign launched", "text": "One short update sentence about the launch." }
  ]
}

Make the story emotionally compelling, specific, and donor-focused. The goal amount should be realistic for a small-to-mid nonprofit (typically $5,000–$100,000). Impact items must be specific and tangible.`;

    const response = await client.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 2048,
      messages: [{ role: "user", content: prompt }],
    });

    let text = response.content[0].text.trim();
    text = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();

    const result = JSON.parse(text);
    return Response.json(result);
  } catch (error) {
    console.error("Create fundraiser error:", error);
    return Response.json(
      { error: "Failed to generate fundraiser. Please try again." },
      { status: 500 }
    );
  }
}
