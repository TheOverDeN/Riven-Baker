import { BakerHatIcon, DiamondIcon } from "./Icons";

// Top bar with the logo and wordmark. This is where the baking theme lives;
// the working area below sticks to normal game terms.

export function Header() {
  return (
    <header className="border-b border-line">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <BakerHatIcon className="h-11 w-11 text-gold" />
          <div>
            <p className="font-serif text-2xl font-semibold leading-none text-gold sm:text-3xl">Riven Baker</p>
            <p className="mt-1.5 text-[0.65rem] uppercase tracking-[0.3em] text-muted">Good rolls, from scratch.</p>
          </div>
        </div>
        <p className="hidden items-center gap-2 text-sm text-muted sm:flex">
          <DiamondIcon className="h-3.5 w-3.5 text-violet" />
          Warframe Riven planner
        </p>
      </div>
    </header>
  );
}
