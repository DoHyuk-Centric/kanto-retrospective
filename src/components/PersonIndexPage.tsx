import PersonCard from "@/components/PersonCard";
import { people } from "@/lib/content";

export default function PersonIndexPage({
  basePath,
  title,
  emoji,
  description,
}: {
  basePath: string;
  title: string;
  emoji: string;
  description: string;
}) {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <p className="text-sm font-semibold text-teal">{emoji}</p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight">{title}</h1>
      <p className="mt-4 max-w-2xl text-foreground/70">{description}</p>
      <div className="mt-10 grid gap-5 sm:grid-cols-2">
        {people.map((p) => (
          <PersonCard key={p.slug} person={p} href={`${basePath}/${encodeURIComponent(p.slug)}`} />
        ))}
      </div>
    </div>
  );
}
