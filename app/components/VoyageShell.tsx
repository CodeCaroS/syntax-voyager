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
    </div>
  );
}
