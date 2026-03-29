export type MeshGradientColorKey = "primary" | "secondary" | "accent" | "danger";

export type MeshGradientPalette = Record<MeshGradientColorKey, string>;

export type MeshGradientColorOverrides = Partial<MeshGradientPalette>;

export type MeshGradientAnimationOptions = {
  enabled?: boolean;
  distanceMultiplier?: number;
  durationMultiplier?: number;
};

export type MeshGradientConfigInput = {
  cssVars: Partial<MeshGradientPalette>;
  colors?: MeshGradientColorOverrides;
  animation?: MeshGradientAnimationOptions;
};

export type MeshGradientResolvedConfig = {
  colors: MeshGradientPalette;
  animation: {
    enabled: boolean;
    distanceMultiplier: number;
    durationMultiplier: number;
  };
};

const FALLBACK_COLORS: MeshGradientPalette = {
  primary: "#7c3aed",
  secondary: "#ec4899",
  accent: "#06b6d4",
  danger: "#ef4444",
};

function normalizePositiveNumber(value: number | undefined): number {
  if (typeof value !== "number" || Number.isNaN(value) || value <= 0) {
    return 1;
  }

  return value;
}

export function resolveMeshGradientConfig(
  input: MeshGradientConfigInput,
): MeshGradientResolvedConfig {
  const { cssVars, colors, animation } = input;

  return {
    colors: {
      primary: colors?.primary ?? cssVars.primary ?? FALLBACK_COLORS.primary,
      secondary:
        colors?.secondary ?? cssVars.secondary ?? FALLBACK_COLORS.secondary,
      accent: colors?.accent ?? cssVars.accent ?? FALLBACK_COLORS.accent,
      danger: colors?.danger ?? cssVars.danger ?? FALLBACK_COLORS.danger,
    },
    animation: {
      enabled: animation?.enabled ?? true,
      distanceMultiplier: normalizePositiveNumber(animation?.distanceMultiplier),
      durationMultiplier: normalizePositiveNumber(animation?.durationMultiplier),
    },
  };
}
