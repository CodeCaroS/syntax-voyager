import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const contentDirectory = path.join(root, "content");
const outputFile = path.join(root, "app", "generated-content.json");
const allowedRelations = new Set([
  "requires",
  "builds-on",
  "used-with",
  "part-of",
  "contrasts-with",
  "example-of",
]);
const requiredHeadings = [
  "## Learning objective",
  "## Common mistakes",
  "## Small challenge",
  "## Continue the journey",
];

function fail(message) {
  throw new Error(`Content validation failed: ${message}`);
}

function requiredText(data, field, file) {
  const value = data[field];
  if (typeof value !== "string" || value.trim() === "") {
    fail(`${file} must declare a non-empty '${field}'.`);
  }
  return value.trim();
}

function normalizeDate(value, file) {
  const date =
    value instanceof Date
      ? value.toISOString().slice(0, 10)
      : String(value ?? "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    fail(`${file} has an invalid last_reviewed date.`);
  }
  return date;
}

function searchableText(markdown) {
  return markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/[#*_`[\]()|>~-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

const entries = await fs.readdir(contentDirectory, { withFileTypes: true });
const articles = [];

for (const entry of entries) {
  if (!entry.isFile() || !entry.name.endsWith(".md")) continue;

  const source = await fs.readFile(
    path.join(contentDirectory, entry.name),
    "utf8",
  );
  if (!source.startsWith("---")) continue;

  const { data, content } = matter(source);
  const id = requiredText(data, "id", entry.name);
  const title = requiredText(data, "title", entry.name);
  const summary = requiredText(data, "summary", entry.name);
  const level = requiredText(data, "level", entry.name);
  const learningGoal = requiredText(data, "learning_goal", entry.name);
  const system = requiredText(data, "system", entry.name);
  const status = requiredText(data, "status", entry.name);

  if (
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id) ||
    entry.name !== `${id}.md`
  ) {
    fail(`${entry.name} must match its lowercase kebab-case id.`);
  }
  if (!["beginner", "intermediate", "advanced"].includes(level)) {
    fail(`${entry.name} has an invalid level '${level}'.`);
  }
  if (!["draft", "published"].includes(status)) {
    fail(`${entry.name} has an invalid status '${status}'.`);
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(system)) {
    fail(`${entry.name} has an invalid system '${system}'.`);
  }
  if (!Number.isInteger(data.order) || data.order < 1) {
    fail(`${entry.name} must declare a positive integer order.`);
  }
  if (!Array.isArray(data.sources)) {
    fail(`${entry.name} must declare a sources array.`);
  }
  if (status === "published" && data.sources.length === 0) {
    fail(`${entry.name} needs at least one source before publication.`);
  }
  if (!Array.isArray(data.prerequisites)) {
    fail(`${entry.name} must declare a prerequisites array.`);
  }
  if (!Array.isArray(data.relations)) {
    fail(`${entry.name} must declare a relations array.`);
  }
  if (!content.includes(`# ${title}`)) {
    fail(`${entry.name} must contain an H1 matching its title.`);
  }
  for (const heading of requiredHeadings) {
    if (!content.includes(heading)) {
      fail(`${entry.name} is missing '${heading}'.`);
    }
  }
  if (!/^## Exercise: /m.test(content)) {
    fail(`${entry.name} must contain at least one exercise.`);
  }

  const fences = [...content.matchAll(/^```([^\r\n]*)/gm)].map((match) =>
    match[1].trim(),
  );
  if (fences.length % 2 !== 0) {
    fail(`${entry.name} has an unmatched code fence.`);
  }
  if (fences.some((language, index) => index % 2 === 0 && language !== "text")) {
    fail(`${entry.name} contains a non-pseudocode language fence.`);
  }

  const prerequisites = data.prerequisites.map((value) => String(value));
  const relations = data.relations.map((relation) => {
    if (
      typeof relation !== "object" ||
      relation === null ||
      typeof relation.target !== "string" ||
      !allowedRelations.has(relation.type)
    ) {
      fail(`${entry.name} contains an invalid relation.`);
    }
    return { target: relation.target, type: relation.type };
  });
  const relationKeys = relations.map(
    (relation) => `${relation.type}:${relation.target}`,
  );
  if (new Set(relationKeys).size !== relationKeys.length) {
    fail(`${entry.name} contains duplicate relations.`);
  }
  if (
    prerequisites.includes(id) ||
    relations.some((relation) => relation.target === id)
  ) {
    fail(`${entry.name} cannot reference itself.`);
  }
  for (const prerequisite of prerequisites) {
    const matches = relations.filter(
      (relation) =>
        relation.target === prerequisite && relation.type === "requires",
    );
    if (matches.length !== 1) {
      fail(`${entry.name} must require prerequisite '${prerequisite}'.`);
    }
  }

  articles.push({
    id,
    title,
    summary,
    level,
    learningGoal,
    system,
    order: data.order,
    status,
    sources: data.sources,
    prerequisites,
    relations,
    lastReviewed: normalizeDate(data.last_reviewed, entry.name),
    body: content.replace(/^# .+\r?\n+/, "").trim(),
    searchText: searchableText(content),
  });
}

if (articles.length === 0) fail("No article files were found.");

const ids = new Set(articles.map((article) => article.id));
if (ids.size !== articles.length) fail("Article IDs must be unique.");

const orderKeys = new Set();
for (const article of articles) {
  const orderKey = `${article.system}:${article.order}`;
  if (orderKeys.has(orderKey)) {
    fail(`Order ${article.order} is duplicated in '${article.system}'.`);
  }
  orderKeys.add(orderKey);
  for (const target of [
    ...article.prerequisites,
    ...article.relations.map((relation) => relation.target),
  ]) {
    if (!ids.has(target)) {
      fail(`${article.id} references missing article '${target}'.`);
    }
  }
}

const remaining = new Map(
  articles.map((article) => [article.id, article.prerequisites.length]),
);
const dependents = new Map();
for (const article of articles) {
  for (const prerequisite of article.prerequisites) {
    const current = dependents.get(prerequisite) ?? [];
    current.push(article.id);
    dependents.set(prerequisite, current);
  }
}
const queue = [...remaining]
  .filter(([, count]) => count === 0)
  .map(([id]) => id);
let visited = 0;
while (queue.length > 0) {
  const id = queue.shift();
  visited += 1;
  for (const dependent of dependents.get(id) ?? []) {
    const next = remaining.get(dependent) - 1;
    remaining.set(dependent, next);
    if (next === 0) queue.push(dependent);
  }
}
if (visited !== articles.length) fail("Prerequisites contain a cycle.");

articles.sort((left, right) => {
  const systemOrder = left.system.localeCompare(right.system);
  return systemOrder || left.order - right.order;
});

await fs.writeFile(outputFile, `${JSON.stringify(articles, null, 2)}\n`);
console.log(`Generated ${articles.length} validated articles.`);
