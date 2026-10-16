import { useMemo, useState } from "react";
import { BuffPicker } from "./components/BuffPicker";
import { CursePicker } from "./components/CursePicker";
import { Header } from "./components/Header";
import { SectionHeading } from "./components/SectionHeading";
import { TargetCard } from "./components/TargetCard";
import { WeaponTypePicker } from "./components/WeaponTypePicker";
import { planRiven } from "./domain/planner";
import {
  acceptHarmlessCurses,
  changeWeaponType,
  clearCurses,
  emptyTarget,
  toggleBuff,
  toggleCurse,
} from "./domain/target";

// The whole page. The left column builds the target riven, the right column
// shows the plan for it. All the actual rules live in src/domain; this file
// only holds the current target and passes edits through to those rules.

export function App() {
  const [target, setTarget] = useState(() => emptyTarget("rifle"));

  // Working out the odds walks through every possible cycle outcome,
  // so only redo it when the target actually changes.
  const plan = useMemo(() => planRiven(target), [target]);

  return (
    <div className="min-h-screen bg-ground">
      <Header />

      <main className="mx-auto grid max-w-6xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,27rem)] lg:gap-14">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-violet">The workbench</p>
          <h1 className="mt-3 font-serif text-4xl font-semibold text-ink sm:text-5xl lg:text-[2.6rem]">
            A recipe for your next Riven.
          </h1>
          <p className="mt-2 text-xl text-muted">Choose your stats. Find your way to the roll.</p>

          <div className="mt-8 space-y-8 border-t border-line pt-8">
            <section className="space-y-4">
              <SectionHeading number={1} title="Choose a weapon class" />
              <div className="pl-10 sm:pl-14">
                <WeaponTypePicker
                  value={target.weaponType}
                  onChange={(weaponType) => setTarget((current) => changeWeaponType(current, weaponType))}
                />
              </div>
            </section>

            <div className="border-t border-line pt-8">
              <BuffPicker target={target} onToggle={(id) => setTarget((current) => toggleBuff(current, id))} />
            </div>

            <div className="border-t border-line pt-8">
              <CursePicker
                target={target}
                onToggle={(id) => setTarget((current) => toggleCurse(current, id))}
                onAcceptHarmless={() => setTarget(acceptHarmlessCurses)}
                onClear={() => setTarget(clearCurses)}
              />
            </div>
          </div>
        </div>

        <aside className="lg:sticky lg:top-6 lg:self-start">
          <TargetCard target={target} plan={plan} />
        </aside>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-wrap justify-between gap-2 px-4 py-4 text-xs text-faint sm:px-6">
          <p>Made for the next good roll.</p>
          <p>
            Fan-made, not affiliated with Digital Extremes. Data from the{" "}
            <a className="underline hover:text-ink" href="https://wiki.warframe.com/w/Riven_Splicer">
              WARFRAME Wiki
            </a>{" "}
            and the in-game splicing menu.
          </p>
        </div>
      </footer>
    </div>
  );
}
