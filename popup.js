/* popup.js */
const LABELS = {
  off: "Chưa kích hoạt",
  "12m": "12 Tháng",
  "6m_ss": "6 Tháng (SS)",
  "6m": "6 Tháng",
  "6m_2": "6 Tháng (Dự phòng)"
};
const stateEl = document.getElementById("state");

function paintState(st) {
  const layer = (st && st.layer) || "off";
  const mounted = !!(st && st.mounted) && layer !== "off";
  stateEl.className = mounted ? "ok" : "warn";
  stateEl.textContent = mounted
    ? "✅ Đã gắn mã: " + (LABELS[layer] || layer) + " —— Có thể bấm Nhận ưu đãi (Get discount)"
    : "⚠️ Chưa phát hiện gắn mã trên trang này (Hãy mở one.google.com/plans và tải lại trang)";
}

function queryTab() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const t = tabs && tabs[0];
    if (!t) return paintState(null);
    chrome.tabs.sendMessage(t.id, { type: "getState" }, (resp) => {
      if (chrome.runtime.lastError || !resp) return paintState(null);
      paintState(resp);
    });
  });
}

// Bắt sự kiện click mở tab cho các nút lối tắt
document.querySelectorAll(".btn-sc[data-url]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const targetUrl = btn.getAttribute("data-url");
    if (targetUrl) {
      chrome.tabs.create({ url: targetUrl });
    }
  });
});

chrome.storage.local.get(["gapt_layer"], (r) => {
  const layer = (r && r.gapt_layer) || "off";
  document.querySelectorAll('input[name="layer"]').forEach((el) => {
    el.checked = el.value === layer;
    el.addEventListener("change", () => {
      if (!el.checked) return;
      chrome.storage.local.set({ gapt_layer: el.value }, () => {
        // Cập nhật nóng vào tab hiện tại
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          const t = tabs && tabs[0];
          if (!t) return queryTab();
          chrome.tabs.sendMessage(t.id, { type: "setLayer", layer: el.value }, () => {
            void chrome.runtime.lastError;
            setTimeout(queryTab, 350);
          });
        });
      });
    });
  });
  queryTab();
  setTimeout(queryTab, 800);
});

setInterval(queryTab, 1500);