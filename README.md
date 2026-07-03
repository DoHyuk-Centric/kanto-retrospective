# Kanto Retrospective

Kanto 팀(박소유·김도혁·이동근·임태형)의 개발 과정을 정리한 회고/포트폴리오 사이트입니다. 기능구현, 문제해결, 성능개선, AI 도구 활용법, 심화자료(gitflow·코드리뷰 문화·SEO·테스트 전략 등) 5개 섹션으로 구성돼 있습니다.

배포: https://dohyuk-centric.github.io/kanto-retrospective/ (GitHub Pages, `master` push 시 자동 재배포)

## 구성 요소 세 가지

| 구성 | 역할 | 배포 위치 |
| --- | --- | --- |
| `/` (Next.js, 이 저장소 루트) | 프론트엔드. 정적 export로 빌드 | GitHub Pages |
| `server/` | 콘텐츠 API 백엔드 (Express + SQLite) | Render (직접 배포 필요) |
| `mcp-server/` | 팀원이 로컬에서 Claude Code에 연결해 콘텐츠를 쓰는 MCP 서버 | 각자 로컬 실행 |

기능구현 / 문제해결 / AI 도구 활용법 섹션은 한 사람이 여러 개의 항목(기능, 사례 등)을 가지므로 목록형으로 보여지고, 항목을 클릭하면 상세 내용이 나옵니다. 이 목록은 **빌드 시점이 아니라 브라우저에서 백엔드 API를 직접 호출**해서 보여주므로, DB에 항목을 추가/수정하면 프론트엔드를 다시 배포하지 않아도 바로 반영됩니다.

성능개선 / 심화자료 섹션은 기존처럼 `content/` 폴더의 정적 마크다운 파일이며, 고치고 `git push`하면 GitHub Actions가 자동으로 다시 빌드·배포합니다.

## 1. 백엔드 배포 (Render, 최초 1회 · 프로젝트장)

1. [render.com](https://render.com) 가입 → New > Web Service
2. 이 GitHub 저장소 연결, **Root Directory를 `server`로 지정**
3. Build Command: `npm install`, Start Command: `npm start`
4. Environment 탭에서 환경변수 등록:
   ```
   PINS_JSON={"박소유":"본인이 정한 4자리","김도혁":"...","이동근":"...","임태형":"..."}
   ADMIN_SEED_TOKEN=아무 임의의 긴 문자열 (최초 이관 때만 사용)
   CORS_ORIGINS=https://dohyuk-centric.github.io,http://localhost:3000,http://localhost:3100
   ```
5. 배포 후 나오는 URL(`https://xxxx.onrender.com`)을 기억해둡니다.

**⚠️ 중요한 한계**: Render 무료 웹서비스는 디스크가 영속적이지 않을 수 있습니다. 재배포하거나 서비스가 재시작되면 SQLite 파일(`server/data/content.db`)의 내용이 초기화될 수 있습니다. 주기적으로 `GET /items`로 백업을 받아두거나, 데이터가 중요해지면 Render의 유료 Persistent Disk 또는 별도 관리형 DB로 옮기는 걸 권장합니다. 또한 무료 플랜은 15분간 요청이 없으면 슬립 상태가 되어, 첫 요청에 수십 초가 걸릴 수 있습니다.

## 2. 최초 콘텐츠 이관 (Render 배포 후 1회)

기존에 작성해둔 `content/features|troubleshooting|ai-usage/*.md`를 백엔드 DB로 옮깁니다.

```bash
cp .env.local.example .env.local   # API_BASE_URL, ADMIN_SEED_TOKEN 채우기
npm run seed:content
```

이 스크립트는 각 마크다운 파일의 `##` 섹션을 항목 하나씩으로 쪼개서 서버에 넣습니다. 같은 사람·카테고리를 다시 실행하면 기존 항목을 지우고 새로 넣으므로, 이후로는 콘텐츠를 파일이 아니라 MCP로 관리하세요.

## 3. 프론트엔드 로컬 실행

```bash
npm install
# .env.local에 NEXT_PUBLIC_API_BASE_URL=<Render 백엔드 URL> 도 채워져 있어야 합니다
npm run dev
```

`http://localhost:3000`에서 확인합니다. (원본 kanto 프로젝트를 로컬에서 같이 띄운다면 포트가 겹치니 `npm run dev -- -p 3100`처럼 다른 포트를 쓰세요.)

## 4. GitHub Pages 배포에 백엔드 주소 연결

저장소 Settings > Secrets and variables > Actions에서 `NEXT_PUBLIC_API_BASE_URL`을 리포지토리 시크릿으로 등록하세요(Render 배포 URL). `.github/workflows/deploy.yml`이 빌드 시 이 값을 주입합니다.

## 5. MCP로 콘텐츠 추가·수정 (팀원 각자)

`mcp-server/`는 백엔드 API를 호출하는 MCP 서버입니다. Claude Code에 연결하면, 자기 이름 + PIN으로 인증한 뒤 **자기 항목만** 추가/수정/삭제할 수 있습니다.

1. `mcp-server/.env.example`을 `mcp-server/.env`로 복사
2. 본인 값 채우기:
   ```env
   API_BASE_URL=https://xxxx.onrender.com   # 프로젝트장에게 받은 Render 배포 URL
   MCP_PERSON=박소유                          # 본인 이름
   MCP_PIN=1234                              # 프로젝트장에게 받은 본인 PIN
   ```
3. 루트의 `.mcp.json`은 이미 이 MCP 서버를 등록해뒀으므로, 이 저장소를 Claude Code로 열면 자동으로 연결됩니다(`kanto-retrospective-content`).
4. Claude Code에서 다음처럼 사용:
   - `login` 도구에 PIN 입력 → 인증
   - `add_item` 으로 새 항목 추가 (category: features/troubleshooting/ai-usage, title, summary, body)
   - `list_items` 로 본인 또는 다른 사람 항목 목록 확인 (id 확인용, 로그인 불필요)
   - `update_item` 으로 본인 항목만 수정 (다른 사람 항목은 거부됨)
   - `delete_item` 으로 본인 항목만 삭제

PIN은 4자리 숫자로, 강한 보안이 아니라 "실수로 남의 항목을 건드리지 않기 위한" 가벼운 팀 내부 잠금입니다. `mcp-server/.env`는 git에 커밋되지 않으니, 본인 PIN은 카톡/디스코드 등 별도 채널로 프로젝트장에게 직접 받으세요.

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

## 특히 다듬어야 할 부분

AI 도구 활용법 항목들은 커밋 로그와 작업기록 문서에서 유추한 **초안**입니다. 실제 경험과 다르면 MCP의 `update_item`으로 직접 고쳐주세요.

## 로컬 개발 시 백엔드도 같이 띄우기

```bash
cd server
cp .env.example .env   # PINS_JSON 등 채우기 (테스트용 아무 값이나 가능)
npm install
npm run dev
```

기본 포트는 3300이며, 프론트엔드 `.env.local`의 `NEXT_PUBLIC_API_BASE_URL=http://localhost:3300`로 맞추면 로컬 DB로 테스트할 수 있습니다.
