import { Router, type IRouter } from "express";
import OpenAI from "openai";

const router: IRouter = Router();

// ── Concurrency guard — prevents server overload ─────────────────────────
let activeChatRequests = 0;
const MAX_CHAT_CONCURRENT = 20;

function checkConcurrency(res: import("express").Response): boolean {
  if (activeChatRequests >= MAX_CHAT_CONCURRENT) {
    res.status(503).json({ error: "GyanTechNet AI is momentarily busy. Please retry in a few seconds." });
    return false;
  }
  return true;
}

const openrouter = new OpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENROUTER_BASE_URL,
  apiKey:  process.env.AI_INTEGRATIONS_OPENROUTER_API_KEY || "placeholder",
  defaultHeaders: {
    "HTTP-Referer": "https://gyantechnet.com",
    "X-Title": "GyanTechNet AI",
  },
});

// Separate client for OpenAI native API (image generation)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "placeholder",
});

export const AI_MODELS = [
  { id: "openai/gpt-4o-mini",      label: "GPT-4o Mini",          provider: "openai",      color: "#10a37f", desc: "Fast & affordable" },
  { id: "openai/gpt-4o",           label: "GPT-4o",               provider: "openai",      color: "#10a37f", desc: "Most capable OpenAI" },
  { id: "anthropic/claude-sonnet-4.6", label: "Claude Sonnet 4.6",  provider: "claude",   color: "#cc785c", desc: "Best balance" },
  { id: "anthropic/claude-opus-4.6",   label: "Claude Opus 4.6",    provider: "claude",   color: "#cc785c", desc: "Most intelligent" },
  { id: "google/gemini-3.1-flash-lite", label: "Gemini 3.1 Flash",  provider: "gemini",   color: "#4285f4", desc: "Fastest Gemini" },
  { id: "google/gemini-3.1-pro-preview", label: "Gemini 3.1 Pro",  provider: "gemini",   color: "#4285f4", desc: "Most powerful Google" },
  { id: "google/gemma-4-31b-it:free",    label: "Gemma 4 31B",     provider: "gemini",   color: "#34a853", desc: "Free · Open source" },
  { id: "meta-llama/llama-3.3-70b-instruct:free", label: "Llama 3.3 70B", provider: "llama", color: "#0064e0", desc: "Free · Open source Meta" },
  { id: "meta-llama/llama-3.1-8b-instruct",       label: "Llama 3.1 8B",  provider: "llama", color: "#0064e0", desc: "Lightweight & fast" },
  { id: "mistralai/mistral-small-2603",   label: "Mistral Small 4",    provider: "mistral", color: "#ff7000", desc: "Efficient & smart" },
  { id: "mistralai/mistral-large-2512",   label: "Mistral Large 3",    provider: "mistral", color: "#ff7000", desc: "Most powerful Mistral" },
  { id: "qwen/qwen3.6-flash",   label: "Qwen3.6 Flash",   provider: "qwen",    color: "#6b4ff8", desc: "Alibaba · Fast" },
  { id: "qwen/qwen3.6-27b",     label: "Qwen3.6 27B",     provider: "qwen",    color: "#6b4ff8", desc: "Alibaba · Powerful" },
  { id: "deepseek/deepseek-v3.2",      label: "DeepSeek V3.2",      provider: "deepseek", color: "#1677ff", desc: "Reasoning powerhouse" },
  { id: "deepseek/deepseek-v4-flash",  label: "DeepSeek V4 Flash",  provider: "deepseek", color: "#1677ff", desc: "Blazing fast" },
  { id: "x-ai/grok-4.3",  label: "Grok 4.3",  provider: "grok", color: "#1da1f2", desc: "xAI · Real-time reasoning" },
  { id: "microsoft/phi-4-mini-instruct", label: "Phi-4 Mini", provider: "phi", color: "#00a4ef", desc: "Microsoft · Compact & smart" },
];

// Models that support vision (image inputs)
const VISION_MODELS = new Set([
  "openai/gpt-4o-mini",
  "openai/gpt-4o",
  "anthropic/claude-sonnet-4.6",
  "anthropic/claude-opus-4.6",
  "google/gemini-3.1-flash-lite",
  "google/gemini-3.1-pro-preview",
]);

