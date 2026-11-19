"use strict";
const $ = (id) => document.getElementById(id);
const html = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
const fmtT = (ms) => new Date(ms).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
const ago = (ms) => { if (!ms) return "–"; const s = Math.max(0, (Date.now() - ms) / 1000); if (s < 60) return Math.round(s) + " giây"; if (s < 3600) return Math.round(s / 60) + " phút"; if (s < 86400) return (s / 3600).toFixed(1).replace(".", ",") + " giờ"; return Math.round(s / 86400) + " ngày"; };
const first = (n) => n.split(" · ")[0];
const COLOR = { claude: "#62ead8", human: "#edf5ff" };
const STATUS_DOT = { virtual: "#7fb7ff", active: "#62ead8", idle: "#8695ac", away: "#4a5a74", offline: "#4a5a74" };
window.Motion = window.Motion || { paused: false };

// ===== mặt bằng 1600×900 =====
const W = 1600, H = 900;
const CORR_A = 250, CORR_B = 535, CH = 930, AISLE = 796, PL = 570; // hành lang trên, hành lang dưới, lối giữa, lối đi xưởng, lối xuống xưởng
const ROOMS = [
  { id: "ceo", label: "TRƯỞNG XƯỞNG", x: 20, y: 20, w: 260, h: 210 },
  { id: "manager", label: "PM · KẾ HOẠCH DỰ ÁN", x: 296, y: 20, w: 290, h: 210 },
  { id: "coord", label: "DỮ LIỆU · PDM · DOC CONTROL", x: 602, y: 20, w: 370, h: 210 },
  { id: "g1", label: "QA/QC · ĐO KIỂM & DUYỆT", x: 988, y: 20, w: 592, h: 210 },
  { id: "claude", label: "PHÒNG THIẾT KẾ CAD", x: 20, y: 270, w: 470, h: 250 },
  { id: "lounge", label: "PHÒNG DESIGN REVIEW", x: 506, y: 270, w: 404, h: 250 },
  { id: "dev", label: "PHÒNG HỌP CHUNG", x: 950, y: 270, w: 630, h: 250, cls: "dev" },
  { id: "shop", label: "XƯỞNG PROTOTYPE · CNC · IN 3D", x: 20, y: 550, w: 1560, h: 330 },
];
// Cửa tự động của từng phòng (kiểu cửa trượt đôi): x = tâm cửa, y = vị trí tường, w = bề rộng. Người đi qua thì cửa mở, đi khỏi thì cửa đóng.
const DOORS = {
  ceo: { x: 240, y: 230 }, manager: { x: 440, y: 230 }, coord: { x: 790, y: 230 }, g1: { x: 1120, y: 230 },
  claude: { x: 250, y: 270 }, lounge: { x: 840, y: 270 }, dev: { x: 1005, y: 270 }, shop: { x: PL, y: 550 },
};
const DOOR_W = 50;
const HOME = { ceo: [150, 135] };
const FREE = {
  manager: [[370, 135], [510, 135]],
  coord: [[650, 135], [760, 135], [870, 135]],
  g1: [[1060, 135], [1180, 135], [1300, 135]],
  claude: [[90, 380], [220, 380], [350, 380], [90, 485], [220, 485], [350, 485]],
  shop: Array.from({ length: 9 }, (_, i) => [120 + i * 170, 858]),
  spare: [[600, 485], [720, 485], [840, 485]],
};
const DEV_SEAT = [1495, 395];                       // người đang giữ lượt SolidWorks ngồi ở góc phòng họp chung
const LANE = 1005;                                    // lối vào phòng họp chung (cạnh trái)
const G1Q = [[1440, 505], [1480, 505], [1520, 505], [1560, 505], [1440, 465]];
const TABLE = { x: 1180, y: 395 };
const MEET_SEATS = Array.from({ length: 10 }, (_, i) => { const a = (i + .5) / 10 * Math.PI * 2; return [Math.round(TABLE.x + Math.cos(a) * 155), Math.round(TABLE.y + Math.sin(a) * 75)]; });
// Chỗ để đi tới, kèm câu nói khi tới nơi.
const POI = {
  loungeA: { p: [640, 470], say: "Xem lại thiết kế" }, loungeB: { p: [780, 470], say: "Review bản vẽ" },
  cnc1: { p: [115, 792], say: "Kiểm tra CNC-1" }, cnc2: { p: [290, 792], say: "CNC-2 chạy ổn" }, cnc3: { p: [465, 792], say: "CNC-3 đang cắt" },
  lathe: { p: [715, 706], say: "Tiện đang chạy" }, saw: { p: [650, 792], say: "Cắt phôi" }, drill: { p: [770, 792], say: "Khoan lỗ" },
  fdmA: { p: [905, 792], say: "Máy in số 1 ổn" }, fdmB: { p: [1005, 792], say: "Kiểm tra bàn in" }, sla: { p: [1195, 706], say: "SLA đang quét" },
  bench: { p: [1335, 792], say: "Nguội chi tiết" }, cabinet: { p: [1450, 792], say: "Lấy dụng cụ" },
  cmm: { p: [1455, 185], say: "Đo CMM" }, plate: { p: [1505, 218], say: "Rà kiểm tra" }, qaMid: { p: [1180, 195], say: "Duyệt kết quả đo" },
  rack: { p: [905, 205], say: "Kiểm tra PDM" }, pmDesk: { p: [430, 195], say: "Trao đổi kế hoạch" }, coordMid: { p: [710, 200], say: "Cập nhật Master List" },
  cadMid: { p: [155, 440], say: "Xem model CAD" }, cadPrinter: { p: [445, 405], say: "Xem mẫu in thử" },
};
// Đội ngũ cố định của xưởng: mỗi người có chỗ làm việc và tuyến đi tuần phù hợp với nghề.
const CREW = [
  { key: "v-pm", name: "Product Manager", role: "", room: "manager", home: [370, 135], desk: true, color: "#ffca76", helmet: "#ffffff", alias: /pm|product manager|quản lý dự án/i,
    patrol: ["loungeA", "coordMid", "cadMid", "qaMid", "loungeB", "cnc2"], homeSay: ["Rà ưu tiên dự án", "Cập nhật tiến độ"], talk: ["E12 giao sản xuất tuần này", "Chốt thứ tự ưu tiên"] },
  { key: "v-doc", name: "Document", role: "", room: "coord", home: [650, 135], desk: true, color: "#b9a8ff", helmet: "#f2c300", alias: /tài liệu|document/i,
    patrol: ["rack", "pmDesk", "loungeA", "qaMid", "coordMid"], homeSay: ["Soạn WI song ngữ", "Đối chiếu SPEC"], talk: ["WI24 gần xong", "Cần bản vẽ rev mới nhất"] },
  { key: "v-qc", name: "QC", role: "", room: "g1", home: [1060, 135], desk: true, color: "#ff8fb1", helmet: "#f2c300", alias: /qa|qc|quality/i,
    patrol: ["cmm", "plate", "cnc1", "cnc3", "lathe", "loungeB", "qaMid"], homeSay: ["Soát bản vẽ", "Lập báo cáo đo"], talk: ["CMM đo đạt", "Có lỗi S2 cần sửa"] },
  { key: "v-dme", name: "Design Mechanical", role: "", room: "claude", home: [90, 380], desk: true, color: "#62ead8", helmet: "#f2c300", alias: /cad|bản vẽ|design|thiết kế/i,
    patrol: ["cadPrinter", "loungeB", "cnc1", "fdmA", "cadMid", "loungeA"], homeSay: ["Dựng model SolidWorks", "Chỉnh dung sai"], talk: ["Model rev B xong", "Cần DFM cho gá kẹp"] },
  { key: "v-wm", name: "Workshop Manager", role: "", room: "shop", home: [120, 858], desk: true, color: "#ff9a3c", helmet: "#ffffff", alias: /workshop|quản đốc/i,
    patrol: ["cnc1", "cnc2", "cnc3", "lathe", "saw", "fdmA", "sla", "bench", "cabinet", "qaMid"], homeSay: ["Phân lịch máy", "Kiểm tồn dụng cụ"], talk: ["Ưu tiên CNC-2 trước", "Máy in 3 cần thay nhựa"] },
  { key: "v-lathe", name: "Lathe Machine", role: "", room: "shop", home: [715, 706], color: "#8ad1ff", helmet: "#ff9a3c", alias: /tiện|lathe/i,
    patrol: ["saw", "bench", "cabinet", "drill"], homeSay: ["Đang tiện trục", "Đo lại đường kính"], talk: ["Phôi trục sẵn sàng", "Dao tiện mòn rồi"], homeDwell: [6, 12] },
  { key: "v-mill", name: "Milling Machine", role: "", room: "shop", home: [290, 792], color: "#ffd08a", helmet: "#ff9a3c", alias: /phay|milling/i,
    patrol: ["cnc1", "cnc3", "cabinet", "bench"], homeSay: ["CNC-2 đang cắt nhôm", "Kiểm tra dao"], talk: ["Chương trình G-code OK", "Đổi dao Ø6"], homeDwell: [6, 12] },
  { key: "v-3dp", name: "3D Printer", role: "", room: "shop", home: [920, 792], color: "#9dffb0", helmet: "#ff9a3c", alias: /in 3d|3d printer|prototype/i,
    patrol: ["fdmA", "fdmB", "sla", "cadPrinter", "bench"], homeSay: ["Đang in mẫu", "Kiểm tra lớp đầu"], talk: ["Mẫu in xong 80%", "Thay cuộn nhựa PLA"], homeDwell: [6, 12] },
];
const roomOf = (x, y) => (ROOMS.find((r) => x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) || {}).id || null;

