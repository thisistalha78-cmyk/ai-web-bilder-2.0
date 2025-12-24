import express from "express";
import fs from "fs";
import path from "path";
import archiver from "archiver";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static("public"));

const MODELS = [
  "tngtech/deepseek-r1t-chimera:free",
  "deepseek/deepseek-r1-0528:free",
  "alibaba/tongyi-deepresearch-30b-a3b:free"
];

function cleanHTML(html) {
  if (!html) return "";
  return html
    .replace(/```html|```/gi, "")
    .replace(/^[\s\S]*?<(!DOCTYPE|html)/i, "<!DOCTYPE html")
    .replace(/<\/html>[\s\S]*$/i, "</html>")
    .trim();
}

async function callAI(prompt) {
  for (const model of MODELS) {
    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: "system",
              content:
                "Return ONLY valid HTML. No explanations. No markdown. No text outside HTML."
            },
            { role: "user", content: prompt }
          ]
        })
      });

      const data = await res.json();
      if (data?.choices?.[0]?.message?.content) {
        return cleanHTML(data.choices[0].message.content);
      }
    } catch {}
  }
  throw new Error("AI failed");
}

/* PREVIEW (SPA) */
app.post("/preview", async (req, res) => {
  try {
    const prompt = `
Create a SINGLE PAGE website.

Rules:
- All sections in one HTML
- JS navigation
- Fixed header MUST include body padding-top
- Long content
- Real Unsplash images
- DO NOT explain anything

Website:
${req.body.prompt}
`;
    const html = await callAI(prompt);
    res.json({ html });
  } catch {
    res.status(500).json({ error: "Preview failed" });
  }
});

/* EXPORT (MULTI PAGE ZIP) */
app.post("/export", async (req, res) => {
  try {
    const prompt = `
Create REAL MULTI PAGE website.

Return EXACT format:

---index.html---
(full html)

---about.html---
(full html)

---services.html---
(full html)

---contact.html---
(full html)

Rules:
- No explanation
- Fixed header MUST include body padding-top
- Long pages
- Real Unsplash images
- Proper links

Website:
${req.body.prompt}
`;

    const output = await callAI(prompt);

    const siteDir = "site";
    fs.rmSync(siteDir, { recursive: true, force: true });
    fs.mkdirSync(siteDir);

    const parts = output.split(/---(.+?)---/g);
    for (let i = 1; i < parts.length; i += 2) {
      fs.writeFileSync(
        path.join(siteDir, parts[i].trim()),
        cleanHTML(parts[i + 1])
      );
    }

    const zipPath = "public/site.zip";
    const archive = archiver("zip");
    archive.pipe(fs.createWriteStream(zipPath));
    archive.directory(siteDir, false);
    await archive.finalize();

    res.json({ download: "/site.zip" });
  } catch {
    res.status(500).json({ error: "Export failed" });
  }
});

app.listen(PORT, () =>
  console.log("✅ Server running | API KEY:", !!process.env.OPENROUTER_API_KEY)
);
