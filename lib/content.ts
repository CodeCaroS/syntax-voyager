import articleData from "@/app/generated-content.json";

export type RelationType =
  | "requires"
  | "builds-on"
  | "used-with"
  | "part-of"
  | "contrasts-with"
  | "example-of";

export interface Article {
  id: string;
  title: string;
  summary: string;
  level: "beginner" | "intermediate" | "advanced";
  learningGoal: string;
  system: string;
  order: number;
  status: "draft" | "published";
  sources: unknown[];
  prerequisites: string[];
  relations: Array<{ target: string; type: RelationType }>;
  lastReviewed: string;
  body: string;
  searchText: string;
}

export const articles = articleData as Article[];

export function getArticle(id: string) {
  return articles.find((article) => article.id === id);
}

export function getArticleTitle(id: string) {
  return getArticle(id)?.title ?? id;
}

export function getRelatedArticles(article: Article) {
  const ids = new Set([
    ...article.prerequisites,
    ...article.relations.map((relation) => relation.target),
  ]);

  for (const candidate of articles) {
    if (
      candidate.prerequisites.includes(article.id) ||
      candidate.relations.some((relation) => relation.target === article.id)
    ) {
      ids.add(candidate.id);
    }
  }

  ids.delete(article.id);
  return articles.filter((candidate) => ids.has(candidate.id));
}

export function readingMinutes(markdown: string) {
  const words = markdown.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 220));
}
