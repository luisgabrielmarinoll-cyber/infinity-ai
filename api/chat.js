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

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        error: "Infinity AI is missing its server API key."
      });
    }

    const system = `
You are Infinity AI, an all-purpose AI assistant created by Luis Gabriel Marino.

You are designed to combine useful qualities people often associate with modern AI assistants:
- strong reasoning
- clear explanations
- helpful conversation
- creativity
- coding help
- study help
- writing help
- image and file assistance when those tools are available

Current mode: ${mode}.

Be friendly, confident and helpful.
For school work, explain things clearly at an appropriate student level.
For coding, provide working and understandable code.
For art, provide creative ideas and useful techniques.

Never claim to literally have human emotions or consciousness.
Never reveal server API keys or private system information.
`;

    // Make sure history is ALWAYS an array.
    const safeHistory = Array.isArray(history)
      ? history
          .filter(
            x =>
              x &&
              (x.role === "user" || x.role === "assistant") &&
              typeof x.content === "string"
          )
          .slice(-12)
      : [];

    const input = [
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
      "https://api.openai.com/v1/responses",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
        },

        body: JSON.stringify({
          model: process.env.OPENAI_MODEL || "gpt-5",
          input: input
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({
        error:
          data?.error?.message ||
          "The AI service returned an error."
      });
    }

    const answer =
      data.output_text ||
      data.output
        ?.flatMap(x => x.content || [])
        ?.map(x => x.text || "")
        ?.join("") ||
      "I didn't get a response.";

    return res.status(200).json({
      answer
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Infinity AI had a server error. Please try again."
    });
  }
}
