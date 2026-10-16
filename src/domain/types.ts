// Shared types for the whole planner. Everything else in the domain folder
// builds on these, so keep them small and boring.

import type { RegularStatId } from "../data/stats";
import type { SplicedStatId } from "../data/recipes";

export type WeaponType = "rifle" | "shotgun" | "pistol" | "archgun" | "melee";

// Some stats can only ever roll as a buff (elementals, Damage), and one melee
// stat can only ever roll as a curse. Everything else can be either.
export type SignRule = "either" | "positiveOnly" | "negativeOnly";

// Stat ids are not plain strings: they are read straight from the data files,
// so a typo like "critcalChance" anywhere in the code is a compile error.
export type { RegularStatId, SplicedStatId };
export type StatId = RegularStatId | SplicedStatId;

// Groups used for the tabs in the stat picker.
export type StatCategory = "core" | "damageTypes" | "utility";

// A normal riven stat, the kind you get from Kuva cycling.
// The Id parameter only exists so the data file can be checked against this
// shape before its own ids are known; everywhere else uses the default.
export interface StatDefinition<Id extends string = RegularStatId> {
  id: Id;
  name: string;
  weaponTypes: readonly WeaponType[];
  signRule: SignRule;
  category: StatCategory;
}

// A stat that only exists through the Riven Splicer. It can never be rolled
// by cycling, only made by combining two normal stats.
export interface SplicedStatDefinition<Id extends string = SplicedStatId> {
  id: Id;
  name: string;
}

// One way of making a spliced stat. Some spliced stats have two recipes,
// for example Weak Point Damage comes from Damage + Zoom or Damage + Multishot.
export interface Recipe {
  result: SplicedStatId;
  ingredients: readonly [RegularStatId, RegularStatId];
}

// How many buffs and curses a riven has. Rivens always have 2 or 3 buffs
// and at most one curse.
export interface Layout {
  positives: 2 | 3;
  negatives: 0 | 1;
}

// What a single Kuva cycle produced. Positives can include a spliced stat,
// because the spliced stat stays on the riven and takes up a buff slot.
export interface RolledRiven {
  positives: readonly StatId[];
  negative: StatId | null;
}

// What the player wants to end up with.
// An empty acceptableNegatives list means "I want no curse at all".
export interface RivenTarget {
  weaponType: WeaponType;
  positives: readonly StatId[];
  acceptableNegatives: readonly StatId[];
}
