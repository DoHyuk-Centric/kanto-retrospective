/**
 * content/{features,troubleshooting,ai-usage}/{사람}.md 를 읽어
 * H2(##) 섹션 단위로 쪼갠 뒤 Supabase content_items 테이블에 넣습니다.
 *
 * 실행: npx tsx scripts/migrate-content-to-supabase.ts
 * 필요 env(.env.local): SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 *
 * 같은 category+person을 다시 실행하면 기존 행을 지우고 새로 넣습니다(재실행 안전).
 */
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: path.join(process.cwd(), ".env.local") });

const SUPABASE_URL =
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    "SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY가 .env.local에 없습니다."
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const CATEGORIES = ["features", "troubleshooting", "ai-usage"] as const;
const PEOPLE = ["박소유", "김도혁", "이동근", "임태형"] as const;

type Item = {
  category: string;
  person: string;
  title: string;
  summary: string | null;
  body: string;
  sort_order: number;
};

function splitIntoItems(
  category: string,
  person: string,
  content: string
): Item[] {
  // "## " 로 시작하는 줄 기준으로 섹션을 나눈다. 그 앞의 인트로 문단은 버린다.
  const lines = content.split("\n");
  const sections: { title: string; bodyLines: string[] }[] = [];
  let current: { title: string; bodyLines: string[] } | null = null;

  for (const line of lines) {
    const h2 = line.match(/^##\s+(.*)$/);
    if (h2) {
      if (current) sections.push(current);
      current = { title: h2[1].trim(), bodyLines: [] };
    } else if (current) {
      current.bodyLines.push(line);
    }
  }
  if (current) sections.push(current);

  return sections.map((s, i) => {
    const body = s.bodyLines.join("\n").trim();
    const firstParagraph = body.split(/\n\s*\n/)[0]?.replace(/\n/g, " ") ?? "";
    const summary =
      firstParagraph.length > 120
        ? firstParagraph.slice(0, 117) + "..."
        : firstParagraph || null;
    return {
      category,
      person,
      title: s.title,
      summary,
      body,
      sort_order: i,
    };
  });
}

async function main() {
  for (const category of CATEGORIES) {
    for (const person of PEOPLE) {
      const filePath = path.join(
        process.cwd(),
        "content",
        category,
        `${person}.md`
      );
      if (!fs.existsSync(filePath)) {
        console.warn(`(건너뜀) 없음: ${filePath}`);
        continue;
      }
      const raw = fs.readFileSync(filePath, "utf-8");
      const { content } = matter(raw);
      const items = splitIntoItems(category, person, content);

      const { error: delErr } = await supabase
        .from("content_items")
        .delete()
        .eq("category", category)
        .eq("person", person);
      if (delErr) {
        console.error(`삭제 실패 ${category}/${person}:`, delErr.message);
        continue;
      }

      if (items.length === 0) continue;

      const { error: insErr } = await supabase
        .from("content_items")
        .insert(items);
      if (insErr) {
        console.error(`삽입 실패 ${category}/${person}:`, insErr.message);
      } else {
        console.log(`✓ ${category}/${person}: ${items.length}개 항목`);
      }
    }
  }
}

main().then(() => {
  console.log("완료");
  process.exit(0);
});