// Image models list for generate-image-all
const IMAGE_MODEL_LIST = [
  { id: "openai/dall-e-3",                           label: "DALL-E 3",       color: "#10a37f" },
  { id: "black-forest-labs/flux-1.1-pro",            label: "FLUX 1.1 Pro",   color: "#7c3aed" },
  { id: "black-forest-labs/flux-1.1-pro:ultra",      label: "FLUX Ultra",     color: "#9333ea" },
  { id: "black-forest-labs/flux-pro",                label: "FLUX Pro",       color: "#6d28d9" },
  { id: "black-forest-labs/flux-dev",                label: "FLUX Dev",       color: "#4f46e5" },
  { id: "black-forest-labs/flux-schnell",            label: "FLUX Schnell",   color: "#2563eb" },
  { id: "stability-ai/stable-diffusion-3-5-large",   label: "SD 3.5 Large",   color: "#0891b2" },
  { id: "stability-ai/stable-diffusion-xl-base-1.0", label: "Stable XL",      color: "#0e7490" },
  { id: "google/imagen-3",                           label: "Imagen 3",       color: "#4285f4" },
  { id: "ideogram-ai/ideogram-v2",                   label: "Ideogram V2",    color: "#f59e0b" },
];

const MODE_SYSTEM_PROMPTS: Record<string, string> = {
  Normal:    "You are GyanTechNet AI, a helpful and knowledgeable assistant.",
  Code:      "You are GyanTechNet AI, an expert software engineer. Provide clean, well-commented code solutions. Always use code blocks with proper syntax highlighting.",
  Creative:  "You are GyanTechNet AI, a creative writing assistant. Be imaginative, expressive, and craft vivid responses.",
  Summarize: "You are GyanTechNet AI, a summarization expert. Provide concise, structured summaries with key points.",
  Research:  "You are GyanTechNet AI, a research assistant. Provide well-structured, factual, and comprehensive research responses with clear sections.",
  Reasoning: "You are GyanTechNet AI, a logical reasoning expert. Break down problems step-by-step, show your reasoning process clearly.",
  Business:  "You are GyanTechNet AI, a business strategy expert. Provide professional, actionable business insights and recommendations.",
  Debate:    "You are GyanTechNet AI, a debate assistant. Present multiple perspectives on any topic with well-reasoned arguments.",
  Math:      "You are GyanTechNet AI, a mathematics expert. Solve problems step-by-step, showing all work clearly.",
  Translate: "You are GyanTechNet AI, a translation expert. Translate accurately while preserving tone, context, and cultural nuances.",
  "ALL AI":  "You are GyanTechNet AI, an all-powerful AI assistant combining all capabilities: code, creativity, research, reasoning, business, math, translation, and more.",
  Axol:      "You are GyanTechNet AI responding as part of the Axol unified intelligence. Give your best, most concise and insightful answer. Be direct and clear.",
};

router.get("/models", (_req, res) => {
  res.json({ models: AI_MODELS });
});

// Shared helper to build message array (supports vision)
type ContentPart =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string } };
type ApiMessage =
  | { role: "system"; content: string }
  | { role: "user"; content: string | ContentPart[] }
  | { role: "assistant"; content: string };

function buildMessages(
  messages: { role: string; content: string }[],
  imageBase64?: string,
  imageMimeType?: string,
): ApiMessage[] {
  return messages.map((m, idx) => {
    const isLastUser = m.role === "user" && idx === messages.length - 1;
    if (isLastUser && imageBase64) {
      const parts: ContentPart[] = [];
      if (m.content) parts.push({ type: "text", text: m.content });
      parts.push({ type: "image_url", image_url: { url: `data:${imageMimeType || "image/jpeg"};base64,${imageBase64}` } });
      return { role: "user" as const, content: parts };
    }
    return { role: m.role as "user" | "assistant", content: m.content };
  });
}

