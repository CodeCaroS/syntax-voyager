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
        aria-label="EU AI Act transparency notice"
      >
        <details>
          <summary>
            <span>EU AI ACT</span>
            <small>Transparency</small>
          </summary>
          <div className="ai-transparency-copy" role="note">
            <strong>AI transparency notice</strong>
            <p>
              Syntax Voyager does not use an AI system to interact with
              learners, generate responses, profile users, or make automated
              decisions.
            </p>
            <p>
              Lessons and simulations are fixed application content. Learning
              progress stays in this browser.
            </p>
            <small>
              This notice is informational, not a certification of legal
              compliance or legal advice.
            </small>
          </div>
        </details>
      </aside>
    </div>
  );
}
