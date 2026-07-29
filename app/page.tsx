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
        <a className="nav-link" href="#atlas">
          Open atlas
        </a>
      </nav>

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
