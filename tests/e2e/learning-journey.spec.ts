import { expect, test } from "@playwright/test";

test("search, keyboard navigation, and motion controls operate the galaxy", async ({
  page,
}) => {
  await page.goto("/");

  const galaxy = page.getByRole("img", {
    name: /Interactive 3D map of connected software knowledge/,
  });
  await galaxy.focus();
  await page.keyboard.press("ArrowRight");
  await expect(galaxy).toBeFocused();

  await page.getByLabel("Choose a coordinate").fill("variables");
  await page.getByRole("button", { name: /Values and Variables/ }).click();
  await expect(
    page.getByRole("heading", { name: "Values and Variables" }),
  ).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("heading", { name: "Values and Variables" }),
  ).not.toBeVisible();

  const motion = page.getByRole("button", { name: "Flight on" });
  await motion.click();
  await expect(
    page.getByRole("button", { name: "Flight off" }),
  ).toHaveAttribute("aria-pressed", "false");
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

  await page.getByRole("link", { name: "Mission control" }).last().click();
  await expect(page.getByText("1/12 mastered")).toBeVisible();

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
