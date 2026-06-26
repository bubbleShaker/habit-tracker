// 習慣1件を表す型。永続化(Issue #3)でもこの型をそのまま使う。
export type Habit = {
  id: string;
  name: string;
  createdAt: number; // UNIXミリ秒。並び替えや表示に使う
};
