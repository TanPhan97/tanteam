// Thanh điều hướng đã nằm sẵn trong HTML (không chớp khi chuyển trang). File này chỉ cập nhật đồng hồ, tên xưởng và nạp nền cơ khí.
(function () {
  "use strict";
  const bar = document.querySelector(".vp-bar"); if (!bar) return;
  const fit = () => { document.body.style.paddingTop = bar.offsetHeight + "px"; };
  fit(); addEventListener("resize", fit);
  if (window.ResizeObserver) new ResizeObserver(fit).observe(bar); // thanh xuống dòng thì nội dung dịch theo, không giật
  // Tên xưởng: dùng bản đã nhớ ngay từ đầu để không nháy chữ mặc định → tên thật mỗi lần chuyển trang
  try {
    const ct = localStorage.getItem("vp-title"), cs = localStorage.getItem("vp-sub");
    if (ct) bar.querySelector("#vp-ttl").textContent = ct; if (cs) bar.querySelector("#vp-sub").textContent = cs;
  } catch {}
  const clock = bar.querySelector("#vp-clock");
  const tick = () => { clock.textContent = "TRỰC TIẾP · " + new Date().toLocaleTimeString("vi-VN"); };
  tick(); setInterval(tick, 1000);
  fetch("state", { cache: "no-store" }).then((r) => r.json()).then((s) => {
    const t = bar.querySelector("#vp-ttl"), u = bar.querySelector("#vp-sub");
    try { if (s.title) localStorage.setItem("vp-title", s.title.toUpperCase()); if (s.subtitle) localStorage.setItem("vp-sub", s.subtitle.toUpperCase()); } catch {}
    if (s.title && t.textContent.toLowerCase() !== s.title.toLowerCase()) t.textContent = s.title;
    if (s.subtitle && u.textContent.toLowerCase() !== s.subtitle.toLowerCase()) u.textContent = s.subtitle;
  }).catch(() => {});
  const bg = document.createElement("script"); bg.src = "bg.js"; document.body.appendChild(bg);
})();
