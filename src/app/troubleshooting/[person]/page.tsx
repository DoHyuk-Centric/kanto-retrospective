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
      category="troubleshooting"
      person={decodeURIComponent(person)}
      basePath="/troubleshooting"
      backLabel="문제해결 전체 보기"
    />
  );
}
