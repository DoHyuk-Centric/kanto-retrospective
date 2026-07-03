import PersonIndexPage from "@/components/PersonIndexPage";

export default function Page() {
  return (
    <PersonIndexPage
      basePath="/features"
      emoji="🛠️ 기능구현"
      title="누가 어떤 기능을 만들었나"
      description="Kanto의 중고거래·구인구직·방렌트·칸토Go·관리자 대시보드 등 각 기능을 누가 설계하고 구현했는지 팀원별로 정리했습니다. 이름을 눌러 상세 내용을 확인하세요."
    />
  );
}
