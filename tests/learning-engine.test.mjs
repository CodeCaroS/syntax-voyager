import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  bridgeLanguages,
  translatePseudocode,
} from "../lib/language-bridge.ts";
import {
  executePseudocode,
  outputMatches,
} from "../lib/pseudocode.ts";
import {
  expeditions,
  flightPlans,
  galaxies,
  galaxyGates,
  labChallenges,
  nextArticleIdForPlan,
} from "../lib/voyage.ts";

const articles = JSON.parse(
  await readFile(new URL("../app/generated-content.json", import.meta.url)),
);
const articleIds = new Set(articles.map((article) => article.id));

test("every article belongs to exactly one knowledge galaxy", () => {
  for (const article of articles) {
    const matches = galaxies.filter((galaxy) => galaxy.includes(article.order));
    assert.equal(
      matches.length,
      1,
      `${article.id} belongs to ${matches.length} galaxies`,
    );
  }
});

test("each galaxy transition has a valid black hole gate", () => {
  assert.equal(galaxyGates.length, galaxies.length - 1);
  galaxyGates.forEach((gate, index) => {
    assert.equal(gate.galaxyId, galaxies[index].id);
    assert.ok(gate.answers.includes(gate.correctAnswer));
  });
});

test("flight plans and expedition article checkpoints use real coordinates", () => {
  for (const plan of flightPlans) {
    assert.ok(plan.articleIds.length > 0, `${plan.id} has no coordinates`);
    for (const id of plan.articleIds)
      assert.ok(articleIds.has(id), `${plan.id} references missing ${id}`);
  }

  for (const expedition of expeditions) {
    assert.ok(expedition.steps.length >= 4);
    for (const step of expedition.steps) {
      if (!step.href.startsWith("/articles/")) continue;
      assert.ok(
        articleIds.has(step.href.slice("/articles/".length)),
        `${expedition.id} references missing ${step.href}`,
      );
    }
  }
});

test("flight plans resolve one clear next learning coordinate", () => {
  assert.equal(
    nextArticleIdForPlan("cadet-launch", []),
    "algorithms-and-pseudocode",
  );
  assert.equal(
    nextArticleIdForPlan(
      "cadet-launch",
      ["algorithms-and-pseudocode"],
      "algorithms-and-pseudocode",
    ),
    "values-and-variables",
  );
  assert.equal(
    nextArticleIdForPlan(
      "cadet-launch",
      ["values-and-variables"],
      "values-and-variables",
    ),
    "algorithms-and-pseudocode",
  );
  assert.equal(nextArticleIdForPlan("unknown-plan", []), null);
});

test("all bundled pseudocode simulations execute and pass", () => {
  for (const challenge of labChallenges) {
    const result = executePseudocode(challenge.starter);
    assert.equal(result.error, undefined, `${challenge.id}: ${result.error}`);
    assert.equal(
      outputMatches(result, challenge.expectedOutput),
      true,
      challenge.id,
    );
    assert.ok(result.frames.length > 0, `${challenge.id} has no trace`);
  }
});

test("the language bridge produces all four views", () => {
  const source = labChallenges[3].starter;
  assert.deepEqual(
    bridgeLanguages.map(({ id }) => id),
    ["pseudocode", "typescript", "python", "java"],
  );
  assert.match(translatePseudocode(source, "typescript"), /function cargo_mass/);
  assert.match(translatePseudocode(source, "python"), /def cargo_mass/);
  assert.match(translatePseudocode(source, "java"), /static Object cargo_mass/);
});
