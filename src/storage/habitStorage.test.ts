import AsyncStorage from "@react-native-async-storage/async-storage";
import { Habit } from "../types/habit";
import { loadHabits, saveHabits } from "./habitStorage";

const sample: Habit = {
  id: "1",
  name: "ランニング",
  createdAt: 1000,
  completedDates: ["2026-06-26"],
};

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe("habitStorage", () => {
  it("未保存なら空配列を返す", async () => {
    expect(await loadHabits()).toEqual([]);
  });

  it("保存した習慣を読み戻せる（往復）", async () => {
    await saveHabits([sample]);
    expect(await loadHabits()).toEqual([sample]);
  });

  it("壊れたJSONなら空配列で安全側に倒す", async () => {
    await AsyncStorage.setItem("habits", "{壊れた");
    expect(await loadHabits()).toEqual([]);
  });

  it("配列でない値が入っていたら空配列を返す", async () => {
    await AsyncStorage.setItem("habits", JSON.stringify({ not: "array" }));
    expect(await loadHabits()).toEqual([]);
  });

  it("旧データ(completedDates 無し)は空配列で補って読む（後方互換）", async () => {
    const legacy = { id: "9", name: "瞑想", createdAt: 500 };
    await AsyncStorage.setItem("habits", JSON.stringify([legacy]));
    expect(await loadHabits()).toEqual([{ ...legacy, completedDates: [] }]);
  });
});
