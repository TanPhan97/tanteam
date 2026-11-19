// Phần chung cho mọi trang: chế độ nhẹ (giảm lag), huy hiệu hòm thư trên thanh điều hướng.
(function () {
  "use strict";
  const root = document.documentElement;
  let pref = null; try { pref = localStorage.getItem("vp-lite"); } catch {}      // "1" bật tay · "0" tắt tay · "a" tự bật do máy yếu · null = tự quyết
  let lite = pref === "1" || pref === "a";
  function paint() {
    root.classList.toggle("lite", lite);
    document.querySelectorAll("[data-lite-btn]").forEach((b) => { b.setAttribute("aria-pressed", String(lite)); b.textContent = lite ? "⚡ Nhẹ: bật" : "⚡ Nhẹ"; b.title = lite ? "Đang tắt hiệu ứng nền để chạy mượt. Bấm để bật lại." : "Tắt hiệu ứng nền và máy chạy để mượt hơn"; });
  }
  window.VPLite = { get: () => lite, toggle() { lite = !lite; try { localStorage.setItem("vp-lite", lite ? "1" : "0"); } catch {} pref = lite ? "1" : "0"; paint(); }, paint };
  paint();
  document.addEventListener("click", (e) => { if (e.target.closest && e.target.closest("[data-lite-btn]")) window.VPLite.toggle(); });
  document.addEventListener("DOMContentLoaded", paint);

  // Tự phát hiện máy giật: đo nhịp khung hình 5 giây đầu; dưới ~30 khung/giây thì bật chế độ nhẹ (người dùng tắt tay thì không can thiệp)
  if (pref !== "0" && !lite && !matchMedia("(prefers-reduced-motion:reduce)").matches) {
    let prev = 0, n = 0; const dts = [], t0 = performance.now();
    const tick = (t) => {
      if (document.hidden) { prev = 0; return requestAnimationFrame(tick); }
      if (prev && t - t0 > 1500) { dts.push(t - prev); n++; }
      prev = t;
      if (t - t0 < 6500) return requestAnimationFrame(tick);
      if (dts.length > 40) { dts.sort((a, b) => a - b); const med = dts[dts.length >> 1], p90 = dts[Math.floor(dts.length * .9)]; if (med > 30 || p90 > 55) { lite = true; try { localStorage.setItem("vp-lite", "a"); } catch {} paint(); } }
    };
    requestAnimationFrame(tick);
  }

  // Huy hiệu số tin chưa xong ở "Hòm thư"
  function badge() {
    if (document.hidden) return;
    fetch("hopthu", { cache: "no-store" }).then((r) => r.json()).then((d) => {
      const n = (d.tong && d.tong.open) || 0;
      document.querySelectorAll('[data-badge="ht"]').forEach((b) => { b.hidden = !n; b.textContent = n > 99 ? "99+" : n; });
    }).catch(() => {});
  }
  document.addEventListener("DOMContentLoaded", () => { badge(); setInterval(badge, 15000); });
})();
