import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

const description =
  "Explore programming fundamentals as a connected, language-agnostic knowledge system.";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host") ??
    requestHeaders.get("host") ??
    "localhost:3000";
  const protocol =
    requestHeaders.get("x-forwarded-proto") ??
    (host.startsWith("localhost") ? "http" : "https");
  const baseUrl = new URL(`${protocol}://${host}`);
  const imageUrl = new URL("/og.png", baseUrl).toString();

  return {
    metadataBase: baseUrl,
    title: {
      default: "Syntax Voyager — Connected software knowledge",
      template: "%s · Syntax Voyager",
    },
    description,
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
          alt: "Syntax Voyager — Connected Software Knowledge",
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
      <body>{children}</body>
    </html>
  );
}
