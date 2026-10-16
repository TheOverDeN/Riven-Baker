import { LAYOUT_CHANCES, type LayoutChance } from "../data/assumptions";
import { negativePool, positivePool } from "./catalog";
import type { Layout, RolledRiven, StatId, WeaponType } from "./types";

// This works out the chance that one Kuva cycle gives you what you are after.
//
// Instead of sampling random rolls (which would give a slightly different
// answer every time), it walks through every possible outcome of a cycle once,
// works out how likely each one is, and adds up the ones you would be happy
// with. With at most three buff slots and around twenty stats that is a few
// hundred thousand outcomes at most, which is fast enough to do live.
//
// The model of a cycle, using the assumptions in data/assumptions.ts:
//   1. Pick a layout (unless a spliced stat has frozen it).
//   2. Fill the free buff slots with distinct stats, every combination equally likely.
//   3. If the layout has a curse, pick it from the stats that are not already on the riven.

export interface CycleSetup {
  weaponType: WeaponType;
  // Buffs that survive the cycle: a locked trait and/or the spliced trait.
  keptPositives: readonly StatId[];
  // Set once a spliced trait is on the riven, because the layout can no longer change.
  frozenLayout: Layout | null;
}

export type RollCheck = (roll: RolledRiven) => boolean;

// Calls `visit` once for every possible result of a single cycle, together
// with the chance of that exact result. Everything else in this file is built
// on top of this one walk.
export function forEachOutcome(setup: CycleSetup, visit: (roll: RolledRiven, chance: number) => void): void {
  const layouts: readonly LayoutChance[] = setup.frozenLayout
    ? [{ layout: setup.frozenLayout, chance: 1 }]
    : LAYOUT_CHANCES;
  const buffCandidates = positivePool(setup.weaponType).filter((id) => !setup.keptPositives.includes(id));

  for (const { layout, chance: layoutChance } of layouts) {
    const freeSlots = layout.positives - setup.keptPositives.length;
    if (freeSlots < 0) continue;

    const buffCombinations = combinations(buffCandidates, freeSlots);
    const combinationChance = layoutChance / buffCombinations.length;

    for (const combination of buffCombinations) {
      const positives = [...setup.keptPositives, ...combination];
      visitCurseOptions(setup, layout, positives, combinationChance, visit);
    }
  }
}

// Given the buffs that rolled, splits their chance over every possible curse
// (or passes it straight through when the layout has no curse).
function visitCurseOptions(
  setup: CycleSetup,
  layout: Layout,
  positives: readonly StatId[],
  chance: number,
  visit: (roll: RolledRiven, chance: number) => void,
): void {
  if (layout.negatives === 0) {
    visit({ positives, negative: null }, chance);
    return;
  }

  const curseCandidates = negativePool(setup.weaponType).filter((id) => !positives.includes(id));
  for (const negative of curseCandidates) {
    visit({ positives, negative }, chance / curseCandidates.length);
  }
}

export function chancePerCycle(setup: CycleSetup, isWanted: RollCheck): number {
  let total = 0;
  forEachOutcome(setup, (roll, chance) => {
    if (isWanted(roll)) total += chance;
  });
  return total;
}

// Every way of picking `size` different items from the list, ignoring order.
export function combinations<T>(items: readonly T[], size: number): T[][] {
  if (size === 0) return [[]];
  if (items.length < size) return [];

  const [first, ...rest] = items;
  const withFirst = combinations(rest, size - 1).map((combination) => [first, ...combination]);
  const withoutFirst = combinations(rest, size);
  return [...withFirst, ...withoutFirst];
}

// How many cycles it takes on average when each one succeeds with this chance.
export function expectedCycles(chance: number): number {
  return chance > 0 ? 1 / chance : Infinity;
}

// How many cycles you need to be 90% sure of getting it at least once.
// Averages hide the bad luck, and this is the number players actually feel.
export function cyclesForConfidence(chance: number, confidence = 0.9): number {
  if (chance <= 0) return Infinity;
  if (chance >= 1) return 1;
  return Math.ceil(Math.log(1 - confidence) / Math.log(1 - chance));
}

// Some steps don't have one fixed chance. After "lock whichever wanted buff
// shows up first", the chance of finishing depends on which buff got locked.
// Such a step is a mix: with probability `weight` you are in a situation that
// succeeds with `chance` per cycle. The weights add up to 1.
export interface ChanceShare {
  weight: number;
  chance: number;
}

export function expectedCyclesMixed(shares: readonly ChanceShare[]): number {
  return shares.reduce((total, share) => total + share.weight * expectedCycles(share.chance), 0);
}

// Same question as cyclesForConfidence, for a mix of situations. There is no
// neat formula here, so it doubles n until the target is reached and then
// binary searches for the smallest n that still reaches it.
export function cyclesForConfidenceMixed(shares: readonly ChanceShare[], confidence = 0.9): number {
  if (shares.some((share) => share.weight > 0 && share.chance <= 0)) return Infinity;

  const successWithin = (cycles: number) =>
    shares.reduce((total, share) => total + share.weight * (1 - (1 - share.chance) ** cycles), 0);

  let high = 1;
  while (successWithin(high) < confidence) high *= 2;

  let low = Math.floor(high / 2) + 1;
  while (low < high) {
    const middle = Math.floor((low + high) / 2);
    if (successWithin(middle) >= confidence) high = middle;
    else low = middle + 1;
  }
  return high;
}
