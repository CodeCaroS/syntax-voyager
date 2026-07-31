"use client";

import { usePathname } from "next/navigation";
import { type ReactNode, useEffect } from "react";
import { SearchExplorer, type SearchArticle } from "./SearchExplorer";

export default function VoyageShell({
  articles,
  children,
}: {
  articles: SearchArticle[];
  children: ReactNode;
}) {
  const pathname = usePathname();
  const galaxyView = pathname === "/";

  useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [pathname]);

  return (
    <div className="voyage-shell" data-view={galaxyView ? "galaxy" : "panel"}>
      <div
        className={
          galaxyView ? "galaxy-page" : "galaxy-page starmap-underlay"
        }
        role={galaxyView ? "main" : undefined}
        aria-hidden={galaxyView ? undefined : true}
      >
        <SearchExplorer articles={articles} />
      </div>
      {galaxyView ? children : (
        <div className="starmap-view-layer">{children}</div>
      )}
      <aside
        className="ai-transparency-notice"
        aria-label="AI assistance and EU AI Act transparency notice"
      >
        <details>
          <summary>
            <span>EU AI ACT</span>
            <small>AI-assisted</small>
          </summary>
          <div className="ai-transparency-copy" role="note">
            <strong>AI-assisted development notice</strong>
            <p>
              Generative AI tools assisted with this project&apos;s development
              and may have contributed to its code, copy, and educational
              content. Human review remains necessary.
            </p>
            <p>
              Lessons and simulations are fixed application content. Learning
              progress stays in this browser.
            </p>
            <p>
              The running app does not include or invoke an AI model, interact
              with learners through AI, profile users, or make automated
              decisions.
            </p>
            <small>
              Voluntary disclosure — not a claim of conformity, certification,
              legal advice, or final risk classification.
            </small>
          </div>
        </details>
      </aside>
    </div>
  );
}
