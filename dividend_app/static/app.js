document.addEventListener("DOMContentLoaded", loadStocks);

async function loadStocks() {
  const res = await fetch("/api/stocks");
  const stocks = await res.json();
  renderSummary(stocks);
  renderList(stocks);
}

function renderSummary(stocks) {
  document.getElementById("val-total").textContent = stocks.length;
  const upcoming = stocks.filter((s) => s.is_upcoming);
  document.getElementById("val-upcoming").textContent = upcoming.length + " 件";
  const income = stocks.reduce((sum, s) => {
    return sum + s.dividend_per_share * (s.shares_held || 0);
  }, 0);
  document.getElementById("val-income").textContent =
    "\u00a5" + income.toLocaleString();
}

function renderList(stocks) {
  const container = document.getElementById("stock-list");
  if (stocks.length === 0) {
    container.innerHTML =
      '<p class="loading">\u9298\u67c4\u304c\u767b\u9332\u3055\u308c\u3066\u3044\u307e\u305b\u3093\u3002\u300c+ \u9298\u67c4\u3092\u8ffd\u52a0\u300d\u304b\u3089\u59cb\u3081\u307e\u3057\u3087\u3046\u3002</p>';
    return;
  }
  container.innerHTML = stocks.map(stockCard).join("");
}

function stockCard(s) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const lastBuy = new Date(s.last_buy_date + "T00:00:00");
  const diff = Math.ceil((lastBuy - today) / (1000 * 60 * 60 * 24));

  let badgeClass, badgeText;
  if (diff < 0) {
    badgeClass = "passed";
    badgeText = "\u7d42\u4e86";
  } else if (diff === 0) {
    badgeClass = "urgent";
    badgeText = "\u4eca\u65e5\u304c\u6700\u7d42\u65e5\uff01";
  } else if (diff <= 7) {
    badgeClass = "urgent";
    badgeText = "\u3042\u3068 " + diff + " \u65e5";
  } else if (diff <= 30) {
    badgeClass = "soon";
    badgeText = "\u3042\u3068 " + diff + " \u65e5";
  } else {
    badgeClass = "ok";
    badgeText = "\u3042\u3068 " + diff + " \u65e5";
  }

  const totalDiv = s.dividend_per_share * (s.shares_held || 0);
  const pastClass = diff < 0 ? " past" : "";

  return `
    <div class="stock-card${pastClass}">
      <div class="stock-main">
        <div class="stock-header">
          <span class="stock-code">${esc(s.code)}</span>
          <span class="stock-name">${esc(s.name)}</span>
          <span class="stock-type ${esc(s.dividend_type)}">${esc(s.dividend_type)}</span>
        </div>
        <div class="stock-dates">
          <div>
            <div class="date-label">\u6a29\u5229\u4ed8\u6700\u7d42\u65e5</div>
            <strong>${formatDate(s.last_buy_date)}</strong>
            <span class="badge-deadline ${badgeClass}">${badgeText}</span>
          </div>
          <div>
            <div class="date-label">\u6a29\u5229\u78ba\u5b9a\u65e5</div>
            <strong>${formatDate(s.record_date)}</strong>
          </div>
        </div>
        <div class="stock-actions">
          <button onclick="editStock('${s.id}')">編集</button>
          <button class="delete" onclick="deleteStock('${s.id}')">削除</button>
        </div>
      </div>
      <div class="stock-dividend">
        <div class="dividend-amount">\u00a5${s.dividend_per_share.toLocaleString()}</div>
        <div class="dividend-sub">1\u682a\u3042\u305f\u308a</div>
        ${
          s.shares_held > 0
            ? `<div class="dividend-sub">${s.shares_held}\u682a \u00d7 \u00a5${s.dividend_per_share} = <strong>\u00a5${totalDiv.toLocaleString()}</strong></div>`
            : '<div class="dividend-sub">\u4fdd\u6709\u682a\u6570\u672a\u8a2d\u5b9a</div>'
        }
      </div>
    </div>`;
}

function formatDate(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return (
    d.getFullYear() +
    "/" +
    (d.getMonth() + 1) +
    "/" +
    d.getDate() +
    " (" +
    ["\u65e5", "\u6708", "\u706b", "\u6c34", "\u6728", "\u91d1", "\u571f"][
      d.getDay()
    ] +
    ")"
  );
}

function esc(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

/* モーダル */
let allStocks = [];

function openModal(stockId) {
  document.getElementById("modal").classList.add("active");
  document.getElementById("stock-form").reset();
  document.getElementById("edit-id").value = "";
  document.getElementById("modal-title").textContent = "\u9298\u67c4\u3092\u8ffd\u52a0";

  if (stockId) {
    document.getElementById("modal-title").textContent = "\u9298\u67c4\u3092\u7de8\u96c6";
    fetch("/api/stocks")
      .then((r) => r.json())
      .then((stocks) => {
        const s = stocks.find((x) => x.id === stockId);
        if (!s) return;
        document.getElementById("edit-id").value = s.id;
        document.getElementById("f-code").value = s.code;
        document.getElementById("f-name").value = s.name;
        document.getElementById("f-record-date").value = s.record_date;
        document.getElementById("f-type").value = s.dividend_type;
        document.getElementById("f-dividend").value = s.dividend_per_share;
        document.getElementById("f-shares").value = s.shares_held || 0;
        document.getElementById("f-note").value = s.note || "";
      });
  }
}

function closeModal() {
  document.getElementById("modal").classList.remove("active");
}

function closeModalOutside(e) {
  if (e.target === document.getElementById("modal")) closeModal();
}

function editStock(id) {
  openModal(id);
}

async function deleteStock(id) {
  if (!confirm("\u3053\u306e\u9298\u67c4\u3092\u524a\u9664\u3057\u307e\u3059\u304b\uff1f")) return;
  await fetch("/api/stocks/" + id, { method: "DELETE" });
  loadStocks();
}

async function saveStock(e) {
  e.preventDefault();
  const id = document.getElementById("edit-id").value;
  const body = {
    code: document.getElementById("f-code").value,
    name: document.getElementById("f-name").value,
    record_date: document.getElementById("f-record-date").value,
    dividend_type: document.getElementById("f-type").value,
    dividend_per_share: document.getElementById("f-dividend").value,
    shares_held: document.getElementById("f-shares").value,
    note: document.getElementById("f-note").value,
  };

  if (id) {
    await fetch("/api/stocks/" + id, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } else {
    await fetch("/api/stocks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  }

  closeModal();
  loadStocks();
}
