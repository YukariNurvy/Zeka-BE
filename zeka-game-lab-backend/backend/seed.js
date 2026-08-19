require("dotenv").config();
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const { getPool } = require("./db");

async function run() {
  const pool = getPool();

  console.log("Membuat tabel (kalau belum ada)...");
  const schema = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");
  const statements = schema
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean);
  for (const stmt of statements) {
    await pool.query(stmt);
  }
  console.log("Tabel siap.");

  const adminUsername = process.env.ADMIN_USERNAME || "admin";
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    console.warn(
      'ADMIN_PASSWORD tidak diset di environment variables — akun admin default TIDAK dibuat. Set ADMIN_USERNAME & ADMIN_PASSWORD lalu jalankan "npm run seed" lagi.'
    );
  } else {
    const [rows] = await pool.query("SELECT id FROM admins WHERE username = ?", [adminUsername]);
    if (rows.length === 0) {
      const hash = await bcrypt.hash(adminPassword, 10);
      await pool.query("INSERT INTO admins (username, password_hash) VALUES (?, ?)", [
        adminUsername,
        hash,
      ]);
      console.log(`Admin "${adminUsername}" berhasil dibuat.`);
    } else {
      console.log(`Admin "${adminUsername}" sudah ada, dilewati.`);
    }
  }

  const [gameCount] = await pool.query("SELECT COUNT(*) as c FROM games");
  if (gameCount[0].c === 0) {
    const defaultGames = [
      ["Apex Legends", "https://placehold.co/400x600/191821/ff0055?text=APEX+LEGENDS"],
      ["Valorant", "https://placehold.co/400x600/191821/ff0055?text=VALORANT"],
      ["Roblox", "https://placehold.co/400x600/191821/ff0055?text=ROBLOX"],
      ["Counter Strike 2", "https://placehold.co/400x600/191821/ff0055?text=CS2"],
      ["Mobile Legends", "https://placehold.co/400x600/191821/ff0055?text=MLBB"],
      ["Dota 2", "https://placehold.co/400x600/191821/ff0055?text=DOTA+2"],
      ["Minecraft", "https://placehold.co/400x600/191821/ff0055?text=MINECRAFT"],
    ];
    for (const [title, cover] of defaultGames) {
      await pool.query("INSERT INTO games (title, cover) VALUES (?, ?)", [title, cover]);
    }
    console.log("Data game default ditambahkan.");
  }

  const [memberCount] = await pool.query("SELECT COUNT(*) as c FROM members");
  if (memberCount[0].c === 0) {
    await pool.query(
      "INSERT INTO members (name, description, img, socials) VALUES (?, ?, ?, ?)",
      ["ZEIDGEST", "Founder of Zeka Game Lab", "", JSON.stringify({ discord: "#" })]
    );
    console.log("Data member default ditambahkan.");
  }

  const [eventCount] = await pool.query("SELECT COUNT(*) as c FROM events");
  if (eventCount[0].c === 0) {
    await pool.query(
      "INSERT INTO events (title, event_date, img, description, link) VALUES (?, ?, ?, ?, ?)",
      [
        "Mabar Night: Valorant Custom",
        "2026-09-05",
        "https://placehold.co/600x300/141319/ff0055?text=MABAR+NIGHT",
        "Custom room bareng member Zeka, giveaway nitro buat MVP tiap match.",
        "https://discord.gg/gTMZVbvQ9w",
      ]
    );
    console.log("Data event default ditambahkan.");
  }

  console.log("Selesai.");
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
