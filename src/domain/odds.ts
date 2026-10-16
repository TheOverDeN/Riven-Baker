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

export function chancePerCycle(setup: CycleSetup, isWanted: RollCheck): number {
  const layouts: readonly LayoutChance[] = setup.frozenLayout
    ? [{ layout: setup.frozenLayout, chance: 1 }]
    : LAYOUT_CHANCES;

  return layouts.reduce(
    (total, { layout, chance }) => total + chance * chanceWithinLayout(setup, layout, isWanted),
    0,
  );
}

function chanceWithinLayout(setup: CycleSetup, layout: Layout, isWanted: RollCheck): number {
  const freeSlots = layout.positives - setup.keptPositives.length;
  if (freeSlots < 0) return 0;

  const candidates = positivePool(setup.weaponType).filter((id) => !setup.keptPositives.includes(id));
  const buffCombinations = combinations(candidates, freeSlots);
  const chanceOfEachCombination = 1 / buffCombinations.length;

  let matchingChance = 0;
  for (const combination of buffCombinations) {
    const positives = [...setup.keptPositives, ...combination];
    matchingChance += chanceOfEachCombination * chanceOfWantedCurse(setup.weaponType, layout, positives, isWanted);
  }
  return matchingChance;
}

// Given the buffs that rolled, the chance that the curse slot also works out.
function chanceOfWantedCurse(
  weaponType: WeaponType,
  layout: Layout,
  positives: readonly StatId[],
  isWanted: RollCheck,
): number {
  if (layout.negatives === 0) {
    return isWanted({ positives, negative: null }) ? 1 : 0;
  }

  const curseCandidates = negativePool(weaponType).filter((id) => !positives.includes(id));
  const wantedCurses = curseCandidates.filter((negative) => isWanted({ positives, negative }));
  return wantedCurses.length / curseCandidates.length;
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
