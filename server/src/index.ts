import "./env";
import express from "express";
import cors from "cors";
import crypto from "crypto";
import { db, ContentItem } from "./db";
import { login, verifyToken, isPerson } from "./auth";

const app = express();
app.use(express.json({ limit: "1mb" }));

const allowedOrigins = (process.env.CORS_ORIGINS ??
  "https://dohyuk-centric.github.io,http://localhost:3000,http://localhost:3100"
).split(",").map((s) => s.trim());

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) callback(null, true);
      else callback(new Error("Not allowed by CORS"));
    },
  })
);

const CATEGORIES = ["features", "troubleshooting", "ai-usage"] as const;

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

// 임시 진단용 — PIN 값은 절대 노출하지 않고 파싱 결과만 확인
app.get("/debug/pins-keys", (_req, res) => {
  const raw = process.env.PINS_JSON ?? "";
  try {
    const pins = JSON.parse(raw);
    res.json({
      parsed: true,
      keys: Object.keys(pins),
      pinLengths: Object.fromEntries(
        Object.entries(pins).map(([k, v]) => [k, String(v).length])
      ),
      rawLength: raw.length,
    });
  } catch (e) {
    res.json({ parsed: false, error: String(e), rawLength: raw.length });
  }
});

app.post("/auth/login", (req, res) => {
  const { person, pin } = req.body ?? {};
  if (typeof person !== "string" || typeof pin !== "string") {
    return res.status(400).json({ error: "person, pin이 필요합니다." });
  }
  const token = login(person, pin);
  if (!token) return res.status(401).json({ error: "PIN이 일치하지 않습니다." });
  res.json({ token });
});

app.get("/items", (req, res) => {
  const { category, person } = req.query;
  if (typeof category !== "string" || typeof person !== "string") {
    return res.status(400).json({ error: "category, person 쿼리가 필요합니다." });
  }
  if (!(CATEGORIES as readonly string[]).includes(category)) {
    return res.status(400).json({ error: "잘못된 category입니다." });
  }
  const rows = db
    .prepare(
      `select id, title, summary, sort_order, updated_at from content_items
       where category = ? and person = ? order by sort_order asc`
    )
    .all(category, person);
  res.json(rows);
});

app.get("/items/:id", (req, res) => {
  const row = db
    .prepare(`select * from content_items where id = ?`)
    .get(req.params.id) as ContentItem | undefined;
  if (!row) return res.status(404).json({ error: "항목을 찾을 수 없습니다." });
  res.json(row);
});

function requireAuth(req: express.Request, res: express.Response) {
  const header = req.headers.authorization; // "Bearer <token>"
  const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;
  const person = verifyToken(token);
  if (!person) {
    res.status(401).json({ error: "로그인이 필요합니다." });
    return null;
  }
  return person;
}

app.post("/items", (req, res) => {
  const person = requireAuth(req, res);
  if (!person) return;

  const { category, title, summary, body } = req.body ?? {};
  if (
    typeof category !== "string" ||
    !(CATEGORIES as readonly string[]).includes(category) ||
    typeof title !== "string" ||
    typeof body !== "string"
  ) {
    return res.status(400).json({ error: "category, title, body가 필요합니다." });
  }

  const { count } = db
    .prepare(
      `select count(*) as count from content_items where category = ? and person = ?`
    )
    .get(category, person) as { count: number };

  const id = crypto.randomUUID();
  db.prepare(
    `insert into content_items (id, category, person, title, summary, body, sort_order)
     values (?, ?, ?, ?, ?, ?, ?)`
  ).run(id, category, person, title, summary ?? null, body, count);

  res.status(201).json({ id });
});

app.patch("/items/:id", (req, res) => {
  const person = requireAuth(req, res);
  if (!person) return;

  const existing = db
    .prepare(`select person from content_items where id = ?`)
    .get(req.params.id) as { person: string } | undefined;
  if (!existing) return res.status(404).json({ error: "항목을 찾을 수 없습니다." });
  if (existing.person !== person) {
    return res.status(403).json({
      error: `이 항목은 ${existing.person}의 항목이라 수정할 수 없습니다.`,
    });
  }

  const { title, summary, body } = req.body ?? {};
  const fields: string[] = [];
  const values: unknown[] = [];
  if (title !== undefined) {
    fields.push("title = ?");
    values.push(title);
  }
  if (summary !== undefined) {
    fields.push("summary = ?");
    values.push(summary);
  }
  if (body !== undefined) {
    fields.push("body = ?");
    values.push(body);
  }
  if (fields.length === 0) return res.status(400).json({ error: "수정할 내용이 없습니다." });
  fields.push("updated_at = datetime('now')");

  values.push(req.params.id);
  db.prepare(`update content_items set ${fields.join(", ")} where id = ?`).run(
    ...values
  );
  res.json({ ok: true });
});

app.delete("/items/:id", (req, res) => {
  const person = requireAuth(req, res);
  if (!person) return;

  const existing = db
    .prepare(`select person from content_items where id = ?`)
    .get(req.params.id) as { person: string } | undefined;
  if (!existing) return res.status(404).json({ error: "항목을 찾을 수 없습니다." });
  if (existing.person !== person) {
    return res.status(403).json({
      error: `이 항목은 ${existing.person}의 항목이라 삭제할 수 없습니다.`,
    });
  }

  db.prepare(`delete from content_items where id = ?`).run(req.params.id);
  res.json({ ok: true });
});

// 최초 마크다운 → DB 이관 전용. 일반 운영 중에는 쓰지 않는다.
app.post("/admin/seed", (req, res) => {
  const seedToken = req.headers["x-seed-token"];
  if (!process.env.ADMIN_SEED_TOKEN || seedToken !== process.env.ADMIN_SEED_TOKEN) {
    return res.status(401).json({ error: "seed token이 올바르지 않습니다." });
  }

  const { category, person, items } = req.body ?? {};
  if (
    typeof category !== "string" ||
    !(CATEGORIES as readonly string[]).includes(category) ||
    !isPerson(person) ||
    !Array.isArray(items)
  ) {
    return res.status(400).json({ error: "category, person, items 배열이 필요합니다." });
  }

  const del = db.prepare(
    `delete from content_items where category = ? and person = ?`
  );
  const insert = db.prepare(
    `insert into content_items (id, category, person, title, summary, body, sort_order)
     values (?, ?, ?, ?, ?, ?, ?)`
  );

  const tx = db.transaction(() => {
    del.run(category, person);
    items.forEach((item: { title: string; summary?: string; body: string }, i: number) => {
      insert.run(
        crypto.randomUUID(),
        category,
        person,
        item.title,
        item.summary ?? null,
        item.body,
        i
      );
    });
  });
  tx();

  res.json({ inserted: items.length });
});

const PORT = process.env.PORT ? Number(process.env.PORT) : 3300;
app.listen(PORT, () => {
  console.log(`kanto-retrospective server listening on :${PORT}`);
});
