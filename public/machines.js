// Máy móc 2D nhìn từ trên xuống, có biên dạng đầy đủ và đang vận hành. Mọi chuyển động là CSS/SMIL, nên nút "Dừng" dừng được hết.
"use strict";
const NS = "http://www.w3.org/2000/svg";
function E(tag, attrs, parent) {
  const e = document.createElementNS(NS, tag);
  for (const k in attrs || {}) e.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(e);
  return e;
}
// Mỗi máy lệch pha nhau để không chạy đồng loạt.
const A = (i, dur, extra = "") => `animation-duration:${dur}s;animation-delay:-${((i * 1.37) % dur).toFixed(2)}s;${extra}`;
const MC = { body: "url(#mBody)", edge: "#3f5f8f", glass: "#0a1626", mint: "#62ead8", amber: "#ffca76" };

function machineDefs(svg) {
  const d = E("defs", {}, svg);
  const lg = (id, stops, x2 = 0, y2 = 1) => { const g = E("linearGradient", { id, x1: 0, y1: 0, x2, y2 }, d); stops.forEach(([o, c]) => E("stop", { offset: o, "stop-color": c }, g)); };
  lg("mBody", [[0, "#17294a"], [1, "#0d1829"]]);
  lg("mAlu", [[0, "#e4eefa"], [1, "#8aa3c4"]], 1, 1);
  lg("mPrint", [[0, "#ffb15c"], [1, "#e0661f"]]);
  const p = E("pattern", { id: "mShaft", width: 6, height: 6, patternUnits: "userSpaceOnUse" }, d);
  E("rect", { width: 6, height: 6, fill: "#9db4d0" }, p); E("rect", { width: 6, height: 2, fill: "#eef5fc" }, p);
  E("animateTransform", { attributeName: "patternTransform", type: "translate", from: "0 0", to: "0 6", dur: ".3s", repeatCount: "indefinite" }, p);
  const h = E("pattern", { id: "mHazard", width: 16, height: 16, patternUnits: "userSpaceOnUse", patternTransform: "rotate(45)" }, d);
  E("rect", { width: 16, height: 16, fill: "#1b1f26" }, h); E("rect", { width: 8, height: 16, fill: "#ffca76" }, h);
}
const mg = (P, x, y, title) => { const g = E("g", { class: "m", transform: `translate(${x},${y})` }, P); if (title) E("title", {}, g).textContent = title; return g; };
const R = (g, x, y, w, h, fill, stroke, rx = 3, more = {}) => E("rect", { x, y, width: w, height: h, rx, fill, ...(stroke ? { stroke } : {}), ...more }, g);
const L = (g, x1, y1, x2, y2, stroke, w = 1, more = {}) => E("line", { x1, y1, x2, y2, stroke, "stroke-width": w, ...more }, g);
const C = (g, cx, cy, r, fill, stroke, more = {}) => E("circle", { cx, cy, r, fill, ...(stroke ? { stroke } : {}), ...more }, g);
const T = (g, x, y, t, cls = "mlabel") => { const e = E("text", { x, y, class: cls }, g); e.textContent = t; return e; };

