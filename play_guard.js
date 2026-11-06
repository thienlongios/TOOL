/* Xi · Google AI Pro Offer Injector — Trình bảo vệ kiểm tra giá thanh toán
 * Tác dụng: Quét các điều khoản thực tế trong khung thanh toán Google Play.
 * Thanh xanh = Miễn phí (An toàn bấm đăng ký), Thanh đỏ = Có tính tiền (Không bấm).
 */
(() => {
  if (window.__GAPT_GUARD || window.top === window) return; // Chỉ chạy trong iframe con
  window.__GAPT_GUARD = true;

  const FREE_WORDS = [
    "free trial", "start your free trial", "免费试用",
    "US$0.00", "$0.00", "0,00", "€0.00", "0 ₫", "0,00 US$",
    "won't be charged", "不会向您收费", "不会收费",
    "dùng thử miễn phí", "bắt đầu dùng thử miễn phí", "sẽ không bị tính phí", "không tính phí"
  ];
  const PAID_WORDS = [
    "/mo after", "/month after", "per month after",
    "立即付款", "pay now", "今日扣款", "charged today",
    "thanh toán ngay", "tính phí hôm nay", "/tháng sau đó"
  ];

  let bar = null;
  function paint(kind, text) {
    if (!document.body) return;
    if (!bar) {
      bar = document.createElement("div");
      bar.style.cssText = "position:fixed;left:0;right:0;top:0;z-index:2147483647;padding:10px 14px;" +
        "font:13px/1.5 -apple-system,Segoe UI,Roboto,sans-serif;text-align:center;font-weight:600;";
      document.body.appendChild(bar);
    }
    bar.style.background = kind === "ok" ? "#1a7f37" : (kind === "bad" ? "#c62828" : "#616161");
    bar.style.color = "#fff";
    bar.textContent = text;
  }

  function judge() {
    let t = "";
    try {
      t = (document.body && document.body.innerText || "").toLowerCase();
    } catch (e) {
      return;
    }
    if (!t || t.length < 5) return;
    const free = FREE_WORDS.some((w) => t.includes(w.toLowerCase()));
    const paid = PAID_WORDS.some((w) => t.includes(w.toLowerCase()));

    if (free && !paid) {
      paint("ok", "✅ Phát hiện gói DÙNG THỬ MIỄN PHÍ —— Có thể bấm đăng ký (Hãy kiểm tra lại số tiền hiển thị là $0.00)");
    } else if (paid && !free) {
      paint("bad", "❌ Không phát hiện miễn phí (Có thể bị trừ tiền thật) —— Tuyệt đối không bấm Đăng ký, hãy quay lại đổi tầng khác!");
    } else if (free && paid) {
      paint("warn", "⚠️ Xuất hiện cả chữ Miễn phí và Trả phí —— Vui lòng kiểm tra kỹ số tiền $0.00 trước khi bấm!");
    } else {
      paint("warn", "⏳ Đang nhận diện điều khoản giá (Trang đang tải)...");
    }
  }

  setTimeout(judge, 1200);
  setTimeout(judge, 3000);
  setTimeout(judge, 6000);
  try {
    const mo = new MutationObserver(() => judge());
    document.addEventListener("DOMContentLoaded", () => mo.observe(document.body, { childList: true, subtree: true, characterData: true }));
  } catch (e) {}
})();