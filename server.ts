import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";

const db = new Database(":memory:");

// Initialize database with some mock data
db.exec(`
  CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT,
    email TEXT,
    minkasu_id TEXT,
    balance REAL
  );

  INSERT INTO users (username, email, minkasu_id, balance) VALUES 
  ('alice_dev', 'alice@example.com', 'MK_99281', 1250.50),
  ('bob_secure', 'bob@example.com', 'MK_11203', 450.00),
  ('charlie_admin', 'admin@minkasu.internal', 'MK_00001', 99999.99);
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- VULNERABLE ENDPOINT ---
  // This endpoint is intentionally vulnerable to SQL injection
  app.get("/api/vulnerable/user", (req, res) => {
    const userId = req.query.id;
    try {
      // DANGEROUS: String concatenation
      const query = `SELECT * FROM users WHERE id = ${userId}`;
      const user = db.prepare(query).get();
      res.json({ user, query, status: "success" });
    } catch (error: any) {
      res.status(500).json({ error: error.message, query: `SELECT * FROM users WHERE id = ${userId}`, status: "error" });
    }
  });

  // --- SECURE ENDPOINT ---
  // This endpoint uses parameterized queries to prevent SQL injection
  app.get("/api/secure/user", (req, res) => {
    const userId = req.query.id;
    try {
      // SAFE: Parameterized query
      const stmt = db.prepare("SELECT * FROM users WHERE id = ?");
      const user = stmt.get(userId);
      res.json({ user, query: "SELECT * FROM users WHERE id = ?", status: "success" });
    } catch (error: any) {
      res.status(500).json({ error: error.message, query: "SELECT * FROM users WHERE id = ?", status: "error" });
    }
  });

  // API for listing all users (for demo purposes)
  app.get("/api/users", (req, res) => {
    const users = db.prepare("SELECT id, username, minkasu_id FROM users").all();
    res.json(users);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(process.cwd(), "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(process.cwd(), "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
