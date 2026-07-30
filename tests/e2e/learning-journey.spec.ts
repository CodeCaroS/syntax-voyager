import { expect, test } from "@playwright/test";
import articles from "../../app/generated-content.json" with { type: "json" };
import { galaxies } from "../../lib/voyage";

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

test("passing a black hole test warps directly to the next galaxy", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
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
  await expect(galaxyGate).toBeEnabled();

  await galaxyGate.click();
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

test("lesson mastery and expedition progress survive reloads", async ({
  page,
}) => {
  await page.goto("/articles/values-and-variables");
  await expect(page.getByText(/Coordinate visited/)).toBeVisible();
  await page.getByRole("button", { name: "Confirm mastery" }).click();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Reopen training" }),
  ).toHaveAttribute("aria-pressed", "true");

  await page.getByRole("link", { name: "Mission" }).click();
  await expect(page.getByText("1/12 mastered").first()).toBeVisible();

  const checkpoint = page.getByRole("button", {
    name: "Complete Store the hidden coordinate",
  });
  await checkpoint.click();
  await page.reload();
  await expect(
    page.getByRole("button", {
      name: "Reopen Store the hidden coordinate",
    }),
  ).toHaveAttribute("aria-pressed", "true");
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

  await page.getByRole("button", { name: "Reset code" }).click();
  await page.getByRole("button", { name: "Step instruction" }).click();
  await expect(page.getByText("Trace ready")).toBeVisible();
});
