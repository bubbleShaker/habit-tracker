// 認証ラッパ層。Supabase の auth API をこのファイルの裏に隠し、
// UI/フックは supabase-js を直接知らずに「ログイン/ログアウト/セッション」を扱える。
// （依存方向を内向きに保つ＝クリーンアーキテクチャ）

import type { Session } from "@supabase/supabase-js";
import { getSupabase } from "./supabase";

/**
 * Google で OAuth ログインを開始する（ブラウザ経由の web flow）。
 * @param redirectTo 認証後に戻ってくる URL（deep link）。指定時のみ options に載せる。
 */
export async function signInWithGoogle(redirectTo?: string) {
  return getSupabase().auth.signInWithOAuth({
    provider: "google",
    options: redirectTo ? { redirectTo } : undefined,
  });
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
