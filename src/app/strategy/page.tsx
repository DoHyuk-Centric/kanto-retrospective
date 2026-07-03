import Link from "next/link";
import { listDocs } from "@/lib/content";

export default function Page() {
  const docs = listDocs("strategy");

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <p className="text-sm font-semibold text-teal">📚 심화자료</p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight">
        면접에서 나올 법한 디테일
      </h1>
      <p className="mt-4 max-w-2xl text-foreground/70">
        Gitflow 전략, 코드리뷰 문화, SEO 전략, 테스트 전략, 온보딩 프로세스,
        그리고 솔직한 한계와 회고까지 — 기능 코드만으로는 안 보이는 팀의
        개발 프로세스입니다.
      </p>
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {docs.map((d) => (
          <Link
            key={d.slug}
            href={`/strategy/${encodeURIComponent(d.slug)}`}
            className="block rounded-2xl border border-black/5 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-white/10"
          >
            <h3 className="font-bold">{d.title}</h3>
            {d.summary && (
              <p className="mt-2 text-sm text-foreground/70">{d.summary}</p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
