export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { messages } = req.body;

    if (!Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages are required" });
    }

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "HTTP-Referer": "https://infinity-ai-zeta.vercel.app",
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
      return res.status(response.status).json({
        error: data.error?.message || "OpenRouter request failed"
      });
    }

    res.status(200).json({
      reply: data.choices?.[0]?.message?.content || "No response"
    });
  } catch (error) {
    res.status(500).json({
      error: error.message || "Server error"
    });
  }
}
