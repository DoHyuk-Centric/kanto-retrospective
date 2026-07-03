---
title: Gitflow 전략 — GitHub Flow와 엄격한 핫픽스 룰
summary: develop 통합 브랜치, feature/fix 브랜치, 그리고 hotfix-kanto-{이슈번호} 규칙
---

## 기본 브랜치 전략

시안 발표 대본에서 팀은 이를 "GitHub Flow"로 명명했습니다.

> "협업 방식으로는 GitHub Flow를 기반으로 develop 브랜치를 공통 통합 브랜치로 두고, 기능마다 feature/, fix/ 브랜치를 분리해 작업했습니다."

- 통합 브랜치는 `develop`(보호 브랜치, 직접 push 금지, PR 필수)
- 브랜치명: `<타입>/<작업내용>` (예: `feature/usedgoods-list`, `fix/like-rollback`)
- 커밋: `<type>: <설명>` — `feat`/`fix`/`refactor`/`chore`/`bug`, 제목 50자 이내, 명령형
- PR 템플릿에 "새 패턴/리팩토링" 칸이 있어, 새 훅·컴포넌트 구조를 도입하면 팀에 공유하도록 유도

## 핫픽스 규칙

[원본: docs/hotfix-rules.md]

- 브랜치 네이밍: `hotfix-kanto-{이슈번호}` (예: `hotfix-kanto-121`)
- 범위 제한 — 해당 이슈의 버그 수정만 커밋(기능 추가·리팩토링 금지)
- 베이스는 `develop`에서 분기, 완료 후 `develop`으로 PR
- 커밋 메시지는 `fix: 수정 내용 한 줄 요약` 형식
- PR 전 로컬에서 실제 동작 확인 필수, 최소 1인 승인 필요
- 금지 사항: 관련 없는 파일 수정, 스타일/포맷 정리 포함, 여러 이슈를 하나의 핫픽스 브랜치에서 처리

## CI 게이트의 역사도 브랜치 전략의 일부

1차 리뷰부터 6차까지 매 회차 "머지 전 tsc/build CI 게이트"가 권고됐지만 미도입 상태였고, 9차(2026-06-19)에 `.github/workflows/ci.yml`이 처음 생겨 `tsc --noEmit` + `next build`를 PR 필수 체크로 걸었습니다. 다만 16차 리뷰까지 이 게이트는 `tsc`/`build`만 다루고 `eslint`는 빠져 있어, 9개의 eslint 에러가 그냥 통과한다는 점이 마지막까지 지적으로 남았습니다. ([더 자세한 리뷰 흐름은 리뷰 문화 페이지 참고](/strategy/리뷰문화))

## 실제 커밋 통계로 본 역할 분담

전체 커밋의 병합(merge) 비중을 보면 팀장 박소유가 253건 중 133건(약 절반)을 PR 머지에 썼습니다 — 팀장이 게이트키퍼 역할을 실질적으로 수행했다는 뜻입니다. 나머지 팀원(김도혁, 이동근, 임태형)은 대부분 `feat:`/`fix:`/`refactor:` 접두어를 붙인 커밋으로 기여했고, 강사(계정명 urstory)의 19개 커밋은 전부 코드 리뷰 문서였습니다.