const svg = $("office");
machineDefs(svg);
const floorG = E("g", {}, svg), roomsG = E("g", {}, svg), machG = E("g", {}, svg), deskG = E("g", {}, svg), doorG = E("g", {}, svg), linksG = E("g", {}, svg), agentsG = E("g", {}, svg), msgsG = E("g", {}, svg);

// sàn + hành lang có mũi tên chạy
E("rect", { class: "floor", x: 0, y: 0, width: W, height: H, rx: 12 }, floorG);
for (const [x, y, w, h] of [[20, 232, 1560, 36], [20, 522, 1560, 26], [912, 270, 36, 250]]) E("rect", { class: "floor", x, y, width: w, height: h, rx: 6 }, floorG);
E("line", { class: "walk flow", x1: 20, y1: CORR_A, x2: 1580, y2: CORR_A }, floorG);
E("line", { class: "walk flow", x1: 20, y1: CORR_B, x2: 1580, y2: CORR_B }, floorG);
E("line", { class: "walk flow", x1: CH, y1: 270, x2: CH, y2: 520 }, floorG);
E("line", { class: "walk", x1: 40, y1: AISLE, x2: 1560, y2: AISLE, style: "stroke:#6b5a2a" }, floorG);
for (const r of ROOMS) {
  E("rect", { class: "room " + (r.cls || ""), x: r.x, y: r.y, width: r.w, height: r.h, rx: 14 }, roomsG);
  E("text", { class: "roomlbl", x: r.x + 16, y: r.y + 24 }, roomsG).textContent = r.label;
}
// Xưởng Prototype: lối đi vàng + máy móc
E("rect", { x: 30, y: 788, width: 1540, height: 16, fill: "url(#mHazard)", opacity: .16, rx: 3 }, machG);
[40, 215, 390].forEach((x, i) => cnc(machG, x, 600, i, "CNC-" + (i + 1)));
lathe(machG, 600, 600, 3); saw(machG, 600, 720, 4); drill(machG, 740, 720, 5);
[880, 965, 1050].forEach((x, c) => [600, 700].forEach((y, r) => fdm(machG, x, y, c * 2 + r)));
sla(machG, 1150, 600, 6);
bench(machG, 1270, 600, 7); bench(machG, 1270, 690, 8);
cabinet(machG, 1420, 585, 9); cabinet(machG, 1490, 585, 10); shelf(machG, 1410, 700);
crane(machG, 360, 1550, 572, 11);
// phòng khác
fdm(machG, 410, 300, 12);
cmm(machG, 1380, 50, 13); plate(machG, 1480, 160);
rack(machG, 925, 50, 40, 150, 0);
meeting(machG, 708, 395);
// phòng họp chung: bàn bầu dục, màn chiếu, ghế, và góc "Lượt SolidWorks"
const devGlow = E("rect", { x: 950, y: 270, width: 630, height: 250, rx: 14, fill: "#62ead8", opacity: 0, style: "transition:opacity .6s" }, roomsG);
E("rect", { x: 1070, y: 302, width: 220, height: 8, rx: 3, fill: "#31476a" }, machG);
E("rect", { x: 1080, y: 304, width: 200, height: 4, rx: 1, fill: "#62ead8", opacity: .5, class: "m bl", style: "animation-duration:5s" }, machG);
E("ellipse", { cx: TABLE.x, cy: TABLE.y, rx: 120, ry: 46, fill: "#0b1322", stroke: "#62ead8", "stroke-width": 2 }, machG);
E("ellipse", { cx: TABLE.x, cy: TABLE.y, rx: 98, ry: 32, fill: "none", stroke: "#24344c", "stroke-dasharray": "3 4" }, machG);
for (const [x, y] of MEET_SEATS) E("rect", { x: x - 8, y: y - 8, width: 16, height: 16, rx: 5, fill: "#24344c", stroke: "#31476a", opacity: .9 }, machG);
const hallTxt = E("text", { x: TABLE.x, y: TABLE.y + 4, "text-anchor": "middle", fill: "#62ead8", "font-size": 12, "font-weight": 600 }, machG);
E("rect", { x: 1420, y: 285, width: 150, height: 195, rx: 10, fill: "#0b1322", stroke: "#31476a" }, machG);
E("text", { x: 1495, y: 303, "text-anchor": "middle", class: "mlabel", style: "fill:#ffca76" }, machG).textContent = "LƯỢT SOLIDWORKS";
E("rect", { x: 1470, y: 342, width: 50, height: 30, rx: 4, fill: "#0a1626", stroke: "#62ead8" }, machG);
E("rect", { x: 1476, y: 348, width: 38, height: 18, rx: 2, fill: "#62ead8", opacity: .25, class: "m bl", style: "animation-duration:3s" }, machG);
const devHolderTxt = E("text", { x: 1495, y: 321, "text-anchor": "middle", fill: "#edf5ff", "font-size": 11, "font-weight": 600 }, machG);
const devPkgTxt = E("text", { x: 1495, y: 335, "text-anchor": "middle", fill: "#a1b1c8", "font-size": 10 }, machG);
const rackG = E("g", {}, roomsG), queueG = E("g", {}, roomsG);

