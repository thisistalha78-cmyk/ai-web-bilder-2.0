import express from "express";
import fs from "fs";
import path from "path";
import archiver from "archiver";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static("public"));

/* ===============================
   OpenRouter models (fallback)
================================ */
const MODELS = [
  "tngtech/deepseek-r1t-chimera:free",
  "deepseek/deepseek-r1-0528:free",
  "alibaba/tongyi-deepresearch-30b-a3b:free"
];

/* ===============================
   AI call with fallback
================================ */
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
              content: "You are a professional web developer. Return ONLY valid HTML."
            },
            { role: "user", content: prompt }
          ]
        })
      });

      const data = await res.json();
      if (data?.choices?.[0]?.message?.content) {
        return data.choices[0].message.content;
      }
    } catch (err) {
      console.error("Model failed:", model);
    }
  }
  throw new Error("All AI models failed");
}

/* ===============================
   PREVIEW MODE (Single-page SPA)
================================ */
app.post("/preview", async (req, res) => {
  try {
    const prompt = `
Create a SINGLE PAGE WEBSITE for preview.

Rules:
- All pages (home, about, services, contact) must be in ONE HTML file
- Navigation must use JavaScript (no page reload)
- Use real Unsplash images
- Long, professional sections
- Fully responsive

Website idea:
${req.body.prompt}
`;

    const html = await callAI(prompt);
    res.json({ html });
  } catch (e) {
    res.status(500).json({ error: "Preview generation failed" });
  }
});

/* ===============================
   EXPORT MODE (REAL MULTI-PAGE)
================================ */
app.post("/export", async (req, res) => {
  try {
    const prompt = `
Create a REAL MULTI-PAGE WEBSITE.

Return EXACTLY in this format:

---index.html---
(full HTML)

---about.html---
(full HTML)

---services.html---
(full HTML)

---contact.html---
(full HTML)

Rules:
- Each file must be a COMPLETE HTML document
- Use real Unsplash images
- Proper <a href="..."> navigation between pages
- Long professional content
- Same header/footer on all pages

Website idea:
${req.body.prompt}
`;

    const aiOutput = await callAI(prompt);

    const siteDir = "site";
    fs.rmSync(siteDir, { recursive: true, force: true });
    fs.mkdirSync(siteDir);

    const parts = aiOutput.split(/---(.+?)---/g);

    for (let i = 1; i < parts.length; i += 2) {
      const filename = parts[i].trim();
      const content = parts[i + 1].trim();
      fs.writeFileSync(path.join(siteDir, filename), content);
    }

    // Create ZIP
    const zipPath = "public/site.zip";
    const output = fs.createWriteStream(zipPath);
    const archive = archiver("zip", { zlib: { level: 9 } });

    archive.pipe(output);
    archive.directory(siteDir, false);
    await archive.finalize();

    res.json({ download: "/site.zip" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Export failed" });
  }
});

/* ===============================
   Health check
================================ */
app.get("/health", (req, res) => {
  res.send("OK");
});

/* ===============================
   Start server
================================ */
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log("API KEY loaded:", !!process.env.OPENROUTER_API_KEY);
});
