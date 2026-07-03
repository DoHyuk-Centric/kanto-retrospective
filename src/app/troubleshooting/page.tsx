import PersonIndexPage from "@/components/PersonIndexPage";

export default function Page() {
  return (
    <PersonIndexPage
      basePath="/troubleshooting"
      emoji="🧩 문제해결"
      title="어떤 문제를 겪었고, 어떻게 풀었나"
      description="버그, 성능 저하, 설계 실수를 발견하고 원인을 추적해 해결한 과정을 팀원별로 정리했습니다. 시행착오와 그 과정에서 배운 점을 그대로 남겼습니다."
    />
  );
}
