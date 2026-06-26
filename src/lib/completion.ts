import { Habit } from "../types/habit";

// 完了判定・トグルのロジックを純粋関数として隔離する。
// React も AsyncStorage も知らないので、ロジックだけを高速にテストできる。

// 日付を端末ローカルの "YYYY-MM-DD" 文字列に変換する。
// toISOString() は UTC に変換してしまい日付がズレるため使わない。
// （例: JST 6/26 朝は UTC ではまだ 6/25。ローカルの年月日をそのまま組む。）
export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// 今日のキー。引数で「現在時刻」を差し込めるようにしてテスト可能にする。
export function todayKey(now: Date = new Date()): string {
  return toDateKey(now);
}

// その habit が指定日に完了済みか。
export function isCompletedOn(habit: Habit, dateKey: string): boolean {
  return habit.completedDates.includes(dateKey);
}

// 指定日の完了をトグルした「新しい habit」を返す（元は変更しない / 不変更新）。
// 未完了→完了なら日付を追加、完了→未完了なら取り除く。
export function toggleCompletion(habit: Habit, dateKey: string): Habit {
  const done = isCompletedOn(habit, dateKey);
  const completedDates = done
    ? habit.completedDates.filter((d) => d !== dateKey)
    : [...habit.completedDates, dateKey];
  return { ...habit, completedDates };
}

// 指定日の「前日」のキーを返す。
// Date に通すことで月またぎ・うるう年・年またぎを正しく処理する
// （"2026-03-01" の前日は "2026-02-28"、うるう年なら "02-29"）。
export function previousDateKey(dateKey: string): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  // 月は 0 始まりなので m - 1。日に -1 して Date に正規化させる。
  const date = new Date(y, m - 1, d - 1);
  return toDateKey(date);
}

// 今日を起点とした「現在の連続達成日数」を返す。
// - 今日が完了済みなら today から遡って数える。
// - 今日が未完了なら yesterday から数える
//   （その日が終わるまでは昨日までの連続を維持して見せるため）。
// どちらの起点からも、完了日が途切れるまで前日へ遡り続ける。
export function currentStreak(habit: Habit, todayKey: string): number {
  // 起点の決定。今日やっていなければ昨日を起点にする。
  let cursor = isCompletedOn(habit, todayKey)
    ? todayKey
    : previousDateKey(todayKey);

  let streak = 0;
  while (isCompletedOn(habit, cursor)) {
    streak += 1;
    cursor = previousDateKey(cursor);
  }
  return streak;
}
