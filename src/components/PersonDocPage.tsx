import Link from "next/link";
import { notFound } from "next/navigation";
import { getDoc, getPerson } from "@/lib/content";
import Markdown from "@/components/Markdown";
import { colorMap } from "@/lib/colors";

export default function PersonDocPage({
  category,
  slug,
  basePath,
  backLabel,
}: {
  category: string;
  slug: string;
  basePath: string;
  backLabel: string;
}) {
  const person = getPerson(slug);
  const doc = getDoc(category, slug);
  if (!person || !doc) notFound();
  const c = colorMap[person.color] ?? colorMap.teal;

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <Link href={basePath} className="text-sm text-foreground/50 hover:text-teal">
        ← {backLabel}
      </Link>
      <div className="mt-4 flex items-center gap-3">
        <span className={`h-2.5 w-2.5 rounded-full ${c.dot}`} />
        <h1 className="text-2xl font-extrabold">{person.name}</h1>
        <span className={`text-xs font-medium ${c.text}`}>{person.role}</span>
      </div>
      <div className="mt-8">
        <Markdown>{doc.content}</Markdown>
      </div>
    </div>
  );
}
