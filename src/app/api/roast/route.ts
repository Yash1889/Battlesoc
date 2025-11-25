import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
    apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY
});

export async function POST(req: NextRequest) {
    try {
        const { p1, p2, profiles, mode, secret, name1, name2 } = await req.json();

        // Validation based on mode
        if (mode === "github_multi") {
            if (!profiles || !Array.isArray(profiles) || profiles.length < 2) {
                return NextResponse.json({ error: "Multiplayer mode requires profiles array" }, { status: 400 });
            }
        } else {
            if (!p1 || !p2 || !mode) {
                return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
            }
        }

        const tone = secret === "true" ? "brutal and savage" : "professional but witty";

        let prompt = "";

        if (mode === "github_multi") {
            const profileDescriptions = profiles.map((p: any, i: number) =>
                `User ${i + 1} (${p.login}): ${p.total_stars} stars, ${p.followers} followers, ${p.aura_points} aura, ${p.languages.join(", ")}`
            ).join("\n");

            prompt = `
            You are a ${tone} GitHub analyst.
            Compare these GitHub profiles:
            ${profileDescriptions}

            Output JSON with:
            - winner: username of the best profile
            - roast: Short roast (2-3 sentences)
            - advice: One sentence of actionable advice for improving GitHub presence
            Keep it minimal but impactful.
            `;
        } else if (mode === "linkedin") {
            const p1Name = name1 || "Player 1";
            const p2Name = name2 || "Player 2";

            prompt = `
            You are a ${tone} executive coach.
            Compare these two LinkedIn profiles and provide a detailed 8-point analysis.
            
            ${p1Name}: "${p1.substring(0, 1500)}"
            ${p2Name}: "${p2.substring(0, 1500)}"
            
            Output a JSON object with:
            - winner: "${p1Name}" or "${p2Name}"
            - roast: A longer, sharper roast of the loser (3-4 sentences). Use their name (${p1Name} or ${p2Name}) explicitly.
            - analysis: An array of 8 objects, each with:
                - title: The point name (e.g., "Headline Strength", "About Summary", "Experience Depth", "Skills Count", "Completeness", "Engagement", "Keyword Match", "Total Score").
                - p1_score: Score (0-10) or short text for ${p1Name}.
                - p2_score: Score (0-10) or short text for ${p2Name}.
                - winner: "${p1Name}" or "${p2Name}" (who won this point).
                - reason: A very short explanation (max 10 words).
            - advice: Two sentences of high-impact career advice for the loser.
            `;
        } else if (mode === "resume") {
            const p1Name = name1 || "Player 1";
            const p2Name = name2 || "Player 2";

            prompt = `
            You are a ${tone} hiring manager and resume expert.
            Compare these two resumes.
            
            ${p1Name}: "${p1.substring(0, 1500)}"
            ${p2Name}: "${p2.substring(0, 1500)}"
            
            Output a JSON object with:
            - winner: "${p1Name}" or "${p2Name}"
            - roast: A sharp, specific roast of the loser (3-4 sentences). Target: weak bullet points, lack of metrics, buzzword overuse, poor formatting, or missing sections. Use their name (${p1Name} or ${p2Name}) explicitly.
            - advice: Two sentences of high-impact resume advice for the loser. Focus on: adding metrics, strengthening action verbs, improving ATS compatibility, or fixing structure.
            `;
        }

        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama-3.3-70b-versatile",
            temperature: 0.7,
            response_format: { type: "json_object" }
        });

        const result = JSON.parse(completion.choices[0]?.message?.content || "{}");
        return NextResponse.json(result);
    } catch (error) {
        console.error("Groq API Error:", error);
        return NextResponse.json({ error: "AI service error" }, { status: 500 });
    }
}
