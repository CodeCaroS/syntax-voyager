export type GalaxyId =
  | "origin-sector"
  | "systems-frontier"
  | "algorithm-belt"
  | "reliability-expanse"
  | "engineering-outpost";

export interface Galaxy {
  id: GalaxyId;
  callSign: string;
  title: string;
  summary: string;
  includes: (order: number) => boolean;
}

export const galaxies: Galaxy[] = [
  {
    id: "origin-sector",
    callSign: "SYS-01",
    title: "Origin sector",
    summary:
      "Core programming language: values, control flow, functions, and data structures.",
    includes: (order) => order <= 10 || (order >= 18 && order <= 22),
  },
  {
    id: "systems-frontier",
    callSign: "SYS-02",
    title: "Systems frontier",
    summary:
      "State, workflows, boundaries, data, web protocols, and secure application design.",
    includes: (order) =>
      (order >= 11 && order <= 17) || (order >= 27 && order <= 34),
  },
  {
    id: "algorithm-belt",
    callSign: "SYS-03",
    title: "Algorithm belt",
    summary:
      "Recursion, searching, sorting, and the trade-offs behind efficient solutions.",
    includes: (order) => order >= 23 && order <= 26,
  },
  {
    id: "reliability-expanse",
    callSign: "SYS-04",
    title: "Reliability expanse",
    summary:
      "Concurrency, queues, caching, observability, distributed systems, and deployment.",
    includes: (order) =>
      (order >= 35 && order <= 39) || (order >= 47 && order <= 49),
  },
  {
    id: "engineering-outpost",
    callSign: "SYS-05",
    title: "Engineering outpost",
    summary:
      "Debugging, testing, version control, review, refactoring, design, and communication.",
    includes: (order) => (order >= 40 && order <= 46) || order === 50,
  },
];

export function galaxyForOrder(order: number) {
  return galaxies.find((galaxy) => galaxy.includes(order)) ?? galaxies[0];
}

export function planetOrbitAngle(
  index: number,
  time: number,
  reducedMotion: boolean,
) {
  return (
    index * 2.399963 +
    time *
      (0.000035 + (index % 5) * 0.000009) *
      (index % 2 === 0 ? 1 : -1) *
      (reducedMotion ? 0.35 : 1)
  );
}

export interface GalaxyGate {
  galaxyId: GalaxyId;
  question: string;
  answers: string[];
  correctAnswer: string;
}

export const galaxyGates: GalaxyGate[] = [
  {
    galaxyId: "origin-sector",
    question: "Which construct repeats instructions while a condition remains true?",
    answers: ["A loop", "A variable", "A string"],
    correctAnswer: "A loop",
  },
  {
    galaxyId: "systems-frontier",
    question: "Where should untrusted API input be validated first?",
    answers: ["At the system boundary", "Inside the database", "In the user interface only"],
    correctAnswer: "At the system boundary",
  },
  {
    galaxyId: "algorithm-belt",
    question: "What does Big O notation describe?",
    answers: ["Growth of resource cost", "Exact runtime in seconds", "Number of source files"],
    correctAnswer: "Growth of resource cost",
  },
  {
    galaxyId: "reliability-expanse",
    question: "What makes retrying the same message safe?",
    answers: ["Idempotent processing", "A longer timeout", "More worker threads"],
    correctAnswer: "Idempotent processing",
  },
];

export function isGalaxyUnlocked(
  galaxyId: GalaxyId,
  passedGalaxyGates: readonly GalaxyId[],
) {
  const galaxyIndex = galaxies.findIndex((galaxy) => galaxy.id === galaxyId);
  const firstLockedGate = galaxyGates.findIndex(
    (gate) => !passedGalaxyGates.includes(gate.galaxyId),
  );
  return (
    galaxyIndex >= 0 &&
    (firstLockedGate < 0 || galaxyIndex <= firstLockedGate)
  );
}

export interface FlightPlan {
  id: string;
  callSign: string;
  title: string;
  objective: string;
  articleIds: string[];
}

