import { Platform } from "react-native";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import {
  signInWithGoogle,
  signOut,
  getCurrentSession,
  onAuthStateChange,
} from "./auth";
import { getSupabase } from "./supabase";

// auth.ts は getSupabase()／expo-linking／expo-web-browser 経由でしか外部に触れない。
// すべてモックすれば、ネットワーク・ブラウザ無しで分岐とシーケンスを検証できる。
jest.mock("./supabase");
jest.mock("expo-linking", () => ({
  createURL: jest.fn(() => "habittracker:///"),
  parse: jest.fn(() => ({ queryParams: { code: "auth-code-123" } })),
}));
jest.mock("expo-web-browser", () => ({
  openAuthSessionAsync: jest.fn(),
}));

const mockedGetSupabase = getSupabase as jest.MockedFunction<typeof getSupabase>;
const mockedOpenAuth = WebBrowser.openAuthSessionAsync as jest.Mock;

function installAuthMock() {
  const auth = {
    signInWithOAuth: jest
      .fn()
      .mockResolvedValue({ data: { url: "https://google.example/auth" }, error: null }),
    exchangeCodeForSession: jest.fn().mockResolvedValue({ error: null }),
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

const originalOS = Platform.OS;
afterEach(() => {
  (Platform as { OS: string }).OS = originalOS;
  jest.clearAllMocks();
});

describe("signInWithGoogle（Web）", () => {
  it("Supabase のフルリダイレクトに任せ、ブラウザは自前で開かない", async () => {
    (Platform as { OS: string }).OS = "web";
    const auth = installAuthMock();

    await signInWithGoogle();

    expect(auth.signInWithOAuth).toHaveBeenCalledWith({
      provider: "google",
      options: { redirectTo: "habittracker:///" },
    });
    expect(mockedOpenAuth).not.toHaveBeenCalled();
  });
});

describe("signInWithGoogle（ネイティブ）", () => {
  it("ブラウザを開き、戻り URL の code をセッションに引き換える", async () => {
    (Platform as { OS: string }).OS = "ios";
    const auth = installAuthMock();
    mockedOpenAuth.mockResolvedValue({
      type: "success",
      url: "habittracker:///?code=auth-code-123",
    });

    await signInWithGoogle();

    // skipBrowserRedirect で URL だけ受け取る。
    expect(auth.signInWithOAuth).toHaveBeenCalledWith({
      provider: "google",
      options: { redirectTo: "habittracker:///", skipBrowserRedirect: true },
    });
    // 受け取った URL でブラウザを開く。
    expect(mockedOpenAuth).toHaveBeenCalledWith(
      "https://google.example/auth",
      "habittracker:///"
    );
    // code をセッションに交換する。
    expect(auth.exchangeCodeForSession).toHaveBeenCalledWith("auth-code-123");
  });

  it("ユーザーがキャンセルしたら交換しない", async () => {
    (Platform as { OS: string }).OS = "ios";
    const auth = installAuthMock();
    mockedOpenAuth.mockResolvedValue({ type: "cancel" });

    await signInWithGoogle();

    expect(auth.exchangeCodeForSession).not.toHaveBeenCalled();
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
    const unsubscribe = onAuthStateChange(jest.fn());

    expect(auth.onAuthStateChange).toHaveBeenCalledTimes(1);

    const subscription = auth.onAuthStateChange.mock.results[0].value.data
      .subscription as { unsubscribe: jest.Mock };
    unsubscribe();
    expect(subscription.unsubscribe).toHaveBeenCalledTimes(1);
  });
});
