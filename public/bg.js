// Nền cơ khí hiện đại: ánh sáng loang chậm, lưới chấm mờ dần, vòng đo góc (encoder), bánh răng nét mảnh, vệt chạy dao ánh sáng, tia lửa nhỏ.
// Dùng chung cho trang Xưởng và các trang con.
(function () {
  "use strict";
  window.Motion = window.Motion || { paused: false };
  const NS = "http://www.w3.org/2000/svg";
  const S = (tag, attrs, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs || {}) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; };
  let host = document.getElementById("bg");
  if (!host) { host = document.createElement("div"); host.id = "bg"; host.className = "bg-sub"; host.setAttribute("aria-hidden", "true"); document.body.prepend(host); }
  if (!host.querySelector(".glow")) for (const c of ["a", "b", "c"]) { const g = document.createElement("div"); g.className = "glow " + c; host.appendChild(g); }
  const svg = S("svg", { viewBox: "0 0 1920 1080", preserveAspectRatio: "xMidYMid slice" }, host);
  const MINT = "#62ead8", BLUE = "#6aa8ff", AMB = "#ffca76";
  const d = S("defs", {}, svg);
  const grad = (id, a, b, x2 = 1, y2 = 1) => { const g = S("linearGradient", { id, x1: 0, y1: 0, x2, y2 }, d); S("stop", { offset: 0, "stop-color": a }, g); S("stop", { offset: 1, "stop-color": b }, g); };
  grad("bgStroke", MINT, BLUE); grad("bgStroke2", BLUE, "#9b8cff"); grad("bgTrail", MINT, "rgba(98,234,216,0)", 1, 0);
  const dots = S("pattern", { id: "bgDots", width: 36, height: 36, patternUnits: "userSpaceOnUse" }, d); S("circle", { cx: 1, cy: 1, r: 1, fill: "#8fb3e8" }, dots);
  const fade = S("radialGradient", { id: "bgFade", cx: "50%", cy: "45%", r: "70%" }, d);
  S("stop", { offset: 0, "stop-color": "#fff", "stop-opacity": .85 }, fade); S("stop", { offset: 1, "stop-color": "#fff", "stop-opacity": .05 }, fade);
  const mk = S("mask", { id: "bgMask" }, d); S("rect", { width: 1920, height: 1080, fill: "url(#bgFade)" }, mk);
  S("rect", { width: 1920, height: 1080, fill: "url(#bgDots)", mask: "url(#bgMask)", opacity: .28 }, svg);

  // ----- vòng đo góc (encoder) với vạch chia, quay chậm -----
  function dial(cx, cy, r, dur, rev, stroke) {
    const g = S("g", { transform: `translate(${cx},${cy})`, opacity: .55 }, svg);
    const spin = S("g", { class: "gear" + (rev ? " r" : ""), style: `--t:${dur}s` }, g);
    S("circle", { r, fill: "none", stroke, "stroke-width": 1.2, opacity: .7 }, spin);
    S("circle", { r: r - 14, fill: "none", stroke, "stroke-width": 10, "stroke-dasharray": "1.4 " + (2 * Math.PI * (r - 14) / 180 - 1.4).toFixed(2), opacity: .55 }, spin);
    S("circle", { r: r - 34, fill: "none", stroke, "stroke-width": 1, "stroke-dasharray": "90 14 4 14", opacity: .5 }, spin);
    S("circle", { r: r * .45, fill: "none", stroke, "stroke-width": 1, opacity: .45 }, g);
    S("path", { d: `M${-r} 0H${r}M0 ${-r}V${r}`, stroke, "stroke-width": .8, opacity: .35, "stroke-dasharray": "14 6 2 6" }, g);
    S("circle", { r: 4, fill: AMB, opacity: .9 }, g);
  }
  dial(1730, 170, 230, 160, false, "url(#bgStroke)"); dial(150, 950, 270, 220, true, "url(#bgStroke2)");

  // ----- bánh răng nét mảnh ăn khớp -----
  function gearPath(r, teeth, th) {
    const step = Math.PI * 2 / teeth, ri = r - th / 2, ro = r + th / 2; let p = "";
    for (let i = 0; i < teeth; i++) {
      const a = i * step;
      [[ri, a - step * .5], [ro, a - step * .18], [ro, a + step * .18], [ri, a + step * .5]].forEach(([rad, ang], k) => { p += (i === 0 && k === 0 ? "M" : "L") + (Math.cos(ang) * rad).toFixed(1) + " " + (Math.sin(ang) * rad).toFixed(1); });
    }
    return p + "Z";
  }
  function gear(g) {
    const th = g.r * .16, o = S("g", { transform: `translate(${g.x},${g.y}) rotate(${g.rot})`, opacity: g.op }, svg);
    const sp = S("g", { class: "gear" + (g.rev ? " r" : ""), style: `--t:${g.dur}s` }, o);
    S("path", { d: gearPath(g.r, g.t, th), fill: g.c, "fill-opacity": .04, stroke: g.c, "stroke-width": 1.4, "stroke-linejoin": "round" }, sp);
    S("circle", { r: g.r * .58, fill: "none", stroke: g.c, "stroke-width": .8, "stroke-dasharray": "3 7" }, sp);
    S("circle", { r: g.r * .2, fill: "none", stroke: g.c, "stroke-width": 1.4 }, sp);
    for (let k = 0; k < 5; k++) { const a = k * Math.PI * 2 / 5; S("path", { d: `M${Math.cos(a) * g.r * .2} ${Math.sin(a) * g.r * .2}L${Math.cos(a) * g.r * .58} ${Math.sin(a) * g.r * .58}`, stroke: g.c, "stroke-width": .8 }, sp); }
    return { ...g, step: 360 / g.t };
  }
  const base = gear({ x: 1790, y: 930, r: 150, t: 26, rot: 0, c: "url(#bgStroke)", op: .5, dur: 130, rev: false });
  { // bánh nhỏ ăn khớp: răng cha nằm đúng hướng nối tâm, thung lũng con quay vào đó
    const t = 14, r = 81, stepC = 360 / t, th = base.rot + Math.round((200 - base.rot) / base.step) * base.step, rad = th * Math.PI / 180;
    gear({ x: base.x + Math.cos(rad) * (base.r + r), y: base.y + Math.sin(rad) * (base.r + r), r, t, rot: th + 180 + stepC / 2, c: "url(#bgStroke2)", op: .5, dur: 130 * t / base.t, rev: true });
  }

  // ----- vệt chạy dao: đường cong ánh sáng trôi -----
  const trails = ["M-100 760C300 560 520 900 940 700S1500 380 2040 520", "M-100 300C260 380 520 160 900 300S1500 560 2040 300", "M-100 1000C400 860 800 1040 1200 900S1700 780 2040 880"];
  trails.forEach((dd, i) => {
    S("path", { d: dd, fill: "none", stroke: "url(#bgStroke" + (i % 2 ? "2" : "") + ")", "stroke-width": 1, opacity: .22 }, svg);
    S("path", { class: "trail", d: dd, fill: "none", stroke: i % 2 ? BLUE : MINT, "stroke-width": 2.2, "stroke-linecap": "round", "stroke-dasharray": "90 1400", opacity: .6, style: `--t:${14 + i * 5}s;animation-delay:-${i * 4}s` }, svg);
  });

  // ----- dấu căn góc kiểu bản vẽ -----
  const reg = S("g", { stroke: MINT, "stroke-width": 1.2, fill: "none", opacity: .35 }, svg);
  [[24, 24, 1, 1], [1896, 24, -1, 1], [24, 1056, 1, -1], [1896, 1056, -1, -1]].forEach(([x, y, sx, sy]) => S("path", { d: `M${x} ${y + 34 * sy}V${y}H${x + 34 * sx}` }, reg));

  // ----- tia lửa / hạt sáng -----
  for (let k = 0; k < 24; k++) {
    const r = .8 + Math.random() * 1.6;
    S("circle", { class: "rise", cx: Math.random() * 1920, cy: 1080 + Math.random() * 40, r, fill: k % 5 ? MINT : AMB, style: `--t:${16 + Math.random() * 22}s;animation-delay:-${(Math.random() * 34).toFixed(1)}s` }, svg);
  }

  // ===== lớp cơ khí đậm: lưới bản vẽ, thép phay xước, sọc cảnh báo, bu lông, xích tải, xi lanh, kích thước dung sai =====
  const steel = S("pattern", { id: "bgBrush", width: 6, height: 6, patternUnits: "userSpaceOnUse" }, d);
  S("path", { d: "M0 1H6M0 4H6", stroke: "#9fb4d0", "stroke-width": .5, opacity: .5 }, steel);
  S("rect", { width: 1920, height: 1080, fill: "url(#bgBrush)", opacity: .05 }, svg);
  const grid = S("pattern", { id: "bgGrid", width: 160, height: 160, patternUnits: "userSpaceOnUse" }, d);
  S("path", { d: "M160 0H0V160", fill: "none", stroke: "#6aa8ff", "stroke-width": 1, opacity: .45 }, grid);
  S("path", { d: "M40 0V160M80 0V160M120 0V160M0 40H160M0 80H160M0 120H160", fill: "none", stroke: "#6aa8ff", "stroke-width": .4, opacity: .35 }, grid);
  S("rect", { width: 1920, height: 1080, fill: "url(#bgGrid)", mask: "url(#bgMask)", opacity: .35 }, svg);
  // sọc vàng-đen cảnh báo ở mép trên và dưới
  const hz = S("pattern", { id: "bgHaz", width: 28, height: 28, patternUnits: "userSpaceOnUse", patternTransform: "rotate(45)" }, d);
  S("rect", { width: 14, height: 28, fill: "#ffca76" }, hz); S("rect", { x: 14, width: 14, height: 28, fill: "#0a0f18" }, hz);
  S("rect", { x: 0, y: 0, width: 1920, height: 10, fill: "url(#bgHaz)", opacity: .42 }, svg);
  S("rect", { x: 0, y: 1070, width: 1920, height: 10, fill: "url(#bgHaz)", opacity: .42 }, svg);
  // bu lông lục giác ở bốn góc và giữa các cạnh
  function bolt(x, y, r) {
    const g = S("g", { transform: `translate(${x},${y})`, opacity: .7 }, svg);
    S("circle", { r: r + 5, fill: "#0e1726", stroke: "#52698a", "stroke-width": 1.2 }, g);
    S("path", { d: Array.from({ length: 6 }, (_, i) => { const a = i * Math.PI / 3; return (i ? "L" : "M") + (Math.cos(a) * r).toFixed(1) + " " + (Math.sin(a) * r).toFixed(1); }).join("") + "Z", fill: "#1b2a41", stroke: "#8aa3c4", "stroke-width": 1.2 }, g);
    S("circle", { r: r * .38, fill: "#0a1220", stroke: "#8aa3c4", "stroke-width": .8 }, g);
  }
  [[58, 58], [1862, 58], [58, 1022], [1862, 1022], [960, 40], [960, 1040], [40, 540], [1880, 540]].forEach(([x, y]) => bolt(x, y, 11));
  // xích tải chạy dọc mép dưới
  S("rect", { x: 0, y: 1040, width: 1920, height: 18, fill: "#0b1322", opacity: .75 }, svg);
  S("path", { d: "M0 1049H1920", stroke: "#8aa3c4", "stroke-width": 12, "stroke-dasharray": "14 8", opacity: .38, class: "trail", style: "--t:1.2s;animation-name:bgchain" }, svg);
  S("path", { d: "M0 1041H1920M0 1057H1920", stroke: "#52698a", "stroke-width": 1.4, opacity: .8 }, svg);
  // hai xi lanh thủy lực, ty đẩy lên xuống
  function piston(x, y, dur, delay) {
    const g = S("g", { transform: `translate(${x},${y})`, opacity: .6 }, svg);
    S("rect", { x: -22, y: 0, width: 44, height: 150, rx: 6, fill: "#0e1726", stroke: "#52698a", "stroke-width": 1.6 }, g);
    for (let k = 1; k < 5; k++) S("path", { d: `M-22 ${k * 30}H22`, stroke: "#31476a", "stroke-width": 1 }, g);
    const rod = S("g", { class: "pist", style: `--t:${dur}s;animation-delay:-${delay}s` }, g);
    S("rect", { x: -7, y: -110, width: 14, height: 130, fill: "#a9bdd6", opacity: .65 }, rod);
    S("rect", { x: -26, y: -128, width: 52, height: 18, rx: 4, fill: "#1b2a41", stroke: "#ffca76", "stroke-width": 1.6 }, rod);
  }
  piston(1500, 880, 5, 0); piston(1570, 880, 5, 2.5);
  // kích thước và dung sai kiểu bản vẽ kỹ thuật
  function dim(x1, y1, x2, y2, txt) {
    const g = S("g", { stroke: AMB, "stroke-width": 1, fill: "none", opacity: .5 }, svg), vert = x1 === x2;
    S("path", { d: `M${x1} ${y1}L${x2} ${y2}` }, g);
    S("path", { d: vert ? `M${x1 - 8} ${y1}H${x1 + 8}M${x2 - 8} ${y2}H${x2 + 8}` : `M${x1} ${y1 - 8}V${y1 + 8}M${x2} ${y2 - 8}V${y2 + 8}` }, g);
    const t = S("text", { x: vert ? x1 - 14 : (x1 + x2) / 2, y: vert ? (y1 + y2) / 2 : y1 - 12, "text-anchor": vert ? "end" : "middle", fill: AMB, stroke: "none", "font-size": 15, "font-family": "ui-monospace,monospace" }, g); t.textContent = txt;
  }
  dim(300, 120, 700, 120, "Ø 25 H7 ±0.02"); dim(1240, 90, 1640, 90, "120.00 ±0.05"); dim(70, 300, 70, 620, "R 8 · Ra 1.6");
  // tối viền cho nội dung nổi bật
  const vig = S("radialGradient", { id: "bgVig", cx: "50%", cy: "50%", r: "75%" }, d);
  S("stop", { offset: .5, "stop-color": "#060b16", "stop-opacity": 0 }, vig); S("stop", { offset: 1, "stop-color": "#060b16", "stop-opacity": .7 }, vig);
  S("rect", { width: 1920, height: 1080, fill: "url(#bgVig)" }, svg);
})();
