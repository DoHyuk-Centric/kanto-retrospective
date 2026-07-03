---
title: 전역 — 방문자 10명 중 9명이 쓰지 않을 기능의 비용을 전부 지불하고 있었다
summary: 담당 임태형 · Sentry Session Replay를 초기 번들에서 분리, main-app 엔트리 85.6KB 감량 (P0~P2)
---

## 문제 정의

[원본: docs/성능/성능개선/전역-sentry지연로딩.md, 담당 임태형]

클라이언트 Sentry 초기화(`src/instrumentation-client.ts`)가 `Sentry.replayIntegration()`을 정적으로 포함하고 있었습니다. Session Replay 번들(rrweb 포함, minified 300KB+)이 하이드레이션 전 초기 JS(main-app 엔트리)에 들어가 있었던 것입니다. main-app 엔트리는 모든 페이지가 공통으로 로드하다 보니, **성능검사 12개 문서 전부**에서 "사용하지 않는 자바스크립트 줄이기" 185~407KiB가 공통으로 지적됐습니다(go 406~407KiB, usedgoodsid 255~257KiB, login 220KiB, signup 219KiB, usedgoods 204KiB, job 202KiB, main 202KiB 등).

> "세션 리플레이는 방문자의 10%만 녹화 대상인데(`replaysSessionSampleRate: 0.1`), 그 녹화용 코드는 전체 방문자가 초기 로드에서 다운로드·실행하고 있었음 — 10명 중 9명은 쓰지 않을 기능의 비용을 지불하는 구조."

레거시 `sentry.client.config.ts`가 `instrumentation-client.ts`와 공존하며 동일한 `Sentry.init()` + Replay 정적 포함을 중복 선언하고 있었던 것도 추가로 발견했습니다.

## 개선

`Sentry.init()`은 즉시 실행을 유지해 초기 에러 이벤트 유실을 막고, `replayIntegration()`의 정적 포함만 제거했습니다. Replay는 `window` `load` 이벤트 + `requestIdleCallback`(폴백 `setTimeout 3s`) 시점에 동적 `import()`로 로드한 뒤 `Sentry.addIntegration()`으로 추가하도록 바꿨습니다. `enabled: process.env.NODE_ENV === "production"`도 추가하고, 레거시 설정 파일은 삭제했습니다.

`Sentry.lazyLoadIntegration`(서드파티 CDN 스크립트 주입이라 광고차단기·CSP 문제 우려), `tracesSampleRate` 조정(런타임 옵션이라 번들 크기와 무관), `Sentry.init` 전체를 idle로 지연(init 전 에러 완전 유실 리스크)은 모두 검토 후 기각했습니다. 트레이드오프도 명확히 남겼습니다 — "Replay 로드 전(페이지 로드~idle 사이) 발생한 에러는 이벤트는 정상 수신되지만 리플레이 영상이 없다."

## 실측 결과

로컬 프로덕션 빌드(Turbopack, build-manifest 기준, 2026-07-02 측정)로 직접 확인했습니다.

| 항목 | 개선 전 | 개선 후 |
|---|---|---|
| main-app 엔트리 JS 합계 | 819.6 KB | **734.0 KB (−85.6 KB)** |
| Replay 코드 위치 | 537.5 KB 엔트리 청크에 포함 | **331.1 KB 비동기 청크로 분리** |
| 초기 HTML의 Replay 청크 참조 | 있음 | **없음** |

렌더링 차단 요청(CSS 추정, 페이지별 150~730ms), 레거시 JavaScript 15KiB, 목록 페이지 이미지 전송 대용량 절감분의 완전한 해소는 이번 개선 범위 밖으로 남겨뒀습니다.