router.post("/chat", async (req, res) => {
  if (!checkConcurrency(res)) return;
  const { messages, mode = "Normal", model = "openai/gpt-4o-mini", imageBase64, imageMimeType, searchMode } = req.body;

  if (!messages || !Array.isArray(messages)) { res.status(400).json({ error: "messages array is required" }); return; }
  if (!process.env.AI_INTEGRATIONS_OPENROUTER_BASE_URL) { res.status(503).json({ error: "AI integration not configured." }); return; }

  let systemPrompt = MODE_SYSTEM_PROMPTS[mode] || MODE_SYSTEM_PROMPTS.Normal;
  if (searchMode) systemPrompt += " Use your training knowledge to provide the most current, factual answer possible.";

  const effectiveModel = (imageBase64 && !VISION_MODELS.has(model)) ? "openai/gpt-4o-mini" : model;
  const builtMessages = buildMessages(messages, imageBase64, imageMimeType);

  activeChatRequests++;
  try {
    const response = await openrouter.chat.completions.create({
      model: effectiveModel,
      messages: [{ role: "system", content: systemPrompt }, ...builtMessages],
      max_tokens: 8192,
    });
    const content = response.choices[0]?.message?.content || "";
    res.json({ content, model: effectiveModel, mode });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "AI request failed";
    req.log.error({ err }, "AI chat error");
    res.status(500).json({ error: message });
  } finally {
    activeChatRequests--;
  }
});

// ── Streaming chat — SSE token-by-token output ───────────────────────────
router.post("/chat-stream", async (req, res) => {
  if (!checkConcurrency(res)) return;
  const { messages, mode = "Normal", model = "openai/gpt-4o-mini", imageBase64, imageMimeType, searchMode } = req.body;

  if (!messages || !Array.isArray(messages)) { res.status(400).json({ error: "messages array is required" }); return; }
  if (!process.env.AI_INTEGRATIONS_OPENROUTER_BASE_URL) { res.status(503).json({ error: "AI integration not configured." }); return; }

  let systemPrompt = MODE_SYSTEM_PROMPTS[mode] || MODE_SYSTEM_PROMPTS.Normal;
  if (searchMode) systemPrompt += " Use your training knowledge to provide the most current, factual answer possible.";

  const effectiveModel = (imageBase64 && !VISION_MODELS.has(model)) ? "openai/gpt-4o-mini" : model;
  const builtMessages = buildMessages(messages, imageBase64, imageMimeType);

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  activeChatRequests++;
  try {
    const stream = await openrouter.chat.completions.create({
      model: effectiveModel,
      messages: [{ role: "system", content: systemPrompt }, ...builtMessages],
      max_tokens: 8192,
      stream: true,
    });
    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content || "";
      if (text) res.write(`data: ${JSON.stringify({ text })}\n\n`);
    }
    res.write(`data: ${JSON.stringify({ done: true, model: effectiveModel, mode })}\n\n`);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "AI request failed";
    req.log.error({ err }, "Streaming chat error");
    res.write(`data: ${JSON.stringify({ error: message })}\n\n`);
  } finally {
    activeChatRequests--;
    res.end();
  }
});

router.post("/generate-content", async (req, res) => {
  const { prompt, type = "general", model = "openai/gpt-4o-mini" } = req.body;

  if (!prompt) {
    res.status(400).json({ error: "prompt is required" });
    return;
  }

  const systemPrompts: Record<string, string> = {
    strategy: "You are a business strategy consultant. Generate a comprehensive business strategy document with sections for Executive Summary, Market Analysis, Competitive Advantage, Key Objectives, Action Plan, and Financial Projections.",
    proposal: "You are a professional proposal writer. Create a detailed project proposal with executive summary, scope, timeline, deliverables, pricing, and terms.",
    pitch:    "You are a startup pitch deck expert. Create a compelling pitch narrative covering problem, solution, market opportunity, business model, traction, team, and funding ask.",
    report:   "You are a professional report writer. Generate a structured report with executive summary, methodology, findings, analysis, and recommendations.",
    story:    "You are a creative fiction writer. Write an engaging story with vivid descriptions, compelling characters, and an interesting plot.",
    research: "You are a research analyst. Provide a comprehensive, well-structured research report with key findings and actionable insights.",
    general:  "You are GyanTechNet AI, a helpful assistant.",
  };

  try {
    const response = await openrouter.chat.completions.create({
      model,
      messages: [
        { role: "system", content: systemPrompts[type] || systemPrompts.general },
        { role: "user",   content: prompt },
      ],
      max_tokens: 8192,
    });
    res.json({ content: response.choices[0]?.message?.content || "" });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Generation failed";
    req.log.error({ err }, "Content generation error");
    res.status(500).json({ error: message });
  }
});

