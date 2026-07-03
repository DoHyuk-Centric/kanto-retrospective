import fs from "fs";
import path from "path";
import matter from "gray-matter";

export { people, getPerson } from "./people";
export type { Person } from "./people";

const CONTENT_DIR = path.join(process.cwd(), "content");

export type Doc = {
  slug: string;
  title: string;
  summary?: string;
  content: string;
  [key: string]: unknown;
};

function readMarkdown(category: string, slug: string): Doc | null {
  const filePath = path.join(CONTENT_DIR, category, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  return {
    slug,
    title: (data.title as string) ?? slug,
    summary: data.summary as string | undefined,
    content,
    ...data,
  };
}

export function getDoc(category: string, slug: string): Doc | null {
  return readMarkdown(category, slug);
}

export function listDocs(category: string): Doc[] {
  const dir = path.join(CONTENT_DIR, category);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => readMarkdown(category, f.replace(/\.md$/, "")))
    .filter((d): d is Doc => d !== null);
}
