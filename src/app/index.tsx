import { useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useHabits } from "../hooks/useHabits";

export default function Index() {
  // 状態ロジックはフックに隔離。UIは入力値だけ自前で持つ。
  const {
    habits,
    addHabit,
    toggleToday,
    isCompletedToday,
    streakOf,
    longestStreakOf,
    removeHabit,
  } = useHabits();
  const [input, setInput] = useState("");

  const onAdd = () => {
    addHabit(input);
    setInput("");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>習慣トラッカー</Text>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="新しい習慣を入力"
          value={input}
          onChangeText={setInput}
          onSubmitEditing={onAdd}
          returnKeyType="done"
        />
        <Pressable style={styles.addButton} onPress={onAdd}>
          <Text style={styles.addButtonText}>追加</Text>
        </Pressable>
      </View>

      <FlatList
        style={styles.list}
        data={habits}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={styles.empty}>まだ習慣がないのだ。上から追加するのだ。</Text>
        }
        renderItem={({ item }) => {
          const done = isCompletedToday(item);
          const streak = streakOf(item);
          const longest = longestStreakOf(item);
          return (
            <Pressable style={styles.row} onPress={() => toggleToday(item.id)}>
              {/* 丸チェック: 完了で塗りつぶし＋中に ✓ */}
              <View style={[styles.check, done && styles.checkDone]}>
                {done && <Text style={styles.checkMark}>✓</Text>}
              </View>
              {/* 名前とメタ情報を縦に積む。flex:1 で右の削除ボタンを端へ寄せる */}
              <View style={styles.rowMain}>
                <Text style={[styles.rowText, done && styles.rowTextDone]}>
                  {item.name}
                </Text>
                {(streak > 0 || longest > 0) && (
                  <View style={styles.metaRow}>
                    {streak > 0 && (
                      <Text style={styles.streak}>🔥 {streak}日</Text>
                    )}
                    {longest > 0 && (
                      <Text style={styles.longest}>🏆 最長{longest}日</Text>
                    )}
                  </View>
                )}
              </View>
              {/* 削除ボタン。行トグルと衝突しないよう独立した Pressable にする */}
              <Pressable
                style={styles.deleteButton}
                hitSlop={8}
                onPress={() => removeHabit(item.id)}
              >
                <Text style={styles.deleteText}>✕</Text>
              </Pressable>
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 64,
    paddingHorizontal: 20,
    gap: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
  },
  inputRow: {
    flexDirection: "row",
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  addButton: {
    backgroundColor: "#208AEF",
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  list: {
    flex: 1,
  },
  empty: {
    color: "#888",
    fontSize: 15,
    marginTop: 24,
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  check: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: "#208AEF",
    justifyContent: "center",
    alignItems: "center",
  },
  checkDone: {
    backgroundColor: "#208AEF",
  },
  checkMark: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  rowMain: {
    flex: 1, // 名前列を伸ばし、右の削除ボタンを端へ押しやる
    gap: 2,
  },
  rowText: {
    fontSize: 17,
  },
  rowTextDone: {
    textDecorationLine: "line-through",
    color: "#aaa",
  },
  metaRow: {
    flexDirection: "row",
    gap: 10,
  },
  streak: {
    fontSize: 13,
    fontWeight: "700",
    color: "#E8742C",
  },
  longest: {
    fontSize: 13,
    fontWeight: "700",
    color: "#C9A227",
  },
  deleteButton: {
    width: 28,
    height: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteText: {
    fontSize: 18,
    color: "#ccc",
  },
});
