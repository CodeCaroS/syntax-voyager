"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  expeditions,
  flightPlans,
  galaxies,
  galaxyForOrder,
  missionStepCompleted,
  missionStepHref,
  missionStepType,
  nextArticleIdForPlan,
  type GalaxyId,
} from "@/lib/voyage";
import { useVoyageProgress } from "./useVoyageProgress";
import ViewNavigation from "./ViewNavigation";

interface MissionArticle {
  id: string;
  title: string;
  summary: string;
  order: number;
  level: string;
}

const totalExpeditionSteps = expeditions.reduce(
  (total, expedition) => total + expedition.steps.length,
  0,
);

export default function MissionControl({
  articles,
}: {
  articles: MissionArticle[];
}) {
  const { progress, ready, updateProgress, resetProgress } =
    useVoyageProgress();
  const [confirmingReset, setConfirmingReset] = useState(false);
  const [expandedGalaxyIds, setExpandedGalaxyIds] = useState<GalaxyId[]>([]);

  const articleById = useMemo(
    () => new Map(articles.map((article) => [article.id, article])),
    [articles],
  );
  const galaxyNodes = useMemo(
    () =>
      galaxies.map((galaxy) => ({
        galaxy,
        nodes: articles.filter(
          (article) => galaxyForOrder(article.order).id === galaxy.id,
        ),
      })),
    [articles],
  );
  const masteredIds = useMemo(
    () => new Set(progress.masteredArticleIds),
    [progress.masteredArticleIds],
  );
  const activePlan =
    flightPlans.find((plan) => plan.id === progress.activePlanId) ??
    flightPlans[0];
  const planMastered = activePlan.articleIds.filter((id) =>
    masteredIds.has(id),
  ).length;
  const nextPlanArticleId = nextArticleIdForPlan(
    activePlan.id,
    progress.masteredArticleIds,
  );
  const nextPlanArticle = nextPlanArticleId
    ? articleById.get(nextPlanArticleId)
    : undefined;
  const completedExpeditionSteps = useMemo(
    () =>
      expeditions
        .flatMap((mission) => mission.steps)
        .filter((step) =>
          missionStepCompleted(
            step,
            progress.masteredArticleIds,
            progress.passedLabChallenges,
          ),
        ).length,
    [progress.masteredArticleIds, progress.passedLabChallenges],
  );

  return (
    <main className="mission-control-page" id="main-content">
      <header className="mission-control-header">
        <div className="mission-topbar">
          <Link className="brand" href="/">
            <span className="brand-mark" aria-hidden="true">
              SV
            </span>
            <span>
              <strong>Syntax Voyager</strong>
              <small>Return to knowledge galaxy</small>
            </span>
          </Link>
          <ViewNavigation
            current="mission"
            readHref={
              nextPlanArticle
                ? `/articles/${nextPlanArticle.id}`
                : `/articles/${activePlan.articleIds[0]}`
            }
          />
        </div>
        <div className="mission-control-intro">
          <p className="eyebrow">[ EDU-SYS / MISSION CONTROL ]</p>
          <h1>Your route through knowledge space.</h1>
          <p>
            Choose a mission, learn each concept in its lesson, and prove it
            in the simulator. The flight log stays on this device.
          </p>
        </div>
        <section className="mission-next-step" aria-labelledby="next-step-title">
          <div>
            <span>{activePlan.callSign} / ACTIVE ROUTE</span>
            <strong>{activePlan.title}</strong>
            <small>
              {planMastered}/{activePlan.articleIds.length} mastered
            </small>
          </div>
          <div>
            <span>Next learning step</span>
            <h2 id="next-step-title">
              {nextPlanArticle?.title ?? "Route complete"}
            </h2>
            <p>
              {nextPlanArticle?.summary ??
                "Every coordinate in this route has a mastery signal."}
            </p>
          </div>
          <div>
            {nextPlanArticle ? (
              <Link href={`/articles/${nextPlanArticle.id}`}>
                Continue route <span aria-hidden="true">→</span>
              </Link>
            ) : (
              <Link href="/lab">
                Open simulator <span aria-hidden="true">→</span>
              </Link>
            )}
            <a href="#flight-plans">Change flight plan</a>
          </div>
        </section>
        <dl className="mission-telemetry" aria-label="Voyage progress">
          <div>
            <dt>Coordinates visited</dt>
            <dd>{ready ? progress.visitedArticleIds.length : "—"}</dd>
          </div>
          <div>
            <dt>Mastery signals</dt>
            <dd>{ready ? progress.masteredArticleIds.length : "—"}</dd>
          </div>
          <div>
            <dt>Mission stages</dt>
            <dd>
              {ready
                ? `${completedExpeditionSteps}/${totalExpeditionSteps}`
                : "—"}
            </dd>
          </div>
          <div>
            <dt>Lab simulations</dt>
            <dd>{ready ? progress.passedLabChallenges.length : "—"}</dd>
          </div>
        </dl>
      </header>

      <section className="control-section" aria-labelledby="galaxies-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Navigation array</p>
            <h2 id="galaxies-title">Five knowledge galaxies</h2>
          </div>
          <p>
            The original 50 coordinates are now grouped by the kind of
            engineering judgment they develop.
          </p>
        </div>
        <div className="galaxy-manifest">
          {galaxyNodes.map(({ galaxy, nodes }) => {
            const mastered = nodes.filter((article) =>
              masteredIds.has(article.id),
            ).length;
            const nextNode =
              nodes.find((article) => !masteredIds.has(article.id)) ?? nodes[0];
            const expanded = expandedGalaxyIds.includes(galaxy.id);

            return (
              <article key={galaxy.id}>
                <header>
                  <span>{galaxy.callSign}</span>
                  <small>
                    {mastered.toString().padStart(2, "0")} /{" "}
                    {nodes.length.toString().padStart(2, "0")}
                  </small>
                </header>
                <h3>{galaxy.title}</h3>
                <p>{galaxy.summary}</p>
                <div
                  className="signal-meter"
                  aria-label={`${mastered} of ${nodes.length} coordinates mastered`}
                >
                  <span
                    style={{
                      transform: `scaleX(${
                        nodes.length ? mastered / nodes.length : 0
                      })`,
                    }}
                  />
                </div>
                <details className="sector-manifest" open={expanded}>
                  <summary
                    onClick={(event) => {
                      event.preventDefault();
                      setExpandedGalaxyIds((current) =>
                        current.includes(galaxy.id)
                          ? current.filter((id) => id !== galaxy.id)
                          : [...current, galaxy.id],
                      );
                    }}
                  >
                    Coordinate manifest
                  </summary>
                  {expanded ? (
                    <ol>
                      {nodes.map((article) => (
                        <li
                          data-complete={masteredIds.has(article.id)}
                          key={article.id}
                        >
                          <span>
                            {article.order.toString().padStart(2, "0")}
                          </span>
                          <Link href={`/articles/${article.id}`}>
                            {article.title}
                          </Link>
                        </li>
                      ))}
                    </ol>
                  ) : null}
                </details>
                {nextNode ? (
                  <Link href={`/articles/${nextNode.id}`}>
                    {mastered === nodes.length
                      ? "Revisit sector"
                      : `Next: ${nextNode.title}`}
                  </Link>
                ) : null}
              </article>
            );
          })}
        </div>
      </section>

      <section
        className="control-section flight-plans"
        id="flight-plans"
        aria-labelledby="plans-title"
      >
        <div className="section-heading">
          <div>
            <p className="eyebrow">Autopilot routes</p>
            <h2 id="plans-title">Personal flight plans</h2>
          </div>
          <p>
            Activate one outcome-driven route. Prerequisite coordinates remain
            ordinary lessons, so the plan never traps you in a wizard.
          </p>
        </div>
        <div className="plan-selector" aria-label="Available flight plans">
          {flightPlans.map((plan) => (
            <button
              type="button"
              key={plan.id}
              aria-pressed={activePlan.id === plan.id}
              onClick={() =>
                updateProgress((current) => ({
                  ...current,
                  activePlanId: plan.id,
                }))
              }
            >
              <span>{plan.callSign}</span>
              <strong>{plan.title}</strong>
              <small>{plan.objective}</small>
            </button>
          ))}
        </div>
        <article className="active-flight-plan" aria-live="polite">
          <header>
            <div>
              <span>{activePlan.callSign} / ACTIVE ROUTE</span>
              <h3>{activePlan.title}</h3>
            </div>
            <strong>
              {planMastered}/{activePlan.articleIds.length} mastered
            </strong>
          </header>
          <ol>
            {activePlan.articleIds.map((articleId, index) => {
              const article = articleById.get(articleId);
              const mastered = masteredIds.has(articleId);
              return article ? (
                <li data-complete={mastered} key={articleId}>
                  <span>{(index + 1).toString().padStart(2, "0")}</span>
                  <Link href={`/articles/${article.id}`}>
                    <strong>{article.title}</strong>
                    <small>
                      {mastered ? "Mastery confirmed" : article.summary}
                    </small>
                  </Link>
                  <i aria-hidden="true">{mastered ? "✓" : "→"}</i>
                </li>
              ) : null;
            })}
          </ol>
        </article>
      </section>

      <section
        className="control-section"
        id="missions"
        aria-labelledby="expeditions-title"
      >
        <div className="section-heading">
          <div>
            <p className="eyebrow">Guided routes</p>
            <h2 id="expeditions-title">Missions</h2>
          </div>
          <p>
            Every mission is one ordered thread: open the lesson briefing,
            confirm mastery, pass the matching SIM check, then continue.
          </p>
        </div>
        <div className="expedition-board">
          {expeditions.map((expedition) => {
            const completed = expedition.steps.filter((step) =>
              missionStepCompleted(
                step,
                progress.masteredArticleIds,
                progress.passedLabChallenges,
              ),
            );
            return (
              <article key={expedition.id}>
                <header>
                  <span>{expedition.callSign}</span>
                  <small>{expedition.difficulty}</small>
                </header>
                <h3>{expedition.title}</h3>
                <p>{expedition.summary}</p>
                <ol>
                  {expedition.steps.map((step, index) => {
                    const checked = completed.some(
                      (completedStep) => completedStep.id === step.id,
                    );
                    const type = missionStepType(step);
                    return (
                      <li data-complete={checked} key={step.id}>
                        <span>{(index + 1).toString().padStart(2, "0")}</span>
                        <div>
                          <em>
                            {type === "lesson"
                              ? "Lesson briefing"
                              : "SIM mission"}
                          </em>
                          <strong>{step.title}</strong>
                          <small>{step.brief}</small>
                          <Link href={missionStepHref(expedition.id, step)}>
                            Open {type === "lesson" ? "lesson" : "SIM mission"}
                          </Link>
                        </div>
                        <span
                          className="mission-step-status"
                          aria-label={`${step.title}: ${
                            checked ? "complete" : "not complete"
                          }`}
                        >
                          {checked ? "✓" : "→"}
                        </span>
                      </li>
                    );
                  })}
                </ol>
                <footer>
                  <span>
                    {completed.length}/{expedition.steps.length} stages
                  </span>
                  <div
                    className="signal-meter"
                    aria-label={`${completed.length} of ${expedition.steps.length} checkpoints complete`}
                  >
                    <span
                      style={{
                        transform: `scaleX(${
                          completed.length / expedition.steps.length
                        })`,
                      }}
                    />
                  </div>
                </footer>
              </article>
            );
          })}
        </div>
      </section>

      <section className="flight-log-reset" aria-labelledby="flight-log-title">
        <div>
          <p className="eyebrow">Device storage</p>
          <h2 id="flight-log-title">Flight log controls</h2>
          <p>
            Progress is saved only in this browser. No account or remote
            profile is required.
          </p>
        </div>
        {confirmingReset ? (
          <div className="reset-confirmation">
            <p>This removes every local lesson, mission, and SIM record.</p>
            <button
              type="button"
              onClick={() => {
                resetProgress();
                setConfirmingReset(false);
              }}
            >
              Confirm reset
            </button>
            <button type="button" onClick={() => setConfirmingReset(false)}>
              Keep flight log
            </button>
          </div>
        ) : (
          <button type="button" onClick={() => setConfirmingReset(true)}>
            Reset flight log
          </button>
        )}
      </section>
    </main>
  );
}
