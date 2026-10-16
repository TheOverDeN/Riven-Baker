import { STATS } from "../data/stats";
import { RECIPES, SPLICED_STATS } from "../data/recipes";
import type { Recipe, SplicedStatDefinition, StatCategory, StatDefinition, StatId, WeaponType } from "./types";

// Lookups over the raw data files. The rest of the app asks questions like
// "what can roll as a curse on a shotgun?" through here, so the data files
// themselves never need to know how they are used.

const statsById = new Map<StatId, StatDefinition>(STATS.map((stat) => [stat.id, stat]));
const splicedStatsById = new Map<StatId, SplicedStatDefinition>(SPLICED_STATS.map((stat) => [stat.id, stat]));

export function statName(id: StatId): string {
  return statsById.get(id)?.name ?? splicedStatsById.get(id)?.name ?? id;
}

export function statCategory(id: StatId): StatCategory | null {
  return statsById.get(id)?.category ?? null;
}

export function isSplicedStat(id: StatId): boolean {
  return splicedStatsById.has(id);
}

function canRollOn(id: StatId, weaponType: WeaponType): boolean {
  return statsById.get(id)?.weaponTypes.includes(weaponType) ?? false;
}

// Stats that a Kuva cycle can put into a buff slot on this weapon type.
export function positivePool(weaponType: WeaponType): StatId[] {
  return STATS.filter((stat) => stat.weaponTypes.includes(weaponType) && stat.signRule !== "negativeOnly").map(
    (stat) => stat.id,
  );
}

// Stats that a Kuva cycle can put into the curse slot on this weapon type.
export function negativePool(weaponType: WeaponType): StatId[] {
  return STATS.filter((stat) => stat.weaponTypes.includes(weaponType) && stat.signRule !== "positiveOnly").map(
    (stat) => stat.id,
  );
}

// The recipes for a spliced stat that actually work on this weapon type.
// A recipe works when both ingredients can roll on the weapon type.
export function recipesFor(splicedStat: StatId, weaponType: WeaponType): Recipe[] {
  return RECIPES.filter(
    (recipe) =>
      recipe.result === splicedStat && recipe.ingredients.every((ingredient) => canRollOn(ingredient, weaponType)),
  );
}

// "Toxin + Cold", or "Damage + Zoom or Damage + Multishot" for stats with two recipes.
export function ingredientsText(splicedStat: StatId, weaponType: WeaponType): string {
  return recipesFor(splicedStat, weaponType)
    .map((recipe) => recipe.ingredients.map(statName).join(" + "))
    .join(" or ");
}

// Spliced stats a player can aim for on this weapon type.
export function splicedStatsFor(weaponType: WeaponType): SplicedStatDefinition[] {
  return SPLICED_STATS.filter((stat) => recipesFor(stat.id, weaponType).length > 0);
}