// Máy phay CNC 3 trục: bàn chạy X, cổng chạy Y, đầu trục chính chạy ngang, mũi dao quay, ổ dao xoay, đèn tháp.
function cnc(P, x, y, i, name) {
  const g = mg(P, x, y, "Máy phay CNC " + name);
  R(g, 0, 0, 150, 170, MC.body, MC.edge, 8, { "stroke-width": 1.5 });
  R(g, 116, 10, 28, 62, MC.glass, "#31476a", 4);
  R(g, 120, 14, 20, 16, MC.mint, null, 2, { opacity: .75, class: "bl", style: A(i, 2.4) });
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) C(g, 122 + c * 8, 40 + r * 9, 2.4, (r * 3 + c) % 4 === 0 ? MC.amber : "#31476a");
  R(g, 10, 10, 100, 122, MC.glass, MC.mint, 5, { "stroke-opacity": .45 });
  const t = E("g", { class: "mx", style: A(i, 4.6, "--a:-8px;--b:8px") }, g);
  R(t, 20, 84, 80, 40, "#14243d", "#4a6a9a", 2);
  for (let k = 0; k < 4; k++) L(t, 20, 92 + k * 9, 100, 92 + k * 9, "#2a4064");
  R(t, 36, 92, 48, 24, "url(#mAlu)", null, 2); R(t, 46, 98, 28, 12, MC.glass, null, 1);
  const gy = E("g", { class: "my", style: A(i, 6, "--a:0px;--b:62px") }, g);
  R(gy, 14, 30, 92, 7, "#4a6a9a", "#7f90aa", 3);
  const hx = E("g", { class: "mx", style: A(i + 1, 3.3, "--a:-24px;--b:24px") }, gy);
  R(hx, 51, 24, 18, 22, "#6b8fbf", "#9db4d0", 3); C(hx, 60, 36, 5.5, MC.glass, MC.mint);
  const s = E("g", { class: "sp", style: A(0, .45) }, hx);
  L(s, 55.5, 36, 64.5, 36, MC.mint, 1.4); L(s, 60, 31.5, 60, 40.5, MC.mint, 1.4);
  C(hx, 60, 36, 9, "none", MC.amber, { class: "pu", style: A(i, 1.1), opacity: .8 });
  C(g, 34, 150, 15, MC.glass, "#31476a");
  const mag = E("g", { class: "rv", style: A(i, 8) }, g);
  for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2; C(mag, 34 + Math.cos(a) * 9, 150 + Math.sin(a) * 9, 2.6, k === 0 ? MC.amber : "#4a6a9a"); }
  C(g, 98, 152, 4, "#ff8f8f", null, { opacity: .25 }); C(g, 110, 152, 4, MC.amber, null, { opacity: .25 });
  C(g, 122, 152, 4, MC.mint, null, { class: "bl", style: A(i, 2) });
  T(g, 75, 184, name);
}

// Máy tiện: mâm cặp + phôi quay (họa tiết chạy), bàn dao chạy dọc, ụ động.
function lathe(P, x, y, i) {
  const g = mg(P, x, y, "Máy tiện");
  R(g, 0, 44, 230, 44, MC.body, MC.edge, 4);
  L(g, 0, 56, 230, 56, "#4a6a9a"); L(g, 0, 76, 230, 76, "#4a6a9a");
  R(g, 0, 8, 62, 80, "#16273f", "#4a6a9a", 5);
  R(g, 8, 14, 24, 12, MC.mint, null, 2, { opacity: .75, class: "bl", style: A(i, 2.8) });
  C(g, 14, 70, 6, "none", "#4a6a9a"); C(g, 36, 70, 6, "none", "#4a6a9a");
  R(g, 62, 24, 18, 48, "#24344c", "#7f90aa", 3); R(g, 62, 24, 18, 48, "url(#mShaft)", null, 3, { opacity: .7 });
  R(g, 80, 40, 96, 16, "url(#mShaft)", "#9db4d0", 2);
  R(g, 188, 30, 40, 58, "#16273f", "#4a6a9a", 5); R(g, 174, 44, 14, 8, "#7f90aa", null, 1);
  C(g, 208, 70, 8, "none", "#4a6a9a");
  const car = E("g", { class: "mx", style: A(i, 3.8, "--a:30px;--b:-34px") }, g);
  R(car, 118, 20, 34, 22, "#4a6a9a", "#9db4d0", 3); R(car, 126, 34, 8, 8, MC.amber, null, 1);
  C(car, 130, 42, 3.2, MC.amber, null, { class: "bl", style: "animation-duration:.18s" });
  T(g, 115, 108, "TIỆN CNC");
}

