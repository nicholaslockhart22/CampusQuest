export function todayString(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function yesterdayString(d = new Date()): string {
  const x = new Date(d);
  x.setDate(x.getDate() - 1);
  return todayString(x);
}

/** Monday date YYYY-MM-DD for weekly mini-game rings */
export function isoWeekKey(d = new Date()): string {
  const x = new Date(d);
  const day = (x.getDay() + 6) % 7;
  x.setDate(x.getDate() - day);
  x.setHours(0, 0, 0, 0);
  return x.toISOString().slice(0, 10);
}