export const flightPlans: FlightPlan[] = [
  {
    id: "cadet-launch",
    callSign: "FP-01",
    title: "Cadet launch",
    objective: "Build and trace small programs without relying on one language.",
    articleIds: [
      "algorithms-and-pseudocode",
      "values-and-variables",
      "data-types",
      "operators-and-expressions",
      "boolean-logic",
      "conditions",
      "loops",
      "lists-and-records",
      "errors-and-input-validation",
      "functions",
      "parameters-and-return-values",
      "scope-and-lifetime",
    ],
  },
  {
    id: "algorithm-navigator",
    callSign: "FP-02",
    title: "Algorithm navigator",
    objective: "Choose data structures and reason about solution cost.",
    articleIds: [
      "data-types",
      "operators-and-expressions",
      "loops",
      "lists-and-records",
      "sets-and-maps",
      "stacks-and-queues",
      "recursion",
      "searching",
      "sorting",
      "complexity-and-trade-offs",
    ],
  },
  {
    id: "backend-pilot",
    callSign: "FP-03",
    title: "Backend systems pilot",
    objective: "Understand the path from validated request to durable state.",
    articleIds: [
      "functions",
      "errors-and-input-validation",
      "state-and-persistence",
      "events-and-notifications",
      "api-boundaries-and-validation",
      "data-modeling",
      "databases-and-queries",
      "transactions-and-consistency",
      "http-and-web-basics",
      "authentication-and-authorization",
      "security-fundamentals",
    ],
  },
  {
    id: "reliability-commander",
    callSign: "FP-04",
    title: "Reliability commander",
    objective: "Keep asynchronous and distributed work observable and safe.",
    articleIds: [
      "state-and-persistence",
      "events-and-notifications",
      "workflows-and-state-machines",
      "reliable-processing-and-idempotency",
      "testing-state-transitions",
      "concurrency",
      "asynchronous-work",
      "messaging-and-queues",
      "caching",
      "logging-and-observability",
      "distributed-systems-basics",
      "deployment-and-environments",
      "configuration-and-secrets",
    ],
  },
  {
    id: "engineering-officer",
    callSign: "FP-05",
    title: "Engineering officer",
    objective: "Ship maintainable software with evidence and clear communication.",
    articleIds: [
      "modules-and-dependencies",
      "files-and-serialization",
      "debugging",
      "unit-testing",
      "integration-testing",
      "version-control",
      "code-review",
      "refactoring",
      "design-principles",
      "documentation-and-communication",
    ],
  },
];

export function nextArticleIdForPlan(
  planId: string,
  masteredArticleIds: string[],
  currentArticleId?: string,
  availableArticleIds?: ReadonlySet<string>,
) {
  const plan = flightPlans.find((candidate) => candidate.id === planId);
  if (!plan) return null;

  const articleIds = availableArticleIds
    ? plan.articleIds.filter((articleId) => availableArticleIds.has(articleId))
    : plan.articleIds;
  const mastered = new Set(masteredArticleIds);
  const currentIndex = currentArticleId
    ? articleIds.indexOf(currentArticleId)
    : -1;
  if (currentIndex < 0) {
    return articleIds.find((articleId) => !mastered.has(articleId)) ?? null;
  }

  return (
    articleIds
      .slice(0, currentIndex)
      .find((articleId) => !mastered.has(articleId)) ??
    articleIds
      .slice(currentIndex + 1)
      .find((articleId) => !mastered.has(articleId)) ??
    null
  );
}

export interface ExpeditionStep {
  id: string;
  title: string;
  brief: string;
  href: string;
}

export interface Expedition {
  id: string;
  callSign: string;
  title: string;
  summary: string;
  difficulty: "Cadet" | "Officer" | "Commander";
  steps: ExpeditionStep[];
}

export function missionStepType(step: ExpeditionStep) {
  return step.href.startsWith("/lab?") ? "simulation" : "lesson";
}

export function missionStepTargetId(step: ExpeditionStep) {
  if (missionStepType(step) === "lesson") {
    return step.href.slice("/articles/".length);
  }
  return new URLSearchParams(step.href.split("?")[1]).get("challenge") ?? "";
}

export function missionStepHref(missionId: string, step: ExpeditionStep) {
  const [path, query = ""] = step.href.split("?");
  const params = new URLSearchParams(query);
  params.set("mission", missionId);
  params.set("step", step.id);
  return `${path}?${params}`;
}

