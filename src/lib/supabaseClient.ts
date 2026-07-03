import { createClient } from "@supabase/supabase-js";

// 빌드 타임(정적 export 프리렌더)에는 NEXT_PUBLIC_ 값이 없어도 모듈 평가가 실패하면 안 되므로
// placeholder를 fallback으로 둔다. 실제 조회는 브라우저에서 진짜 값으로 실행된다.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

export const supabase = createClient(url, anonKey);

export type ContentItem = {
  id: string;
  category: "features" | "troubleshooting" | "ai-usage";
  person: string;
  title: string;
  summary: string | null;
  body: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
};
