import PersonIndexPage from "@/components/PersonIndexPage";

export default function Page() {
  return (
    <PersonIndexPage
      basePath="/ai-usage"
      emoji="🤖 AI 도구 활용법"
      title="AI를 어떻게 도구로 썼나"
      description="Claude Code, ChatGPT 등 AI 도구를 각자 어떤 상황에서 어떻게 활용했는지 정리했습니다. 이 섹션은 커밋/문서 기반 추정 초안이며, 각 팀원이 직접 다듬어야 합니다."
    />
  );
}
