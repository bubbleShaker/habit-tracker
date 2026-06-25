# habit-tracker

iOS / Android 両対応の習慣トラッカーアプリ。クロスプラットフォーム開発の学習を兼ねた第1弾プロジェクト。

## 技術スタック

- **React Native (Expo) + TypeScript**
- 状態管理: React hooks / Context
- 永続化: AsyncStorage（端末ローカル保存）
- 画面遷移: Expo Router

選定理由は [`research/01-cross-platform-investigation.md`](research/01-cross-platform-investigation.md) を参照。

## アーキテクチャ

```
UI層 (React Components + Expo Router)
  ↓
状態管理層 (hooks / Context)
  ↓
永続化層 (AsyncStorage)
```

## 開発方針

`~/git/CLAUDE.md` に従う（Issue先行サイクル: Issue起票 → 実装 → PR → レビュー → マージ）。

## ディレクトリ規約

- `research/` — 調査・発見のまとめ
- `summary/` — 実装完了時の概要
- `knowledge/` — 詰まった点と解説
