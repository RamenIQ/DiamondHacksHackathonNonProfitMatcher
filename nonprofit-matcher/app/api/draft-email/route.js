import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export async function POST(request) {
  try {
    const { orgName, mission, state, foundationName, matchReason, grantRange } =
      await request.json();

    if (!orgName || !foundationName) {
      return Response.json(
        { error: "Organization name and foundation name are required." },
        { status: 400 }
      );
    }

    const prompt = `Write a professional 3-paragraph fundraising outreach email from a nonprofit organization to a foundation program officer.

NONPROFIT DETAILS:
- Organization Name: ${orgName}
- Mission: ${mission}
- State: ${state || "Not specified"}

FOUNDATION DETAILS:
- Foundation Name: ${foundationName}
- Why They're a Match: ${matchReason}
- Typical Grant Range: ${grantRange}

Instructions:
- Paragraph 1: Introduce the organization, its mission, and the specific impact it has in the community. Make it compelling and concise.
- Paragraph 2: Explain why this foundation is the right partner — connect the organization's work directly to the foundation's stated priorities and giving areas. Reference the match reason naturally.
- Paragraph 3: Make a clear, specific ask. Mention the grant range as context, invite them to learn more, and provide a warm call to action with next steps.

Write in a professional yet warm tone. Do not include subject line, salutation, or signature. Return only the three paragraphs as plain text, separated by blank lines.`;

    const response = await client.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });

    const emailText = response.content[0].text.trim();

    return Response.json({ email: emailText });
  } catch (error) {
    console.error("Draft email API error:", error);
    return Response.json(
      { error: "Failed to draft email. Please try again." },
      { status: 500 }
    );
  }
}
