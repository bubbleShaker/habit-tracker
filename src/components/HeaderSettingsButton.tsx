import { useRouter } from "expo-router";
import { Pressable, Text } from "react-native";
import { useAuth } from "../hooks/AuthContext";

// 一覧画面ヘッダー右の「設定」ボタン。ログイン中のみ表示する
// （未ログイン/ローカル動作時はサインアウトする相手がいないので出さない）。
export default function HeaderSettingsButton() {
  const router = useRouter();
  const { session } = useAuth();

  if (!session) return null;

  return (
    <Pressable hitSlop={8} onPress={() => router.push("/settings")}>
      <Text style={{ fontSize: 22 }}>⚙️</Text>
    </Pressable>
  );
}
