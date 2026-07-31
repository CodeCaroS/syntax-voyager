import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function readJson(relativePath) {
  return JSON.parse(
    readFileSync(new URL(relativePath, import.meta.url), "utf8"),
  );
}

test("Vercel uses the Nitro build instead of expecting .next", () => {
  const packageJson = readJson("../package.json");
  const vercelConfig = readJson("../vercel.json");

  assert.equal(packageJson.engines.node, "24.x");
  assert.equal(
    packageJson.scripts["build:vercel"],
    "npm run content:build && vite build",
  );
  assert.equal(vercelConfig.framework, null);
  assert.equal(vercelConfig.buildCommand, "npm run build:vercel");
  assert.equal(vercelConfig.outputDirectory, null);
});
