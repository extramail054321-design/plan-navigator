const H = { "content-type": "application/json" };
const out = (s, o) => ({ statusCode: s, headers: H, body: JSON.stringify(o) });
exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return out(405, { error: "POST only" });
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return out(500, { error: "Server missing ANTHROPIC_API_KEY" });
  if ((event.body || "").length > 5.5e6) return out(413, { error: "Image too large" });
  let b;
  try { b = JSON.parse(event.body); } catch { return out(400, { error: "Bad JSON" }); }
  if (!b.image || typeof b.image !== "string" || !b.w || !b.h) return out(400, { error: "image, w, h required" });
  const prompt = `Floor plan image, ${b.w}x${b.h} px. Return ONLY compact JSON, no prose, no markdown: {"rooms":[{"label":"text read from plan or Room N","polygon":[[x,y],...]}]}. One polygon per enclosed room, 4-12 vertices, pixel coordinates of this image, no overlaps.`;
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), 9000);
  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST", signal: ctl.signal,
      headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || "claude-sonnet-5-5", max_tokens: 4000,
        messages: [{ role: "user", content: [
          { type: "image", source: { type: "base64", media_type: "image/jpeg", data: b.image } },
          { type: "text", text: prompt }] }]
      })
    });
    const txt = await r.text();
    if (!r.ok) return out(502, { error: "Upstream error " + r.status });
    return { statusCode: 200, headers: H, body: txt };
  } catch (e) {
    return out(e.name === "AbortError" ? 502 : 500, { error: e.name === "AbortError" ? "AI timed out, retry" : "Server error" });
  } finally { clearTimeout(t); }
};
