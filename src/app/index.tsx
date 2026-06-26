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
  const { habits, addHabit } = useHabits();
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
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.rowText}>{item.name}</Text>
          </View>
        )}
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
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  rowText: {
    fontSize: 17,
  },
});