export function getMissionStepContext(missionId?: string, stepId?: string) {
  const mission = expeditions.find((candidate) => candidate.id === missionId);
  const stepIndex = mission?.steps.findIndex((step) => step.id === stepId) ?? -1;
  if (!mission || stepIndex < 0) return null;
  return {
    mission,
    step: mission.steps[stepIndex],
    stepIndex,
    nextStep: mission.steps[stepIndex + 1] ?? null,
  };
}

export function missionStepCompleted(
  step: ExpeditionStep,
  masteredArticleIds: string[],
  passedLabChallenges: string[],
) {
  const targetId = missionStepTargetId(step);
  return missionStepType(step) === "lesson"
    ? masteredArticleIds.includes(targetId)
    : passedLabChallenges.includes(targetId);
}

export const expeditions: Expedition[] = [
  {
    id: "guessing-signal",
    callSign: "EX-01",
    title: "Restore the docking sequence",
    summary:
      "Learn the core control-flow signals, then prove each one in the simulator.",
    difficulty: "Cadet",
    steps: [
      {
        id: "store-target",
        title: "Read ship telemetry",
        brief: "Learn how values and variables hold changing ship data.",
        href: "/articles/values-and-variables",
      },
      {
        id: "correct-fuel",
        title: "Correct the fuel signal",
        brief: "Apply the lesson by updating and transmitting a stored value.",
        href: "/lab?challenge=fuel-correction",
      },
      {
        id: "compare-guess",
        title: "Learn clearance decisions",
        brief: "Understand how conditions choose the safe flight path.",
        href: "/articles/conditions",
      },
      {
        id: "check-airlock",
        title: "Verify airlock clearance",
        brief: "Apply the lesson by implementing a safe conditional check.",
        href: "/lab?challenge=airlock-condition",
      },
      {
        id: "learn-orbits",
        title: "Learn repeated orbits",
        brief: "Understand how loops repeat work until a condition changes.",
        href: "/articles/loops",
      },
      {
        id: "repeat-contact",
        title: "Run the docking loop",
        brief: "Apply the lesson by transmitting three approach orbits.",
        href: "/lab?challenge=docking-loop",
      },
      {
        id: "record-attempts",
        title: "Record the approach log",
        brief: "Finish the mission by storing the sequence as structured data.",
        href: "/articles/lists-and-records",
      },
      {
        id: "inspect-approach-log",
        title: "Inspect the approach log",
        brief: "Apply the lesson by building and transmitting a collection.",
        href: "/lab?challenge=collection-log",
      },
    ],
  },
  {
    id: "cargo-manifest",
    callSign: "EX-02",
    title: "Build a cargo manifest",
    summary:
      "Turn raw cargo input into validated records, totals, and a saved manifest.",
    difficulty: "Cadet",
    steps: [
      {
        id: "shape-record",
        title: "Shape the manifest",
        brief: "Choose fields and collection structures for cargo records.",
        href: "/articles/lists-and-records",
      },
      {
        id: "verify-records",
        title: "Verify the cargo collection",
        brief: "Apply the lesson by building and transmitting a collection.",
        href: "/lab?challenge=collection-log",
      },
      {
        id: "learn-calculation",
        title: "Learn reusable calculations",
        brief: "Understand how functions turn inputs into a reusable result.",
        href: "/articles/functions",
      },
      {
        id: "calculate-mass",
        title: "Calculate payload mass",
        brief: "Apply the function lesson to the cargo mass calculation.",
        href: "/lab?challenge=cargo-function",
      },
      {
        id: "reject-invalid",
        title: "Reject unsafe cargo",
        brief: "Return useful errors before invalid values enter the manifest.",
        href: "/articles/errors-and-input-validation",
      },
      {
        id: "validate-cargo",
        title: "Run cargo validation",
        brief: "Apply the lesson by rejecting an invalid boundary value.",
        href: "/lab?challenge=validation-boundary",
      },
      {
        id: "save-manifest",
        title: "Commit the manifest",
        brief: "Separate temporary state from durable state.",
        href: "/articles/state-and-persistence",
      },
      {
        id: "commit-state",
        title: "Commit the manifest state",
        brief: "Apply the lesson by moving temporary state to a saved state.",
        href: "/lab?challenge=state-commit",
      },
    ],
  },
  {
    id: "station-api",
    callSign: "EX-03",
    title: "Open a station API",
    summary:
      "Design a small request path from the public boundary to consistent storage.",
    difficulty: "Officer",
    steps: [
      {
        id: "define-boundary",
        title: "Define the docking boundary",
        brief: "Describe accepted input and useful validation failures.",
        href: "/articles/api-boundaries-and-validation",
      },
      {
        id: "test-boundary",
        title: "Test the docking boundary",
        brief: "Apply the lesson by rejecting an invalid API payload.",
        href: "/lab?challenge=api-validation",
      },
      {
        id: "choose-request",
        title: "Choose the transmission",
        brief: "Match HTTP methods, paths, and status codes to intent.",
        href: "/articles/http-and-web-basics",
      },
      {
        id: "send-response",
        title: "Send the station response",
        brief: "Apply the lesson by matching a request to its response.",
        href: "/lab?challenge=http-response",
      },
      {
        id: "model-data",
        title: "Model station records",
        brief: "Choose identities, fields, relationships, and constraints.",
        href: "/articles/data-modeling",
      },
      {
        id: "verify-model",
        title: "Verify the station record",
        brief: "Apply the lesson by checking identity and ownership.",
        href: "/lab?challenge=record-model",
      },
      {
        id: "protect-route",
        title: "Authorize the airlock",
        brief: "Separate identity from permission.",
        href: "/articles/authentication-and-authorization",
      },
      {
        id: "test-authorization",
        title: "Test airlock authorization",
        brief: "Apply the lesson by denying an authenticated but unauthorized request.",
        href: "/lab?challenge=authorization-check",
      },
    ],
  },
  {
    id: "reliable-relay",
    callSign: "EX-04",
    title: "Stabilize the event relay",
    summary:
      "Keep a duplicate-prone asynchronous workflow safe, observable, and recoverable.",
    difficulty: "Commander",
    steps: [
      {
        id: "map-states",
        title: "Map relay states",
        brief: "Make allowed transitions and terminal states explicit.",
        href: "/articles/workflows-and-state-machines",
      },
      {
        id: "transition-workflow",
        title: "Run the relay transition",
        brief: "Apply the lesson by moving through allowed workflow states.",
        href: "/lab?challenge=workflow-transition",
      },
      {
        id: "deduplicate",
        title: "Neutralize duplicate signals",
        brief: "Design idempotent processing around a stable operation identity.",
        href: "/articles/reliable-processing-and-idempotency",
      },
      {
        id: "retry-operation",
        title: "Retry the relay operation",
        brief: "Apply the lesson by preventing a duplicate side effect.",
        href: "/lab?challenge=idempotent-retry",
      },
      {
        id: "queue-work",
        title: "Buffer transmission bursts",
        brief: "Choose what belongs on a queue and how failure is retried.",
        href: "/articles/messaging-and-queues",
      },
      {
        id: "drain-queue",
        title: "Drain the relay queue",
        brief: "Apply the lesson by processing queued work in order.",
        href: "/lab?challenge=queue-burst",
      },
      {
        id: "observe-flight",
        title: "Instrument the relay",
        brief: "Connect logs and signals to questions an operator must answer.",
        href: "/articles/logging-and-observability",
      },
      {
        id: "trace-failure",
        title: "Trace the relay failure",
        brief: "Apply the lesson by emitting a correlated diagnostic signal.",
        href: "/lab?challenge=observable-failure",
      },
    ],
  },
];

