import { Habit } from "../types/habit";
import {
  isCompletedOn,
  toDateKey,
  todayKey,
  toggleCompletion,
} from "./completion";

const base: Habit = {
  id: "1",
  name: "ランニング",
  createdAt: 0,
  completedDates: [],
};

describe("toDateKey", () => {
  it("ローカルの年月日をゼロ埋めで返す", () => {
    // 2026-01-05 09:00 ローカル
    expect(toDateKey(new Date(2026, 0, 5, 9, 0))).toBe("2026-01-05");
  });

  it("UTCずれで前日にならない（深夜でもローカル日付）", () => {
    // ローカル 2026-06-26 00:30。toISOString だと UTC で 6/25 になりうる
    expect(toDateKey(new Date(2026, 5, 26, 0, 30))).toBe("2026-06-26");
  });
});

describe("todayKey", () => {
  it("渡した now をキー化する", () => {
    expect(todayKey(new Date(2026, 11, 31, 23, 59))).toBe("2026-12-31");
  });
});

describe("isCompletedOn", () => {
  it("完了日に含まれれば true", () => {
    const h = { ...base, completedDates: ["2026-06-26"] };
    expect(isCompletedOn(h, "2026-06-26")).toBe(true);
  });
  it("含まれなければ false", () => {
    expect(isCompletedOn(base, "2026-06-26")).toBe(false);
  });
});

describe("toggleCompletion", () => {
  it("未完了→完了で日付を追加する", () => {
    const h = toggleCompletion(base, "2026-06-26");
    expect(h.completedDates).toEqual(["2026-06-26"]);
  });

  it("完了→未完了で日付を取り除く", () => {
    const h = { ...base, completedDates: ["2026-06-26"] };
    const toggled = toggleCompletion(h, "2026-06-26");
    expect(toggled.completedDates).toEqual([]);
  });

  it("元のオブジェクトを変更しない（不変更新）", () => {
    toggleCompletion(base, "2026-06-26");
    expect(base.completedDates).toEqual([]);
  });

  it("他の日の完了は保持する", () => {
    const h = { ...base, completedDates: ["2026-06-25"] };
    const toggled = toggleCompletion(h, "2026-06-26");
    expect(toggled.completedDates).toEqual(["2026-06-25", "2026-06-26"]);
  });
});
