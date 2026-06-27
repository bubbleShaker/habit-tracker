// 認証ラッパ層。Supabase の auth API をこのファイルの裏に隠し、
// UI/フックは supabase-js を直接知らずに「ログイン/ログアウト/セッション」を扱える。
// （依存方向を内向きに保つ＝クリーンアーキテクチャ）

import { Platform } from "react-native";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import type { Session } from "@supabase/supabase-js";
import { getSupabase } from "./supabase";

// 認証後に戻ってくる先（deep link）。app.json の scheme(habittracker) から
// expo-linking が環境に応じた URL を組み立てる（Web は http、ネイティブは habittracker://）。
export const redirectTo = Linking.createURL("/");

/**
 * Google で OAuth ログインする。プラットフォームでやり方が変わる。
 *
 * - Web: Supabase のフルリダイレクトに任せる（戻りは supabase-js が自動処理）。
 * - ネイティブ: 自前でブラウザを開き、戻ってきた URL の認証コードを
 *   exchangeCodeForSession でセッションに引き換える（PKCE）。
 */
export async function signInWithGoogle(): Promise<void> {
  const supabase = getSupabase();

  if (Platform.OS === "web") {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
    if (error) throw error;
    return;
  }

  // ネイティブ: skipBrowserRedirect で「開く URL」だけ受け取り、自分でブラウザを開く。
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo, skipBrowserRedirect: true },
  });
  if (error) throw error;
  if (!data?.url) throw new Error("認証 URL が取得できなかったのだ");

  // ブラウザを開き、redirectTo に戻ってくるまで待つ。
  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (result.type !== "success") return; // ユーザーがキャンセル等

  // 戻り URL から ?code= を取り出す。URL 解析は expo-linking に任せる（RN でも安定）。
  const code = Linking.parse(result.url).queryParams?.code;
  if (typeof code !== "string") {
    throw new Error("認証コードが取得できなかったのだ");
  }

  // 認証コードをセッション（トークン）に引き換える（PKCE）。
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(
    code
  );
  if (exchangeError) throw exchangeError;
}

/** ログアウトする（セッションを破棄）。 */
export async function signOut() {
  return getSupabase().auth.signOut();
}

/** 現在のセッションを返す。未ログインなら null。 */
export async function getCurrentSession(): Promise<Session | null> {
  const { data } = await getSupabase().auth.getSession();
  return data.session;
}

/**
 * セッションの変化（ログイン/ログアウト/トークン更新）を購読する。
 * @returns 購読解除の関数。画面の後片付け（unmount 時）で呼ぶ。
 */
export function onAuthStateChange(
  callback: (session: Session | null) => void
): () => void {
  const { data } = getSupabase().auth.onAuthStateChange((_event, session) => {
    callback(session);
  });
  return () => data.subscription.unsubscribe();
}
