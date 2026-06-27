import { readSupabaseEnv } from "./supabase";

// env 検証だけを対象にする（createClient は呼ばない＝ネットワーク不要）。
// getSupabase() は遅延初期化なので、ここで触らなければ client は作られない。
describe("readSupabaseEnv", () => {
  // 各テストで env を汚さないよう、前の値を退避して後で戻す。
  const original = { ...process.env };
  afterEach(() => {
    process.env = { ...original };
  });

  it("URL と key が揃っていれば読み取れる", () => {
    process.env.EXPO_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_xxx";
    expect(readSupabaseEnv()).toEqual({
      url: "https://example.supabase.co",
      key: "sb_publishable_xxx",
    });
  });

  it("URL が無ければ分かりやすく失敗する", () => {
    delete process.env.EXPO_PUBLIC_SUPABASE_URL;
    process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_xxx";
    expect(() => readSupabaseEnv()).toThrow(/環境変数が未設定/);
  });

  it("key が無ければ分かりやすく失敗する", () => {
    process.env.EXPO_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    delete process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    expect(() => readSupabaseEnv()).toThrow(/環境変数が未設定/);
  });
});
