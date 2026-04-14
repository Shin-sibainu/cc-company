import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const ROOT = resolve(import.meta.dirname, '..');
const PLUGIN_DIR = resolve(ROOT, 'plugins/company');
const SKILL_DIR = resolve(PLUGIN_DIR, 'skills/company');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, 'utf-8'));
}

function readText(filePath) {
  return readFileSync(filePath, 'utf-8');
}

/**
 * Parse YAML-style front-matter from a Markdown file.
 * Returns an object with { attributes, body }.
 */
function parseFrontMatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return { attributes: {}, body: content };

  const raw = match[1];
  const attributes = {};
  for (const line of raw.split('\n')) {
    // Handle simple "key: value" and multi-line "> value"
    const kv = line.match(/^(\w[\w-]*):\s*(.*)/);
    if (kv) {
      let val = kv[2].trim();
      // Strip surrounding quotes
      if ((val.startsWith('"') && val.endsWith('"')) ||
          (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      attributes[kv[1]] = val;
    }
  }
  const body = content.slice(match[0].length).trim();
  return { attributes, body };
}

// ---------------------------------------------------------------------------
// 1. plugin.json validation
// ---------------------------------------------------------------------------

describe('plugin.json', () => {
  const pluginJsonPath = resolve(PLUGIN_DIR, '.claude-plugin/plugin.json');

  it('should exist', () => {
    expect(existsSync(pluginJsonPath)).toBe(true);
  });

  it('should be valid JSON', () => {
    expect(() => readJson(pluginJsonPath)).not.toThrow();
  });

  it('should have required fields: name, description, version', () => {
    const data = readJson(pluginJsonPath);
    expect(data).toHaveProperty('name');
    expect(data).toHaveProperty('description');
    expect(data).toHaveProperty('version');
  });

  it('name should be a non-empty string', () => {
    const data = readJson(pluginJsonPath);
    expect(typeof data.name).toBe('string');
    expect(data.name.length).toBeGreaterThan(0);
  });

  it('version should follow semver pattern', () => {
    const data = readJson(pluginJsonPath);
    expect(data.version).toMatch(/^\d+\.\d+\.\d+/);
  });
});

// ---------------------------------------------------------------------------
// 2. SKILL.md validation
// ---------------------------------------------------------------------------

describe('SKILL.md', () => {
  const skillPath = resolve(SKILL_DIR, 'SKILL.md');

  it('should exist', () => {
    expect(existsSync(skillPath)).toBe(true);
  });

  it('should have YAML front-matter', () => {
    const content = readText(skillPath);
    expect(content).toMatch(/^---\r?\n/);
  });

  it('front-matter should contain required fields: name, description, trigger', () => {
    const content = readText(skillPath);
    const { attributes } = parseFrontMatter(content);
    expect(attributes).toHaveProperty('name');
    expect(attributes).toHaveProperty('description');
    expect(attributes).toHaveProperty('trigger');
  });

  it('trigger should start with /', () => {
    const content = readText(skillPath);
    const { attributes } = parseFrontMatter(content);
    expect(attributes.trigger).toMatch(/^\//);
  });

  it('body should contain workflow sections', () => {
    const content = readText(skillPath);
    expect(content).toContain('## ワークフロー');
    expect(content).toContain('## 運営モード');
  });

  it('body should reference both template files', () => {
    const content = readText(skillPath);
    expect(content).toContain('references/departments.md');
    expect(content).toContain('references/claude-md-template.md');
  });
});

// ---------------------------------------------------------------------------
// 3. references/departments.md validation
// ---------------------------------------------------------------------------

describe('references/departments.md', () => {
  const deptPath = resolve(SKILL_DIR, 'references/departments.md');

  it('should exist', () => {
    expect(existsSync(deptPath)).toBe(true);
  });

  const EXPECTED_DEPARTMENTS = [
    '秘書室',
    'PM',
    'リサーチ',
    'マーケティング',
    '開発',
    '経理',
    '営業',
    'クリエイティブ',
    '人事',
  ];

  it.each(EXPECTED_DEPARTMENTS)(
    'should contain department section: %s',
    (dept) => {
      const content = readText(deptPath);
      expect(content).toContain(dept);
    }
  );

  it('should contain CLAUDE.md templates for all departments', () => {
    const content = readText(deptPath);
    const claudeMdSections = [
      'secretary/CLAUDE.md',
      'pm/CLAUDE.md',
      'research/CLAUDE.md',
      'marketing/CLAUDE.md',
      'engineering/CLAUDE.md',
      'finance/CLAUDE.md',
      'sales/CLAUDE.md',
      'creative/CLAUDE.md',
      'hr/CLAUDE.md',
    ];
    for (const section of claudeMdSections) {
      expect(content).toContain(section);
    }
  });

  it('each department template should have a _template.md code block', () => {
    const content = readText(deptPath);
    // Each department section has at least one template with front-matter
    // containing "type:" or "date:" or "created:"
    const templateBlocks = content.match(/```markdown[\s\S]*?```/g) || [];
    expect(templateBlocks.length).toBeGreaterThanOrEqual(EXPECTED_DEPARTMENTS.length);
  });

  it('templates should use {{YYYY-MM-DD}} date placeholder consistently', () => {
    const content = readText(deptPath);
    const templateBlocks = content.match(/```markdown[\s\S]*?```/g) || [];
    const blocksWithDate = templateBlocks.filter(b => b.includes('date:') || b.includes('created:'));
    for (const block of blocksWithDate) {
      expect(block).toContain('{{YYYY-MM-DD}}');
    }
  });
});

// ---------------------------------------------------------------------------
// 4. references/claude-md-template.md validation
// ---------------------------------------------------------------------------

describe('references/claude-md-template.md', () => {
  const templatePath = resolve(SKILL_DIR, 'references/claude-md-template.md');

  it('should exist', () => {
    expect(existsSync(templatePath)).toBe(true);
  });

  const REQUIRED_VARIABLES = [
    '{{BUSINESS_TYPE}}',
    '{{GOALS_AND_CHALLENGES}}',
    '{{CREATED_DATE}}',
    '{{ADDITIONAL_DEPARTMENTS}}',
    '{{DEPARTMENT_TABLE_ROWS}}',
    '{{PERSONALIZATION_NOTES}}',
  ];

  it.each(REQUIRED_VARIABLES)(
    'should contain template variable: %s',
    (variable) => {
      const content = readText(templatePath);
      expect(content).toContain(variable);
    }
  );

  it('should contain variable reference table', () => {
    const content = readText(templatePath);
    expect(content).toContain('## 変数リファレンス');
  });

  it('variable reference table should document all required variables', () => {
    const content = readText(templatePath);
    for (const variable of REQUIRED_VARIABLES) {
      // Each variable should be referenced in the documentation as well as in the template
      const escaped = variable.replace(/[{}]/g, '\\$&');
      const matches = content.match(new RegExp(escaped, 'g')) || [];
      expect(matches.length).toBeGreaterThanOrEqual(2); // at least in template + reference table
    }
  });

  it('template should contain organization structure section', () => {
    const content = readText(templatePath);
    expect(content).toContain('## 組織構成');
  });

  it('template should contain operation rules section', () => {
    const content = readText(templatePath);
    expect(content).toContain('## 運営ルール');
  });
});

// ---------------------------------------------------------------------------
// 5. File structure integrity
// ---------------------------------------------------------------------------

describe('plugin directory structure', () => {
  const requiredFiles = [
    'plugins/company/.claude-plugin/plugin.json',
    'plugins/company/skills/company/SKILL.md',
    'plugins/company/skills/company/references/departments.md',
    'plugins/company/skills/company/references/claude-md-template.md',
  ];

  it.each(requiredFiles)(
    'required file should exist: %s',
    (file) => {
      expect(existsSync(resolve(ROOT, file))).toBe(true);
    }
  );

  it('plugin name in plugin.json should match skill name in SKILL.md', () => {
    const pluginData = readJson(resolve(PLUGIN_DIR, '.claude-plugin/plugin.json'));
    const skillContent = readText(resolve(SKILL_DIR, 'SKILL.md'));
    const { attributes } = parseFrontMatter(skillContent);
    expect(pluginData.name).toBe(attributes.name);
  });
});
