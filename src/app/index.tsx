import { useState } from "react";
import { useRouter } from "expo-router";
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useHabits } from "../hooks/useHabits";
import { Habit } from "../types/habit";

export default function Index() {
  // 状態ロジックはフックに隔離。UIは入力値だけ自前で持つ。
  const {
    habits,
    addHabit,
    toggleToday,
    isCompletedToday,
    streakOf,
    longestStreakOf,
    recentHistory,
    removeHabit,
  } = useHabits();
  const router = useRouter();
  const [input, setInput] = useState("");
  // 削除確認の対象。null ならダイアログ非表示。
  const [pendingDelete, setPendingDelete] = useState<Habit | null>(null);

  const onAdd = () => {
    addHabit(input);
    setInput("");
  };

  // 削除を確定する。対象を消してダイアログを閉じる。
  const confirmDelete = () => {
    if (pendingDelete) removeHabit(pendingDelete.id);
    setPendingDelete(null);
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
          const history = recentHistory(item); // 直近7日 古い順
          return (
            <Pressable
              style={styles.row}
              onPress={() =>
                router.push({ pathname: "/habit/[id]", params: { id: item.id } })
              }
            >
              {/* 丸チェック: タップで今日トグル。行の遷移とは独立した Pressable。 */}
              <Pressable
                hitSlop={8}
                onPress={() => toggleToday(item.id)}
                style={[styles.check, done && styles.checkDone]}
              >
                {done && <Text style={styles.checkMark}>✓</Text>}
              </Pressable>
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
                {/* 直近7日の達成ドット（左=6日前 … 右=今日） */}
                <View style={styles.dotsRow}>
                  {history.map((d, i) => (
                    <View
                      key={i}
                      style={[styles.dot, d ? styles.dotDone : styles.dotMiss]}
                    />
                  ))}
                </View>
              </View>
              {/* 削除ボタン。行トグルと衝突しないよう独立した Pressable にする */}
              <Pressable
                style={styles.deleteButton}
                hitSlop={8}
                onPress={() => setPendingDelete(item)}
              >
                <Text style={styles.deleteText}>✕</Text>
              </Pressable>
            </Pressable>
          );
        }}
      />

      {/* 削除確認ダイアログ。pendingDelete があるときだけ表示する。 */}
      <Modal
        visible={pendingDelete !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setPendingDelete(null)}
      >
        {/* 背景の暗幕。タップでキャンセル扱いにする。 */}
        <Pressable style={styles.backdrop} onPress={() => setPendingDelete(null)}>
          {/* カード本体。ここをタップしても閉じないよう伝播を遮断する。 */}
          <Pressable style={styles.dialog} onPress={() => {}}>
            <Text style={styles.dialogTitle}>習慣を削除する？</Text>
            <Text style={styles.dialogBody}>
              「{pendingDelete?.name}」を削除するのだ。元に戻せないのだ。
            </Text>
            <View style={styles.dialogButtons}>
              <Pressable
                style={[styles.dialogButton, styles.cancelButton]}
                onPress={() => setPendingDelete(null)}
              >
                <Text style={styles.cancelText}>キャンセル</Text>
              </Pressable>
              <Pressable
                style={[styles.dialogButton, styles.confirmButton]}
                onPress={confirmDelete}
              >
                <Text style={styles.confirmText}>削除</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
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
  dotsRow: {
    flexDirection: "row",
    gap: 5,
    marginTop: 4,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  dotDone: {
    backgroundColor: "#208AEF",
  },
  dotMiss: {
    backgroundColor: "#e3e3e3",
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
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  dialog: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 20,
    gap: 12,
  },
  dialogTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  dialogBody: {
    fontSize: 15,
    color: "#555",
  },
  dialogButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: 4,
  },
  dialogButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
  },
  cancelButton: {
    backgroundColor: "#eee",
  },
  cancelText: {
    fontWeight: "700",
    color: "#333",
  },
  confirmButton: {
    backgroundColor: "#E23B3B",
  },
  confirmText: {
    fontWeight: "700",
    color: "#fff",
  },
});
