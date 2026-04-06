# cc-company-dashboard

[cc-company](https://github.com/Shin-sibainu/cc-company) の組織状況をブラウザで確認できるダッシュボード。

## 使い方

`.company/` があるプロジェクトで実行：

```bash
npx cc-company-dashboard
```

ブラウザが自動で開きます。

## オプション

```bash
npx cc-company-dashboard --port 4000    # ポート変更
npx cc-company-dashboard --no-open      # ブラウザ自動起動を無効化
npx cc-company-dashboard --dir /path    # .company/ を探すディレクトリを指定
```

## 機能

- **Dashboard** — TODO数、Inbox件数、部署数、アクティビティをひと目で確認
- **Explorer** — ファイル階層をツリー表示
- **Graph** — Obsidian風ネットワーク可視化
- **Search** — 全ファイル全文検索
- **部署詳細** — Markdownプレビュー / 生テキスト切替
- **ライト / ダークモード** — ワンクリック切替
- **リアルタイム更新** — ファイル変更を自動検出

## 前提条件

- Node.js 18+
- [cc-company](https://github.com/Shin-sibainu/cc-company) プラグインでセットアップ済みの `.company/` フォルダ

## ドキュメント

[https://shin-sibainu.github.io/cc-company/](https://shin-sibainu.github.io/cc-company/)

## ライセンス

MIT
