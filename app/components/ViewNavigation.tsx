import Link from "next/link";

type KnowledgeView = "galaxy" | "read" | "mission" | "simulation";

export default function ViewNavigation({
  current,
  readHref,
  missionHref = "/mission-control",
  className,
}: {
  current: KnowledgeView;
  readHref: string;
  missionHref?: string;
  className?: string;
}) {
  const views = [
    { id: "galaxy", label: "Galaxy", href: "/" },
    { id: "read", label: "Read", href: readHref },
    { id: "mission", label: "Mission", href: missionHref },
    { id: "simulation", label: "Sim", href: "/lab" },
  ] as const;

  return (
    <nav
      className={["view-navigation", className].filter(Boolean).join(" ")}
      aria-label="View navigation"
    >
      {views.map((view, index) => (
        <Link
          href={view.href}
          key={view.id}
          aria-current={current === view.id ? "page" : undefined}
        >
          <span aria-hidden="true">0{index + 1}</span>
          {view.label}
        </Link>
      ))}
    </nav>
  );
}
