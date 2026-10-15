import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  clean: true,
  platform: "node",
  // Keep `exports.default` so the CJS output matches its `export default`
  // types. Tailwind reads `module.default` when it loads a plugin.
  cjsDefault: false,
});
