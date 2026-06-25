# クロスプラットフォームモバイル開発 調査メモ（2026-06）

iOS / Android を1つのコードで公開できるかの調査結果。

## 結論

1つのコードベースから iOS / Android 両方のアプリを公開できる。これを「クロスプラットフォーム開発」と呼ぶ。

## 主要フレームワーク比較（2026年）

| フレームワーク | 言語 | 描画方式 | シェア | 向いている用途 |
|---|---|---|---|---|
| React Native (Expo) | TypeScript / JS | ネイティブUIをJSで駆動（New Architecture / Fabric） | 35-42% | Web/TS経験者、最速リリース |
| Flutter | Dart | 独自レンダラで全端末ピクセル一致 | 約46% | リッチUI・アニメ重視 |
| Kotlin Multiplatform (KMP) | Kotlin | ロジック共通＋UIはネイティブ | 7%→23%に急成長 | ネイティブUXも妥協しない |

- 採用例: Flutter=Nubank、KMP=Netflix / Cash App / Duolingo（ロジック80%共有）。
- 2026年トレンドは「ハイブリッド」: パフォーマンス重要部はKMP、UIはFlutter/RNなど併用も増加。

## iOS ネイティブ（Swift / SwiftUI）の優位点

クロスプラットフォームでも カメラ・GPS・生体認証・通知・課金 等の一般機能は問題なく使える。
ネイティブが有利なのは主に以下:

- 新OS機能の即日対応（Dynamic Island / App Intents / 最新ウィジェット等）。クロスプラットフォームはプラグイン対応待ちになることがある。
- Apple Watch / Live Activity / 高度ウィジェットなど Apple エコシステム深掘り。
- 重量級3Dゲーム・AR(ARKit)・超高負荷処理。

→ 「普通のアプリ」ならクロスプラットフォームで十分。必要な一部だけネイティブコードを差し込む（ブリッジ）ことも可能。

## 本プロジェクトの技術選定

- **React Native (Expo) + TypeScript** を採用。
- 理由:
  - 2026年に React Native 公式が「新規プロジェクトは Expo 推奨」と明言。
  - EAS Build（クラウドビルド）・EAS Submit（ストア提出）・OTA更新で配信が容易。
  - TypeScript 資産が活き、学習の認知負荷が低い（CLAUDE.md 方針と整合）。

## アプリ難易度別候補

- 🟢 初級: 割り勘計算 / 習慣トラッカー / おみくじ
- 🟡 中級: 家計簿 / カメラ日記 / ポモドーロ＋通知
- 🔴 上級: 天気・ニュース(外部API) / チャット(認証・リアルタイム) / 地図・位置共有

第1弾は 🟢 習慣トラッカー を採用（状態管理＋端末ローカル保存の基礎を学べ、中級へ拡張しやすい土台）。

## 出典

- Kotlin Multiplatform vs Flutter vs React Native: The 2026 Cross-Platform Reality (Java Code Geeks)
- Expo Documentation / React Native 公式（2026年 Expo 推奨）
- Mobile App Development in 2026: How Expo Is Simplifying Development (Vercelabs)
