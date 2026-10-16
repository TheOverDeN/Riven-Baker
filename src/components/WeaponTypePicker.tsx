import { WEAPON_TYPES } from "../data/stats";
import type { WeaponType } from "../domain/types";
import { weaponLabel } from "./labels";

// A segmented control for the weapon class. Only one can be active.

interface WeaponTypePickerProps {
  value: WeaponType;
  onChange: (weaponType: WeaponType) => void;
}

export function WeaponTypePicker({ value, onChange }: WeaponTypePickerProps) {
  return (
    <div role="radiogroup" aria-label="Weapon class" className="grid grid-cols-5 overflow-hidden rounded-lg border border-line">
      {WEAPON_TYPES.map((weaponType) => {
        const selected = weaponType === value;
        return (
          <button
            key={weaponType}
            type="button"
            role="radio"
            aria-checked={selected}
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
