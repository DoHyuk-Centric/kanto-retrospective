"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase, ContentItem } from "@/lib/supabaseClient";
import { getPerson } from "@/lib/people";
import { colorMap } from "@/lib/colors";

export default function ItemListPage({
  category,
  person,
  basePath,
  backLabel,
}: {
  category: ContentItem["category"];
  person: string;
  basePath: string;
  backLabel: string;
}) {
  const [items, setItems] = useState<ContentItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const personInfo = getPerson(person);
  const c = colorMap[personInfo?.color ?? "teal"] ?? colorMap.teal;

  useEffect(() => {
    let cancelled = false;
    supabase
      .from("content_items")
      .select("*")
      .eq("category", category)
      .eq("person", person)
      .order("sort_order", { ascending: true })
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) setError(error.message);
        else setItems(data as ContentItem[]);
      });
    return () => {
      cancelled = true;
    };
  }, [category, person]);

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <Link href={basePath} className="text-sm text-foreground/50 hover:text-teal">
        ← {backLabel}
      </Link>
      <div className="mt-4 flex items-center gap-3">
        <span className={`h-2.5 w-2.5 rounded-full ${c.dot}`} />
        <h1 className="text-2xl font-extrabold">{personInfo?.name ?? person}</h1>
        {personInfo && (
          <span className={`text-xs font-medium ${c.text}`}>
            {personInfo.role}
          </span>
        )}
      </div>
      {personInfo && (
        <p className="mt-3 text-sm text-foreground/70">{personInfo.summary}</p>
      )}

      <div className="mt-8 space-y-3">
        {error && (
          <p className="text-sm text-red-500">불러오기 실패: {error}</p>
        )}
        {!error && items === null && (
          <p className="text-sm text-foreground/50">불러오는 중...</p>
        )}
        {items !== null && items.length === 0 && (
          <p className="text-sm text-foreground/50">
            아직 등록된 항목이 없습니다.
          </p>
        )}
        {items?.map((item) => (
          <Link
            key={item.id}
            href={`${basePath}/${encodeURIComponent(person)}/item?id=${item.id}`}
            className="block rounded-2xl border border-black/5 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-white/10"
          >
            <h3 className="font-bold">{item.title}</h3>
            {item.summary && (
              <p className="mt-2 text-sm text-foreground/70">{item.summary}</p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
