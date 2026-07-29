import { SearchExplorer } from "@/app/components/SearchExplorer";
import { articles, getArticleTitle } from "@/lib/content";
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
    }) => {
      const tags = Array.from(
        new Set([
          ...title.split(/\s+(?:and|&)\s+/i),
          system.replaceAll("-", " "),
          ...prerequisites.map(getArticleTitle),
          ...relations.map((relation) => getArticleTitle(relation.target)),
        ]),
      ).slice(0, 8);

      return {
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
        tags,
      };
    },
  );

  return (
    <main className="galaxy-page">
      <SearchExplorer articles={searchArticles} />
    </main>
  );
}
