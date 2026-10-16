import { WEAPON_TYPES } from "../data/stats";
import type { WeaponType } from "../domain/types";
import { weaponLabel } from "./labels";
import { useRovingFocus } from "./useRovingFocus";

// A segmented control for the weapon class. Only one can be active, so it is
// a radio group: Tab reaches the current class, the arrow keys switch class.

interface WeaponTypePickerProps {
  value: WeaponType;
  onChange: (weaponType: WeaponType) => void;
}

export function WeaponTypePicker({ value, onChange }: WeaponTypePickerProps) {
  const { register, onKeyDown, tabIndexFor } = useRovingFocus(WEAPON_TYPES, value, onChange);

  return (
    <div
      role="radiogroup"
      aria-label="Weapon class"
      onKeyDown={onKeyDown}
      className="grid grid-cols-5 overflow-hidden rounded-lg border border-line"
    >
      {WEAPON_TYPES.map((weaponType) => {
        const selected = weaponType === value;
        return (
          <button
            key={weaponType}
            ref={register(weaponType)}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={tabIndexFor(weaponType)}
            onClick={() => onChange(weaponType)}
            className={`border-l border-line px-1 py-2.5 text-sm transition-colors first:border-l-0 ${
              selected ? "bg-violet font-medium text-ground" : "text-ink hover:bg-raised"
            }`}
          >
            {weaponLabel(weaponType)}
          </button>
        );
      })}
    </div>
  );
}
