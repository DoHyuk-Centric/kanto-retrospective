import crypto from "crypto";

const PEOPLE = ["박소유", "김도혁", "이동근", "임태형"] as const;
export type Person = (typeof PEOPLE)[number];

// PINS_JSON은 dotenv.config()가 실행된 뒤에야 값이 채워지므로,
// 모듈 로드 시점이 아니라 호출 시점에 읽어야 한다(import 순서에 안전하게).
function getPins(): Record<string, string> {
  try {
    return JSON.parse(process.env.PINS_JSON ?? "{}");
  } catch {
    console.error("PINS_JSON 파싱 실패 — 유효한 JSON이어야 합니다.");
    return {};
  }
}

const TOKEN_TTL_MS = 12 * 60 * 60 * 1000; // 12시간
const tokens = new Map<string, { person: Person; expiresAt: number }>();

export function isPerson(value: string): value is Person {
  return (PEOPLE as readonly string[]).includes(value);
}

export function login(person: string, pin: string): string | null {
  if (!isPerson(person)) return null;
  const pins = getPins();
  if (!pins[person] || pins[person] !== pin) return null;
  const token = crypto.randomBytes(24).toString("hex");
  tokens.set(token, { person, expiresAt: Date.now() + TOKEN_TTL_MS });
  return token;
}

export function verifyToken(token: string | undefined): Person | null {
  if (!token) return null;
  const entry = tokens.get(token);
  if (!entry) return null;
  if (entry.expiresAt < Date.now()) {
    tokens.delete(token);
    return null;
  }
  return entry.person;
}
