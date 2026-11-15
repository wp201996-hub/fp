import { getStore } from "@netlify/blobs";
import { createHash } from "node:crypto";

const sha = (s) => createHash("sha256").update(String(s)).digest("hex");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function authed(store, req) {
  const pw = req.headers.get("x-pw") || "";
  const saved = await store.get("auth");
  const ok = saved ? sha(pw) === saved : pw === (process.env.EDIT_PASSWORD || "changeme");
  if (!ok) await sleep(800);
  return ok;
}

export default async (req) => {
  const store = getStore("peraichi");
  const path = new URL(req.url).pathname;
  if (path === "/api/page" && req.method === "GET") {
    const data = await store.get("page", { type: "json" });
    return new Response(JSON.stringify(data || {}), {
      headers: { "content-type": "application/json", "cache-control": "no-store" },
    });
  }
  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 });
  if (!(await authed(store, req))) return new Response("unauthorized", { status: 401 });
  if (path === "/api/login") return new Response("ok");
  let body;
  try { body = await req.json(); } catch { return new Response("bad json", { status: 400 }); }
  if (path === "/api/page") {
    if (!body || !Array.isArray(body.blocks)) return new Response("bad data", { status: 400 });
    delete body.pw;
    await store.setJSON("page", body);
    return new Response("ok");
  }
  if (path === "/api/password") {
    if (typeof body.pw !== "string" || body.pw.length < 6) return new Response("too short", { status: 400 });
    await store.set("auth", sha(body.pw));
    return new Response("ok");
  }
  return new Response("Not Found", { status: 404 });
};

export const config = { path: ["/api/page", "/api/login", "/api/password"] };
