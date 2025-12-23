import express from "express";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();
const app = express();

/* =========================
   FIX __dirname (ESM)
========================= */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* =========================
   MIDDLEWARE
========================= */
app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use(express.static(path.join(__dirname, "public")));

/* =========================
   AI MODELS (FALLBACK ORDER)
========================= */
const MODELS = [
  "deepseek/deepseek-chat",                 // most stable (paid)
  "tngtech/deepseek-r1t-chimera:free",
  "deepseek/deepseek-r1-0528:free",
  "alibaba/tongyi-deepresearch-30b-a3b:free"
];

/* =========================
   CLEAN HTML OUTPUT
========================= */
function extractHTML(text) {
  if (!text) return null;

  const start = text.indexOf("<!DOCTYPE html>");
  const end = text.lastIndexOf("</html>");

  if (start !== -1 && end !== -1) {
    return text.substring(start, end + 7);
  }

  return null;
}

/* =========================
   CALL AI WITH FALLBACK
========================= */
async function callAI(prompt) {
  for (const model of MODELS) {
    try {
      console.log("Trying model:", model);

      const response = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model,
          messages: [
            {
              role: "system",
              content:
                "You must return ONLY valid HTML. Do NOT include explanations, comments, markdown, or text before or after HTML. The response MUST start with <!DOCTYPE html> and end with </html>. Use <style> and <script> inside the HTML."
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

      const raw = response?.data?.choices?.[0]?.message?.content;
      const html = extractHTML(raw);

      if (html) {
        console.log("Success with model:", model);
        return html;
      }
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

  if (!prompt || prompt.trim().length < 5) {
    return res.json({
      html: "<h1>Please enter a valid prompt</h1>"
    });
  }

  const html = await callAI(prompt);

  if (!html) {
    return res.json({
      html:
        "<h1>All AI models are busy</h1><p>Please try again in a minute.</p>"
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

