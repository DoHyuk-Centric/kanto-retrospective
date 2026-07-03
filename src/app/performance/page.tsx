import Link from "next/link";
import { getDoc, listDocs } from "@/lib/content";
import Markdown from "@/components/Markdown";

export default function Page() {
  const overview = getDoc("performance", "overview");
  const cases = listDocs("performance").filter((d) => d.slug !== "overview");

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <p className="text-sm font-semibold text-teal">⚡ 성능개선</p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight">
        어떻게 측정하고, 무엇을 고쳤나
      </h1>
      <p className="mt-4 max-w-2xl text-foreground/70">
        PageSpeed Insights로 배포된 실제 서비스를 페이지별로 측정하고, 문제
        우선순위(P0~P2)를 매겨 개선했습니다. 방법론과 페이지별 검사·개선
        기록입니다.
      </p>

      {overview && (
        <div className="mt-10 rounded-2xl border border-black/5 bg-teal-light/40 p-6 dark:border-white/10">
          <Markdown>{overview.content}</Markdown>
        </div>
      )}

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {cases.map((c) => (
          <Link
            key={c.slug}
            href={`/performance/${encodeURIComponent(c.slug)}`}
            className="block rounded-2xl border border-black/5 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-white/10"
          >
            <h3 className="font-bold">{c.title}</h3>
            {c.summary && (
              <p className="mt-2 text-sm text-foreground/70">{c.summary}</p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
