import type { StatCategory, WeaponType } from "../domain/types";

// Display text for values the domain stores as ids.

const WEAPON_LABELS: Record<WeaponType, string> = {
  rifle: "Rifle",
  shotgun: "Shotgun",
  pistol: "Pistol",
  archgun: "Archgun",
  melee: "Melee",
};

export function weaponLabel(weaponType: WeaponType): string {
  return WEAPON_LABELS[weaponType];
}

// The tabs in the buff picker: the three stat categories plus spliced stats.
export type StatTab = StatCategory | "spliced";

export const STAT_TABS: readonly { id: StatTab; label: string }[] = [
  { id: "core", label: "Core" },
  { id: "damageTypes", label: "Damage types" },
  { id: "utility", label: "Utility" },
  { id: "spliced", label: "Spliced" },
];
