// Expo 標準の babel 設定。babel-preset-expo が TypeScript / JSX / RN 構文を変換する。
// jest（jest-expo）もこの設定を使ってテストファイルを変換する。
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
  };
};
