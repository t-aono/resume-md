# CLAUDE.md

このファイルは、リポジトリで作業する際に Claude Code (claude.ai/code) へのガイダンスを提供します。

## コマンド

```bash
pnpm dev        # 開発サーバー起動 (localhost:4321)
pnpm build      # 静的サイトを dist/ にビルド
pnpm preview    # ビルド済みサイトをローカルでプレビュー
```

## アーキテクチャ

**Astro 5** + **Tailwind CSS v4** で構築した静的な個人職務経歴書サイト。GitHub Pages の `https://t-aono.github.io/resume-md` にデプロイされる。

### コンテンツの流れ

1. `src/content/posts/resume.md` — 職務経歴書の本文（Markdownとfrontmatter）
2. `src/content/config.ts` — コンテンツコレクションの形状を定義するZodスキーマ
3. `src/pages/index.astro` — 唯一のエントリを取得し、最終更新日をフォーマットしてLayoutに渡す
4. `src/layouts/Layout.astro` — レスポンシブなコンテナとフッターを含む完全なHTMLページをレンダリング
5. `src/styles/global.css` — Tailwind v4のインポートと `<details>/<summary>` のカスタムスタイル

### 重要な仕様

- **ベースパス:** `/resume-md`（`astro.config.mjs` で設定）— 内部リンクやアセットはすべてこれを考慮する必要がある
- **最終更新日時:** `remark-modified-time.mjs` が各Markdownファイルに対して `git log` を実行し、`lastModified` をfrontmatterに注入する。タイムスタンプはそのファイルの最後のgitコミットを反映する
- **Tailwind v4:** `@tailwindcss/vite` プラグインを使用（従来のPostCSSアプローチではない）。タイポグラフィスタイルは `@tailwindcss/typography` による
- **デプロイ:** GitHub Actions（`deploy.yml`）が `main` へのプッシュ時に `withastro/action@v3` を使って自動デプロイする
