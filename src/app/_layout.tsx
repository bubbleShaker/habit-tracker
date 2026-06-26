import { Stack } from "expo-router";
import { HabitsProvider } from "../hooks/HabitsContext";

export default function RootLayout() {
  // 全画面を Provider で包み、一覧と詳細で同じ習慣データを共有する。
  return (
    <HabitsProvider>
      <Stack>
        <Stack.Screen name="index" options={{ title: "習慣トラッカー" }} />
      </Stack>
    </HabitsProvider>
  );
}
