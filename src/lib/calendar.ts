import { toDateKey } from "./completion";

// カレンダー（月グリッド）の純粋ロジック。
// React も習慣データも知らず、日付の格子だけを組み立てる。

// 1日を表すセル。日付が無い場所（前月末・翌月頭の埋め）は null。
export type DayCell = { key: string; day: number } | null;

// 指定年月（month は 1-12）の月グリッドを「週ごとの配列」で返す。
// 週の始まりは日曜（getDay() の 0=日曜に合わせる）。
// 月初の曜日ぶん先頭を null で埋め、末尾も7の倍数になるよう null で埋める。
export function monthMatrix(year: number, month: number): DayCell[][] {
  const first = new Date(year, month - 1, 1);
  const startWeekday = first.getDay(); // 0=日 .. 6=土
  // 「翌月の0日目」= 当月の末日。これで月の日数を得る。
  const daysInMonth = new Date(year, month, 0).getDate();

  const cells: DayCell[] = [];
  // 月初前の空セル
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  // 当月の各日
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ key: toDateKey(new Date(year, month - 1, d)), day: d });
  }
  // 末尾を7の倍数まで空セルで埋める
  while (cells.length % 7 !== 0) cells.push(null);

  // 7個ずつ週に分割する
  const weeks: DayCell[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  return weeks;
}

// 月送り用: {year, month}(1-12) を delta か月ずらして返す。
// Date に通すことで年またぎ（12月→翌1月、1月→前12月）を正しく処理する。
export function shiftMonth(
  year: number,
  month: number,
  delta: number
): { year: number; month: number } {
  const d = new Date(year, month - 1 + delta, 1);
  return { year: d.getFullYear(), month: d.getMonth() + 1 };
}
