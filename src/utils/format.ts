/**
 * Форматирует ISO-строку в читаемый вид: "05.02.2024, 14:30".
 */
export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}, ${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}

/**
 * Знаковый префикс для числа изменения: +5 / -3 / 0
 */
export function signed(n: number): string {
  return n > 0 ? `+${n}` : String(n);
}
