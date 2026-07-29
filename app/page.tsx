import { SearchExplorer } from "@/app/components/SearchExplorer";
import { articles } from "@/lib/content";
import { galaxyForOrder } from "@/lib/voyage";

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
      galaxy: galaxyForOrder(order).title,
    }),
  );

  return (
    <main className="galaxy-page">
      <SearchExplorer articles={searchArticles} />
    </main>
  );
}
