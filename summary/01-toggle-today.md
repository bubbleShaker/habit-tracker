# 「今日やった」チェック機能（Issue #7）

習慣を「今日やったか」記録できるようにした。習慣トラッカーの核心機能。

## 何ができるようになったか
- 各習慣の行の丸ボタンをタップ → 「今日完了」をトグル
- 完了すると丸が塗りつぶし（✓）＋習慣名に打ち消し線
- 完了状態は AsyncStorage に永続化。日付が変われば自動で未完了に戻る

## 設計
- `Habit.completedDates: string[]`（`"YYYY-MM-DD"`）で完了日を保持。
  日付文字列にすることで「同じ日か」の比較を単純化。
- ロジックは純粋関数 `src/lib/completion.ts` に隔離（React も Storage も知らない）:
  - `toDateKey` / `todayKey` … ローカル日付のキー化（`toISOString` の UTC ずれを回避）
  - `isCompletedOn` … 指定日に完了済みか
  - `toggleCompletion` … 完了を付け外しした新しい habit を返す（不変更新）
- `useHabits` が `toggleToday(id)` / `isCompletedToday(habit)` を公開。UI は日付計算を知らない。
- 永続化層 `loadHabits` で旧データ（`completedDates` 無し）を空配列で補い後方互換を確保。

## 依存方向
```
UI (index.tsx)
  → useHabits（状態・トグル）
      → completion（純粋ロジック） / habitStorage（永続化）
```

## テスト
- `completion.test.ts` … 日付キー化・UTCずれ・トグル・不変性（10 件）
- `habitStorage.test.ts` … 往復・破損データ・後方互換（追加 1 件）
- 計 14 件パス。

## スコープ外（今後の Issue 候補）
- 連続日数（ストリーク）表示
- 習慣の削除
- カレンダー / 履歴表示
