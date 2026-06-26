import { useState } from "react";
import { useLocalSearchParams, Stack } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useHabits } from "../../hooks/useHabits";
import { monthMatrix, shiftMonth } from "../../lib/calendar";
import { todayKey } from "../../lib/completion";

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

export default function HabitDetail() {
  // URL の動的セグメント [id] を受け取る。
  const { id } = useLocalSearchParams<{ id: string }>();
  const { habits, isDoneOn } = useHabits();
  const habit = habits.find((h) => h.id === id);

  // 表示中の年月。初期値は今月。
  const now = new Date();
  const [ym, setYm] = useState({
    year: now.getFullYear(),
    month: now.getMonth() + 1,
  });

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
