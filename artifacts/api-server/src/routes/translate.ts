import { Router, type IRouter } from "express";
import OpenAI from "openai";

const router: IRouter = Router();

let openai: OpenAI | null = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

router.post("/translate", async (req, res) => {
  const { text, from = "English", to = "Hindi" } = req.body;

  if (!text) {
    res.status(400).json({ error: "text is required" });
    return;
  }

  if (!openai) {
    res.status(503).json({ error: "OpenAI API key not configured." });
    return;
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a professional translator. Translate the given text from ${from} to ${to}. Return ONLY the translated text, nothing else.`,
        },
        { role: "user", content: text },
      ],
      max_tokens: 1000,
    });

    const translated = response.choices[0]?.message?.content || "";
    res.json({ translated, from, to });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Translation failed";
    req.log.error({ err }, "Translation error");
    res.status(500).json({ error: message });
  }
});

export default router;
