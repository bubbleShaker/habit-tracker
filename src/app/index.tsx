import { Text, View, StyleSheet } from "react-native";

// 第1弾(Issue #1)はプレースホルダ画面のみ。
// 習慣リストの状態管理・AsyncStorage 永続化は後続 Issue で実装する。
export default function Index() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>習慣トラッカー</Text>
      <Text style={styles.subtitle}>セットアップ完了！ここに習慣リストを実装していくのだ。</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 12,
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
});
