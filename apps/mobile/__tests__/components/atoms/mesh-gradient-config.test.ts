import { resolveMeshGradientConfig } from "@/components/atoms/MeshGradient";

describe("resolveMeshGradientConfig", () => {
  it("uses css variable colors by default", () => {
    const config = resolveMeshGradientConfig({
      cssVars: {
        primary: "#7c3aed",
        secondary: "#ec4899",
        accent: "#06b6d4",
        danger: "#ef4444",
      },
    });

    expect(config.colors.primary).toBe("#7c3aed");
    expect(config.colors.secondary).toBe("#ec4899");
    expect(config.colors.accent).toBe("#06b6d4");
    expect(config.colors.danger).toBe("#ef4444");
    expect(config.animation.enabled).toBe(true);
  });

  it("applies explicit color overrides and custom animation options", () => {
    const config = resolveMeshGradientConfig({
      cssVars: {
        primary: "#7c3aed",
        secondary: "#ec4899",
        accent: "#06b6d4",
        danger: "#ef4444",
      },
      colors: {
        primary: "#111827",
        accent: "#0ea5e9",
      },
      animation: {
        enabled: false,
        distanceMultiplier: 1.6,
        durationMultiplier: 1.2,
      },
    });

    expect(config.colors.primary).toBe("#111827");
    expect(config.colors.secondary).toBe("#ec4899");
    expect(config.colors.accent).toBe("#0ea5e9");
    expect(config.colors.danger).toBe("#ef4444");

    expect(config.animation.enabled).toBe(false);
    expect(config.animation.distanceMultiplier).toBe(1.6);
    expect(config.animation.durationMultiplier).toBe(1.2);
  });
});
