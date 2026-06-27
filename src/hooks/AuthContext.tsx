import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session } from "@supabase/supabase-js";
import {
  getCurrentSession,
  onAuthStateChange,
  signInWithGoogle,
  signOut as authSignOut,
} from "../lib/auth";
import { isSupabaseConfigured } from "../lib/supabase";

// アプリ全体で「今ログインしているか」を共有する Context。
// 認証ロジックは auth.ts（= Supabase の裏隠し）に委ね、ここは「状態の保持と購読」だけ担う。

type AuthApi = {
  // Supabase の接続設定が無ければ false。未設定時は認証を使わずローカル動作。
  configured: boolean;
  // 現在のセッション。未ログインなら null。
  session: Session | null;
  // 初回のセッション復元が終わるまで true。
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthApi | null>(null);

function useAuthState(): AuthApi {
  const configured = isSupabaseConfigured();
  const [session, setSession] = useState<Session | null>(null);
  // 未設定なら読み込むものが無いので、最初から loading=false。
  const [loading, setLoading] = useState(configured);

  useEffect(() => {
    // 未設定時は Supabase に一切触れない（getSupabase は env が無いと throw するため）。
    if (!configured) return;

    // 起動時に保存済みセッションを復元。
    getCurrentSession().then((s) => {
      setSession(s);
      setLoading(false);
    });

    // 以後のログイン/ログアウト/トークン更新を購読。返り値で購読解除（後片付け）。
    const unsubscribe = onAuthStateChange((s) => setSession(s));
    return unsubscribe;
  }, [configured]);

  return useMemo<AuthApi>(
    () => ({
      configured,
      session,
      loading,
      signIn: async () => {
        await signInWithGoogle();
      },
      signOut: async () => {
        await authSignOut();
      },
    }),
    [configured, session, loading]
  );
}

// _layout でアプリ全体を包む。配下の全画面が useAuth() で同じ認証状態を見る。
export function AuthProvider({ children }: { children: ReactNode }) {
  const value = useAuthState();
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthApi {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth は AuthProvider の内側で使うのだ");
  }
  return ctx;
}
