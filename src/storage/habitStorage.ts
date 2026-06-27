import AsyncStorage from "@react-native-async-storage/async-storage";
import { Habit } from "../types/habit";
import { getSupabase, isSupabaseConfigured } from "../lib/supabase";
import { habitsToRows, rowsToHabits } from "./habitMapping";

// 永続化層: 保存先をこのファイルに隔離する。UI/フックは「どこに保存されるか」を知らない。
// Supabase 設定があればクラウド同期、無ければ従来どおり端末ローカル（AsyncStorage）。

const STORAGE_KEY = "habits";

export async function loadHabits(): Promise<Habit[]> {
  return isSupabaseConfigured() ? loadFromCloud() : loadFromLocal();
}

export async function saveHabits(habits: Habit[]): Promise<void> {
  return isSupabaseConfigured() ? saveToCloud(habits) : saveToLocal(habits);
}

// ---------------------------------------------------------------------------
// クラウド（Supabase）— 設定済み時。RLS によりログインユーザーの行だけが対象になる。
// ---------------------------------------------------------------------------

async function loadFromCloud(): Promise<Habit[]> {
  const supabase = getSupabase();
  const { data: habitRows, error: e1 } = await supabase
    .from("habits")
    .select("id,name,created_at,sort_order");
  if (e1) throw e1;
  const { data: completionRows, error: e2 } = await supabase
    .from("completions")
    .select("habit_id,date_key");
  if (e2) throw e2;
  return rowsToHabits(habitRows ?? [], completionRows ?? []);
}

// E-1 の簡易同期: habits を全件 upsert ＋ 消えた行を delete、completions は全置換。
// 行単位の最適化（toggle/rename を1行更新）は E-2 で行う。
async function saveToCloud(habits: Habit[]): Promise<void> {
  const supabase = getSupabase();
  const { habitRows, completionRows } = habitsToRows(habits);
  const ids = habitRows.map((r) => r.id);

  // 1. habits を upsert（user_id は default auth.uid() で自動充填）。
  if (habitRows.length > 0) {
    const { error } = await supabase.from("habits").upsert(habitRows);
    if (error) throw error;
  }

  // 2. ローカルから消えた習慣を削除（completions は on delete cascade で一緒に消える）。
  //    ローカルが空なら全削除（id は null にならないので「全行」を意味する）。
  const delHabits =
    ids.length > 0
      ? supabase.from("habits").delete().not("id", "in", `(${ids.join(",")})`)
      : supabase.from("habits").delete().not("id", "is", null);
  {
    const { error } = await delHabits;
    if (error) throw error;
  }

  // 3. 残った習慣の completions を全置換（消す→入れ直す）。
  if (ids.length > 0) {
    const { error } = await supabase
      .from("completions")
      .delete()
      .in("habit_id", ids);
    if (error) throw error;
  }
  if (completionRows.length > 0) {
    const { error } = await supabase.from("completions").insert(completionRows);
    if (error) throw error;
  }
}

// ---------------------------------------------------------------------------
// ローカル（AsyncStorage）— Supabase 未設定時のフォールバック（従来挙動）。
// ---------------------------------------------------------------------------

async function loadFromLocal(): Promise<Habit[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // 後方互換: completedDates を持たない旧データは空配列で補う。
    return parsed.map((h) => ({
      ...h,
      completedDates: Array.isArray(h?.completedDates) ? h.completedDates : [],
    })) as Habit[];
  } catch {
    return [];
  }
}

async function saveToLocal(habits: Habit[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
}
