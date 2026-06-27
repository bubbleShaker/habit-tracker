import { isSupabaseConfigured, readSupabaseEnv } from "./supabase";

// env 検証だけを対象にする（createClient は呼ばない＝ネットワーク不要）。
// getSupabase() は遅延初期化なので、ここで触らなければ client は作られない。

// process.env をまるごと再代入する（process.env = {...}）と Node の特殊オブジェクトが
// 壊れて describe をまたいで読み書きが効かなくなる。対象キーだけ save/restore する。
const KEYS = [
  "EXPO_PUBLIC_SUPABASE_URL",
  "EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
] as const;

const saved: Record<string, string | undefined> = {};

beforeEach(() => {
  for (const k of KEYS) saved[k] = process.env[k];
});

afterEach(() => {
  for (const k of KEYS) {
    if (saved[k] === undefined) delete process.env[k];
    else process.env[k] = saved[k];
  }
});

describe("readSupabaseEnv", () => {
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

// 例外を投げずに「設定が揃っているか」だけを真偽で返す版。
// 起動時の分岐（未設定ならログイン無しでローカル動作）に使う。
describe("isSupabaseConfigured", () => {
  it("URL と key が揃っていれば true", () => {
    process.env.EXPO_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_xxx";
    expect(isSupabaseConfigured()).toBe(true);
  });

  it("どちらか欠ければ false（throw しない）", () => {
    delete process.env.EXPO_PUBLIC_SUPABASE_URL;
    process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_xxx";
    expect(isSupabaseConfigured()).toBe(false);
  });
});
