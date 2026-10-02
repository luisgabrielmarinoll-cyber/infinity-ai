export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    // Check API key
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "OPENROUTER_API_KEY is missing in Vercel."
      });
    }

    // Read request body
    const { messages, mode } = req.body || {};

    if (!Array.isArray(messages)) {
      return res.status(400).json({
        error: "Messages must be an array."
      });
    }

    // Infinity AI personality
    const systemMessage = {
      role: "system",
      content: `
You are Infinity AI ∞, an advanced, friendly and professional AI assistant.

You were created by Luis Gabriel Marino.

Your personality:
- Friendly, confident and intelligent.
- Professional and international.
- Clear and natural.
- Use a casual Gen-Z style when appropriate, without becoming unprofessional.
- Explain difficult things simply.
- Never pretend you can do something you cannot actually do.

Your current mode is: ${mode || "Chat"}.

If the user asks who created you, answer:
"Infinity AI was created by Luis Gabriel Marino."

You are Infinity AI, not ChatGPT or Gemini. You can be inspired by useful AI assistant patterns, but you have your own identity and branding.
      `.trim()
    };

    // Send request to OpenRouter
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
            systemMessage,
            ...messages
          ],
          temperature: 0.7
        })
      }
    );

    const data = await response.json();

    // OpenRouter returned an error
    if (!response.ok) {
      console.error("OpenRouter error:", data);

      return res.status(response.status).json({
        error:
          data?.error?.message ||
          "OpenRouter could not generate a response."
      });
    }

    // Extract AI response
    const reply = data?.choices?.[0]?.message?.content;

    if (!reply) {
      return res.status(500).json({
        error: "OpenRouter returned no AI response."
      });
    }

    return res.status(200).json({
      reply,
      model: data.model || "openrouter/free"
    });

  } catch (error) {
    console.error("Infinity AI server error:", error);

    return res.status(500).json({
      error: "Infinity AI server error.",
      details: error.message
    });
  }
}
