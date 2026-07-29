import Link from "next/link";
import { SearchExplorer } from "@/app/components/SearchExplorer";
import { articles } from "@/lib/content";

export default function Home() {
  const searchArticles = articles.map(
    ({ id, title, summary, order, level, prerequisites, searchText }) => ({
      id,
      title,
      summary,
      order,
      level,
      prerequisites,
      searchText,
    }),
  );

  return (
    <main>
      <nav className="topbar" aria-label="Primary navigation">
        <Link className="brand" href="/">
          <span className="brand-mark" aria-hidden="true">
            SV
          </span>
          <span>
            <strong>Syntax Voyager</strong>
            <small>Connected software knowledge</small>
          </span>
        </Link>
        <div className="topbar-status">
          <span className="live-dot" aria-hidden="true" />
          System 01 online
        </div>
        <a className="nav-link" href="#explore">
          Explore nodes <span aria-hidden="true">↓</span>
        </a>
      </nav>

      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Navigation log 01 · Programming fundamentals</p>
          <h1>
            Chart the logic behind
            <span> every line of code.</span>
          </h1>
          <p className="hero-intro">
            Software development is not a list of isolated facts. Syntax Voyager
            maps the connections, prerequisites, and practical ideas that turn
            knowledge into understanding.
          </p>
          <div className="hero-actions">
            <a className="primary-action" href="#explore">
              Enter the system <span aria-hidden="true">↘</span>
            </a>
            <Link
              className="text-action"
              href="/articles/algorithms-and-pseudocode"
            >
              Start at node 01
            </Link>
          </div>
          <dl className="system-stats">
            <div>
              <dt>Nodes online</dt>
              <dd>{articles.length.toString().padStart(2, "0")}</dd>
            </div>
            <div>
              <dt>Knowledge systems</dt>
              <dd>01</dd>
            </div>
            <div>
              <dt>Learning mode</dt>
              <dd>Pseudocode</dd>
            </div>
          </dl>
        </div>

        <aside className="route-card" aria-label="Current learning route">
          <div className="route-card-header">
            <span>Current route</span>
            <span>Fundamentals / 01</span>
          </div>
          <div className="route-orbit" aria-hidden="true">
            <span className="orbit-ring orbit-ring-one" />
            <span className="orbit-ring orbit-ring-two" />
            <span className="orbit-core">01</span>
            <span className="orbit-node orbit-node-one">04</span>
            <span className="orbit-node orbit-node-two">06</span>
            <span className="orbit-node orbit-node-three">10</span>
          </div>
          <div className="route-list">
            <div>
              <span>Entry coordinate</span>
              <strong>Algorithms &amp; Pseudocode</strong>
            </div>
            <div>
              <span>Current destination</span>
              <strong>Functions</strong>
            </div>
          </div>
        </aside>
      </section>

      <SearchExplorer articles={searchArticles} />

      <section className="manifesto">
        <p className="eyebrow">The navigation principle</p>
        <blockquote>
          “Learn the concept. Trace the state. Follow the connection.”
        </blockquote>
        <p>
          Every article is a readable lesson and a coordinate in a larger
          knowledge graph. The universe grows only when its connections are
          useful.
        </p>
      </section>

      <footer>
        <div className="brand footer-brand">
          <span className="brand-mark" aria-hidden="true">
            SV
          </span>
          <span>
            <strong>Syntax Voyager</strong>
            <small>Work in progress · International edition</small>
          </span>
        </div>
        <p>Built for curious developers and future software apprentices.</p>
      </footer>
    </main>
  );
}
