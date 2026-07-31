"use client";

import Link from "next/link";
import { useEffect } from "react";
import {
  flightPlans,
  galaxyForOrder,
  getMissionStepContext,
  isGalaxyUnlocked,
  missionStepHref,
  missionStepTargetId,
  missionStepType,
  nextArticleIdForPlan,
  nextNodeTask,
  nodeTaskCompleted,
  nodeTaskProgress,
  nodeTasksForArticle,
} from "@/lib/voyage";
import { useVoyageProgress } from "./useVoyageProgress";

function unique(values: string[]) {
  return [...new Set(values)];
}

export default function LessonFlightRecorder({
  articleId,
  missionId,
  missionStepId,
  order,
  routeArticles,
}: {
  articleId: string;
  missionId?: string;
  missionStepId?: string;
  order: number;
  routeArticles: { id: string; title: string; order: number }[];
}) {
  const { progress, ready, updateProgress } = useVoyageProgress();
  const mastered = progress.masteredArticleIds.includes(articleId);
  const galaxy = galaxyForOrder(order);
  const activePlan =
    flightPlans.find((plan) => plan.id === progress.activePlanId) ??
    flightPlans[0];
  const unlockedArticleIds = new Set(
    routeArticles
      .filter((article) =>
        isGalaxyUnlocked(
          galaxyForOrder(article.order).id,
          progress.passedGalaxyGates,
        ),
      )
      .map((article) => article.id),
  );
  const nextArticleId = nextArticleIdForPlan(
    activePlan.id,
    progress.masteredArticleIds,
    articleId,
    unlockedArticleIds,
  );
  const nextArticle = routeArticles.find(
    (article) => article.id === nextArticleId,
  );
  const requestedMission = getMissionStepContext(missionId, missionStepId);
  const activeMission =
    requestedMission &&
    missionStepType(requestedMission.step) === "lesson" &&
    missionStepTargetId(requestedMission.step) === articleId
      ? requestedMission
      : null;
  const missionNext = activeMission?.nextStep;
  const nextHref = activeMission
    ? missionNext
      ? missionStepHref(activeMission.mission.id, missionNext)
      : "/mission-control#missions"
    : nextArticle
      ? `/articles/${nextArticle.id}`
      : "/mission-control";
  const nextTitle =
    missionNext?.title ??
    (activeMission ? "Mission control" : nextArticle?.title) ??
    "Review mission control";
  const nodeTasks = nodeTasksForArticle(articleId);
  const taskProgress = nodeTaskProgress(
    nodeTasks,
    progress.masteredArticleIds,
    progress.passedLabChallenges,
  );
  const nextTask = nextNodeTask(
    nodeTasks,
    progress.masteredArticleIds,
    progress.passedLabChallenges,
  );

  useEffect(() => {
    updateProgress((current) =>
      current.visitedArticleIds.includes(articleId)
        ? current
        : {
            ...current,
            visitedArticleIds: unique([
              ...current.visitedArticleIds,
              articleId,
            ]),
          },
    );
  }, [articleId, updateProgress]);

  return (
    <>
      <section className="lesson-flight-recorder" aria-label="Flight log">
        <div>
          <span>
            {activeMission
              ? `${activeMission.mission.callSign} · Step ${
                  activeMission.stepIndex + 1
                }/${activeMission.mission.steps.length}`
              : galaxy.callSign}
          </span>
          <strong>{activeMission?.mission.title ?? galaxy.title}</strong>
        </div>
        <p>
          {ready
            ? mastered
              ? "Mastery signal confirmed"
              : "Coordinate visited · mastery awaiting confirmation"
            : "Reading flight log"}
        </p>
        <button
          type="button"
          aria-pressed={mastered}
          onClick={() =>
            updateProgress((current) => ({
              ...current,
              masteredArticleIds: mastered
                ? current.masteredArticleIds.filter((id) => id !== articleId)
                : unique([...current.masteredArticleIds, articleId]),
            }))
          }
        >
          {mastered ? "Reopen training" : "Confirm mastery"}
        </button>
        <Link className="lesson-next" href={nextHref}>
          <span>
            {missionNext
              ? `Next · ${
                  missionStepType(missionNext) === "lesson"
                    ? "Lesson"
                    : "SIM mission"
                }`
              : activeMission
                ? "Mission route"
                : nextArticle
                  ? `Next · ${activePlan.callSign}`
                  : "Route status"}
          </span>
          <strong>{nextTitle} →</strong>
        </Link>
      </section>
      {nodeTasks.length ? (
        <nav
          className="node-task-links"
          aria-label="Missions and simulations for this node"
        >
          <header>
            <span>Linked node tasks</span>
            <strong>
              {taskProgress.completed}/{taskProgress.total} complete
              {nextTask ? ` · Next ${nextTask.callSign}` : ""}
            </strong>
          </header>
          <div>
            {nodeTasks.map((task) => {
              const complete = nodeTaskCompleted(
                task,
                progress.masteredArticleIds,
                progress.passedLabChallenges,
              );
              return (
                <Link
                  aria-current={task.id === nextTask?.id ? "step" : undefined}
                  data-complete={complete}
                  href={task.href}
                  key={task.id}
                >
                  <span>
                    {task.callSign} / {task.kind}
                  </span>
                  <strong>{task.title}</strong>
                  <small>
                    {complete
                      ? "Complete"
                      : task.id === nextTask?.id
                        ? "Next task"
                        : "Queued"}
                  </small>
                </Link>
              );
            })}
          </div>
        </nav>
      ) : null}
    </>
  );
}