// cửa trượt đôi: khe tường + hai cánh thép + đèn báo (đỏ = đóng, xanh = mở)
const doors = Object.entries(DOORS).map(([room, d]) => {
  const g = E("g", { transform: `translate(${d.x},${d.y})` }, doorG), h = DOOR_W / 2;
  E("rect", { x: -h - 4, y: -5, width: DOOR_W + 8, height: 10, rx: 2, fill: "#0a1220" }, g);            // khe tường che nét viền phòng
  E("rect", { x: -h, y: -2, width: DOOR_W, height: 4, fill: "#030710" }, g);                            // lối đi tối khi cửa mở
  const L = E("rect", { x: -h, y: -3.5, width: h, height: 7, rx: 1.5, fill: "#6f87a6", stroke: "#a9bdd6", "stroke-width": .8 }, g);
  const R = E("rect", { x: 0, y: -3.5, width: h, height: 7, rx: 1.5, fill: "#6f87a6", stroke: "#a9bdd6", "stroke-width": .8 }, g);
  E("path", { d: `M${-h - 4} -6V6M${h + 4} -6V6`, stroke: "#ffca76", "stroke-width": 3 }, g);          // trụ khung cửa màu cảnh báo
  const led = E("circle", { cx: 0, cy: -9, r: 2.6, fill: "#ff8f8f" }, g);
  return { room, d, L, R, led, open: 0 };
});
function stepDoors(dt) {
  const figsNow = Object.values(figs).filter((f) => !f.hidden);
  for (const dr of doors) {
    let want = 0;
    for (const f of figsNow) {
      const dist = Math.hypot(f.pos[0] - dr.d.x, f.pos[1] - dr.d.y);
      if (dist < 30 && Math.abs(f.pos[1] - dr.d.y) <= 10) { want = 1; break; } // đang ở đúng trong khung cửa (người đi ngang hành lang không tính)
      // Chỉ mở khi chắc chắn: đích đến thật sự nằm trong phòng này (đang vào) hoặc người đang ở trong phòng và đi ra ngoài (đích ở nơi khác).
      const here = roomOf(f.pos[0], f.pos[1]), goalRoom = f.goal ? roomOf(f.goal[0], f.goal[1]) : null;
      const entering = goalRoom === dr.room && here !== dr.room, leaving = here === dr.room && goalRoom !== dr.room;
      if (!(entering || leaving) || !f.wp.length || dist > (entering ? 62 : 48)) continue;
      let a = f.pos;                                                         // và đường đi phía trước thật sự xuyên qua cửa này
      for (const b of f.wp) {
        if (Math.abs(a[0] - dr.d.x) < 2 && Math.abs(b[0] - dr.d.x) < 2 && Math.min(a[1], b[1]) - 4 <= dr.d.y && Math.max(a[1], b[1]) + 4 >= dr.d.y) { want = 1; break; }
        a = b;
      }
      if (want) break;
    }
    dr.open = Motion.paused ? want : dr.open + Math.sign(want - dr.open) * Math.min(Math.abs(want - dr.open), dt / 320);
    const sl = (DOOR_W / 2 - 2) * dr.open;
    dr.L.setAttribute("transform", `translate(${-sl} 0)`); dr.R.setAttribute("transform", `translate(${sl} 0)`);
    dr.led.setAttribute("fill", dr.open > .05 ? "#62ead8" : "#ff8f8f");
  }
}

// bàn làm việc
const desks = {};
function addDesk(k, x, y) {
  const g = E("g", { transform: `translate(${x},${y})` }, deskG);
  E("rect", { class: "desk", x: -38, y: -40, width: 76, height: 22, rx: 6 }, g);
  desks[k] = E("rect", { class: "screen", x: -18, y: -50, width: 36, height: 12, rx: 3, fill: "#0b1322" }, g);
}
addDesk("ceo", ...HOME.ceo);
for (const v of CREW) { HOME[v.key] = v.home; if (v.desk) addDesk(v.key, ...v.home); }
const virtualFor = (a) => CREW.find((v) => v.desk && v.alias.test(a.name + " " + a.role));
function seatFor(a) {
  if (HOME[a.key]) return;
  const v = a.platform !== "human" && virtualFor(a);
  if (v) { HOME[a.key] = HOME[v.key]; desks[a.key] = desks[v.key]; return; }  // phiên thật cùng vai thì dùng đúng bàn của vai đó
  const taken = Object.values(HOME), free = (p) => !taken.some(([x, y]) => Math.hypot(x - p[0], y - p[1]) < 70);
  HOME[a.key] = (FREE[a.room] || []).find(free) || FREE.spare.find(free) || FREE.shop.find(free) || [600, 400];
  addDesk(a.key, ...HOME[a.key]);
}

