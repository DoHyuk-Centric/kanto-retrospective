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
      category="troubleshooting"
      slug={decodeURIComponent(person)}
      basePath="/troubleshooting"
      backLabel="문제해결 전체 보기"
    />
  );
}
