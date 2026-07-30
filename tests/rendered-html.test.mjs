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
  assert.match(html, /Knowledge navigator/);
  assert.match(html, /Previous node/);
  assert.match(html, /Next node/);
  assert.match(html, /Visit galaxy/);
  assert.match(html, /Choose a coordinate/);
  assert.match(html, /50(?:<!-- -->)? nodes online/);
  assert.match(html, /Node profile/);
  assert.match(
    html,
    /Node profile<\/span><strong>01<!-- --> \/<!-- --> <!-- -->50<\/strong>/,
  );
  assert.match(html, /Connected coordinates/);
  assert.match(html, /aria-label="View navigation"/);
  assert.match(html, /Interactive 3D map of connected software knowledge/);
  assert.match(
    html,
    /<button(?=[^>]*class="galaxy-gate")(?=[^>]*hidden)[^>]*>/,
  );
  assert.match(html, /class="galaxy-gate-render"/);
  assert.match(html, /class="galaxy-entry"/);
  assert.match(html, /Event horizon crossed/);
  assert.match(html, /Algorithms (?:and|&amp;|&) Pseudocode/);
  assert.match(html, /Functions/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton/i);
});

test("server-renders the fiftieth knowledge coordinate", async () => {
  const response = await render("/articles/documentation-and-communication");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /Documentation and Communication/);
  assert.match(html, /Journey milestone/);
  assert.doesNotMatch(html, /Coordinate not found/);
});

test("server-renders a static article coordinate", async () => {
  const response = await render("/articles/values-and-variables");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /Values and Variables/);
  assert.match(html, /Lesson objective/);
  assert.match(html, /Exercise: Trace the journey/);
  assert.match(html, /Algorithms and Pseudocode/);
  assert.match(html, /aria-label="On this page"/);
  assert.match(html, /href="#variables-give-values-names"/);
  assert.match(html, /id="variables-give-values-names"/);
  assert.match(html, /Translation matrix/);
  assert.match(html, /Show TypeScript/);
  assert.match(html, /Confirm mastery/);
  assert.match(
    html,
    /aria-current="page"><span aria-hidden="true">0<!-- -->2<\/span>Read/,
  );
  assert.doesNotMatch(html, /Coordinate not found/);
});

test("server-renders an intermediate software engineering lesson", async () => {
  const response = await render("/articles/state-and-persistence");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /State and Persistence/);
  assert.match(html, /Temporary state/);
  assert.match(html, /Exercise: Trace the saved state/);
  assert.match(html, /Events and Notifications/);
  assert.doesNotMatch(html, /Coordinate not found/);
});

test("server-renders mission control with galaxies, routes, and expeditions", async () => {
  const response = await render("/mission-control");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /Your route through knowledge space/);
  assert.match(html, /Five knowledge galaxies/);
  assert.match(html, /Personal flight plans/);
  assert.match(html, /Next learning step/);
  assert.match(html, /Continue route/);
  assert.match(html, /starmap-underlay/);
  assert.match(html, />Missions</);
  assert.match(html, /Origin sector/);
  assert.match(html, /Reliability commander/);
  assert.match(html, /Restore the docking sequence/);
  assert.match(html, /Coordinate manifest/);
  assert.doesNotMatch(
    html,
    /href="\/articles\/documentation-and-communication"/,
  );
});

test("server-renders the interactive pseudocode simulation deck", async () => {
  const response = await render("/lab?challenge=cargo-function");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /Flight simulator/);
  assert.match(html, /starmap-underlay/);
  assert.match(html, /Cargo function/);
  assert.match(html, /Step instruction/);
  assert.match(html, /Run simulation/);
  assert.match(html, /Check mission/);
  assert.match(html, /State telemetry/);
  assert.match(html, /Execution trace/);
});