// ===== thu phóng / kéo =====
let view = { x: 0, y: 0, k: 1 };
function applyView() {
  const w = W / view.k, h = H / view.k;
  view.x = Math.min(Math.max(view.x, -w * .3), W - w * .7); view.y = Math.min(Math.max(view.y, -h * .3), H - h * .7);
  svg.setAttribute("viewBox", `${view.x} ${view.y} ${w} ${h}`); $("zv").textContent = Math.round(view.k * 100) + "%";
}
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
// Thu phóng theo điểm con trỏ, giống Kepler-07: hệ số tỉ lệ mũ với quãng cuộn nên chuột và touchpad đều mượt.
function zoomAt(f, client) {
  const k = clamp(view.k * f, .6, 3); if (k === view.k) return;
  const m = svg.getScreenCTM();
  const an = client && m ? new DOMPoint(client.x, client.y).matrixTransform(m.inverse()) : { x: view.x + W / view.k / 2, y: view.y + H / view.k / 2 };
  const r = view.k / k;
  view.x = an.x + (view.x - an.x) * r; view.y = an.y + (view.y - an.y) * r; view.k = k; applyView();
}
$("zi").onclick = () => zoomAt(1.25); $("zo").onclick = () => zoomAt(.8); $("zr").onclick = () => { view = { x: 0, y: 0, k: 1 }; applyView(); };
// SVG giữ tỉ lệ nên khung nhìn thật có thể rộng hơn viewBox: quy đổi pixel theo cạnh bị co.
function pxScale() { const r = svg.getBoundingClientRect(); return Math.max((W / view.k) / r.width, (H / view.k) / r.height); }
svg.addEventListener("wheel", (e) => {
  e.preventDefault();
  const delta = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
  zoomAt(Math.exp(clamp(-delta * .0018, -.8, .8)), { x: e.clientX, y: e.clientY });
}, { passive: false });
let drag = null, moved = false;
svg.addEventListener("pointerdown", (e) => { drag = { x: e.clientX, y: e.clientY, vx: view.x, vy: view.y }; moved = false; });
addEventListener("pointermove", (e) => {
  if (!drag) return;
  const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
  if (!moved && Math.hypot(dx, dy) < 5) return;
  moved = true; svg.classList.add("drag");
  const s = pxScale(); view.x = drag.vx - dx * s; view.y = drag.vy - dy * s; applyView();
});
addEventListener("pointerup", () => { drag = null; svg.classList.remove("drag"); });
svg.addEventListener("keydown", (e) => { const s = 40 / view.k; if (e.key === "+" || e.key === "=") zoomAt(1.25); else if (e.key === "-") zoomAt(.8); else if (e.key === "ArrowLeft") view.x -= s; else if (e.key === "ArrowRight") view.x += s; else if (e.key === "ArrowUp") view.y -= s; else if (e.key === "ArrowDown") view.y += s; else return; e.preventDefault(); applyView(); });
function setPaused(p) {
  Motion.paused = p; document.documentElement.classList.toggle("motion-paused", p);
  document.querySelectorAll("svg").forEach((s) => (p ? s.pauseAnimations() : s.unpauseAnimations()));
  $("mv").textContent = p ? "▷" : "Ⅱ"; $("mv").title = p ? "Tiếp tục chuyển động" : "Dừng chuyển động"; $("mv").setAttribute("aria-pressed", p);
}
$("mv").onclick = () => setPaused(!Motion.paused);
if (matchMedia("(prefers-reduced-motion:reduce)").matches) setPaused(true);

// ===== đường đi: ra hành lang, qua lối giữa, vào phòng đích =====
const near = (a, b) => Math.abs(a - b) < 3;
const laneY = (y) => (y < TABLE.y ? 318 : 472);
function chain(q) { // từ q ra điểm hành lang của nó (không gồm q)
  const [x, y] = q;
  if (roomOf(x, y) === "dev") return [[x, laneY(y)], [LANE, laneY(y)], [LANE, CORR_A]]; // phòng họp chung: đi vòng quanh bàn qua lối trái
  if (y >= 550) return near(y, AISLE) || y > AISLE ? [[x, AISLE], [PL, AISLE], [PL, CORR_B]] : [[x, AISLE], [PL, AISLE], [PL, CORR_B]];
  if (y >= 520) return [[PL, CORR_B]];
  if (y > CORR_A + 4 && near(x, CH)) return [[CH, CORR_A]];
  const d = DOORS[roomOf(x, y)];
  if (d) return [[d.x, y], [d.x, CORR_A]];            // ra khỏi phòng bằng cửa, không xuyên tường
  return [[x, CORR_A]];
}
function route(p, t) {
  const rp = roomOf(...p), rt = roomOf(...t);
  let wp;
  if (rp && rp === rt) wp = rp === "shop" ? [[p[0], AISLE], [t[0], AISLE], t] : rp === "dev" ? [[p[0], laneY(p[1])], [LANE, laneY(p[1])], [LANE, laneY(t[1])], [t[0], laneY(t[1])], t] : [t];
  else {
    const up = chain(p), down = chain(t).slice().reverse(), zb = (q) => q[1] >= 520;
    wp = up.slice();
    if (!zb(p) && zb(t)) wp.push([CH, CORR_A], [CH, CORR_B]);
    else if (zb(p) && !zb(t)) wp.push([CH, CORR_B], [CH, CORR_A]);
    wp.push(...down, t);
  }
  const out = []; let cur = p;
  for (const q of wp) { if (Math.hypot(q[0] - cur[0], q[1] - cur[1]) > .5) { out.push(q); cur = q; } }
  return out;
}
function moveFig(f, dist) {
  while (f.wp.length) {
    const [x, y] = f.pos, [tx, ty] = f.wp[0], len = Math.hypot(tx - x, ty - y);
    if (dist < len) { f.pos = [x + (tx - x) * dist / len, y + (ty - y) * dist / len]; return; }
    f.pos = f.wp.shift(); dist -= len;
  }
}

