import { useRef, type KeyboardEvent } from "react";

// Keyboard support for a row of options where exactly one is active, like the
// stat tabs and the weapon class picker.
//
// Only the active option can be reached with Tab, so keyboard users jump over
// the whole row in one press. Inside the row, the arrow keys move to the
// previous or next option (wrapping around), and Home / End jump to the ends.
// Moving also selects, which is what players expect from tabs and radio buttons.

const STEP_BY_KEY: Partial<Record<string, "previous" | "next" | "first" | "last">> = {
  ArrowLeft: "previous",
  ArrowUp: "previous",
  ArrowRight: "next",
  ArrowDown: "next",
  Home: "first",
  End: "last",
};

export function useRovingFocus<T extends string>(items: readonly T[], active: T, onSelect: (item: T) => void) {
  const elements = useRef(new Map<T, HTMLElement>());

  const register = (item: T) => (element: HTMLElement | null) => {
    if (element) elements.current.set(item, element);
    else elements.current.delete(item);
  };

  const onKeyDown = (event: KeyboardEvent) => {
    const step = STEP_BY_KEY[event.key];
    if (!step) return;
    event.preventDefault();

    const index = items.indexOf(active);
    const last = items.length - 1;
    const nextIndex = {
      previous: index === 0 ? last : index - 1,
      next: index === last ? 0 : index + 1,
      first: 0,
      last,
    }[step];

    const next = items[nextIndex];
    onSelect(next);
    elements.current.get(next)?.focus();
  };

  const tabIndexFor = (item: T) => (item === active ? 0 : -1);

  return { register, onKeyDown, tabIndexFor };
}
