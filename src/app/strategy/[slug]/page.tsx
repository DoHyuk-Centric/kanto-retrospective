import Link from "next/link";
import { notFound } from "next/navigation";
import { getDoc, listDocs } from "@/lib/content";
import Markdown from "@/components/Markdown";

export function generateStaticParams() {
  return listDocs("strategy").map((d) => ({ slug: d.slug }));
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const doc = getDoc("strategy", decodeURIComponent(slug));
  if (!doc) notFound();

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <Link href="/strategy" className="text-sm text-foreground/50 hover:text-teal">
        ← 심화자료 전체 보기
      </Link>
      <h1 className="mt-4 text-2xl font-extrabold">{doc.title}</h1>
      <div className="mt-8">
        <Markdown>{doc.content}</Markdown>
      </div>
    </div>
  );
}
