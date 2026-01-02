import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json({ limit: "20mb" }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (_, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

// 🔥 RESTAURANT WEBSITE GENERATOR (AI SLOT)
app.post("/generate", async (req, res) => {
  const { name, cuisine, city } = req.body;

  const html = generateRestaurantWebsite({
    name,
    cuisine,
    city
  });

  res.json({ html });
});

app.listen(PORT, () => {
  console.log(`✅ AI Restaurant Builder running on ${PORT}`);
});

// ===============================
// TEMPLATE (AI WILL REPLACE THIS)
// ===============================
function generateRestaurantWebsite({ name, cuisine, city }) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${name} | ${cuisine} Restaurant in ${city}</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="description" content="${name} – Authentic ${cuisine} restaurant in ${city}. Dine-in, takeout & delivery available.">

<style>
body{margin:0;font-family:Arial;background:#fff;color:#222}
nav{position:fixed;top:0;width:100%;background:#000;color:#fff;padding:16px}
nav a{color:#fff;margin-right:20px;text-decoration:none}
section{padding:120px 40px;max-width:1100px;margin:auto}
.hero{min-height:100vh;background:#111;color:#fff;display:flex;align-items:center}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:24px}
.card{border:1px solid #ddd;padding:20px;border-radius:12px}
footer{background:#000;color:#aaa;padding:40px;text-align:center}
</style>
</head>

<body>

<nav>
  <a href="#home">Home</a>
  <a href="#about">About</a>
  <a href="#menu">Menu</a>
  <a href="#contact">Contact</a>
</nav>

<section id="home" class="hero">
  <h1>${name}</h1>
  <p>Authentic ${cuisine} cuisine in ${city}</p>
</section>

<section id="about">
  <h2>About ${name}</h2>
  <p>${name} proudly serves authentic ${cuisine} dishes made with fresh ingredients in ${city}.</p>
</section>

<section id="menu">
  <h2>Popular Dishes</h2>
  <div class="grid">
    <div class="card">Signature Dish One</div>
    <div class="card">Signature Dish Two</div>
    <div class="card">Signature Dish Three</div>
  </div>
</section>

<section id="contact">
  <h2>Visit Us</h2>
  <p>${city}</p>
</section>

<footer>
  © ${new Date().getFullYear()} ${name}
</footer>

</body>
</html>
`;
}

</html>
`;
}

