import path from "path";
import dotenv from "dotenv";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

dotenv.config({ path: path.join(__dirname, "..", ".env") });

const PEOPLE = ["박소유", "김도혁", "이동근", "임태형"] as const;
const CATEGORIES = ["features", "troubleshooting", "ai-usage"] as const;

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const MCP_PERSON = process.env.MCP_PERSON;
const MCP_PIN = process.env.MCP_PIN;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY가 .env에 없습니다.");
  process.exit(1);
}
if (!MCP_PERSON || !(PEOPLE as readonly string[]).includes(MCP_PERSON)) {
  console.error(
    `MCP_PERSON이 올바르지 않습니다. 다음 중 하나여야 합니다: ${PEOPLE.join(", ")}`
  );
  process.exit(1);
}
if (!MCP_PIN) {
  console.error("MCP_PIN이 .env에 없습니다.");
  process.exit(1);
}

const person = MCP_PERSON as (typeof PEOPLE)[number];
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

// 이 프로세스가 살아있는 동안만 유지되는 로그인 상태 (프로세스 재시작 시 다시 로그인 필요)
let authenticated = false;

function text(s: string) {
  return { content: [{ type: "text" as const, text: s }] };
}

const server = new McpServer({
  name: "kanto-retrospective-content",
  version: "1.0.0",
});

server.registerTool(
  "login",
  {
    title: "로그인",
    description:
      "본인 PIN을 입력해 인증합니다. 인증 후에만 add_item/update_item/delete_item을 쓸 수 있습니다.",
    inputSchema: { pin: z.string().describe("4자리 PIN") },
  },
  async ({ pin }) => {
    if (pin === MCP_PIN) {
      authenticated = true;
      return text(`인증 성공. ${person}(으)로 로그인되었습니다.`);
    }
    return text("PIN이 일치하지 않습니다.");
  }
);

server.registerTool(
  "logout",
  {
    title: "로그아웃",
    description: "현재 세션의 인증 상태를 해제합니다.",
  },
  async () => {
    authenticated = false;
    return text("로그아웃되었습니다.");
  }
);

server.registerTool(
  "whoami",
  {
    title: "내 정보 확인",
    description: "이 MCP 서버가 어떤 사람으로 설정되어 있고 인증 상태인지 확인합니다.",
  },
  async () => {
    return text(
      `person=${person}, authenticated=${authenticated ? "예" : "아니오"}`
    );
  }
);

server.registerTool(
  "list_items",
  {
    title: "항목 목록 조회",
    description:
      "특정 카테고리·인물의 콘텐츠 항목 목록을 조회합니다(로그인 불필요, 읽기 전용).",
    inputSchema: {
      category: z.enum(CATEGORIES),
      person: z.enum(PEOPLE),
    },
  },
  async ({ category, person: targetPerson }) => {
    const { data, error } = await supabase
      .from("content_items")
      .select("id, title, summary, sort_order, updated_at")
      .eq("category", category)
      .eq("person", targetPerson)
      .order("sort_order", { ascending: true });

    if (error) return text(`조회 실패: ${error.message}`);
    if (!data || data.length === 0) return text("등록된 항목이 없습니다.");
    return text(JSON.stringify(data, null, 2));
  }
);

server.registerTool(
  "add_item",
  {
    title: "항목 추가",
    description: `로그인한 본인(${person}) 이름으로 새 항목을 추가합니다. 로그인이 필요합니다.`,
    inputSchema: {
      category: z.enum(CATEGORIES),
      title: z.string(),
      summary: z.string().optional(),
      body: z.string().describe("마크다운 본문"),
    },
  },
  async ({ category, title, summary, body }) => {
    if (!authenticated) return text("로그인이 필요합니다. login 도구를 먼저 사용하세요.");

    const { count } = await supabase
      .from("content_items")
      .select("id", { count: "exact", head: true })
      .eq("category", category)
      .eq("person", person);

    const { data, error } = await supabase
      .from("content_items")
      .insert({
        category,
        person,
        title,
        summary: summary ?? null,
        body,
        sort_order: count ?? 0,
      })
      .select("id")
      .single();

    if (error) return text(`추가 실패: ${error.message}`);
    return text(`추가되었습니다. id=${data.id}`);
  }
);

server.registerTool(
  "update_item",
  {
    title: "항목 수정",
    description: `로그인한 본인(${person}) 소유의 항목만 수정할 수 있습니다.`,
    inputSchema: {
      itemId: z.string().uuid(),
      title: z.string().optional(),
      summary: z.string().optional(),
      body: z.string().optional(),
    },
  },
  async ({ itemId, title, summary, body }) => {
    if (!authenticated) return text("로그인이 필요합니다. login 도구를 먼저 사용하세요.");

    const { data: existing, error: fetchErr } = await supabase
      .from("content_items")
      .select("person")
      .eq("id", itemId)
      .single();

    if (fetchErr || !existing) return text("해당 항목을 찾을 수 없습니다.");
    if (existing.person !== person) {
      return text(`이 항목은 ${existing.person}의 항목이라 수정할 수 없습니다.`);
    }

    const update: Record<string, string> = {};
    if (title !== undefined) update.title = title;
    if (summary !== undefined) update.summary = summary;
    if (body !== undefined) update.body = body;
    if (Object.keys(update).length === 0) return text("수정할 내용이 없습니다.");

    const { error } = await supabase
      .from("content_items")
      .update(update)
      .eq("id", itemId);

    if (error) return text(`수정 실패: ${error.message}`);
    return text("수정되었습니다.");
  }
);

server.registerTool(
  "delete_item",
  {
    title: "항목 삭제",
    description: `로그인한 본인(${person}) 소유의 항목만 삭제할 수 있습니다.`,
    inputSchema: { itemId: z.string().uuid() },
  },
  async ({ itemId }) => {
    if (!authenticated) return text("로그인이 필요합니다. login 도구를 먼저 사용하세요.");

    const { data: existing, error: fetchErr } = await supabase
      .from("content_items")
      .select("person")
      .eq("id", itemId)
      .single();

    if (fetchErr || !existing) return text("해당 항목을 찾을 수 없습니다.");
    if (existing.person !== person) {
      return text(`이 항목은 ${existing.person}의 항목이라 삭제할 수 없습니다.`);
    }

    const { error } = await supabase.from("content_items").delete().eq("id", itemId);
    if (error) return text(`삭제 실패: ${error.message}`);
    return text("삭제되었습니다.");
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
