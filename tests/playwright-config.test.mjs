import assert from "node:assert/strict";
import test from "node:test";

test("CI runs Playwright with one worker", async () => {
  const previousCi = process.env.CI;
  process.env.CI = "true";

  try {
    const { default: config } = await import(
      `../playwright.config.ts?ci=${Date.now()}`
    );
    assert.equal(config.workers, 1);
  } finally {
    if (previousCi === undefined) delete process.env.CI;
    else process.env.CI = previousCi;
  }
});
