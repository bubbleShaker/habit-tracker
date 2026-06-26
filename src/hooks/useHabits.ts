// 状態は HabitsContext に持ち上げた（複数画面で共有するため）。
// 既存の import パス("../hooks/useHabits")を保つために再エクスポートする。
export { useHabits, HabitsProvider } from "./HabitsContext";
