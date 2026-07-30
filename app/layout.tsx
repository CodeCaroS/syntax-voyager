import type { Metadata } from "next";
import { headers } from "next/headers";
import VoyageShell from "@/app/components/VoyageShell";
import { articles, getArticleTitle } from "@/lib/content";
import { galaxyForOrder } from "@/lib/voyage";
import "./globals.css";
import "./spacecraft.css";

const description =
  "Navigate connected programming and software-engineering knowledge through galaxies, flight plans, expeditions, and simulations.";

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
    tags: Array.from(
      new Set([
        ...title.split(/\s+(?:and|&)\s+/i),
        system.replaceAll("-", " "),
        ...prerequisites.map(getArticleTitle),
        ...relations.map((relation) => getArticleTitle(relation.target)),
      ]),
    ).slice(0, 8),
  }),
);

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host") ??
    requestHeaders.get("host") ??
    "localhost:3000";
  const protocol =
    host.startsWith("localhost") || host.startsWith("127.0.0.1")
      ? "http"
      : (requestHeaders.get("x-forwarded-proto") ?? "https");
  const baseUrl = new URL(`${protocol}://${host}`);
  const imageUrl = new URL("/og.png", baseUrl).toString();

  return {
    metadataBase: baseUrl,
    title: {
      default: "Syntax Voyager | Connected software knowledge",
      template: "%s · Syntax Voyager",
    },
    description,
    icons: { icon: "/og.png" },
    openGraph: {
      title: "Syntax Voyager",
      description,
      siteName: "Syntax Voyager",
      type: "website",
      images: [
        {
          url: imageUrl,
          width: 1736,
          height: 907,
          alt: "Syntax Voyager: Connected Software Knowledge",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Syntax Voyager",
      description,
      images: [imageUrl],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <VoyageShell articles={searchArticles}>{children}</VoyageShell>
      </body>
    </html>
  );
}
