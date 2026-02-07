const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const dbPath = path.join(__dirname, "ordenes.db");
const db = new sqlite3.Database(dbPath);

function ensureColumn(table, column, type) {
  db.all(`PRAGMA table_info(${table})`, [], (err, rows) => {
    if (err) return console.error("PRAGMA error:", err);

    const exists = rows.some((r) => r.name === column);
    if (!exists) {
      db.run(`ALTER TABLE ${table} ADD COLUMN ${column} ${type}`, [], (err2) => {
        if (err2) return console.error("ALTER TABLE error:", err2);
        console.log(`✅ Added column ${table}.${column}`);
      });
    }
  });
}

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS ordenes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      numero TEXT NOT NULL,
      tipo TEXT NOT NULL,
      abonadoNombre TEXT NOT NULL,
      telefono TEXT,
      planMbps INTEGER,
      macEquipo TEXT,
      referenciaCasa TEXT,
      descripcion TEXT,
      estado TEXT NOT NULL,
      ubicacionLat REAL,
      ubicacionLng REAL,
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL
    )
  `);

  // Migraciones
  ensureColumn("ordenes", "barrio", "TEXT");
  ensureColumn("ordenes", "tecnico", "TEXT");
});

module.exports = db;
