import { expect, test, type Page } from "@playwright/test";
import articles from "../../app/generated-content.json" with { type: "json" };
import {
  expeditions,
  flightPlans,
  galaxies,
  galaxyGates,
  labChallenges,
  missionStepHref,
  missionStepTargetId,
  missionStepType,
} from "../../lib/voyage";

const STORAGE_KEY = "syntax-voyager:flight-log:v1";

function watchBrowserErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  return errors;
}

async function expectNoHorizontalOverflow(page: Page) {
  await expect
    .poll(() =>
      page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth + 1,
      ),
    )
    .toBe(true);
}

const firstGalaxyMissionIds = articles
  .filter((article) => galaxies[0].includes(article.order))
  .map((article) => article.id);

test("search, keyboard navigation, and reduced motion operate the galaxy", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  const galaxy = page.getByRole("img", {
    name: /Interactive 3D map of connected software knowledge/,
  });
  await galaxy.focus();
  await page.keyboard.press("ArrowRight");
  await expect(galaxy).toBeFocused();

  await page.getByLabel("Choose a coordinate").fill("variables");
  const announcedResults = Number.parseInt(
    (await page.locator(".search-count").textContent()) ?? "0",
    10,
  );
  await expect(page.locator(".warp-results button")).toHaveCount(
    announcedResults,
  );
  await page
    .getByRole("button", { name: "02 Values and Variables", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Values and Variables" }),
  ).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("heading", { name: "Values and Variables" }),
  ).not.toBeVisible();

  await expect(page.locator(".galaxy-entry")).toHaveAttribute(
    "data-motion",
    "off",
  );
});

test("the four views share one navigation and preserve the learning context", async ({
  page,
}) => {
  await page.goto("/mission-control");

  const starmap = page.locator(".starmap-underlay .universe-canvas");
  await expect(starmap).toBeVisible();

  const missionNavigation = page.getByRole("navigation", {
    name: "View navigation",
  });
  await expect(
    missionNavigation.getByRole("link", { name: "Mission" }),
  ).toHaveAttribute("aria-current", "page");
  await page.getByRole("link", { name: /Continue route/ }).click();

  await expect(page).toHaveURL(/\/articles\/algorithms-and-pseudocode$/);
  await expect(starmap).toBeVisible();
  const readNavigation = page.getByRole("navigation", {
    name: "View navigation",
  });
  await expect(
    readNavigation.getByRole("link", { name: "Read" }),
  ).toHaveAttribute("aria-current", "page");

  await readNavigation.getByRole("link", { name: "Sim" }).click();
  const simulationNavigation = page.getByRole("navigation", {
    name: "View navigation",
  });
  await expect(
    simulationNavigation.getByRole("link", { name: "Sim" }),
  ).toHaveAttribute("aria-current", "page");
  await expect(starmap).toBeVisible();

  await simulationNavigation.getByRole("link", { name: "Galaxy" }).click();
  await expect(page.locator(".starmap-underlay")).toHaveCount(0);
  await expect(
    page
      .getByRole("navigation", { name: "View navigation" })
      .getByRole("link", { name: "Galaxy" }),
  ).toHaveAttribute("aria-current", "page");
});

test("EU AI Act transparency signage is available in every view", async ({
  page,
}) => {
  for (const route of [
    "/",
    "/articles/values-and-variables",
    "/mission-control",
    "/lab",
  ]) {
    await page.goto(route);
    await expect(
      page.getByRole("complementary", {
        name: "AI assistance and EU AI Act transparency notice",
      }),
    ).toBeVisible();
  }

  await page.goto("/");
  const notice = page.getByRole("complementary", {
    name: "AI assistance and EU AI Act transparency notice",
  });
  await notice.locator("summary").click();
  await expect(
    notice.getByText(
      "Generative AI tools assisted with this project's development and may have contributed to its code, copy, and educational content. Human review remains necessary.",
    ),
  ).toBeVisible();
  await expect(
    notice.getByText(
      "Voluntary disclosure — not a claim of conformity, certification, legal advice, or final risk classification.",
    ),
  ).toBeVisible();

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const mobileToggle = page
    .getByRole("complementary", {
      name: "AI assistance and EU AI Act transparency notice",
    })
    .locator("summary");
  const mobileToggleBox = await mobileToggle.boundingBox();
  expect(mobileToggleBox).not.toBeNull();
  expect(mobileToggleBox!.width).toBeGreaterThanOrEqual(44);
  expect(mobileToggleBox!.height).toBeGreaterThanOrEqual(44);
});

