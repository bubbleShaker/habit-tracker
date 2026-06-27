import {
  signInWithGoogle,
  signOut,
  getCurrentSession,
  onAuthStateChange,
} from "./auth";
import { getSupabase } from "./supabase";

// auth.ts は getSupabase() 経由でしか Supabase に触れない設計。
// その getSupabase をモックすれば、ネットワーク無しでラッパの振る舞いを検証できる。
jest.mock("./supabase");

const mockedGetSupabase = getSupabase as jest.MockedFunction<typeof getSupabase>;

// Supabase クライアントの auth 部分だけを偽物に差し替えるヘルパ。
function installAuthMock() {
  const auth = {
    signInWithOAuth: jest.fn().mockResolvedValue({ data: {}, error: null }),
    signOut: jest.fn().mockResolvedValue({ error: null }),
    getSession: jest
      .fn()
      .mockResolvedValue({ data: { session: null }, error: null }),
    onAuthStateChange: jest
      .fn()
      .mockReturnValue({ data: { subscription: { unsubscribe: jest.fn() } } }),
  };
  mockedGetSupabase.mockReturnValue({ auth } as never);
  return auth;
}

afterEach(() => {
  jest.clearAllMocks();
});

describe("signInWithGoogle", () => {
  it("provider=google で signInWithOAuth を呼ぶ", async () => {
    const auth = installAuthMock();
    await signInWithGoogle();
    expect(auth.signInWithOAuth).toHaveBeenCalledWith(
      expect.objectContaining({ provider: "google" })
    );
  });

  it("redirectTo を渡すと options.redirectTo に載る", async () => {
    const auth = installAuthMock();
    await signInWithGoogle("habittracker://auth");
    expect(auth.signInWithOAuth).toHaveBeenCalledWith(
      expect.objectContaining({
        provider: "google",
        options: { redirectTo: "habittracker://auth" },
      })
    );
  });
});

describe("signOut", () => {
  it("auth.signOut を呼ぶ", async () => {
    const auth = installAuthMock();
    await signOut();
    expect(auth.signOut).toHaveBeenCalledTimes(1);
  });
});

describe("getCurrentSession", () => {
  it("セッションが無ければ null を返す", async () => {
    installAuthMock();
    await expect(getCurrentSession()).resolves.toBeNull();
  });

  it("セッションがあればそれを返す", async () => {
    const auth = installAuthMock();
    const session = { access_token: "t" };
    auth.getSession.mockResolvedValue({ data: { session }, error: null });
    await expect(getCurrentSession()).resolves.toBe(session);
  });
});

describe("onAuthStateChange", () => {
  it("コールバックを登録し、解除関数を返す", () => {
    const auth = installAuthMock();
    const cb = jest.fn();
    const unsubscribe = onAuthStateChange(cb);

    // Supabase に購読を1回登録している。
    expect(auth.onAuthStateChange).toHaveBeenCalledTimes(1);

    // 返り値は購読解除の関数。呼ぶと unsubscribe される。
    const subscription = auth.onAuthStateChange.mock.results[0].value.data
      .subscription as { unsubscribe: jest.Mock };
    unsubscribe();
    expect(subscription.unsubscribe).toHaveBeenCalledTimes(1);
  });
});
