import { useState } from "react";
import { useLocalSearchParams, Stack } from "expo-router";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useHabits } from "../../hooks/useHabits";
import { monthMatrix, shiftMonth } from "../../lib/calendar";
import { todayKey } from "../../lib/completion";

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

export default function HabitDetail() {
  // URL の動的セグメント [id] を受け取る。
  const { id } = useLocalSearchParams<{ id: string }>();
  const { habits, isDoneOn, renameHabit } = useHabits();
  const habit = habits.find((h) => h.id === id);

  // 表示中の年月。初期値は今月。
  const now = new Date();
  const [ym, setYm] = useState({
    year: now.getFullYear(),
    month: now.getMonth() + 1,
  });

  // 名前編集の入力値。null の間は閲覧状態（編集していない）。
  const [editName, setEditName] = useState<string | null>(null);

  // 習慣が見つからない（削除直後など）場合のガード。
  if (!habit) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: "詳細" }} />
        <Text style={styles.missing}>習慣が見つからないのだ。</Text>
      </View>
    );
  }

  const weeks = monthMatrix(ym.year, ym.month);
  const today = todayKey();

  return (
    <View style={styles.container}>
      {/* ヘッダのタイトルを習慣名にする */}
      <Stack.Screen options={{ title: habit.name }} />

      {/* 名前編集セクション。editName が null なら閲覧、文字列なら編集中。 */}
      {editName === null ? (
        <View style={styles.nameRow}>
          <Text style={styles.nameText}>{habit.name}</Text>
          <Pressable hitSlop={8} onPress={() => setEditName(habit.name)}>
            <Text style={styles.editLink}>編集</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.editRow}>
          <TextInput
            style={styles.nameInput}
            value={editName}
            onChangeText={setEditName}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={() => {
              renameHabit(habit.id, editName);
              setEditName(null);
            }}
          />
          <Pressable
            style={[styles.editButton, styles.saveButton]}
            onPress={() => {
              renameHabit(habit.id, editName);
              setEditName(null);
            }}
          >
            <Text style={styles.saveText}>保存</Text>
          </Pressable>
          <Pressable
            style={[styles.editButton, styles.cancelButton]}
            onPress={() => setEditName(null)}
          >
            <Text style={styles.cancelText}>取消</Text>
          </Pressable>
        </View>
      )}

      {/* 月送りヘッダ */}
      <View style={styles.monthHeader}>
        <Pressable
          hitSlop={8}
          onPress={() => setYm((p) => shiftMonth(p.year, p.month, -1))}
        >
          <Text style={styles.navArrow}>‹</Text>
        </Pressable>
        <Text style={styles.monthLabel}>
          {ym.year}年 {ym.month}月
        </Text>
        <Pressable
          hitSlop={8}
          onPress={() => setYm((p) => shiftMonth(p.year, p.month, 1))}
        >
          <Text style={styles.navArrow}>›</Text>
        </Pressable>
      </View>

      {/* 曜日見出し */}
      <View style={styles.weekRow}>
        {WEEKDAYS.map((w) => (
          <Text key={w} style={styles.weekday}>
            {w}
          </Text>
        ))}
      </View>

      {/* 月グリッド */}
      {weeks.map((week, wi) => (
        <View key={wi} style={styles.weekRow}>
          {week.map((cell, ci) => {
            if (!cell) return <View key={ci} style={styles.cell} />;
            const done = isDoneOn(habit, cell.key);
            const isToday = cell.key === today;
            return (
              <View key={ci} style={styles.cell}>
                <View
                  style={[
                    styles.dayCircle,
                    done && styles.dayDone,
                    isToday && styles.dayToday,
                  ]}
                >
                  <Text style={[styles.dayText, done && styles.dayTextDone]}>
                    {cell.day}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    gap: 10,
  },
  missing: {
    fontSize: 16,
    color: "#888",
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  nameText: {
    fontSize: 22,
    fontWeight: "700",
    flex: 1,
  },
  editLink: {
    fontSize: 15,
    fontWeight: "700",
    color: "#208AEF",
    paddingHorizontal: 8,
  },
  editRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  nameInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 17,
  },
  editButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  saveButton: {
    backgroundColor: "#208AEF",
  },
  saveText: {
    color: "#fff",
    fontWeight: "700",
  },
  cancelButton: {
    backgroundColor: "#eee",
  },
  cancelText: {
    color: "#333",
    fontWeight: "700",
  },
  monthHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
  },
  navArrow: {
    fontSize: 28,
    color: "#208AEF",
    fontWeight: "700",
    paddingHorizontal: 12,
  },
  monthLabel: {
    fontSize: 18,
    fontWeight: "700",
  },
  weekRow: {
    flexDirection: "row",
  },
  weekday: {
    flex: 1,
    textAlign: "center",
    color: "#888",
    fontSize: 13,
    paddingVertical: 4,
  },
  cell: {
    flex: 1,
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  dayCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: "center",
    alignItems: "center",
  },
  dayDone: {
    backgroundColor: "#208AEF",
  },
  dayToday: {
    borderWidth: 2,
    borderColor: "#E8742C",
  },
  dayText: {
    fontSize: 15,
    color: "#333",
  },
  dayTextDone: {
    color: "#fff",
    fontWeight: "700",
  },
});