// ===== nhân vật =====
const figs = {};
let selected = null, last = null;
function select(k) { selected = k; if (last) render(last); }
function makeFig(a, pos) {
  const g = E("g", { class: "agent" }, agentsG);
  E("circle", { class: "ring", r: 21 }, g);
  const fig = E("g", { class: "fig", transform: "scale(1.15)" }, g);
  const bob = E("g", { class: "bob" }, fig);
  E("ellipse", { cx: 0, cy: 18, rx: 12, ry: 3, fill: "#000", opacity: .4 }, fig);
  const col = a.color || COLOR[a.platform];
  const limb = (cls, x, y, w, h, fill) => E("rect", { class: "limb " + cls, x, y, width: w, height: h, rx: 2, fill }, bob);
  limb("legL", -7, 10, 5, 9, "#1b2a41"); limb("legR", 2, 10, 5, 9, "#1b2a41");
  limb("armL", -14, -1, 4, 11, col); limb("armR", 10, -1, 4, 11, col);
  E("rect", { x: -10, y: -2, width: 20, height: 14, rx: 6, fill: col }, bob);
  E("circle", { cx: 0, cy: -9, r: 7, fill: "#f1c7a5" }, bob);
  E("path", { d: "M-8 -11 A8 8 0 0 1 8 -11 L9.5 -10 L-9.5 -10 Z", fill: a.helmet || (a.platform === "human" ? "#ffffff" : "#f2c300"), stroke: "#c9a100", "stroke-width": .6 }, bob);
  E("circle", { cx: -2.5, cy: -7.5, r: 1.1, fill: "#1b1f26" }, bob); E("circle", { cx: 2.5, cy: -7.5, r: 1.1, fill: "#1b1f26" }, bob);
  const sub = E("g", {}, g);
  E("text", { class: "name", y: 38 }, g).textContent = a.virtual ? a.name : first(a.name);
  if (a.role) E("text", { class: "sub", y: 51 }, g).textContent = a.role.length > 30 ? a.role.slice(0, 29) + "…" : a.role;
  const bubble = E("g", { class: "bubble", transform: "translate(0,-36)", opacity: 0 }, g);
  const bRect = E("rect", { x: -40, y: -12, width: 80, height: 18, rx: 9, fill: "#0b1322" }, bubble);
  const bTxt = E("text", { y: 1, "text-anchor": "middle" }, bubble);
  g.addEventListener("click", () => { if (!moved) select(a.key); });
  return (figs[a.key] = { a, g, sub, bubble, bRect, bTxt, pos: pos.slice(), wp: [], mode: null, goal: null, nextAt: performance.now() + 2500 + Math.random() * 5000, arrive: false, speech: null, shown: "" });
}
function say(f, text, ms, delay = 0) { f.speech = { text, from: performance.now() + delay, until: performance.now() + delay + ms }; }
const greeted = new Map();
// Giao việc: khi có tin nhắn / tín hiệu giao nhiệm vụ, hai bên liên quan vào phòng họp giao ban, nói chuyện xong thì về phòng của mình.
const huddles = [], pendingH = [], pairAt = new Map();
const nb = (s) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase().trim();
function figByLabel(label) {
  const l = nb(label); if (!l || l === "?") return null;
  if (/^(ceo|dai ca|giam doc|chu van phong)$/.test(l) || (last && nb(last.ownerName) === l)) return figs.ceo || null;
  const vis = Object.values(figs).filter((f) => !f.hidden && !f.a.ceo);
  return vis.find((f) => nb(f.a.name) === l) || vis.find((f) => { const n = nb(f.a.name); return n.length >= 3 && l.length >= 3 && (n.includes(l) || l.includes(n)); }) || null;
}
function queueHuddle(A, B, title) {
  if (!A || !B || A === B || A.hidden || B.hidden) return;
  const k = A.a.key + ">" + B.a.key, t = performance.now();
  if (t - (pairAt.get(k) || -1e9) < 90000) return; pairAt.set(k, t);
  pendingH.push({ A, B, title: String(title || "").replace(/^\[[^\]]*\]\s*/, ""), born: t });
}
function desired(f) {
  const a = f.a;
  if (f.meetSeat) return { k: "meet", p: f.meetSeat };
  if (a.where === "dev") return { k: "dev", p: DEV_SEAT };
  if (a.where === "g1q") return { k: "q" + Math.min(f.qIdx || 0, G1Q.length - 1), p: G1Q[Math.min(f.qIdx || 0, G1Q.length - 1)] };
  // chưa có việc giao thì mọi nhân vật (ảo hay phiên thật) đứng đúng chỗ trong phòng của mình; chỉ đi họp khi có giao - nhận việc
  return { k: "home", p: HOME[a.key] || [600, 400] };
}
const rnd = (lo, hi) => lo + Math.random() * (hi - lo);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
function nextTarget(f) {
  const home = HOME[f.a.key] || [600, 400], cfg = f.a.virtual ? f.a : null;
  const atHome = Math.hypot(f.pos[0] - home[0], f.pos[1] - home[1]) < 8;
  if (f.forceHome) { f.forceHome = false; f.spot = null; return home; }
  if (cfg) {
    if (!atHome && Math.random() < .55) { f.spot = null; return home; }          // đi một vòng rồi về chỗ làm
    const names = cfg.patrol.filter((n) => Math.hypot(POI[n].p[0] - f.pos[0], POI[n].p[1] - f.pos[1]) > 30);
    f.spot = POI[pick(names)]; return f.spot.p;
  }
  if (!atHome && Math.random() < .3) { f.spot = null; return home; }
  const all = Object.values(POI).filter((q) => q !== f.spot && Math.hypot(q.p[0] - f.pos[0], q.p[1] - f.pos[1]) > 30);
  f.spot = pick(all); return f.spot.p;
}
function stepFig(f, now, dt) {
  if (f.hidden) return;
  const d = desired(f);
  if (d.k !== f.mode) {
    f.mode = d.k; f.arrive = false; f.spot = null;
    if (d.k === "wander") { f.nextAt = now + 1000 + Math.random() * 2500; }
    else { f.goal = d.p; f.wp = route(f.pos, d.p); }
  } else if (d.k === "wander" && !f.wp.length && now >= f.nextAt && !f.arrive) {
    f.goal = nextTarget(f); f.wp = route(f.pos, f.goal); f.arrive = true;
  }
  if (Motion.paused) { if (f.wp.length) { f.pos = f.wp[f.wp.length - 1].slice(); f.wp = []; } }
  else moveFig(f, dt * .165);
  const home = HOME[f.a.key], atHome = !!home && Math.hypot(f.pos[0] - home[0], f.pos[1] - home[1]) < 8;
  if (f.arrive && !f.wp.length) {
    f.arrive = false;
    f.nextAt = now + (atHome && f.a.virtual ? rnd(...(f.a.homeDwell || [9, 18])) : rnd(5, 9)) * 1000;
    if (f.spot) say(f, f.spot.say, 3200); else if (atHome && f.a.virtual && Math.random() < .6) say(f, pick(f.a.homeSay), 3400);
  }
  if (f.a.virtual && f.mode === "home" && !f.wp.length && !f.meetSeat && now >= f.nextAt && (!f.speech || now >= f.speech.until)) { say(f, pick(f.a.homeSay), 3400); f.nextAt = now + rnd(14000, 30000); }
  f.doing = f.meetSeat ? "Đang giao - nhận việc ở phòng họp" : f.wp.length ? "Đang di chuyển" : f.spot ? f.spot.say : "Tại vị trí làm việc";
  const scr = desks[f.a.key];
  if (f.a.virtual && f.a.desk && scr) scr.setAttribute("fill", !f.wp.length && atHome ? "#62ead8" : "#0b1322");
  f.g.setAttribute("transform", `translate(${f.pos[0].toFixed(1)} ${f.pos[1].toFixed(1)})`);
  f.g.classList.toggle("walk", f.wp.length > 0 && !Motion.paused);
  // bong bóng: lời nói tạm thời đè lên nhãn trạng thái
  const sp = f.speech && now >= f.speech.from && now < f.speech.until ? f.speech : null;
  const txt = sp ? sp.text : f.label || "", col = sp ? "#edf5ff" : f.labelCol || "#a1b1c8";
  if (txt !== f.shown) {
    f.shown = txt; f.bubble.setAttribute("opacity", txt ? 1 : 0); f.bTxt.textContent = txt;
    const w = Math.max(60, txt.length * 6.4 + 16); f.bRect.setAttribute("width", w); f.bRect.setAttribute("x", -w / 2);
    f.bRect.setAttribute("stroke", sp ? "#62ead8" : f.labelCol || "#31476a"); f.bTxt.setAttribute("fill", col);
  }
}
function runHuddles(now) {
  if (!Object.keys(figs).length) return;
  // bắt đầu: tin chờ, cả hai bên đang rảnh (chưa ở trong buổi giao việc khác) và còn cặp ghế đối diện
  for (let i = 0; i < pendingH.length; i++) {
    const h = pendingH[i];
    if (now - h.born > 60000 || h.A.hidden || h.B.hidden || !figs[h.A.a.key] || !figs[h.B.a.key]) { pendingH.splice(i--, 1); continue; }
    if (h.A.meetSeat || h.B.meetSeat) continue;
    const used = new Set(huddles.flatMap((x) => [x.sa, x.sb]));
    const sa = [0, 1, 2, 3, 4].find((k) => !used.has(k) && !used.has(k + 5));
    if (sa == null) break;
    h.A.meetSeat = MEET_SEATS[sa]; h.B.meetSeat = MEET_SEATS[sa + 5];
    huddles.push({ A: h.A, B: h.B, sa, sb: sa + 5, state: "go", t0: now, t1: 0, title: h.title }); pendingH.splice(i--, 1);
  }
  for (let i = huddles.length - 1; i >= 0; i--) {
    const h = huddles[i], gone = h.A.hidden || h.B.hidden || !figs[h.A.a.key] || !figs[h.B.a.key];
    if (!gone && h.state === "go" && ((!h.A.wp.length && !h.B.wp.length) || now - h.t0 > 45000)) {
      h.state = "talk"; h.t1 = now;
      say(h.A, "Giao việc: " + (h.title.length > 26 ? h.title.slice(0, 25) + "…" : h.title || "có việc mới"), 4200);
      say(h.B, "Nhận việc, tôi làm ngay", 3400, 2600);
    }
    if (gone || (h.state === "talk" && now - h.t1 > 9000)) { h.A.meetSeat = null; h.B.meetSeat = null; huddles.splice(i, 1); } // xong việc: về phòng của mình
  }
  const h0 = huddles.find((h) => h.state === "talk") || huddles[0];
  hallTxt.textContent = h0 ? `GIAO VIỆC: ${first(h0.A.a.name)} → ${first(h0.B.a.name)}` : "";
}
function greet(now) {
  const list = Object.values(figs).filter((f) => f.mode === "wander" && !f.speech && !f.wp.length);
  for (let i = 0; i < list.length; i++) for (let j = i + 1; j < list.length; j++) {
    const a = list[i], b = list[j], key = a.a.key + "|" + b.a.key;
    if (Math.hypot(a.pos[0] - b.pos[0], a.pos[1] - b.pos[1]) > 60 || now - (greeted.get(key) || 0) < 60000) continue;
    greeted.set(key, now); say(a, `Chào ${first(b.a.name)}!`, 3000); say(b, `Chào ${first(a.a.name)}!`, 3000, 700); return;
  }
}
let prev = 0;
function animate(now) {
  const dt = prev ? Math.min(now - prev, 100) : 0; prev = now;
  for (const f of Object.values(figs)) stepFig(f, now, dt);
  stepDoors(dt);
  runHuddles(now);
  if (!Motion.paused && !huddles.length) greet(now);
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);

