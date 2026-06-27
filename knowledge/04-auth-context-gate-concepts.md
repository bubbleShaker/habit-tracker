# AuthContext / AuthGate の概念メモ（Issue #36 C-2 / PR #38）

ログイン画面とセッション管理を入れたときに分かりにくかった3点。

## ① なぜ configured で分岐するのか（graceful degradation）

- このアプリはまだ `.env`（Supabase 接続先）を持たない。`getSupabase()` は env が無いと**例外を投げる**設計。
- 何も考えず起動時にセッション確認すると、env 無し → 例外 → **アプリがクラッシュ**（＝今動くローカル版が起動不能）。
- そこで `isSupabaseConfigured()`（throw しない真偽判定）で先に分岐：
  - `false`（.env 無し）→ 認証に触れず従来どおりローカル動作
  - `true` （.env 有り）→ ここで初めてログインの仕組みを使う

```tsx
useEffect(() => {
  if (!configured) return;        // 未設定なら Supabase に触れない＝クラッシュしない
  getCurrentSession().then(...);
  const unsubscribe = onAuthStateChange(...);
  return unsubscribe;
}, [configured]);
```

= 設定が無いときは機能をオフにするだけで壊さない「安全に劣化（graceful degradation）」。
C-3 で .env を入れると自動でログインが有効化される。

## ② AuthGate の3分岐（_layout.tsx）

「今どの画面を見せるか」を上から順に判定する交通整理。

```tsx
if (!configured) return children;   // (0) 未設定 → アプリ本体（ローカル）
if (loading)     return <Spinner/>; // (1) セッション確認中 → ぐるぐる
if (!session)    return <Login/>;   // (2) 未ログイン → ログイン画面
return children;                     // (3) ログイン済 → アプリ本体
```

- (1) loading: 起動直後は「保存済みセッションがあるか」を端末から読む最中。これを待たずにログイン画面を
  出すと、本当はログイン済みでも一瞬ログイン画面がチラつく（フラッシュ）。それを防ぐ。
- ポイント: `loading`（まだ分からない）を独立状態として持ち、`未ログイン`と混同しない。

## ③ まだ実際にはログインできない（C-3 の残作業）

C-2 はログインの「画面」と「状態管理」まで。ボタン後に Google 認証を完了させる配線が未。足りないもの:
1. Supabase プロジェクト＋ `.env`（無いと configured=false でログイン画面すら出ない）
2. Google 認証情報（Supabase 側で Google ログインを有効化）
3. リダイレクト配線（deep link `habittracker://...`）= ブラウザ認証後にアプリへ戻る受け口

これらはコードだけで完結せず、管理画面設定や実機/Web の目視確認が要る。だから
「部品(C-1) → 画面と状態(C-2) → 外部設定と実配線(C-3)」と分け、コードで保証できる所を先に積む。
今の状態 = 「ログインの UI と頭脳はできたが、外の世界（Google）とまだ繋いでいない」。
