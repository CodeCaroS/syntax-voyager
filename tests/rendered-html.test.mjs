import assert from "node:assert/strict";
import test from "node:test";

async function render(path = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${path}`, {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the Syntax Voyager knowledge map", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /Syntax Voyager/);
  assert.match(html, /Explore software as a/);
  assert.match(html, /Knowledge galaxy 01/);
  assert.match(html, /Choose a coordinate/);
  assert.match(html, /Interactive 3D map of programming fundamentals/);
  assert.match(html, /Algorithms (?:and|&amp;|&) Pseudocode/);
  assert.match(html, /Functions/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton/i);
});

test("server-renders a static article coordinate", async () => {
  const response = await render("/articles/values-and-variables");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /Values and Variables/);
  assert.match(html, /Mission objective/);
  assert.match(html, /Exercise: Trace the journey/);
  assert.match(html, /Algorithms and Pseudocode/);
  assert.doesNotMatch(html, /Coordinate not found/);
});
