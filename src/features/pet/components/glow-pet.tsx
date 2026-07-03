import type { PointerEvent } from "react";
import type { PetMood } from "../pet-mood";

interface GlowPetProps {
  mood: PetMood;
  growthStage: string;
  onClick: () => void;
  onPointerDown?: (event: PointerEvent<HTMLButtonElement>) => void;
}

export function GlowPet({ mood, growthStage, onClick, onPointerDown }: GlowPetProps) {
  return (
    <button
      className="pet-shell-button"
      data-mood={mood}
      data-growth={growthStage}
      type="button"
      aria-label="小光团"
      onClick={onClick}
      onPointerDown={onPointerDown}
    >
      <span className="pet-shell-aura" aria-hidden="true" />
      <span className="pet-stars" aria-hidden="true">
        <span />
        <span />
        <span />
      </span>
      <span className="pet-shell-body" aria-hidden="true">
        <span className="pet-shell-face">
          <span />
          <span />
        </span>
      </span>
      <span className="pet-shadow" aria-hidden="true" />
    </button>
  );
}
