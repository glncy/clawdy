import {
  warmthLevel,
  daysSince,
  warmthLabel,
  initialsFromName,
} from "../warmth";

describe("daysSince", () => {
  it("returns full days between two ISO dates", () => {
    expect(
      daysSince("2026-04-10T00:00:00.000Z", "2026-04-16T00:00:00.000Z"),
    ).toBe(6);
  });

  it("returns 0 when same day", () => {
    expect(
      daysSince("2026-04-16T08:00:00.000Z", "2026-04-16T20:00:00.000Z"),
    ).toBe(0);
  });

  it("defaults nowIso to the current wall clock when omitted", () => {
    const fiveDaysAgo = new Date(
      Date.now() - 5 * 24 * 60 * 60 * 1000,
    ).toISOString();
    expect(daysSince(fiveDaysAgo)).toBe(5);
  });
});

describe("warmthLevel", () => {
  it("returns 'warm' for <= 7 days", () => {
    expect(warmthLevel(0)).toBe("warm");
    expect(warmthLevel(7)).toBe("warm");
  });

  it("returns 'cooling' for 8-21 days", () => {
    expect(warmthLevel(8)).toBe("cooling");
    expect(warmthLevel(21)).toBe("cooling");
  });

  it("returns 'distant' for 22+ days or undefined", () => {
    expect(warmthLevel(22)).toBe("distant");
    expect(warmthLevel(365)).toBe("distant");
    expect(warmthLevel(undefined)).toBe("distant");
  });
});

describe("warmthLabel", () => {
  it("produces a human label with days-ago suffix", () => {
    expect(warmthLabel("warm", 2)).toBe("Warm · 2 days ago");
    expect(warmthLabel("cooling", 12)).toBe("Cooling · 12 days ago");
    expect(warmthLabel("distant", undefined)).toBe("Distant · no contact yet");
  });
});

describe("initialsFromName", () => {
  it("returns up to two uppercase initials", () => {
    expect(initialsFromName("Maria Santos")).toBe("MS");
    expect(initialsFromName("maria santos cruz")).toBe("MS");
    expect(initialsFromName("Cher")).toBe("C");
    expect(initialsFromName("  ")).toBe("?");
  });
});
