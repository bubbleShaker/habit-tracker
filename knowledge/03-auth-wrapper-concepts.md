# 認証ラッパ（auth.ts）で出てきた概念メモ（Issue #36 C-1 / PR #37）

`src/lib/auth.ts` を実装したときに分かりにくかった4点。

## ① 「ラッパで隠す」意味（依存方向 内向き / クリーンアーキテクチャ）

ラッパ = 何かを包んで自分用の入口を1個だけ用意すること。

```ts
// ❌ 画面から直接 Supabase を呼ぶ：呼び方が全画面に散らばる
getSupabase().auth.signInWithOAuth({ provider: "google" });
// ✅ 自前ラッパ経由：Supabase に触るのは auth.ts の中だけ
signInWithGoogle();
```

- 直接呼ぶと、別サービスへ乗り換えや API 仕様変更のたびに**全箇所修正**。
- ラッパ経由なら**直す場所は1ヶ所**。画面は「signInWithGoogle() という自分たちの言葉」しか知らない。
- = 依存方向を内向きに保つ。画面はその裏が Supabase か否かを知らなくてよい（信頼してよい境界）。

## ② onAuthStateChange が解除関数を返す理由

`onAuthStateChange` は「ログイン状態が変わったら教えて」と見張り（subscription）を雇うイメージ。
見張りは自分で帰らないので、画面を閉じても残ると：
- **メモリリーク**: 閉じた画面がメモリに残り溜まる。
- **二重発火**: 開き直すたび見張りが増え、1回のログインで複数回コールバックが走る。

→ 「見張りをクビにする関数」＝解除関数を返し、画面を閉じる時に呼ぶ。React では：
```ts
useEffect(() => {
  const unsubscribe = onAuthStateChange(setSession);
  return unsubscribe; // unmount 時に自動実行（後片付け）
}, []);
```
（この使い方は C-2 で実際に使う）

## ③ signInWithOAuth（web flow）を Web から先にやる理由

| 方式 | 仕組み | 必要なもの |
|------|--------|-----------|
| OAuth web flow（採用） | ブラウザを開いて Google 認証 → アプリに戻る | 追加ネイティブ依存ゼロ |
| ネイティブ Sign-In | OS 純正のログイン画面 | dev build（独自ビルド）必須 |

- ネイティブ方式は Expo Go では動かず、dev build 環境という別の山が要る。
- web flow は Web（PCブラウザ）なら追加依存ゼロで即動く。
- → 設計は「まず Web で認証を完成 → ネイティブ化は後追い」。`signInWithOAuth` はその web flow を開始する関数。
- 「戻ってくる」先の URL が C-3 の redirect / deep link（`habittracker://...`）。C-1 では未配線。

## ④ スコープ分割（このPRは「部品」だけ）

C-1 はログインの“部品”（関数）のみ。まだ:
- ログイン画面は無い → C-2
- 実際の Google 認証は通らない（redirect 配線・Supabase/Google 設定が未）→ C-3

部品から作る理由: 部品は今すぐテストで保証できる（jest）。画面や実認証は「動かして目で見る」確認が中心で
外部準備（Supabase プロジェクト・Google 設定）も要る。テストで固められる所を先に固めて土台を確実にする。
順序は「部品 → 画面 → 実配線」。各段で「信頼してよい範囲」が増える。
