import type { Metadata } from "next";
import MissionControl from "@/app/components/MissionControl";
import { articles } from "@/lib/content";

export const metadata: Metadata = {
  title: "Mission Control",
  description:
    "Choose a Syntax Voyager learning route, track mastery, and run expedition campaigns.",
};

export default function MissionControlPage() {
  return (
    <MissionControl
      articles={articles.map(({ id, title, summary, order, level }) => ({
        id,
        title,
        summary,
        order,
        level,
      }))}
    />
  );
}
