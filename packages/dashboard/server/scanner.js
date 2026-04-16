import fs from "fs";
import path from "path";
import {
  parseFrontmatter,
  parseTodoFile,
  parseInboxFile,
  parseOrganizationInfo,
  parseDepartmentInfo,
  getStatusFromFrontmatter,
} from "./parser.js";

const KNOWN_DEPARTMENTS = {
  secretary: "秘書室",
  pm: "PM",
  research: "リサーチ",
  marketing: "マーケティング",
  engineering: "開発",
  finance: "経理",
  sales: "営業",
  creative: "クリエイティブ",
  hr: "人事",
};

export function scan(companyDir) {
  const result = {
    organization: getOrganizationInfo(companyDir),
    departments: getDepartments(companyDir),
    todos: getTodos(companyDir),
    inbox: getInbox(companyDir),
    departmentStats: getDepartmentStats(companyDir),
    recentActivity: getRecentActivity(companyDir),
    insights: getInsights(companyDir),
  };
  return result;
}

function getInsights(companyDir) {
  return {
    heatmap: getActivityHeatmap(companyDir, 14),
    todoTrend: getTodoTrend(companyDir, 7),
    inboxPreview: getInboxPreview(companyDir, 5),
  };
}

function getActivityHeatmap(companyDir, days) {
  const buckets = {};
  const today = new Date();
  for (let i = 0; i < days; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    buckets[formatDate(d)] = 0;
  }

  const files = [];
  collectFiles(companyDir, companyDir, files);
  for (const f of files) {
    const day = formatDate(new Date(f.modified));
    if (day in buckets) buckets[day] += 1;
  }

  return Object.entries(buckets)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => (a.date < b.date ? -1 : 1));
}

function getTodoTrend(companyDir, days) {
  const todosDir = path.join(companyDir, "secretary", "todos");
  const trend = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const date = formatDate(d);
    const file = path.join(todosDir, `${date}.md`);

    let complete = 0;
    let incomplete = 0;
    if (fs.existsSync(file)) {
      try {
        const content = fs.readFileSync(file, "utf-8");
        const parsed = parseTodoFile(content);
        complete = parsed.stats?.complete || 0;
        incomplete = parsed.stats?.incomplete || 0;
      } catch { /* empty */ }
    }

    trend.push({ date, complete, incomplete, total: complete + incomplete });
  }

  return trend;
}

function getInboxPreview(companyDir, limit) {
  const inboxDir = path.join(companyDir, "secretary", "inbox");
  if (!fs.existsSync(inboxDir)) return [];

  let files = [];
  try {
    files = fs.readdirSync(inboxDir)
      .filter((f) => f.endsWith(".md"))
      .sort()
      .reverse()
      .slice(0, 3);
  } catch { return []; }

  const entries = [];
  for (const file of files) {
    try {
      const date = file.replace(".md", "");
      const content = fs.readFileSync(path.join(inboxDir, file), "utf-8");
      const parsed = parseInboxFile(content);
      for (const entry of parsed.entries) {
        entries.push({ date, ...entry });
        if (entries.length >= limit) return entries;
      }
    } catch { /* empty */ }
  }
  return entries;
}

function getOrganizationInfo(companyDir) {
  const claudeMd = path.join(companyDir, "CLAUDE.md");
  if (!fs.existsSync(claudeMd)) return { business: "", goals: "", createdDate: "" };
  const content = fs.readFileSync(claudeMd, "utf-8");
  return parseOrganizationInfo(content);
}

