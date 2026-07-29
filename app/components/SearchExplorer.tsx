"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export interface SearchArticle {
  id: string;
  title: string;
  summary: string;
  order: number;
  level: string;
  system: string;
  prerequisites: string[];
  relations: Array<{ target: string; type: string }>;
  searchText: string;
  galaxy: string;
  headings: string[];
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
  fromOrigin: Point3D;
  toOrigin: Point3D;
}

type JourneyPhase = "cruising" | "warping" | "arrived";

const clamp = (value: number, minimum: number, maximum: number) =>
  Math.min(maximum, Math.max(minimum, value));

const NODE_RENDER_DISTANCE = 240;
const ROUTE_RENDER_DISTANCE = 185;
const GALAXY_COLORS: Record<string, readonly [number, number, number]> = {
  "Origin sector": [217, 255, 85],
  "Systems frontier": [86, 221, 255],
  "Algorithm belt": [182, 135, 255],
  "Reliability expanse": [255, 171, 73],
  "Engineering outpost": [255, 105, 180],
};
const galaxyColor = (galaxy: string) =>
  GALAXY_COLORS[galaxy] ?? [116, 230, 211];

export function SearchExplorer({ articles }: { articles: SearchArticle[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hitAreasRef = useRef<
    Array<{ id: string; x: number; y: number; r: number }>
  >([]);
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
    fromOrigin: { x: 0, y: 0, z: 0 },
    toOrigin: { x: 0, y: 0, z: 0 },
  });
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(articles[0]?.id ?? "");
  const [journeyPhase, setJourneyPhase] = useState<JourneyPhase>("cruising");
  const [motionPaused, setMotionPaused] = useState(false);
  const selectedIdRef = useRef(selectedId);

  const positions = useMemo(
    () =>
      new Map<string, Point3D>(
        articles.map((article, index) => {
          const angle = index * Math.PI * (3 - Math.sqrt(5));
          const vertical = 1 - (2 * (index + 0.5)) / articles.length;
          const ring = Math.sqrt(1 - vertical * vertical);
          const shell = 480 + (index % 5) * 140;
          return [
            article.id,
            {
              x: Math.cos(angle) * ring * shell,
              y: vertical * shell * 0.86,
              z: Math.sin(angle) * ring * shell,
            },
          ];
        }),
      ),
    [articles],
  );
  const nodeSizeById = useMemo(() => {
    const connections = new Map(
      articles.map((article) => [article.id, new Set<string>()]),
    );
    for (const article of articles) {
      const targets = new Set([
        ...article.prerequisites,
        ...article.relations.map((relation) => relation.target),
      ]);
      for (const target of targets) {
        connections.get(article.id)?.add(target);
        connections.get(target)?.add(article.id);
      }
    }
    const maximum = Math.max(
      1,
      ...Array.from(connections.values(), (links) => links.size),
    );
    return new Map(
      Array.from(connections, ([id, links]) => [
        id,
        0.72 + Math.sqrt(links.size / maximum) * 0.88,
      ]),
    );
  }, [articles]);

  const normalizedQuery = query.trim().toLowerCase();
  const results = useMemo(() => {
    if (!normalizedQuery) return articles;
    return articles.filter((article) =>
      `${article.title} ${article.summary} ${article.searchText}`
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [articles, normalizedQuery]);

  const selectedArticle = articles.find(
    (article) => article.id === selectedId,
  );
  const selectedConnections = useMemo(() => {
    if (!selectedArticle) return [];

    return articles.flatMap((article) => {
      if (article.id === selectedArticle.id) return [];

      const directRelation = selectedArticle.relations.find(
        (relation) => relation.target === article.id,
      );
      const incomingRelation = article.relations.find(
        (relation) => relation.target === selectedArticle.id,
      );
      const relation =
        directRelation?.type ??
        (selectedArticle.prerequisites.includes(article.id)
          ? "requires"
          : article.prerequisites.includes(selectedArticle.id)
            ? "unlocks"
            : incomingRelation
              ? "linked-from"
              : null);

      return relation ? [{ article, relation }] : [];
    });
  }, [articles, selectedArticle]);

  useEffect(() => {
    if (journeyPhase !== "arrived") return;
    const timer = window.setTimeout(() => setJourneyPhase("cruising"), 1400);
    return () => window.clearTimeout(timer);
  }, [journeyPhase]);

  const warpTo = useCallback(
    (requestedId: string) => {
      const activeWarp = warpRef.current;
      if (!requestedId && !selectedIdRef.current && !activeWarp.active) return;

      const targetId = requestedId;
      if (targetId === selectedIdRef.current && !activeWarp.active) return;
      const position = targetId
        ? positions.get(targetId)
        : { x: 0, y: 0, z: 0 };
      if (!position) return;

      const now = performance.now();
      let fromOrigin = positions.get(selectedIdRef.current) ?? {
        x: 0,
        y: 0,
        z: 0,
      };
      if (activeWarp.active) {
        const progress = clamp(
          (now - activeWarp.startedAt) / activeWarp.duration,
          0,
          1,
        );
        const blend = progress * progress * (3 - 2 * progress);
        fromOrigin = {
          x:
            activeWarp.fromOrigin.x +
            (activeWarp.toOrigin.x - activeWarp.fromOrigin.x) * blend,
          y:
            activeWarp.fromOrigin.y +
            (activeWarp.toOrigin.y - activeWarp.fromOrigin.y) * blend,
          z:
            activeWarp.fromOrigin.z +
            (activeWarp.toOrigin.z - activeWarp.fromOrigin.z) * blend,
        };
      }

      const view = viewRef.current;
      const target = {
        x: position.x - fromOrigin.x,
        y: position.y - fromOrigin.y,
        z: position.z - fromOrigin.z,
      };
      const horizontalDistance = Math.hypot(target.x, target.z);
      const toX = targetId
        ? Math.atan2(target.y, horizontalDistance)
        : -0.12;
      const rawY = targetId ? Math.atan2(target.x, target.z) : -0.45;
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
        startedAt: now,
        duration: reducedMotionRef.current ? 500 : 1250,
        fromX: view.rotationX,
        fromY: view.rotationY,
        toX,
        toY,
        cruiseZoom: view.zoom,
        targetId,
        fromOrigin,
        toOrigin: position,
      };
    },
    [positions],
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setQuery("");
      warpTo("");
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [warpTo]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    reducedMotionRef.current = reducedMotion;
    setMotionPaused(reducedMotion);
    let animationFrame = 0;
    let width = 0;
    let height = 0;
    const galaxyStars = Array.from({ length: 820 }, (_, index) => {
      const arm = index % 4;
      const radius = 28 + ((Math.sin(index * 91.17) + 1) / 2) * 720;
      const drift = Math.sin(index * 37.91) * 0.48;
      const angle = arm * (Math.PI / 2) + radius * 0.018 + drift;
      return {
        x: Math.cos(angle) * radius,
        y: Math.sin(index * 143.27) * (8 + radius * 0.07),
        z: Math.sin(angle) * radius,
        size: index % 29 === 0 ? 2.2 : index % 7 === 0 ? 1.4 : 0.75,
        tone: index % 13,
      };
    });
    const deepStars = Array.from({ length: 420 }, (_, index) => ({
      angle: (index * 2.399963) % (Math.PI * 2),
      phase: (index * 0.618034) % 1,
      depth: 0.18 + ((Math.sin(index * 57.31) + 1) / 2) * 0.82,
      speed: 0.72 + ((Math.cos(index * 83.19) + 1) / 2) * 0.64,
      size: index % 23 === 0 ? 1.8 : index % 7 === 0 ? 1.2 : 0.7,
      tone: index % 17,
    }));
    const nebulaClouds = [
      { x: 0.18, y: 0.28, radius: 0.48, color: "42, 112, 132" },
      { x: 0.78, y: 0.32, radius: 0.42, color: "81, 48, 116" },
      { x: 0.68, y: 0.76, radius: 0.5, color: "92, 47, 70" },
    ];
    let flightDistance = 0;
    let orbitPhase = 0;
    let previousFrameTime = 0;
    let focusOrigin = positions.get(selectedIdRef.current) ?? {
      x: 0,
      y: 0,
      z: 0,
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const project = (point: Point3D, keepVisible = false) => {
      const view = viewRef.current;
      const localX = point.x - focusOrigin.x;
      const localY = point.y - focusOrigin.y;
      const localZ = point.z - focusOrigin.z;
      const cosY = Math.cos(view.rotationY);
      const sinY = Math.sin(view.rotationY);
      const x1 = localX * cosY - localZ * sinY;
      const z1 = localX * sinY + localZ * cosY;
      const cosX = Math.cos(view.rotationX);
      const sinX = Math.sin(view.rotationX);
      const y = localY * cosX - z1 * sinX;
      const z = localY * sinX + z1 * cosX;
      const distanceFromFocus = Math.hypot(localX, localY, localZ);
      const focusProximity = 1 - clamp(distanceFromFocus / 120, 0, 1);
      const sceneDepth =
        Math.max(z, 48 + distanceFromFocus * 0.12) -
        focusProximity * view.zoom * 0.58;
      const scale = view.zoom / (view.zoom + sceneDepth);
      const roll = Math.sin(orbitPhase) * 0.035;
      const cosRoll = Math.cos(roll);
      const sinRoll = Math.sin(roll);
      const screenX = x1 * scale;
      const screenY = y * scale;
      const driftWeight = clamp(Math.hypot(localX, localY, localZ) / 120, 0, 1);

      const projectedX =
        width / 2 +
        Math.cos(orbitPhase) * width * 0.055 * driftWeight +
        screenX * cosRoll -
        screenY * sinRoll;
      const projectedY =
        height / 2 +
        Math.sin(orbitPhase * 2) * height * 0.025 * driftWeight +
        screenX * sinRoll +
        screenY * cosRoll;
      const bottomMargin = width <= 680 ? 230 : 190;

      return {
        x: keepVisible ? clamp(projectedX, 48, width - 48) : projectedX,
        y: keepVisible
          ? clamp(projectedY, 76, height - bottomMargin)
          : projectedY,
        rawX: projectedX,
        rawY: projectedY,
        z: sceneDepth,
        scale,
      };
    };

    const draw = (time: number) => {
      const view = viewRef.current;
      const warp = warpRef.current;
      const motionReduced = reducedMotionRef.current;
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
        warpIntensity = motionReduced
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
          arrivalRef.current = warp.targetId
            ? { id: warp.targetId, startedAt: time }
            : { id: "", startedAt: 0 };
          setSelectedId(warp.targetId);
          setJourneyPhase(warp.targetId ? "arrived" : "cruising");
        }
      } else {
        const ease = motionReduced ? 1 : 0.075;
        view.rotationX += (view.targetX - view.rotationX) * ease;
        view.rotationY += (view.targetY - view.rotationY) * ease;
        if (!motionReduced && !view.dragging) {
          view.targetY += 0.0026;
          const orbitHeight = -0.12 + Math.sin(time * 0.00035) * 0.12;
          view.targetX += (orbitHeight - view.targetX) * 0.003;
        }
      }
      flightDistance +=
        frameDuration * (motionReduced ? 0 : 0.00032 + warpIntensity * 0.00085);
      orbitPhase +=
        frameDuration * (motionReduced ? 0 : 0.00022 + warpIntensity * 0.00018);

      const focusBlend = warpProgress * warpProgress * (3 - 2 * warpProgress);
      const focusLevel = (id: string) => {
        if (warp.active && warp.targetId !== selectedIdRef.current) {
          if (id === selectedIdRef.current) return 1 - focusBlend;
          if (id === warp.targetId) return focusBlend;
        }
        return id === selectedIdRef.current ? 1 : 0;
      };
      const selectedOrigin = positions.get(selectedIdRef.current) ?? {
        x: 0,
        y: 0,
        z: 0,
      };
      focusOrigin = warp.active
        ? {
            x:
              warp.fromOrigin.x +
              (warp.toOrigin.x - warp.fromOrigin.x) * focusBlend,
            y:
              warp.fromOrigin.y +
              (warp.toOrigin.y - warp.fromOrigin.y) * focusBlend,
            z:
              warp.fromOrigin.z +
              (warp.toOrigin.z - warp.fromOrigin.z) * focusBlend,
          }
        : selectedOrigin;

      context.fillStyle = "#030706";
      context.fillRect(0, 0, width, height);
      const nebulaTime = motionReduced ? 0 : time;
      for (const [index, cloud] of nebulaClouds.entries()) {
        const cloudX =
          width *
          (cloud.x + Math.sin(nebulaTime * 0.000055 + index * 2.1) * 0.035);
        const cloudY =
          height *
          (cloud.y + Math.cos(nebulaTime * 0.000043 + index * 1.7) * 0.03);
        const cloudRadius = Math.max(width, height) * cloud.radius;
        const nebula = context.createRadialGradient(
          cloudX,
          cloudY,
          0,
          cloudX,
          cloudY,
          cloudRadius,
        );
        nebula.addColorStop(0, `rgba(${cloud.color}, 0.12)`);
        nebula.addColorStop(0.38, `rgba(${cloud.color}, 0.055)`);
        nebula.addColorStop(1, `rgba(${cloud.color}, 0)`);
        context.fillStyle = nebula;
        context.fillRect(0, 0, width, height);
      }

      context.save();
      context.translate(width / 2, height / 2);
      context.rotate(-0.38 + Math.sin(orbitPhase * 0.72) * 0.12);
      context.scale(1, 0.24);
      const milkyRadius = Math.hypot(width, height) * 0.78;
      const milkyWay = context.createRadialGradient(
        0,
        0,
        milkyRadius * 0.04,
        0,
        0,
        milkyRadius,
      );
      milkyWay.addColorStop(0, "rgba(228, 244, 255, 0.12)");
      milkyWay.addColorStop(0.24, "rgba(116, 230, 211, 0.075)");
      milkyWay.addColorStop(0.58, "rgba(87, 107, 164, 0.048)");
      milkyWay.addColorStop(1, "rgba(34, 44, 74, 0)");
      context.fillStyle = milkyWay;
      context.beginPath();
      context.arc(0, 0, milkyRadius, 0, Math.PI * 2);
      context.fill();
      context.fillStyle = "rgba(0, 2, 8, 0.18)";
      context.beginPath();
      context.ellipse(
        0,
        milkyRadius * 0.02,
        milkyRadius * 0.92,
        milkyRadius * 0.11,
        0,
        0,
        Math.PI * 2,
      );
      context.fill();
      context.restore();

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
        const pulse = motionReduced
          ? 0.28
          : 0.12 + ((Math.sin(time * 0.001 + star.phase * 30) + 1) / 2) * 0.28;
        const alpha = pulse * (0.35 + star.depth * 0.45 + progress * 0.35);
        const trail = (22 + warpIntensity * 130) * star.depth * progress;
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
        if (
          point.scale <= 0 ||
          point.z > 240 ||
          point.x < -24 ||
          point.x > width + 24 ||
          point.y < -24 ||
          point.y > height + 24
        ) {
          continue;
        }
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

      const projected = articles
        .map((article) => {
          const point = positions.get(article.id);
          return point ? { article, ...project(point, true) } : null;
        })
        .filter((node): node is NonNullable<typeof node> => node !== null)
        .filter((node) => {
          const forced =
            node.article.id === selectedIdRef.current ||
            (warp.active && node.article.id === warp.targetId);
          return (
            forced ||
            (node.z <= NODE_RENDER_DISTANCE &&
              node.rawX > -100 &&
              node.rawX < width + 100 &&
              node.rawY > -100 &&
              node.rawY < height + 100)
          );
        })
        .sort((a, b) => {
          const focusDifference =
            focusLevel(a.article.id) - focusLevel(b.article.id);
          if (Math.abs(focusDifference) > 0.01) return focusDifference;
          return b.z - a.z;
        });
      const projectedById = new Map(
        projected.map((node) => [node.article.id, node]),
      );

      for (const article of articles) {
        const end = projectedById.get(article.id);
        if (!end) continue;
        const connections = new Set([
          ...article.prerequisites,
          ...article.relations.map((relation) => relation.target),
        ]);
        for (const connectionId of connections) {
          const start = projectedById.get(connectionId);
          if (!start) continue;
          const routeFocus = Math.max(
            focusLevel(article.id),
            focusLevel(connectionId),
          );
          if (
            routeFocus < 0.01 &&
            (start.z > ROUTE_RENDER_DISTANCE || end.z > ROUTE_RENDER_DISTANCE)
          ) {
            continue;
          }
          const [routeRed, routeGreen, routeBlue] = galaxyColor(
            article.galaxy,
          );
          context.beginPath();
          context.moveTo(start.x, start.y);
          context.lineTo(end.x, end.y);
          context.strokeStyle = `rgba(${routeRed}, ${routeGreen}, ${routeBlue}, ${0.18 + routeFocus * 0.44})`;
          context.lineWidth = 0.75 + routeFocus * 0.65;
          context.stroke();
        }
      }

      hitAreasRef.current = [];
      for (const node of projected) {
        const focus = focusLevel(node.article.id);
        const arrivalAge =
          arrivalRef.current.id === node.article.id
            ? time - arrivalRef.current.startedAt
            : Number.POSITIVE_INFINITY;
        const arrivalPulse =
          motionReduced || arrivalAge > 1200
            ? 0
            : 1 - clamp(arrivalAge / 1200, 0, 1);
        const radius = clamp(
          (14 * (nodeSizeById.get(node.article.id) ?? 1) + focus * 28) *
            node.scale,
          9,
          width <= 680 ? 64 : 88,
        );
        const [red, green, blue] = galaxyColor(node.article.galaxy);
        if (focus > 0.01) {
          const solarPulse = motionReduced
            ? 1
            : 1 + Math.sin(time * 0.0035) * 0.06;
          const coronaRadius = radius * 3.8 * solarPulse;
          const corona = context.createRadialGradient(
            node.x,
            node.y,
            radius * 0.35,
            node.x,
            node.y,
            coronaRadius,
          );
          corona.addColorStop(0, `rgba(255, 255, 240, ${focus * 0.72})`);
          corona.addColorStop(
            0.18,
            `rgba(${red}, ${green}, ${blue}, ${focus * 0.48})`,
          );
          corona.addColorStop(
            0.52,
            `rgba(${red}, ${green}, ${blue}, ${focus * 0.13})`,
          );
          corona.addColorStop(1, `rgba(${red}, ${green}, ${blue}, 0)`);
          context.fillStyle = corona;
          context.beginPath();
          context.arc(node.x, node.y, coronaRadius, 0, Math.PI * 2);
          context.fill();

          if (focus > 0.6) {
            const flare = context.createLinearGradient(
              0,
              node.y,
              width,
              node.y,
            );
            flare.addColorStop(0, `rgba(${red}, ${green}, ${blue}, 0)`);
            flare.addColorStop(
              clamp(node.x / width - 0.18, 0, 1),
              `rgba(${red}, ${green}, ${blue}, 0.025)`,
            );
            flare.addColorStop(
              clamp(node.x / width, 0, 1),
              `rgba(255, 255, 224, ${focus * 0.34})`,
            );
            flare.addColorStop(
              clamp(node.x / width + 0.18, 0, 1),
              `rgba(${red}, ${green}, ${blue}, 0.025)`,
            );
            flare.addColorStop(1, `rgba(${red}, ${green}, ${blue}, 0)`);
            context.fillStyle = flare;
            context.fillRect(0, node.y - 0.75, width, 1.5);

            context.save();
            context.translate(node.x, node.y);
            context.rotate(time * 0.00008);
            context.strokeStyle = `rgba(${red}, ${green}, ${blue}, ${focus * 0.22})`;
            context.lineWidth = 0.8;
            for (let ray = 0; ray < 12; ray += 1) {
              const angle = (ray / 12) * Math.PI * 2;
              const inner = radius * 1.5;
              const outer = radius * (2 + (ray % 3) * 0.24) * solarPulse;
              context.beginPath();
              context.moveTo(Math.cos(angle) * inner, Math.sin(angle) * inner);
              context.lineTo(Math.cos(angle) * outer, Math.sin(angle) * outer);
              context.stroke();
            }
            context.restore();
          }

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
          context.strokeStyle = `rgba(${red}, ${green}, ${blue}, ${focus * 0.48})`;
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
          context.strokeStyle = `rgba(${red}, ${green}, ${blue}, ${arrivalPulse * 0.58})`;
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

        if (focus > 0.01) {
          const solarCore = context.createRadialGradient(
            node.x - radius * 0.28,
            node.y - radius * 0.32,
            radius * 0.08,
            node.x,
            node.y,
            radius,
          );
          solarCore.addColorStop(0, "#fffff0");
          solarCore.addColorStop(
            0.38,
            `rgb(${Math.round((red + 255) / 2)}, ${Math.round((green + 255) / 2)}, ${Math.round((blue + 255) / 2)})`,
          );
          solarCore.addColorStop(1, `rgb(${red}, ${green}, ${blue})`);
          context.fillStyle = solarCore;
        } else {
          context.fillStyle = `rgb(${red}, ${green}, ${blue})`;
        }
        context.beginPath();
        context.arc(node.x, node.y, radius, 0, Math.PI * 2);
        context.fill();

        context.fillStyle = "#08100f";
        context.textAlign = "center";
        context.textBaseline = "middle";
        if (focus > 0.6) {
          const title = node.article.title.toUpperCase();
          const titleBreak = title.lastIndexOf(
            " ",
            Math.ceil(title.length / 2),
          );
          const titleLines =
            titleBreak > 0
              ? [title.slice(0, titleBreak), title.slice(titleBreak + 1)]
              : [title];
          context.font =
            '700 10px "Cascadia Code", "SFMono-Regular", Consolas, monospace';
          context.fillText(
            node.article.order.toString().padStart(2, "0"),
            node.x,
            node.y - 17,
          );
          context.font =
            '700 13px "Cascadia Code", "SFMono-Regular", Consolas, monospace';
          titleLines.forEach((line, index) => {
            context.fillText(
              line,
              node.x,
              node.y + 3 + index * 15,
              radius * 1.62,
            );
          });

          const headingOrbitX = radius * 2.65;
          const headingOrbitY = radius * 1.18;
          const headingRotation = motionReduced ? 0 : time * 0.00008;
          context.beginPath();
          context.ellipse(
            node.x,
            node.y,
            headingOrbitX,
            headingOrbitY,
            -0.18,
            0,
            Math.PI * 2,
          );
          context.strokeStyle = `rgba(${red}, ${green}, ${blue}, 0.38)`;
          context.lineWidth = 1;
          context.stroke();

          node.article.headings.forEach((heading, index) => {
            const headingAngle =
              headingRotation +
              (index / node.article.headings.length) * Math.PI * 2;
            const planetX =
              node.x + Math.cos(headingAngle) * headingOrbitX;
            const planetY =
              node.y + Math.sin(headingAngle) * headingOrbitY;
            const depth = (Math.sin(headingAngle) + 1) / 2;
            const planetRadius = 4 + depth * 4;

            context.fillStyle = `rgb(${red}, ${green}, ${blue})`;
            context.beginPath();
            context.arc(planetX, planetY, planetRadius, 0, Math.PI * 2);
            context.fill();

            if (depth < 0.68) return;
            const headingTitle = heading.toUpperCase();
            context.font =
              '600 9px "Cascadia Code", "SFMono-Regular", Consolas, monospace';
            const headingWidth = context.measureText(headingTitle).width;
            const placeHeadingRight = planetX < node.x;
            const headingX =
              planetX +
              (placeHeadingRight ? planetRadius + 7 : -planetRadius - 7);
            context.beginPath();
            context.roundRect(
              placeHeadingRight
                ? headingX - 5
                : headingX - headingWidth - 5,
              planetY - 9,
              headingWidth + 10,
              18,
              9,
            );
            context.fillStyle = "rgba(3, 7, 6, 0.86)";
            context.fill();
            context.strokeStyle = `rgba(${red}, ${green}, ${blue}, 0.52)`;
            context.lineWidth = 0.8;
            context.stroke();
            context.fillStyle = "rgba(242, 239, 229, 0.9)";
            context.textAlign = placeHeadingRight ? "left" : "right";
            context.fillText(headingTitle, headingX, planetY);
          });
        } else {
          context.font = `700 ${clamp(9 * node.scale, 7, 12)}px "Cascadia Code", monospace`;
          context.fillText(
            node.article.order.toString().padStart(2, "0"),
            node.x,
            node.y + 0.5,
          );
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
  }, [articles, nodeSizeById, positions]);

  const cancelWarp = () => {
    warpRef.current.active = false;
    setJourneyPhase("cruising");
  };

  const rotateView = (amount: number) => {
    cancelWarp();
    viewRef.current.targetY += amount;
  };

  const travelRelative = (direction: -1 | 1) => {
    if (articles.length === 0) return;
    const currentId = warpRef.current.active
      ? warpRef.current.targetId
      : selectedIdRef.current;
    const currentIndex = articles.findIndex(
      (article) => article.id === currentId,
    );
    const startIndex =
      currentIndex >= 0 ? currentIndex : direction === 1 ? -1 : 0;
    const nextIndex =
      (startIndex + direction + articles.length) % articles.length;
    setQuery("");
    warpTo(articles[nextIndex].id);
  };

  const selectAt = (x: number, y: number) => {
    const hit = hitAreasRef.current
      .slice()
      .reverse()
      .find((area) => Math.hypot(area.x - x, area.y - y) <= area.r);
    if (!hit) return;
    warpTo(
      hit.id === selectedIdRef.current && !warpRef.current.active ? "" : hit.id,
    );
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
          aria-label="Interactive 3D map of connected software knowledge. Drag to rotate, use the arrow keys, or choose a node from the search. Click the focused sun again or press Escape to return to the galaxy overview."
          role="img"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === "ArrowLeft") rotateView(-0.28);
            if (event.key === "ArrowRight") rotateView(0.28);
            if (event.key === "ArrowUp") {
              viewRef.current.targetX = clamp(
                viewRef.current.targetX - 0.18,
                -1.1,
                1.1,
              );
            }
            if (event.key === "ArrowDown") {
              viewRef.current.targetX = clamp(
                viewRef.current.targetX + 0.18,
                -1.1,
                1.1,
              );
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
            <small>
              {articles.length.toString().padStart(2, "0")} nodes online
            </small>
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
          <button
            type="button"
            aria-pressed={!motionPaused}
            onClick={() => {
              reducedMotionRef.current = !motionPaused;
              setMotionPaused(!motionPaused);
            }}
          >
            Flight {motionPaused ? "off" : "on"}
          </button>
          <button
            type="button"
            disabled={!selectedId && journeyPhase !== "warping"}
            onClick={() => warpTo("")}
            aria-label="Unselect focused sun and return to galaxy overview"
          >
            Unselect sun
          </button>
          <Link href="/mission-control">Mission ctrl</Link>
        </div>

        {selectedArticle ? (
          <aside className="node-inspector" aria-live="polite">
            <header className="node-profile-header">
              <span>Node profile</span>
              <strong>
                {selectedArticle.order.toString().padStart(2, "0")} /{" "}
                {articles.length.toString().padStart(2, "0")}
              </strong>
            </header>
            <h2>{selectedArticle.title}</h2>
            <p>{selectedArticle.summary}</p>
            <dl className="node-profile-meta">
              <div>
                <dt>Level</dt>
                <dd>{selectedArticle.level}</dd>
              </div>
              <div>
                <dt>Galaxy</dt>
                <dd>{selectedArticle.galaxy}</dd>
              </div>
              <div>
                <dt>Links</dt>
                <dd>{selectedConnections.length}</dd>
              </div>
            </dl>
            <section
              className="node-connections"
              aria-labelledby="node-connections-title"
            >
              <div className="node-connections-heading">
                <h3 id="node-connections-title">Connected coordinates</h3>
                <span>
                  {selectedConnections.length.toString().padStart(2, "0")}
                </span>
              </div>
              <ul>
                {selectedConnections.map(({ article, relation }) => (
                  <li key={article.id}>
                    <button type="button" onClick={() => warpTo(article.id)}>
                      <span>{article.order.toString().padStart(2, "0")}</span>
                      <span>
                        <strong>{article.title}</strong>
                        <small>{relation.replaceAll("-", " ")}</small>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
            <Link href={`/articles/${selectedArticle.id}`}>
              Open this lesson <span aria-hidden="true">↗</span>
            </Link>
          </aside>
        ) : null}
      </div>
    </section>
  );
}
