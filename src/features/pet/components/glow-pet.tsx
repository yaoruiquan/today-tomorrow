import type { KeyboardEvent, MouseEvent, PointerEvent } from "react";
import type { PetMood } from "../pet-mood";

interface GlowPetProps {
  mood: PetMood;
  growthStage: string;
  hoverEnabled: boolean;
  quietModeActive: boolean;
  gentleReminderActive: boolean;
  coDoActive: boolean;
  onClick: (event?: MouseEvent<HTMLButtonElement>) => void;
  onPointerDown?: (event: PointerEvent<HTMLButtonElement>) => void;
}

export function GlowPet({
  mood,
  growthStage,
  hoverEnabled,
  quietModeActive,
  gentleReminderActive,
  coDoActive,
  onClick,
  onPointerDown
}: GlowPetProps) {
  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key !== " " && event.key !== "Spacebar" && event.key !== "Enter") return;
    if (event.repeat) return;

    event.preventDefault();
    onClick();
  }

  function handlePointerMove(event: PointerEvent<HTMLButtonElement>) {
    if (!hoverEnabled || quietModeActive) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const offsetX = ((event.clientX - rect.left) / rect.width - 0.5) * 4;
    const offsetY = ((event.clientY - rect.top) / rect.height - 0.5) * 4;

    event.currentTarget.style.setProperty("--pet-hover-x", `${offsetX.toFixed(2)}px`);
    event.currentTarget.style.setProperty("--pet-hover-y", `${offsetY.toFixed(2)}px`);
  }

  function handlePointerLeave(event: PointerEvent<HTMLButtonElement>) {
    event.currentTarget.style.removeProperty("--pet-hover-x");
    event.currentTarget.style.removeProperty("--pet-hover-y");
  }

  return (
    <button
      className="pet-shell-button"
      data-mood={mood}
      data-growth={growthStage}
      data-hover-enabled={hoverEnabled ? "true" : undefined}
      data-quiet={quietModeActive ? "true" : undefined}
      data-reminder={gentleReminderActive ? "true" : undefined}
      data-co-do={coDoActive ? "true" : undefined}
      type="button"
      aria-label="小光团"
      onClick={onClick}
      onKeyDown={handleKeyDown}
      onPointerDown={onPointerDown}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <span className="pet-shell-body" aria-hidden="true">
        <span className="pet-shell-specks">
          <span />
          <span />
          <span />
        </span>
        <span className="pet-shell-face">
          <span />
          <span />
        </span>
      </span>
      <span className="pet-shadow" aria-hidden="true" />
    </button>
  );
}
