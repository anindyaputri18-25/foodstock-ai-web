/**
 * Derau semu deterministik (0..1) untuk data grafik simulasi.
 * Pengganti Math.random() pada saat render: Math.random() menghasilkan nilai berbeda
 * antara HTML dari server dan render pertama di klien sehingga memicu error hidrasi
 * React #418 (yang membuat tema terpental ke gelap).
 */
export function pseudoNoise(index: number, salt = 0): number {
  const x = Math.sin((index + 1) * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}