// Máy in 3D FDM: cổng Y, đầu in X, vật thể đang cao dần, thanh tiến độ, cuộn nhựa quay.
function fdm(P, x, y, i) {
  const g = mg(P, x, y, "Máy in 3D FDM");
  R(g, 0, 0, 70, 80, MC.body, MC.edge, 5);
  R(g, 8, 18, 54, 54, MC.glass, "#31476a", 2);
  for (let k = 1; k < 3; k++) { L(g, 8 + k * 18, 18, 8 + k * 18, 72, "#1b2c47"); L(g, 8, 18 + k * 18, 62, 18 + k * 18, "#1b2c47"); }
  R(g, 25, 37, 20, 20, "url(#mPrint)", null, 2, { class: "gr", style: A(i, 7) });
  const gy = E("g", { class: "my", style: A(i, 5, "--a:0px;--b:40px") }, g);
  R(gy, 6, 17, 58, 4, "#8a9bb5", null, 2);
  const hd = E("g", { class: "mx", style: A(i, 1.7, "--a:-20px;--b:20px") }, gy);
  R(hd, 30, 14, 10, 10, MC.amber, "#fff", 2); C(hd, 35, 19, 2, MC.glass);
  R(g, 26, 4, 38, 7, MC.glass, "#31476a", 2); R(g, 27, 5, 36, 5, MC.mint, null, 1, { class: "pg", style: A(i, 8) });
  C(g, 12, 8, 6, "none", "#ff9a3c", { "stroke-width": 2 });
  const sp = E("g", { class: "sp", style: A(i, 2.2) }, g); L(sp, 8, 8, 16, 8, "#ff9a3c"); L(sp, 12, 4, 12, 12, "#ff9a3c");
  C(g, 64, 76, 2.2, MC.mint, null, { class: "bl", style: A(i, 1.6) });
}

// Máy in 3D nhựa lỏng SLA: nắp cam trong suốt, tia laser quét raster.
function sla(P, x, y, i) {
  const g = mg(P, x, y, "Máy in SLA nhựa lỏng");
  R(g, 0, 0, 90, 90, MC.body, MC.edge, 8);
  R(g, 8, 8, 74, 74, "#ff9a3c", "#ff9a3c", 6, { "fill-opacity": .12 });
  R(g, 18, 18, 54, 54, "#7a4a10", "#b46bff", 3, { "fill-opacity": .55, "stroke-opacity": .5 });
  C(g, 45, 45, 14, "#b46bff", null, { class: "pu", style: A(i, 2), opacity: .15 });
  const sy = E("g", { class: "my", style: A(i, 4.2, "--a:0px;--b:48px") }, g);
  L(sy, 18, 20, 72, 20, "#b46bff", 1.4, { opacity: .85 });
  const sx = E("g", { class: "mx", style: A(i, .8, "--a:-26px;--b:26px") }, sy);
  C(sx, 45, 20, 3.4, "#e6c4ff", "#b46bff");
  C(g, 80, 86, 2.2, MC.mint, null, { class: "bl", style: A(i, 1.9) });
  T(g, 45, 104, "SLA");
}

// Cưa vòng: lưỡi cưa chạy liên tục, phôi được đẩy vào.
function saw(P, x, y, i) {
  const g = mg(P, x, y, "Máy cưa");
  R(g, 0, 0, 100, 64, MC.body, MC.edge, 4);
  R(g, 62, 0, 4, 64, MC.glass, null, 1);
  L(g, 64, 0, 64, 64, "#dbe8fa", 1.6, { class: "dsh", style: "animation-duration:.12s" });
  R(g, 4, 24, 40, 16, "url(#mAlu)", "#9db4d0", 2, { class: "mx", style: A(i, 3.2, "--a:0px;--b:16px") });
  R(g, 0, 50, 100, 6, "#31476a", null, 2);
  C(g, 66, 32, 4, MC.amber, null, { class: "bl", style: "animation-duration:.2s" });
  T(g, 50, 78, "CƯA");
}

