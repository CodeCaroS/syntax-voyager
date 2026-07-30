"use client";

import Link from "next/link";
import { useEffect } from "react";
import {
  flightPlans,
  galaxyForOrder,
  getMissionStepContext,
  missionStepHref,
  missionStepTargetId,
  missionStepType,
  nextArticleIdForPlan,
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
  routeArticles: { id: string; title: string }[];
}) {
  const { progress, ready, updateProgress } = useVoyageProgress();
  const mastered = progress.masteredArticleIds.includes(articleId);
  const galaxy = galaxyForOrder(order);
  const activePlan =
    flightPlans.find((plan) => plan.id === progress.activePlanId) ??
    flightPlans[0];
  const nextArticleId = nextArticleIdForPlan(
    activePlan.id,
    progress.masteredArticleIds,
    articleId,
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
      <Link
        className="lesson-next"
        href={nextHref}
      >
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
  );
}
