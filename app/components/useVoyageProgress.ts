"use client";

import { useCallback, useEffect, useState } from "react";

export interface VoyageProgress {
  activePlanId: string;
  visitedArticleIds: string[];
  masteredArticleIds: string[];
  completedExpeditionSteps: Record<string, string[]>;
  passedLabChallenges: string[];
}

const STORAGE_KEY = "syntax-voyager:flight-log:v1";
const PROGRESS_EVENT = "syntax-voyager:progress";

export const emptyVoyageProgress: VoyageProgress = {
  activePlanId: "cadet-launch",
  visitedArticleIds: [],
  masteredArticleIds: [],
  completedExpeditionSteps: {},
  passedLabChallenges: [],
};

function normalizeProgress(value: Partial<VoyageProgress>): VoyageProgress {
  return {
    activePlanId: value.activePlanId || emptyVoyageProgress.activePlanId,
    visitedArticleIds: Array.isArray(value.visitedArticleIds)
      ? value.visitedArticleIds
      : [],
    masteredArticleIds: Array.isArray(value.masteredArticleIds)
      ? value.masteredArticleIds
      : [],
    completedExpeditionSteps:
      value.completedExpeditionSteps &&
      typeof value.completedExpeditionSteps === "object"
        ? value.completedExpeditionSteps
        : {},
    passedLabChallenges: Array.isArray(value.passedLabChallenges)
      ? value.passedLabChallenges
      : [],
  };
}

function readProgress() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored
      ? normalizeProgress(JSON.parse(stored) as Partial<VoyageProgress>)
      : emptyVoyageProgress;
  } catch {
    return emptyVoyageProgress;
  }
}

export function useVoyageProgress() {
  const [progress, setProgressState] = useState(emptyVoyageProgress);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sync = () => {
      setProgressState(readProgress());
      setReady(true);
    };
    const animationFrame = window.requestAnimationFrame(sync);
    window.addEventListener("storage", sync);
    window.addEventListener(PROGRESS_EVENT, sync);
    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("storage", sync);
      window.removeEventListener(PROGRESS_EVENT, sync);
    };
  }, []);

  const updateProgress = useCallback(
    (update: (current: VoyageProgress) => VoyageProgress) => {
      const next = normalizeProgress(update(readProgress()));
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setProgressState(next);
      window.dispatchEvent(new Event(PROGRESS_EVENT));
    },
    [],
  );

  const resetProgress = useCallback(() => {
    window.localStorage.removeItem(STORAGE_KEY);
    setProgressState(emptyVoyageProgress);
    window.dispatchEvent(new Event(PROGRESS_EVENT));
  }, []);

  return { progress, ready, updateProgress, resetProgress };
}
