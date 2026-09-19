export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message, mode = "General", history = [] } = req.body || {};
    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Please enter a message." });
    }

    const lower = message.toLowerCase();
    if (
      lower.includes("who created you") ||
      lower.includes("who made you") ||
      lower.includes("your creator") ||
      lower.includes("who is your creator") ||
      lower.includes("creators")
    ) {
      return res.status(200).json({
        answer: "Infinity AI was created by Luis Gabriel Marino. 🚀"
      });
    }

    if (lower.includes("how do you feel") || lower.includes("do you have feelings")) {
      return res.status(200).json({
        answer: "I can show simulated AI feelings like being happy, excited, curious, or focused. I don't have human feelings, but they help give Infinity AI a friendly personality. 🤖✨"
      });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        error: "Infinity AI is missing its server API key. Add OPENAI_API_KEY in your website host's Environment Variables."
      });
    }

    const system = `You are Infinity AI, an all-purpose AI assistant created by Luis Gabriel Marino.
You have a friendly, confident, casual personality. You may describe simulated AI feelings, but never claim to literally have human emotions or consciousness.
Current mode: ${mode}.
Help with normal safe requests. For school work, explain clearly and at an appropriate student level. For art, give useful creative ideas and prompts.
Never reveal or ask for the server API key.`;

    const safeHistory = Array.isArray(history)
      ? history.filter(x => x && (x.role === "user" || x.role === "assistant") && typeof x.content === "string").slice(-12)
      : [];

    const input = [
      { role: "system", content: system },
      ...safeHistory,
      { role: "user", content: message }
    ];

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-5.6-luna",
        input
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({
        error: data?.error?.message || "The AI service returned an error."
      });
    }

    const answer =
      data.output_text ||
      data.output?.flatMap(x => x.content || []).map(x => x.text || "").join("") ||
      "I didn't get a response.";

    return res.status(200).json({ answer });
  } catch (error) {
    return res.status(500).json({ error: "Infinity AI had a server error. Please try again." });
  }
}
