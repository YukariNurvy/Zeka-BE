const express = require("express");
const { getPool } = require("../db");
const { requireAdmin } = require("../middleware/auth");

const router = express.Router();

function mapRow(row) {
  let socials = {};
  if (row.socials) {
    socials = typeof row.socials === "string" ? JSON.parse(row.socials) : row.socials;
  }
  return { ...row, socials };
}

router.get("/", async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query("SELECT * FROM members ORDER BY sort_order ASC, id ASC");
    res.json(rows.map(mapRow));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Gagal mengambil data member." });
  }
});

router.post("/", requireAdmin, async (req, res) => {
  const { name, description, img, socials } = req.body || {};
  if (!name || !name.trim()) {
    return res.status(400).json({ error: "Nama member wajib diisi." });
  }
  try {
    const pool = getPool();
    const [result] = await pool.query(
      "INSERT INTO members (name, description, img, socials) VALUES (?, ?, ?, ?)",
      [name.trim(), description || null, img || null, JSON.stringify(socials || {})]
    );
    const [rows] = await pool.query("SELECT * FROM members WHERE id = ?", [result.insertId]);
    res.status(201).json(mapRow(rows[0]));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Gagal menambah member." });
  }
});

router.put("/:id", requireAdmin, async (req, res) => {
  const { name, description, img, socials } = req.body || {};
  if (!name || !name.trim()) {
    return res.status(400).json({ error: "Nama member wajib diisi." });
  }
  try {
    const pool = getPool();
    await pool.query(
      "UPDATE members SET name = ?, description = ?, img = ?, socials = ? WHERE id = ?",
      [name.trim(), description || null, img || null, JSON.stringify(socials || {}), req.params.id]
    );
    const [rows] = await pool.query("SELECT * FROM members WHERE id = ?", [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: "Member tidak ditemukan." });
    res.json(mapRow(rows[0]));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Gagal mengubah member." });
  }
});

router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const pool = getPool();
    await pool.query("DELETE FROM members WHERE id = ?", [req.params.id]);
    res.status(204).end();
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Gagal menghapus member." });
  }
});

module.exports = router;
