import { describe, expect, it } from "vitest";
import { chancePerCycle, combinations, cyclesForConfidence, expectedCycles } from "./odds";
import { positivePool } from "./catalog";

describe("combinations", () => {
  it("lists every unordered pick of the given size", () => {
    expect(combinations(["a", "b", "c"], 2)).toEqual([
      ["a", "b"],
      ["a", "c"],
      ["b", "c"],
    ]);
  });

  it("has exactly one way to pick nothing", () => {
    expect(combinations(["a", "b"], 0)).toEqual([[]]);
  });

  it("has no way to pick more items than there are", () => {
    expect(combinations(["a"], 2)).toEqual([]);
  });
});

describe("chancePerCycle", () => {
  const anything = () => true;

  // If the outcome model is right, all outcomes together must add up to 100%.
  it("adds up to 1 over all outcomes for every setup", () => {
    expect(chancePerCycle({ weaponType: "rifle", keptPositives: [], frozenLayout: null }, anything)).toBeCloseTo(1);
    expect(chancePerCycle({ weaponType: "melee", keptPositives: ["meleeDamage"], frozenLayout: null }, anything)).toBeCloseTo(1);
    expect(
      chancePerCycle(
        { weaponType: "shotgun", keptPositives: ["viral"], frozenLayout: { positives: 3, negatives: 1 } },
        anything,
      ),
    ).toBeCloseTo(1);
  });

  it("matches a hand-worked case: one free buff slot on a rifle", () => {
    // Viral is kept and the layout is frozen at 2 buffs, no curse, so exactly
    // one slot is rolled from the rifle buff pool.
    const chance = chancePerCycle(
      { weaponType: "rifle", keptPositives: ["viral"], frozenLayout: { positives: 2, negatives: 0 } },
      (roll) => roll.positives.includes("criticalChance"),
    );
    expect(chance).toBeCloseTo(1 / positivePool("rifle").length);
  });

  it("never rolls a stat that is already on the riven as the curse", () => {
    const chance = chancePerCycle(
      { weaponType: "rifle", keptPositives: ["zoom"], frozenLayout: null },
      (roll) => roll.negative === "zoom",
    );
    expect(chance).toBe(0);
  });
});

describe("cycle counts", () => {
  it("averages 1 / chance cycles", () => {
    expect(expectedCycles(0.25)).toBe(4);
    expect(expectedCycles(0)).toBe(Infinity);
  });

  it("finds how many cycles give a 90% chance of success", () => {
    // 1 - 0.5^4 = 93.75%, while 3 cycles only give 87.5%
    expect(cyclesForConfidence(0.5)).toBe(4);
    expect(cyclesForConfidence(1)).toBe(1);
  });
});