test("passing a black hole test warps directly to the next galaxy", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  await expect(page.locator(".explorer")).toHaveAttribute(
    "aria-busy",
    "false",
  );
  const galaxyGate = page.locator(".galaxy-gate");
  await page
    .getByRole("button", {
      name: "Unselect focused sun and return to galaxy overview",
    })
    .click();
  await expect(galaxyGate).toBeDisabled();
  await expect(galaxyGate).toContainText(
    `0/${firstGalaxyMissionIds.length} missions complete`,
  );
  await expect(galaxyGate).toHaveAccessibleName(
    `Black hole locked: 0/${firstGalaxyMissionIds.length} missions complete`,
  );

  await page.evaluate((masteredArticleIds) => {
    window.localStorage.setItem(
      "syntax-voyager:flight-log:v1",
      JSON.stringify({
        activePlanId: "cadet-launch",
        visitedArticleIds: masteredArticleIds,
        masteredArticleIds,
        completedExpeditionSteps: {},
        passedLabChallenges: [],
        passedGalaxyGates: [],
      }),
    );
  }, firstGalaxyMissionIds);
  await page.reload();
  await expect(galaxyGate).toBeEnabled();
  await page
    .getByRole("button", {
      name: "Unselect focused sun and return to galaxy overview",
    })
    .click();
  await expect(galaxyGate).toBeVisible();

  await galaxyGate.click();
  const gateDialog = page.getByRole("dialog");
  const closeGate = page.getByRole("button", { name: "Close galaxy test" });
  await expect(closeGate).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect
    .poll(() =>
      gateDialog.evaluate((dialog) => dialog.contains(document.activeElement)),
    )
    .toBe(true);
  await page.getByLabel("A loop").check();
  await page.getByRole("button", { name: "Cross event horizon" }).click();

  const transition = page.locator(".galaxy-entry");
  await expect(transition).toHaveAttribute("data-active", "true");
  await expect(transition).toContainText("Systems frontier");
  await expect(page.getByText("Warping to Systems frontier")).toBeVisible();
  await expect(page.getByLabel("Visit galaxy")).toHaveValue(
    "Systems frontier",
  );
  await expect(transition).toHaveAttribute("data-active", "false", {
    timeout: 2_000,
  });
});

test("galaxy selection completes when animation frames stall", async ({
  page,
}) => {
  await page.addInitScript(() => {
    window.requestAnimationFrame = () => 1;
    window.cancelAnimationFrame = () => undefined;
  });
  await page.goto("/");
  await expect(page.locator(".explorer")).toHaveAttribute(
    "aria-busy",
    "false",
  );

  await page
    .getByRole("button", {
      name: "Unselect focused sun and return to galaxy overview",
    })
    .click();
  await expect(page.locator(".galaxy-gate")).toBeVisible({ timeout: 2_000 });
});

test("one mission thread carries a lesson into its SIM and next lesson", async ({
  page,
}) => {
  await page.goto("/mission-control");
  const mission = page.locator(".expedition-board article").first();
  await expect(mission).toContainText("Restore the docking sequence");
  await mission
    .getByRole("link", { name: "Open related lesson" })
    .first()
    .click();

  await expect(page).toHaveURL(
    /\/articles\/values-and-variables\?mission=guessing-signal&step=store-target/,
  );
  await expect(
    page.getByLabel("Flight log"),
  ).toContainText("Restore the docking sequence");
  await expect(page.getByText(/Coordinate visited/)).toBeVisible();
  await page.getByRole("button", { name: "Confirm mastery" }).click();

  await page
    .getByRole("link", { name: /Correct the fuel signal/ })
    .click();
  await expect(page).toHaveURL(
    /\/lab\?challenge=fuel-correction&mission=guessing-signal&step=correct-fuel/,
  );
  await expect(
    page.getByRole("link", { name: "Mission", exact: true }),
  ).toHaveAttribute(
    "href",
    "/mission-control#mission-guessing-signal",
  );
  const missionRoute = page.getByRole("navigation", {
    name: "Mission route",
  });
  await expect(missionRoute).toContainText(
    "Pass this SIM to unlock the next stage",
  );

  await page.getByRole("button", { name: "Check mission" }).click();
  await expect(page.getByText("Mission passed")).toBeVisible();
  await expect(missionRoute).toContainText("Stage 2 complete");
  await missionRoute
    .getByRole("link", { name: "Next: Learn clearance decisions" })
    .click();
  await expect(page).toHaveURL(
    /\/articles\/conditions\?mission=guessing-signal&step=compare-guess/,
  );

  await page.getByRole("link", { name: "Mission", exact: true }).click();
  await expect(page).toHaveURL(
    /\/mission-control#mission-guessing-signal$/,
  );
  await expect(page.locator("#mission-guessing-signal")).toBeInViewport();
  await page.reload();
  await expect(page.locator(".expedition-board article").first()).toContainText(
    "2/8 stages",
  );
});

