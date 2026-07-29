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
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(articles[0]?.id ?? "");

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

  const warpTo = useCallback(
    (id: string) => {
      const position = positions.get(id);
      if (!position) return;
      const horizontalDistance = Math.hypot(position.x, position.z);
      viewRef.current.targetY = Math.atan2(position.x, position.z);
      viewRef.current.targetX = -Math.atan2(position.y, horizontalDistance);
      setSelectedId(id);
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

      return {
        x: width / 2 + x1 * scale,
        y: height / 2 + y * scale,
        z,
        scale,
      };
    };

    const draw = (time: number) => {
      const view = viewRef.current;
      const ease = reducedMotion ? 1 : 0.075;
      view.rotationX += (view.targetX - view.rotationX) * ease;
      view.rotationY += (view.targetY - view.rotationY) * ease;
      if (!reducedMotion && !view.dragging) view.targetY += 0.00022;

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

      for (let index = 0; index < 150; index += 1) {
        const x = ((Math.sin(index * 743.13) + 1) / 2) * width;
        const y = ((Math.cos(index * 319.77) + 1) / 2) * height;
        const pulse = reducedMotion
          ? 0.28
          : 0.18 + ((Math.sin(time * 0.001 + index) + 1) / 2) * 0.26;
        context.fillStyle = `rgba(242, 239, 229, ${pulse})`;
        context.fillRect(x, y, index % 11 === 0 ? 1.5 : 1, index % 11 === 0 ? 1.5 : 1);
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
        context.beginPath();
        context.arc(
          point.x,
          point.y,
          clamp(star.size * point.scale, 0.45, 3.2),
          0,
          Math.PI * 2,
        );
        context.fill();
      }

      for (const article of articles) {
        const target = positions.get(article.id);
        if (!target) continue;
        const end = project(target);
        for (const prerequisiteId of article.prerequisites) {
          const source = positions.get(prerequisiteId);
          if (!source) continue;
          const start = project(source);
          const active =
            article.id === selectedId || prerequisiteId === selectedId;
          context.beginPath();
          context.moveTo(start.x, start.y);
          context.lineTo(end.x, end.y);
          context.strokeStyle = active
            ? "rgba(217, 255, 85, 0.62)"
            : "rgba(116, 230, 211, 0.18)";
          context.lineWidth = active ? 1.4 : 0.75;
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
        const selected = node.article.id === selectedId;
        const radius = clamp((selected ? 19 : 11) * node.scale, 7, 27);
        if (selected) {
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
          context.strokeStyle = "rgba(217, 255, 85, 0.48)";
          context.lineWidth = 1;
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
          selected ? "rgba(217, 255, 85, 0.42)" : "rgba(116, 230, 211, 0.24)",
        );
        halo.addColorStop(1, "rgba(8, 16, 15, 0)");
        context.fillStyle = halo;
        context.beginPath();
        context.arc(node.x, node.y, radius * 3.2, 0, Math.PI * 2);
        context.fill();

        context.fillStyle = selected ? "#d9ff55" : "#74e6d3";
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

        if (selected || node.scale > 1.12) {
          context.fillStyle = selected ? "#f2efe5" : "rgba(242, 239, 229, .72)";
          context.font = `${selected ? 600 : 400} ${selected ? 13 : 11}px "Segoe UI", sans-serif`;
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
  }, [articles, positions, selectedId]);

  const rotateView = (amount: number) => {
    viewRef.current.targetY += amount;
  };

  const selectAt = (x: number, y: number) => {
    const hit = hitAreasRef.current
      .slice()
      .reverse()
      .find((area) => Math.hypot(area.x - x, area.y - y) <= area.r);
    if (hit) warpTo(hit.id);
  };

  return (
    <section className="explorer" id="explore" aria-labelledby="explore-title">
      <div className="universe-shell">
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
            viewRef.current.zoom = clamp(
              viewRef.current.zoom + event.deltaY * 0.55,
              420,
              980,
            );
          }}
        />

        <div className="universe-copy">
          <p className="eyebrow">Knowledge galaxy 01</p>
          <h1 id="explore-title">
            Explore software as a <span>living galaxy.</span>
          </h1>
          <p>
            Every idea is a place. Every connection is a route.
          </p>
        </div>

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
                  <button type="button" key={article.id} onClick={() => warpTo(article.id)}>
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

        <div className="universe-status" aria-hidden="true">
          <span>{articles.length.toString().padStart(2, "0")} nodes online</span>
          <span>Drag to orbit</span>
          <span>Scroll to zoom</span>
        </div>
      </div>

      <div className="atlas" id="atlas">
        <div className="atlas-heading">
          <p className="eyebrow">Knowledge atlas</p>
          <h2>Every mapped coordinate.</h2>
          <p>
            Prefer a traditional route? Open any lesson directly or follow the
            prerequisites in order.
          </p>
        </div>
        <div className="node-grid">
          {articles.map((article) => (
            <Link className="node-card" href={`/articles/${article.id}`} key={article.id}>
              <div className="node-card-top">
                <span className="node-number">
                  {article.order.toString().padStart(2, "0")}
                </span>
                <span className="node-status">
                  <span aria-hidden="true" />
                  online
                </span>
              </div>
              <h3>{article.title}</h3>
              <p>{article.summary}</p>
              <div className="node-card-meta">
                <span>{article.level}</span>
                <span>
                  {article.prerequisites.length === 0
                    ? "entry point"
                    : `${article.prerequisites.length} prerequisite${
                        article.prerequisites.length === 1 ? "" : "s"
                      }`}
                </span>
                <span className="node-arrow" aria-hidden="true">
                  ↗
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
