# Expo Web 起動時の lightningcss Windows ネイティブ欠落（Issue #9）

## 何が起きたか
PC のブラウザで動作確認しようと `npx expo start --web` を実行したら、ページが **500 エラー**。
Metro のログにこう出た：

```
Cannot find module '../lightningcss.win32-x64-msvc.node'
```

## なぜ起きたか
`lightningcss` は Expo Web が CSS を高速処理するのに使う**ネイティブモジュール**で、OS ごとに別々の `.node` バイナリを必要とする（Windows なら `lightningcss.win32-x64-msvc.node`）。

今回の `node_modules` は別 OS（WSL/Linux）で `npm install` されたものを Windows で使い回していたため、**Windows 用バイナリだけが欠けていた**。

根っこは npm の既知バグで、`package-lock.json` が「ある OS でロックを作ると、別 OS 向けの optional 依存（OS 固有ネイティブ）を取りこぼす」というもの。だから通常の `npm install` をしても「up to date」と言われて入らない。

## どう直したか（恒久対策）
`package.json` の `optionalDependencies` に Windows 用バイナリを明記した：

```json
"optionalDependencies": {
  "lightningcss-win32-x64-msvc": "1.32.0"
}
```

- バージョンは本体 `lightningcss` の解決版に合わせる（今回 1.32.0）。
- このパッケージは `os: ["win32"]` / `cpu: ["x64"]` 制限付きなので、**Mac/Linux では自動でスキップ**され、クロスプラットフォームでも安全。
- `npm install` で `package-lock.json` にも記録され、入れ直しても再発しない。

## 応急処置（恒久対策前にやったこと）
通常 install で入らなかったので、tarball を直接取って配置した：

```bash
npm pack lightningcss-win32-x64-msvc@1.32.0     # tarball 取得
tar -xzf lightningcss-win32-x64-msvc-1.32.0.tgz # 展開
# package/ を node_modules/lightningcss-win32-x64-msvc/ へ移動
node -e "require('lightningcss-win32-x64-msvc')" # 読み込み確認
npx expo start --web --clear                     # キャッシュ破棄して再起動
```

## 教訓
- ネイティブモジュールを含む JS プロジェクトは、`node_modules` を OS をまたいで使い回さない。OS が変わったら入れ直すのが基本。
- それでも optional 依存が漏れる時は、その OS 向けパッケージを `optionalDependencies` に明示すると確実。
