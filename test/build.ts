import { compile } from "tailwindcss";
import squircles from "../src/index";

/** Compiles the given classes with the plugin, on top of Tailwind's theme. */
export async function build(candidates: string[], css = "") {
  const compiler = await compile(
    `@theme default { --radius-lg: 0.5rem; --radius-xl: 0.75rem; }
    @plugin "tailwindcss-squircles";
    @tailwind utilities;
    ${css}`,
    {
      base: process.cwd(),
      loadModule: async (id, base) => {
        if (id !== "tailwindcss-squircles") {
          throw new Error(`Unexpected module: ${id}`);
        }
        return { path: id, base, module: squircles };
      },
    },
  );
  return compiler.build(candidates);
}
