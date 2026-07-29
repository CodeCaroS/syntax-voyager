"use client";

import { useEffect, useState } from "react";

export default function HeadingScrollSpy({
  headings,
}: {
  headings: Array<{ id: string; title: string }>;
}) {
  const [activeId, setActiveId] = useState(headings[0]?.id ?? "");

  useEffect(() => {
    const elements = headings
      .map(({ id }) => document.getElementById(id))
      .filter((element): element is HTMLElement => element !== null);

    const update = () => {
      let active = elements[0];
      for (const element of elements) {
        if (element.getBoundingClientRect().top > 160) break;
        active = element;
      }
      if (active) setActiveId(active.id);
    };

    const observer = new IntersectionObserver(update, {
      rootMargin: "-128px 0px -65% 0px",
    });
    elements.forEach((element) => observer.observe(element));
    update();

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <nav className="rail-route rail-headings" aria-label="On this page">
      <p className="eyebrow">On this page</p>
      <ol>
        {headings.map((heading) => (
          <li key={heading.id}>
            <a
              href={`#${heading.id}`}
              aria-current={activeId === heading.id ? "location" : undefined}
            >
              {heading.title}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
