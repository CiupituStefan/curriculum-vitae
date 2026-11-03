import { afterEach, describe, expect, it } from "vitest";
import { THEME_SCRIPT, applyStoredTheme } from "@/components/site/theme";

type Env = { stored: string | null; prefersDark: boolean; storageThrows?: boolean };

function setup({ stored, prefersDark, storageThrows }: Env) {
  const classes = new Set<string>();
  const root = { classList: { add: (c: string) => classes.add(c) }, dataset: {} as Record<string, string> };
  const g = globalThis as Record<string, unknown>;
  g.document = { documentElement: root };
  g.localStorage = {
    getItem: () => {
      if (storageThrows) throw new Error("blocked");
      return stored;
    },
  };
  g.window = { matchMedia: () => ({ matches: prefersDark }) };
  return { root, classes };
}

afterEach(() => {
  const g = globalThis as Record<string, unknown>;
  delete g.document;
  delete g.localStorage;
  delete g.window;
});

const cases: [string, Env, string][] = [
  ["saved dark wins over a light system", { stored: "dark", prefersDark: false }, "dark"],
  ["saved light wins over a dark system", { stored: "light", prefersDark: true }, "light"],
  ["no saved choice follows a dark system", { stored: null, prefersDark: true }, "dark"],
  ["no saved choice follows a light system", { stored: null, prefersDark: false }, "light"],
  ["garbage value falls back to the system", { stored: "purple", prefersDark: true }, "dark"],
  ["blocked storage falls back to light", { stored: null, prefersDark: true, storageThrows: true }, "light"],
];

describe("theme resolution (inline script and ThemeSync stay identical)", () => {
  it.each(cases)("%s", (_name, env, expected) => {
    const a = setup(env);
    applyStoredTheme();
    expect(a.root.dataset.theme).toBe(expected);
    expect(a.classes.has("js")).toBe(true);

    const b = setup(env);
    new Function(THEME_SCRIPT)();
    expect(b.root.dataset.theme).toBe(expected);
    expect(b.classes.has("js")).toBe(true);
  });
});