test("the simulator exposes pass, failure, stepping, and persisted results", async ({
  page,
}) => {
  await page.goto("/lab?challenge=cargo-function");
  await page.waitForLoadState("networkidle");

  await page.getByRole("button", { name: "Check mission" }).click();
  await expect(page.getByText("Mission passed")).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("button", { name: /Cargo function/ }),
  ).toContainText("Simulation passed");

  await page.getByLabel("Pseudocode program").fill("DISPLAY 99");
  await page.getByRole("button", { name: "Check mission" }).click();
  await expect(page.getByText("Check failed")).toBeVisible();

  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Reset code" }).click();
  await page.getByRole("button", { name: "Step instruction" }).click();
  await expect(page.getByText("Trace ready")).toBeVisible();
});

test("the simulator confirms before replacing edited code", async ({ page }) => {
  const current = labChallenges.find(
    (challenge) => challenge.id === "cargo-function",
  )!;
  const next = labChallenges.find((challenge) => challenge.id !== current.id)!;
  const editedSource = "DISPLAY 99";
  await page.goto(`/lab?challenge=${current.id}`);

  const editor = page.getByLabel("Pseudocode program");
  await editor.click();
  await page.keyboard.press("Control+A");
  await editor.pressSequentially(editedSource);
  await expect(editor).toHaveValue(editedSource);
  page.once("dialog", (dialog) => dialog.dismiss());
  await page
    .getByRole("button", { name: new RegExp(next.title) })
    .click();
  await expect(editor).toHaveValue(editedSource);

  page.once("dialog", (dialog) => dialog.accept());
  await page
    .getByRole("button", { name: new RegExp(next.title) })
    .click();
  await expect(editor).toHaveValue(next.starter);

  await editor.click();
  await page.keyboard.press("Control+A");
  await editor.pressSequentially(editedSource);
  await expect(editor).toHaveValue(editedSource);
  page.once("dialog", (dialog) => dialog.dismiss());
  await page.getByRole("button", { name: "Reset code" }).click();
  await expect(editor).toHaveValue(editedSource);

  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Reset code" }).click();
  await expect(editor).toHaveValue(next.starter);
});

for (const galaxy of galaxies) {
  test(`every ${galaxy.title} lesson renders without browser errors`, async ({
    page,
  }) => {
    test.setTimeout(90_000);
    const errors = watchBrowserErrors(page);
    const galaxyArticles = articles.filter((article) =>
      galaxy.includes(article.order),
    );

    for (const article of galaxyArticles) {
      await test.step(article.id, async () => {
        const response = await page.goto(`/articles/${article.id}`, {
          waitUntil: "domcontentloaded",
        });
        expect(response?.status(), article.id).toBe(200);
        await expect(
          page.locator(".article-header").getByRole("heading", {
            level: 1,
            name: article.title,
            exact: true,
          }),
        ).toBeVisible();
        await expect(page.getByText("Lesson objective")).toBeVisible();
        await expect(
          page.getByRole("navigation", { name: "Article navigation" }),
        ).toBeVisible();
      });
    }

    expect(errors).toEqual([]);
  });
}

