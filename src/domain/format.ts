// Turns raw numbers into the short text the UI shows.

export function formatChance(chance: number): string {
  if (chance <= 0) return "never";
  if (chance >= 0.01) return `${(chance * 100).toFixed(1)}%`;
  return `1 in ${Math.round(1 / chance).toLocaleString("en-US")}`;
}

export function formatCycles(cycles: number): string {
  if (!Number.isFinite(cycles)) return "never";
  const rounded = Math.max(1, Math.round(cycles));
  return `${rounded.toLocaleString("en-US")} ${rounded === 1 ? "cycle" : "cycles"}`;
}
