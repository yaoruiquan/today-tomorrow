import type { GlowIntensity, PetThemeId } from "./settings-types";

export interface PetThemeOption {
  id: PetThemeId;
  name: string;
  hint: string;
}

export interface GlowIntensityOption {
  id: GlowIntensity;
  name: string;
}

export const petThemeOptions: PetThemeOption[] = [
  { id: "warmGlow", name: "暖光", hint: "蜂蜜色小光团" },
  { id: "mintFocus", name: "薄荷", hint: "清浅薄荷光" },
  { id: "lavenderCalm", name: "薰衣草", hint: "柔雾薰衣草" },
  { id: "blueNight", name: "蓝夜", hint: "月光蓝小光团" },
  { id: "peachRest", name: "桃色", hint: "软桃色内光" }
];

export const glowIntensityOptions: GlowIntensityOption[] = [
  { id: "low", name: "低" },
  { id: "soft", name: "柔" },
  { id: "bright", name: "亮" }
];
