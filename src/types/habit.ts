// 習慣1件を表す型。永続化(Issue #3)でもこの型をそのまま使う。
export type Habit = {
  id: string;
  name: string;
  createdAt: number; // UNIXミリ秒。並び替えや表示に使う
  // 完了した日の集合（"YYYY-MM-DD" 形式）。
  // 日付文字列で持つことで「同じ日か」の比較を単純化する。
  completedDates: string[];
};