// Máy khoan bàn: đầu khoan quay, mũi khoan ấn xuống nhấp nhô.
function drill(P, x, y, i) {
  const g = mg(P, x, y, "Máy khoan bàn");
  R(g, 0, 0, 60, 64, MC.body, MC.edge, 5);
  C(g, 30, 38, 22, "#16273f", "#4a6a9a");
  R(g, 18, 30, 24, 16, "url(#mAlu)", "#9db4d0", 2); C(g, 25, 38, 1.6, MC.glass); C(g, 35, 38, 1.6, MC.glass);
  C(g, 30, 22, 13, "#4a6a9a", "#9db4d0");
  const sp = E("g", { class: "sp", style: A(i, .35) }, g); L(sp, 25, 22, 35, 22, MC.amber, 1.6); L(sp, 30, 17, 30, 27, MC.amber, 1.6);
  C(g, 30, 22, 7, "none", MC.mint, { class: "pu", style: A(i, 1.5), opacity: .8 });
  T(g, 30, 78, "KHOAN");
}

// Bàn nguội: ê tô có tay quay, dũa chạy tới lui, khay chi tiết.
function bench(P, x, y, i) {
  const g = mg(P, x, y, "Bàn nguội");
  R(g, 0, 0, 130, 60, "#1a2538", MC.edge, 4);
  R(g, 8, 8, 24, 26, "#4a6a9a", "#9db4d0", 3); R(g, 12, 14, 16, 8, "url(#mAlu)", null, 1);
  const h = E("g", {}, g);
  L(h, 20, 40, 20, 50, "#cfe0ff", 2); C(h, 20, 40, 2.6, "#cfe0ff");
  E("animateTransform", { attributeName: "transform", type: "rotate", values: "-30 20 40;30 20 40;-30 20 40", dur: "1.6s", repeatCount: "indefinite" }, h);
  R(g, 42, 14, 44, 7, MC.amber, "#fff", 2, { class: "mx", style: A(i, .55, "--a:0px;--b:10px") });
  R(g, 94, 8, 28, 22, "none", "#31476a", 2, { "stroke-dasharray": "3 3" });
  C(g, 102, 19, 4, "#8aa3c4"); R(g, 110, 14, 8, 10, "#8aa3c4", null, 1);
  L(g, 8, 52, 122, 52, "#31476a", 1, { "stroke-dasharray": "4 4" });
}

function cabinet(P, x, y, i) {
  const g = mg(P, x, y, "Tủ dụng cụ");
  R(g, 0, 0, 60, 100, MC.body, MC.edge, 4);
  for (let k = 0; k < 5; k++) {
    const d = E("g", k === 2 ? { class: "mx", style: A(i, 3.4, "--a:0px;--b:5px") } : {}, g);
    R(d, 6, 8 + k * 18, 48, 14, "#16273f", "#31476a", 2); R(d, 22, 13 + k * 18, 16, 3, "#7f90aa", null, 1);
  }
}
function shelf(P, x, y) {
  const g = mg(P, x, y, "Kệ chi tiết");
  R(g, 0, 0, 140, 50, "#101a2b", MC.edge, 3);
  [["#4a6a9a", 8, 24], ["#8aa3c4", 40, 16], ["#ff9a3c", 64, 20], ["#62ead8", 92, 14], ["#7fb7ff", 112, 22]].forEach(([c, px, w], k) => R(g, px, 8 + k % 2 * 6, w, 28 - k % 2 * 6, c, null, 2, { opacity: .55 }));
  L(g, 0, 40, 140, 40, "#31476a");
}

