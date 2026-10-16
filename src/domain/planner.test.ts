import { describe, expect, it } from "vitest";
import { findProblems, planRiven } from "./planner";
import type { RivenTarget } from "./types";

function target(overrides: Partial<RivenTarget>): RivenTarget {
  return {
    weaponType: "rifle",
    positives: ["criticalChance", "criticalDamage"],
    acceptableNegatives: [],
    ...overrides,
  };
}

describe("findProblems", () => {
  it("accepts a normal target", () => {
    expect(findProblems(target({}))).toEqual([]);
  });

  it("needs 2 or 3 buffs", () => {
    expect(findProblems(target({ positives: ["criticalChance"] }))).toHaveLength(1);
  });

  it("allows only one spliced stat", () => {
    expect(findProblems(target({ positives: ["viral", "blast"] }))).toContain(
      "A riven can only have one spliced stat.",
    );
  });

  it("rejects stats that can't roll on the weapon type", () => {
    expect(findProblems(target({ weaponType: "melee", positives: ["zoom", "range"] }))).not.toEqual([]);
    expect(findProblems(target({ weaponType: "melee", positives: ["weakPointDamage", "range"] }))).not.toEqual([]);
  });

  it("rejects buff-only stats as curses", () => {
    expect(findProblems(target({ acceptableNegatives: ["damage"] }))).not.toEqual([]);
  });

  it("rejects a stat picked as both buff and curse", () => {
    expect(findProblems(target({ acceptableNegatives: ["criticalChance"] }))).not.toEqual([]);
  });
});

describe("planRiven", () => {
  it("plans plain cycling when no spliced stat is wanted", () => {
    const plan = planRiven(
      target({ positives: ["criticalChance", "criticalDamage", "multishot"], acceptableNegatives: ["zoom"] }),
    );

    expect(plan.ok).toBe(true);
    if (!plan.ok) return;
    expect(plan.steps[0].title).toMatch(/^(Roll|Find)/);
    expect(plan.steps.some((step) => step.title.startsWith("Splice"))).toBe(false);
    expect(plan.expectedCycleCost).toBeGreaterThan(0);
    expect(Number.isFinite(plan.expectedCycleCost)).toBe(true);
  });

  it("prepares, splices, then cycles when a spliced stat is wanted", () => {
    const plan = planRiven(
      target({ positives: ["viral", "criticalChance", "criticalDamage"], acceptableNegatives: ["zoom"] }),
    );

    expect(plan.ok).toBe(true);
    if (!plan.ok) return;
    const titles = plan.steps.map((step) => step.title);
    const prepareIndex = titles.indexOf("Find Toxin + Cold");
    const spliceIndex = titles.indexOf("Splice into Viral");

    expect(prepareIndex).toBe(0);
    expect(spliceIndex).toBe(prepareIndex + 1);
    expect(spliceIndex).toBeLessThan(titles.length - 1);
  });

  it("names both ingredient pairs when a spliced stat has two recipes", () => {
    const plan = planRiven(target({ positives: ["weakPointDamage", "criticalChance"] }));

    expect(plan.ok).toBe(true);
    if (!plan.ok) return;
    expect(plan.steps[0].title).toBe("Find Damage + Zoom or Damage + Multishot");
  });

  it("returns the problems instead of a plan for an impossible target", () => {
    const plan = planRiven(target({ positives: ["viral", "blast"] }));
    expect(plan.ok).toBe(false);
  });

  it("keeps the layout warning in the always visible summary", () => {
    const withCurse = planRiven(target({ positives: ["viral", "criticalChance"], acceptableNegatives: ["zoom"] }));
    const withoutCurse = planRiven(target({ positives: ["viral", "criticalChance"] }));

    expect(withCurse.ok && withCurse.steps[0].summary).toContain("2 buffs and a curse");
    expect(withoutCurse.ok && withoutCurse.steps[0].summary).toContain("2 buffs and no curse");
  });
});
