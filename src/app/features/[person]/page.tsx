import PersonDocPage from "@/components/PersonDocPage";
import { people } from "@/lib/content";

export function generateStaticParams() {
  return people.map((p) => ({ person: p.slug }));
}

export default async function Page({
  params,
}: {
  params: Promise<{ person: string }>;
}) {
  const { person } = await params;
  return (
    <PersonDocPage
      category="features"
      slug={decodeURIComponent(person)}
      basePath="/features"
      backLabel="기능구현 전체 보기"
    />
  );
}
