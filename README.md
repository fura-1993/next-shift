# シフト管理アプリケーション

Supabaseを利用した効率的なシフト管理システムです。従業員のシフトをセルに入力し、データベースに保存・引き出しができます。

## 特徴

- 月別のシフト表示と編集
- 従業員の追加・編集機能
- Supabaseリアルタイムデータベース連携
- 最適化されたデータ通信による高速なレスポンス

## セットアップ手順

### 前提条件

- Node.js 14.x 以上
- NPM 6.x 以上
- Supabaseアカウント

### インストール

1. リポジトリをクローンする:
   ```
   git clone https://your-repository-url.git
   cd mobile-shift
   ```

2. 依存関係をインストールする:
   ```
   npm install
   ```

3. `.env.local` ファイルをプロジェクトのルートに作成し、Supabaseの認証情報を設定:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. 開発サーバーを起動:
   ```
   npm run dev
   ```

5. ブラウザで [http://localhost:3000](http://localhost:3000) にアクセス

### データベース初期化

Supabaseにテーブルを作成するために以下のコマンドを実行します:

```
node scripts/create-tables.js
```

## 技術スタック

- Next.js
- TypeScript
- Supabase (PostgreSQL)
- Tailwind CSS
- shadcn/ui
- Framer Motion

## ライセンス

MITライセンス # next-shift
