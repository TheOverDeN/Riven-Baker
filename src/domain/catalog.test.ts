import { describe, expect, it } from "vitest";
import { negativePool, positivePool, recipesFor, splicedStatsFor } from "./catalog";

describe("stat pools", () => {
  it("keeps buff-only stats out of the curse pool", () => {
    expect(negativePool("rifle")).not.toContain("toxin");
    expect(negativePool("rifle")).not.toContain("damage");
    expect(positivePool("rifle")).toContain("toxin");
  });

  it("keeps curse-only stats out of the buff pool", () => {
    expect(positivePool("melee")).not.toContain("chanceToGainComboCount");
    expect(negativePool("melee")).toContain("chanceToGainComboCount");
  });

  it("only offers stats that exist on the weapon type", () => {
    expect(positivePool("melee")).not.toContain("zoom");
    expect(positivePool("archgun")).not.toContain("projectileSpeed");
  });
});

describe("recipes per weapon type", () => {
  it("picks the right Status Damage recipe for guns and melee", () => {
    expect(recipesFor("statusDamage", "rifle").map((recipe) => recipe.ingredients)).toEqual([["damage", "statusChance"]]);
    expect(recipesFor("statusDamage", "melee").map((recipe) => recipe.ingredients)).toEqual([
      ["meleeDamage", "statusChance"],
    ]);
  });

  it("keeps gun-only and melee-only splices on their own side", () => {
    const melee = splicedStatsFor("melee").map((stat) => stat.id);
    const rifle = splicedStatsFor("rifle").map((stat) => stat.id);

    expect(melee).toContain("parryAngle");
    expect(melee).not.toContain("weakPointDamage");
    expect(rifle).toContain("weakPointDamage");
    expect(rifle).not.toContain("parryAngle");
  });

  it("offers elemental and faction splices everywhere", () => {
    for (const weaponType of ["rifle", "shotgun", "pistol", "archgun", "melee"] as const) {
      const ids = splicedStatsFor(weaponType).map((stat) => stat.id);
      expect(ids).toContain("viral");
      expect(ids).toContain("damageToOrokin");
    }
  });
});
