import matter from "gray-matter";

export function parseFrontmatter(content) {
  try {
    const { data, content: body } = matter(content);
    return { data, body };
  } catch {
    return { data: {}, body: content };
  }
}

export function parseTodoFile(content) {
  const { data, body } = parseFrontmatter(content);
  const sections = {
    topPriority: [],
    normal: [],
    low: [],
    completed: [],
  };

  let currentSection = "normal";
  for (const line of body.split("\n")) {
    const trimmed = line.trim();

    if (/^##\s*最優先/.test(trimmed)) {
      currentSection = "topPriority";
      continue;
    }
    if (/^##\s*通常/.test(trimmed)) {
      currentSection = "normal";
      continue;
    }
    if (/^##\s*余裕があれば/.test(trimmed)) {
      currentSection = "low";
      continue;
    }
    if (/^##\s*完了/.test(trimmed)) {
      currentSection = "completed";
      continue;
    }
    if (/^##\s/.test(trimmed)) continue;

    const checkbox = parseCheckbox(trimmed);
    if (checkbox) {
      sections[currentSection].push(checkbox);
    }
  }

  const incomplete =
    sections.topPriority.filter((t) => !t.done).length +
    sections.normal.filter((t) => !t.done).length +
    sections.low.filter((t) => !t.done).length;
  const complete = sections.completed.length;

  return { data, sections, stats: { incomplete, complete } };
}

export function parseCheckbox(line) {
  const match = line.match(/^-\s*\[([ x])\]\s*(.+)/);
  if (!match) return null;

  const done = match[1] === "x";
  const rest = match[2];

  const parts = rest.split("|").map((s) => s.trim());
  const text = parts[0];

  let priority = "通常";
  let deadline = null;
  let completedDate = null;

  for (const part of parts.slice(1)) {
    const pMatch = part.match(/優先度:\s*(.+)/);
    if (pMatch) priority = pMatch[1].trim();

    const dMatch = part.match(/期限:\s*(\d{4}-\d{2}-\d{2})/);
    if (dMatch) deadline = dMatch[1];

    const cMatch = part.match(/完了:\s*(\d{4}-\d{2}-\d{2})/);
    if (cMatch) completedDate = cMatch[1];
  }

  return { text, done, priority, deadline, completedDate };
}

export function parseInboxFile(content) {
  const { data, body } = parseFrontmatter(content);
  const entries = [];

  for (const line of body.split("\n")) {
    const match = line.trim().match(/^-\s*\*\*(\d{1,2}:\d{2})\*\*\s*\|\s*(.+)/);
    if (match) {
      entries.push({ time: match[1], content: match[2].trim() });
    }
  }

  return { data, entries };
}

export function parseOrganizationInfo(content) {
  const { body } = parseFrontmatter(content);
  const info = { business: "", goals: "", createdDate: "" };

  for (const line of body.split("\n")) {
    const bMatch = line.match(/\*\*事業・活動\*\*:\s*(.+)/);
    if (bMatch) info.business = bMatch[1].trim();

    const gMatch = line.match(/\*\*目標・課題\*\*:\s*(.+)/);
    if (gMatch) info.goals = gMatch[1].trim();

    const dMatch = line.match(/\*\*作成日\*\*:\s*(.+)/);
    if (dMatch) info.createdDate = dMatch[1].trim();
  }

  return info;
}

export function parseDepartmentInfo(content) {
  const { body } = parseFrontmatter(content);
  const lines = body.split("\n");

  let name = "";
  let role = "";

  for (const line of lines) {
    if (/^#\s+/.test(line) && !name) {
      name = line.replace(/^#\s+/, "").trim();
    }
    const rMatch = line.match(/^##\s*役割/);
    if (rMatch) {
      const idx = lines.indexOf(line);
      if (idx + 1 < lines.length) {
        role = lines[idx + 1].trim();
      }
    }
  }

  return { name, role };
}

export function getStatusFromFrontmatter(content) {
  const { data } = parseFrontmatter(content);
  return data.status || null;
}
