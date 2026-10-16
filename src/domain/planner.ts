import { LOCKED_CYCLE_COST_MULTIPLIER } from "../data/assumptions";
import { isSplicedStat, negativePool, positivePool, recipesFor, statName } from "./catalog";
import { chancePerCycle, cyclesForConfidence, expectedCycles, type CycleSetup, type RollCheck } from "./odds";
import type { Layout, RivenTarget, RolledRiven, StatId } from "./types";

// This turns "the riven I want" into a list of steps to get there.
//
// Without a spliced stat it is plain Kuva cycling, and the only question is
// whether locking a trait halfway through saves Kuva.
//
// With a spliced stat the order matters, because splicing freezes the
// buff/curse layout. So the plan is always:
//   1. cycle until the layout is right AND both ingredients are on the riven,
//   2. splice,
//   3. cycle the remaining slots until the rest of the target shows up.

export interface StepOdds {
  chancePerCycle: number;
  expectedCycles: number;
  cyclesFor90Percent: number;
  // Locked cycles cost double Kuva, so they count double in the total.
  costMultiplier: number;
}

// A step has a short title and a one line summary that are always shown,
// plus details and odds that the UI folds away until the player asks for them.
// Anything the player must not miss belongs in the summary, not the details.
export interface PlanStep {
  title: string;
  summary: string;
  details: string[];
  odds: StepOdds | null;
}

export type Plan =
  | { ok: true; steps: PlanStep[]; expectedCycleCost: number }
  | { ok: false; problems: string[] };

export function planRiven(target: RivenTarget): Plan {
  const problems = findProblems(target);
  if (problems.length > 0) return { ok: false, problems };

  const splicedStat = target.positives.find(isSplicedStat);
  const steps = splicedStat
    ? [
        prepareForSpliceStep(target, splicedStat),
        spliceStep(splicedStat),
        ...cyclingSteps(target, {
          weaponType: target.weaponType,
          keptPositives: [splicedStat],
          frozenLayout: layoutOf(target),
        }),
      ]
    : cyclingSteps(target, { weaponType: target.weaponType, keptPositives: [], frozenLayout: null });

  return { ok: true, steps, expectedCycleCost: totalCycleCost(steps) };
}

// Checking the target
// Catches targets the game can never produce, so the planner never has to
// deal with them further down.

export function findProblems(target: RivenTarget): string[] {
  const problems: string[] = [];
  const { positives, acceptableNegatives, weaponType } = target;

  if (positives.length < 2 || positives.length > 3) {
    problems.push("Pick 2 or 3 buffs. Rivens always have 2 or 3.");
  }
  if (new Set(positives).size !== positives.length) {
    problems.push("The same buff is picked twice.");
  }
  if (positives.filter(isSplicedStat).length > 1) {
    problems.push("A riven can only have one spliced stat.");
  }

  const rollableBuffs = positivePool(weaponType);
  for (const id of positives) {
    const possible = isSplicedStat(id) ? recipesFor(id, weaponType).length > 0 : rollableBuffs.includes(id);
    if (!possible) problems.push(`${statName(id)} can't be a buff on a ${weaponType} riven.`);
  }

  const rollableCurses = negativePool(weaponType);
  for (const id of acceptableNegatives) {
    if (!rollableCurses.includes(id)) problems.push(`${statName(id)} can't be a curse on a ${weaponType} riven.`);
    if (positives.includes(id)) problems.push(`${statName(id)} is picked as both a buff and a curse.`);
  }

  return problems;
}

// Step builders

function prepareForSpliceStep(target: RivenTarget, splicedStat: StatId): PlanStep {
  const layout = layoutOf(target);
  const recipes = recipesFor(splicedStat, target.weaponType);
  const pairs = recipes.map((recipe) => recipe.ingredients.map(statName).join(" + "));

  const freshRiven: CycleSetup = { weaponType: target.weaponType, keptPositives: [], frozenLayout: null };
  const hasLayoutAndIngredients: RollCheck = (roll) =>
    sameLayout(roll, layout) &&
    recipes.some((recipe) =>
      recipe.ingredients.every((ingredient) => roll.positives.includes(ingredient) || roll.negative === ingredient),
    );

  const details: string[] = [];
  if (layout.negatives === 1) {
    details.push("A curse can't be added after splicing, so it has to be on the riven before you splice.");
    details.push("One ingredient can be the curse. The splice still gives you a buff and rolls a new random curse.");
  } else {
    details.push(`After splicing, no curse can roll until ${statName(splicedStat)} is removed.`);
  }
  details.push("Tip: you can lock one ingredient once it shows up, but each cycle then costs double Kuva.");

  return {
    title: `Find ${pairs.join(" or ")}`,
    summary: `Cycle until ${pairs.length > 1 ? "one pair is" : "both are"} on the riven, with ${describeLayout(layout)}. Splicing locks that layout.`,
    details,
    odds: oddsFor(chancePerCycle(freshRiven, hasLayoutAndIngredients), 1),
  };
}

function spliceStep(splicedStat: StatId): PlanStep {
  const name = statName(splicedStat);
  return {
    title: `Splice into ${name}`,
    summary: "Combine the ingredients using a Riven Splicer.",
    details: [
      "Confirm the splice in the Mod Workbench. It uses up one Riven Splicer.",
      `${name} keeps the better roll of the two ingredients it replaces.`,
      "A new random trait fills the freed slot. It is a curse if one of the ingredients was the curse.",
      `${name} stays locked for free, so you can still lock one more trait.`,
    ],
    odds: null,
  };
}

