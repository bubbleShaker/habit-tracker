import { newId } from "./id";

describe("newId", () => {
  it("uuid v4 形式を返す", () => {
    expect(newId()).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    );
  });

  it("呼ぶたびに異なる値になる", () => {
    expect(newId()).not.toBe(newId());
  });
});
