// Thanh điều hướng đã nằm sẵn trong HTML (không chớp khi chuyển trang). File này chỉ cập nhật đồng hồ, tên xưởng và nạp nền cơ khí.
(function () {
  "use strict";
  const bar = document.querySelector(".vp-bar"); if (!bar) return;
  const fit = () => { document.body.style.paddingTop = bar.offsetHeight + "px"; };
  fit(); addEventListener("resize", fit);
  const clock = bar.querySelector("#vp-clock");
  const tick = () => { clock.textContent = "TRỰC TIẾP · " + new Date().toLocaleTimeString("vi-VN"); };
  tick(); setInterval(tick, 1000);
  fetch("state", { cache: "no-store" }).then((r) => r.json()).then((s) => {
    const t = bar.querySelector("#vp-ttl"), u = bar.querySelector("#vp-sub");
    if (s.title && t.textContent.toLowerCase() !== s.title.toLowerCase()) t.textContent = s.title;
    if (s.subtitle && u.textContent.toLowerCase() !== s.subtitle.toLowerCase()) u.textContent = s.subtitle;
  }).catch(() => {});
  const bg = document.createElement("script"); bg.src = "bg.js"; document.body.appendChild(bg);
})();
