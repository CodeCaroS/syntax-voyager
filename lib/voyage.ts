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
) {
  const plan = flightPlans.find((candidate) => candidate.id === planId);
  if (!plan) return null;

  const mastered = new Set(masteredArticleIds);
  const currentIndex = currentArticleId
    ? plan.articleIds.indexOf(currentArticleId)
    : -1;
  if (currentIndex < 0) {
    return plan.articleIds.find((articleId) => !mastered.has(articleId)) ?? null;
  }

  return (
    plan.articleIds
      .slice(0, currentIndex)
      .find((articleId) => !mastered.has(articleId)) ??
    plan.articleIds
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

export const expeditions: Expedition[] = [
  {
    id: "guessing-signal",
    callSign: "EX-01",
    title: "Decode the guessing signal",
    summary:
      "Assemble the classic number-guessing program while tracing every state change.",
    difficulty: "Cadet",
    steps: [
      {
        id: "store-target",
        title: "Store the hidden coordinate",
        brief: "Use variables and expressions to represent the target and guess.",
        href: "/articles/values-and-variables",
      },
      {
        id: "compare-guess",
        title: "Compare the incoming signal",
        brief: "Choose the branch for a low, high, or correct guess.",
        href: "/articles/conditions",
      },
      {
        id: "repeat-contact",
        title: "Keep the channel open",
        brief: "Repeat until the correct coordinate arrives.",
        href: "/lab?challenge=docking-loop",
      },
      {
        id: "record-attempts",
        title: "Record the flight log",
        brief: "Store previous guesses and return a useful final result.",
        href: "/articles/lists-and-records",
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
        id: "calculate-mass",
        title: "Calculate payload mass",
        brief: "Move the calculation into a reusable function.",
        href: "/lab?challenge=cargo-function",
      },
      {
        id: "reject-invalid",
        title: "Reject unsafe cargo",
        brief: "Return useful errors before invalid values enter the manifest.",
        href: "/articles/errors-and-input-validation",
      },
      {
        id: "save-manifest",
        title: "Commit the manifest",
        brief: "Separate temporary state from durable state.",
        href: "/articles/state-and-persistence",
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
        id: "choose-request",
        title: "Choose the transmission",
        brief: "Match HTTP methods, paths, and status codes to intent.",
        href: "/articles/http-and-web-basics",
      },
      {
        id: "model-data",
        title: "Model station records",
        brief: "Choose identities, fields, relationships, and constraints.",
        href: "/articles/data-modeling",
      },
      {
        id: "protect-route",
        title: "Authorize the airlock",
        brief: "Separate identity from permission.",
        href: "/articles/authentication-and-authorization",
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
        id: "deduplicate",
        title: "Neutralize duplicate signals",
        brief: "Design idempotent processing around a stable operation identity.",
        href: "/articles/reliable-processing-and-idempotency",
      },
      {
        id: "queue-work",
        title: "Buffer transmission bursts",
        brief: "Choose what belongs on a queue and how failure is retried.",
        href: "/articles/messaging-and-queues",
      },
      {
        id: "observe-flight",
        title: "Instrument the relay",
        brief: "Connect logs and signals to questions an operator must answer.",
        href: "/articles/logging-and-observability",
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
];
