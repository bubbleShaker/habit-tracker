// 一意な id を生成する。DB の habits.id が uuid 型なので、
// クライアント側で作る id も uuid v4 形式に揃える（upsert で型エラーにならないように）。
export function newId(): string {
  const c = globalThis.crypto as Crypto | undefined;
  if (c?.randomUUID) {
    return c.randomUUID();
  }
  // crypto が無い環境向けフォールバック。uuid v4 形式を手組みする。
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (ch) => {
    const r = (Math.random() * 16) | 0;
    const v = ch === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
