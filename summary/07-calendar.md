# 月グリッドのカレンダー表示（習慣詳細画面）（Issue #20）

習慣ごとの達成履歴を月単位のカレンダーで俯瞰できる詳細画面を追加した。

## 何ができるようになったか
- 一覧で習慣（行）をタップすると詳細画面へ遷移する。
- 詳細画面に当月のカレンダー（月グリッド）を表示し、達成日を青で塗る。今日は枠で強調。
- 前月/翌月へ移動できる（年またぎも正しく動く）。

## 操作モデルの変更
- これまで「行のどこでもタップ＝今日トグル」だったのを変更：
  - **チェック丸タップ＝今日トグル**
  - **行のそれ以外をタップ＝詳細画面を開く**

## 設計
- 純粋関数を `src/lib/calendar.ts` に追加：
  - `monthMatrix(year, month)` … 週ごとの日付セル配列（前後を null 埋め）。日曜始まり。
  - `shiftMonth(year, month, delta)` … 月送り（年またぎは Date 経由で正しく処理）。
- Expo Router の動的ルート `src/app/habit/[id].tsx` を追加。`useLocalSearchParams` で id を受け取る。

## 状態共有のリファクタ（重要）
- 複数画面で同じ習慣データを共有するため、状態を **Context に持ち上げた**。
  - `src/hooks/HabitsContext.tsx`（`HabitsProvider` + `useHabits`）を新設し、`_layout.tsx` で全画面を包む。
  - 既存の `useHabits.ts` は Context からの再エクスポートに変更（import パス互換）。
  - 理由: `useState` は画面ごとに独立するため、詳細での変更が一覧に反映されない問題を防ぐ。
- カレンダー塗り分け用に `isDoneOn(habit, dateKey)` を API に追加。

## テスト
- `calendar.test.ts`: monthMatrix（曜日埋め・7セル・日数・うるう年）/ shiftMonth（前後・年またぎ）
- 計 42 件パス。Web は一覧・詳細とも HTTP 200。

## スコープ外
- 日付タップで過去日の達成を編集
