import json
import os
import uuid
from datetime import date, datetime, timedelta
from flask import Flask, render_template, request, jsonify

app = Flask(__name__)
DATA_FILE = os.path.join(os.path.dirname(__file__), "stocks.json")


def _load_stocks():
    if not os.path.exists(DATA_FILE):
        return []
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def _save_stocks(stocks):
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(stocks, f, ensure_ascii=False, indent=2)


def _calc_last_buy_date(record_date_str):
    """権利確定日から権利付最終日を計算（2営業日前=土日祝考慮簡易版）"""
    d = datetime.strptime(record_date_str, "%Y-%m-%d").date()
    business_days_back = 0
    while business_days_back < 2:
        d -= timedelta(days=1)
        if d.weekday() < 5:  # 月〜金
            business_days_back += 1
    return d.isoformat()


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/stocks", methods=["GET"])
def get_stocks():
    stocks = _load_stocks()
    today = date.today().isoformat()
    for s in stocks:
        s["last_buy_date"] = _calc_last_buy_date(s["record_date"])
        s["is_upcoming"] = s["last_buy_date"] >= today
    stocks.sort(key=lambda s: s["record_date"])
    return jsonify(stocks)


@app.route("/api/stocks", methods=["POST"])
def add_stock():
    data = request.get_json()
    required = ["code", "name", "record_date", "dividend_per_share"]
    for field in required:
        if field not in data or not data[field]:
            return jsonify({"error": f"{field} は必須です"}), 400
    stock = {
        "id": str(uuid.uuid4()),
        "code": data["code"],
        "name": data["name"],
        "record_date": data["record_date"],
        "dividend_per_share": float(data["dividend_per_share"]),
        "shares_held": int(data.get("shares_held", 0)),
        "dividend_type": data.get("dividend_type", "中間"),
        "note": data.get("note", ""),
    }
    stocks = _load_stocks()
    stocks.append(stock)
    _save_stocks(stocks)
    return jsonify(stock), 201


@app.route("/api/stocks/<stock_id>", methods=["PUT"])
def update_stock(stock_id):
    data = request.get_json()
    stocks = _load_stocks()
    for i, s in enumerate(stocks):
        if s["id"] == stock_id:
            stocks[i].update({
                "code": data.get("code", s["code"]),
                "name": data.get("name", s["name"]),
                "record_date": data.get("record_date", s["record_date"]),
                "dividend_per_share": float(data.get("dividend_per_share", s["dividend_per_share"])),
                "shares_held": int(data.get("shares_held", s.get("shares_held", 0))),
                "dividend_type": data.get("dividend_type", s.get("dividend_type", "中間")),
                "note": data.get("note", s.get("note", "")),
            })
            _save_stocks(stocks)
            return jsonify(stocks[i])
    return jsonify({"error": "not found"}), 404


@app.route("/api/stocks/<stock_id>", methods=["DELETE"])
def delete_stock(stock_id):
    stocks = _load_stocks()
    stocks = [s for s in stocks if s["id"] != stock_id]
    _save_stocks(stocks)
    return jsonify({"ok": True})


if __name__ == "__main__":
    app.run(debug=True, port=5000)
