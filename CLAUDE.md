# CLAUDE.md

このファイルは、リポジトリで作業する際に Claude Code (claude.ai/code) へのガイダンスを提供します。

## コマンド

```bash
pnpm dev        # 開発サーバー起動 (localhost:4321)
pnpm build      # 静的サイトを dist/ にビルド
pnpm preview    # ビルド済みサイトをローカルでプレビュー
pnpm pdf        # PDF出力 (pdf/resume.pdf)
```

## アーキテクチャ

**Astro 5** + **Tailwind CSS v4** で構築した静的な個人職務経歴書サイト。GitHub Pages の `https://t-aono.github.io/resume-md` にデプロイされる。

### コンテンツの流れ

1. `src/content/posts/resume.md` — 職務経歴書の本文（Markdownとfrontmatter）
2. `src/content/config.ts` — コンテンツコレクションの形状を定義するZodスキーマ
3. `src/pages/index.astro` — 唯一のエントリを取得し、最終更新日をフォーマットしてLayoutに渡す
4. `src/layouts/Layout.astro` — レスポンシブなコンテナとフッターを含む完全なHTMLページをレンダリング
5. `src/styles/global.css` — Tailwind v4のインポートと `<details>/<summary>` のカスタムスタイル

### 注意事項

- **ベースパス:** `/resume-md`（`astro.config.mjs` で設定）— 内部リンクやアセットはすべてこれを考慮する必要がある
- **最終更新日時:** `remark-modified-time.mjs` が各Markdownファイルに対して `git log` を実行し、`lastModified` をfrontmatterに注入する。タイムスタンプはそのファイルの最後のgitコミットを反映する
- **Tailwind v4:** `@tailwindcss/vite` プラグインを使用（従来のPostCSSアプローチではない）。タイポグラフィスタイルは `@tailwindcss/typography` による
- **デプロイ:** GitHub Actions（`deploy.yml`）が `main` へのプッシュ時に `withastro/action@v3` を使って自動デプロイする

### プロジェクト実績の開閉ロジック

`src/content/posts/resume.md` 内のプロジェクト実績は `<details data-index="N">` 要素で記述されている。

`src/pages/index.astro` のクライアントサイドスクリプトが以下を制御する：

- **初期状態:** `defaultOpenIndices`（現在 `[1, 2, 3, 4]`）に含まれる番号の `<details>` のみ開いた状態にする。`data-index` 属性で番号を照合する
- **ボタン:** 「プロジェクト実績」見出し（`id="projects"`）の直後に「すべて開く」「すべて閉じる」ボタンを動的に挿入する。ボタンの `div` には `no-print` クラスが付与されており、印刷・PDF時は非表示になる

`src/styles/global.css` の `@layer components` で `<details>/<summary>` のスタイルを定義している。`▶︎`（閉）/ `▼`（開）の矢印は `summary::before` と `details[open] summary::before` で切り替わる。

### PDF出力

`pnpm pdf` → `scripts/generate-pdf.mjs` を実行する。

処理フロー：
1. `pnpm build` でサイトをビルド
2. `pnpm preview` をバックグラウンドで起動（ポート4321）
3. Playwright（Chromium）で `http://localhost:4321/resume-md/` にアクセス
4. `page.evaluate()` で全 `<details>` を `open = true` に設定
5. `page.pdf()` でA4 PDFを生成 → `pdf/resume.pdf` に出力

`@media print` スタイル（`src/styles/global.css`）により、PDF出力時はフッターと `.no-print` 要素（開閉ボタン）が非表示になる。`pdf/` フォルダは `.gitignore` で管理対象外。
