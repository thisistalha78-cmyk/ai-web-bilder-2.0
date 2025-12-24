import express from "express";
import fetch from "node-fetch";
import fs from "fs";
import archiver from "archiver";
import path from "path";

const app = express();
app.use(express.json());
app.use(express.static("public"));

const MODELS = [
  "tngtech/deepseek-r1t-chimera:free",
  "deepseek/deepseek-r1-0528:free",
  "alibaba/tongyi-deepresearch-30b-a3b:free"
];

async function callAI(prompt) {
  for (const model of MODELS) {
    try {
      const r = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: "Return ONLY valid HTML." },
            { role: "user", content: prompt }
          ]
        })
      });
      const d = await r.json();
      if (d.choices) return d.choices[0].message.content;
    } catch {}
  }
  throw new Error("AI failed");
}

/* ========= PREVIEW (SPA) ========= */
app.post("/preview", async (req, res) => {
  const prompt = `
Create a SINGLE PAGE website for preview.
Use sections: home, about, services, contact.
Navigation must use JavaScript (no page reload).
Website idea:
${req.body.prompt}
`;
  const html = await callAI(prompt);
  res.json({ html });
});

/* ========= EXPORT (REAL MULTI PAGE) ========= */
app.post("/export", async (req, res) => {
  const prompt = `
Create a REAL MULTI PAGE website.

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
- Use real Unsplash images
- Proper navigation links
- Long professional content

Website idea:
${req.body.prompt}
`;

  const output = await callAI(prompt);

  const dir = "site";
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir);

  const parts = output.split(/---(.+?)---/g);
  for (let i = 1; i < parts.length; i += 2) {
    fs.writeFileSync(path.join(dir, parts[i].trim()), parts[i + 1].trim());
  }

  const zipPath = "public/site.zip";
  const zip = archiver("zip");
  zip.pipe(fs.createWriteStream(zipPath));
  zip.directory(dir, false);
  await zip.finalize();

  res.json({ download: "/site.zip" });
});

app.listen(3000, () =>
  console.log("✅ Running on http://localhost:3000")
);
