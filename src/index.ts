import plugin from "tailwindcss/plugin";
import { compensate, isPercentage, tokenize } from "./radius";
import { SIDES, toShape } from "./sides";

const SUPPORTS = "@supports (corner-shape: squircle)";
const FULL = "calc(infinity * 1px)";

/**
 * Radius multiplier for `superellipse(k)`: how far the circle's diagonal point
 * sits from the corner, divided by the same distance on the curve. 1 for round,
 * about 1.841 for a squircle.
 */
const factor = (k: string) =>
  `calc((1 - pow(2, -0.5)) / (1 - pow(2, -1 / pow(2, ${k}))))`;

/** Theme keys that are not a scale step (`__CSS_VALUES__` is Tailwind's own). */
const NOT_COMPENSATED = new Set(["DEFAULT", "none", "full", "__CSS_VALUES__"]);

/** Shapes without a meaningful corner depth, so the radius stays as is. */
const UNCOMPENSATED = ["scoop", "notch", "square"];

/**
 * Progressive `corner-shape` for Tailwind's `rounded-*` utilities.
 *
 * Every `rounded-*` class keeps its regular `border-radius`. Where
 * `corner-shape` is supported, the radius is multiplied so the new shape cuts
 * as deep into the corner as the circle it replaces, and the corner becomes a
 * squircle. Elsewhere nothing changes.
 *
 * Usage: `@plugin "tailwindcss-squircles";`
 */
export default plugin(({ addBase, addUtilities, matchUtilities, theme }) => {
  // Both are per element. `inherits: false` keeps `corner-round` on a parent
  // from leaking into every rounded child.
  addBase({
    "@property --corner-shape": { syntax: '"*"', inherits: "false" },
    [SUPPORTS]: {
      "@property --corner-factor": {
        syntax: '"<number>"',
        inherits: "false",
        "initial-value": factor("2"),
      },
    },
  });

  // `theme()` resolves values to literals. Point at the variables instead, so
  // a `--radius-*` override further down the tree is still followed.
  const scale = theme("borderRadius") as Record<string, unknown>;
  const radii: Record<string, string> = Object.fromEntries(
    Object.keys(scale)
      .filter((key) => !NOT_COMPENSATED.has(key))
      .map((key) => [key, `var(--radius-${key})`]),
  );
  if (typeof scale.DEFAULT === "string") radii.DEFAULT = scale.DEFAULT;

  for (const [side, properties] of Object.entries(SIDES)) {
    const name = side ? `rounded-${side}` : "rounded";

    // Tailwind keeps its own definition and emits this one next to it. The
    // later rule wins, but only if it sorts after Tailwind's: same properties,
    // same declaration count. That is why the shape is a separate rule.
    // Never return `null` or add a second type next to "any": Tailwind stops
    // at the first and skips the second whenever another definition matched.
    // An empty object is "nothing to add", unlike `null`.
    matchUtilities(
      {
        [name]: (value): Record<string, Record<string, string>> => {
          const radius = compensate(value);
          return radius
            ? {
                [SUPPORTS]: Object.fromEntries(
                  properties.map((property) => [property, radius]),
                ),
              }
            : {};
        },
      },
      { values: radii },
    );

    matchUtilities(
      {
        [name]: (value) => ({
          // Borrow the radius slot so side classes keep Tailwind's order,
          // e.g. `rounded-lg rounded-t-full` ends with round top corners.
          "--tw-sort": properties[0],
          ...Object.fromEntries(
            (side === "" ? ["corner-shape"] : properties.map(toShape)).map(
              (property) => [
                property,
                `var(--corner-shape, ${value === FULL || tokenize(value).every((t) => isPercentage(t)) ? "round" : "squircle"})`,
              ],
            ),
          ),
        }),
      },
      { values: { ...radii, full: FULL } },
    );
  }

  addUtilities({
    ".corner-round": { "--corner-shape": "round", "--corner-factor": "1" },
    ".corner-squircle": {
      "--corner-shape": "squircle",
      "--corner-factor": factor("2"),
    },
    ".corner-bevel": {
      "--corner-shape": "bevel",
      "--corner-factor": factor("0"),
    },
    ...Object.fromEntries(
      UNCOMPENSATED.map((shape) => [
        `.corner-${shape}`,
        { "--corner-shape": shape, "--corner-factor": "1" },
      ]),
    ),
  });

  matchUtilities(
    {
      "corner-superellipse": (value) => ({
        "--corner-shape": `superellipse(${value})`,
        "--corner-factor": factor(value),
      }),
    },
    {
      // Tailwind's typings intersect `Record<string, string>` with the
      // `__BARE_VALUE__` function, which no object satisfies.
      values: {
        __BARE_VALUE__: ({ value }: { value: string }) =>
          Number.isNaN(Number(value)) ? undefined : value,
      } as unknown as Record<string, string>,
      supportsNegativeValues: true,
    },
  );
});
