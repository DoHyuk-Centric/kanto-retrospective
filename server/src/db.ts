import path from "path";
import fs from "fs";
import Database from "better-sqlite3";

const DATA_DIR = process.env.DATA_DIR ?? path.join(__dirname, "..", "data");
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

export const db = new Database(path.join(DATA_DIR, "content.db"));
db.pragma("journal_mode = WAL");

db.exec(`
  create table if not exists content_items (
    id text primary key,
    category text not null check (category in ('features','troubleshooting','ai-usage')),
    person text not null check (person in ('박소유','김도혁','이동근','임태형')),
    title text not null,
    summary text,
    body text not null,
    sort_order integer not null default 0,
    created_at text not null default (datetime('now')),
    updated_at text not null default (datetime('now'))
  );

  create index if not exists content_items_category_person_idx
    on content_items (category, person, sort_order);
`);

export type ContentItem = {
  id: string;
  category: string;
  person: string;
  title: string;
  summary: string | null;
  body: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
};
