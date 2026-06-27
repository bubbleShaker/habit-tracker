# Supabase スキーマ / マイグレーション

`migrations/` にスキーマと RLS の定義を SQL で置く。**DB の変更はここに追記**し、
手作業で直接いじらない（履歴を残し、別環境へ再現適用できるようにするため）。

## テーブル構成

```mermaid
erDiagram
  users ||--o{ habits : owns
  users ||--o{ completions : owns
  habits ||--o{ completions : has
  habits {
    uuid id PK
    uuid user_id FK
    text name
    timestamptz created_at
    int sort_order
  }
  completions {
    uuid habit_id PK_FK
    date date_key PK
    uuid user_id FK
  }
```

- `completions` の主キーは `(habit_id, date_key)`。同じ習慣・同じ日は1行だけ。
- 「今日やった」のトグルは `completions` の **行 insert / delete** に対応。
- すべての行に `user_id` を持たせ、**RLS で「自分の行だけ」をDB側で強制**する。

## 適用手順（どちらか）

### A. Supabase ダッシュボード（最短）
1. プロジェクトの **SQL Editor** を開く。
2. `migrations/20260627000000_init_habits_completions.sql` の中身を貼り付けて実行。

### B. Supabase CLI（推奨・継続運用向け）
```bash
# 初回のみ: CLI 導入とプロジェクト紐付け
npm i -g supabase
supabase link --project-ref <your-project-ref>

# migrations/ の SQL をリモートDBへ適用
supabase db push
```

## 適用後の動作確認（RLS が効いているか）

RLS の確認＝「ログインしないと読めない／他人の行は見えない」こと。

1. **未ログインでは0件**: SQL Editor ではなくアプリ（または匿名キー）から `select * from habits` →
   行が返らない（RLS で弾かれる）こと。
2. **本人の行は読める**: ログイン状態で1件 insert（`user_id` は default で自動充填）→ その行だけ見える。
3. **他人の user_id では挿入不可**: `insert into habits(user_id, name) values ('<別人のuuid>', 'x')` →
   `with check` 違反で失敗すること。

> 確認は Supabase プロジェクトと `.env`（#32 で用意）が前提。プロジェクト未作成なら、
> 作成後にこの手順を実行する。
