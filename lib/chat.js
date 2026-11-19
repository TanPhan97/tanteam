// Nhắn tin từ văn phòng tới agent.
// - Trên máy này (localhost, không qua đường hầm): gửi thẳng. Từ xa (điện thoại qua đường hầm, máy khác trong mạng): cần mã PIN 6 số.
// - Tin đi vào hòm thư của agent (data/hop-thu/<tên>.jsonl). Agent đọc bằng `vp tiep --toi "<tên>"` ở cuối mỗi lượt (xem HUONG-DAN-CHO-AGENT.md),
//   làm xong thì `vp xong <mã>`. Văn phòng hiện trạng thái: chờ đọc → đã đọc → đã xong.
// - PIN nằm ở ~/.van-phong-ao/pin.txt (ngoài thư mục mã nguồn), chỉ hiện trên chính máy này.
"use strict";
const fs = require("fs");
const path = require("path");
const os = require("os");
const crypto = require("crypto");
const mailbox = require("./mailbox");
const hopthu = require("./hopthu");

const PIN_FILE = path.join(os.homedir(), ".van-phong-ao", "pin.txt");
function pin() {
  try { const p = fs.readFileSync(PIN_FILE, "utf8").trim(); if (/^\d{6}$/.test(p)) return p; } catch {}
  const p = String(crypto.randomInt(0, 1e6)).padStart(6, "0");
  fs.mkdirSync(path.dirname(PIN_FILE), { recursive: true }); fs.writeFileSync(PIN_FILE, p);
  return p;
}
// Máy này: địa chỉ vòng lặp và không có dấu của Cloudflare (đường hầm điện thoại).
// Chống DNS rebinding: Host phải là tên vòng lặp, nếu không thì không coi là "máy này" (phải nhập PIN, không lộ PIN).
const LOOP_HOST = /^(localhost|127\.0\.0\.1|\[::1\])$/i;
function hostOk(req) {
  const h = String(req.headers.host || "").replace(/:\d+$/, "");
  return LOOP_HOST.test(h);
}
function isLocal(req) {
  const a = req.socket.remoteAddress || "";
  return /^(::1|127\.0\.0\.1|::ffff:127\.0\.0\.1)$/.test(a) && !req.headers["cf-ray"] && !req.headers["cf-connecting-ip"] && hostOk(req);
}
// Chống CSRF: nếu có Origin thì phải cùng Host với máy chủ (trang web lạ không gửi được tin).
function sameOrigin(req) {
  const o = req.headers.origin; if (!o) return true;
  try { return new URL(o).host === String(req.headers.host || ""); } catch { return false; }
}
// Mọi lần nhập sai PIN đều được đếm (giao diện tự xóa PIN sai nên không tự khóa mình). Sai 5 lần trong 10 phút thì khóa thiết bị đó 10 phút.
const wrong = new Map();
function authorized(req) {
  if (isLocal(req)) return { ok: true };
  const who = String(req.headers["cf-connecting-ip"] || req.socket.remoteAddress || "?");
  const now = Date.now(), list = (wrong.get(who) || []).filter((t) => now - t < 600000); wrong.set(who, list);
  const given = String(req.headers["x-pin"] || ""), want = pin();
  if (list.length >= 5) return { ok: false, code: 429, msg: "Nhập sai PIN quá 5 lần, chờ 10 phút rồi thử lại." };
  if (given.length === want.length && crypto.timingSafeEqual(Buffer.from(given), Buffer.from(want))) return { ok: true };
  if (given) list.push(now);
  return { ok: false, code: 401, msg: given ? "Sai mã PIN." : "Cần mã PIN." };
}
// Vai chưa có phiên Claude đang mở (nhân vật ảo của xưởng): chỉ cho gửi tới vai đã khai trong data/DOI-NGU.md hoặc config.staff; tin nằm chờ trong hòm thư.
function knownRole(CFG, DATA, name) {
  const want = mailbox.slug(name); if (!name || want === "chung") return false;
  if ((CFG.staff || []).some((s) => s.name && mailbox.slug(s.name) === want)) return true;
  try {
    for (const l of fs.readFileSync(path.join(DATA, "DOI-NGU.md"), "utf8").split("\n")) {
      if (!/^\|/.test(l)) continue;
      const cell = (l.split("|")[1] || "").trim();
      if (cell && !/^-+$/.test(cell) && mailbox.slug(cell) === want) return true;
    }
  } catch {}
  return false;
}
function body(req) {
  return new Promise((ok, bad) => { let b = ""; req.on("data", (c) => { b += c; if (b.length > 20000) { bad(new Error("tin quá dài")); req.destroy(); } }); req.on("end", () => { try { ok(JSON.parse(b || "{}")); } catch (e) { bad(e); } }); });
}
// Tin văn phòng đã gửi (kênh "van-phong") + trạng thái đọc/xong lấy từ chính hòm thư.
function outbox(DATA) {
  const st = hopthu.state(path.join(DATA, "hop-thu")), rows = [];
  for (const [id, b] of st) if (b.kenh === "van-phong") rows.push({ id, t: Date.parse(b.luc) || 0, to: b.to_key, toName: b.toi, text: b.tin, status: b.xong ? "đã xong" : b.da_toi ? "đã đọc" : "chờ đọc", note: b.xong && b.xong.ghi_chu ? b.xong.ghi_chu : null });
  return rows.sort((a, b) => a.t - b.t);
}