test("every guided mission stage opens the intended lesson or SIM context", async ({
  page,
}) => {
  test.setTimeout(120_000);

  for (const mission of expeditions) {
    for (const [index, step] of mission.steps.entries()) {
      await test.step(`${mission.id}/${step.id}`, async () => {
        const response = await page.goto(missionStepHref(mission.id, step), {
          waitUntil: "domcontentloaded",
        });
        expect(response?.status()).toBe(200);

        if (missionStepType(step) === "lesson") {
          const article = articles.find(
            (candidate) => candidate.id === missionStepTargetId(step),
          );
          expect(article).toBeTruthy();
          await expect(
            page.locator(".article-header").getByRole("heading", {
              level: 1,
              name: article!.title,
              exact: true,
            }),
          ).toBeVisible();
          await expect(page.getByLabel("Flight log")).toContainText(
            `${mission.callSign} · Step ${index + 1}/${mission.steps.length}`,
          );
          await expect(page.getByLabel("Flight log")).toContainText(
            mission.title,
          );
        } else {
          const challenge = labChallenges.find(
            (candidate) => candidate.id === missionStepTargetId(step),
          );
          expect(challenge).toBeTruthy();
          await expect(
            page.getByRole("heading", {
              level: 2,
              name: challenge!.title,
              exact: true,
            }),
          ).toBeVisible();
          await expect(
            page.getByRole("navigation", { name: "Mission route" }),
          ).toContainText("Pass this SIM to unlock the next stage");
          await expect(page.locator(".simulation-brief")).toContainText(
            mission.title,
          );
        }
      });
    }
  }
});

test("every simulator starter passes in the browser without duplicate records", async ({
  page,
}) => {
  test.setTimeout(120_000);
  await page.goto("/");
  await page.evaluate((key) => window.localStorage.removeItem(key), STORAGE_KEY);

  for (const [index, challenge] of labChallenges.entries()) {
    await test.step(challenge.id, async () => {
      await page.goto(`/lab?challenge=${challenge.id}`);
      await expect(
        page.getByRole("heading", {
          level: 2,
          name: challenge.title,
          exact: true,
        }),
      ).toBeVisible();
      await expect(page.locator(".simulation-page")).toHaveAttribute(
        "aria-busy",
        "false",
      );
      await expect(page.getByLabel("Pseudocode program")).toHaveValue(
        challenge.starter,
      );
      await expect(
        page.getByRole("link", { name: "Open related lesson" }),
      ).toHaveAttribute("href", `/articles/${challenge.relatedArticleId}`);

      await page.getByRole("button", { name: "Check mission" }).click();
      await expect(page.locator("[data-status]")).toHaveText("Mission passed");
      for (const output of challenge.expectedOutput) {
        await expect(page.locator(".runtime-grid")).toContainText(output);
      }

      if (index === 0) {
        await page.getByRole("button", { name: "Check mission" }).click();
      }
    });
  }

  const passed = await page.evaluate((key) => {
    const stored = window.localStorage.getItem(key);
    return stored ? JSON.parse(stored).passedLabChallenges : [];
  }, STORAGE_KEY);
  expect([...passed].sort()).toEqual(
    labChallenges.map((challenge) => challenge.id).sort(),
  );
});

test("mission control persists plans, expands manifests, and safely resets storage", async ({
  page,
}) => {
  await page.goto("/mission-control");
  await expect(
    page.locator(".control-section > .section-heading h2"),
  ).toHaveText(["Guided missions", "Learning plans", "Galaxy progress"]);
  await expect(page.locator(".mission-telemetry dd").first()).toHaveText(
    /^\d+$/,
  );

  const firstGalaxy = galaxies[0];
  const firstManifest = page.locator(".sector-manifest").first();
  await firstManifest.getByText("Coordinate manifest").click();
  await expect(firstManifest).toHaveAttribute("open", "");
  await expect(firstManifest.getByRole("listitem")).toHaveCount(
    articles.filter((article) => firstGalaxy.includes(article.order)).length,
  );
  await firstManifest.getByText("Coordinate manifest").click();
  await expect(firstManifest).not.toHaveAttribute("open", "");

  for (const plan of flightPlans) {
    const option = page.getByRole("button", {
      name: new RegExp(plan.title),
    });
    await option.click();
    await expect(option).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator(".active-flight-plan h3")).toHaveText(plan.title);
  }

  await page.reload();
  await expect(
    page.getByRole("button", {
      name: new RegExp(flightPlans.at(-1)!.title),
    }),
  ).toHaveAttribute("aria-pressed", "true");

  const resetFlightLog = page.getByRole("button", {
    name: "Reset flight log",
  });
  await resetFlightLog.click();
  const keepFlightLog = page.getByRole("button", { name: "Keep flight log" });
  await expect(keepFlightLog).toBeFocused();
  await keepFlightLog.click();
  await expect(resetFlightLog).toBeFocused();
  await expect(
    page.getByRole("button", {
      name: new RegExp(flightPlans.at(-1)!.title),
    }),
  ).toHaveAttribute("aria-pressed", "true");

  await page.getByRole("button", { name: "Reset flight log" }).click();
  await page.getByRole("button", { name: "Confirm reset" }).click();
  await expect(
    page.getByRole("button", { name: new RegExp(flightPlans[0].title) }),
  ).toHaveAttribute("aria-pressed", "true");
  const telemetry = page.locator(".mission-telemetry");
  for (const [label, value] of [
    ["Coordinates visited", "0"],
    ["Mastery signals", "0"],
    ["Mission stages", `0/${expeditions.flatMap((mission) => mission.steps).length}`],
    ["Lab simulations", "0"],
  ]) {
    await expect(
      telemetry.locator("div").filter({ hasText: label }).locator("dd"),
    ).toHaveText(value);
  }
  await expect
    .poll(() =>
      page.evaluate((key) => window.localStorage.getItem(key), STORAGE_KEY),
    )
    .toBeNull();

  await page.evaluate(
    ({ key, value }) => window.localStorage.setItem(key, value),
    { key: STORAGE_KEY, value: "{not-json" },
  );
  await page.reload();
  await expect(
    page.getByRole("button", { name: new RegExp(flightPlans[0].title) }),
  ).toHaveAttribute("aria-pressed", "true");
});

