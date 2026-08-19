const mysql = require("mysql2/promise");

let pool;

function getPool() {
  if (pool) return pool;

  // Railway's MySQL plugin provides MYSQL_URL (or MYSQL_PUBLIC_URL) as a
  // full connection string. Fall back to individual MYSQLHOST/USER/etc,
  // then to generic DB_* vars for other providers.
  const connectionString = process.env.MYSQL_URL || process.env.MYSQL_PUBLIC_URL;

  if (connectionString) {
    pool = mysql.createPool(connectionString);
  } else {
    pool = mysql.createPool({
      host: process.env.MYSQLHOST || process.env.DB_HOST || "localhost",
      port: Number(process.env.MYSQLPORT || process.env.DB_PORT || 3306),
      user: process.env.MYSQLUSER || process.env.DB_USER || "root",
      password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || "",
      database: process.env.MYSQLDATABASE || process.env.DB_NAME || "zeka_game_lab",
      waitForConnections: true,
      connectionLimit: 10,
    });
  }

  return pool;
}

module.exports = { getPool };
