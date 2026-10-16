import type { StatId, WeaponType } from "../domain/types";

// The "harmless curses" quick pick. These are curses players commonly accept
// because they barely hurt most builds. It is a rule of thumb, not a fact:
// Impact or Puncture can matter on a weapon that relies on them, and a
// faction curse matters if you mostly fight that faction. The UI says so.

const RANGED_HARMLESS: readonly StatId[] = [
  "zoom",
  "impact",
  "puncture",
  "weaponRecoil",
  "damageToCorpus",
  "damageToGrineer",
  "damageToInfested",
];

const MELEE_HARMLESS: readonly StatId[] = [
  "impact",
  "puncture",
  "finisherDamage",
  "damageToCorpus",
  "damageToGrineer",
  "damageToInfested",
];

export function harmlessCurses(weaponType: WeaponType): readonly StatId[] {
  return weaponType === "melee" ? MELEE_HARMLESS : RANGED_HARMLESS;
}
