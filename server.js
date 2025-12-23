import express from "express";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();
const app = express();

// Fix __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

/* =========================
   AI MODELS (PRIORITY)
========================= */
const MODELS = [
  "deepseek/deepseek-chat",
  "tngtech/deepseek-r1t-chimera:free",
  "deepseek/deepseek-r1-0528:free",
  "alibaba/tongyi-deepresearch-30b-a3b:free"
];

/* =========================
   CALL AI WITH FALLBACK
========================= */
async function callAI(prompt) {
  for (const model of MODELS) {
    try {
      const response = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model,
          messages: [
            {
              role: "system",
              content:
                "You are an expert web designer. Generate a COMPLETE modern website using ONLY HTML, CSS and JS. Use <style> and <script> inside HTML. Return ONLY valid HTML."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.7
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + process.env.OPENROUTER_API_KEY,
            "HTTP-Referer": process.env.APP_URL || "http://localhost:3000",
            "X-Title": "AI Website Builder"
          },
          timeout: 30000
        }
      );

      const html = response?.data?.choices?.[0]?.message?.content;
      if (html) return html;
    } catch (err) {
      console.log("Model failed:", model);
    }
  }
  return null;
}

/* =========================
   API ROUTE
========================= */
app.post("/generate", async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.json({ html: "<h1>Please enter a prompt</h1>" });
  }

  const html = await callAI(prompt);

  if (!html) {
    return res.json({
      html: "<h1>All AI models are busy. Try again later.</h1>"
    });
  }

  res.json({ html });
});

/* =========================
   START SERVER
========================= */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running at http://localhost:" + PORT);
});
