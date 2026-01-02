import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 3000;

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json({ limit: "20mb" }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// GENERATE WEBSITE
app.post("/generate", (req, res) => {
  const { prompt } = req.body;
  const html = generateWebsite(prompt);
  res.json({ html });
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});

// -------------------------
// PURE JS FUNCTION (NO HTML OUTSIDE STRINGS)
// -------------------------
function generateWebsite(prompt = "AI Generated Website") {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${prompt}</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
body { margin:0; font-family:Arial; background:#0f172a; color:white; }
nav { position:fixed; top:0; width:100%; background:#020617; padding:16px; }
nav a { color:#38bdf8; margin-right:16px; text-decoration:none; }
section { padding:120px 40px; max-width:1100px; margin:auto; }
.hero { min-height:100vh; background:#020617; }
</style>
</head>

<body>

<nav>
  <a href="#home">Home</a>
  <a href="#about">About</a>
  <a href="#services">Services</a>
  <a href="#contact">Contact</a>
</nav>

<section id="home" class="hero">
  <h1>${prompt}</h1>
  <p>Long, crawlable, AI-generated website.</p>
</section>

<section id="about">
  <h2>About</h2>
  <p>This is a fully generated universal website.</p>
</section>

<section id="services">
  <h2>Services</h2>
  <p>Service One, Service Two, Service Three</p>
</section>

<section id="contact">
  <h2>Contact</h2>
  <p>Email: hello@example.com</p>
</section>

</body>
</html>
`;
}