test("article controls translate examples, persist mastery, and reject mismatched mission context", async ({
  page,
}) => {
  await page.goto("/articles/values-and-variables");
  await expect(page.getByLabel("Flight log")).toContainText(
    /Coordinate visited|Mastery signal confirmed/,
  );

  const bridge = page.locator(".language-bridge").first();
  for (const language of ["TypeScript", "Python", "Java", "Pseudocode"]) {
    await bridge.getByRole("button", { name: `Show ${language}` }).click();
    await expect(bridge.locator("code")).toHaveAttribute(
      "data-language",
      language.toLowerCase(),
    );
  }

  const mastery = page.getByRole("button", { name: "Confirm mastery" });
  await mastery.click();
  await expect(
    page.getByRole("button", { name: "Reopen training" }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Reopen training" }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Reopen training" }).click();
  await expect(mastery).toHaveAttribute("aria-pressed", "false");

  const headingLink = page
    .getByRole("navigation", { name: "On this page" })
    .getByRole("link")
    .first();
  const headingHref = await headingLink.getAttribute("href");
  await headingLink.click();
  await expect(page).toHaveURL(new RegExp(`${headingHref}$`));

  await page.goto(
    "/articles/values-and-variables?mission=guessing-signal&step=correct-fuel",
  );
  await expect(page.getByLabel("Flight log")).toContainText("Origin sector");
  await expect(page.getByLabel("Flight log")).not.toContainText(
    "Restore the docking sequence",
  );
});

test("article heading rail follows scrolling between observer callbacks", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "IntersectionObserver", {
      configurable: true,
      value: class {
        constructor() {
          document.documentElement.dataset.scrollSpyReady = "true";
        }
        observe() {}
        unobserve() {}
        disconnect() {}
        takeRecords() {
          return [];
        }
      },
    });
  });
  await page.goto("/articles/values-and-variables");
  await expect(page.locator("html")).toHaveAttribute(
    "data-scroll-spy-ready",
    "true",
  );

  const headingRail = page.getByRole("navigation", { name: "On this page" });
  await expect(headingRail.getByRole("link").first()).toHaveAttribute(
    "aria-current",
    "location",
  );
  const targetHeadingLink = headingRail.getByRole("link", {
    name: "Common mistakes",
    exact: true,
  });
  await page.evaluate(() =>
    document.getElementById("common-mistakes")?.scrollIntoView(),
  );
  await expect(targetHeadingLink).toHaveAttribute("aria-current", "location");
});

