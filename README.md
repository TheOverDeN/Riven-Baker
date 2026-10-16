# Riven Baker

A step by step planner for Warframe rivens. Pick the weapon class, the buffs you
want and the curses you can live with, and it tells you how to get there: what
to cycle for, when to lock a trait, and when to use the Riven Splicer (added in
Update 44.1).

Each step shows the chance per Kuva cycle, the average number of cycles, and how
many cycles you need to be 90% sure of hitting it.

## Running it

```
npm install
npm run dev      # local dev server
npm test         # unit and UI tests
npm run check    # lint + formatting + tests + production build (what CI runs)
```

## How it works

```
src/
  data/        raw game data: stats, splice recipes, the "harmless curses" preset,
               and the assumptions the odds rely on
  domain/      the rules, plain TypeScript with no React (all of it is unit tested)
    catalog.ts   lookups: what can roll where, which recipes work on a weapon class
    odds.ts      chance of a Kuva cycle giving what you want
    planner.ts   turns a target riven into ordered steps
    target.ts    rules for editing the target from the UI
  components/  React components that only render and pass clicks back up
  App.test.tsx UI tests that click through the app like a player
```

**Exact odds, not sampling.** `odds.ts` walks through every possible outcome of
one cycle (layout, buffs, curse), weighs each one, and adds up the ones that
match. The numbers are the same every time and easy to test against hand-worked
cases.

**Locking.** The planner compares cycling with and without a trait lock and
picks the cheaper one. Locked cycles count double because they cost double Kuva.
After "lock whichever wanted buff shows up first", the odds depend on which buff
got locked, so that step is worked out as a weighted mix of those cases.

**Splicing.** Splicing freezes the buff/curse layout of a riven. A spliced plan
therefore gets the layout and both ingredients first, splices, and only then
cycles for the rest. It often comes out far cheaper than chasing the same
layout with cycling alone.

**Typed stat ids.** Stat ids are derived from the data files, so a typo such as
`"critcalChance"` anywhere in the code fails to compile.

## What is not verified yet

These are written down in `src/data/assumptions.ts` and shown in the app:

- the odds of each stat rolling (assumed equal),
- the odds of each buff/curse layout (assumed equal),
- Kuva cost per cycle (costs are shown in cycles instead),
- Impact, Puncture and Slash depend on the weapon's damage split.

## Deployment and security

Hosted on Netlify (`netlify.toml`). The build runs the tests first, and every
page is served with a strict content security policy: the app is fully static,
bundles its own fonts and loads nothing from other sites. GitHub Actions runs
lint, formatting, tests and the build on every push.

## Sources

- Stats and sign rules: [WARFRAME Wiki, Riven Mods](https://wiki.warframe.com/w/Riven_Mods)
- Splice recipes and rules: [WARFRAME Wiki, Riven Splicer](https://wiki.warframe.com/w/Riven_Splicer),
  checked against the in-game splicing menu (`data/screenshots/`)

Fan-made, not affiliated with Digital Extremes.
