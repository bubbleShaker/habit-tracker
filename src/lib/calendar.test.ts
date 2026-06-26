import { monthMatrix, shiftMonth } from "./calendar";

describe("monthMatrix", () => {
  it("2026年6月: 先頭は月曜始まりぶんの null 埋め", () => {
    // 2026-06-01 は月曜（getDay()=1）→ 先頭1個が null
    const weeks = monthMatrix(2026, 6);
    expect(weeks[0][0]).toBeNull();
    expect(weeks[0][1]).toEqual({ key: "2026-06-01", day: 1 });
  });

  it("各週は必ず7セル", () => {
    const weeks = monthMatrix(2026, 6);
    weeks.forEach((w) => expect(w).toHaveLength(7));
  });

  it("当月の日数ぶんの非nullセルがある", () => {
    const weeks = monthMatrix(2026, 6); // 6月=30日
    const days = weeks.flat().filter((c) => c !== null);
    expect(days).toHaveLength(30);
    expect(days[0]).toEqual({ key: "2026-06-01", day: 1 });
    expect(days[29]).toEqual({ key: "2026-06-30", day: 30 });
  });

  it("2月のうるう年は29日", () => {
    const days = monthMatrix(2024, 2)
      .flat()
      .filter((c) => c !== null);
    expect(days).toHaveLength(29);
  });

  it("2月の平年は28日", () => {
    const days = monthMatrix(2026, 2)
      .flat()
      .filter((c) => c !== null);
    expect(days).toHaveLength(28);
  });
});

describe("shiftMonth", () => {
  it("翌月", () => {
    expect(shiftMonth(2026, 6, 1)).toEqual({ year: 2026, month: 7 });
  });
  it("前月", () => {
    expect(shiftMonth(2026, 6, -1)).toEqual({ year: 2026, month: 5 });
  });
  it("年またぎ（12月の翌月は翌年1月）", () => {
    expect(shiftMonth(2026, 12, 1)).toEqual({ year: 2027, month: 1 });
  });
  it("年またぎ（1月の前月は前年12月）", () => {
    expect(shiftMonth(2026, 1, -1)).toEqual({ year: 2025, month: 12 });
  });
});
