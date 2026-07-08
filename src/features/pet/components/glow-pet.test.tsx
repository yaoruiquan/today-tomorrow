import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { GlowPet } from "./glow-pet";

describe("GlowPet", () => {
  it("renders visible body-growth stage names without legacy surface labels", () => {
    render(
      <GlowPet
        mood="calm"
        growthStage="holdingGlow"
        hoverEnabled={true}
        quietModeActive={false}
        gentleReminderActive={false}
        coDoActive={false}
        onClick={vi.fn()}
      />
    );

    const pet = screen.getByRole("button", { name: "小光团" });

    expect(pet).toHaveAttribute("data-growth", "holdingGlow");
    expect(pet).not.toHaveAttribute("data-growth-source");
    expect(pet.querySelector(".pet-shell-holding-layer")).not.toBeNull();
    expect(pet.querySelectorAll(".pet-shell-specks span")).toHaveLength(5);
    expect(pet.querySelector("[data-tauri-drag-region]")).toBeNull();
  });
});
