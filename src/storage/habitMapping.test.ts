import { rowsToHabits, habitsToRows } from "./habitMapping";
import { Habit } from "../types/habit";

const T1 = "2026-06-01T00:00:00.000Z";
const T2 = "2026-06-02T00:00:00.000Z";

describe("rowsToHabits", () => {
  it("habits 行と completions 行を Habit[] に組み立てる（sort_order 昇順）", () => {
    const habitRows = [
      { id: "a2", name: "読書", created_at: T2, sort_order: 1 },
      { id: "a1", name: "筋トレ", created_at: T1, sort_order: 0 },
    ];
    const completionRows = [
      { habit_id: "a1", date_key: "2026-06-26" },
      { habit_id: "a1", date_key: "2026-06-25" },
      { habit_id: "a2", date_key: "2026-06-26" },
    ];
    expect(rowsToHabits(habitRows, completionRows)).toEqual([
      {
        id: "a1",
        name: "筋トレ",
        createdAt: Date.parse(T1),
        completedDates: ["2026-06-25", "2026-06-26"], // 昇順に揃える
      },
      {
        id: "a2",
        name: "読書",
        createdAt: Date.parse(T2),
        completedDates: ["2026-06-26"],
      },
    ]);
  });

  it("completions が無い習慣は completedDates 空", () => {
    expect(
      rowsToHabits([{ id: "a1", name: "x", created_at: T1, sort_order: 0 }], [])
    ).toEqual([
      { id: "a1", name: "x", createdAt: Date.parse(T1), completedDates: [] },
    ]);
  });
});

describe("habitsToRows", () => {
  it("Habit[] を habits 行と completions 行に分解する（index=sort_order）", () => {
    const habits: Habit[] = [
      {
        id: "a1",
        name: "筋トレ",
        createdAt: Date.parse(T1),
        completedDates: ["2026-06-25"],
      },
      { id: "a2", name: "読書", createdAt: Date.parse(T2), completedDates: [] },
    ];
    const { habitRows, completionRows } = habitsToRows(habits);
    expect(habitRows).toEqual([
      { id: "a1", name: "筋トレ", created_at: T1, sort_order: 0 },
      { id: "a2", name: "読書", created_at: T2, sort_order: 1 },
    ]);
    expect(completionRows).toEqual([{ habit_id: "a1", date_key: "2026-06-25" }]);
  });

  it("rowsToHabits と往復しても保たれる", () => {
    const habits: Habit[] = [
      {
        id: "a1",
        name: "筋トレ",
        createdAt: Date.parse(T1),
        completedDates: ["2026-06-25", "2026-06-26"],
      },
    ];
    const { habitRows, completionRows } = habitsToRows(habits);
    expect(rowsToHabits(habitRows, completionRows)).toEqual(habits);
  });
});
