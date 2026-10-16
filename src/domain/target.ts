import { harmlessCurses } from "../data/cursePresets";
import { isSplicedStat, negativePool, positivePool, recipesFor } from "./catalog";
import type { RivenTarget, StatId, WeaponType } from "./types";

// The rules for editing a target from the UI. Keeping them here (and not in
// the React components) means the components only render, and these rules
// can be tested without a browser.

export const MAX_BUFFS = 3;

export function emptyTarget(weaponType: WeaponType): RivenTarget {
  return { weaponType, positives: [], acceptableNegatives: [] };
}

// Switching weapon type keeps whatever picks still make sense on the new type.
export function changeWeaponType(target: RivenTarget, weaponType: WeaponType): RivenTarget {
  const buffs = positivePool(weaponType);
  const curses = negativePool(weaponType);
  return {
    weaponType,
    positives: target.positives.filter((id) =>
      isSplicedStat(id) ? recipesFor(id, weaponType).length > 0 : buffs.includes(id),
    ),
    acceptableNegatives: target.acceptableNegatives.filter((id) => curses.includes(id)),
  };
}

// Clicking a buff adds or removes it.
// Picking a second spliced stat swaps out the first one, since a riven can only hold one.
// A stat that becomes a buff is dropped from the accepted curses.
export function toggleBuff(target: RivenTarget, id: StatId): RivenTarget {
  if (target.positives.includes(id)) {
    return { ...target, positives: target.positives.filter((existing) => existing !== id) };
  }

  const withoutOtherSplice = isSplicedStat(id) ? target.positives.filter((existing) => !isSplicedStat(existing)) : target.positives;
  if (withoutOtherSplice.length >= MAX_BUFFS) return target;

  return {
    ...target,
    positives: [...withoutOtherSplice, id],
    acceptableNegatives: target.acceptableNegatives.filter((existing) => existing !== id),
  };
}

export function toggleCurse(target: RivenTarget, id: StatId): RivenTarget {
  if (target.positives.includes(id)) return target;

  const acceptableNegatives = target.acceptableNegatives.includes(id)
    ? target.acceptableNegatives.filter((existing) => existing !== id)
    : [...target.acceptableNegatives, id];
  return { ...target, acceptableNegatives };
}

// The "harmless curses" button. Adds the preset on top of whatever is already
// picked, skipping anything that is a buff or can't be a curse on this weapon type.
export function acceptHarmlessCurses(target: RivenTarget): RivenTarget {
  const curses = negativePool(target.weaponType);
  const additions = harmlessCurses(target.weaponType).filter(
    (id) => curses.includes(id) && !target.positives.includes(id) && !target.acceptableNegatives.includes(id),
  );
  return { ...target, acceptableNegatives: [...target.acceptableNegatives, ...additions] };
}

export function clearCurses(target: RivenTarget): RivenTarget {
  return { ...target, acceptableNegatives: [] };
}
