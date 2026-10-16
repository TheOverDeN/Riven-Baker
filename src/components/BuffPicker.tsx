import { useRef, useState } from "react";
import {
  ingredientsText,
  isSplicedStat,
  positivePool,
  splicedStatsFor,
  statCategory,
  statName,
} from "../domain/catalog";
import { MAX_BUFFS } from "../domain/target";
import type { RivenTarget, StatId } from "../domain/types";
import { InfoIcon, SearchIcon } from "./Icons";
import { weaponLabel, type StatTab } from "./labels";
import { STAT_PANEL_ID, StatTabs, statTabId } from "./StatTabs";
import { SectionHeading } from "./SectionHeading";

// Section 02: picking the buffs.
//
// The picked buffs sit at the top as removable chips so they stay visible
// while browsing. Below that, the stats are split into tabs to keep the list
// short. Typing in the search box ignores the tabs and searches everything,
// including spliced stats by their ingredients (searching "toxin" also finds
// Viral, Gas and Corrosive).

interface BuffPickerProps {
  target: RivenTarget;
  onToggle: (id: StatId) => void;
}

interface StatOption {
  id: StatId;
  name: string;
  tab: StatTab;
  // For spliced stats: what they are made from.
  ingredients?: string;
}

export function BuffPicker({ target, onToggle }: BuffPickerProps) {
  const [tab, setTab] = useState<StatTab>("core");
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  const options = buffOptions(target);
  const searching = query.trim().length > 0;
  const visible = searching
    ? options.filter((option) => matchesQuery(option, query))
    : options.filter((option) => option.tab === tab);

  const isFull = target.positives.length >= MAX_BUFFS;
  const hasSplice = target.positives.some(isSplicedStat);
  // A full riven can still swap its spliced stat for another one.
  const canPick = (id: StatId) => target.positives.includes(id) || !isFull || (isSplicedStat(id) && hasSplice);
  const pickedSplice = target.positives.find(isSplicedStat);

  return (
    <section className="space-y-4">
      <SectionHeading
        number={2}
        title="Pick your buffs"
        aside={`${target.positives.length} of ${MAX_BUFFS} selected`}
        hint="Choose 2 or 3 buffs, including up to one spliced stat."
      />

      <div className="space-y-4 pl-10 sm:pl-14">
        <SelectedBuffs target={target} onRemove={onToggle} onAddClick={() => searchRef.current?.focus()} />

        <label className="flex items-center gap-3 rounded-lg border border-line bg-panel px-4 py-3 focus-within:border-violet">
          <SearchIcon className="h-5 w-5 shrink-0 text-muted" />
          <input
            ref={searchRef}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Find a stat..."
            className="w-full bg-transparent text-ink placeholder:text-faint focus:outline-none"
          />
        </label>

        {searching ? (
          <p className="text-sm text-muted">Showing matches from every tab.</p>
        ) : (
          <StatTabs active={tab} onChange={setTab} />
        )}

        <div
          id={searching ? undefined : STAT_PANEL_ID}
          role={searching ? undefined : "tabpanel"}
          aria-labelledby={searching ? undefined : statTabId(tab)}
        >
          {visible.length > 0 ? (
            <ul className="grid gap-x-8 sm:grid-cols-2">
              {visible.map((option) => (
                <StatRow
                  key={option.id}
                  option={option}
                  checked={target.positives.includes(option.id)}
                  disabled={!canPick(option.id)}
                  onToggle={() => onToggle(option.id)}
                />
              ))}
            </ul>
          ) : (
            <p className="py-2 text-sm text-muted">
              No buff called "{query.trim()}" on a {weaponLabel(target.weaponType).toLowerCase()} riven.
            </p>
          )}
        </div>

        {pickedSplice && (
          <p className="flex items-center gap-2 text-sm text-muted">
            <InfoIcon className="h-4 w-4 shrink-0" />
            {statName(pickedSplice)} combines {ingredientsText(pickedSplice, target.weaponType)}.
          </p>
        )}
      </div>
    </section>
  );
}

// The chips for picked buffs, plus a dashed placeholder while there is room for more.
function SelectedBuffs({
  target,
  onRemove,
  onAddClick,
}: {
  target: RivenTarget;
  onRemove: (id: StatId) => void;
  onAddClick: () => void;
}) {
  const count = target.positives.length;
  const placeholder = count < 2 ? "+ pick a buff" : count < MAX_BUFFS ? "+ optional third buff" : null;

  return (
    <div className="flex flex-wrap gap-2">
      {target.positives.map((id) => (
        <span
          key={id}
          className="flex items-center gap-1 rounded-md bg-violet py-1.5 pl-3 pr-1.5 text-sm font-medium text-ground"
        >
          {statName(id)}
          <button
            type="button"
            onClick={() => onRemove(id)}
            aria-label={`Remove ${statName(id)}`}
            className="rounded px-1.5 leading-none hover:bg-ground/15"
          >
            &times;
          </button>
        </span>
      ))}
      {placeholder && (
        <button
          type="button"
          onClick={onAddClick}
          className="rounded-md border border-dashed border-faint px-3 py-1.5 text-sm text-muted hover:border-violet hover:text-ink"
        >
          {placeholder}
        </button>
      )}
    </div>
  );
}

function StatRow({
  option,
  checked,
  disabled,
  onToggle,
}: {
  option: StatOption;
  checked: boolean;
  disabled: boolean;
  onToggle: () => void;
}) {
  return (
    <li className="border-b border-line/70">
      <label
        className={`flex items-center gap-3 py-2.5 ${disabled ? "cursor-not-allowed opacity-45" : "cursor-pointer"}`}
      >
        <input
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={onToggle}
          className="h-5 w-5 shrink-0 accent-violet"
        />
        <span className="min-w-0">
          <span className="block text-ink">{option.name}</span>
          {option.ingredients && <span className="block text-xs text-faint">{option.ingredients}</span>}
        </span>
      </label>
    </li>
  );
}

// Everything that can be a buff on this weapon type, tagged with its tab.
function buffOptions(target: RivenTarget): StatOption[] {
  const normal = positivePool(target.weaponType).map((id) => ({
    id,
    name: statName(id),
    tab: statCategory(id) ?? "core",
  }));
  const spliced = splicedStatsFor(target.weaponType).map(({ id, name }) => ({
    id,
    name,
    tab: "spliced" as const,
    ingredients: ingredientsText(id, target.weaponType),
  }));
  return [...normal, ...spliced];
}

function matchesQuery(option: StatOption, query: string): boolean {
  const needle = query.trim().toLowerCase();
  return option.name.toLowerCase().includes(needle) || (option.ingredients?.toLowerCase().includes(needle) ?? false);
}
