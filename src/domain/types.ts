// Shared types for the whole planner. Everything else in the domain folder
// builds on these, so keep them small and boring.

export type WeaponType = "rifle" | "shotgun" | "pistol" | "archgun" | "melee";

// Some stats can only ever roll as a buff (elementals, Damage), and one melee
// stat can only ever roll as a curse. Everything else can be either.
export type SignRule = "either" | "positiveOnly" | "negativeOnly";

export type StatId = string;

// Groups used for the tabs in the stat picker.
export type StatCategory = "core" | "damageTypes" | "utility";

// A normal riven stat, the kind you get from Kuva cycling.
export interface StatDefinition {
  id: StatId;
  name: string;
  weaponTypes: readonly WeaponType[];
  signRule: SignRule;
  category: StatCategory;
}

// A stat that only exists through the Riven Splicer. It can never be rolled
// by cycling, only made by combining two normal stats.
export interface SplicedStatDefinition {
  id: StatId;
  name: string;
}

// One way of making a spliced stat. Some spliced stats have two recipes,
// for example Weak Point Damage comes from Damage + Zoom or Damage + Multishot.
export interface Recipe {
  result: StatId;
  ingredients: readonly [StatId, StatId];
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