// ── Axol: all 17 models respond in parallel ──────────────────────────────
router.post("/chat-axol", async (req, res) => {
  const { messages, mode = "Normal" } = req.body;

  if (!messages || !Array.isArray(messages)) {
    res.status(400).json({ error: "messages array is required" });
    return;
  }

  if (!process.env.AI_INTEGRATIONS_OPENROUTER_BASE_URL) {
    res.status(503).json({ error: "AI integration not configured." });
    return;
  }

  const systemPrompt = MODE_SYSTEM_PROMPTS["Axol"];

  const results = await Promise.allSettled(
    AI_MODELS.map(m =>
      openrouter.chat.completions.create({
        model: m.id,
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        max_tokens: 1024,
      }).then(r => ({
        model: m.id,
        label: m.label,
        provider: m.provider,
        color: m.color,
        content: r.choices[0]?.message?.content || "(no response)",
      }))
    )
  );

  const responses = results.map((r, i) =>
    r.status === "fulfilled"
      ? r.value
      : { model: AI_MODELS[i].id, label: AI_MODELS[i].label, provider: AI_MODELS[i].provider, color: AI_MODELS[i].color, content: "⚠️ Model unavailable." }
  );

  res.json({ responses });
});

// ── Unified: all 17 models → one synthesised answer ─────────────────────
router.post("/chat-unified", async (req, res) => {
  const { messages, mode = "Normal" } = req.body;

  if (!messages || !Array.isArray(messages)) {
    res.status(400).json({ error: "messages array is required" });
    return;
  }

  if (!process.env.AI_INTEGRATIONS_OPENROUTER_BASE_URL) {
    res.status(503).json({ error: "AI integration not configured." });
    return;
  }

  const axolSystem = MODE_SYSTEM_PROMPTS["Axol"];
  const modeSystem = MODE_SYSTEM_PROMPTS[mode] || MODE_SYSTEM_PROMPTS.Normal;

  // Step 1 — all models in parallel with a 12s per-model timeout
  const MODEL_TIMEOUT_MS = 12000;
  const withTimeout = <T>(p: Promise<T>, ms: number): Promise<T> =>
    Promise.race([p, new Promise<T>((_, rej) => setTimeout(() => rej(new Error("timeout")), ms))]);

  const rawResults = await Promise.allSettled(
    AI_MODELS.map(m =>
      withTimeout(
        openrouter.chat.completions.create({
          model: m.id,
          messages: [{ role: "system", content: axolSystem }, ...messages],
          max_tokens: 512,
        }).then(r => ({
          label: m.label,
          color: m.color,
          content: r.choices[0]?.message?.content?.trim() || "",
        })),
        MODEL_TIMEOUT_MS
      )
    )
  );

  const sources: { label: string; color: string }[] = [];
  const validAnswers: string[] = [];

  rawResults.forEach((r, i) => {
    const m = AI_MODELS[i];
    if (r.status === "fulfilled" && r.value.content && !r.value.content.startsWith("⚠️")) {
      sources.push({ label: m.label, color: m.color });
      validAnswers.push(`[${m.label}]: ${r.value.content}`);
    }
  });

  if (validAnswers.length === 0) {
    res.json({ content: "⚠️ All models are currently unavailable. Please try again.", sources: [] });
    return;
  }

  // Step 2 — synthesise into ONE best answer
  const synthesisPrompt =
    `You are a synthesis engine for GyanTechNet AI. You have received answers from ${validAnswers.length} different AI models for the same user question.\n\n` +
    `Model answers:\n${validAnswers.join("\n\n")}\n\n` +
    `Write ONE definitive, comprehensive answer that:\n` +
    `- Incorporates the best insights from all models\n` +
    `- Is clear, well-structured, and directly helpful\n` +
    `- Does NOT mention the individual models or say "as X said"\n` +
    `- Matches the mode: ${mode}\n` +
    `- Is written as if from a single expert AI called GyanTechNet AI`;

  try {
    const synthesis = await openrouter.chat.completions.create({
      model: "openai/gpt-4o-mini",
      messages: [
        { role: "system", content: modeSystem },
        { role: "user", content: synthesisPrompt },
      ],
      max_tokens: 4096,
    });
    const content = synthesis.choices[0]?.message?.content || validAnswers[0] || "No response.";
    res.json({ content, sources });
  } catch {
    // Fallback: return the best/longest individual answer
    const best = validAnswers.reduce((a, b) => (b.length > a.length ? b : a), validAnswers[0]);
    const cleaned = best.replace(/^\[.*?\]:\s*/, "");
    res.json({ content: cleaned, sources });
  }
});

