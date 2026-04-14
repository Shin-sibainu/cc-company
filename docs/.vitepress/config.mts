import { defineConfig } from "vitepress";

export default defineConfig({
  title: "cc-company",
  base: "/cc-company/",
  cleanUrls: true,
  ignoreDeadLinks: [/^http:\/\/localhost/],

  head: [["link", { rel: "icon", href: "/favicon.ico" }]],

  locales: {
    root: {
      label: "日本語",
      lang: "ja",
      description: "Claude Code で仮想組織を構築・運営するプラグイン",
      themeConfig: {
        nav: [
          { text: "ガイド", link: "/guide/getting-started" },
          { text: "リファレンス", link: "/reference/departments" },
          {
            text: "GitHub",
            link: "https://github.com/Shin-sibainu/cc-company",
          },
          {
            text: "Claude Code Academy",
            link: "https://claude-code-academy.dev/",
          },
        ],
        sidebar: {
          "/guide/": [
            {
              text: "はじめに",
              items: [
                { text: "cc-company とは", link: "/guide/what-is-cc-company" },
                { text: "クイックスタート", link: "/guide/getting-started" },
              ],
            },
            {
              text: "使い方",
              items: [
                { text: "秘書との日常", link: "/guide/daily-usage" },
                { text: "部署を追加する", link: "/guide/adding-departments" },
                { text: "ダッシュボード", link: "/guide/dashboard" },
                { text: "MCP連携ガイド", link: "/guide/mcp-integration" },
                {
                  text: "v1 からのアップグレード",
                  link: "/guide/migration",
                },
              ],
            },
            {
              text: "事例",
              items: [{ text: "活用事例", link: "/guide/use-cases" }],
            },
            {
              text: "リンク",
              items: [
                {
                  text: "Claude Code Academy",
                  link: "/guide/claude-code-academy",
                },
              ],
            },
          ],
          "/reference/": [
            {
              text: "リファレンス",
              items: [
                { text: "部署一覧", link: "/reference/departments" },
                { text: "ファイル構成", link: "/reference/file-structure" },
              ],
            },
            {
              text: "リンク",
              items: [
                {
                  text: "Claude Code Academy",
                  link: "/guide/claude-code-academy",
                },
              ],
            },
          ],
        },
        outline: {
          label: "目次",
        },
        docFooter: {
          prev: "前のページ",
          next: "次のページ",
        },
      },
    },
    en: {
      label: "English",
      lang: "en",
      description:
        "A plugin to build and run a virtual organization with Claude Code",
      themeConfig: {
        nav: [
          { text: "Guide", link: "/en/guide/getting-started" },
          { text: "Reference", link: "/en/reference/departments" },
          {
            text: "GitHub",
            link: "https://github.com/Shin-sibainu/cc-company",
          },
          {
            text: "Claude Code Academy",
            link: "https://claude-code-academy.dev/",
          },
        ],
        sidebar: {
          "/en/guide/": [
            {
              text: "Introduction",
              items: [
                {
                  text: "What is cc-company?",
                  link: "/en/guide/what-is-cc-company",
                },
                {
                  text: "Quick Start",
                  link: "/en/guide/getting-started",
                },
              ],
            },
            {
              text: "Usage",
              items: [
                {
                  text: "Daily Usage with Secretary",
                  link: "/en/guide/daily-usage",
                },
                {
                  text: "Adding Departments",
                  link: "/en/guide/adding-departments",
                },
                {
                  text: "Dashboard",
                  link: "/en/guide/dashboard",
                },
                {
                  text: "MCP Integration",
                  link: "/en/guide/mcp-integration",
                },
                {
                  text: "Upgrading from v1",
                  link: "/en/guide/migration",
                },
              ],
            },
            {
              text: "Examples",
              items: [
                { text: "Use Cases", link: "/en/guide/use-cases" },
              ],
            },
            {
              text: "Links",
              items: [
                {
                  text: "Claude Code Academy",
                  link: "/en/guide/claude-code-academy",
                },
              ],
            },
          ],
          "/en/reference/": [
            {
              text: "Reference",
              items: [
                {
                  text: "Departments",
                  link: "/en/reference/departments",
                },
                {
                  text: "File Structure",
                  link: "/en/reference/file-structure",
                },
              ],
            },
            {
              text: "Links",
              items: [
                {
                  text: "Claude Code Academy",
                  link: "/en/guide/claude-code-academy",
                },
              ],
            },
          ],
        },
        outline: {
          label: "On this page",
        },
        docFooter: {
          prev: "Previous",
          next: "Next",
        },
      },
    },
  },

  themeConfig: {
    socialLinks: [
      { icon: "github", link: "https://github.com/Shin-sibainu/cc-company" },
    ],

    footer: {
      message:
        'MIT License | <a href="https://claude-code-academy.dev/" target="_blank">Claude Code Academy</a>',
      copyright: "© 2026 Shin-sibainu",
    },

    search: {
      provider: "local",
    },
  },
});
