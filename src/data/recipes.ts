import type { Recipe, SplicedStatDefinition } from "../domain/types";

// Everything the Riven Splicer can make, and from what.
//
// Source: the in-game splicing menu (screenshots in data/screenshots/ss1.PNG
// and ss2.PNG), cross-checked with https://wiki.warframe.com/w/Riven_Splicer
// on 2026-10-16.
//
// There is no "weapon type" field on purpose. A recipe works on a weapon type
// exactly when both of its ingredients can roll there, so that gets worked out
// from stats.ts instead of being typed in twice.

export const SPLICED_STATS: readonly SplicedStatDefinition[] = [
  { id: "ammoEfficiency", name: "Ammo Efficiency" },
  { id: "blast", name: "Blast" },
  { id: "corrosive", name: "Corrosive" },
  { id: "damageToOrokin", name: "Damage to Orokin" },
  { id: "damageToScaldra", name: "Damage to Scaldra" },
  { id: "damageToTechrot", name: "Damage to Techrot" },
  { id: "gas", name: "Gas" },
  { id: "heavyAttackWindUpSpeed", name: "Heavy Attack Wind Up Speed" },
  { id: "magazineReloadedWhenHolstered", name: "Magazine Reloaded/s When Holstered" },
  { id: "magnetic", name: "Magnetic" },
  { id: "meleeDamageOnHeavyAttack", name: "Melee Damage on Heavy Attack" },
  { id: "parryAngle", name: "Parry Angle" },
  { id: "radiation", name: "Radiation" },
  { id: "slamAttackDamage", name: "Slam Attack Damage" },
  { id: "statusDamage", name: "Status Damage" },
  { id: "viral", name: "Viral" },
  { id: "weakPointCriticalChance", name: "Weak Point Critical Chance" },
  { id: "weakPointDamage", name: "Weak Point Damage" },
];

export const RECIPES: readonly Recipe[] = [
  // Elemental combinations
  { result: "blast", ingredients: ["heat", "cold"] },
  { result: "corrosive", ingredients: ["toxin", "electricity"] },
  { result: "gas", ingredients: ["toxin", "heat"] },
  { result: "magnetic", ingredients: ["electricity", "cold"] },
  { result: "radiation", ingredients: ["heat", "electricity"] },
  { result: "viral", ingredients: ["toxin", "cold"] },

  // Faction combinations
  { result: "damageToOrokin", ingredients: ["damageToGrineer", "damageToCorpus"] },
  { result: "damageToScaldra", ingredients: ["damageToInfested", "damageToGrineer"] },
  { result: "damageToTechrot", ingredients: ["damageToCorpus", "damageToInfested"] },

  // Gun combinations
  { result: "ammoEfficiency", ingredients: ["magazineCapacity", "reloadSpeed"] },
  { result: "ammoEfficiency", ingredients: ["weaponRecoil", "ammoMaximum"] },
  { result: "magazineReloadedWhenHolstered", ingredients: ["ammoMaximum", "reloadSpeed"] },
  { result: "magazineReloadedWhenHolstered", ingredients: ["ammoMaximum", "magazineCapacity"] },
  { result: "statusDamage", ingredients: ["damage", "statusChance"] },
  { result: "weakPointCriticalChance", ingredients: ["criticalChance", "zoom"] },
  { result: "weakPointCriticalChance", ingredients: ["criticalChance", "multishot"] },
  { result: "weakPointDamage", ingredients: ["damage", "zoom"] },
  { result: "weakPointDamage", ingredients: ["damage", "multishot"] },

  // Melee combinations
  { result: "heavyAttackWindUpSpeed", ingredients: ["heavyAttackEfficiency", "comboDuration"] },
  { result: "meleeDamageOnHeavyAttack", ingredients: ["heavyAttackEfficiency", "additionalComboCountChance"] },
  { result: "parryAngle", ingredients: ["attackSpeed", "range"] },
  { result: "slamAttackDamage", ingredients: ["meleeDamage", "attackSpeed"] },
  { result: "statusDamage", ingredients: ["meleeDamage", "statusChance"] },
];
