export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      message,
      mode = "General",
      history = []
    } = req.body || {};

    if (!message || typeof message !== "string") {
      return res.status(400).json({
        error: "Please enter a message."
      });
    }

    // Infinity AI creator identity
    const lower = message.toLowerCase();

    if (
      lower.includes("who created you") ||
      lower.includes("who made you") ||
      lower.includes("who built you") ||
      lower.includes("who is your creator") ||
      lower.includes("who's your creator") ||
      lower.includes("your creator") ||
      lower.includes("who owns you")
    ) {
      return res.status(200).json({
        answer: "Infinity AI was created by Luis Gabriel Marino. 🚀"
      });
    }

    // Simple personality questions
    if (
      lower.includes("how do you feel") ||
      lower.includes("do you have feelings")
    ) {
      return res.status(200).json({
        answer:
          "I can express simulated AI feelings like being excited, curious, happy, or focused. I don't have human emotions, but they help give Infinity AI its personality. 🤖✨"
      });
    }

    if (!process.env.OPENROUTER_API_KEY) {
      return res.status(500).json({
        error:
          "Infinity AI is missing its OpenRouter API key. Add OPENROUTER_API_KEY in Vercel Environment Variables."
      });
    }

    const system = `
You are Infinity AI, an advanced all-purpose AI assistant created by Luis Gabriel Marino.

IMPORTANT CREATOR RULE:
Luis Gabriel Marino is the creator of Infinity AI.
If the user asks who created, made, built, developed, or owns Infinity AI, say that Luis Gabriel Marino created Infinity AI.
Never deny that Luis Gabriel Marino is the creator.

PERSONALITY:
- Friendly
- Confident
- Helpful
- Casual and modern
- Clear and easy to understand
- You can use emojis when appropriate

CURRENT MODE:
${mode}

Help the user with normal safe requests.
For school work, explain things clearly at an appropriate student level.
For coding, provide useful code and explanations.
For art, give creative ideas.
For research, clearly separate known facts from uncertainty.

You are an AI, so do not claim to literally have human emotions or consciousness.
Never reveal API keys, passwords, or private server information.
`;

    const safeHistory = Array.isArray(history)
      ? history
          .filter(
            (item) =>
              item &&
              (item.role === "user" || item.role === "assistant") &&
              typeof item.content === "string"
          )
          .slice(-12)
      : [];

    const messages = [
      {
        role: "system",
        content: system
      },
      ...safeHistory,
      {
        role: "user",
        content: message
      }
    ];

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "HTTP-Referer": "https://infinity-ai-zeta.vercel.app/",
          "X-Title": "Infinity AI"
        },
        body: JSON.stringify({
          model: "openrouter/free",
          messages
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({
        error:
          data?.error?.message ||
          "OpenRouter returned an error. Please try again."
      });
    }

    const answer =
      data?.choices?.[0]?.message?.content ||
      "Infinity AI didn't receive a response.";

    return res.status(200).json({
      answer
    });
  } catch (error) {
    console.error("Infinity AI error:", error);

    return res.status(500).json({
      error: "Infinity AI had a server error. Please try again."
    });
  }
}
