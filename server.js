import express from "express";
import path from "path";
import fetch from "node-fetch";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json({ limit: "20mb" }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// 🔥 AI GENERATE ROUTE
app.post("/generate", async (req, res) => {
  const { name, cuisine, city } = req.body;

  try {
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "openai/gpt-4o-mini",
          messages: [
            {
              role: "system",
              content:
                "You generate ONLY valid HTML. No markdown. No explanation."
            },
            {
              role: "user",
              content: `
Create a long, single-page restaurant website HTML.

Restaurant name: ${name}
Cuisine: ${cuisine}
Location: ${city}

Include:
- Hero section
- About section
- Menu section
- Gallery
- Reviews
- Contact
- Anchor navigation (#)

Use inline CSS.
`
            }
          ]
        })
      }
    );

    const data = await response.json();
    const html = data.choices[0].message.content;

    res.json({ html });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "AI generation failed" });
  }
});

app.listen(PORT, () => {
  console.log("✅ Server running on port " + PORT);
});
