import Link from "next/link";
import { Person } from "@/lib/content";
import { colorMap } from "@/lib/colors";

export default function PersonCard({
  person,
  href,
}: {
  person: Person;
  href: string;
}) {
  const c = colorMap[person.color] ?? colorMap.teal;
  return (
    <Link
      href={href}
      className={`group block rounded-2xl border border-black/5 p-6 shadow-sm ring-1 ring-inset ${c.ring} ${c.bg} transition hover:-translate-y-0.5 hover:shadow-md dark:border-white/10`}
    >
      <div className="flex items-center gap-3">
        <span className={`h-2.5 w-2.5 rounded-full ${c.dot}`} />
        <h3 className="text-lg font-bold">{person.name}</h3>
        <span className={`text-xs font-medium ${c.text}`}>{person.role}</span>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-foreground/70">
        {person.summary}
      </p>
      <span className="mt-4 inline-block text-sm font-medium text-teal group-hover:underline">
        자세히 보기 →
      </span>
    </Link>
  );
}
