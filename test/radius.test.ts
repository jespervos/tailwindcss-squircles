import { describe, expect, it } from "vitest";
import { compensate, isPercentage, tokenize } from "../src/radius";

describe("tokenize", () => {
  it("splits at spaces and keeps slashes", () => {
    expect(tokenize("10px 20px / 5px")).toEqual(["10px", "20px", "/", "5px"]);
  });

  it("keeps spaces inside parentheses", () => {
    expect(tokenize("calc(1px + 2px) 3px")).toEqual(["calc(1px + 2px)", "3px"]);
  });
});

describe("isPercentage", () => {
  it("only matches percentages", () => {
    expect(isPercentage("50%")).toBe(true);
    expect(isPercentage("0.5rem")).toBe(false);
  });
});

describe("compensate", () => {
  it("multiplies a single length", () => {
    expect(compensate("1rem")).toBe("calc(1rem * var(--corner-factor))");
  });

  it("multiplies lengths part by part", () => {
    expect(compensate("10px 20px / 5px")).toBe(
      "calc(10px * var(--corner-factor)) calc(20px * var(--corner-factor)) / calc(5px * var(--corner-factor))",
    );
  });

  it("leaves percentages alone and returns null when only they remain", () => {
    expect(compensate("50%")).toBeNull();
    expect(compensate("10px 50%")).toBe(
      "calc(10px * var(--corner-factor)) 50%",
    );
  });

  it("returns null for keywords", () => {
    expect(compensate("inherit")).toBeNull();
  });
});
