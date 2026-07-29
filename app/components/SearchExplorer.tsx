"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export interface SearchArticle {
  id: string;
  title: string;
  summary: string;
  order: number;
  level: string;
  prerequisites: string[];
  searchText: string;
}

interface Point3D {
  x: number;
  y: number;
  z: number;
}

interface ViewState {
  rotationX: number;
  rotationY: number;
  targetX: number;
  targetY: number;
  zoom: number;
  dragging: boolean;
  moved: boolean;
  pointerX: number;
  pointerY: number;
}

interface WarpState {
  active: boolean;
  startedAt: number;
  duration: number;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  cruiseZoom: number;
  targetId: string;
}

type JourneyPhase = "cruising" | "warping" | "arrived";

const clamp = (value: number, minimum: number, maximum: number) =>
  Math.min(maximum, Math.max(minimum, value));

export function SearchExplorer({ articles }: { articles: SearchArticle[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hitAreasRef = useRef<Array<{ id: string; x: number; y: number; r: number }>>(
    [],
  );
  const viewRef = useRef<ViewState>({
    rotationX: -0.12,
    rotationY: -0.45,
    targetX: -0.12,
    targetY: -0.45,
    zoom: 680,
    dragging: false,
    moved: false,
    pointerX: 0,
    pointerY: 0,
  });
  const reducedMotionRef = useRef(false);
  const arrivalRef = useRef({ id: "", startedAt: 0 });
  const warpRef = useRef<WarpState>({
    active: false,
    startedAt: 0,
    duration: 1800,
    fromX: 0,
    fromY: 0,
    toX: 0,
    toY: 0,
    cruiseZoom: 680,
    targetId: "",
  });
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(articles[0]?.id ?? "");
  const [journeyPhase, setJourneyPhase] = useState<JourneyPhase>("cruising");
  const selectedIdRef = useRef(selectedId);

  const positions = useMemo(
    () =>
      new Map<string, Point3D>(
        articles.map((article, index) => {
          const angle = index * 1.16 - 0.65;
          const radius = 120 + (index % 3) * 54;
          return [
            article.id,
            {
              x: Math.cos(angle) * radius,
              y: (index - (articles.length - 1) / 2) * 34,
              z: Math.sin(angle) * radius,
            },
          ];
        }),
      ),
    [articles],
  );

  const normalizedQuery = query.trim().toLowerCase();
  const results = useMemo(() => {
    if (!normalizedQuery) return articles;
    return articles.filter((article) =>
      `${article.title} ${article.summary} ${article.searchText}`
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [articles, normalizedQuery]);

  const selectedArticle =
    articles.find((article) => article.id === selectedId) ?? articles[0];

  useEffect(() => {
    if (journeyPhase !== "arrived") return;
    const timer = window.setTimeout(() => setJourneyPhase("cruising"), 1400);
    return () => window.clearTimeout(timer);
  }, [journeyPhase]);

  const warpTo = useCallback(
    (id: string) => {
      const position = positions.get(id);
      if (!position) return;
      const horizontalDistance = Math.hypot(position.x, position.z);
      const view = viewRef.current;
      const toX = Math.atan2(position.y, horizontalDistance);
      const rawY = Math.atan2(position.x, position.z);
      const shortestTurn = Math.atan2(
        Math.sin(rawY - view.rotationY),
        Math.cos(rawY - view.rotationY),
      );
      const toY = view.rotationY + shortestTurn;

      view.targetX = toX;
      view.targetY = toY;
      setJourneyPhase("warping");
      warpRef.current = {
        active: true,
        startedAt: performance.now(),
        duration: reducedMotionRef.current ? 650 : 1800,
        fromX: view.rotationX,
        fromY: view.rotationY,
        toX,
        toY,
        cruiseZoom: view.zoom,
        targetId: id,
      };
    },
    [positions],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    reducedMotionRef.current = reducedMotion;
    let animationFrame = 0;
    let width = 0;
    let height = 0;
    const galaxyStars = Array.from({ length: 520 }, (_, index) => {
      const arm = index % 4;
      const radius = 28 + ((Math.sin(index * 91.17) + 1) / 2) * 350;
      const drift = Math.sin(index * 37.91) * 0.48;
      const angle = arm * (Math.PI / 2) + radius * 0.018 + drift;
      return {
        x: Math.cos(angle) * radius,
        y: Math.sin(index * 143.27) * (8 + radius * 0.055),
        z: Math.sin(angle) * radius,
        size: index % 29 === 0 ? 2.2 : index % 7 === 0 ? 1.4 : 0.75,
        tone: index % 13,
      };
    });
    const deepStars = Array.from({ length: 260 }, (_, index) => ({
      angle: (index * 2.399963) % (Math.PI * 2),
      phase: (index * 0.618034) % 1,
      depth: 0.18 + ((Math.sin(index * 57.31) + 1) / 2) * 0.82,
      speed: 0.72 + ((Math.cos(index * 83.19) + 1) / 2) * 0.64,
      size: index % 23 === 0 ? 1.8 : index % 7 === 0 ? 1.2 : 0.7,
      tone: index % 17,
    }));
    let flightDistance = 0;
    let orbitPhase = 0;
    let previousFrameTime = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const project = (point: Point3D) => {
      const view = viewRef.current;
      const cosY = Math.cos(view.rotationY);
      const sinY = Math.sin(view.rotationY);
      const x1 = point.x * cosY - point.z * sinY;
      const z1 = point.x * sinY + point.z * cosY;
      const cosX = Math.cos(view.rotationX);
      const sinX = Math.sin(view.rotationX);
      const y = point.y * cosX - z1 * sinX;
      const z = point.y * sinX + z1 * cosX;
      const scale = view.zoom / (view.zoom + z);
      const roll = Math.sin(orbitPhase) * 0.035;
      const cosRoll = Math.cos(roll);
      const sinRoll = Math.sin(roll);
      const screenX = x1 * scale;
      const screenY = y * scale;

      return {
        x:
          width / 2 +
          Math.cos(orbitPhase) * width * 0.055 +
          screenX * cosRoll -
          screenY * sinRoll,
        y:
          height / 2 +
          Math.sin(orbitPhase * 2) * height * 0.025 +
          screenX * sinRoll +
          screenY * cosRoll,
        z,
        scale,
      };
    };

    const draw = (time: number) => {
      const view = viewRef.current;
      const warp = warpRef.current;
      const frameDuration =
        previousFrameTime === 0 ? 0 : Math.min(time - previousFrameTime, 32);
      previousFrameTime = time;
      let warpIntensity = 0;
      let warpProgress = 0;

      if (warp.active) {
        const progress = clamp((time - warp.startedAt) / warp.duration, 0, 1);
        warpProgress = progress;
        const eased =
          progress < 0.5
            ? 8 * Math.pow(progress, 4)
            : 1 - Math.pow(-2 * progress + 2, 4) / 2;
        warpIntensity = reducedMotion
          ? 0
          : Math.pow(Math.sin(Math.PI * progress), 0.82);
        view.rotationX = warp.fromX + (warp.toX - warp.fromX) * eased;
        view.rotationY = warp.fromY + (warp.toY - warp.fromY) * eased;
        view.zoom = warp.cruiseZoom - warpIntensity * 260;

        if (progress >= 1) {
          warp.active = false;
          view.rotationX = warp.toX;
          view.rotationY = warp.toY;
          view.zoom = warp.cruiseZoom;
          selectedIdRef.current = warp.targetId;
          arrivalRef.current = { id: warp.targetId, startedAt: time };
          setSelectedId(warp.targetId);
          setJourneyPhase("arrived");
        }
      } else {
        const ease = reducedMotion ? 1 : 0.075;
        view.rotationX += (view.targetX - view.rotationX) * ease;
        view.rotationY += (view.targetY - view.rotationY) * ease;
        if (!reducedMotion && !view.dragging) {
          view.targetY += 0.0013;
          const orbitHeight = -0.12 + Math.sin(time * 0.00022) * 0.09;
          view.targetX += (orbitHeight - view.targetX) * 0.002;
        }
      }
      flightDistance +=
        frameDuration *
        (reducedMotion ? 0 : 0.00013 + warpIntensity * 0.0004);
      orbitPhase +=
        frameDuration *
        (reducedMotion ? 0 : 0.00012 + warpIntensity * 0.00008);

      const focusBlend =
        warpProgress * warpProgress * (3 - 2 * warpProgress);
      const focusLevel = (id: string) => {
        if (warp.active && warp.targetId !== selectedIdRef.current) {
          if (id === selectedIdRef.current) return 1 - focusBlend;
          if (id === warp.targetId) return focusBlend;
        }
        return id === selectedIdRef.current ? 1 : 0;
      };

      context.fillStyle = "#030706";
      context.fillRect(0, 0, width, height);
      const glow = context.createRadialGradient(
        width * 0.5,
        height * 0.5,
        0,
        width * 0.5,
        height * 0.5,
        Math.max(width, height) * 0.62,
      );
      glow.addColorStop(0, "rgba(217, 255, 85, 0.09)");
      glow.addColorStop(0.18, "rgba(116, 230, 211, 0.07)");
      glow.addColorStop(0.52, "rgba(18, 56, 73, 0.08)");
      glow.addColorStop(1, "rgba(8, 16, 15, 0)");
      context.fillStyle = glow;
      context.fillRect(0, 0, width, height);

      for (const star of deepStars) {
        const progress = (star.phase + flightDistance * star.speed) % 1;
        const distance =
          Math.pow(progress, 1.7) * Math.hypot(width, height) * 0.62;
        const angle = star.angle + view.rotationY * 0.045;
        const directionX = Math.cos(angle);
        const directionY = Math.sin(angle);
        const x = width / 2 + directionX * distance;
        const y = height / 2 + directionY * distance;
        const pulse = reducedMotion
          ? 0.28
          : 0.12 +
            ((Math.sin(time * 0.001 + star.phase * 30) + 1) / 2) * 0.28;
        const alpha =
          pulse * (0.35 + star.depth * 0.45 + progress * 0.35);
        const trail = (10 + warpIntensity * 72) * star.depth * progress;
        context.strokeStyle =
          star.tone === 0
            ? `rgba(217, 255, 85, ${alpha})`
            : `rgba(225, 235, 255, ${alpha})`;
        context.lineWidth = star.size * (0.7 + progress * 0.8);
        context.beginPath();
        context.moveTo(x - directionX * trail, y - directionY * trail);
        context.lineTo(x, y);
        context.stroke();
      }

      for (const star of galaxyStars) {
        const point = project(star);
        if (point.scale <= 0) continue;
        const alpha = clamp(0.2 + point.scale * 0.34, 0.18, 0.82);
        context.fillStyle =
          star.tone === 0
            ? `rgba(217, 255, 85, ${alpha})`
            : star.tone < 4
              ? `rgba(116, 230, 211, ${alpha})`
              : `rgba(225, 235, 255, ${alpha})`;
        const starSize = clamp(star.size * point.scale, 0.45, 3.2);
        if (warpIntensity > 0.03) {
          const travelDistance = 0.025 + warpIntensity * 0.12;
          context.beginPath();
          context.moveTo(point.x, point.y);
          context.lineTo(
            point.x + (point.x - width / 2) * travelDistance,
            point.y + (point.y - height / 2) * travelDistance,
          );
          context.strokeStyle =
            star.tone === 0
              ? `rgba(217, 255, 85, ${alpha * warpIntensity})`
              : `rgba(180, 226, 255, ${alpha * warpIntensity})`;
          context.lineWidth = starSize;
          context.stroke();
        } else {
          context.beginPath();
          context.arc(point.x, point.y, starSize, 0, Math.PI * 2);
          context.fill();
        }
      }

      for (const article of articles) {
        const target = positions.get(article.id);
        if (!target) continue;
        const end = project(target);
        for (const prerequisiteId of article.prerequisites) {
          const source = positions.get(prerequisiteId);
          if (!source) continue;
          const start = project(source);
          const routeFocus = Math.max(
            focusLevel(article.id),
            focusLevel(prerequisiteId),
          );
          const routeRed = Math.round(116 + 101 * routeFocus);
          const routeGreen = Math.round(230 + 25 * routeFocus);
          const routeBlue = Math.round(211 - 126 * routeFocus);
          context.beginPath();
          context.moveTo(start.x, start.y);
          context.lineTo(end.x, end.y);
          context.strokeStyle = `rgba(${routeRed}, ${routeGreen}, ${routeBlue}, ${0.18 + routeFocus * 0.44})`;
          context.lineWidth = 0.75 + routeFocus * 0.65;
          context.stroke();
        }
      }

      const projected = articles
        .map((article) => {
          const point = positions.get(article.id);
          return point ? { article, ...project(point) } : null;
        })
        .filter((node): node is NonNullable<typeof node> => node !== null)
        .sort((a, b) => b.z - a.z);

      hitAreasRef.current = [];
      for (const node of projected) {
        const focus = focusLevel(node.article.id);
        const arrivalAge =
          arrivalRef.current.id === node.article.id
            ? time - arrivalRef.current.startedAt
            : Number.POSITIVE_INFINITY;
        const arrivalPulse =
          reducedMotion || arrivalAge > 1200
            ? 0
            : 1 - clamp(arrivalAge / 1200, 0, 1);
        const radius = clamp((11 + focus * 8) * node.scale, 7, 27);
        const red = Math.round(116 + 101 * focus);
        const green = Math.round(230 + 25 * focus);
        const blue = Math.round(211 - 126 * focus);
        if (focus > 0.01) {
          context.beginPath();
          context.ellipse(
            node.x,
            node.y,
            radius * 2.8,
            radius * 1.05,
            -0.32,
            0,
            Math.PI * 2,
          );
          context.strokeStyle = `rgba(217, 255, 85, ${focus * 0.48})`;
          context.lineWidth = 1;
          context.stroke();
        }
        if (arrivalPulse > 0.01) {
          context.beginPath();
          context.arc(
            node.x,
            node.y,
            radius * (2.2 + (1 - arrivalPulse) * 5.5),
            0,
            Math.PI * 2,
          );
          context.strokeStyle = `rgba(217, 255, 85, ${arrivalPulse * 0.58})`;
          context.lineWidth = 1.2;
          context.stroke();
        }
        const halo = context.createRadialGradient(
          node.x,
          node.y,
          0,
          node.x,
          node.y,
          radius * 3.2,
        );
        halo.addColorStop(
          0,
          `rgba(${red}, ${green}, ${blue}, ${0.24 + focus * 0.18})`,
        );
        halo.addColorStop(1, "rgba(8, 16, 15, 0)");
        context.fillStyle = halo;
        context.beginPath();
        context.arc(node.x, node.y, radius * 3.2, 0, Math.PI * 2);
        context.fill();

        context.fillStyle = `rgb(${red}, ${green}, ${blue})`;
        context.beginPath();
        context.arc(node.x, node.y, radius, 0, Math.PI * 2);
        context.fill();

        context.fillStyle = "#08100f";
        context.font = `700 ${clamp(9 * node.scale, 7, 12)}px "Cascadia Code", monospace`;
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillText(
          node.article.order.toString().padStart(2, "0"),
          node.x,
          node.y + 0.5,
        );

        if (focus > 0.01 || node.scale > 1.12) {
          context.fillStyle = `rgba(242, 239, 229, ${0.72 + focus * 0.28})`;
          context.font = `${Math.round(400 + focus * 200)} ${11 + focus * 2}px "Segoe UI", sans-serif`;
          context.textAlign = "left";
          context.fillText(node.article.title, node.x + radius + 11, node.y - 1);
        }

        hitAreasRef.current.push({
          id: node.article.id,
          x: node.x,
          y: node.y,
          r: Math.max(radius + 12, 24),
        });
      }

      if (warpIntensity > 0.02) {
        const tunnel = context.createRadialGradient(
          width / 2,
          height / 2,
          Math.min(width, height) * 0.06,
          width / 2,
          height / 2,
          Math.max(width, height) * 0.72,
        );
        tunnel.addColorStop(0, `rgba(217, 255, 85, ${warpIntensity * 0.04})`);
        tunnel.addColorStop(0.5, "rgba(3, 7, 6, 0)");
        tunnel.addColorStop(1, `rgba(0, 3, 7, ${warpIntensity * 0.42})`);
        context.fillStyle = tunnel;
        context.fillRect(0, 0, width, height);

        context.save();
        context.translate(width / 2, height / 2);
        for (let ring = 0; ring < 5; ring += 1) {
          const phase = (warpProgress * 1.7 + ring / 5) % 1;
          const radius = phase * Math.max(width, height) * 0.58;
          context.beginPath();
          context.arc(0, 0, radius, 0, Math.PI * 2);
          context.strokeStyle = `rgba(116, 230, 211, ${(1 - phase) * warpIntensity * 0.13})`;
          context.lineWidth = 1;
          context.stroke();
        }
        context.restore();
      }

      animationFrame = window.requestAnimationFrame(draw);
    };

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();
    animationFrame = window.requestAnimationFrame(draw);
    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(animationFrame);
    };
  }, [articles, positions]);

  const cancelWarp = () => {
    warpRef.current.active = false;
    setJourneyPhase("cruising");
  };

  const rotateView = (amount: number) => {
    cancelWarp();
    viewRef.current.targetY += amount;
  };

  const travelRelative = (direction: -1 | 1) => {
    const currentId = warpRef.current.active
      ? warpRef.current.targetId
      : selectedIdRef.current;
    const currentIndex = articles.findIndex((article) => article.id === currentId);
    const nextIndex =
      (Math.max(currentIndex, 0) + direction + articles.length) % articles.length;
    setQuery("");
    warpTo(articles[nextIndex].id);
  };

  const selectAt = (x: number, y: number) => {
    const hit = hitAreasRef.current
      .slice()
      .reverse()
      .find((area) => Math.hypot(area.x - x, area.y - y) <= area.r);
    if (hit) warpTo(hit.id);
  };

  return (
    <section
      className="explorer"
      id="explore"
      aria-label="Interactive knowledge galaxy"
    >
      <div className="universe-shell" data-journey={journeyPhase}>
        <canvas
          ref={canvasRef}
          className="universe-canvas"
          aria-label="Interactive 3D map of programming fundamentals. Drag to rotate, use the arrow keys, or choose a node from the search."
          role="img"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === "ArrowLeft") rotateView(-0.28);
            if (event.key === "ArrowRight") rotateView(0.28);
            if (event.key === "ArrowUp") {
              viewRef.current.targetX = clamp(viewRef.current.targetX - 0.18, -1.1, 1.1);
            }
            if (event.key === "ArrowDown") {
              viewRef.current.targetX = clamp(viewRef.current.targetX + 0.18, -1.1, 1.1);
            }
          }}
          onPointerDown={(event) => {
            const view = viewRef.current;
            cancelWarp();
            view.dragging = true;
            view.moved = false;
            view.pointerX = event.clientX;
            view.pointerY = event.clientY;
            event.currentTarget.setPointerCapture(event.pointerId);
          }}
          onPointerMove={(event) => {
            const view = viewRef.current;
            if (!view.dragging) return;
            const deltaX = event.clientX - view.pointerX;
            const deltaY = event.clientY - view.pointerY;
            if (Math.abs(deltaX) + Math.abs(deltaY) > 3) view.moved = true;
            view.targetY += deltaX * 0.006;
            view.targetX = clamp(view.targetX + deltaY * 0.004, -1.1, 1.1);
            view.pointerX = event.clientX;
            view.pointerY = event.clientY;
          }}
          onPointerUp={(event) => {
            const view = viewRef.current;
            view.dragging = false;
            if (!view.moved) {
              const rect = event.currentTarget.getBoundingClientRect();
              selectAt(event.clientX - rect.left, event.clientY - rect.top);
            }
          }}
          onWheel={(event) => {
            event.preventDefault();
            cancelWarp();
            viewRef.current.zoom = clamp(
              viewRef.current.zoom + event.deltaY * 0.55,
              420,
              980,
            );
          }}
        />

        <div className="voyage-reticle" aria-hidden="true" />

        <div className="flight-telemetry" aria-live="polite">
          <span className="telemetry-signal" aria-hidden="true" />
          <span>
            {journeyPhase === "warping"
              ? "Travelling through knowledge space"
              : journeyPhase === "arrived"
                ? "Coordinate locked"
                : "Orbiting the knowledge galaxy"}
          </span>
        </div>

        <Link className="galaxy-wordmark" href="/">
          <span className="brand-mark" aria-hidden="true">
            SV
          </span>
          <span>
            <strong>Syntax Voyager</strong>
            <small>{articles.length.toString().padStart(2, "0")} nodes online</small>
          </span>
        </Link>

        <nav className="navigator-steps" aria-label="Knowledge navigator">
          <button
            type="button"
            onClick={() => travelRelative(-1)}
            aria-label="Previous node"
          >
            <span aria-hidden="true">←</span>
            Previous
          </button>
          <button
            type="button"
            onClick={() => travelRelative(1)}
            aria-label="Next node"
          >
            Next
            <span aria-hidden="true">→</span>
          </button>
        </nav>

        <div className="universe-search">
          <label htmlFor="warp-search">Choose a coordinate</label>
          <div className="search-shell">
            <span className="search-prompt" aria-hidden="true">
              &gt;_
            </span>
            <input
              id="warp-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Variables, logic, functions..."
              autoComplete="off"
            />
            <span className="search-count" aria-live="polite">
              {results.length.toString().padStart(2, "0")} nodes
            </span>
          </div>
          {normalizedQuery ? (
            <div className="warp-results" aria-label="Search results">
              {results.length > 0 ? (
                results.slice(0, 4).map((article) => (
                  <button
                    type="button"
                    key={article.id}
                    onClick={() => {
                      setQuery("");
                      warpTo(article.id);
                    }}
                  >
                    <span>{article.order.toString().padStart(2, "0")}</span>
                    {article.title}
                  </button>
                ))
              ) : (
                <p>No mapped coordinate matches that signal.</p>
              )}
            </div>
          ) : null}
        </div>

        <div className="universe-controls" aria-label="3D map controls">
          <button type="button" onClick={() => rotateView(-0.35)}>
            Rotate left
          </button>
          <button type="button" onClick={() => rotateView(0.35)}>
            Rotate right
          </button>
          <button
            type="button"
            onClick={() => {
              cancelWarp();
              viewRef.current.targetX = -0.12;
              viewRef.current.targetY = -0.45;
              viewRef.current.zoom = 680;
            }}
          >
            Reset
          </button>
        </div>

        {selectedArticle ? (
          <aside className="node-inspector" aria-live="polite">
            <span>
              Node {selectedArticle.order.toString().padStart(2, "0")} selected
            </span>
            <h2>{selectedArticle.title}</h2>
            <p>{selectedArticle.summary}</p>
            <Link href={`/articles/${selectedArticle.id}`}>
              Open this lesson <span aria-hidden="true">↗</span>
            </Link>
          </aside>
        ) : null}

      </div>
    </section>
  );
}