export interface LabChallenge {
  id: string;
  callSign: string;
  title: string;
  objective: string;
  starter: string;
  expectedOutput: string[];
  relatedArticleId: string;
}

export const labChallenges: LabChallenge[] = [
  {
    id: "fuel-correction",
    callSign: "SIM-01",
    title: "Fuel correction",
    objective: "Change a stored value and transmit the remaining fuel.",
    starter: `SET fuel TO 40
SET fuel TO fuel - 7
DISPLAY fuel`,
    expectedOutput: ["33"],
    relatedArticleId: "values-and-variables",
  },
  {
    id: "airlock-condition",
    callSign: "SIM-02",
    title: "Airlock condition",
    objective: "Approve docking only when clearance is at least five.",
    starter: `SET clearance TO 7
IF clearance IS AT LEAST 5 THEN
    DISPLAY "Docking approved"
ELSE
    DISPLAY "Docking denied"
END IF`,
    expectedOutput: ["Docking approved"],
    relatedArticleId: "conditions",
  },
  {
    id: "docking-loop",
    callSign: "SIM-03",
    title: "Docking loop",
    objective: "Transmit three approach orbits, then stop.",
    starter: `SET orbit TO 1
WHILE orbit IS AT MOST 3
    DISPLAY orbit
    SET orbit TO orbit + 1
END WHILE`,
    expectedOutput: ["1", "2", "3"],
    relatedArticleId: "loops",
  },
  {
    id: "cargo-function",
    callSign: "SIM-04",
    title: "Cargo function",
    objective: "Calculate total cargo mass through a reusable function.",
    starter: `FUNCTION cargo_mass(crates, mass_each)
    RETURN crates * mass_each
END FUNCTION

SET total TO cargo_mass(4, 6)
DISPLAY total`,
    expectedOutput: ["24"],
    relatedArticleId: "functions",
  },
  {
    id: "collection-log",
    callSign: "SIM-05",
    title: "Collection log",
    objective: "Build an ordered approach log and transmit the collection.",
    starter: `SET approach_log TO []
APPEND "orbit-1" TO approach_log
APPEND "orbit-2" TO approach_log
DISPLAY approach_log`,
    expectedOutput: ["[orbit-1, orbit-2]"],
    relatedArticleId: "lists-and-records",
  },
  {
    id: "validation-boundary",
    callSign: "SIM-06",
    title: "Validation boundary",
    objective: "Reject a negative cargo mass before it enters the manifest.",
    starter: `SET cargo_mass TO -3
IF cargo_mass IS LESS THAN 0 THEN
    DISPLAY "Cargo rejected"
ELSE
    DISPLAY "Cargo accepted"
END IF`,
    expectedOutput: ["Cargo rejected"],
    relatedArticleId: "errors-and-input-validation",
  },
  {
    id: "state-commit",
    callSign: "SIM-07",
    title: "State commit",
    objective: "Move a manifest from temporary draft state to saved state.",
    starter: `SET manifest_state TO "draft"
SET manifest_state TO "saved"
DISPLAY manifest_state`,
    expectedOutput: ["saved"],
    relatedArticleId: "state-and-persistence",
  },
  {
    id: "api-validation",
    callSign: "SIM-08",
    title: "API validation",
    objective: "Reject an API payload that is missing its required identity.",
    starter: `SET payload_has_id TO FALSE
IF NOT payload_has_id THEN
    DISPLAY "400 Invalid payload"
ELSE
    DISPLAY "202 Accepted"
END IF`,
    expectedOutput: ["400 Invalid payload"],
    relatedArticleId: "api-boundaries-and-validation",
  },
  {
    id: "http-response",
    callSign: "SIM-09",
    title: "HTTP response",
    objective: "Match a create request to the correct response status.",
    starter: `SET method TO "POST"
IF method IS EQUAL TO "POST" THEN
    DISPLAY "201 Created"
ELSE
    DISPLAY "405 Method Not Allowed"
END IF`,
    expectedOutput: ["201 Created"],
    relatedArticleId: "http-and-web-basics",
  },
  {
    id: "record-model",
    callSign: "SIM-10",
    title: "Record model",
    objective: "Verify that a station record has an identity and an owner.",
    starter: `SET station_id TO 42
SET has_owner TO TRUE
IF station_id IS GREATER THAN 0 AND has_owner IS EQUAL TO TRUE THEN
    DISPLAY "Record valid"
ELSE
    DISPLAY "Record invalid"
END IF`,
    expectedOutput: ["Record valid"],
    relatedArticleId: "data-modeling",
  },
  {
    id: "authorization-check",
    callSign: "SIM-11",
    title: "Authorization check",
    objective: "Deny an authenticated pilot who lacks airlock permission.",
    starter: `SET authenticated TO TRUE
SET can_open_airlock TO FALSE
IF authenticated AND can_open_airlock THEN
    DISPLAY "Access granted"
ELSE
    DISPLAY "Access denied"
END IF`,
    expectedOutput: ["Access denied"],
    relatedArticleId: "authentication-and-authorization",
  },
  {
    id: "workflow-transition",
    callSign: "SIM-12",
    title: "Workflow transition",
    objective: "Move a relay through queued, running, and completed states.",
    starter: `SET relay_state TO "queued"
IF relay_state IS EQUAL TO "queued" THEN
    SET relay_state TO "running"
END IF
IF relay_state IS EQUAL TO "running" THEN
    SET relay_state TO "completed"
END IF
DISPLAY relay_state`,
    expectedOutput: ["completed"],
    relatedArticleId: "workflows-and-state-machines",
  },
  {
    id: "idempotent-retry",
    callSign: "SIM-13",
    title: "Idempotent retry",
    objective: "Retry an operation without applying its side effect twice.",
    starter: `SET applied_count TO 0
SET already_processed TO FALSE
IF NOT already_processed THEN
    SET applied_count TO applied_count + 1
    SET already_processed TO TRUE
END IF
IF NOT already_processed THEN
    SET applied_count TO applied_count + 1
END IF
DISPLAY applied_count`,
    expectedOutput: ["1"],
    relatedArticleId: "reliable-processing-and-idempotency",
  },
  {
    id: "queue-burst",
    callSign: "SIM-14",
    title: "Queue burst",
    objective: "Process two buffered relay jobs in their queued order.",
    starter: `SET relay_queue TO ["job-a", "job-b"]
FOR EACH job IN relay_queue
    DISPLAY job
END FOR`,
    expectedOutput: ["job-a", "job-b"],
    relatedArticleId: "messaging-and-queues",
  },
  {
    id: "observable-failure",
    callSign: "SIM-15",
    title: "Observable failure",
    objective: "Emit a correlated diagnostic signal for a failed request.",
    starter: `SET request_id TO "req-42"
SET outcome TO "failed"
DISPLAY request_id + ": " + outcome`,
    expectedOutput: ["req-42: failed"],
    relatedArticleId: "logging-and-observability",
  },
];

