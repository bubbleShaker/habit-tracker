import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Habit } from "../types/habit";
import { loadHabits, saveHabits } from "../storage/habitStorage";
import {
  currentStreak,
  isCompletedOn,
  lastNDays,
  longestStreak,
  todayKey,
  toggleCompletion,
} from "../lib/completion";

// 複数画面（一覧・詳細）で同じ習慣データを共有するため、状態を Context に持ち上げる。
// 各画面が useHabits() を呼んでも、参照するのは Provider が持つ唯一の state になる。

// Context が公開する API の型。
type HabitsApi = {
  habits: Habit[];
  loaded: boolean;
  addHabit: (name: string) => void;
  toggleToday: (id: string) => void;
  isCompletedToday: (habit: Habit) => boolean;
  streakOf: (habit: Habit) => number;
  longestStreakOf: (habit: Habit) => number;
  recentHistory: (habit: Habit, n?: number) => boolean[];
  isDoneOn: (habit: Habit, dateKey: string) => boolean;
  renameHabit: (id: string, name: string) => void;
  removeHabit: (id: string) => void;
};

const HabitsContext = createContext<HabitsApi | null>(null);

// 状態と操作の実体。元 useHabits の中身をそのまま Provider 内へ移した。
function useHabitsState(): HabitsApi {
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

  // habits が変わるたびに保存する。初回ロード完了前は走らせない
  // （ロード前の初期値[]で保存すると既存データを消すため）。
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
      completedDates: [],
    };
    setHabits((prev) => [habit, ...prev]); // 新しいものを先頭に
  }, []);

  // 指定 id の習慣の「今日完了」をトグルする。
  const toggleToday = useCallback((id: string) => {
    const key = todayKey();
    setHabits((prev) =>
      prev.map((h) => (h.id === id ? toggleCompletion(h, key) : h))
    );
  }, []);

  // UI が日付計算を知らずに「今日やったか」を問い合わせるためのヘルパ。
  const isCompletedToday = useCallback(
    (habit: Habit) => isCompletedOn(habit, todayKey()),
    []
  );

  // 現在の連続達成日数。
  const streakOf = useCallback(
    (habit: Habit) => currentStreak(habit, todayKey()),
    []
  );

  // 全期間を通じての最長連続達成日数。
  const longestStreakOf = useCallback(
    (habit: Habit) => longestStreak(habit),
    []
  );

  // 直近 n 日の達成可否を古い順（左=過去, 右=今日）で返す。
  const recentHistory = useCallback(
    (habit: Habit, n: number = 7): boolean[] =>
      lastNDays(todayKey(), n).map((d) => isCompletedOn(habit, d)),
    []
  );

  // 任意の日付について達成済みか（カレンダー塗り分け用）。
  const isDoneOn = useCallback(
    (habit: Habit, dateKey: string) => isCompletedOn(habit, dateKey),
    []
  );

  // 習慣の名前を変更する。空文字や空白のみは無視する（追加時と同じ方針）。
  const renameHabit = useCallback((id: string, name: string) => {
    const trimmed = name.trim();
    if (trimmed.length === 0) return;
    setHabits((prev) =>
      prev.map((h) => (h.id === id ? { ...h, name: trimmed } : h))
    );
  }, []);

  // 習慣を削除する。
  const removeHabit = useCallback((id: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== id));
  }, []);

  // 関数群は useCallback で安定だが、habits/loaded の変化で再生成する。
  return useMemo(
    () => ({
      habits,
      loaded,
      addHabit,
      toggleToday,
      isCompletedToday,
      streakOf,
      longestStreakOf,
      recentHistory,
      isDoneOn,
      renameHabit,
      removeHabit,
    }),
    [
      habits,
      loaded,
      addHabit,
      toggleToday,
      isCompletedToday,
      streakOf,
      longestStreakOf,
      recentHistory,
      isDoneOn,
      renameHabit,
      removeHabit,
    ]
  );
}

// アプリ全体（_layout）をこれで包むと、配下の全画面で状態が共有される。
export function HabitsProvider({ children }: { children: ReactNode }) {
  const value = useHabitsState();
  return (
    <HabitsContext.Provider value={value}>{children}</HabitsContext.Provider>
  );
}

// 各画面はこれを呼ぶ。Provider の外で呼ぶと設定ミスなので明示的に落とす。
export function useHabits(): HabitsApi {
  const ctx = useContext(HabitsContext);
  if (!ctx) {
    throw new Error("useHabits は HabitsProvider の内側で使うのだ");
  }
  return ctx;
}
