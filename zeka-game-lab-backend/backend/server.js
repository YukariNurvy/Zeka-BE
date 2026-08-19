require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/auth");
const gamesRoutes = require("./routes/games");
const membersRoutes = require("./routes/members");
const eventsRoutes = require("./routes/events");

const app = express();

// Set ALLOWED_ORIGINS ke domain frontend kamu, pisahkan pakai koma
// kalau lebih dari satu. Default "*" biar gampang pas awal setup.
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "*")
  .split(",")
  .map((s) => s.trim());

app.use(
  cors({
    origin: allowedOrigins.includes("*") ? true : allowedOrigins,
  })
);
app.use(express.json());

// Folder tempat Zeka.html tinggal (root project). Kita serve statis dari sini
// supaya semua asset relatif di Zeka.html (mis. foto/logo zeka.jpg) benar-benar
// bisa diakses browser, bukan cuma file HTML-nya saja.
const frontendDir = path.join(__dirname, "..", "..");
app.use(express.static(frontendDir));

app.get("/", (req, res) => {
  res.sendFile(path.join(frontendDir, "Zeka.html"));
});


app.get("/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/games", gamesRoutes);
app.use("/api/members", membersRoutes);
app.use("/api/events", eventsRoutes);

app.use((req, res) => {
  res.status(404).json({ error: "Route tidak ditemukan." });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Terjadi kesalahan pada server." });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Zeka Game Lab API jalan di port ${PORT}`);
});
