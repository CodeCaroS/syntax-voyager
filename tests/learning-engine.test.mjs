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
  getMissionStepContext,
  isGalaxyUnlocked,
  labChallenges,
  missionStepCompleted,
  missionStepHref,
  missionStepTargetId,
  missionStepType,
  nextArticleIdForPlan,
  nextNodeTask,
  nodeTaskProgress,
  nodeTasksForArticle,
  planetOrbitAngle,
} from "../lib/voyage.ts";

const articles = JSON.parse(
  await readFile(new URL("../app/generated-content.json", import.meta.url)),
);
const articleIds = new Set(articles.map((article) => article.id));
const labChallengeIds = new Set(
  labChallenges.map((challenge) => challenge.id),
);

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
  assert.equal(isGalaxyUnlocked("origin-sector", []), true);
  assert.equal(isGalaxyUnlocked("systems-frontier", []), false);
  assert.equal(isGalaxyUnlocked("systems-frontier", ["origin-sector"]), true);
  assert.equal(isGalaxyUnlocked("algorithm-belt", ["systems-frontier"]), false);
});

test("planets keep orbiting gently when reduced motion is preferred", () => {
  const normalTravel = planetOrbitAngle(0, 1_000, false) - planetOrbitAngle(0, 0, false);
  const reducedTravel = planetOrbitAngle(0, 1_000, true) - planetOrbitAngle(0, 0, true);

  assert.ok(reducedTravel > 0);
  assert.ok(reducedTravel < normalTravel);
});

test("flight plans and mission stages use real lessons or simulations", () => {
  for (const plan of flightPlans) {
    assert.ok(plan.articleIds.length > 0, `${plan.id} has no coordinates`);
    for (const id of plan.articleIds)
      assert.ok(articleIds.has(id), `${plan.id} references missing ${id}`);
  }

  for (const expedition of expeditions) {
    assert.ok(expedition.steps.length >= 4);
    for (const step of expedition.steps) {
      const targetId = missionStepTargetId(step);
      const targets =
        missionStepType(step) === "lesson" ? articleIds : labChallengeIds;
      assert.ok(targets.has(targetId), `${expedition.id} references missing ${step.href}`);
    }
  }
});

test("missions keep one ordered thread across lessons and simulations", () => {
  const mission = expeditions[0];
  const lesson = mission.steps[0];
  const simulation = mission.steps[1];

  assert.equal(missionStepType(lesson), "lesson");
  assert.equal(missionStepType(simulation), "simulation");
  assert.equal(missionStepTargetId(lesson), "values-and-variables");
  assert.equal(missionStepTargetId(simulation), "fuel-correction");
  assert.match(
    missionStepHref(mission.id, simulation),
    /challenge=fuel-correction&mission=guessing-signal&step=correct-fuel/,
  );
  assert.equal(
    getMissionStepContext(mission.id, lesson.id)?.nextStep.id,
    simulation.id,
  );
  assert.equal(
    missionStepCompleted(lesson, ["values-and-variables"], []),
    true,
  );
  assert.equal(
    missionStepCompleted(simulation, [], ["fuel-correction"]),
    true,
  );
  for (const candidate of expeditions) {
    assert.equal(
      candidate.steps.length % 2,
      0,
      `${candidate.id} must contain lesson/SIM pairs`,
    );
    for (let index = 0; index < candidate.steps.length; index += 2) {
      const lessonStep = candidate.steps[index];
      const simulationStep = candidate.steps[index + 1];
      assert.equal(missionStepType(lessonStep), "lesson");
      assert.equal(missionStepType(simulationStep), "simulation");
      assert.equal(
        labChallenges.find(
          (challenge) =>
            challenge.id === missionStepTargetId(simulationStep),
        )?.relatedArticleId,
        missionStepTargetId(lessonStep),
        `${candidate.id} step ${index + 1} has no matching SIM`,
      );
    }
  }
  assert.deepEqual(
    [
      ...new Set(
        expeditions.flatMap((candidate) =>
          candidate.steps
            .filter((step) => missionStepType(step) === "simulation")
            .map(missionStepTargetId),
        ),
      ),
    ].sort(),
    [...labChallengeIds].sort(),
  );
});

test("nodes expose their linked mission and simulation progress", () => {
  const tasks = nodeTasksForArticle("values-and-variables");
  assert.deepEqual(
    tasks.map(({ kind }) => kind),
    ["mission", "simulation"],
  );
  assert.match(tasks[0].href, /mission=guessing-signal&step=store-target/);
  assert.equal(tasks[1].href, "/lab?challenge=fuel-correction");
  assert.deepEqual(nodeTaskProgress(tasks, [], []), {
    completed: 0,
    total: 2,
  });
  assert.deepEqual(nodeTaskProgress(tasks, [], [], "mission"), {
    completed: 0,
    total: 1,
  });
  assert.deepEqual(nodeTaskProgress(tasks, [], [], "simulation"), {
    completed: 0,
    total: 1,
  });
  assert.equal(nextNodeTask(tasks, [], [])?.kind, "mission");
  assert.equal(
    nextNodeTask(tasks, ["values-and-variables"], [])?.kind,
    "simulation",
  );
  assert.deepEqual(
    nodeTaskProgress(tasks, ["values-and-variables"], ["fuel-correction"]),
    { completed: 2, total: 2 },
  );
  assert.equal(
    nextNodeTask(
      tasks,
      ["values-and-variables"],
      ["fuel-correction"],
    ),
    null,
  );
  assert.deepEqual(nodeTasksForArticle("algorithms-and-pseudocode"), []);
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
  assert.equal(
    nextArticleIdForPlan(
      "backend-pilot",
      ["functions", "errors-and-input-validation"],
      undefined,
      new Set(["functions", "errors-and-input-validation"]),
    ),
    null,
  );
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
