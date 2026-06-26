import { useCallback, useState } from "react";
import { Habit } from "../types/habit";

// 習慣リストの状態ロジックを隔離した custom hook。
// UI(index.tsx)は「どう保存されるか」を知らない。
// Issue #3 ではこのフック内部だけを AsyncStorage に差し替える想定。
export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>([]);

  // 習慣を追加する。空文字や空白のみは無視する。
  const addHabit = useCallback((name: string) => {
    const trimmed = name.trim();
    if (trimmed.length === 0) return;

    const habit: Habit = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: trimmed,
      createdAt: Date.now(),
    };
    setHabits((prev) => [habit, ...prev]); // 新しいものを先頭に
  }, []);

  return { habits, addHabit };
}
