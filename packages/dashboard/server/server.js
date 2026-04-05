import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { scan, scanDepartment, scanTree } from "./scanner.js";
import { createWatcher } from "./watcher.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function searchFiles(baseDir, dir, query, results) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch { return; }

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && !entry.name.startsWith(".")) {
      searchFiles(baseDir, fullPath, query, results);
    } else if (entry.name.endsWith(".md") && entry.name !== "CLAUDE.md" && !entry.name.startsWith("_")) {
      try {
        const content = fs.readFileSync(fullPath, "utf-8");
        const lower = content.toLowerCase();
        const nameMatch = entry.name.toLowerCase().includes(query);
        const contentMatch = lower.includes(query);

        if (nameMatch || contentMatch) {
          const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, "/");
          const dept = relativePath.split("/")[0];

          // Extract matching lines
          const matches = [];
          const lines = content.split("\n");
          for (let i = 0; i < lines.length; i++) {
            if (lines[i].toLowerCase().includes(query)) {
              matches.push({ line: i + 1, text: lines[i].trim().substring(0, 120) });
              if (matches.length >= 3) break;
            }
          }

          // Title from first heading
          let title = entry.name.replace(".md", "");
          for (const line of lines) {
            const m = line.match(/^#\s+(.+)/);
            if (m) { title = m[1].trim(); break; }
          }

          results.push({
            path: relativePath,
            department: dept,
            title,
            matches,
            score: (nameMatch ? 10 : 0) + matches.length,
          });
        }
      } catch { /* empty */ }
    }
  }
}
const distDir = path.join(__dirname, "..", "dist");

export function startServer(companyDir, port) {
  const app = express();
  const sseClients = new Set();

  // Cache dashboard data
  let dashboardData = scan(companyDir);

  // File watcher
  createWatcher(companyDir, () => {
    dashboardData = scan(companyDir);
    for (const res of sseClients) {
      res.write(`event: update\ndata: ${JSON.stringify(dashboardData)}\n\n`);
    }
  });

  // Serve built React app
  if (fs.existsSync(distDir)) {
    app.use(express.static(distDir));
  }

  // API endpoints
  app.get("/api/dashboard", (_req, res) => {
    res.json(dashboardData);
  });

  app.get("/api/file", (req, res) => {
    const filePath = req.query.path;
    if (!filePath) return res.status(400).json({ error: "path required" });

    const safePath = path.normalize(filePath).replace(/\.\./g, "");
    const fullPath = path.join(companyDir, safePath);

    if (!fullPath.startsWith(companyDir)) {
      return res.status(403).json({ error: "Access denied" });
    }

    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ error: "File not found" });
    }

    const content = fs.readFileSync(fullPath, "utf-8");
    res.json({ path: safePath, content });
  });

  app.get("/api/todos", (_req, res) => {
    res.json(dashboardData.todos);
  });

  app.get("/api/inbox", (_req, res) => {
    res.json(dashboardData.inbox);
  });

  app.get("/api/departments", (_req, res) => {
    res.json({
      departments: dashboardData.departments,
      stats: dashboardData.departmentStats,
    });
  });

  app.get("/api/department/:id", (req, res) => {
    const data = scanDepartment(companyDir, req.params.id);
    if (!data) return res.status(404).json({ error: "Department not found" });
    res.json(data);
  });

  app.get("/api/search", (req, res) => {
    const q = (req.query.q || "").toLowerCase().trim();
    if (!q) return res.json([]);

    const results = [];
    searchFiles(companyDir, companyDir, q, results);
    results.sort((a, b) => b.score - a.score);
    res.json(results.slice(0, 30));
  });

  app.get("/api/tree", (_req, res) => {
    res.json(scanTree(companyDir));
  });

  app.get("/api/activity", (_req, res) => {
    res.json(dashboardData.recentActivity);
  });

  // SSE endpoint
  app.get("/api/events", (req, res) => {
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });

    res.write(`event: connected\ndata: {}\n\n`);
    sseClients.add(res);

    req.on("close", () => {
      sseClients.delete(res);
    });
  });

  // SPA fallback
  app.get("*", (_req, res) => {
    const indexPath = path.join(distDir, "index.html");
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).send("Run 'npm run build' first.");
    }
  });

  app.listen(port, () => {
    console.log(`\n  cc-company dashboard`);
    console.log(`  http://localhost:${port}\n`);
    console.log(`  Watching: ${companyDir}\n`);
  });
}
