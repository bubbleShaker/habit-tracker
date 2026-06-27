import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../hooks/AuthContext";

// 未ログイン時に出す画面。Google ログインを開始するだけのシンプルな画面。
// 実際の認証処理は useAuth().signIn()（= auth.ts → Supabase）に委ねる。
export default function LoginScreen() {
  const { signIn } = useAuth();
  // 二重タップ防止＆失敗表示用の状態。
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onPress = async () => {
    setBusy(true);
    setError(null);
    try {
      await signIn();
    } catch {
      setError("ログインに失敗したのだ。もう一度試すのだ。");
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>習慣トラッカー</Text>
      <Text style={styles.subtitle}>
        ログインすると複数の端末で習慣を同期できるのだ。
      </Text>

      <Pressable
        style={[styles.button, busy && styles.buttonDisabled]}
        onPress={onPress}
        disabled={busy}
      >
        <Text style={styles.buttonText}>
          {busy ? "ログイン中..." : "Google でログイン"}
        </Text>
      </Pressable>

      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    gap: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
  },
  button: {
    backgroundColor: "#208AEF",
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  error: {
    color: "#E23B3B",
    fontSize: 14,
  },
});
