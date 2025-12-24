import express from "express";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();
const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use(express.static(path.join(__dirname, "public")));

/* ---------- MODELS (fallback) ---------- */
const MODELS = [
  "tngtech/deepseek-r1t-chimera:free",
  "deepseek/deepseek-r1-0528:free",
  "alibaba/tongyi-deepresearch-30b-a3b:free"
];

/* ---------- HELPERS ---------- */
function extractHTML(text) {
  if (!text) return null;
  const s = text.indexOf("<!DOCTYPE html>");
  const e = text.lastIndexOf("</html>");
  if (s !== -1 && e !== -1) return text.substring(s, e + 7);
  return null;
}

/* Auto-fix: full height sections, working nav, real images */
function autoFixHTML(html) {
  if (!html) return html;

  // Make sections tall (fix “too short landing page”)
  html = html.replace(
    /<section(?![^>]*style=)/g,
    '<section style="min-height:100vh;padding:80px 40px"'
  );

  // Fix dead links
  html = html.replace(/href="#"/g, 'href="#home"');

  // Ensure anchors exist
  if (!html.includes('id="home"')) {
    html = html.replace(
      /<body[^>]*>/,
      `$&\n<section id="home" style="min-height:100vh;padding:80px 40px"></section>`
    );
  }

  // Replace placeholder images with real Unsplash images
  html = html.replace(
    /<img([^>]*?)src="([^"]*?)"/gi,
    `<img$1src="https://images.unsplash.com/photo-1522199710521-72d69614c702?auto=format&fit=crop&w=1400&q=80"`
  );

  return html;
}

/* ---------- AI CALL ---------- */
async function callAI(prompt) {
  for (const model of MODELS) {
    try {
      const res = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model,
          messages: [
            {
              role: "system",
              content: `
Generate a COMPLETE, FUNCTIONAL website.

Rules:
- Navigation MUST work (anchor sections or real page links)
- Buttons MUST have real actions (scroll or link)
- Use REAL images (Unsplash URLs allowed)
- Sections MUST be full viewport height
- Either:
  • Single-page with section IDs + anchor nav
  • OR Multi-page with page links
- NO dead links or placeholder buttons
- Return ONLY valid HTML
- Start with <!DOCTYPE html>, end with </html>
`
            },
            { role: "user", content: prompt }
          ],
          temperature: 0.7
        },
        {
          headers: {
            Authorization: "Bearer " + process.env.OPENROUTER_API_KEY,
            "HTTP-Referer": process.env.APP_URL,
            "X-Title": "AI Website Builder"
          },
          timeout: 30000
        }
      );

      const raw = res.data.choices[0].message.content;
      const clean = extractHTML(raw);
      if (clean) return autoFixHTML(clean);
    } catch (e) {
      console.log("Model failed:", model);
    }
  }
  return null;
}

/* ---------- API ---------- */
app.post("/generate", async (req, res) => {
  const { prompt, mode } = req.body;

  const finalPrompt = `
Build a ${mode === "multi" ? "multi-page" : "single-page"} website.

IMPORTANT:
- Working navigation
- Full-height sections
- Real images
- No dead buttons

Website idea:
${prompt}
`;

  const html = await callAI(finalPrompt);
  if (!html) return res.json({ error: "AI busy, try again" });
  res.json({ html });
});

/* ---------- START ---------- */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Running at http://localhost:" + PORT);
});

