# OAuth 実フロー（Web/ネイティブ・PKCE）の概念メモ（Issue #36 C-3 / PR #39）

`src/lib/auth.ts` の signInWithGoogle を実フロー化したときの4点。

## ① Web とネイティブで処理が違う理由

OAuth =「アプリ → Google で認証 → 元のアプリに戻る」。この「戻る」の仕組みが違う。

- **Web**: アプリも Google も同じブラウザ内。認証後、同じページ URL（`?code=`付き）が再読み込み
  される → supabase-js が自動でセッション化（ライブラリ任せ）。
- **ネイティブ**: 認証は別アプリ（ブラウザ）で行う。アプリ本体に戻るには deep link
  （`habittracker://`）でアプリを起こし、戻り URL を自分で受け取り・解析する必要がある。

```ts
if (Platform.OS === "web") {
  await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo } });
} else {
  const { data } = await supabase.auth.signInWithOAuth({ ..., skipBrowserRedirect: true });
  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  // 戻り URL から code を取り出して交換（下記②）
}
```
ひとこと: Web=同じ部屋で往復／ネイティブ=別の部屋(ブラウザ)へ行って帰る、ので出入口と受け取りを自前で。

## ② ?code= と PKCE（なぜ2段階か）

deep link は他アプリに横取りされうる。戻りにトークンを直接乗せると盗まれて即悪用される。
PKCE は2段構えでこれを防ぐ:
1. 開始時にアプリが秘密文字列（code verifier）を作り手元(AsyncStorage)に隠す。Google にはハッシュだけ送る。
2. 戻りにはトークンでなく「引換券(code)」だけが乗る。
3. 「引換券 + 手元の秘密」をセットで出して初めてトークンに交換できる（exchangeCodeForSession）。

```ts
const code = Linking.parse(result.url).queryParams?.code; // 引換券
await supabase.auth.exchangeCodeForSession(code);          // 手元の秘密と合わせ交換
```
= 引換券を横取りされても手元の秘密が無いと交換不可。PKCE = Proof Key for Code Exchange。

## ③ detectSessionInUrl を Web だけ true

①の裏返し。「戻り URL を誰が処理するか」が違う。
- Web: 戻りは同じページ再読み込み → supabase-js が起動時に URL を見て拾う → `true`。
- ネイティブ: 戻りは openAuthSessionAsync の戻り値で手元に来る → 自前で交換 → `false`。

```ts
detectSessionInUrl: Platform.OS === "web"
```

## ④ まだ「動作確認」は未

tsc / jest(54/54) が緑 = ロジックが期待どおり、を保証するだけ。実ログインには外部設定が要る:
- Supabase プロジェクト＋ `.env`
- Google 側 OAuth 設定（Client ID/Secret を Supabase に登録）
- Redirect URL 登録（`habittracker://` 等を許可）

確認は実機/ブラウザで「押す→Google→戻る」を目視するしかない。手順は supabase/README「認証セットアップ」。
役割分担: テスト=配線が正しい／手動確認=電気が通る。
