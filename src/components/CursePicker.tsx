import { useState } from "react";
import { negativePool, statName } from "../domain/catalog";
import type { RivenTarget, StatId } from "../domain/types";
import { ChevronIcon } from "./Icons";

// Section 03: which curses the player would accept.
//
// Folded by default, because most people sort out their buffs first. The
// header always shows a short summary, so the current choice is visible even
// while the list is closed. Picking nothing means "no curse at all".

interface CursePickerProps {
  target: RivenTarget;
  onToggle: (id: StatId) => void;
  onAcceptHarmless: () => void;
  onClear: () => void;
}

export function CursePicker({ target, onToggle, onAcceptHarmless, onClear }: CursePickerProps) {
  const [open, setOpen] = useState(false);
  const accepted = target.acceptableNegatives.length;

  return (
    <section>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-start gap-4 text-left"
      >
        <span className="w-6 pt-1 font-medium tabular-nums text-violet">03</span>
        <span className="flex min-w-0 flex-1 items-start justify-between gap-4 border-l border-line pl-4">
          <span>
            <span className="block font-serif text-xl text-ink">Acceptable curses</span>
            <span className="mt-1 block text-sm text-muted">
              {accepted === 0 ? "None selected · aiming for no curse" : `${accepted} selected · any one is fine`}
            </span>
          </span>
          <ChevronIcon
            className={`mt-1.5 h-5 w-5 shrink-0 text-muted transition-transform ${open ? "rotate-180" : ""}`}
          />
        </span>
      </button>

      {open && (
        <div className="mt-4 space-y-4 pl-10 sm:pl-14">
          <p className="text-sm text-muted">Rivens with a curse get stronger buffs.</p>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onAcceptHarmless}
              className="rounded-md border border-curse/50 px-3 py-1.5 text-sm text-curse hover:bg-curse/10"
            >
              + Add common harmless curses
            </button>
            {accepted > 0 && (
              <button
                type="button"
                onClick={onClear}
                className="rounded-md px-3 py-1.5 text-sm text-muted hover:text-ink"
              >
                Clear all
              </button>
            )}
          </div>
          <p className="text-xs text-faint">
            A rule of thumb, not a guarantee. Check that none of them matter for your weapon or the faction you farm.
          </p>

          <ul className="grid gap-x-8 sm:grid-cols-2">
            {negativePool(target.weaponType).map((id) => {
              const isBuff = target.positives.includes(id);
              return (
                <li key={id} className="border-b border-line/70">
                  <label
                    className={`flex items-center gap-3 py-2.5 ${isBuff ? "cursor-not-allowed opacity-45" : "cursor-pointer"}`}
                  >
                    <input
                      type="checkbox"
                      checked={target.acceptableNegatives.includes(id)}
                      disabled={isBuff}
                      onChange={() => onToggle(id)}
                      className="h-5 w-5 shrink-0 accent-curse"
                    />
                    <span className="text-ink">{statName(id)}</span>
                    {isBuff && <span className="text-xs text-faint">picked as a buff</span>}
                  </label>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </section>
  );
}
