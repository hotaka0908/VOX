import cors from "cors";
import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import agoraToken from "agora-token";
import OpenAI from "openai";

const AGORA_APP_ID = process.env.AGORA_APP_ID;
const AGORA_APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const PORT = Number(process.env.PORT ?? 4000);

const { RtcRole, RtcTokenBuilder } = agoraToken;

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// HTTP Server & WebSocket Server
const server = createServer(app);
const wss = new WebSocketServer({ server, path: "/ws" });

wss.on("connection", (ws) => {
  console.log("Client connected to relay");

  if (!OPENAI_API_KEY) {
    console.error("Missing OPENAI_API_KEY");
    ws.close(1008, "Missing OPENAI_API_KEY");
    return;
  }

  // Connect to OpenAI Realtime API
  const openAiWs = new WebSocket(
    "wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01",
    {
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "OpenAI-Beta": "realtime=v1",
      },
    }
  );

  openAiWs.on("open", () => {
    console.log("Connected to OpenAI Realtime API");
  });

  openAiWs.on("message", (data) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(data);
    }
  });

  openAiWs.on("error", (error) => {
    console.error("OpenAI WebSocket error:", error);
  });

  openAiWs.on("close", (code, reason) => {
    console.log(`OpenAI WebSocket closed: ${code} ${reason}`);
    if (ws.readyState === WebSocket.OPEN) {
      ws.close();
    }
  });

  ws.on("message", (data) => {
    if (openAiWs.readyState === WebSocket.OPEN) {
      openAiWs.send(data);
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected");
    if (openAiWs.readyState === WebSocket.OPEN) {
      openAiWs.close();
    }
  });
});

app.get("/healthz", (_req, res) => {
  res.json({ ok: true });
});

// Vision API: analyze a photo using GPT-4o
app.post("/api/vision", async (req, res) => {
  const { image } = req.body;
  if (!image) {
    return res.status(400).json({ error: "image is required (data URL)" });
  }
  if (!OPENAI_API_KEY) {
    return res.status(500).json({ error: "Missing OPENAI_API_KEY" });
  }

  try {
    const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a travel guide vision analyzer. Analyze the photo and return JSON with this exact structure:
{
  "description": "2-3 sentence description of what's in the photo, focusing on location, cultural, or historical context. Write in English.",
  "landmarks": ["identified landmark or notable item names"],
  "suggestedTopics": ["3 interesting things the user might want to know about this place or scene"]
}
Respond ONLY with valid JSON. No markdown fences.`,
        },
        {
          role: "user",
          content: [
            { type: "image_url", image_url: { url: image, detail: "low" } },
          ],
        },
      ],
      max_tokens: 500,
    });

    const text = response.choices[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(text);
    return res.json(parsed);
  } catch (e) {
    console.error("Vision API error:", e);
    return res.status(500).json({
      error: "Vision analysis failed",
      description: "Unable to analyze the photo at this time.",
      landmarks: [],
      suggestedTopics: [],
    });
  }
});

app.post("/rtc/token", (req, res) => {
  res.set("cache-control", "no-store");

  if (!AGORA_APP_ID || !AGORA_APP_CERTIFICATE) {
    return res.status(500).json({
      error: "Missing AGORA_APP_ID / AGORA_APP_CERTIFICATE in server environment",
    });
  }

  const channel = typeof req.body?.channel === "string" ? req.body.channel.trim() : "";
  const uidRaw = req.body?.uid;
  const roleRaw = req.body?.role;
  const ttlSecondsRaw = req.body?.ttlSeconds;

  if (!channel) {
    return res.status(400).json({ error: "channel is required" });
  }

  const uid = Number.isFinite(Number(uidRaw)) ? Number(uidRaw) : NaN;
  if (!Number.isInteger(uid) || uid < 0) {
    return res.status(400).json({ error: "uid must be a non-negative integer" });
  }

  const ttlSeconds = Number.isFinite(Number(ttlSecondsRaw)) ? Number(ttlSecondsRaw) : 3600;
  if (!Number.isInteger(ttlSeconds) || ttlSeconds <= 0 || ttlSeconds > 24 * 3600) {
    return res.status(400).json({ error: "ttlSeconds must be 1..86400" });
  }

  const role = roleRaw === "subscriber" ? RtcRole.SUBSCRIBER : RtcRole.PUBLISHER;

  const token = RtcTokenBuilder.buildTokenWithUid(
    AGORA_APP_ID,
    AGORA_APP_CERTIFICATE,
    channel,
    uid,
    role,
    ttlSeconds,
    ttlSeconds
  );

  return res.json({ appId: AGORA_APP_ID, token });
});

server.listen(PORT, () => {
  console.log(`VOX token server listening on http://localhost:${PORT}`);
});
