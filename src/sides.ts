/** Radius properties per `rounded-*` side, in the order Tailwind emits them. */
export const SIDES: Record<string, string[]> = {
  "": ["border-radius"],
  s: ["border-start-start-radius", "border-end-start-radius"],
  e: ["border-start-end-radius", "border-end-end-radius"],
  t: ["border-top-left-radius", "border-top-right-radius"],
  r: ["border-top-right-radius", "border-bottom-right-radius"],
  b: ["border-bottom-right-radius", "border-bottom-left-radius"],
  l: ["border-top-left-radius", "border-bottom-left-radius"],
  ss: ["border-start-start-radius"],
  se: ["border-start-end-radius"],
  ee: ["border-end-end-radius"],
  es: ["border-end-start-radius"],
  tl: ["border-top-left-radius"],
  tr: ["border-top-right-radius"],
  br: ["border-bottom-right-radius"],
  bl: ["border-bottom-left-radius"],
};

/** `border-top-left-radius` → `corner-top-left-shape`. */
export const toShape = (radius: string) =>
  radius.replace(/^border-(.+)-radius$/, "corner-$1-shape");
