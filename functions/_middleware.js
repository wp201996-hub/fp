const sha = async (s) =>
  [...new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(String(s))))]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

export async function onRequest({ request, env, next }) {
  const path = new URL(request.url).pathname;
  if (!path.startsWith("/api/")) return next();
  const kv = env.PAGE_KV;
  if (!kv) return new Response("KV is not set", { status: 500 });

  if (path === "/api/page" && request.method === "GET") {
    const data = await kv.get("page");
    return new Response(data || "{}", {
      headers: { "content-type": "application/json", "cache-control": "no-store" },
    });
  }
  if (request.method !== "POST") return new Response("Method Not Allowed", { status: 405 });

  const pw = request.headers.get("x-pw") || "";
  const saved = await kv.get("auth");
  const ok = saved ? (await sha(pw)) === saved : pw === (env.EDIT_PASSWORD || "changeme");
  if (!ok) {
    await new Promise((r) => setTimeout(r, 800));
    return new Response("unauthorized", { status: 401 });
  }
  if (path === "/api/login") return new Response("ok");

  let body;
  try { body = await request.json(); } catch { return new Response("bad json", { status: 400 }); }

  if (path === "/api/page") {
    if (!body || !Array.isArray(body.blocks)) return new Response("bad data", { status: 400 });
    delete body.pw;
    await kv.put("page", JSON.stringify(body));
    return new Response("ok");
  }
  if (path === "/api/password") {
    if (typeof body.pw !== "string" || body.pw.length < 6) return new Response("too short", { status: 400 });
    await kv.put("auth", await sha(body.pw));
    return new Response("ok");
  }
  return new Response("Not Found", { status: 404 });
}
