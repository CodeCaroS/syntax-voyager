import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import HeadingScrollSpy from "@/app/components/HeadingScrollSpy";
import LanguageBridge from "@/app/components/LanguageBridge";
import LessonFlightRecorder from "@/app/components/LessonFlightRecorder";
import {
  articles,
  getArticle,
  getArticleHeadings,
  getArticleTitle,
  getRelatedArticles,
  headingId,
  readingMinutes,
} from "@/lib/content";
import { isPseudocodeSource } from "@/lib/language-bridge";
import { galaxyForOrder } from "@/lib/voyage";

export const dynamicParams = false;

export function generateStaticParams() {
  return articles.map((article) => ({ id: article.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const article = getArticle(id);
  return article
    ? { title: article.title, description: article.summary }
    : { title: "Coordinate not found" };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const article = getArticle(id);
  if (!article) notFound();

  const related = getRelatedArticles(article);
  const systemArticles = articles.filter(
    (candidate) => candidate.system === article.system,
  );
  const currentIndex = systemArticles.findIndex(
    (candidate) => candidate.id === article.id,
  );
  const previous = systemArticles[currentIndex - 1];
  const next = systemArticles[currentIndex + 1];
  const headings = getArticleHeadings(article.body);
  const galaxy = galaxyForOrder(article.order);

  return (
    <main className="article-page">
      <nav className="topbar article-topbar" aria-label="Primary navigation">
        <Link className="brand" href="/">
          <span className="brand-mark" aria-hidden="true">
            SV
          </span>
          <span>
            <strong>Syntax Voyager</strong>
            <small>Connected software knowledge</small>
          </span>
        </Link>
        <Link className="nav-link" href="/#explore">
          Warp search <span aria-hidden="true">↗</span>
        </Link>
      </nav>

      <div className="article-layout">
        <aside className="article-rail">
          <Link className="back-link" href="/#explore">
            ← All coordinates
          </Link>
          <div className="rail-index">
            <span>Node</span>
            <strong>{article.order.toString().padStart(2, "0")}</strong>
          </div>
          <div className="rail-route">
            <p className="eyebrow">Prerequisites</p>
            {article.prerequisites.length === 0 ? (
              <span className="entry-label">Entry point</span>
            ) : (
              article.prerequisites.map((prerequisite) => (
                <Link
                  href={`/articles/${prerequisite}`}
                  key={prerequisite}
                >
                  {getArticleTitle(prerequisite)}
                </Link>
              ))
            )}
          </div>
          <HeadingScrollSpy headings={headings} />
        </aside>

        <article className="article">
          <header className="article-header">
            <p className="eyebrow">
              {galaxy.title} · Node{" "}
              {article.order.toString().padStart(2, "0")}
            </p>
            <h1>{article.title}</h1>
            <p className="article-summary">{article.summary}</p>
            <div className="article-meta">
              <span>{article.level}</span>
              <span>{readingMinutes(article.body)} min read</span>
              <span>Reviewed {article.lastReviewed}</span>
            </div>
            <div className="learning-goal">
              <span>Mission objective</span>
              <p>{article.learningGoal}</p>
            </div>
            <LessonFlightRecorder articleId={article.id} order={article.order} />
          </header>

          <div className="article-content">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
              components={{
                h2: ({ children }) => (
                  <h2 id={headingId(String(children))}>{children}</h2>
                ),
                code: ({ className, children, ...props }) => {
                  const source = String(children).replace(/\n$/, "");
                  return className?.includes("language-text") &&
                    isPseudocodeSource(source) ? (
                    <LanguageBridge source={source} />
                  ) : (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                },
              }}
            >
              {article.body}
            </ReactMarkdown>
          </div>

          <nav className="article-pagination" aria-label="Article navigation">
            {previous ? (
              <Link href={`/articles/${previous.id}`}>
                <span>Previous coordinate</span>
                <strong>← {previous.title}</strong>
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link href={`/articles/${next.id}`}>
                <span>Next coordinate</span>
                <strong>{next.title} →</strong>
              </Link>
            ) : (
              <Link href="/#explore">
                <span>Route complete</span>
                <strong>Return to star map →</strong>
              </Link>
            )}
          </nav>

          {related.length > 0 && (
            <section className="related-section" aria-labelledby="related-title">
              <p className="eyebrow">Connected nodes</p>
              <h2 id="related-title">Continue exploring</h2>
              <div className="related-grid">
                {related.slice(0, 4).map((candidate) => (
                  <Link href={`/articles/${candidate.id}`} key={candidate.id}>
                    <span>{candidate.order.toString().padStart(2, "0")}</span>
                    <strong>{candidate.title}</strong>
                    <small>{candidate.summary}</small>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </article>
      </div>
    </main>
  );
}
