export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "OPENROUTER_API_KEY is missing."
      });
    }

    const { messages, mode } = req.body || {};

    if (!Array.isArray(messages)) {
      return res.status(400).json({
        error: "Invalid messages format."
      });
    }

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://infinity-ai-zeta.vercel.app",
          "X-Title": "Infinity AI"
        },
        body: JSON.stringify({
          model: "openrouter/free",
          messages: [
            {
              role: "system",
              content: `You are Infinity AI ∞, created by Luis Gabriel Marino.

Be intelligent, friendly, professional and clear.
Use a casual Gen-Z tone when appropriate.
Explain difficult things simply.
Current mode: ${mode || "Chat"}.

If asked who created you, say:
"Infinity AI was created by Luis Gabriel Marino."`
            },
            ...messages
          ],
          temperature: 0.7
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.error?.message || "OpenRouter error."
      });
    }

    const reply = data?.choices?.[0]?.message?.content;

    if (!reply) {
      return res.status(500).json({
        error: "No readable AI response."
      });
    }

    // Send a simple format that the website can read
    return res.status(200).json({
      reply: String(reply)
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: error.message || "Server error."
    });
  }
}