async function handle(req, res, url, ctx) {
  const { CFG, DATA, agentByKey, onEvent } = ctx;
  const json = (code, o) => { res.writeHead(code, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" }); res.end(JSON.stringify(o)); };
  if (url.pathname === "/chat/status") {
    const local = isLocal(req), au = authorized(req);
    const out = { local, authorized: au.ok, msg: au.ok ? null : au.msg };
    if (local) out.pin = pin(); // chỉ hiện PIN trên chính máy này
    if (au.ok) out.outbox = outbox(DATA).slice(-60).reverse();
    return json(200, out);
  }
  if (url.pathname === "/chat/send" && req.method === "POST") {
    if (!sameOrigin(req) || !/^application\/json\b/i.test(String(req.headers["content-type"] || ""))) return json(403, { error: "Yêu cầu không hợp lệ." });
    const au = authorized(req); if (!au.ok) return json(au.code, { error: au.msg });
    let b; try { b = await body(req); } catch { return json(400, { error: "Tin không đọc được." }); }
    const key = String(b.to || ""), a = agentByKey(key), text = String(b.text || "").trim();
    let toName, toKey;
    if (a && !a.ceo) { toName = a.name; toKey = a.key; }
    else if (!a && b.virtual === true && /^v-[a-z0-9-]{1,20}$/.test(key) && knownRole(CFG, DATA, String(b.toName || ""))) { toName = String(b.toName).slice(0, 60); toKey = key; }
    else return json(400, { error: "Không có người nhận này (vai chưa khai trong DOI-NGU.md?)." });
    if (!text || text.length > 4000) return json(400, { error: "Tin trống hoặc quá 4000 chữ." });
    const id = mailbox.newId();
    mailbox.append(DATA, toName, { su_kien: "tin", id, tu: CFG.ownerName, toi: toName, to_key: toKey, kenh: "van-phong", tin: text });
    onEvent({ t: Date.now(), kind: "ceo", from: "ceo", to: toKey, title: text.split("\n")[0].slice(0, 110), body: text.slice(0, 700) });
    return json(200, { ok: true, id, status: "chờ đọc" });
  }
  return false;
}

// Mã PIN hiện tại (đọc lại mỗi 10 giây): văn phòng dùng để che mã ở mọi chữ hiển thị.
let pinCache = { v: null, at: 0 };
function currentPin() { if (Date.now() - pinCache.at > 10000) { try { pinCache = { v: fs.readFileSync(PIN_FILE, "utf8").trim(), at: Date.now() }; } catch { pinCache = { v: null, at: Date.now() }; } } return pinCache.v; }
module.exports = { handle, currentPin };
