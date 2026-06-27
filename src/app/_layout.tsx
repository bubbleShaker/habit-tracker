import { Stack } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { HabitsProvider } from "../hooks/HabitsContext";
import { AuthProvider, useAuth } from "../hooks/AuthContext";
import LoginScreen from "../components/LoginScreen";

// 認証状態でアプリ本体／ログイン画面を出し分けるゲート。
function AuthGate({ children }: { children: React.ReactNode }) {
  const { configured, session, loading } = useAuth();

  // Supabase 未設定なら認証を使わず、従来どおりローカルでそのまま動かす。
  if (!configured) return <>{children}</>;

  // セッション復元中はスピナー。
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  // 設定済みかつ未ログインならログイン画面へ誘導。
  if (!session) return <LoginScreen />;

  return <>{children}</>;
}

export default function RootLayout() {
  // AuthProvider を最外に置き、ゲートの内側でだけ習慣データを読み込む。
  return (
    <AuthProvider>
      <AuthGate>
        <HabitsProvider>
          <Stack>
            <Stack.Screen name="index" options={{ title: "習慣トラッカー" }} />
          </Stack>
        </HabitsProvider>
      </AuthGate>
    </AuthProvider>
  );
}
