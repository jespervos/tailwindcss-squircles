# tailwindcss-squircles

A Tailwind CSS v4 plugin that turns every `rounded-*` utility into a squircle with the CSS [`corner-shape`](https://developer.mozilla.org/en-US/docs/Web/CSS/corner-shape) property. Browsers without support keep their regular `border-radius`.

Your markup doesn't change:

```html
<div class="rounded-xl"></div>
```

- **Supporting browsers** draw a squircle. The radius is compensated, so the corner is as deep as the circle it replaces.
- **Everything else** draws the same rounded corner as before.

Adding `corner-shape: squircle` on its own makes every corner noticeably sharper, because a squircle cuts less deeply into the corner than a circle with the same radius. This plugin multiplies the radius by the exact amount that evens it out (about 1.841 for a squircle).

## Install

```bash
pnpm add -D tailwindcss-squircles
# or: npm install -D tailwindcss-squircles
```

Requires Tailwind CSS v4.

```css
@import "tailwindcss";
@plugin "tailwindcss-squircles";
```

## What it does

Next to Tailwind's own definition, each `rounded-*` class gets two extra rules. One multiplies the radius inside `@supports (corner-shape: squircle)`, the other sets the shape.

```css
.rounded-xl {
  border-radius: var(--radius-xl);
}

@supports (corner-shape: squircle) {
  .rounded-xl {
    border-radius: calc(var(--radius-xl) * var(--corner-factor));
  }
}

.rounded-xl {
  corner-shape: var(--corner-shape, squircle);
}
```

- Theme values, arbitrary values, `(--variables)` and every side are covered, including the logical ones like `rounded-es-*`. Each side sets the matching `corner-*-shape` property.
- Compensated radii read `var(--radius-*)`, so overriding a radius token still works.
- `rounded-full` and percentage radii like `rounded-[50%]` stay round. A pill must stay a pill.
- Radii with several values, like `rounded-[10px_20px]` or `rounded-[10px_20px/5px]`, are multiplied part by part.
- Values with nothing to multiply, such as `rounded-[inherit]`, keep Tailwind's own output.
- Side classes keep Tailwind's order, so `rounded-lg rounded-t-full` still ends with round top corners.

## Changing the shape

Use the `corner-*` utilities next to a `rounded-*` class to change the shape of a single element. They change the curve and the compensation together.

```html
<div class="corner-round rounded-lg"></div>
<div class="corner-bevel rounded-lg"></div>
<div class="corner-superellipse-1.5 rounded-lg"></div>
```

| Class                     | Shape               | Radius multiplier |
| ------------------------- | ------------------- | ----------------- |
| `corner-round`            | `round`             | 1                 |
| `corner-squircle`         | `squircle`          | about 1.841       |
| `corner-bevel`            | `bevel`             | about 0.586       |
| `corner-scoop`            | `scoop`             | 1                 |
| `corner-notch`            | `notch`             | 1                 |
| `corner-square`           | `square`            | 1                 |
| `corner-superellipse-<k>` | `superellipse(<k>)` | exact for `<k>`   |

`corner-superellipse-<k>` accepts any number, negative ones included. `scoop`, `notch` and `square` have no corner depth to match, so the radius stays as written.

The shape and multiplier are set per element and don't inherit, so `corner-round` on a parent never leaks into its rounded children. In browsers without `corner-shape` support these classes do nothing.

## How the multiplier works

For `superellipse(k)`, the plugin multiplies the radius by

```css
calc((1 - pow(2, -0.5)) / (1 - pow(2, -1 / pow(2, k))))
```

That is how far the circle's diagonal point sits from the corner, divided by the same distance on the curve. `round` is `superellipse(1)`, so its multiplier is 1. A squircle is `superellipse(2)` (about 1.841) and a bevel is `superellipse(0)` (about 0.586).

## Browser support

`corner-shape` shipped in Chrome 139. Other browsers ignore it, and the `@supports` rule keeps the original radius there. Check [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/corner-shape#browser_compatibility) for the current state.

## Development

```bash
pnpm install
pnpm test        # runs the plugin through Tailwind's compiler
pnpm typecheck
pnpm build       # ESM + CJS + types in dist/
pnpm check:package
```

## License

[MIT](./LICENSE) © Jesper Vos
