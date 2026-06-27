import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../hooks/AuthContext";

// 設定画面。今はアカウント情報とサインアウトのみ。
// （アカウント削除は Epic II でここに追加する予定の置き場）
export default function Settings() {
  const { session, signOut } = useAuth();
  const [busy, setBusy] = useState(false);

  const email = session?.user?.email ?? "（不明）";

  const onSignOut = async () => {
    setBusy(true);
    try {
      // サインアウトすると onAuthStateChange 経由で AuthGate が
      // セッション無しを検知し、自動でログイン画面に戻る。
      await signOut();
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.label}>ログイン中</Text>
        <Text style={styles.value}>{email}</Text>
      </View>

      <Pressable
        style={[styles.signOut, busy && styles.disabled]}
        onPress={onSignOut}
        disabled={busy}
      >
        <Text style={styles.signOutText}>
          {busy ? "サインアウト中..." : "サインアウト"}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    gap: 24,
  },
  section: {
    gap: 4,
  },
  label: {
    fontSize: 13,
    color: "#888",
  },
  value: {
    fontSize: 17,
    fontWeight: "600",
  },
  signOut: {
    backgroundColor: "#E23B3B",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
  },
  disabled: {
    opacity: 0.6,
  },
  signOutText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});