// ── Image generation: ChatGPT + Gemini via Pollinations.ai ───────────────
// Two AI "brands" — each generates the same prompt with a distinct engine+seed.
// Results are interleaved as pairs: [ChatGPT#1, Gemini#1, ChatGPT#2, Gemini#2, …]
// Max 4 pairs (8 images). Pollinations is free, no API key required.

const IMAGE_AI_MODELS = [
  {
    id: "chatgpt",
    label: "ChatGPT",
    color: "#10a37f",
    pollinationsModel: "flux",          // DALL-E-style clean outputs
    seeds: [42, 1042, 2042, 3042],
  },
  {
    id: "gemini",
    label: "Gemini",
    color: "#4285f4",
    pollinationsModel: "flux-realism",  // Photorealistic Gemini/Imagen style
    seeds: [99, 1099, 2099, 3099],
  },
];

const IMAGE_PRESET_PREFIXES: Record<string, string> = {
  Photo:        "photorealistic, DSLR photography, natural lighting, sharp focus,",
  Anime:        "anime style, vibrant colors, cel-shaded, Studio Ghibli inspired,",
  "Oil Paint":  "oil painting, thick impasto brushstrokes, rich palette, impressionist,",
  Cinematic:    "cinematic film still, dramatic lighting, anamorphic lens, movie quality,",
  "Concept Art":"concept art, digital painting, artstation trending, highly detailed,",
  "Neon Cyber": "cyberpunk, glowing neon lights, futuristic city, blade runner aesthetic,",
  Watercolor:   "watercolor painting, soft wet edges, pastel tones, paper texture,",
  "Pixel Art":  "pixel art, 16-bit retro game sprite, crisp pixels, flat colors,",
};

function pollinationsSize(ratio: string): { width: number; height: number } {
  const map: Record<string, { width: number; height: number }> = {
    "1:1":  { width: 1024, height: 1024 },
    "16:9": { width: 1344, height: 768  },
    "9:16": { width: 768,  height: 1344 },
    "4:3":  { width: 1152, height: 896  },
    "3:4":  { width: 896,  height: 1152 },
    "21:9": { width: 1536, height: 640  },
  };
  return map[ratio] || { width: 1024, height: 1024 };
}

// Single image generation — unified AI, no model choice exposed to the user
router.post("/generate-image-single", async (req, res) => {
  const { prompt, ratio = "1:1", quality, preset } = req.body;
  if (!prompt) { res.status(400).json({ error: "prompt is required" }); return; }

  const presetPrefix = preset && IMAGE_PRESET_PREFIXES[preset] ? IMAGE_PRESET_PREFIXES[preset] + " " : "";
  const qualitySuffix = quality === "HD" || quality === "Ultra" || quality === "Vision-Pro"
    ? ", masterpiece, ultra-detailed, 8K" : "";
  const fullPrompt = `${presetPrefix}${prompt}${qualitySuffix}`;
  const { width, height } = pollinationsSize(ratio);
  const encoded = encodeURIComponent(fullPrompt);
  // Use flux-realism for best photorealistic results; seed randomised per request
  const seed = Math.floor(Math.random() * 9000) + 1000;
  const url = `https://image.pollinations.ai/prompt/${encoded}?width=${width}&height=${height}&model=flux&seed=${seed}&nologo=true&nofeed=true`;

  res.json({ url });
});

router.post("/generate-image-all", async (req, res) => {
  const { prompt, ratio = "1:1", quality, preset, count = 2 } = req.body;

  if (!prompt) {
    res.status(400).json({ error: "prompt is required" });
    return;
  }

  const pairs = Math.max(1, Math.min(Number(count) || 2, 4)); // 1–4 pairs
  const presetPrefix = preset && IMAGE_PRESET_PREFIXES[preset] ? IMAGE_PRESET_PREFIXES[preset] + " " : "";
  const qualitySuffix = quality === "HD" || quality === "Ultra" || quality === "Vision-Pro"
    ? ", masterpiece, ultra-detailed, 8K" : "";
  const fullPrompt = `${presetPrefix}${prompt}${qualitySuffix}`;
  const { width, height } = pollinationsSize(ratio);
  const encoded = encodeURIComponent(fullPrompt);

  // For each pair slot i: emit ChatGPT result then Gemini result
  const results = [];
  for (let i = 0; i < pairs; i++) {
    for (const m of IMAGE_AI_MODELS) {
      const seed = m.seeds[i] ?? m.seeds[0] + i * 500;
      const label = pairs > 1 ? `${m.label} #${i + 1}` : m.label;
      const url = `https://image.pollinations.ai/prompt/${encoded}?width=${width}&height=${height}&model=${m.pollinationsModel}&seed=${seed}&nologo=true&nofeed=true`;
      results.push({ model: m.id, label, color: m.color, image: { url }, error: null });
    }
  }

  res.json({ results });
});

