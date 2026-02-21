import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("flowguard.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS deals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_name TEXT,
    subject TEXT,
    value REAL,
    stage TEXT, -- 'new', 'sent', 'waiting', 'won', 'lost'
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );

  CREATE TABLE IF NOT EXISTS audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    deal_id INTEGER,
    action TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Seed default settings if not exists
const seedSettings = db.prepare("INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)");
seedSettings.run("vips", JSON.stringify(["emet.co.il", "nitzan@client.il"]));
seedSettings.run("rules", JSON.stringify({
  vip_sla_hours: 2,
  urgent_keywords: ["quote", "RFQ", "price", "BOM"],
  manager_email: "manager@emetdorcom.co.il"
}));

async function startServer() {
  const app = express();
  app.use(express.json());
  const PORT = 3000;

  // API Routes
  app.get("/api/deals", (req, res) => {
    const deals = db.prepare("SELECT * FROM deals ORDER BY updated_at DESC").all();
    res.json(deals);
  });

  app.post("/api/deals", (req, res) => {
    const { customer_name, subject, value, stage, notes } = req.body;
    const info = db.prepare(
      "INSERT INTO deals (customer_name, subject, value, stage, notes) VALUES (?, ?, ?, ?, ?)"
    ).run(customer_name, subject, value, stage || 'new', notes);
    
    db.prepare("INSERT INTO audit_log (deal_id, action) VALUES (?, ?)").run(info.lastInsertRowid, "Created deal");
    res.json({ id: info.lastInsertRowid });
  });

  app.put("/api/deals/:id", (req, res) => {
    const { stage, notes, value } = req.body;
    db.prepare(
      "UPDATE deals SET stage = COALESCE(?, stage), notes = COALESCE(?, notes), value = COALESCE(?, value), updated_at = CURRENT_TIMESTAMP WHERE id = ?"
    ).run(stage, notes, value, req.params.id);
    
    db.prepare("INSERT INTO audit_log (deal_id, action) VALUES (?, ?)").run(req.params.id, `Updated stage to ${stage}`);
    res.json({ success: true });
  });

  app.get("/api/settings", (req, res) => {
    const settings = db.prepare("SELECT * FROM settings").all();
    const result = settings.reduce((acc: any, curr: any) => {
      acc[curr.key] = JSON.parse(curr.value);
      return acc;
    }, {});
    res.json(result);
  });

  app.post("/api/settings", (req, res) => {
    const { key, value } = req.body;
    db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)").run(key, JSON.stringify(value));
    res.json({ success: true });
  });

  app.get("/api/audit", (req, res) => {
    const logs = db.prepare("SELECT * FROM audit_log ORDER BY timestamp DESC LIMIT 50").all();
    res.json(logs);
  });

  // Serve manifest.xml explicitly if needed, or let static handle it
  app.get("/manifest.xml", (req, res) => {
    res.sendFile(path.join(__dirname, "manifest.xml"));
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
