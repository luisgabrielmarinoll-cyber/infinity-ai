# Infinity AI — real AI version

Created by **Luis Gabriel Marino**.

## What this version does
- Real AI chat through `/api/chat`
- Infinity AI personality
- Simulated AI-feeling language
- Creator response for "Who created you?"
- Study / Art / Research / Write / Code / Images modes
- Keeps the API key on the server

## Put it online
This project is designed for Vercel.

1. Upload this project to a GitHub repository.
2. Import the repository into Vercel.
3. In Vercel: **Project → Settings → Environment Variables**
4. Add:
   - Name: `OPENAI_API_KEY`
   - Value: your API key
5. Optionally add `OPENAI_MODEL` with the model available to your API account.
6. Redeploy.

Do NOT put an API key inside `index.html`. The browser code calls `/api/chat`, and the server function reads the secret.

The current build is a real AI chat, not a full web-search or image-generation engine yet. Those can be added as separate server tools later.
