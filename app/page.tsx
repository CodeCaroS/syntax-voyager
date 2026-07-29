import { SearchExplorer } from "@/app/components/SearchExplorer";
import { articles } from "@/lib/content";

export default function Home() {
  const searchArticles = articles.map(
    ({
      id,
      title,
      summary,
      order,
      level,
      system,
      prerequisites,
      relations,
      searchText,
    }) => ({
      id,
      title,
      summary,
      order,
      level,
      system,
      prerequisites,
      relations,
      searchText,
    }),
  );

  return (
    <main className="galaxy-page">
      <SearchExplorer articles={searchArticles} />
    </main>
  );
}
