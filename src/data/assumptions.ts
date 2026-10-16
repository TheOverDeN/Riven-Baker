import type { Layout } from "../domain/types";

// Things the planner has to assume because nobody has published real numbers
// yet. Every odds figure in the app depends on these, so the UI shows them
// to the player instead of hiding them.
//
// When real data shows up (in-game testing or community reports), this is
// the only file that should need to change.

export interface LayoutChance {
  layout: Layout;
  chance: number;
}

// Unverified: we assume a Kuva cycle picks each of the four layouts equally often.
export const LAYOUT_CHANCES: readonly LayoutChance[] = [
  { layout: { positives: 2, negatives: 0 }, chance: 0.25 },
  { layout: { positives: 2, negatives: 1 }, chance: 0.25 },
  { layout: { positives: 3, negatives: 0 }, chance: 0.25 },
  { layout: { positives: 3, negatives: 1 }, chance: 0.25 },
];

// Locking a trait doubles the Kuva cost of every cycle (wiki, Riven Splicer page).
export const LOCKED_CYCLE_COST_MULTIPLIER = 2;

// Shown in the UI next to the plan.
export const ASSUMPTION_NOTES: readonly string[] = [
  "Every stat that can roll on this weapon type is treated as equally likely. Real odds have not been published.",
  "The four buff/curse layouts are treated as equally likely on each cycle.",
  "Impact, Puncture and Slash may not roll at all on weapons with little of that damage type.",
  "Costs are shown in cycles, not Kuva. Locking doubles the Kuva cost of each cycle.",
];
