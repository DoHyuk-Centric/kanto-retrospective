/**
 * content/{features,troubleshooting,ai-usage}/{사람}.md 를 읽어
 * H2(##) 섹션 단위로 쪼갠 뒤 백엔드 서버의 /admin/seed 엔드포인트로 이관합니다.
 *
 * 실행: npx tsx scripts/seed-content.ts
 * 필요 env(.env.local): API_BASE_URL, ADMIN_SEED_TOKEN
 *
 * 같은 category+person을 다시 실행하면 서버가 기존 항목을 지우고 새로 넣습니다(재실행 안전).
 */
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import dotenv from "dotenv";

dotenv.config({ path: path.join(process.cwd(), ".env.local") });

const API_BASE_URL = process.env.API_BASE_URL;
const ADMIN_SEED_TOKEN = process.env.ADMIN_SEED_TOKEN;

if (!API_BASE_URL || !ADMIN_SEED_TOKEN) {
  console.error("API_BASE_URL / ADMIN_SEED_TOKEN이 .env.local에 없습니다.");
  process.exit(1);
}

const CATEGORIES = ["features", "troubleshooting", "ai-usage"] as const;
const PEOPLE = ["박소유", "김도혁", "이동근", "임태형"] as const;

type Item = { title: string; summary: string | null; body: string };

function splitIntoItems(content: string): Item[] {
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

  return sections.map((s) => {
    const body = s.bodyLines.join("\n").trim();
    // "[원본: ...]" 같은 인용 전용 문단은 건너뛰고 실제 서술 문단을 요약으로 쓴다.
    const paragraphs = body.split(/\n\s*\n/);
    const firstProseParagraph =
      paragraphs.find((p) => !/^\[.*\]$/.test(p.trim())) ?? paragraphs[0] ?? "";
    const firstParagraph = firstProseParagraph.replace(/\n/g, " ");
    const summary =
      firstParagraph.length > 120
        ? firstParagraph.slice(0, 117) + "..."
        : firstParagraph || null;
    return { title: s.title, summary, body };
  });
}

async function main() {
  for (const category of CATEGORIES) {
    for (const person of PEOPLE) {
      const filePath = path.join(process.cwd(), "content", category, `${person}.md`);
      if (!fs.existsSync(filePath)) {
        console.warn(`(건너뜀) 없음: ${filePath}`);
        continue;
      }
      const raw = fs.readFileSync(filePath, "utf-8");
      const { content } = matter(raw);
      const items = splitIntoItems(content);
      if (items.length === 0) continue;

      const res = await fetch(`${API_BASE_URL}/admin/seed`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-seed-token": ADMIN_SEED_TOKEN!,
        },
        body: JSON.stringify({ category, person, items }),
      });
      const body = await res.json();
      if (!res.ok) {
        console.error(`실패 ${category}/${person}:`, body.error);
      } else {
        console.log(`✓ ${category}/${person}: ${body.inserted}개 항목`);
      }
    }
  }
}

main().then(() => {
  console.log("완료");
});