function getDepartments(companyDir) {
  const departments = [];
  let entries;
  try {
    entries = fs.readdirSync(companyDir, { withFileTypes: true });
  } catch {
    return departments;
  }

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (entry.name.startsWith(".")) continue;

    const deptDir = path.join(companyDir, entry.name);
    const claudeMd = path.join(deptDir, "CLAUDE.md");

    let name = KNOWN_DEPARTMENTS[entry.name] || entry.name;
    let role = "";

    if (fs.existsSync(claudeMd)) {
      const info = parseDepartmentInfo(fs.readFileSync(claudeMd, "utf-8"));
      if (info.name) name = info.name;
      if (info.role) role = info.role;
    }

    const fileCount = countFiles(deptDir);
    const subfolders = getSubfolders(deptDir);

    departments.push({
      id: entry.name,
      name,
      role,
      fileCount,
      subfolders,
    });
  }

  return departments;
}

function getTodos(companyDir) {
  const todosDir = path.join(companyDir, "secretary", "todos");
  if (!fs.existsSync(todosDir)) return { today: null, recent: [] };

  const today = formatDate(new Date());
  const todayFile = path.join(todosDir, `${today}.md`);

  let todayData = null;
  if (fs.existsSync(todayFile)) {
    const content = fs.readFileSync(todayFile, "utf-8");
    todayData = { date: today, ...parseTodoFile(content) };
  }

  const recent = [];
  try {
    const files = fs.readdirSync(todosDir).filter((f) => f.endsWith(".md")).sort().reverse().slice(0, 7);
    for (const file of files) {
      const date = file.replace(".md", "");
      if (date === today) continue;
      const content = fs.readFileSync(path.join(todosDir, file), "utf-8");
      const parsed = parseTodoFile(content);
      recent.push({ date, ...parsed });
    }
  } catch { /* empty */ }

  return { today: todayData, recent };
}

function getInbox(companyDir) {
  const inboxDir = path.join(companyDir, "secretary", "inbox");
  if (!fs.existsSync(inboxDir)) return { today: null, totalEntries: 0 };

  const today = formatDate(new Date());
  const todayFile = path.join(inboxDir, `${today}.md`);

  let todayData = null;
  if (fs.existsSync(todayFile)) {
    const content = fs.readFileSync(todayFile, "utf-8");
    todayData = { date: today, ...parseInboxFile(content) };
  }

  let totalEntries = 0;
  try {
    const files = fs.readdirSync(inboxDir).filter((f) => f.endsWith(".md"));
    for (const file of files) {
      const content = fs.readFileSync(path.join(inboxDir, file), "utf-8");
      const parsed = parseInboxFile(content);
      totalEntries += parsed.entries.length;
    }
  } catch { /* empty */ }

  return { today: todayData, totalEntries };
}

function getDepartmentStats(companyDir) {
  const stats = {};
  let entries;
  try {
    entries = fs.readdirSync(companyDir, { withFileTypes: true });
  } catch {
    return stats;
  }

  for (const entry of entries) {
    if (!entry.isDirectory() || entry.name === "secretary" || entry.name.startsWith(".")) continue;

    const deptDir = path.join(companyDir, entry.name);
    const statusCounts = {};

    collectStatuses(deptDir, statusCounts);
    if (Object.keys(statusCounts).length > 0) {
      stats[entry.name] = statusCounts;
    }
  }

  return stats;
}

function collectStatuses(dir, statusCounts) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      collectStatuses(fullPath, statusCounts);
    } else if (entry.name.endsWith(".md") && entry.name !== "CLAUDE.md" && !entry.name.startsWith("_")) {
      try {
        const content = fs.readFileSync(fullPath, "utf-8");
        const status = getStatusFromFrontmatter(content);
        if (status) {
          statusCounts[status] = (statusCounts[status] || 0) + 1;
        }
      } catch { /* empty */ }
    }
  }
}

function getRecentActivity(companyDir) {
  const activities = [];
  collectFiles(companyDir, companyDir, activities);
  activities.sort((a, b) => b.modified - a.modified);
  return activities.slice(0, 20);
}

