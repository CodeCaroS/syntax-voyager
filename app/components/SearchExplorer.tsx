"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

export interface SearchArticle {
  id: string;
  title: string;
  summary: string;
  order: number;
  level: string;
  prerequisites: string[];
  searchText: string;
}

export function SearchExplorer({ articles }: { articles: SearchArticle[] }) {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();
  const results = useMemo(() => {
    if (!normalizedQuery) return articles;
    return articles.filter((article) =>
      `${article.title} ${article.summary} ${article.searchText}`
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [articles, normalizedQuery]);

  return (
    <section className="explorer" id="explore" aria-labelledby="explore-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Warp search</p>
          <h2 id="explore-title">Find your next coordinate.</h2>
        </div>
        <p className="section-note">
          Search the current system or follow the learning route in order.
        </p>
      </div>

      <div className="search-shell">
        <span className="search-prompt" aria-hidden="true">
          &gt;_
        </span>
        <label className="sr-only" htmlFor="warp-search">
          Search programming fundamentals
        </label>
        <input
          id="warp-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Warp to variables, boolean logic, functions..."
          autoComplete="off"
        />
        <span className="search-count" aria-live="polite">
          {results.length.toString().padStart(2, "0")} nodes
        </span>
      </div>

      {results.length > 0 ? (
        <div className="node-grid">
          {results.map((article) => (
            <Link
              className="node-card"
              href={`/articles/${article.id}`}
              key={article.id}
            >
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
      ) : (
        <div className="empty-state">
          <p className="eyebrow">No signal found</p>
          <h3>That coordinate is not mapped yet.</h3>
          <button type="button" onClick={() => setQuery("")}>
            Return to the current system
          </button>
        </div>
      )}
    </section>
  );
}
