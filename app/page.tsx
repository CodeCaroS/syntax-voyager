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
    <main className="galaxy-page">
      <SearchExplorer articles={searchArticles} />
    </main>
  );
}
