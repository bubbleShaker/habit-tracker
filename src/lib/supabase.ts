// Supabase 接続のインフラ層（アダプタ）。
// UI/フックはこのファイルだけを通して Supabase に触れるので、依存方向は内向きに保てる。

import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
// type-only import: 型情報だけ取り込み、実体（重い supabase-js）は実行時までロードしない。
import type { SupabaseClient } from "@supabase/supabase-js";

/** Supabase へ接続するために最低限必要な公開設定。 */
export type SupabaseEnv = {
  url: string;
  /** publishable key（公開鍵）。公開前提で、データ保護は DB 側の RLS が担う。 */
  key: string;
};

/**
 * 環境変数から Supabase 接続情報を読み取り・検証する純粋関数。
 *
 * - `EXPO_PUBLIC_` 接頭辞は Expo がビルド時にクライアントへ埋め込む「公開変数」の印。
 *   publishable key はクライアントに載せてよい（secret key は絶対に置かない）。
 * - ネットワークに触れないので、テストはこの関数だけで完結できる。
 */
export function readSupabaseEnv(): SupabaseEnv {
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const key = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Supabase の環境変数が未設定です。" +
        " EXPO_PUBLIC_SUPABASE_URL と EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY を .env に設定してください。"
    );
  }

  return { url, key };
}

/**
 * Supabase の接続設定が揃っているかを真偽で返す（例外を投げない版）。
 * 起動時の分岐に使う: 未設定なら認証を使わず従来どおりローカルで動かす。
 * 「設定済みの定義」を readSupabaseEnv に一本化するため、その成否で判定する。
 */
export function isSupabaseConfigured(): boolean {
  try {
    readSupabaseEnv();
    return true;
  } catch {
    return false;
  }
}

// 遅延 singleton 用のキャッシュ。初回 getSupabase() で生成し、以降は使い回す。
let client: SupabaseClient | null = null;

/**
 * Supabase クライアントを遅延初期化して返す（singleton）。
 *
 * - 初回呼び出しまで `createClient` を実行しない＝import しただけでは接続を作らない。
 *   これにより env を触らないテストはネットワーク非依存のままでいられる。
 * - セッションは AsyncStorage に保存し、アプリ再起動後もログイン状態を保つ。
 *   ネイティブは AsyncStorage、Web は内部的に localStorage が使われる。
 */
export function getSupabase(): SupabaseClient {
  if (client) {
    return client;
  }

  const { url, key } = readSupabaseEnv();

  // 実体のロードを呼び出し時まで遅延する（type-only import と対になる require）。
  // require は CommonJS の同期読み込み。createClient が同期 API なので await 不要。
  const { createClient } =
    require("@supabase/supabase-js") as typeof import("@supabase/supabase-js");

  client = createClient(url, key, {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      // Web は戻り URL の ?code= を supabase-js に自動検出させる。
      // ネイティブは自前で openAuthSessionAsync → exchangeCodeForSession するため false。
      detectSessionInUrl: Platform.OS === "web",
    },
  });

  return client;
}
