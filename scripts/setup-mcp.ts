/**
 * 팀원이 mcp-server/.env를 직접 편집하지 않고도 대화형으로 설정할 수 있게 해주는 스크립트.
 * 실행: npm run setup:mcp
 */
import fs from "fs";
import path from "path";
import readline from "readline/promises";

const PEOPLE = ["박소유", "김도혁", "이동근", "임태형"] as const;
const DEFAULT_API_BASE_URL = "https://kanto-retrospective-1.onrender.com";

async function main() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  console.log("Kanto Retrospective MCP 설정\n");
  console.log("본인 번호를 입력하세요:");
  PEOPLE.forEach((p, i) => console.log(`  ${i + 1}. ${p}`));

  let person: string | undefined;
  while (!person) {
    const answer = (await rl.question("> ")).trim();
    const idx = Number(answer) - 1;
    if (idx >= 0 && idx < PEOPLE.length) person = PEOPLE[idx];
    else console.log("1~4 중 하나를 입력해주세요.");
  }

  let pin = "";
  while (!/^\d{4}$/.test(pin)) {
    pin = (await rl.question("본인 4자리 PIN을 입력하세요: ")).trim();
    if (!/^\d{4}$/.test(pin)) console.log("숫자 4자리여야 합니다.");
  }

  const apiBaseAnswer = (
    await rl.question(`백엔드 API 주소 (엔터 시 기본값 사용: ${DEFAULT_API_BASE_URL}): `)
  ).trim();
  const apiBaseUrl = apiBaseAnswer || DEFAULT_API_BASE_URL;

  rl.close();

  const envPath = path.join(process.cwd(), "mcp-server", ".env");
  const content = `API_BASE_URL=${apiBaseUrl}\nMCP_PERSON=${person}\nMCP_PIN=${pin}\n`;
  fs.writeFileSync(envPath, content, "utf-8");

  console.log(`\n✓ ${envPath} 생성 완료 (git에는 커밋되지 않습니다).`);
  console.log("이제 Claude Code로 이 폴더를 열면 MCP 서버가 자동으로 연결됩니다.");
  console.log('연결 확인은 Claude Code에서 "/mcp" 명령으로 할 수 있습니다.');
}

main();
