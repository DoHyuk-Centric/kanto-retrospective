import Link from "next/link";
import { people } from "@/lib/content";
import { colorMap } from "@/lib/colors";

const mainLinks = [
  {
    href: "/features",
    emoji: "🛠️",
    title: "기능구현",
    desc: "누가 어떤 기능을 만들었나 — 팀원별 담당 영역과 설계 결정",
  },
  {
    href: "/troubleshooting",
    emoji: "🧩",
    title: "문제해결",
    desc: "겪은 문제와 원인 분석, 그리고 실제 해결 과정",
  },
  {
    href: "/performance",
    emoji: "⚡",
    title: "성능개선",
    desc: "PageSpeed Insights로 측정하고 우선순위를 매겨 고친 기록",
  },
  {
    href: "/ai-usage",
    emoji: "🤖",
    title: "AI 도구 활용법",
    desc: "Claude Code를 실제로 어떻게 활용했는지 (일부는 초안)",
  },
];

export default function Home() {
  return (
    <div>
      <section className="mx-auto max-w-4xl px-6 pt-20 pb-16 text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-teal">
          Kanto Team Retrospective
        </p>
        <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
          필리핀 생활 정보 플랫폼, <span className="text-teal">칸토</span>를
          만들며 남긴 기록
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-foreground/70">
          필리핀에 거주하는 한인 약 10만 명은 중고거래·구인구직·방구하기를
          카카오톡 단체방과 SNS에 의존합니다. 정보가 흘러가고 사라지는 구조라
          사기 피해도 잦고 원하는 정보를 찾기도 어렵습니다. 저희 네 명은 이
          문제를 풀기 위해 6주간 Next.js로 Kanto를 만들었고, 그 과정에서
          겪은 1,000개가 넘는 커밋, 실패와 해결, 강사님의 16차 코드 리뷰를
          이 사이트에 정리했습니다.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          {people.map((p) => {
            const c = colorMap[p.color] ?? colorMap.teal;
            return (
              <span
                key={p.slug}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium ${c.bg} ${c.text}`}
              >
                <span className={`h-2 w-2 rounded-full ${c.dot}`} />
                {p.name} · {p.role}
              </span>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-20">
        <div className="grid gap-5 sm:grid-cols-2">
          {mainLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="group rounded-2xl border border-black/5 p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-white/10"
            >
              <span className="text-3xl">{l.emoji}</span>
              <h2 className="mt-3 text-xl font-bold">{l.title}</h2>
              <p className="mt-2 text-sm text-foreground/70">{l.desc}</p>
              <span className="mt-4 inline-block text-sm font-medium text-teal group-hover:underline">
                살펴보기 →
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-6 rounded-2xl bg-teal-light/40 p-6 text-center">
          <p className="text-sm text-foreground/70">
            Gitflow 전략, 코드리뷰 문화, SEO 전략, 테스트 전략, 온보딩,
            그리고 솔직한 한계까지 — 면접에서 나올 법한 디테일은 따로
            모았습니다.
          </p>
          <Link
            href="/strategy"
            className="mt-3 inline-block font-semibold text-teal hover:underline"
          >
            📚 심화자료 보러가기 →
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 pb-24">
        <h2 className="text-center text-sm font-semibold uppercase tracking-widest text-foreground/50">
          기술 스택
        </h2>
        <div className="mt-4 flex flex-wrap justify-center gap-2 text-sm">
          {[
            "Next.js 16 (App Router)",
            "React 19",
            "TypeScript",
            "Tailwind CSS 4",
            "Supabase",
            "Xendit",
            "Upstash Redis",
            "next-intl",
            "Claude / Gemini / Groq",
          ].map((tech) => (
            <span
              key={tech}
              className="rounded-full border border-black/10 px-3 py-1 text-foreground/70 dark:border-white/15"
            >
              {tech}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
