import { Suspense } from "react";
import ItemDetailPage from "@/components/ItemDetailPage";
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
    <Suspense
      fallback={<div className="mx-auto max-w-3xl px-6 py-16">불러오는 중...</div>}
    >
      <ItemDetailPage
        category="troubleshooting"
        person={decodeURIComponent(person)}
        basePath="/troubleshooting"
        backLabel="문제해결로"
      />
    </Suspense>
  );
}
