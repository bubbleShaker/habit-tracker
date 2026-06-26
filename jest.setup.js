// AsyncStorage を公式インメモリモックに差し替える。
// これで実機ストレージ無しでも「保存→読込」の往復をテストできる。
jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);
