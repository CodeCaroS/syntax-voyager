import { SearchExplorer } from "@/app/components/SearchExplorer";
import { articles, getArticleHeadings } from "@/lib/content";
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
      body,
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
      headings: getArticleHeadings(body).map((heading) => heading.title),
    }),
  );

  return (
    <main className="galaxy-page">
      <SearchExplorer articles={searchArticles} />
    </main>
  );
}