test("all galaxy gates validate a wrong answer before unlocking the next sector", async ({
  page,
}) => {
  test.setTimeout(60_000);
  await page.goto("/");
  await page.evaluate(
    ({ key, masteredArticleIds }) => {
      window.localStorage.setItem(
        key,
        JSON.stringify({
          activePlanId: "cadet-launch",
          visitedArticleIds: masteredArticleIds,
          masteredArticleIds,
          completedExpeditionSteps: {},
          passedLabChallenges: [],
          passedGalaxyGates: [],
        }),
      );
    },
    {
      key: STORAGE_KEY,
      masteredArticleIds: articles.map((article) => article.id),
    },
  );
  await page.reload();
  await page
    .getByRole("button", {
      name: "Unselect focused sun and return to galaxy overview",
    })
    .click();

  for (const [index, gate] of galaxyGates.entries()) {
    const gateButton = page.locator(".galaxy-gate");
    await expect(gateButton).toBeEnabled();
    await gateButton.click();

    const submit = page.getByRole("button", { name: "Cross event horizon" });
    await expect(submit).toBeDisabled();
    await page
      .getByLabel(
        gate.answers.find((answer) => answer !== gate.correctAnswer)!,
      )
      .check();
    await submit.click();
    await expect(page.getByRole("alert")).toContainText("Signal rejected");

    await page.getByLabel(gate.correctAnswer).check();
    await expect(page.getByRole("alert")).toHaveCount(0);
    await submit.click();
    await expect(page.getByLabel("Visit galaxy").locator("option")).toHaveCount(
      index + 2,
    );
    await expect(page.locator(".galaxy-entry")).toHaveAttribute(
      "data-active",
      "false",
    );
  }

  await expect(page.locator(".galaxy-gate")).toContainText("Gates cleared");
  await page.locator(".galaxy-gate").click();
  await expect(page.getByText("Every knowledge galaxy is online.")).toBeVisible();
  await page.getByRole("button", { name: "Close galaxy test" }).click();
});

test("primary views remain usable without horizontal overflow on mobile", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const routes = [
    "/",
    "/mission-control",
    "/articles/values-and-variables",
    "/lab?challenge=fuel-correction",
  ];

  for (const route of routes) {
    await test.step(route, async () => {
      await page.goto(route);
      await expect(page.getByRole("main").first()).toBeVisible();
      await expect(
        page.getByRole("navigation", { name: "View navigation" }),
      ).toBeVisible();
      await expectNoHorizontalOverflow(page);
    });
  }
});

test("mobile galaxy keeps search and primary controls reachable", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  const search = page.locator(".universe-search");
  const inspector = page.locator(".node-inspector");
  await expect(search).toBeVisible();
  await expect(inspector).toBeVisible();
  const searchBox = await search.boundingBox();
  const inspectorBox = await inspector.boundingBox();
  expect(searchBox).not.toBeNull();
  expect(inspectorBox).not.toBeNull();
  expect(searchBox!.y + searchBox!.height).toBeLessThanOrEqual(inspectorBox!.y);

  const undersizedTargets = await page
    .locator(
      ".view-navigation a, .galaxy-picker select, .universe-controls button",
    )
    .evaluateAll((elements) =>
      elements.flatMap((element) => {
        const bounds = element.getBoundingClientRect();
        if (!bounds.width || !bounds.height) return [];
        return bounds.width < 44 || bounds.height < 44
          ? [
              {
                label:
                  element.getAttribute("aria-label") ?? element.textContent,
                width: bounds.width,
                height: bounds.height,
              },
            ]
          : [];
      }),
    );
  expect(undersizedTargets).toEqual([]);

  await page.evaluate((masteredArticleIds) => {
    window.localStorage.setItem(
      "syntax-voyager:flight-log:v1",
      JSON.stringify({
        activePlanId: "cadet-launch",
        visitedArticleIds: masteredArticleIds,
        masteredArticleIds,
        completedExpeditionSteps: {},
        passedLabChallenges: [],
        passedGalaxyGates: [],
      }),
    );
  }, firstGalaxyMissionIds);
  await page.reload();
  await page
    .getByRole("button", {
      name: "Unselect focused sun and return to galaxy overview",
    })
    .click();
  const galaxyGate = page.locator(".galaxy-gate");
  await expect(galaxyGate).toBeVisible();
  await galaxyGate.click();
  const closeBox = await page
    .getByRole("button", { name: "Close galaxy test" })
    .boundingBox();
  expect(closeBox).not.toBeNull();
  expect(closeBox!.width).toBeGreaterThanOrEqual(44);
  expect(closeBox!.height).toBeGreaterThanOrEqual(44);
});

test("unknown article routes return a real not-found response", async ({
  page,
}) => {
  const response = await page.goto("/articles/not-a-real-coordinate");
  expect(response?.status()).toBe(404);
  await expect(page.getByText(/not found/i).first()).toBeVisible();
});
