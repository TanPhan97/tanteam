// Khung chat với agent, dùng chung cho trang Xưởng và Bảng điều hành.
// Hội thoại dạng bong bóng: tin của bạn (kèm trạng thái chờ đọc / đã đọc / đã xong) và câu trả lời gần nhất của agent.
// Enter gửi · Shift+Enter xuống dòng · có mẫu câu nhanh. Khung chỉ tạo một lần cho mỗi người đang chọn và giữ nguyên khi thẻ cập nhật,
// phần hội thoại chỉ vẽ lại khi nội dung thật sự đổi, nên không mất chữ đang gõ và không giật.
(function () {
  "use strict";
  const css = `
.chat{margin-top:10px;border-top:1px solid rgba(255,255,255,.1);padding-top:10px;display:flex;flex-direction:column;gap:8px;flex:1;min-height:0}
.chat .ch{display:flex;justify-content:space-between;align-items:baseline;gap:8px;color:#ffca76;font-weight:700;font-size:13px}
.chat .ch small{color:#8f9bb0;font-weight:500;font-size:12px}
.chat .thread{flex:1;min-height:170px;max-height:340px;overflow:auto;display:flex;flex-direction:column;gap:8px;padding:8px;background:rgba(5,10,20,.55);border:1px solid rgba(255,255,255,.08);border-radius:12px;scroll-behavior:smooth;overscroll-behavior:contain}
.chat .empty{margin:auto;color:#8f9bb0;font-size:13px;text-align:center;line-height:1.5;padding:6px}
.chat .msg{max-width:88%;padding:8px 11px;border-radius:14px;font-size:14px;line-height:1.45;white-space:pre-wrap;word-break:break-word;animation:msgIn .22s ease-out}
.chat .msg.in{align-self:flex-start;background:#16273f;color:#e7eefc;border-bottom-left-radius:4px}
.chat .msg.out{align-self:flex-end;background:#3a2c12;color:#fff0d4;border:1px solid rgba(255,202,118,.35);border-bottom-right-radius:4px}
.chat .msg.pend{opacity:.65}
.chat .msg .meta{display:flex;gap:8px;align-items:center;margin-top:4px;font-size:11.5px;color:#9aa8bf;white-space:normal}
.chat .msg.out .meta{justify-content:flex-end}
.chat .tick{font-weight:700}.chat .tick.s0{color:#ffca76}.chat .tick.s1{color:#7fb7ff}.chat .tick.s2{color:#62ead8}
.chat .msg .note{display:block;margin-top:3px;font-size:12px;color:#c8d4ea}
@keyframes msgIn{from{opacity:0;transform:translateY(6px)}}
.chat .chips{display:flex;gap:6px;flex-wrap:wrap}
.chat .chip{cursor:pointer;font:inherit;font-size:12.5px;padding:4px 10px;border-radius:999px;border:1px solid rgba(255,255,255,.18);background:transparent;color:#cfd8ea;transition:background-color .15s,border-color .15s,transform .15s}
.chat .chip:hover{border-color:#62ead8;color:#62ead8;transform:translateY(-1px)}
.chat .compose{display:flex;gap:8px;align-items:flex-end}
.chat textarea{flex:1;min-height:44px;max-height:150px;resize:none;background:#050a14;color:#eef4ff;border:1px solid rgba(255,255,255,.16);border-radius:12px;padding:10px 12px;font:inherit;font-size:14.5px;line-height:1.4;transition:border-color .15s,box-shadow .15s}
.chat textarea:focus{outline:none;border-color:#ffca76;box-shadow:0 0 0 3px rgba(255,202,118,.16)}
.chat .send{cursor:pointer;font:inherit;font-size:14px;font-weight:700;border-radius:12px;padding:0 16px;height:44px;border:0;background:#ffca76;color:#1a1204;transition:transform .15s,filter .15s}
.chat .send:hover{filter:brightness(1.08)}.chat .send:active{transform:scale(.96)}
.chat .send:disabled{opacity:.5;cursor:default}
.chat .lock{display:flex;gap:8px;align-items:center;flex-wrap:wrap;padding:8px 10px;border:1px dashed rgba(255,202,118,.4);border-radius:12px;font-size:13px;color:#e6d3ad}
.chat .lock input{width:120px;background:#050a14;color:#eee;border:1px solid rgba(255,255,255,.16);border-radius:9px;padding:7px 9px;font:inherit;letter-spacing:.25em}
.chat .lock button,.chat .gh{cursor:pointer;font:inherit;font-size:13px;font-weight:600;border-radius:9px;padding:6px 12px;border:1px solid rgba(255,255,255,.2);background:transparent;color:#d8e2f5}
.chat .err{color:#ff9f95;font-size:12.5px;min-height:16px}
.chat .foot{display:flex;justify-content:space-between;gap:8px;align-items:center;color:#8f9bb0;font-size:12px;line-height:1.4}
.chat .foot .kbd{white-space:nowrap}
@media (prefers-reduced-motion:reduce){.chat .msg{animation:none}.chat .thread{scroll-behavior:auto}}`;
  const st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);
  const el = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };
  const getPin = () => { try { return localStorage.getItem("vp-pin") || ""; } catch { return ""; } };
  const setPin = (p) => { try { localStorage.setItem("vp-pin", p); } catch {} };
  const hhmm = (t) => new Date(t).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  const first = (n) => String(n || "").split(" · ")[0];
  const CHIPS = [["Báo tiến độ", "Báo tiến độ ngắn gọn: đang làm gì, xong chưa, vướng gì."], ["Giao việc", "[VIỆC] "], ["Dừng lại", "Dừng việc đang làm và chờ lệnh mới."], ["Tiếp tục", "Tiếp tục việc đang làm."], ["Gửi kết quả", "Gửi kết quả cuối cùng và đóng việc này."]];

  let status = null, statusAt = 0;
  async function loadStatus(force, attempt) {
    if (!force && status && Date.now() - statusAt < 3000) return status;
    const headers = { "x-pin": getPin() }; if (attempt) headers["x-pin-try"] = "1";
    try { const r = await fetch("chat/status", { headers, cache: "no-store" }); status = await r.json(); statusAt = Date.now(); } catch { status = status || { authorized: false, msg: "Không kết nối được máy chủ văn phòng." }; }
    if (!status.authorized && status.msg === "Sai mã PIN.") setPin(""); // mã sai thì xóa, không gửi lại mãi
    return status;
  }
  const TICK = { "chờ đọc": ["✓", "s0", "chờ đọc"], "đã đọc": ["✓✓", "s1", "đã đọc"], "đã xong": ["✔", "s2", "đã xong"] };

  function build(a) {
    const box = el("div", "chat"); box.dataset.key = a.key; box._a = a;
    const head = el("div", "ch"); const title = el("span", "", `💬 Nhắn cho ${first(a.name)}`);
    head.append(title, el("small", "", a.virtual ? "tin chờ trong hòm thư tới khi vai này mở phiên" : "vào hòm thư · agent đọc ở cuối lượt")); box.appendChild(head);
    const thread = el("div", "thread"); thread.setAttribute("role", "log"); thread.setAttribute("aria-live", "polite"); box.appendChild(thread);
    const lock = el("div", "lock"); const pinIn = el("input"); pinIn.type = "password"; pinIn.inputMode = "numeric"; pinIn.maxLength = 6; pinIn.placeholder = "Mã PIN"; pinIn.setAttribute("aria-label", "Mã PIN");
    const unlock = el("button", "", "Mở khóa"); const lockMsg = el("span", "err"); lock.append(el("span", "", "Máy khác: nhập PIN để nhắn"), pinIn, unlock, lockMsg); box.appendChild(lock);
    const chips = el("div", "chips");
    const compose = el("div", "compose"); const ta = el("textarea"); ta.rows = 1; ta.placeholder = "Nhắn việc cho agent…"; ta.setAttribute("aria-label", "Nội dung tin nhắn");
    const send = el("button", "send", "Gửi ➤"); send.type = "button"; compose.append(ta, send);
    const err = el("div", "err"); const foot = el("div", "foot"); foot.append(el("span", "kbd", "Enter gửi · Shift+Enter xuống dòng")); foot.title = "Việc hệ trọng (production, khóa, tiền, xóa dữ liệu) thì gõ thẳng trong phiên Claude, đừng qua hòm thư.";
    for (const [label, text] of CHIPS) { const c = el("button", "chip", label); c.type = "button"; c.onclick = () => { ta.value = ta.value && !ta.value.endsWith("\n") ? ta.value.replace(/\s*$/, " ") + text : text; grow(); ta.focus(); ta.setSelectionRange(ta.value.length, ta.value.length); }; chips.appendChild(c); }
    const pinShow = el("div", "foot"); box.append(chips, compose, err, foot, pinShow);
    const grow = () => { ta.style.height = "auto"; ta.style.height = Math.min(150, ta.scrollHeight + 2) + "px"; };
    ta.addEventListener("input", grow);
    unlock.onclick = async () => { setPin(pinIn.value.replace(/\D/g, "")); pinIn.value = ""; await refresh(box, true, true); };
    pinIn.addEventListener("keydown", (e) => { e.stopPropagation(); if (e.key === "Enter") unlock.click(); });
    const doSend = async () => {
      const text = ta.value.trim(), a2 = box._a; if (!text || send.disabled) return;
      send.disabled = true; err.textContent = "";
      const body = { to: a2.key, text }; if (a2.virtual) { body.virtual = true; body.toName = a2.name; }
      box._pend = { text, t: Date.now() }; render(box);                          // hiện ngay, không đợi máy chủ
      try {
        const r = await fetch("chat/send", { method: "POST", headers: { "Content-Type": "application/json", "x-pin": getPin() }, body: JSON.stringify(body) });
        const j = await r.json();
        if (!r.ok) { err.textContent = j.error || "Gửi không được."; box._pend = null; } else { ta.value = ""; grow(); }
      } catch { err.textContent = "Không kết nối được máy chủ văn phòng."; box._pend = null; }
      send.disabled = false; await refresh(box, true); ta.focus();
    };
    send.onclick = doSend;
    ta.addEventListener("keydown", (e) => {
      e.stopPropagation();
      if (e.key === "Enter" && !e.shiftKey && !e.isComposing && e.keyCode !== 229) { e.preventDefault(); doSend(); }  // đang gõ dấu tiếng Việt (IME) thì Enter không gửi
    });
    ["keyup", "keypress", "pointerdown", "wheel"].forEach((ev) => ta.addEventListener(ev, (e) => e.stopPropagation()));
    box._parts = { thread, lock, lockMsg, chips, compose, err, foot, pinShow, title, ta, send, sig: "" };
    return box;
  }
  // Vẽ hội thoại: tin đã gửi (từ hòm thư) + câu trả lời gần nhất của agent + tin đang gửi. Chỉ đụng DOM khi nội dung đổi.
  function render(box) {
    const a = box._a, p = box._parts, s = status || {};
    const items = [];
    for (const m of (s.outbox || []).filter((x) => x.to === a.key).slice(0, 12)) items.push({ t: m.t, out: true, text: m.text, status: m.status, note: m.note });
    if (a.lastText && a.lastTextAt) items.push({ t: a.lastTextAt, out: false, text: a.lastText, who: first(a.name) });
    if (box._pend && !items.some((i) => i.out && i.text === box._pend.text && i.t >= box._pend.t - 5000)) items.push({ t: box._pend.t, out: true, text: box._pend.text, pend: true });
    items.sort((x, y) => x.t - y.t);
    const sig = items.map((i) => `${i.t}|${i.out}|${i.status || ""}|${i.pend ? 1 : 0}|${i.text.length}|${i.note || ""}`).join("~");
    if (sig === p.sig) return; p.sig = sig;
    const nearBottom = p.thread.scrollHeight - p.thread.scrollTop - p.thread.clientHeight < 60;
    p.thread.textContent = "";
    if (!items.length) p.thread.appendChild(el("div", "empty", a.virtual ? "Chưa có tin nào. Tin gửi cho vai này nằm trong hòm thư, phiên Claude cùng vai sẽ đọc khi mở." : "Chưa có tin nào. Gõ việc bên dưới hoặc chọn mẫu nhanh."));
    for (const i of items) {
      const m = el("div", "msg " + (i.out ? "out" : "in") + (i.pend ? " pend" : ""));
      m.appendChild(document.createTextNode(i.text)); m.setAttribute("translate", "no");
      const meta = el("div", "meta");
      if (i.out) { const tk = i.pend ? ["…", "s0", "đang gửi"] : TICK[i.status] || ["✓", "s0", i.status || ""]; meta.append(el("span", "", hhmm(i.t)), el("span", "tick " + tk[1], `${tk[0]} ${tk[2]}`)); if (i.note) { const n = el("span", "note", "↳ " + i.note); m.appendChild(n); } }
      else meta.append(el("span", "", `${i.who} · ${hhmm(i.t)}`));
      m.appendChild(meta); p.thread.appendChild(m);
    }
    if (nearBottom || !p.seen) { p.thread.scrollTop = p.thread.scrollHeight; p.seen = true; }
  }
  async function refresh(box, force, attempt) {
    const s = await loadStatus(force, attempt), p = box._parts;
    const ok = !!s.authorized;
    p.lock.style.display = ok ? "none" : "flex"; p.compose.style.display = p.chips.style.display = ok ? "" : "none";
    p.lockMsg.textContent = !ok && s.msg ? s.msg : "";
    if (!ok) p.err.textContent = "";
    p.pinShow.textContent = "";
    if (s.local && s.pin) { const b = el("button", "gh", "Hiện mã PIN cho điện thoại"); b.onclick = () => { b.replaceWith(el("span", "", `Mã PIN: ${s.pin} (chỉ hiện trên máy này)`)); }; p.pinShow.append(b); }
    render(box);
  }
  // Gắn khung chat vào thẻ; giữ nguyên khung nếu vẫn là người đó, chỉ cập nhật dữ liệu.
  window.ChatBox = {
    mount(container, a) {
      if (!a || (a.platform === "human" && !a.virtual)) { container.querySelector(".chat")?.remove(); return; }
      let box = container.querySelector(".chat");
      if (box && box.dataset.key !== a.key) { box.remove(); box = null; }
      if (!box) { box = build(a); container.appendChild(box); refresh(box, true); }
      else { box._a = a; box._parts.title.textContent = `💬 Nhắn cho ${first(a.name)}`; render(box); if (Date.now() - statusAt > 3000) refresh(box, false); }
    },
  };
})();
