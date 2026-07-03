import Link from "next/link";

function Code({ children }: { children: string }) {
  return (
    <pre className="mt-2 overflow-x-auto rounded-lg bg-black/5 p-3 text-sm dark:bg-white/10">
      <code>{children}</code>
    </pre>
  );
}

function Step({
  n,
  title,
  children,
}: {
  n: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-black/5 p-6 dark:border-white/10">
      <div className="flex items-center gap-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal text-sm font-bold text-white">
          {n}
        </span>
        <h2 className="font-bold">{title}</h2>
      </div>
      <div className="mt-3 pl-10 text-sm leading-relaxed text-foreground/80">
        {children}
      </div>
    </div>
  );
}

export default function SetupPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <p className="text-sm font-semibold text-teal">팀원 전용</p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight">
        MCP로 내 콘텐츠 편집하기
      </h1>
      <p className="mt-4 text-foreground/70">
        기능구현·문제해결·AI 도구 활용법 섹션은 각자 Claude Code에 연결한
        MCP 서버로 직접 추가·수정합니다. 본인 이름 + PIN으로 인증하면 본인
        항목만 쓸 수 있고, 다른 사람 항목은 건드릴 수 없습니다.
      </p>

      <div className="mt-8 space-y-4">
        <Step n={1} title="저장소 받기">
          아직 로컬에 저장소가 없다면 클론하세요.
          <Code>{`git clone https://github.com/DoHyuk-Centric/kanto-retrospective.git
cd kanto-retrospective`}</Code>
        </Step>

        <Step n={2} title="의존성 설치">
          <Code>{`npm install
cd mcp-server && npm install && cd ..`}</Code>
        </Step>

        <Step n={3} title="자동 설정 스크립트 실행">
          이름을 선택하고 프로젝트장에게 받은 본인 PIN만 입력하면{" "}
          <code>mcp-server/.env</code>가 자동으로 만들어집니다(직접 파일을
          편집할 필요 없음). 이 파일은 git에 커밋되지 않습니다.
          <Code>{`npm run setup:mcp`}</Code>
        </Step>

        <Step n={4} title="Claude Code로 이 폴더 열기">
          터미널에서 이 저장소 폴더로 이동해 Claude Code를 실행하세요.
          루트의 <code>.mcp.json</code>이 이미 MCP 서버를 등록해뒀기 때문에,
          시작할 때 &quot;이 프로젝트의 MCP 서버를 사용하시겠습니까?&quot;
          같은 승인 팝업이 뜨면 승인해주세요.
        </Step>

        <Step n={5} title="연결 확인">
          Claude Code에서 <code>/mcp</code> 명령을 입력하면 연결된 MCP
          서버 목록이 보입니다. <code>kanto-retrospective-content</code>가
          보이고 도구(login / add_item / update_item / delete_item /
          list_items / whoami / logout)가 나오면 성공입니다.
        </Step>

        <Step n={6} title="사용하기">
          Claude에게 이렇게 말하면 됩니다:
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>&quot;PIN 1234로 로그인해줘&quot; → 인증</li>
            <li>
              &quot;기능구현에 이런 내용으로 항목 추가해줘: (제목/요약/본문)&quot;
              → <code>add_item</code>
            </li>
            <li>
              &quot;문제해결에 내가 쓴 항목 목록 보여줘&quot; →{" "}
              <code>list_items</code>로 id 확인 후 &quot;이 항목 이렇게
              고쳐줘&quot; → <code>update_item</code>
            </li>
          </ul>
          <p className="mt-2">
            다른 사람 이름으로 만든 항목은 본인 PIN으로 로그인해도 수정·삭제가
            거부됩니다.
          </p>
        </Step>
      </div>

      <p className="mt-8 text-sm text-foreground/60">
        본인 PIN을 모른다면 프로젝트장에게 카톡/디스코드로 직접 받으세요.
        여기(공개 페이지)에는 적어두지 않습니다.
      </p>

      <Link href="/" className="mt-8 inline-block text-sm text-teal hover:underline">
        ← 메인으로
      </Link>
    </div>
  );
}
