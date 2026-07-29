"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  executePseudocode,
  outputMatches,
  type ExecutionResult,
  type RuntimeValue,
} from "@/lib/pseudocode";
import { labChallenges } from "@/lib/voyage";
import { useVoyageProgress } from "./useVoyageProgress";

function unique(values: string[]) {
  return [...new Set(values)];
}

function formatValue(value: RuntimeValue): string {
  if (value === null) return "NOTHING";
  if (Array.isArray(value)) return `[${value.map(formatValue).join(", ")}]`;
  if (typeof value === "string") return `"${value}"`;
  return String(value);
}

export default function PseudocodeLab({
  initialChallengeId,
}: {
  initialChallengeId?: string;
}) {
  const initialChallenge =
    labChallenges.find((challenge) => challenge.id === initialChallengeId) ??
    labChallenges[0];
  const [challengeId, setChallengeId] = useState(initialChallenge.id);
  const [source, setSource] = useState(initialChallenge.starter);
  const [result, setResult] = useState<ExecutionResult | null>(null);
  const [frameIndex, setFrameIndex] = useState(-1);
  const [status, setStatus] = useState<
    "idle" | "running" | "passed" | "failed"
  >("idle");
  const { progress, updateProgress } = useVoyageProgress();
  const challenge =
    labChallenges.find((candidate) => candidate.id === challengeId) ??
    labChallenges[0];
  const frame =
    result && frameIndex >= 0 ? result.frames[frameIndex] : undefined;
  const variables = frame?.variables ?? result?.variables ?? {};
  const output = frame?.output ?? result?.output ?? [];

  const sourceLines = useMemo(() => source.split(/\r?\n/), [source]);

  const selectChallenge = (id: string) => {
    const next = labChallenges.find((candidate) => candidate.id === id);
    if (!next) return;
    setChallengeId(next.id);
    setSource(next.starter);
    setResult(null);
    setFrameIndex(-1);
    setStatus("idle");
  };

  const simulate = () => {
    const next = executePseudocode(source);
    setResult(next);
    setFrameIndex(Math.max(0, next.frames.length - 1));
    setStatus(next.error ? "failed" : "running");
    return next;
  };

  const step = () => {
    if (!result) {
      const next = executePseudocode(source);
      setResult(next);
      setFrameIndex(next.frames.length ? 0 : -1);
      setStatus(next.error ? "failed" : "running");
      return;
    }
    setFrameIndex((current) =>
      Math.min(current + 1, Math.max(0, result.frames.length - 1)),
    );
  };

  const validate = () => {
    const next = simulate();
    const passed = outputMatches(next, challenge.expectedOutput);
    setStatus(passed ? "passed" : "failed");
    if (passed) {
      updateProgress((current) => ({
        ...current,
        passedLabChallenges: unique([
          ...current.passedLabChallenges,
          challenge.id,
        ]),
      }));
    }
  };

  return (
    <main className="simulation-page" id="main-content">
      <header className="simulation-header">
        <nav aria-label="Primary navigation">
          <Link className="brand" href="/">
            <span className="brand-mark" aria-hidden="true">
              SV
            </span>
            <span>
              <strong>Syntax Voyager</strong>
              <small>Knowledge galaxy</small>
            </span>
          </Link>
          <Link href="/mission-control">Mission control</Link>
        </nav>
        <div>
          <p className="eyebrow">[ SIM-DECK / PSEUDOCODE RUNTIME ]</p>
          <h1>Flight simulator</h1>
          <p>
            Edit a mission program, run it one instruction at a time, and
            inspect the changing ship state.
          </p>
        </div>
      </header>

      <div className="simulation-layout">
        <aside className="simulation-manifest" aria-label="Lab missions">
          <header>
            <span>Training signals</span>
            <strong>
              {progress.passedLabChallenges.length
                .toString()
                .padStart(2, "0")}{" "}
              / {labChallenges.length.toString().padStart(2, "0")}
            </strong>
          </header>
          <div>
            {labChallenges.map((candidate) => {
              const passed = progress.passedLabChallenges.includes(candidate.id);
              return (
                <button
                  type="button"
                  key={candidate.id}
                  aria-pressed={candidate.id === challenge.id}
                  onClick={() => selectChallenge(candidate.id)}
                >
                  <span>{candidate.callSign}</span>
                  <strong>{candidate.title}</strong>
                  <small>{passed ? "Simulation passed" : candidate.objective}</small>
                  <i aria-hidden="true">{passed ? "✓" : "→"}</i>
                </button>
              );
            })}
          </div>
          <Link href={`/articles/${challenge.relatedArticleId}`}>
            Open related lesson
          </Link>
        </aside>

        <section className="simulation-workbench">
          <header className="simulation-brief">
            <div>
              <span>{challenge.callSign} / ACTIVE SIMULATION</span>
              <h2>{challenge.title}</h2>
            </div>
            <p>{challenge.objective}</p>
            <dl>
              <div>
                <dt>Expected transmission</dt>
                <dd>{challenge.expectedOutput.join(" · ")}</dd>
              </div>
              <div>
                <dt>Runtime status</dt>
                <dd data-status={status}>
                  {status === "passed"
                    ? "Mission passed"
                    : status === "failed"
                      ? "Check failed"
                      : status === "running"
                        ? "Trace ready"
                        : "Standing by"}
                </dd>
              </div>
            </dl>
          </header>

          <div className="simulation-editor">
            <div className="editor-toolbar">
              <span>flight-program.pseudo</span>
              <span>{sourceLines.length} lines</span>
            </div>
            <div className="editor-surface">
              <div className="editor-lines" aria-hidden="true">
                {sourceLines.map((_, index) => (
                  <span
                    data-active={frame?.line === index + 1}
                    key={index}
                  >
                    {(index + 1).toString().padStart(2, "0")}
                  </span>
                ))}
              </div>
              <textarea
                aria-label="Pseudocode program"
                spellCheck={false}
                value={source}
                onChange={(event) => {
                  setSource(event.target.value);
                  setResult(null);
                  setFrameIndex(-1);
                  setStatus("idle");
                }}
              />
            </div>
            <div className="simulation-controls">
              <button
                type="button"
                onClick={() => {
                  setSource(challenge.starter);
                  setResult(null);
                  setFrameIndex(-1);
                  setStatus("idle");
                }}
              >
                Reset code
              </button>
              <button type="button" onClick={step}>
                Step instruction
              </button>
              <button type="button" onClick={simulate}>
                Run simulation
              </button>
              <button type="button" onClick={validate}>
                Check mission
              </button>
            </div>
          </div>

          <div className="runtime-grid" aria-live="polite">
            <section className="runtime-panel">
              <header>
                <span>State telemetry</span>
                <strong>{Object.keys(variables).length} values</strong>
              </header>
              {Object.keys(variables).length ? (
                <dl>
                  {Object.entries(variables).map(([name, value]) => (
                    <div key={name}>
                      <dt>{name}</dt>
                      <dd>{formatValue(value)}</dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <p>No state recorded. Step or run the simulation.</p>
              )}
            </section>

            <section className="runtime-panel">
              <header>
                <span>Transmission output</span>
                <strong>{output.length} signals</strong>
              </header>
              {output.length ? (
                <ol>
                  {output.map((value, index) => (
                    <li key={`${index}-${value}`}>
                      <span>{(index + 1).toString().padStart(2, "0")}</span>
                      {value}
                    </li>
                  ))}
                </ol>
              ) : (
                <p>No output transmitted.</p>
              )}
            </section>

            <section className="runtime-panel runtime-trace">
              <header>
                <span>Execution trace</span>
                <strong>
                  {result?.frames.length
                    ? `${frameIndex + 1}/${result.frames.length}`
                    : "0/0"}
                </strong>
              </header>
              {result?.error ? (
                <p className="runtime-error">{result.error}</p>
              ) : frame ? (
                <>
                  <code>{frame.source}</code>
                  <div>
                    <span>Call stack</span>
                    <ol>
                      {frame.stack.map((entry) => (
                        <li key={entry}>{entry}</li>
                      ))}
                    </ol>
                  </div>
                </>
              ) : (
                <p>The next executed instruction will appear here.</p>
              )}
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
