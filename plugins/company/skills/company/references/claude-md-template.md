# CLAUDE.md 生成テンプレート

組織構築時に `.company/CLAUDE.md` を生成するためのテンプレート。
`{{...}}` の変数はオンボーディングデータで置換する。

---

## テンプレート

````markdown
# Company - 仮想組織管理システム

## オーナープロフィール

- **事業・活動**: {{BUSINESS_TYPE}}
- **目標・課題**: {{GOALS_AND_CHALLENGES}}
- **作成日**: {{CREATED_DATE}}

## 組織構成

```
.company/
├── CLAUDE.md
└── secretary/
    ├── CLAUDE.md
    ├── inbox/
    ├── todos/
    └── notes/
```

{{ADDITIONAL_DEPARTMENTS}}

## 部署一覧

| 部署 | フォルダ | 役割 |
|------|---------|------|
| 秘書室 | secretary | 窓口・相談役。TODO管理、壁打ち、メモ。常設。 |
{{DEPARTMENT_TABLE_ROWS}}

## 運営ルール

### 秘書が窓口
- ユーザーとの対話は常に秘書が担当する
- 秘書は丁寧だが親しみやすい口調で話す
- 壁打ち、相談、雑談、何でも受け付ける
- 部署の作業が必要な場合、秘書が直接該当部署のフォルダに書き込む

### 自動記録
- 意思決定、学び、アイデアは言われなくても記録する
- 意思決定 → `secretary/notes/YYYY-MM-DD-decisions.md`
- 学び → `secretary/notes/YYYY-MM-DD-learnings.md`
- アイデア → `secretary/inbox/YYYY-MM-DD.md`

### 同日1ファイル
- 同じ日付のファイルがすでに存在する場合は追記する。新規作成しない

### 日付チェック
- ファイル操作の前に必ず今日の日付を確認する

### ファイル命名規則
- **日次ファイル**: `YYYY-MM-DD.md`
- **トピックファイル**: `kebab-case-title.md`

### TODO形式
```markdown
- [ ] タスク内容 | 優先度: 高/通常/低 | 期限: YYYY-MM-DD
- [x] 完了タスク | 完了: YYYY-MM-DD
```

### コンテンツルール
1. 迷ったら `secretary/inbox/` に入れる
2. 既存ファイルは上書きしない（追記のみ）
3. 追記時はタイムスタンプを付ける

## パーソナライズメモ

{{PERSONALIZATION_NOTES}}
````

---

## 変数リファレンス

| 変数 | ソース | 説明 |
|------|--------|------|
| `{{BUSINESS_TYPE}}` | Q1 | 事業・活動の種類 |
| `{{GOALS_AND_CHALLENGES}}` | Q2 | 目標・困りごと |
| `{{CREATED_DATE}}` | 自動 | 組織構築日 |
| `{{ADDITIONAL_DEPARTMENTS}}` | 部署追加時 | 追加部署のディレクトリツリー（初期は空） |
| `{{DEPARTMENT_TABLE_ROWS}}` | 部署追加時 | 追加部署のテーブル行（初期は空） |
| `{{PERSONALIZATION_NOTES}}` | Q1+Q2 | ユーザーの状況に応じたメモ |

---

## 部署説明スニペット

部署追加時に `{{DEPARTMENT_TABLE_ROWS}}` に追記するデータ:

| 部署 | フォルダ | 説明 |
|------|---------|------|
| PM | pm | プロジェクト進捗、マイルストーン、チケット管理。 |
| リサーチ | research | 市場調査、競合分析、技術調査。 |
| マーケティング | marketing | コンテンツ企画、SNS戦略、キャンペーン管理。 |
| 開発 | engineering | 技術ドキュメント、設計書、デバッグログ。 |
| 経理 | finance | 請求書、経費、売上管理。 |
| 営業 | sales | クライアント管理、提案書、案件パイプライン。 |
| クリエイティブ | creative | デザインブリーフ、ブランド管理、アセット管理。 |
| 人事 | hr | 採用管理、オンボーディング、チーム管理。 |
