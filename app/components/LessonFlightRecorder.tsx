"use client";

import Link from "next/link";
import { useEffect } from "react";
import {
  flightPlans,
  galaxyForOrder,
  nextArticleIdForPlan,
} from "@/lib/voyage";
import { useVoyageProgress } from "./useVoyageProgress";

function unique(values: string[]) {
  return [...new Set(values)];
}

export default function LessonFlightRecorder({
  articleId,
  order,
  routeArticles,
}: {
  articleId: string;
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
        <span>{galaxy.callSign}</span>
        <strong>{galaxy.title}</strong>
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
        href={nextArticle ? `/articles/${nextArticle.id}` : "/mission-control"}
      >
        <span>{nextArticle ? `Next · ${activePlan.callSign}` : "Route status"}</span>
        <strong>{nextArticle?.title ?? "Review mission control"} →</strong>
      </Link>
    </section>
  );
}
