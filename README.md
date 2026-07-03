# Kanto Retrospective

Kanto 팀(박소유·김도혁·이동근·임태형)의 개발 과정을 정리한 회고/포트폴리오 사이트입니다. 기능구현, 문제해결, 성능개선, AI 도구 활용법, 심화자료(gitflow·코드리뷰 문화·SEO·테스트 전략 등) 5개 섹션으로 구성돼 있습니다.

배포: https://dohyuk-centric.github.io/kanto-retrospective/ (GitHub Pages, `master` push 시 자동 재배포)

## 콘텐츠가 관리되는 두 가지 방식

| 섹션 | 저장 방식 | 수정 방법 |
| --- | --- | --- |
| 기능구현 / 문제해결 / AI 도구 활용법 | Supabase DB (`content_items` 테이블), 인물별 **여러 항목의 목록** | 아래 "MCP로 콘텐츠 추가·수정" |
| 성능개선 / 심화자료 | `content/` 폴더의 정적 마크다운 파일 | 파일을 직접 수정 후 git push |

기능구현/문제해결/AI 도구 활용법은 한 사람이 여러 개의 항목(기능, 사례 등)을 가지므로 목록형으로 보여지고, 항목을 클릭하면 상세 내용이 나옵니다. 이 목록은 **빌드 시점이 아니라 브라우저에서 Supabase를 직접 조회**해서 보여주므로, DB에 항목을 추가/수정하면 사이트를 다시 배포하지 않아도 바로 반영됩니다.

## 실행 (로컬 개발)

```bash
npm install
cp .env.local.example .env.local   # 값 채우기 (아래 "Supabase 준비" 참고)
npm run dev
```

`http://localhost:3000`에서 확인합니다. (원본 kanto 프로젝트를 로컬에서 같이 띄운다면 포트가 겹치니 `npm run dev -- -p 3100`처럼 다른 포트를 쓰세요.)

## Supabase 준비 (최초 1회, 프로젝트장)

1. [supabase.com](https://supabase.com)에서 새 프로젝트 생성
2. SQL Editor에서 `supabase/schema.sql` 내용을 실행 → `content_items` 테이블과 읽기 전용 RLS 정책 생성
3. Settings > API에서 Project URL, `anon` key, `service_role` key 확인
4. 루트의 `.env.local`에 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` 채우기
5. 기존 `content/features|troubleshooting|ai-usage/*.md`를 DB로 옮기기(최초 1회):
   ```bash
   npm run migrate:content
   ```
   이 스크립트는 각 마크다운 파일의 `##` 섹션을 항목 하나씩으로 쪼개서 `content_items`에 넣습니다. 같은 사람·카테고리를 다시 실행하면 기존 항목을 지우고 새로 넣으므로, 이후로는 콘텐츠를 파일이 아니라 MCP로 관리하세요.

`anon` key는 읽기 전용 RLS로 보호되므로 `NEXT_PUBLIC_` 접두어로 공개돼도 안전합니다. **`service_role` key는 RLS를 완전히 우회하니 절대 커밋하거나 공유 채팅방 등에 올리지 마세요.**

6. GitHub Pages 배포 빌드에도 같은 공개 키가 필요합니다. 저장소 Settings > Secrets and variables > Actions에서 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`를 리포지토리 시크릿으로 등록하세요.

## MCP로 콘텐츠 추가·수정 (팀원 각자)

이 저장소에는 `content_items`를 다루는 전용 MCP 서버(`mcp-server/`)가 있습니다. Claude Code에 연결하면, 자기 이름 + PIN으로 인증한 뒤 **자기 항목만** 추가/수정/삭제할 수 있습니다.

1. `mcp-server/.env.example`을 `mcp-server/.env`로 복사
2. 본인 값 채우기:
   ```env
   SUPABASE_URL=...          # 프로젝트장에게 받기
   SUPABASE_SERVICE_ROLE_KEY=...   # 프로젝트장에게 받기
   MCP_PERSON=박소유          # 본인 이름
   MCP_PIN=1234              # 프로젝트장에게 받은 본인 PIN (남에게 공유 금지)
   ```
3. 루트의 `.mcp.json`은 이미 이 MCP 서버를 등록해뒀으므로, 이 저장소를 Claude Code로 열면 자동으로 연결됩니다(`kanto-retrospective-content`).
4. Claude Code에서 다음처럼 사용:
   - `login` 도구에 PIN 입력 → 인증
   - `add_item` 으로 새 항목 추가 (category: features/troubleshooting/ai-usage, title, summary, body)
   - `list_items` 로 본인 또는 다른 사람 항목 목록 확인 (id 확인용, 로그인 불필요)
   - `update_item` 으로 본인 항목만 수정 (다른 사람 항목은 거부됨)
   - `delete_item` 으로 본인 항목만 삭제

PIN은 4자리 숫자로, 강한 보안이 아니라 "실수로 남의 항목을 건드리지 않기 위한" 가벼운 팀 내부 잠금입니다. `mcp-server/.env`는 git에 커밋되지 않으니, 본인 PIN과 service role 키는 카톡/디스코드 등 별도 채널로 프로젝트장에게 직접 받으세요.

## 정적 마크다운 섹션 (성능개선 / 심화자료)

```
content/
├── performance/   # overview.md(방법론) + 기능별 파일
└── strategy/      # gitflow, seo전략, 리뷰문화 등 주제별 파일
```

파일 상단 frontmatter로 제목과 요약을 답니다:

```markdown
---
title: 페이지 제목
summary: 목록 카드에 보일 한 줄 요약
---

본문 마크다운...
```

파일을 고치고 `git push`하면 GitHub Actions가 자동으로 다시 빌드·배포합니다.

## 특히 다듬어야 할 부분

AI 도구 활용법 항목들은 커밋 로그와 작업기록 문서에서 유추한 **초안**입니다. 실제 경험과 다르면 MCP의 `update_item`으로 직접 고쳐주세요.

## 배포 구조

- 프론트엔드: GitHub Pages (`output: "export"` 정적 export, `.github/workflows/deploy.yml`)
- DB: Supabase (`content_items` 테이블, anon key로 브라우저에서 읽기)
- 쓰기: 로컬에서 실행하는 MCP 서버가 service role 키로 직접 씀 (배포 파이프라인과 무관 — 재배포 없이 즉시 반영)
