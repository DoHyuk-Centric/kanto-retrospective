---
title: 공통 — LCP 이미지가 lazy 로딩되고, 캐시가 4시간마다 사라졌다
summary: 담당 김도혁 · usedgoods·rental·main 목록 공용 컴포넌트 개선, 캐시 TTL 4시간→30일 (P0)
---

usedgoods·rental·main 세 목록형 페이지가 공용 컴포넌트 `ContentCard`를 공유해서, 한 번의 수정으로 세 페이지에 동시에 적용된 개선입니다. ([원본: docs/성능/성능개선/공통-LCP이미지우선순위및캐시TTL.md, 담당 김도혁, P0])

## 문제 1 — 화면에 바로 보이는 첫 카드까지 지연 로딩되고 있었다

과거 커밋(`bab5594`, 목록 이미지 lazy 로딩 + AVIF 적용)에서 `ImageWithFallback`의 `loading="eager"`를 제거하면서, 카드 목록에 `index` 정보가 전혀 전달되지 않는 바람에 **화면에 바로 보이는 첫 카드(LCP 후보)까지 지연 로딩**되고 있었습니다.

`ContentCard`에 `priority?: boolean` prop을 추가해, 실제 첫 화면에 노출되는 만큼만(그리드는 `index < 4`, 세로 스택은 `index === 0`) index 기반으로 부여했습니다. `bab5594`를 되돌리는 방법(화면 밖 이미지까지 즉시 로딩되는 문제 재발), 클라이언트 IntersectionObserver로 동적 priority 부여(하이드레이션 이후라 이미 늦음), 수동 `<link rel=preload>` 추가(중복 구현)는 모두 검토 후 기각했습니다.

## 문제 2 — 이미지 캐시가 4시간마다 만료되고 있었다

`next.config.ts`에 `minimumCacheTTL`을 설정하지 않아 Next.js 기본값(4시간)이 적용되고 있었습니다. main 페이지 성능검사에서 나온 "모바일 이미지 전송 개선 편차가 233KiB↔782KiB로 매우 큼"이라는 현상과 정확히 일치했습니다. `minimumCacheTTL: 60 * 60 * 24 * 30`(30일)로 설정했습니다. 1일 TTL은 개선 효과가 절반에 그쳤고, 1년/immutable은 재업로드 시 URL이 안 바뀔 수 있어 캐시 무효화 리스크가 있어 보류, URL 해시 부여는 후속 과제로 넘겼습니다.

## 검증

git worktree로 별도 작업 트리를 만들어 `npm ci` → `next build`/`next start`(전/후 각각) → Playwright로 DOM 속성(`loading`, `fetchPriority`)과 네트워크 요청 순서를 확인하고, `curl`로 `/_next/image` 응답의 `Cache-Control` 헤더를 대조했습니다.

> "LCP 후보 이미지의 `loading=lazy` → `auto` 전환과 요청 순서 앞당김, 이미지 캐시 수명 4시간 → 30일(180배) 확대를 로컬 프로덕션 빌드로 직접 확인함."

변경 전 usedgoods LCP는 모바일 4.4s / 데스크탑 6.1s 🔴, main 모바일 LCP 4.7s 🔴였습니다. 개선 후 수치는 배포 후 PSI 재측정 예정입니다. 후속 작업으로 "메인 모바일 인기목록 개수 축소(4개 → 2개)"가 예정돼 있습니다.
