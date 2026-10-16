import { describe, expect, it } from "vitest";
import { acceptHarmlessCurses, changeWeaponType, clearCurses, emptyTarget, toggleBuff, toggleCurse } from "./target";

describe("toggleBuff", () => {
  it("adds and removes a buff", () => {
    const picked = toggleBuff(emptyTarget("rifle"), "criticalChance");
    expect(picked.positives).toEqual(["criticalChance"]);
    expect(toggleBuff(picked, "criticalChance").positives).toEqual([]);
  });

  it("stops at three buffs", () => {
    let target = emptyTarget("rifle");
    for (const id of ["criticalChance", "criticalDamage", "multishot", "fireRate"]) target = toggleBuff(target, id);
    expect(target.positives).toEqual(["criticalChance", "criticalDamage", "multishot"]);
  });

  it("swaps the spliced stat instead of adding a second one", () => {
    const target = toggleBuff(toggleBuff(emptyTarget("rifle"), "viral"), "blast");
    expect(target.positives).toEqual(["blast"]);
  });

  it("removes a stat from the accepted curses when it becomes a buff", () => {
    const target = toggleBuff(toggleCurse(emptyTarget("rifle"), "zoom"), "zoom");
    expect(target.acceptableNegatives).toEqual([]);
    expect(target.positives).toEqual(["zoom"]);
  });
});

describe("toggleCurse", () => {
  it("ignores stats that are already picked as buffs", () => {
    const target = toggleCurse(toggleBuff(emptyTarget("rifle"), "zoom"), "zoom");
    expect(target.acceptableNegatives).toEqual([]);
  });
});

describe("changeWeaponType", () => {
  it("drops picks that can't exist on the new weapon type", () => {
    let target = emptyTarget("rifle");
    target = toggleBuff(target, "criticalChance");
    target = toggleBuff(target, "weakPointDamage");
    target = toggleCurse(target, "zoom");

    const melee = changeWeaponType(target, "melee");
    expect(melee.positives).toEqual(["criticalChance"]);
    expect(melee.acceptableNegatives).toEqual([]);
  });
});

describe("curse quick picks", () => {
  it("adds the harmless curses without touching buffs", () => {
    const target = acceptHarmlessCurses(toggleBuff(emptyTarget("rifle"), "zoom"));
    expect(target.acceptableNegatives).toContain("impact");
    expect(target.acceptableNegatives).not.toContain("zoom");
  });

  it("keeps curses that were already picked and adds no duplicates", () => {
    const target = acceptHarmlessCurses(toggleCurse(emptyTarget("rifle"), "impact"));
    expect(target.acceptableNegatives.filter((id) => id === "impact")).toHaveLength(1);
  });

  it("clears every accepted curse", () => {
    expect(clearCurses(acceptHarmlessCurses(emptyTarget("melee"))).acceptableNegatives).toEqual([]);
  });
});
