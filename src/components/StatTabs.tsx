import { STAT_TABS, type StatTab } from "./labels";
import { useRovingFocus } from "./useRovingFocus";

// The Core / Damage types / Utility / Spliced tabs, wired up as proper ARIA
// tabs so screen readers announce them as tabs and the arrow keys work.

export const STAT_PANEL_ID = "stat-panel";

export function statTabId(tab: StatTab): string {
  return `stat-tab-${tab}`;
}

const TAB_IDS = STAT_TABS.map((tab) => tab.id);

interface StatTabsProps {
  active: StatTab;
  onChange: (tab: StatTab) => void;
}

export function StatTabs({ active, onChange }: StatTabsProps) {
  const { register, onKeyDown, tabIndexFor } = useRovingFocus(TAB_IDS, active, onChange);

  return (
    <div
      role="tablist"
      aria-label="Stat groups"
      onKeyDown={onKeyDown}
      className="flex gap-1 overflow-x-auto border-b border-line"
    >
      {STAT_TABS.map(({ id, label }) => {
        const selected = id === active;
        return (
          <button
            key={id}
            ref={register(id)}
            id={statTabId(id)}
            type="button"
            role="tab"
            aria-selected={selected}
            aria-controls={STAT_PANEL_ID}
            tabIndex={tabIndexFor(id)}
            onClick={() => onChange(id)}
            className={`-mb-px shrink-0 border-b-2 px-2.5 py-2 text-sm transition-colors sm:px-4 ${
              selected ? "border-violet text-ink" : "border-transparent text-muted hover:text-ink"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
