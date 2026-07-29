"use client";

import Link from "next/link";
import { useEffect } from "react";
import { galaxyForOrder } from "@/lib/voyage";
import { useVoyageProgress } from "./useVoyageProgress";

function unique(values: string[]) {
  return [...new Set(values)];
}

export default function LessonFlightRecorder({
  articleId,
  order,
}: {
  articleId: string;
  order: number;
}) {
  const { progress, ready, updateProgress } = useVoyageProgress();
  const mastered = progress.masteredArticleIds.includes(articleId);
  const galaxy = galaxyForOrder(order);

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
      <Link href="/mission-control">Mission control</Link>
    </section>
  );
}
