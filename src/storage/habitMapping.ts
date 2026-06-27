import { Habit } from "../types/habit";

// DB の行と、アプリの Habit 型を相互変換する純粋関数。
// I/O（Supabase 呼び出し）から切り離すことで、ここだけを単体テストで固められる。

export type HabitRow = {
  id: string;
  name: string;
  created_at: string; // timestamptz の ISO 文字列
  sort_order: number;
};

export type CompletionRow = {
  habit_id: string;
  date_key: string; // "YYYY-MM-DD"
};

/** DB の habits 行＋completions 行を、アプリの Habit[] に組み立てる。 */
export function rowsToHabits(
  habitRows: HabitRow[],
  completionRows: CompletionRow[]
): Habit[] {
  // habit_id ごとに達成日を集める。
  const datesByHabit = new Map<string, string[]>();
  for (const c of completionRows) {
    const arr = datesByHabit.get(c.habit_id) ?? [];
    arr.push(c.date_key);
    datesByHabit.set(c.habit_id, arr);
  }

  return [...habitRows]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((h) => ({
      id: h.id,
      name: h.name,
      createdAt: Date.parse(h.created_at),
      // 表示の安定のため昇順に揃える。
      completedDates: (datesByHabit.get(h.id) ?? []).slice().sort(),
    }));
}

/** アプリの Habit[] を、DB に書き込む habits 行＋completions 行へ分解する。 */
export function habitsToRows(habits: Habit[]): {
  habitRows: HabitRow[];
  completionRows: CompletionRow[];
} {
  const habitRows: HabitRow[] = habits.map((h, i) => ({
    id: h.id,
    name: h.name,
    created_at: new Date(h.createdAt).toISOString(),
    sort_order: i, // 配列の並び順をそのまま保存
  }));

  const completionRows: CompletionRow[] = habits.flatMap((h) =>
    h.completedDates.map((d) => ({ habit_id: h.id, date_key: d }))
  );

  return { habitRows, completionRows };
}
