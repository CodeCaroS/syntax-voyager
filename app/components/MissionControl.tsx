"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  expeditions,
  flightPlans,
  galaxies,
  galaxyForOrder,
} from "@/lib/voyage";
import { useVoyageProgress } from "./useVoyageProgress";

interface MissionArticle {
  id: string;
  title: string;
  summary: string;
  order: number;
  level: string;
}

function unique(values: string[]) {
  return [...new Set(values)];
}

export default function MissionControl({
  articles,
}: {
  articles: MissionArticle[];
}) {
  const { progress, ready, updateProgress, resetProgress } =
    useVoyageProgress();
  const [confirmingReset, setConfirmingReset] = useState(false);

  const articleById = useMemo(
    () => new Map(articles.map((article) => [article.id, article])),
    [articles],
  );
  const activePlan =
    flightPlans.find((plan) => plan.id === progress.activePlanId) ??
    flightPlans[0];
  const planMastered = activePlan.articleIds.filter((id) =>
    progress.masteredArticleIds.includes(id),
  ).length;
  const totalExpeditionSteps = expeditions.reduce(
    (total, expedition) => total + expedition.steps.length,
    0,
  );
  const completedExpeditionSteps = Object.values(
    progress.completedExpeditionSteps,
  ).reduce((total, steps) => total + steps.length, 0);

  const toggleExpeditionStep = (expeditionId: string, stepId: string) => {
    updateProgress((current) => {
      const completed = current.completedExpeditionSteps[expeditionId] ?? [];
      return {
        ...current,
        completedExpeditionSteps: {
          ...current.completedExpeditionSteps,
          [expeditionId]: completed.includes(stepId)
            ? completed.filter((id) => id !== stepId)
            : unique([...completed, stepId]),
        },
      };
    });
  };

  return (
    <main className="mission-control-page" id="main-content">
      <header className="mission-control-header">
        <nav aria-label="Primary navigation">
          <Link className="brand" href="/">
            <span className="brand-mark" aria-hidden="true">
              SV
            </span>
            <span>
              <strong>Syntax Voyager</strong>
              <small>Return to knowledge galaxy</small>
            </span>
          </Link>
          <Link href="/lab">Simulation deck</Link>
        </nav>
        <div className="mission-control-intro">
          <p className="eyebrow">[ EDU-SYS / MISSION CONTROL ]</p>
          <h1>Your route through knowledge space.</h1>
          <p>
            Choose a flight plan, clear lesson coordinates, and combine them
            into expeditions. The flight log stays on this device.
          </p>
        </div>
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
            <dt>Expedition checks</dt>
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
          {galaxies.map((galaxy) => {
            const nodes = articles.filter(
              (article) => galaxyForOrder(article.order).id === galaxy.id,
            );
            const mastered = nodes.filter((article) =>
              progress.masteredArticleIds.includes(article.id),
            ).length;
            const nextNode =
              nodes.find(
                (article) =>
                  !progress.masteredArticleIds.includes(article.id),
              ) ?? nodes[0];

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
                      width: `${nodes.length ? (mastered / nodes.length) * 100 : 0}%`,
                    }}
                  />
                </div>
                <details className="sector-manifest">
                  <summary>Coordinate manifest</summary>
                  <ol>
                    {nodes.map((article) => (
                      <li
                        data-complete={progress.masteredArticleIds.includes(
                          article.id,
                        )}
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

      <section className="control-section flight-plans" aria-labelledby="plans-title">
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
              const mastered =
                progress.masteredArticleIds.includes(articleId);
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

      <section className="control-section" aria-labelledby="expeditions-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Campaign board</p>
            <h2 id="expeditions-title">Expedition campaigns</h2>
          </div>
          <p>
            Each campaign combines several coordinates into one practical
            mission. Open a checkpoint, do the work, then confirm it here.
          </p>
        </div>
        <div className="expedition-board">
          {expeditions.map((expedition) => {
            const completed =
              progress.completedExpeditionSteps[expedition.id] ?? [];
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
                    const checked = completed.includes(step.id);
                    return (
                      <li data-complete={checked} key={step.id}>
                        <span>{(index + 1).toString().padStart(2, "0")}</span>
                        <div>
                          <strong>{step.title}</strong>
                          <small>{step.brief}</small>
                          <Link href={step.href}>Open checkpoint</Link>
                        </div>
                        <button
                          type="button"
                          aria-pressed={checked}
                          aria-label={`${checked ? "Reopen" : "Complete"} ${step.title}`}
                          onClick={() =>
                            toggleExpeditionStep(expedition.id, step.id)
                          }
                        >
                          {checked ? "✓" : "○"}
                        </button>
                      </li>
                    );
                  })}
                </ol>
                <footer>
                  <span>
                    {completed.length}/{expedition.steps.length} checks
                  </span>
                  <div
                    className="signal-meter"
                    aria-label={`${completed.length} of ${expedition.steps.length} checkpoints complete`}
                  >
                    <span
                      style={{
                        width: `${(completed.length / expedition.steps.length) * 100}%`,
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
            <p>This removes every local mastery and expedition record.</p>
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
