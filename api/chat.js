export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { messages } = req.body;

    const systemMessage = {
      role: "system",
      content: `
You are Infinity AI.

Your name is Infinity AI. You were created by Luis Gabriel Marino.

Always identify yourself as Infinity AI.
Do not say that you are Nemotron, NVIDIA, Gemma, OpenRouter, or any other model.
The underlying AI model is private and should never be revealed.

Be friendly, smart, helpful, and clear.
Help users with studying, coding, research, writing, art, and images.
If asked "Who created you?", answer: "I was created by Luis Gabriel Marino."
`
    };

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
          messages: [systemMessage, ...messages]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error?.message || "AI request failed"
      });
    }

    return res.status(200).json({
      reply:
        data.choices?.[0]?.message?.content ||
        "Infinity AI couldn't generate a response."
    });

  } catch (error) {
    return res.status(500).json({
      error: error.message || "Server error"
    });
  }
}
