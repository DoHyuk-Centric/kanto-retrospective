const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

export type ContentItem = {
  id: string;
  category: "features" | "troubleshooting" | "ai-usage";
  person: string;
  title: string;
  summary: string | null;
  body: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type ContentItemSummary = Pick<
  ContentItem,
  "id" | "title" | "summary" | "sort_order" | "updated_at"
>;

export async function listItems(
  category: ContentItem["category"],
  person: string
): Promise<ContentItemSummary[]> {
  const res = await fetch(
    `${API_BASE}/items?category=${encodeURIComponent(category)}&person=${encodeURIComponent(person)}`
  );
  if (!res.ok) throw new Error((await res.json().catch(() => null))?.error ?? res.statusText);
  return res.json();
}

export async function getItem(id: string): Promise<ContentItem> {
  const res = await fetch(`${API_BASE}/items/${encodeURIComponent(id)}`);
  if (!res.ok) throw new Error((await res.json().catch(() => null))?.error ?? res.statusText);
  return res.json();
}
