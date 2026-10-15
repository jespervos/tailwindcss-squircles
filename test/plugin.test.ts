import { describe, expect, it } from "vitest";
import { build } from "./build";

const SQUIRCLE_FACTOR =
  "calc((1 - pow(2, -0.5)) / (1 - pow(2, -1 / pow(2, 2))))";

describe("rounded-*", () => {
  it("keeps the regular radius and adds a compensated one in @supports", async () => {
    const css = await build(["rounded-xl"]);
    expect(css).toContain("border-radius: var(--radius-xl)");
    expect(css).toMatch(
      /@supports \(corner-shape: squircle\) \{[^}]*\.rounded-xl \{\s*border-radius: calc\(var\(--radius-xl\) \* var\(--corner-factor\)\)/,
    );
  });

  it("sets the shape, falling back to a squircle", async () => {
    const css = await build(["rounded-xl"]);
    expect(css).toContain("corner-shape: var(--corner-shape, squircle)");
  });

  it("compensates arbitrary values and variables", async () => {
    const css = await build(["rounded-[20px]", "rounded-(--r)"]);
    expect(css).toContain("calc(20px * var(--corner-factor))");
    expect(css).toContain("calc(var(--r) * var(--corner-factor))");
  });

  it("multiplies multi-value radii part by part", async () => {
    const css = await build(["rounded-[10px_20px/5px]"]);
    expect(css).toContain(
      "calc(10px * var(--corner-factor)) calc(20px * var(--corner-factor)) / calc(5px * var(--corner-factor))",
    );
  });

  it("covers every side, logical ones included", async () => {
    const css = await build(["rounded-es-xl", "rounded-t-xl", "rounded-br-xl"]);
    expect(css).toContain(
      "corner-end-start-shape: var(--corner-shape, squircle)",
    );
    expect(css).toContain(
      "corner-top-left-shape: var(--corner-shape, squircle)",
    );
    expect(css).toContain(
      "corner-bottom-right-shape: var(--corner-shape, squircle)",
    );
    expect(css).toContain(
      "border-end-start-radius: calc(var(--radius-xl) * var(--corner-factor))",
    );
  });

  it("keeps rounded-full and percentages round and uncompensated", async () => {
    const css = await build(["rounded-full", "rounded-[50%]"]);
    expect(css).toContain("corner-shape: var(--corner-shape, round)");
    expect(css).not.toContain("--corner-shape, squircle)");
    expect(css).not.toContain("--corner-factor)");
  });

  it("leaves values without a length to Tailwind", async () => {
    const css = await build(["rounded-[inherit]"]);
    expect(css).toContain("border-radius: inherit");
    expect(css).not.toContain("--corner-factor)");
  });

  it("emits the compensated radius after Tailwind's own", async () => {
    const css = await build(["rounded-xl"]);
    expect(css.indexOf("border-radius: var(--radius-xl)")).toBeLessThan(
      css.indexOf("calc(var(--radius-xl) * var(--corner-factor))"),
    );
  });
});

describe("corner-*", () => {
  it("defines round, squircle and bevel with their factor", async () => {
    const css = await build([
      "corner-round",
      "corner-squircle",
      "corner-bevel",
    ]);
    expect(css).toMatch(
      /\.corner-round \{\s*--corner-shape: round;\s*--corner-factor: 1;/,
    );
    expect(css).toMatch(
      /\.corner-squircle \{\s*--corner-shape: squircle;\s*--corner-factor: calc\(\(1 - pow\(2, -0\.5\)\) \/ \(1 - pow\(2, -1 \/ pow\(2, 2\)\)\)\);/,
    );
    expect(css).toContain("--corner-shape: bevel");
  });

  it("keeps the radius for shapes without a corner depth", async () => {
    const css = await build(["corner-scoop", "corner-notch", "corner-square"]);
    for (const shape of ["scoop", "notch", "square"]) {
      expect(css).toMatch(
        new RegExp(
          `\\.corner-${shape} \\{\\s*--corner-shape: ${shape};\\s*--corner-factor: 1;`,
        ),
      );
    }
  });

  it("accepts any number for superellipse", async () => {
    const css = await build([
      "corner-superellipse-1.5",
      "corner-superellipse--1",
      "corner-superellipse-nope",
    ]);
    expect(css).toContain("--corner-shape: superellipse(1.5)");
    expect(css).toContain("--corner-shape: superellipse(-1)");
    expect(css).toContain("pow(2, 1.5)");
    expect(css).not.toContain("nope");
  });
});

describe("base", () => {
  it("registers per-element properties that do not inherit", async () => {
    const css = await build(["rounded-xl"]);
    expect(css).toMatch(
      /@property --corner-shape \{\s*syntax: "\*";\s*inherits: false;/,
    );
    expect(css).toContain("@property --corner-factor");
    expect(css).toContain(`initial-value: ${SQUIRCLE_FACTOR}`);
  });
});
