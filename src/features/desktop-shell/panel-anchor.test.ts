import { describe, expect, it } from "vitest";
import { clampPanelCoordinate } from "./panel-anchor";

describe("panel anchor", () => {
  it("keeps panel coordinates within visible bounds", () => {
    expect(clampPanelCoordinate(10, 20, 100)).toBe(20);
    expect(clampPanelCoordinate(120, 20, 100)).toBe(100);
    expect(clampPanelCoordinate(64, 20, 100)).toBe(64);
  });
});
