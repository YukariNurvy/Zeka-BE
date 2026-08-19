require("dotenv").config();
const express = require('express');
const cors = require('cors');
const path = require('path'); 

const app = express();

// 1. Setup CORS dan JSON (Cukup satu kali di sini)
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "*")
  .split(",")
  .map((s) => s.trim());

app.use(cors({
  origin: allowedOrigins.includes("*") ? true : allowedOrigins,
}));
app.use(express.json());

// 2. Import Routes
const authRoutes = require("./routes/auth");
const gamesRoutes = require("./routes/games");
const membersRoutes = require("./routes/members");
const eventsRoutes = require("./routes/events");

// 3. Setup Frontend Static (Opsional, tapi kita biarkan saja)
const frontendDir = path.join(__dirname, "..", "..");
app.use(express.static(frontendDir));

app.get("/", (req, res) => {
  res.sendFile(path.join(frontendDir, "Zeka.html"));
});

// 4. Setup API Routes
app.get("/health", (req, res) => res.json({ status: "ok" }));
app.use("/api/auth", authRoutes);
app.use("/api/games", gamesRoutes);
app.use("/api/members", membersRoutes);
app.use("/api/events", eventsRoutes);

// 5. Handling 404 & Error
app.use((req, res) => {
  res.status(404).json({ error: "Route tidak ditemukan." });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Terjadi kesalahan pada server." });
});

// 6. Export untuk Vercel Serverless
module.exports = app;