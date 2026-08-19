const express = require("express");
const { getPool } = require("../db");
const { requireAdmin } = require("../middleware/auth");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query("SELECT * FROM games ORDER BY sort_order ASC, id ASC");
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Gagal mengambil data game." });
  }
});

router.post("/", requireAdmin, async (req, res) => {
  const { title, cover } = req.body || {};
  if (!title || !title.trim()) {
    return res.status(400).json({ error: "Nama game wajib diisi." });
  }
  try {
    const pool = getPool();
    const [result] = await pool.query(
      "INSERT INTO games (title, cover) VALUES (?, ?)",
      [title.trim(), cover || null]
    );
    const [rows] = await pool.query("SELECT * FROM games WHERE id = ?", [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Gagal menambah game." });
  }
});

router.put("/:id", requireAdmin, async (req, res) => {
  const { title, cover } = req.body || {};
  if (!title || !title.trim()) {
    return res.status(400).json({ error: "Nama game wajib diisi." });
  }
  try {
    const pool = getPool();
    await pool.query("UPDATE games SET title = ?, cover = ? WHERE id = ?", [
      title.trim(),
      cover || null,
      req.params.id,
    ]);
    const [rows] = await pool.query("SELECT * FROM games WHERE id = ?", [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: "Game tidak ditemukan." });
    res.json(rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Gagal mengubah game." });
  }
});

router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const pool = getPool();
    await pool.query("DELETE FROM games WHERE id = ?", [req.params.id]);
    res.status(204).end();
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Gagal menghapus game." });
  }
});

module.exports = router;
