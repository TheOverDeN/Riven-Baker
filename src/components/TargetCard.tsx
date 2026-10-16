import { ASSUMPTION_NOTES } from "../data/assumptions";
import { statName } from "../domain/catalog";
import { formatChance, formatCycles } from "../domain/format";
import type { Plan, PlanStep } from "../domain/planner";
import type { RivenTarget } from "../domain/types";
import { weaponLabel } from "./labels";

// The right-hand card: what you are aiming for, what it will roughly cost,
// and the numbered plan to get there. Each step shows its title and summary;
// the details and odds fold out on demand to keep the plan easy to scan.

interface TargetCardProps {
  target: RivenTarget;
  plan: Plan;
}

export function TargetCard({ target, plan }: TargetCardProps) {
  return (
    <div className="rounded-xl border border-violet/40 border-t-4 border-t-violet bg-panel p-5 sm:p-7">
      <p className="text-xs uppercase tracking-[0.25em] text-muted">Your target</p>
      <h2 className="mt-2 font-serif text-3xl text-ink sm:text-4xl">{weaponLabel(target.weaponType)} Riven</h2>
      <TargetSummary target={target} />

      <hr className="my-5 border-line" />

      {plan.ok ? (
        <>
          <CostSummary cycles={plan.expectedCycleCost} />
          <hr className="my-5 border-line" />
          <RollingPlan steps={plan.steps} />
        </>
      ) : (
        <ul className="space-y-1 text-sm text-muted">
          {plan.problems.map((problem) => (
            <li key={problem}>{problem}</li>
          ))}
        </ul>
      )}

      <details className="mt-6 border-t border-line pt-4 text-sm text-muted">
        <summary className="cursor-pointer text-faint hover:text-ink">What these numbers assume</summary>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          {ASSUMPTION_NOTES.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      </details>
    </div>
  );
}

// "+ Critical Chance / + Viral / - Any of 9 accepted curses"
function TargetSummary({ target }: { target: RivenTarget }) {
  const curses = target.acceptableNegatives;
  const curseLine =
    curses.length === 0
      ? "No curse"
      : curses.length === 1
        ? statName(curses[0])
        : `Any of ${curses.length} accepted curses`;

  return (
    <ul className="mt-3 space-y-1 font-serif text-xl">
      {target.positives.length === 0 && <li className="text-faint">No buffs picked yet</li>}
      {target.positives.map((id) => (
        <li key={id} className="text-violet">
          + {statName(id)}
        </li>
      ))}
      <li className={curses.length === 0 ? "text-muted" : "text-curse"}>
        {curses.length === 0 ? curseLine : `− ${curseLine}`}
      </li>
    </ul>
  );
}

function CostSummary({ cycles }: { cycles: number }) {
  const [amount, unit] = splitCycles(cycles);
  return (
    <div>
      <p className="font-serif text-xl text-ink">Expected cost</p>
      <p className="mt-1 font-serif text-6xl font-semibold leading-none text-violet">{amount}</p>
      <p className="mt-2 text-lg text-violet">{unit} worth of Kuva</p>
      <p className="mt-1 text-sm text-muted">
        Locked cycles count double. This is an average; see each step for bad luck.
      </p>
    </div>
  );
}

function RollingPlan({ steps }: { steps: PlanStep[] }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.25em] text-muted">Your rolling plan</p>
      <ol className="mt-4">
        {steps.map((step, index) => (
          <PlanStepItem key={step.title} number={index + 1} step={step} isLast={index === steps.length - 1} />
        ))}
      </ol>
    </div>
  );
}

function PlanStepItem({ number, step, isLast }: { number: number; step: PlanStep; isLast: boolean }) {
  return (
    <li className="relative flex gap-4 pb-6 last:pb-0">
      {/* The dashed line linking this step to the next one */}
      {!isLast && (
        <span aria-hidden="true" className="absolute left-4 top-9 bottom-1 border-l border-dashed border-violet/40" />
      )}

      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet text-sm font-semibold text-ground">
        {number}
      </span>

      <div className="min-w-0 flex-1">
        <h3 className="font-medium text-ink">{step.title}</h3>
        <p className="mt-0.5 text-sm text-muted">{step.summary}</p>

        <details className="group mt-1.5 text-sm">
          <summary className="cursor-pointer list-none text-muted hover:text-ink">
            <span className="mr-1.5 inline-block text-[0.6rem] transition-transform group-open:rotate-90">&#9654;</span>
            {expandLabel(step)}
          </summary>
          <StepDetails step={step} />
        </details>
      </div>
    </li>
  );
}

function StepDetails({ step }: { step: PlanStep }) {
  return (
    <div className="mt-2 space-y-3">
      <ul className="space-y-1 text-muted">
        {step.details.map((detail) => (
          <li key={detail}>{detail}</li>
        ))}
      </ul>

      {step.odds && (
        <dl className="grid grid-cols-3 gap-2">
          <Figure label="Per cycle" value={formatChance(step.odds.chancePerCycle)} />
          <Figure label="On average" value={formatCycles(step.odds.expectedCycles)} />
          <Figure label="90% sure within" value={formatCycles(step.odds.cyclesFor90Percent)} />
        </dl>
      )}
      {step.odds && step.odds.costMultiplier > 1 && (
        <p className="text-xs text-curse">Locked: each cycle costs {step.odds.costMultiplier}x Kuva.</p>
      )}
    </div>
  );
}

function Figure({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-raised px-3 py-2">
      <dt className="text-xs text-faint">{label}</dt>
      <dd className="font-medium text-ink">{value}</dd>
    </div>
  );
}

function expandLabel(step: PlanStep): string {
  if (!step.odds) return "How splicing works";
  return step.details.length > 1 ? "Requirements & odds" : "See odds";
}

// "1,132 cycles" -> ["1,132", "cycles"], so the number can be shown big.
function splitCycles(cycles: number): [string, string] {
  const text = formatCycles(cycles);
  const space = text.lastIndexOf(" ");
  return space === -1 ? [text, ""] : [text.slice(0, space), text.slice(space + 1)];
}
