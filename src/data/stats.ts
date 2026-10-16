import type { StatDefinition, WeaponType } from "../domain/types";

// Every normal riven stat, which weapon types it can roll on, and whether it
// can be a buff, a curse or both.
//
// Source: WARFRAME Wiki, Riven Mods page, "Base Values" table
// (https://wiki.warframe.com/w/Riven_Mods), checked 2026-10-16.
// Names follow the in-game splicing menu where the two differ.
// The category only decides which tab a stat shows up under in the picker.
//
// Known gap: physical damage stats (Impact, Puncture, Slash) usually do not
// roll on weapons with less than 25% of that damage type. That depends on the
// exact weapon, so the planner treats them as available on the whole type.

export const WEAPON_TYPES: readonly WeaponType[] = ["rifle", "shotgun", "pistol", "archgun", "melee"];

const RANGED: readonly WeaponType[] = ["rifle", "shotgun", "pistol", "archgun"];
const RANGED_EXCEPT_ARCHGUN: readonly WeaponType[] = ["rifle", "shotgun", "pistol"];
const MELEE: readonly WeaponType[] = ["melee"];
const ALL = WEAPON_TYPES;

export const STATS: readonly StatDefinition[] = [
  // Faction damage, available everywhere
  { id: "damageToCorpus", name: "Damage to Corpus", weaponTypes: ALL, signRule: "either", category: "core" },
  { id: "damageToGrineer", name: "Damage to Grineer", weaponTypes: ALL, signRule: "either", category: "core" },
  { id: "damageToInfested", name: "Damage to Infested", weaponTypes: ALL, signRule: "either", category: "core" },

  // Elemental damage, buff only
  { id: "cold", name: "Cold", weaponTypes: ALL, signRule: "positiveOnly", category: "damageTypes" },
  { id: "electricity", name: "Electricity", weaponTypes: ALL, signRule: "positiveOnly", category: "damageTypes" },
  { id: "heat", name: "Heat", weaponTypes: ALL, signRule: "positiveOnly", category: "damageTypes" },
  { id: "toxin", name: "Toxin", weaponTypes: ALL, signRule: "positiveOnly", category: "damageTypes" },

  // Physical damage (see the known gap above)
  { id: "impact", name: "Impact", weaponTypes: ALL, signRule: "either", category: "damageTypes" },
  { id: "puncture", name: "Puncture", weaponTypes: ALL, signRule: "either", category: "damageTypes" },
  { id: "slash", name: "Slash", weaponTypes: ALL, signRule: "either", category: "damageTypes" },

  // Crit and status, available everywhere
  { id: "criticalChance", name: "Critical Chance", weaponTypes: ALL, signRule: "either", category: "core" },
  { id: "criticalDamage", name: "Critical Damage", weaponTypes: ALL, signRule: "either", category: "core" },
  { id: "statusChance", name: "Status Chance", weaponTypes: ALL, signRule: "either", category: "core" },
  { id: "statusDuration", name: "Status Duration", weaponTypes: ALL, signRule: "either", category: "utility" },

  // Guns only
  { id: "damage", name: "Damage", weaponTypes: RANGED, signRule: "positiveOnly", category: "core" },
  { id: "multishot", name: "Multishot", weaponTypes: RANGED, signRule: "either", category: "core" },
  { id: "fireRate", name: "Fire Rate", weaponTypes: RANGED, signRule: "either", category: "core" },
  { id: "magazineCapacity", name: "Magazine Capacity", weaponTypes: RANGED, signRule: "either", category: "utility" },
  { id: "reloadSpeed", name: "Reload Speed", weaponTypes: RANGED, signRule: "either", category: "utility" },
  { id: "ammoMaximum", name: "Ammo Maximum", weaponTypes: RANGED, signRule: "either", category: "utility" },
  { id: "weaponRecoil", name: "Weapon Recoil", weaponTypes: RANGED, signRule: "either", category: "utility" },
  { id: "zoom", name: "Zoom", weaponTypes: RANGED, signRule: "either", category: "utility" },
  { id: "punchThrough", name: "Punch Through", weaponTypes: RANGED, signRule: "positiveOnly", category: "utility" },
  { id: "projectileSpeed", name: "Projectile Speed", weaponTypes: RANGED_EXCEPT_ARCHGUN, signRule: "either", category: "utility" },

  // Melee only
  { id: "meleeDamage", name: "Melee Damage", weaponTypes: MELEE, signRule: "positiveOnly", category: "core" },
  { id: "attackSpeed", name: "Attack Speed", weaponTypes: MELEE, signRule: "either", category: "core" },
  { id: "range", name: "Range", weaponTypes: MELEE, signRule: "either", category: "utility" },
  { id: "comboDuration", name: "Combo Duration", weaponTypes: MELEE, signRule: "either", category: "utility" },
  { id: "heavyAttackEfficiency", name: "Heavy Attack Efficiency", weaponTypes: MELEE, signRule: "either", category: "utility" },
  { id: "additionalComboCountChance", name: "Additional Combo Count Chance", weaponTypes: MELEE, signRule: "positiveOnly", category: "utility" },
  { id: "chanceToGainComboCount", name: "Chance to Gain Combo Count", weaponTypes: MELEE, signRule: "negativeOnly", category: "utility" },
  { id: "criticalChanceForSlideAttack", name: "Critical Chance for Slide Attack", weaponTypes: MELEE, signRule: "either", category: "utility" },
  { id: "finisherDamage", name: "Finisher Damage", weaponTypes: MELEE, signRule: "either", category: "utility" },
  { id: "initialCombo", name: "Initial Combo", weaponTypes: MELEE, signRule: "either", category: "utility" },
];
