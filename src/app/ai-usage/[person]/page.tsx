import ItemListPage from "@/components/ItemListPage";
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
    <ItemListPage
      category="ai-usage"
      person={decodeURIComponent(person)}
      basePath="/ai-usage"
      backLabel="AI 도구 활용법 전체 보기"
    />
  );
}
