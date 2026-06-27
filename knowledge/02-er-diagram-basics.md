# ER 図・主キー・リレーションの基礎（Issue #34 / PR #35）

`supabase/README.md` の ER 図が読めなかったので、Excel の表に例えて整理。

## 大前提: テーブル = Excel のシート

横1行が1件、縦が項目（列）。今回は2シート。

habits（習慣一覧）
| id | user_id | name | created_at | sort_order |
|----|---------|------|-----------|-----------|
| a1 | ずんだもん | 筋トレ | 6/1 | 0 |
| a2 | ずんだもん | 読書 | 6/2 | 1 |

completions（やった記録）
| habit_id | date_key | user_id |
|----------|----------|---------|
| a1 | 6/25 | ずんだもん |
| a1 | 6/26 | ずんだもん |
| a2 | 6/26 | ずんだもん |

## ① ER 図とは

「シートたちの地図」。どんなテーブルがあり、どう繋がるかを一枚で示す。
`erDiagram` の四角がテーブル、四角内の行が列。

## ② 主キー（PK = Primary Key）

その行を1つに特定する目印（クラスの出席番号のように被らない）。
- habits は `id` が主キー。
- completions は `habit_id + date_key` の**複合主キー**（2列セット）。
  → 「同じ習慣・同じ日」を2回記録できない（重複防止）。図で両方に PK が付くのはこの意味。

## ③ 外部キー（FK = Foreign Key）

別テーブルの行を指すリンク。**1つの列が PK と FK を兼ねることがある**。

completions には FK が2本ある:
- `habit_id` … habits の id を指す（a1=筋トレ）。**同時に複合主キーの一部**なので図では `PK,FK`。
- `user_id` … users の id を指す。

### 参照先の users テーブルはどこ？
`user_id` の参照先は **`auth.users`**（Supabase の認証システムが自動管理するユーザー本体の表。
メールやログイン方法が入る）。`auth` スキーマにあり、Supabase 所有なので**自分のマイグレーションでは
作らず `references auth.users(id)` で参照のみ**。だから SQL に `create table users` が無くても成立する。
（スキーマ = テーブルをまとめるフォルダのようなもの。普段のテーブルは `public` スキーマ）

## ④ 線と owns / has、記号 ||--o{

四角を結ぶ線が「関係」。owns/has は関係名のラベル（人間向けの説明）。
線の両端の記号が多重度（何個対応するか）:
- `||` = ちょうど1
- `o{` = 0個以上（たくさん）

例: `users ||--o{ habits : owns` = 「1人のユーザーが習慣をたくさん持つ」＝**1対多**。
`habits ||--o{ completions : has` = 「1つの習慣が達成記録をたくさん持つ」＝1対多。

## ⑤ auth.users のカラム定義

`auth.users` は Supabase の認証エンジン（GoTrue）が管理する表で、カラムは30個以上ある。
全部覚える必要はなく、実際に使うのは下の抜粋くらい。残りは認証フロー専用の内部項目。

| カラム | 型 | 何者か |
|--------|-----|--------|
| `id` | uuid | 主キー。アプリ側の `user_id` が参照する先 |
| `email` | varchar | メールアドレス |
| `encrypted_password` | varchar | ハッシュ化済みパスワード（Google ログインなら空） |
| `raw_user_meta_data` | jsonb | 名前・アバター等。Google ログイン時にここへ入る |
| `raw_app_meta_data` | jsonb | provider（google 等）やロールなどアプリ側メタ |
| `last_sign_in_at` | timestamptz | 最終ログイン日時 |
| `email_confirmed_at` | timestamptz | メール確認済み日時 |
| `created_at` / `updated_at` | timestamptz | 作成・更新日時 |
| `phone` | varchar | 電話番号（電話認証時） |
| `is_anonymous` | bool | 匿名ユーザーか |

ほかに `confirmation_token` / `recovery_token` などメール確認・パスワード再設定用の内部カラムが多数。

### 注意（信頼してよい境界）
- **`auth.users` は直接いじらない**。Supabase 管理なので `alter` や列追加は認証を壊しうる。読むのは可、
  書き換えは Supabase の API 経由。
- **アプリ独自のユーザー情報が欲しくなったら別テーブル**を作るのが定石。例: `public.profiles` を作り
  `id uuid references auth.users(id)` で1対1に紐づける。本トラッカーは表示名すら使わないので profiles は不要。

正確な定義はプロジェクトの SQL Editor で確認できる（バージョンで差異あり）:
```sql
select column_name, data_type
from information_schema.columns
where table_schema = 'auth' and table_name = 'users'
order by ordinal_position;
```