function collectFiles(baseDir, dir, activities) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!entry.name.startsWith(".")) {
        collectFiles(baseDir, fullPath, activities);
      }
    } else if (entry.name.endsWith(".md") && entry.name !== "CLAUDE.md" && !entry.name.startsWith("_")) {
      try {
        const stat = fs.statSync(fullPath);
        const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, "/");
        activities.push({
          file: relativePath,
          modified: stat.mtimeMs,
          modifiedAt: stat.mtime.toISOString(),
          department: relativePath.split("/")[0],
        });
      } catch { /* empty */ }
    }
  }
}

function countFiles(dir) {
  let count = 0;
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        count += countFiles(path.join(dir, entry.name));
      } else if (entry.name.endsWith(".md") && entry.name !== "CLAUDE.md" && !entry.name.startsWith("_")) {
        count++;
      }
    }
  } catch { /* empty */ }
  return count;
}

function getSubfolders(dir) {
  try {
    return fs
      .readdirSync(dir, { withFileTypes: true })
      .filter((e) => e.isDirectory())
      .map((e) => e.name);
  } catch {
    return [];
  }
}

export function scanTree(companyDir) {
  return buildTreeNode(companyDir, companyDir);
}

function buildTreeNode(baseDir, dir) {
  const nodes = [];
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return nodes;
  }

  // Folders first, then files
  const folders = entries.filter((e) => e.isDirectory() && !e.name.startsWith("."));
  const files = entries.filter(
    (e) => !e.isDirectory() && e.name.endsWith(".md") && e.name !== "CLAUDE.md" && !e.name.startsWith("_")
  );

  for (const folder of folders) {
    const fullPath = path.join(dir, folder.name);
    const children = buildTreeNode(baseDir, fullPath);
    const fileCount = countFiles(fullPath);
    nodes.push({
      name: folder.name,
      displayName: KNOWN_DEPARTMENTS[folder.name] || folder.name,
      type: "folder",
      fileCount,
      children,
    });
  }

  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    let status = null;
    try {
      const content = fs.readFileSync(fullPath, "utf-8");
      status = getStatusFromFrontmatter(content);
    } catch { /* empty */ }

    nodes.push({
      name: file.name,
      type: "file",
      status,
    });
  }

  return nodes;
}

export function scanDepartment(companyDir, deptId) {
  const deptDir = path.join(companyDir, deptId);
  if (!fs.existsSync(deptDir)) return null;

  const claudeMd = path.join(deptDir, "CLAUDE.md");
  let name = KNOWN_DEPARTMENTS[deptId] || deptId;
  let role = "";
  if (fs.existsSync(claudeMd)) {
    const info = parseDepartmentInfo(fs.readFileSync(claudeMd, "utf-8"));
    if (info.name) name = info.name;
    if (info.role) role = info.role;
  }

  const files = [];
  collectDepartmentFiles(deptDir, deptDir, files);
  files.sort((a, b) => b.modified - a.modified);

  return { id: deptId, name, role, files };
}

function collectDepartmentFiles(baseDir, dir, files) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch { return; }

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      collectDepartmentFiles(baseDir, fullPath, files);
    } else if (entry.name.endsWith(".md") && entry.name !== "CLAUDE.md" && !entry.name.startsWith("_")) {
      try {
        const content = fs.readFileSync(fullPath, "utf-8");
        const { data, body } = parseFrontmatter(content);
        const stat = fs.statSync(fullPath);
        const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, "/");
        files.push({
          path: relativePath,
          title: extractTitle(body) || entry.name.replace(".md", ""),
          status: data.status || null,
          type: data.type || null,
          date: data.date || data.created || null,
          modified: stat.mtimeMs,
          modifiedAt: stat.mtime.toISOString(),
          preview: body.split("\n").filter(l => l.trim() && !l.startsWith("#")).slice(0, 3).join(" ").substring(0, 150),
        });
      } catch { /* empty */ }
    }
  }
}

function extractTitle(body) {
  for (const line of body.split("\n")) {
    const match = line.match(/^#\s+(.+)/);
    if (match) return match[1].trim();
  }
  return null;
}

function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
