import path from "path";
import dotenv from "dotenv";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

dotenv.config({ path: path.join(__dirname, "..", ".env") });

const PEOPLE = ["박소유", "김도혁", "이동근", "임태형"] as const;
const CATEGORIES = ["features", "troubleshooting", "ai-usage"] as const;

const API_BASE_URL = process.env.API_BASE_URL;
const MCP_PERSON = process.env.MCP_PERSON;
const MCP_PIN = process.env.MCP_PIN;

if (!API_BASE_URL) {
  console.error("API_BASE_URL이 .env에 없습니다.");
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

// 이 프로세스가 살아있는 동안만 유지되는 토큰 (재시작 시 다시 login 필요)
let sessionToken: string | null = null;

function text(s: string) {
  return { content: [{ type: "text" as const, text: s }] };
}

async function api(
  path: string,
  init?: RequestInit
): Promise<{ ok: boolean; status: number; body: unknown }> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {}),
      ...(init?.headers ?? {}),
    },
  });
  const body = await res.json().catch(() => null);
  return { ok: res.ok, status: res.status, body };
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
    if (pin !== MCP_PIN) return text("PIN이 일치하지 않습니다.");
    const { ok, body } = await api("/auth/login", {
      method: "POST",
      body: JSON.stringify({ person, pin }),
    });
    if (!ok) {
      return text(
        `서버 인증 실패: ${(body as { error?: string })?.error ?? "알 수 없는 오류"}`
      );
    }
    sessionToken = (body as { token: string }).token;
    return text(`인증 성공. ${person}(으)로 로그인되었습니다.`);
  }
);

server.registerTool(
  "logout",
  {
    title: "로그아웃",
    description: "현재 세션의 인증 상태를 해제합니다.",
  },
  async () => {
    sessionToken = null;
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
    return text(`person=${person}, authenticated=${sessionToken ? "예" : "아니오"}`);
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
    const { ok, body } = await api(
      `/items?category=${encodeURIComponent(category)}&person=${encodeURIComponent(targetPerson)}`
    );
    if (!ok) return text(`조회 실패: ${(body as { error?: string })?.error}`);
    const items = body as unknown[];
    if (!items || items.length === 0) return text("등록된 항목이 없습니다.");
    return text(JSON.stringify(items, null, 2));
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
    if (!sessionToken) return text("로그인이 필요합니다. login 도구를 먼저 사용하세요.");
    const { ok, body: resBody } = await api("/items", {
      method: "POST",
      body: JSON.stringify({ category, title, summary, body }),
    });
    if (!ok) return text(`추가 실패: ${(resBody as { error?: string })?.error}`);
    return text(`추가되었습니다. id=${(resBody as { id: string }).id}`);
  }
);

server.registerTool(
  "update_item",
  {
    title: "항목 수정",
    description: `로그인한 본인(${person}) 소유의 항목만 수정할 수 있습니다.`,
    inputSchema: {
      itemId: z.string(),
      title: z.string().optional(),
      summary: z.string().optional(),
      body: z.string().optional(),
    },
  },
  async ({ itemId, title, summary, body }) => {
    if (!sessionToken) return text("로그인이 필요합니다. login 도구를 먼저 사용하세요.");
    const { ok, body: resBody } = await api(`/items/${encodeURIComponent(itemId)}`, {
      method: "PATCH",
      body: JSON.stringify({ title, summary, body }),
    });
    if (!ok) return text(`수정 실패: ${(resBody as { error?: string })?.error}`);
    return text("수정되었습니다.");
  }
);

server.registerTool(
  "delete_item",
  {
    title: "항목 삭제",
    description: `로그인한 본인(${person}) 소유의 항목만 삭제할 수 있습니다.`,
    inputSchema: { itemId: z.string() },
  },
  async ({ itemId }) => {
    if (!sessionToken) return text("로그인이 필요합니다. login 도구를 먼저 사용하세요.");
    const { ok, body: resBody } = await api(`/items/${encodeURIComponent(itemId)}`, {
      method: "DELETE",
    });
    if (!ok) return text(`삭제 실패: ${(resBody as { error?: string })?.error}`);
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