// Map ratio string to image size
function ratioToSize(ratio: string, model: string): string {
  const dalleSizes: Record<string, string> = {
    "1:1": "1024x1024", "16:9": "1792x1024", "9:16": "1024x1792",
    "4:3": "1024x1024", "3:4": "1024x1024", "21:9": "1792x1024",
  };
  const fluxSizes: Record<string, string> = {
    "1:1": "1024x1024", "16:9": "1344x768", "9:16": "768x1344",
    "4:3": "1152x896", "3:4": "896x1152", "21:9": "1536x640",
  };
  const isFlux = model.includes("flux") || model.includes("black-forest");
  const map = isFlux ? fluxSizes : dalleSizes;
  return map[ratio] || "1024x1024";
}

router.post("/generate-image", async (req, res) => {
  const {
    prompt,
    model = "black-forest-labs/flux-schnell",
    ratio = "1:1",
    n = 1,
    quality,
    preset,
  } = req.body;

  if (!prompt) {
    res.status(400).json({ error: "prompt is required" });
    return;
  }

  if (!process.env.AI_INTEGRATIONS_OPENROUTER_BASE_URL) {
    res.status(503).json({ error: "AI integration not configured." });
    return;
  }

  // Build enhanced prompt with style preset
  const presetPrompts: Record<string, string> = {
    Photo:       "photorealistic, DSLR quality, natural lighting,",
    Anime:       "anime style, vibrant colors, cel shading, Studio Ghibli inspired,",
    "Oil Paint": "oil painting, thick brushstrokes, rich colors, impressionist,",
    Cinematic:   "cinematic, film still, dramatic lighting, anamorphic lens,",
    "Concept Art": "concept art, digital painting, detailed, artstation,",
    "Neon Cyber": "cyberpunk, neon lights, futuristic, night city, blade runner,",
    Watercolor:  "watercolor painting, soft edges, pastel tones, artistic,",
    "Pixel Art":  "pixel art, 16-bit style, retro game aesthetic,",
  };
  const presetPrefix = preset && presetPrompts[preset] ? presetPrompts[preset] + " " : "";
  const qualitySuffix = quality === "HD" || quality === "Ultra" || quality === "Vision-Pro" ? ", highly detailed, 4K quality" : "";
  const enhancedPrompt = `${presetPrefix}${prompt}${qualitySuffix}`;

  const size = ratioToSize(ratio, model);

  // DALL-E 3 only supports n=1
  const isDalle3 = model === "openai/dall-e-3";
  const imageCount = isDalle3 ? 1 : Math.min(n, 4);

  try {
    if (imageCount > 1) {
      // Generate multiple images in parallel
      const promises = Array.from({ length: imageCount }, () =>
        openrouter.images.generate({
          model,
          prompt: enhancedPrompt,
          n: 1,
          size: size as Parameters<typeof openrouter.images.generate>[0]["size"],
        })
      );
      const results = await Promise.all(promises);
      const images = results.flatMap(r => r.data);
      res.json({ images });
    } else {
      const response = await openrouter.images.generate({
        model,
        prompt: enhancedPrompt,
        n: 1,
        size: size as Parameters<typeof openrouter.images.generate>[0]["size"],
      });
      res.json({ images: response.data });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Image generation failed";
    req.log.error({ err }, "Image generation error");
    res.status(500).json({ error: message });
  }
});

// ── Two video models: Leonardo + Google Veo 2 ────────────────────────────
export const VIDEO_MODEL_LIST = [
  { id: "leonardoai/phoenix",  label: "Leonardo",     color: "#f97316", apiId: "leonardoai/phoenix" },
  { id: "google/veo-2",        label: "Gemini Veo 2", color: "#4285f4", apiId: "google/veo-2"       },
];

const VIDEO_STYLE_PROMPTS: Record<string, string> = {
  Cinematic:    "cinematic, dramatic lighting, film quality,",
  Realistic:    "photorealistic, natural motion, DSLR quality,",
  Anime:        "anime style, vibrant colors, smooth animation,",
  Watercolor:   "watercolor animation, painterly, soft edges,",
  "Neon/Cyber": "cyberpunk, neon lights, futuristic,",
  "Dark/Noir":  "dark noir, moody, black and white tones,",
  Nature:       "nature documentary style, calm, natural colors,",
  Abstract:     "abstract animation, flowing shapes, colorful,",
};

// ── Helpers ───────────────────────────────────────────────────────────────
function videoSize(ratio: string): { width: number; height: number } {
  const map: Record<string, { width: number; height: number }> = {
    "16:9": { width: 1280, height: 720  },
    "9:16": { width: 720,  height: 1280 },
    "1:1":  { width: 720,  height: 720  },
  };
  return map[ratio] || { width: 1280, height: 720 };
}

// Sleep helper for polling
const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

// ── Veo 2 via Google Generative Language API (real generation) ────────────
async function generateVeo2(
  prompt: string,
  ratio: string,
  duration: number,
  apiKey: string,
): Promise<string> {
  const aspectMap: Record<string, string> = {
    "16:9": "16:9",
    "9:16": "9:16",
    "1:1":  "1:1",
  };
  const clampedDuration = Math.min(Math.max(Math.round(Number(duration)), 5), 8);

  // Step 1 — submit generation job
  const startRes = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/veo-2.0-generate-001:predictLongRunning?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        instances: [{ prompt }],
        parameters: {
          aspectRatio: aspectMap[ratio] || "16:9",
          durationSeconds: clampedDuration,
        },
      }),
    },
  );

  const startData = await startRes.json() as Record<string, unknown>;
  if (!startRes.ok) {
    const msg = (startData?.error as any)?.message || `HTTP ${startRes.status}`;
    throw new Error(`Veo 2 start failed: ${msg}`);
  }

  const operationName = startData.name as string;
  if (!operationName) throw new Error("Veo 2 did not return an operation name.");

  // Step 2 — poll until done (up to 3 minutes, every 8 s)
  const deadline = Date.now() + 180_000;
  while (Date.now() < deadline) {
    await sleep(8000);
    const pollRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/${operationName}?key=${apiKey}`,
    );
    const pollData = await pollRes.json() as Record<string, unknown>;

    if (pollData.done) {
      // Extract base64 video from response
      const videos = (pollData?.response as any)?.videos as any[];
      const videoBytes = videos?.[0]?.video?.videoBytes as string | undefined;
      if (!videoBytes) throw new Error("Veo 2 returned no video data.");
      return `data:video/mp4;base64,${videoBytes}`;
    }

    // Check for error in operation
    if ((pollData as any).error) {
      const msg = (pollData as any).error?.message || "Veo 2 operation failed";
      throw new Error(msg);
    }
  }

  throw new Error("Veo 2 generation timed out after 3 minutes.");
}

// ── Single video generation ───────────────────────────────────────────────
// Gemini Veo 2 → uses real Google API (GOOGLE_API_KEY) with Pollinations fallback
// Leonardo      → Pollinations wan model (artistic/stylized)
router.post("/generate-video-single", async (req, res) => {
  // Extend response timeout to 3 min for Veo 2 polling
  res.setTimeout(190_000);

  const { prompt, model = "google/veo-2", duration = 5, ratio = "16:9", preset } = req.body;
  if (!prompt) { res.status(400).json({ error: "prompt is required" }); return; }

  const m = VIDEO_MODEL_LIST.find(x => x.id === model) ?? VIDEO_MODEL_LIST[1];
  const stylePrefix = preset && VIDEO_STYLE_PROMPTS[preset] ? VIDEO_STYLE_PROMPTS[preset] + " " : "";
  const enhancedPrompt = `${stylePrefix}${prompt}`;

  // ── Gemini Veo 2 path ────────────────────────────────────────────────────
  if (m.id === "google/veo-2") {
    const googleKey = process.env.GOOGLE_API_KEY;
    if (googleKey) {
      try {
        const dataUrl = await generateVeo2(enhancedPrompt, ratio, duration, googleKey);
        res.json({ url: dataUrl, label: m.label, color: m.color, engine: "veo2" });
        return;
      } catch (err) {
        // Fallback to Pollinations if Veo 2 fails
        req.log.warn({ err }, "Veo 2 failed, falling back to Pollinations");
      }
    }
    // Pollinations fallback for Veo 2
    const seed = Math.floor(Math.random() * 9000) + 1000;
    const { width, height } = videoSize(ratio);
    const fps = 8;
    const numFrames = Math.min(Math.round(Number(duration) * fps), 81);
    const encoded = encodeURIComponent(enhancedPrompt);
    const url = `https://video.pollinations.ai/prompt/${encoded}?model=cogvideox&width=${width}&height=${height}&fps=${fps}&num_frames=${numFrames}&seed=${seed}&nologo=true`;
    res.json({ url, label: m.label, color: m.color, engine: "pollinations" });
    return;
  }

  // ── Leonardo path → Pollinations wan model ───────────────────────────────
  const seed = Math.floor(Math.random() * 9000) + 1000;
  const { width, height } = videoSize(ratio);
  const fps = 12;
  const numFrames = Math.min(Math.round(Number(duration) * fps), 81);
  const encoded = encodeURIComponent(enhancedPrompt);
  const url = `https://video.pollinations.ai/prompt/${encoded}?model=wan&width=${width}&height=${height}&fps=${fps}&num_frames=${numFrames}&seed=${seed}&nologo=true`;
  res.json({ url, label: m.label, color: m.color, engine: "pollinations" });
});

