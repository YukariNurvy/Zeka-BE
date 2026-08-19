const express = require("express");
const { getPool } = require("../db");
const { requireAdmin } = require("../middleware/auth");

const router = express.Router();

function mapRow(row) {
  return {
    id: row.id,
    title: row.title,
    date: row.event_date
      ? new Date(row.event_date).toISOString().slice(0, 10)
      : null,
    img: row.img,
    desc: row.description,
    link: row.link,
  };
}

router.get("/", async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query("SELECT * FROM events ORDER BY event_date ASC, id ASC");
    res.json(rows.map(mapRow));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Gagal mengambil data event." });
  }
});

router.post("/", requireAdmin, async (req, res) => {
  const { title, date, img, desc, link } = req.body || {};
  if (!title || !title.trim()) {
    return res.status(400).json({ error: "Judul event wajib diisi." });
  }
  try {
    const pool = getPool();
    const [result] = await pool.query(
      "INSERT INTO events (title, event_date, img, description, link) VALUES (?, ?, ?, ?, ?)",
      [title.trim(), date || null, img || null, desc || null, link || null]
    );
    const [rows] = await pool.query("SELECT * FROM events WHERE id = ?", [result.insertId]);
    res.status(201).json(mapRow(rows[0]));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Gagal menambah event." });
  }
});

router.put("/:id", requireAdmin, async (req, res) => {
  const { title, date, img, desc, link } = req.body || {};
  if (!title || !title.trim()) {
    return res.status(400).json({ error: "Judul event wajib diisi." });
  }
  try {
    const pool = getPool();
    await pool.query(
      "UPDATE events SET title = ?, event_date = ?, img = ?, description = ?, link = ? WHERE id = ?",
      [title.trim(), date || null, img || null, desc || null, link || null, req.params.id]
    );
    const [rows] = await pool.query("SELECT * FROM events WHERE id = ?", [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: "Event tidak ditemukan." });
    res.json(mapRow(rows[0]));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Gagal mengubah event." });
  }
});

router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const pool = getPool();
    await pool.query("DELETE FROM events WHERE id = ?", [req.params.id]);
    res.status(204).end();
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Gagal menghapus event." });
  }
});

module.exports = router;
