"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { supabase, ContentItem } from "@/lib/supabaseClient";
import Markdown from "@/components/Markdown";

export default function ItemDetailPage({
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
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [item, setItem] = useState<ContentItem | null | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    supabase
      .from("content_items")
      .select("*")
      .eq("id", id)
      .eq("category", category)
      .eq("person", person)
      .single()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) setError(error.message);
        else setItem(data as ContentItem);
      });
    return () => {
      cancelled = true;
    };
  }, [id, category, person]);

  const listHref = `${basePath}/${encodeURIComponent(person)}`;

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <Link href={listHref} className="text-sm text-foreground/50 hover:text-teal">
        ← {person} {backLabel}
      </Link>

      {!id && (
        <p className="mt-8 text-sm text-red-500">
          잘못된 접근입니다 (id 없음).
        </p>
      )}
      {error && <p className="mt-8 text-sm text-red-500">불러오기 실패: {error}</p>}
      {id && !error && item === undefined && (
        <p className="mt-8 text-sm text-foreground/50">불러오는 중...</p>
      )}
      {item === null && (
        <p className="mt-8 text-sm text-foreground/50">항목을 찾을 수 없습니다.</p>
      )}
      {item && (
        <>
          <h1 className="mt-4 text-2xl font-extrabold">{item.title}</h1>
          <div className="mt-8">
            <Markdown>{item.body}</Markdown>
          </div>
        </>
      )}
    </div>
  );
}
