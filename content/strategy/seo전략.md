---
title: SEO 전략 — "다섯 조 중 인프라가 가장 단단하다"는 평가
summary: sitemap·robots·JSON-LD·동적 OG 이미지, 그리고 실제로 잡힌 서버/클라이언트 경계 버그
---

14차 리뷰(부제 "공개 페이지 SEO 점검", [원본: review/202606290959-리뷰.md])와 `review/seo-가이드.md`가 핵심 자료입니다.

## 평가

> "Kanto는 다섯 조 중 SEO 인프라가 가장 단단합니다. sitemap·robots·metadataBase·title.template에 더해 상세 라우트마다 generateMetadata와 JSON-LD, 동적 opengraph-image까지 갖춰져 있어서, 이 부분은 강하게 칭찬할 만합니다."

구체적으로 갖춘 것: 목록/상세 페이지가 서버 컴포넌트에서 데이터를 받아 크롤러에게 "채워진 HTML"을 전달, 상세 라우트별 `metadata.ts` 분리와 `generateMetadata`로 제목·설명·OG 이미지·canonical 생성, Product·JobPosting·Organization 스키마의 JSON-LD, 동적 `opengraph-image.tsx`, `metadataBase`/`title.template`, `sitemap.ts`/`robots.ts`, 구글·네이버 verification 파일. ([구현 상세는 김도혁의 기능구현 페이지 참고](/features/김도혁))

## 점검 중 발견되어 개선된 문제

**14차 발견(필수)**: "`main/page.tsx:2`에서 `useTranslations`(next-intl, 클라이언트 훅)를 서버 컴포넌트에서 호출하고 있어 런타임 에러로 이어지고, 메인은 사이트의 얼굴이라 여기서 깨지면 크롤러가 에러 페이지를 보게 됩니다."

**15차 해결 확인**: "main/page.tsx가 서버 컴포넌트인데 클라 훅 useTranslations를 top-level 호출 → 해결: `getTranslations`(next-intl/server)로 전환, await로 받습니다."

같은 14차 회차에서 `job/[id]/page.tsx`·`rental/[id]/page.tsx`에 JSON-LD `<script>` 삽입 과정에서 닫히지 않은 `<div>`가 남아 JSX 구조가 깨졌던 문제도 15차에 해결이 확인됐습니다.

## SEO 가이드의 체크리스트 요지

`review/seo-가이드.md`는 검색 노출 대상 페이지가 `'use client'` + `useEffect` 데이터 패칭을 피하고 서버 컴포넌트로 HTML에 데이터를 박아 내려야 한다는 원칙("SEO의 출발점은 디자인이 아니라 서버가 내려주는 HTML에 의미 있는 정보가 들어있는가")을 강조합니다. 그리고 "잘 됐는지 확인하는 법 — 추측하지 말고 직접 본다"며 `curl`로 서버 원문을 직접 확인하는 습관을 권합니다.