// Cầu trục: xe con chạy dọc ray, móc treo.
function crane(P, x1, x2, y, i) {
  const g = mg(P, 0, 0, "Cầu trục");
  R(g, x1, y - 7, x2 - x1, 4, "url(#mHazard)", null, 1); R(g, x1, y + 3, x2 - x1, 4, "url(#mHazard)", null, 1);
  const tr = E("g", { class: "mx", style: A(i, 30, `--a:0px;--b:${x2 - x1 - 60}px`) }, g);
  R(tr, x1, y - 12, 44, 24, "#6b8fbf", MC.amber, 4); C(tr, x1 + 22, y, 6, MC.glass, MC.amber);
  C(tr, x1 + 22, y, 11, "none", MC.amber, { class: "pu", style: A(i, 2), opacity: .6 });
}

// Máy đo CMM: cầu đo chạy X, đầu dò chạy Y.
function cmm(P, x, y, i) {
  const g = mg(P, x, y, "Máy đo tọa độ CMM");
  R(g, 0, 8, 150, 82, MC.body, MC.edge, 5); R(g, 10, 18, 130, 62, "#0a1626", "#31476a", 3);
  R(g, 62, 34, 40, 30, "url(#mAlu)", null, 3, { opacity: .85 });
  const br = E("g", { class: "mx", style: A(i, 6, "--a:0px;--b:104px") }, g);
  R(br, 14, 14, 10, 70, "#4a6a9a", "#9db4d0", 3);
  const pr = E("g", { class: "my", style: A(i, 2.3, "--a:0px;--b:44px") }, br);
  C(pr, 19, 28, 4, MC.amber, "#fff"); C(pr, 19, 28, 8, "none", MC.mint, { class: "pu", style: A(i, 1.2) });
  T(g, 75, 106, "CMM");
}
function plate(P, x, y) {
  const g = mg(P, x, y, "Bàn rà + đồng hồ so");
  R(g, 0, 0, 70, 56, "#16273f", MC.edge, 4); R(g, 8, 8, 54, 40, "#0a1626", "#31476a", 2);
  C(g, 22, 28, 11, "#0a1626", "#8aa3c4");
  const n = E("g", {}, g); L(n, 22, 28, 22, 19, MC.amber, 1.6);
  E("animateTransform", { attributeName: "transform", type: "rotate", values: "-50 22 28;50 22 28;-50 22 28", dur: "2.4s", repeatCount: "indefinite" }, n);
  R(g, 40, 22, 16, 16, "url(#mAlu)", null, 2);
  T(g, 35, 72, "BÀN RÀ");
}
// Tủ máy chủ PDM: đèn LED nhấp nháy.
function rack(P, x, y, w, h, i) {
  const g = mg(P, x, y, "Tủ máy chủ PDM");
  R(g, 0, 0, w, h, MC.body, MC.edge, 4);
  for (let k = 0; k < Math.floor((h - 8) / 12); k++) {
    R(g, 5, 5 + k * 12, w - 10, 9, "#0a1626", "#31476a", 2);
    C(g, 11, 9.5 + k * 12, 2, (k + i) % 3 ? MC.mint : MC.amber, null, { class: "bl", style: A(i + k, 1.3 + (k % 3) * .5) });
  }
}
// Bàn tròn họp + màn hình trình chiếu + bảng trắng.
function meeting(P, cx, cy) {
  const g = mg(P, 0, 0, "Phòng họp");
  R(g, cx - 56, 304, 112, 8, "#31476a", null, 3);
  R(g, cx - 50, 306, 100, 4, MC.mint, null, 1, { opacity: .5, class: "bl", style: "animation-duration:4s" });
  C(g, cx, cy, 42, "#0b1322", MC.mint, { "stroke-width": 2 });
  C(g, cx, cy, 30, "none", "#24344c", { "stroke-dasharray": "3 4" });
  for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2; R(g, cx + Math.cos(a) * 58 - 8, cy + Math.sin(a) * 58 - 8, 16, 16, "#24344c", "#31476a", 5); }
  R(g, 520, 330, 8, 90, "#16273f", "#31476a", 2);
}