// ===== tin nhắn bay giữa các nhân vật =====
const seenMsg = new Set(); let firstLoad = true;
function flyMsg(e) {
  const A = figs[e.from], B = figs[e.to];
  if (!A || !B) return;
  const col = e.kind === "ceo" ? "#ffca76" : (/GẤP|CHẶN/.test(e.title) ? "#ff8f8f" : "#62ead8");
  const [ax, ay] = A.pos, [bx, by] = B.pos, mx = (ax + bx) / 2, my = Math.min(ay, by) - 70, d = `M${ax},${ay} Q${mx},${my} ${bx},${by}`;
  const path = E("path", { d, fill: "none", stroke: col, "stroke-width": 1.2, "stroke-dasharray": "2 5", opacity: .6 }, linksG);
  const dot = E("circle", { r: 5, fill: col, class: "msgdot", style: `color:${col}` }, msgsG);
  const anim = E("animateMotion", { dur: "1.8s", fill: "freeze", path: d }, dot); anim.beginElement && anim.beginElement();
  const lbl = E("text", { x: mx, y: my + 22, "text-anchor": "middle", fill: col, "font-size": 11, opacity: .9 }, linksG); lbl.textContent = e.title.slice(0, 46);
  setTimeout(() => dot.remove(), 2000); setTimeout(() => { path.remove(); lbl.remove(); }, 9000);
}

