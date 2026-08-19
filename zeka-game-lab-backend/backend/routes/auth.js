const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { getPool } = require("../db");
const { requireAdmin } = require("../middleware/auth");

const router = express.Router();

router.post("/login", async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: "Username dan password wajib diisi." });
  }

  try {
    const pool = getPool();
    const [rows] = await pool.query("SELECT * FROM admins WHERE username = ? LIMIT 1", [username]);
    const admin = rows[0];

    if (!admin) {
      return res.status(401).json({ error: "Username atau password salah." });
    }

    const match = await bcrypt.compare(password, admin.password_hash);
    if (!match) {
      return res.status(401).json({ error: "Username atau password salah." });
    }

    const token = jwt.sign(
      { sub: admin.id, username: admin.username },
      process.env.JWT_SECRET,
      { expiresIn: "12h" }
    );

    res.json({ token, username: admin.username, expiresIn: "12h" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Terjadi kesalahan pada server." });
  }
});

// Dipakai frontend buat cek apakah token yang tersimpan masih valid
router.get("/verify", requireAdmin, (req, res) => {
  res.json({ ok: true, username: req.admin.username });
});

module.exports = router;
