import Link from "next/link";

const links = [
  { href: "/features", label: "기능구현" },
  { href: "/troubleshooting", label: "문제해결" },
  { href: "/performance", label: "성능개선" },
  { href: "/ai-usage", label: "AI 도구 활용법" },
  { href: "/strategy", label: "심화자료" },
];

export default function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-white/80 backdrop-blur dark:border-white/10 dark:bg-[#0a0f0f]/80">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-bold tracking-tight text-teal">
          Kanto Retrospective
        </Link>
        <nav className="flex flex-wrap gap-x-5 gap-y-1 text-sm font-medium">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-foreground/70 transition hover:text-teal"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
