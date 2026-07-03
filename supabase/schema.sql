-- Kanto Retrospective: content_items 테이블
-- 기능구현 / 문제해결 / AI 도구 활용법 섹션의 인물별 항목을 저장합니다.
-- 성능개선/심화자료 섹션은 그대로 content/ 폴더의 정적 마크다운 파일을 사용합니다.

create table if not exists content_items (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('features', 'troubleshooting', 'ai-usage')),
  person text not null check (person in ('박소유', '김도혁', '이동근', '임태형')),
  title text not null,
  summary text,
  body text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists content_items_category_person_idx
  on content_items (category, person, sort_order);

alter table content_items enable row level security;

-- 읽기는 누구나(anon key) 가능 — 사이트가 브라우저에서 직접 조회합니다.
drop policy if exists "public can read content_items" on content_items;
create policy "public can read content_items"
  on content_items for select
  using (true);

-- insert/update/delete 정책은 의도적으로 만들지 않습니다.
-- 쓰기는 MCP 서버가 service_role 키로만 수행합니다(RLS 우회, PIN 인증은 MCP 서버가 담당).

-- updated_at 자동 갱신
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists content_items_set_updated_at on content_items;
create trigger content_items_set_updated_at
  before update on content_items
  for each row
  execute function set_updated_at();