// Cycling until the target matches.
// Compares two ways of doing it and keeps the cheaper one:
//   plain:  keep cycling until everything matches at once,
//   locked: cycle until any wanted buff appears, lock it, then cycle the rest
//           at double Kuva cost.

function cyclingSteps(target: RivenTarget, setup: CycleSetup): PlanStep[] {
  const isTarget = matchesTarget(target);
  const stillWanted = target.positives.filter((id) => !setup.keptPositives.includes(id));
  const finishSummary = `Keep cycling until the riven has ${describeTarget(target)}.`;

  const plainOdds = oddsFor(chancePerCycle(setup, isTarget), 1);
  const lockedPlan = canUseLock(target, stillWanted) ? planWithLock(target, setup, stillWanted) : null;

  if (!lockedPlan || costOf(plainOdds) <= lockedPlan.cost) {
    const details = ["Stop as soon as it matches. Every cycle rerolls all unlocked traits."];
    if (lockedPlan) details.push(savingsNote("Not locking", lockedPlan.cost, costOf(plainOdds)));
    return [
      { title: `Roll ${stillWanted.map(statName).join(" and ")}`, summary: finishSummary, details, odds: plainOdds },
    ];
  }

  return [
    {
      title: `Find ${stillWanted.map(statName).join(" or ")}`,
      summary:
        stillWanted.length > 1
          ? "Cycle until one of them appears as a buff, then lock it."
          : "Cycle until it appears as a buff, then lock it.",
      details: ["Any one of them is fine. Locking keeps it safe while you roll the rest."],
      odds: lockedPlan.findOdds,
    },
    {
      title: "Lock it and roll the rest",
      summary: finishSummary,
      details: [
        "Locked cycles cost double Kuva, but the locked buff can't be lost.",
        savingsNote("Locking", costOf(plainOdds), lockedPlan.cost),
      ],
      odds: lockedPlan.finishOdds,
    },
  ];
}

// Locking only helps when something is still left to roll after the lock.
function canUseLock(target: RivenTarget, stillWanted: StatId[]): boolean {
  return stillWanted.length >= 2 || (stillWanted.length === 1 && target.acceptableNegatives.length > 0);
}

function planWithLock(target: RivenTarget, setup: CycleSetup, stillWanted: StatId[]) {
  const findAnyWanted: RollCheck = (roll) => stillWanted.some((id) => roll.positives.includes(id));
  const findOdds = oddsFor(chancePerCycle(setup, findAnyWanted), 1);

  // Which wanted buff shows up first is random, so average over all of them.
  const finishChances = stillWanted.map((locked) =>
    chancePerCycle({ ...setup, keptPositives: [...setup.keptPositives, locked] }, matchesTarget(target)),
  );
  const averageFinishChance = finishChances.reduce((sum, chance) => sum + chance, 0) / finishChances.length;
  const finishOdds = oddsFor(averageFinishChance, LOCKED_CYCLE_COST_MULTIPLIER);

  return { findOdds, finishOdds, cost: costOf(findOdds) + costOf(finishOdds) };
}

// Small helpers

function matchesTarget(target: RivenTarget): RollCheck {
  return (roll) => {
    const sameBuffs =
      roll.positives.length === target.positives.length && target.positives.every((id) => roll.positives.includes(id));
    const curseIsFine =
      target.acceptableNegatives.length === 0
        ? roll.negative === null
        : roll.negative !== null && target.acceptableNegatives.includes(roll.negative);
    return sameBuffs && curseIsFine;
  };
}

function layoutOf(target: RivenTarget): Layout {
  return {
    positives: target.positives.length === 3 ? 3 : 2,
    negatives: target.acceptableNegatives.length > 0 ? 1 : 0,
  };
}

function sameLayout(roll: RolledRiven, layout: Layout): boolean {
  return roll.positives.length === layout.positives && (roll.negative !== null) === (layout.negatives === 1);
}

function oddsFor(chance: number, costMultiplier: number): StepOdds {
  return {
    chancePerCycle: chance,
    expectedCycles: expectedCycles(chance),
    cyclesFor90Percent: cyclesForConfidence(chance),
    costMultiplier,
  };
}

function costOf(odds: StepOdds): number {
  return odds.expectedCycles * odds.costMultiplier;
}

function totalCycleCost(steps: PlanStep[]): number {
  return steps.reduce((total, step) => total + (step.odds ? costOf(step.odds) : 0), 0);
}

function savingsNote(winner: string, slowerCost: number, fasterCost: number): string {
  if (!Number.isFinite(slowerCost)) return `${winner} is the only way that works here.`;
  const saving = Math.round((1 - fasterCost / slowerCost) * 100);
  return `${winner} is cheaper here, about ${saving}% less Kuva on average.`;
}

function describeLayout(layout: Layout): string {
  return `${layout.positives} buffs and ${layout.negatives === 1 ? "a curse" : "no curse"}`;
}

function describeTarget(target: RivenTarget): string {
  const buffs = target.positives.map(statName).join(", ");
  if (target.acceptableNegatives.length === 0) return `${buffs} and no curse`;
  if (target.acceptableNegatives.length === 1) return `${buffs} and ${statName(target.acceptableNegatives[0])} as the curse`;
  return `${buffs} and one of your accepted curses`;
}