// ===== vẽ theo dữ liệu =====
function metric(label, value, c) { const m = html("div", "metric"); const b = html("b", "", value); if (c) b.style.setProperty("--c", c); m.append(b, html("span", "", label)); return m; }
function render(s) {
  last = s;
  const agents = s.agents;
  const act = agents.filter((a) => a.platform !== "human" && a.status === "active").length;
  const wait = agents.filter((a) => a.flag).length;
  const idle = agents.filter((a) => a.status === "idle" && !a.flag).length;
  const holder = agents.find((a) => a.key === s.dev.holder);
  const done = s.tasks.filter((t) => t.state === "done").length;
  document.title = s.title; $("ttl").textContent = s.title.toUpperCase();
  if (s.subtitle) $("sub").textContent = s.subtitle.toUpperCase();
  try { localStorage.setItem("vp-title", s.title.toUpperCase()); if (s.subtitle) localStorage.setItem("vp-sub", s.subtitle.toUpperCase()); } catch {}
  $("clock").textContent = "TRỰC TIẾP · " + new Date(s.now).toLocaleTimeString("vi-VN");
  const M = $("metrics"); M.textContent = "";
  M.append(metric("Đang làm", act, "#62ead8"), metric("Chờ / chặn", wait, wait ? "#ffca76" : null), metric("Rảnh", idle),
    metric("Lượt SolidWorks", holder ? first(holder.name) : (s.dev.holderLabel ? "đang giữ" : "trống"), holder || s.dev.holderLabel ? "#ffca76" : null),
    metric("Việc ưu tiên", `${done}/${s.tasks.length}`));
  if (s.sys.cFreeGB != null) M.append(metric("Ổ đĩa trống", s.sys.cFreeGB.toString().replace(".", ",") + " GB"));
  devGlow.setAttribute("opacity", s.dev.holder || s.dev.holderLabel ? .07 : 0);
  devHolderTxt.textContent = (holder ? `${first(holder.name)} · ${ago(s.dev.holderSince)}` : (s.dev.holderLabel ? s.dev.holderLabel : `Trống · ${ago(s.dev.idleSince)}`)).slice(0, 24);
  devPkgTxt.textContent = s.dev.package || "";
  rackG.textContent = "";
  s.sys.containers.slice(0, 4).forEach((c, i) => {
    const x = 1030 + i * 74, y = 482;
    E("rect", { class: "rack", x, y, width: 68, height: 32, rx: 6 }, rackG);
    const ok = c.state === "running" && !/unhealthy|Restarting/i.test(c.status);
    E("circle", { cx: x + 10, cy: y + 11, r: 3.6, fill: ok ? "#62ead8" : "#ff8f8f", class: ok ? "bl" : "", style: "animation-duration:2.4s" }, rackG);
    E("text", { x: x + 18, y: y + 14, fill: "#a1b1c8", "font-size": 9.5 }, rackG).textContent = c.name.slice(0, 11);
    E("text", { x: x + 8, y: y + 26, fill: "#7f90aa", "font-size": 8.5 }, rackG).textContent = c.status.replace(/About |\(healthy\)/g, "").slice(0, 15);
  });
  queueG.textContent = "";
  (s.dev.queue || []).slice(0, 3).forEach((q, i) => {
    E("text", { x: 1430, y: 452 + i * 12, fill: "#a1b1c8", "font-size": 9.5 }, queueG).textContent = `${q.n}. ${q.who} · ${q.what}`.slice(0, 26);
  });
  const keys = new Set(agents.map((a) => a.key));
  for (const k of Object.keys(figs)) if (!keys.has(k) && !figs[k].a.virtual) { figs[k].g.remove(); delete figs[k]; }
  // phiên thật cùng vai với nhân sự xưởng thì thế chỗ nhân sự đó
  for (const v of CREW) if (figs[v.key]) figs[v.key].hidden = false;
  for (const a of agents) if (a.platform !== "human") { const v = virtualFor(a); if (v && figs[v.key]) { figs[v.key].hidden = true; figs[v.key].meetSeat = null; } }
  for (const v of CREW) if (figs[v.key]) figs[v.key].g.style.display = figs[v.key].hidden ? "none" : "";
  let gIdx = 0;
  for (const a of agents) {
    seatFor(a);
    const start = a.where === "dev" ? DEV_SEAT : a.where === "g1q" ? G1Q[0] : HOME[a.key] || [600, 400];
    const f = figs[a.key] || makeFig(a, start);
    f.a = a; if (a.where === "g1q") f.qIdx = gIdx++;
    f.g.dataset.status = a.status; f.g.dataset.flag = a.flag || "";
    f.g.classList.toggle("sel", selected === a.key);
    const scr = desks[a.key];
    if (scr) scr.setAttribute("fill", a.flag === "blocked" ? "#ff8f8f" : a.status === "active" ? "#62ead8" : "#0b1322");
    f.label = ""; f.labelCol = "";
    if (a.flag === "blocked") { f.label = "bị chặn"; f.labelCol = "#ff8f8f"; }
    else if (a.flag === "waiting") { f.label = `chờ lượt SolidWorks #${a.queuePos || ""}`; f.labelCol = "#ffca76"; }
    else if (a.where === "dev") { f.label = "đang trên DEV"; f.labelCol = "#ffca76"; }
    else if (a.sub) { f.label = `${a.sub} phiên con đang chạy`; f.labelCol = "#7fb7ff"; }
    f.shown = null; // buộc vẽ lại nhãn
    f.sub.textContent = "";
    for (let i = 0; i < Math.min(a.sub, 6); i++) E("circle", { cx: -24 + i * 9, cy: 60, r: 3.2, fill: COLOR[a.platform], opacity: .8 }, f.sub);
  }
  for (const e of s.events) {
    const id = `${e.t}|${e.from}|${e.to}|${e.title}`;
    if (seenMsg.has(id)) continue; seenMsg.add(id);
    if (!firstLoad && Date.now() - e.t < 120000) { flyMsg(e); queueHuddle(figs[e.from], figs[e.to], e.title); }
  }
  for (const m of s.signals || []) {
    const id = "mail|" + m.id; if (seenMsg.has(id)) continue; seenMsg.add(id);
    if (!firstLoad && Date.now() - m.t < 120000) queueHuddle(figByLabel(m.from), figByLabel(m.to), m.title);
  }
  firstLoad = false;
  renderCrew(s); renderSide(s);
}
function crewRow(c, a, dot, title, sub) {
  const b = html("button", "crew-row" + (a.key === selected ? " sel" : "")); b.type = "button";
  b.style.setProperty("--dot", dot);
  b.append(html("i")); const t = html("div"); t.append(html("b", "", title), html("small", "", sub)); b.append(t);
  b.onclick = () => select(a.key); c.appendChild(b);
}
function renderCrew(s) {
  const c = $("crew"); c.textContent = "";
  const list = s.agents.filter((a) => a.platform !== "human");
  const staff = CREW.filter((v) => figs[v.key] && !figs[v.key].hidden);
  $("crew-n").textContent = `(${list.length + staff.length})`;
  if (list.length) c.appendChild(html("div", "none crew-h", "Phiên đang mở"));
  for (const a of list) crewRow(c, a, a.flag === "blocked" ? "#ff8f8f" : a.flag === "waiting" ? "#ffca76" : STATUS_DOT[a.status] || "#4a5a74", first(a.name), a.role);
  c.appendChild(html("div", "none crew-h", "Nhân sự xưởng"));
  for (const v of staff) crewRow(c, v, v.color, v.name, figs[v.key].doing || v.role);
}
function renderSide(s) {
  const al = $("alerts"); al.textContent = "";
  if (!s.alerts.length) al.appendChild(html("div", "none", "Không có cảnh báo."));
  for (const a of s.alerts) al.appendChild(html("div", "alert " + (a.level === "warn" ? "warn" : ""), a.text));
  const d = $("detail"), a = s.agents.find((x) => x.key === selected) || (figs[selected] && figs[selected].a.virtual ? figs[selected].a : null);
  if (a) {
    let box = d.querySelector(".card-body");
    if (!box) { d.textContent = ""; box = html("div", "card-body"); d.appendChild(box); }
    box.textContent = "";
    const who = html("div", "who"); who.append(html("b", "", a.name), html("span", "badge", a.virtual ? "Nhân sự xưởng" : a.platform === "claude" ? "Claude" : "Người")); box.appendChild(who);
    if (a.virtual) {
      box.appendChild(html("div", "", `Đang: ${(figs[a.key] && figs[a.key].doing) || "Tại vị trí làm việc"}`));
      box.appendChild(html("p", "", "Nhân sự mô phỏng của xưởng: tự đi tuần theo vị trí công việc và họp giao ban ở phòng họp chung. Khi có phiên Claude Code cùng vai, phiên đó thế chỗ."));
      $("sel-time").textContent = ""; window.ChatBox && ChatBox.mount(d, { platform: "human" }); renderRest(s); return;
    }
    const st = { active: "đang làm", idle: "đang rảnh / chờ", away: "nghỉ lâu", offline: "không đọc được nhật ký" }[a.status] || a.status;
    box.appendChild(html("div", "", `Vai trò: ${a.role}`));
    box.appendChild(html("div", "", `Trạng thái: ${st}${a.flag === "blocked" ? " · bị chặn" : a.flag === "waiting" ? " · chờ lượt SolidWorks" : ""}`));
    box.appendChild(html("div", "", `Hoạt động gần nhất: ${ago(a.lastActive)} trước`));
    if (a.lastText) { const lp = html("p", "", "“" + a.lastText + "”"); lp.setAttribute("translate", "no"); box.appendChild(lp); }
    $("sel-time").textContent = a.lastTextAt ? fmtT(a.lastTextAt) : "";
    window.ChatBox && ChatBox.mount(d, a);
  } else if (!d.querySelector(".none")) { d.textContent = ""; d.appendChild(html("span", "none", "Bấm vào một người trên bản đồ.")); }
  renderRest(s);
}
function renderRest(s) {
  const tk = $("tasks"); tk.textContent = "";
  for (const t of s.tasks) {
    const row = html("div", "task " + t.state);
    row.appendChild(html("div", "tn", t.state === "done" ? "✓" : String(t.n)));
    const mid = html("div"); const nm = html("div", "tt", `${t.n}. ${t.name}`); nm.setAttribute("translate", "no"); mid.appendChild(nm);
    if (t.parts.length > 1) { const p = html("div", "tp"); for (const x of t.parts) p.appendChild(html("span", "chip" + (x.dat ? " ok" : ""), x.id)); mid.appendChild(p); }
    row.appendChild(mid);
    row.appendChild(html("div", "ts" + (t.lanSua >= 3 && t.state !== "done" ? " warnc" : ""), { done: "đạt", doing: "đang làm", todo: "chưa làm" }[t.state] + (t.lanSua ? ` · sửa ${t.lanSua}` : "")));
    tk.appendChild(row);
  }
  if (!s.tasks.length) tk.appendChild(html("div", "none", "Chưa có việc ưu tiên."));
  $("t-sum").textContent = `${s.tasks.filter((t) => t.state === "done").length}/${s.tasks.length}`;
  const name = (k) => first((s.agents.find((x) => x.key === k) || { name: k }).name);
  const items = [], day0 = new Date(); day0.setHours(0, 0, 0, 0);
  for (const e of s.events) if (e.t >= day0) items.push({ t: e.t, cls: e.kind === "ceo" ? "ceo" : "", a: `${name(e.from)} → ${name(e.to)}`, ttl: e.title });
  for (const r of s.dev.lastRows) if (r.t >= day0) items.push({ t: r.t, cls: "dev" + (r.fail ? " fail" : ""), a: `DEV · ${r.agent ? name(r.agent) : r.who}`, ttl: r.state });
  items.sort((x, y) => y.t - x.t);
  const tl = $("timeline"); tl.textContent = "";
  for (const it of items.slice(0, 60)) {
    const row = html("div", "ev " + it.cls); row.appendChild(html("time", "", fmtT(it.t)));
    const b = html("div"); const tt = html("div", "ttl", it.ttl); tt.setAttribute("translate", "no"); b.append(html("div", "a", it.a), tt); row.appendChild(b); tl.appendChild(row);
  }
  if (!items.length) tl.appendChild(html("div", "none", "Hôm nay chưa có hoạt động."));
}

// ===== nối dữ liệu =====
let lastMsgAt = 0;
function connect() {
  const es = new EventSource("events");
  es.onmessage = (m) => { lastMsgAt = Date.now(); $("live").className = "live"; try { render(JSON.parse(m.data)); } catch (e) { console.error(e); } };
  es.onerror = () => { $("live").className = "live off"; };
}
setInterval(async () => {
  if (Date.now() - lastMsgAt < 3000) return;
  try { const r = await fetch("state", { cache: "no-store" }); if (r.ok) { $("live").className = "live"; render(await r.json()); } }
  catch { $("live").className = "live off"; $("clock").textContent = "MẤT KẾT NỐI, ĐANG NỐI LẠI…"; }
}, 1000);
for (const v of CREW) { const f = makeFig(Object.assign({ platform: "virtual", virtual: true, status: "virtual", flag: "", sub: 0 }, v), v.home); f.g.dataset.status = "virtual"; }
try { const ct = localStorage.getItem("vp-title"), cs = localStorage.getItem("vp-sub"); if (ct) $("ttl").textContent = ct; if (cs) $("sub").textContent = cs; } catch {}
applyView();
connect();
