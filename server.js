import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json({ limit: "20mb" }));
app.use(express.static(path.join(__dirname, "public")));

// HOME
app.get("/", (_, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// GENERATE PREVIEW
app.post("/preview", async (req, res) => {
  const { prompt } = req.body;

  // 🔥 later replace this with OpenRouter API output
  const html = generateLongLandingPage(prompt);
  res.json({ html });
});

// EXPORT
app.post("/export", (req, res) => {
  const { html } = req.body;
  const filePath = path.join(__dirname, "website.html");

  fs.writeFileSync(filePath, html, "utf-8");
  res.download(filePath, "website.html", () => fs.unlinkSync(filePath));
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});

// =======================
// LONG SEO LANDING PAGE
// =======================
function generateLongLandingPage(prompt) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Generated Website</title>
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<style>
body { margin:0; font-family:Inter,Arial; background:#020617; color:#fff; }
nav {
  position:fixed; top:0; width:100%;
  background:rgba(2,6,23,0.85);
  padding:16px 40px; display:flex; gap:20px;
}
nav a { color:#38bdf8; text-decoration:none; font-weight:600; }
section { padding:120px 40px; max-width:1100px; margin:auto; }
.hero {
  min-height:100vh;
  background:url('https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1600&q=80') center/cover;
  display:flex; align-items:center;
}
.hero h1 { font-size:56px; max-width:700px; }
.features, .pricing, .cta { background:#020617; }
.grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(260px,1fr)); gap:24px; }
.card { background:#020617; border:1px solid #1e293b; padding:24px; border-radius:14px; }
.price { font-size:42px; color:#22c55e; }
.cta { text-align:center; }
.cta button { font-size:20px; padding:16px 40px; background:#22c55e; border:none; border-radius:10px; }
footer { padding:60px; text-align:center; color:#94a3b8; }
</style>
</head>

<body>

<nav>
  <a href="#hero">Home</a>
  <a href="#features">Features</a>
  <a href="#pricing">Pricing</a>
  <a href="#cta">Get Started</a>
</nav>

<section id="hero" class="hero">
  <div>
    <h1>${prompt}</h1>
    <p>AI-generated, SEO-optimized, modern landing page.</p>
  </div>
</section>

<section id="features" class="features">
  <h2>Features</h2>
  <div class="grid">
    <div class="card">⚡ Fast Performance</div>
    <div class="card">🎨 Modern Design</div>
    <div class="card">🔍 SEO Optimized</div>
    <div class="card">📱 Mobile Friendly</div>
  </div>
</section>

<section id="pricing" class="pricing">
  <h2>Pricing</h2>
  <div class="grid">
    <div class="card"><div class="price">$9</div>Starter</div>
    <div class="card"><div class="price">$29</div>Pro</div>
    <div class="card"><div class="price">$99</div>Enterprise</div>
  </div>
</section>

<section id="cta" class="cta">
  <h2>Start Building Today</h2>
  <button>Get Started</button>
</section>

<footer>
  © 2026 AI Website Builder. Generated with AI.
</footer>

</body>
</html>
`;
}
