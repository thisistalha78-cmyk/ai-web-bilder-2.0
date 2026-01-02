import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 3000;

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json({ limit: "10mb" }));
app.use(express.static(path.join(__dirname, "public")));

// Serve UI
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

// Generate website
app.post("/generate", (req, res) => {
  const { prompt } = req.body;
  const html = generateWebsite(prompt || "AI Generated Website");
  res.json({ html });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});

// ===============================
// WEBSITE GENERATOR (SAFE)
// ===============================
function generateWebsite(title) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${title}</title>
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<style>
body { margin:0; font-family:Arial, sans-serif; background:#0f172a; color:#fff; }
nav {
  position:fixed;
  top:0;
  width:100%;
  padding:16px 32px;
  background:#020617;
  z-index:1000;
}
nav a {
  color:#38bdf8;
  margin-right:20px;
  text-decoration:none;
  font-weight:600;
}
section {
  padding:120px 40px;
  max-width:1100px;
  margin:auto;
}
.hero {
  min-height:100vh;
  display:flex;
  align-items:center;
}
.grid {
  display:grid;
  grid-template-columns:repeat(auto-fit, minmax(250px, 1fr));
  gap:24px;
}
.card {
  background:#020617;
  padding:24px;
  border-radius:14px;
  border:1px solid #1e293b;
}
footer {
  padding:80px 20px;
  text-align:center;
  color:#94a3b8;
}
img {
  width:100%;
  border-radius:12px;
}
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
  <div>
    <h1>${title}</h1>
    <p>This is a long, crawlable, AI-generated website suitable for any business, portfolio, blog, or landing page.</p>
  </div>
</section>

<section id="about">
  <h2>About</h2>
  <p>
    This section describes who you are, your mission, your story, and your background.
    It is intentionally long to improve SEO and readability for search engines.
  </p>
</section>

<section id="services">
  <h2>Services</h2>
  <div class="grid">
    <div class="card">Service One description goes here.</div>
    <div class="card">Service Two description goes here.</div>
    <div class="card">Service Three description goes here.</div>
  </div>
</section>

<section id="gallery">
  <h2>Gallery</h2>
  <div class="grid">
    <img src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80">
    <img src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=800&q=80">
    <img src="https://images.unsplash.com/photo-1492724441997-5dc865305da7?auto=format&fit=crop&w=800&q=80">
  </div>
</section>

<section id="contact">
  <h2>Contact</h2>
  <p>Email: hello@example.com</p>
  <p>Phone: +1 234 567 890</p>
</section>

<footer>
  © 2026 AI Website Builder. Generated with AI.
</footer>

</body>
</html>
`;
}