export interface NodeTask {
  id: string;
  kind: "mission" | "simulation";
  callSign: string;
  title: string;
  href: string;
  targetId: string;
}

export function nodeTasksForArticle(articleId: string): NodeTask[] {
  const missionTasks = expeditions.flatMap((mission) =>
    mission.steps.flatMap((step) =>
      missionStepType(step) === "lesson" &&
      missionStepTargetId(step) === articleId
        ? [
            {
              id: `mission:${mission.id}:${step.id}`,
              kind: "mission" as const,
              callSign: mission.callSign,
              title: mission.title,
              href: missionStepHref(mission.id, step),
              targetId: articleId,
            },
          ]
        : [],
    ),
  );
  const simulationTasks = labChallenges
    .filter((challenge) => challenge.relatedArticleId === articleId)
    .map((challenge) => ({
      id: `simulation:${challenge.id}`,
      kind: "simulation" as const,
      callSign: challenge.callSign,
      title: challenge.title,
      href: `/lab?challenge=${challenge.id}`,
      targetId: challenge.id,
    }));
  return [...missionTasks, ...simulationTasks];
}

export function nodeTaskProgress(
  tasks: readonly NodeTask[],
  masteredArticleIds: readonly string[],
  passedLabChallenges: readonly string[],
  kind?: NodeTask["kind"],
) {
  const relevantTasks = kind
    ? tasks.filter((task) => task.kind === kind)
    : tasks;
  return {
    completed: relevantTasks.filter((task) =>
      nodeTaskCompleted(task, masteredArticleIds, passedLabChallenges),
    ).length,
    total: relevantTasks.length,
  };
}

export function nodeTaskCompleted(
  task: NodeTask,
  masteredArticleIds: readonly string[],
  passedLabChallenges: readonly string[],
) {
  return task.kind === "mission"
    ? masteredArticleIds.includes(task.targetId)
    : passedLabChallenges.includes(task.targetId);
}

export function nextNodeTask(
  tasks: readonly NodeTask[],
  masteredArticleIds: readonly string[],
  passedLabChallenges: readonly string[],
) {
  return (
    tasks.find(
      (task) =>
        !nodeTaskCompleted(
          task,
          masteredArticleIds,
          passedLabChallenges,
        ),
    ) ?? null
  );
}