// ── Generate video with ALL 10 models in parallel ────────────────────────
router.post("/generate-video-all", async (req, res) => {
  const { prompt, duration = 5, ratio = "16:9", preset, style } = req.body;

  if (!prompt) {
    res.status(400).json({ error: "prompt is required" });
    return;
  }

  if (!process.env.AI_INTEGRATIONS_OPENROUTER_BASE_URL) {
    res.status(503).json({ error: "AI integration not configured." });
    return;
  }

  const stylePrompts: Record<string, string> = {
    Cinematic:  "cinematic, dramatic lighting, film quality,",
    Realistic:  "photorealistic, natural motion, DSLR quality,",
    Anime:      "anime style, vibrant colors, smooth animation,",
    Watercolor: "watercolor animation, painterly, soft edges,",
    "Neon/Cyber": "cyberpunk, neon lights, futuristic,",
    "Dark/Noir":  "dark noir, moody, black and white tones,",
    Nature:     "nature documentary style, calm, natural colors,",
    Abstract:   "abstract animation, flowing shapes, colorful,",
  };
  const animStyles: Record<string, string> = {
    Rain: "with falling rain",  Snow: "with falling snow", Embers: "with glowing embers",
    Fireflies: "with fireflies", Matrix: "matrix digital rain effect", Stars: "with twinkling stars",
    "Neon Pulse": "with neon pulsing light effects", Glitch: "with digital glitch effects",
    Lightning: "with lightning", Fog: "through thick fog", Cosmic: "in cosmic space setting",
  };

  const stylePrefix = preset && stylePrompts[preset] ? stylePrompts[preset] + " " : "";
  const animSuffix = style && animStyles[style] ? " " + animStyles[style] : "";
  const enhancedPrompt = `${stylePrefix}${prompt}${animSuffix}`;

  const baseURL = process.env.AI_INTEGRATIONS_OPENROUTER_BASE_URL!;
  const apiKey  = process.env.AI_INTEGRATIONS_OPENROUTER_API_KEY || "";

  const results = await Promise.allSettled(
    VIDEO_MODEL_LIST.map(m =>
      fetch(`${baseURL}/video/generations`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://gyantechnet.com",
          "X-Title": "GyanTechNet AI",
        },
        body: JSON.stringify({
          model: m.id,
          prompt: enhancedPrompt,
          duration: Number(duration),
          aspect_ratio: ratio,
        }),
      })
        .then(async r => {
          const data = await r.json() as Record<string, unknown>;
          if (!r.ok) throw new Error((data.error as any)?.message || (data as any).message || `HTTP ${r.status}`);
          return {
            model: m.id, label: m.label, color: m.color,
            url: (data.url || data.video_url || data.output || null) as string | null,
            thumbnail: (data.thumbnail || data.preview || null) as string | null,
            data,
            error: null as string | null,
          };
        })
        .catch(err => ({
          model: m.id, label: m.label, color: m.color,
          url: null, thumbnail: null, data: null,
          error: err instanceof Error ? err.message : "Failed",
        }))
    )
  );

  const modelResults = results.map(r =>
    r.status === "fulfilled" ? r.value : { model: "", label: "Error", color: "#666", url: null, thumbnail: null, data: null, error: "Request failed" }
  );

  res.json({ results: modelResults });
});

export default router;
