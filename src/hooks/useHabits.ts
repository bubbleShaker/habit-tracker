import { useCallback, useEffect, useState } from "react";
import { Habit } from "../types/habit";
import { loadHabits, saveHabits } from "../storage/habitStorage";

// 習慣リストの状態ロジックを隔離した custom hook。
// UI(index.tsx)は「どう保存されるか」を知らない。永続化は storage 層に委譲する。
export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>([]);
  // 初回ロードが終わったかのフラグ。ロード前の保存(空配列での上書き)を防ぐ。
  const [loaded, setLoaded] = useState(false);

  // mount 時に保存済みの習慣を読み込む。
  useEffect(() => {
    loadHabits().then((stored) => {
      setHabits(stored);
      setLoaded(true);
    });
  }, []);

  // habits が変わるたびに保存する。
  // ただし初回ロード完了前(loaded=false)は走らせない。
  // ── そうしないと、ロード前の初期値[]で保存され、既存データを消してしまう。
  useEffect(() => {
    if (!loaded) return;
    saveHabits(habits);
  }, [habits, loaded]);

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

  // loaded も返す。UI 側で「読込中」表示に使える（今回は任意利用）。
  return { habits, addHabit, loaded };
}
