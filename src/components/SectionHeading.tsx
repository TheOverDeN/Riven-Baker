import type { ReactNode } from "react";

// The "01 | Choose a weapon class" heading used by each builder section.

interface SectionHeadingProps {
  number: number;
  title: string;
  aside?: ReactNode;
  hint?: ReactNode;
}

export function SectionHeading({ number, title, aside, hint }: SectionHeadingProps) {
  return (
    <div className="flex items-start gap-4">
      <span className="w-6 pt-1 font-medium tabular-nums text-violet">{String(number).padStart(2, "0")}</span>
      <div className="min-w-0 flex-1 border-l border-line pl-4">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4">
          <h2 className="font-serif text-xl text-ink">{title}</h2>
          {aside && <span className="text-sm text-muted">{aside}</span>}
        </div>
        {hint && <p className="mt-1 text-sm text-muted">{hint}</p>}
      </div>
    </div>
  );
}
