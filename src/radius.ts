/** A percentage radius describes an ellipse, so it stays round. */
export const isPercentage = (token: string) => /\d%$/.test(token);

/** Splits at spaces and slashes outside parentheses, keeping the slashes. */
export const tokenize = (value: string) => {
  const tokens: string[] = [];
  let current = "";
  let depth = 0;
  const flush = () => {
    if (current) tokens.push(current);
    current = "";
  };
  for (const char of value.trim()) {
    if (char === "(") depth++;
    if (char === ")") depth--;
    if (depth === 0 && (char === " " || char === "/")) {
      flush();
      if (char === "/") tokens.push("/");
    } else {
      current += char;
    }
  }
  flush();
  return tokens;
};

/**
 * Multiplies each length in a radius, so `10px 20px / 5px` works too.
 * Returns `null` when there is nothing to multiply (keywords, percentages).
 */
export const compensate = (value: string) => {
  const tokens = tokenize(value);
  const lengths = tokens.filter((t) => t !== "/" && !isPercentage(t));
  if (lengths.length === 0 || lengths.some((t) => /^[a-z-]+$/i.test(t))) {
    return null;
  }
  return tokens
    .map((t) =>
      t === "/" || isPercentage(t) ? t : `calc(${t} * var(--corner-factor))`,
    )
    .join(" ");
};
