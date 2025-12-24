import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 3000;

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// ==========================
// ROOT ROUTE (FIXES NOT FOUND)
// ==========================
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ==========================
// LIVE PREVIEW (iframe srcdoc)
// ==========================
app.post("/preview", (req, res) => {
  const { html } = req.body;

  if (!html) {
    return res.status(400).json({ error: "No HTML provided" });
  }

  res.json({ html });
});

// ==========================
// EXPORT / DOWNLOAD HTML
// ==========================
app.post("/export", (req, res) => {
  const { html } = req.body;

  if (!html) {
    return res.status(400).json({ error: "No HTML provided" });
  }

  const filePath = path.join(__dirname, "export.html");
  fs.writeFileSync(filePath, html, "utf-8");

  res.download(filePath, "website.html", () => {
    fs.unlinkSync(filePath);
  });
});

// ==========================
// MULTI-PAGE SUPPORT (SAFE)
// ==========================
app.get("/:page", (req, res) => {
  const page = req.params.page;

  const allowedPages = [
    "about",
    "services",
    "contact",
    "gallery",
    "blog",
  ];

  if (!allowedPages.includes(page)) {
    return res.status(404).send("Page not found");
  }

  const pagePath = path.join(__dirname, "public", `${page}.html`);

  if (!fs.existsSync(pagePath)) {
    return res.status(404).send("Page file missing");
  }

  res.sendFile(pagePath);
});

// ==========================
// START SERVER
// ==========================
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
