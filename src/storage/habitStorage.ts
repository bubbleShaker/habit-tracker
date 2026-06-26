import AsyncStorage from "@react-native-async-storage/async-storage";
import { Habit } from "../types/habit";

// 永続化層: AsyncStorage への読み書きをこのファイルに隔離する。
// UI やフックは「どこに保存されるか」を知らずに済む（依存方向を内向きに保つ）。
const STORAGE_KEY = "habits";

// 保存済みの習慣を読み込む。
// 未保存・壊れたデータ・例外は、いずれも空配列を返して安全側に倒す
// （壊れた値でアプリが落ちるより、空から作り直せる方が安全）。
export async function loadHabits(): Promise<Habit[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as Habit[];
  } catch {
    return [];
  }
}

// 習慣リストを保存する。値は文字列のみ保存できるため JSON 文字列化する。
export async function saveHabits(habits: Habit[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
}
