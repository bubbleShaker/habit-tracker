# Supabase client 実装で出てきた概念メモ（Issue #32 / PR #33）

`src/lib/supabase.ts` を実装したときに分かりにくかった4点の解説。
細部の暗記は不要で、「なぜこう書いたか」の理由を押さえれば十分。

## ① 遅延 singleton と「require を関数の中に置く」

- **singleton**: インスタンスを1個だけ作って使い回すパターン。クライアントは複数要らないので
  `client` 変数にキャッシュし、2回目以降はそれを返す。
- **遅延（lazy）**: 本当に必要になるまで作らない。`getSupabase()` を呼んだ初回だけ `createClient`。
- **なぜ `require` を関数の中に書いたか**:
  - 先頭で `import { createClient }` すると、ファイルを読み込んだ瞬間に重い supabase-js が起動する。
  - すると `readSupabaseEnv` だけを試したいテストでも supabase-js が動き、ネットワークに触れて不安定化。
  - 関数内 `require` なら「`getSupabase()` を実際に呼んだときだけ」起動 → テストは呼ばないので安定。
- ひとこと: `import`（先頭で読む）と `require`（その場で読む）は「いつ読み込むか」の違い。

## ② `import type { SupabaseClient }`

- 普通の `import` は「実物」を持ってくる。`import type` は「型（説明書）だけ」を持ってきて実物は持ってこない。
- 戻り値の型注釈に使いたいだけなので型で十分。実物は①の `require` で後から取得。
- `import type` はコンパイル後に消えるので実行時コストはゼロ。

## ③ `EXPO_PUBLIC_` / publishable key / secret key / RLS

- `EXPO_PUBLIC_` 接頭辞の環境変数は Expo が「アプリ本体へ埋め込む公開情報」として扱う＝配布物から誰でも読める。
- だから載せてよいのは **publishable key（公開前提のカギ）** だけ。
- **secret key（管理者カギ）** を載せると解析で盗まれ全データを操作されるので絶対に載せない。
- 公開鍵を置いて平気な理由が **RLS（Row Level Security）**:
  DB 側で「ログイン本人の行しか読み書きさせない」を強制する。守りはアプリ側ではなく DB 側。
  （RLS の実装は後続 Issue #D）

## ④ `auth.storage = AsyncStorage`

- **AsyncStorage** = 端末ローカルの小さな保存箱。
- ログインで発行される「セッション（ログイン証明書）」をここに保存すると、アプリを閉じて開き直しても
  ログイン状態が残る。
- 渡さないとセッションがメモリ上だけになり、再起動のたびにログインし直しになる。
