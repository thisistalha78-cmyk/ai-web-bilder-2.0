import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json({ limit: "20mb" }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (_, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

// 🔥 MAIN GENERATOR
app.post("/generate", async (req, res) => {
  const { prompt } = req.body;

  // Replace this function with OpenRouter AI output
  const html = generateUniversalWebsite(prompt);

  res.json({ html });
});

app.listen(PORT, () => {
  console.log("✅ Server running at http://localhost:3000");
});

// ===============================
// UNIVERSAL LONG WEBSITE TEMPLATE
// ===============================
function generateUniversalWebsite(prompt) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Generated Website</title>
<meta name="viewport" content="width=device-width, initial-scale=1">

<style>
body { margin:0; font-family:Arial; background:#0f172a; color:#fff; }
nav {
  position:fixed;
  top:0;
  width:100%;
  padding:16px 32px;
  background:rgba(2,6,23,.9);
  display:flex;
  gap:20px;
}
nav a { color:#38bdf8; text-decoration:none; font-weight:600; }
section { padding:120px 40px; max-width:1100px; margin:auto; }
.hero {
  min-height:100vh;
  background:url('https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80') center/cover;
}
.grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(260px,1fr)); gap:24px; }
.card { background:#020617; padding:24px; border-radius:14px; }
footer { padding:80px; text-align:center; color:#94a3b8; }
</style>
</head>

<body>

<nav>
  <a href="#home">Home</a>
  <a href="#about">About</a>
  <a href="#services">Services</a>
  <a href="#gallery">Gallery</a>
  <a href="#contact">Contact</a>
</nav>

<section id="home" class="hero">
  <h1>${prompt}</h1>
  <p>AI-generated website with long, crawlable content.</p>
</section>

<section id="about">
  <h2>About</h2>
  <p>This section explains who you are, your mission, background, and story.</p>
</section>

<section id="services">
  <h2>Services</h2>
  <div class="grid">
    <div class="card">Service One</div>
    <div class="card">Service Two</div>
    <div class="card">Service Three</div>
  </div>
</section>

<section id="gallery">
  <h2>Gallery</h2>
  <div class="grid">
    <img src="https://images.unsplash.com/photo-1492724441997-5dc865305da7?auto=format&fit=crop&w=800&q=80" width="100%">
    <img src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=800&q=80" width="100%">
    <img src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80" width="100%">
  </div>
</section>

<section id="contact">
  <h2>Contact</h2>
  <p>Email: hello@example.com</p>
</section>

<footer>
  © 2026 AI Website Builder
</footer>

</body>
</html>
`;
}


</body>
</html>
`;
}
