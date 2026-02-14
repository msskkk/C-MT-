// Tool templates: AI → JSON → purpose-built HTML (no external images)

interface ToolTemplate {
  prompt: string;
  render: (raw: string, userInput: string) => string;
}

function parseJSON(raw: string): unknown | null {
  const m = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  let str = m ? m[1].trim() : raw.trim();
  const i = str.indexOf("{");
  if (i > 0) str = str.slice(i);
  if (i < 0) return null;
  try { return JSON.parse(str); } catch {}
  // Fix truncated JSON
  for (let n = 0; n < 15; n++) {
    const open = (str.match(/\[/g) || []).length - (str.match(/\]/g) || []).length;
    const brace = (str.match(/\{/g) || []).length - (str.match(/\}/g) || []).length;
    if (open > 0) str += "]";
    else if (brace > 0) str += "}";
    else break;
    try { return JSON.parse(str); } catch {}
  }
  return null;
}

const F = `-apple-system,BlinkMacSystemFont,'Segoe UI','Hiragino Sans',sans-serif`;

// ─── LOGO ───
const logo: ToolTemplate = {
  prompt: `必ずJSON形式のみで回答（説明テキスト不要、JSONだけ）:
{"imagePrompt":"English prompt for AI logo image generation: describe a professional, modern logo design. Include the brand name text rendered beautifully, visual symbol/icon, color scheme, and clean background. Be specific about style (flat, 3D, minimal, etc).","concepts":[{"name":"コンセプト名","tagline":"一言説明","symbol":"シンボルの形状","colors":{"primary":"#hex","secondary":"#hex","bg":"#hex背景色"},"fontStyle":"sans-serif|serif|monospace"}]}
3つのコンセプトを提案。imagePromptは最も推奨するコンセプトのロゴを生成するプロンプトにしてください。`,
  render: (raw, userInput) => {
    const d = parseJSON(raw) as { imageUrl?: string; imagePrompt?: string; concepts: Array<{ name: string; tagline: string; symbol: string; colors: { primary: string; secondary: string; bg: string }; fontStyle: string }> } | null;
    if (!d?.concepts?.length) return "";
    const brand = userInput.split("\n")[0].replace(/.*[:：]\s*/, "").trim();
    const shapes = [
      (p: string, s: string, ch: string, font: string) => `<svg viewBox="0 0 120 120" width="100" height="100"><defs><linearGradient id="a" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${p}"/><stop offset="100%" stop-color="${s}"/></linearGradient></defs><circle cx="60" cy="60" r="54" fill="url(#a)"/><text x="60" y="75" text-anchor="middle" font-size="50" font-weight="bold" fill="#fff" font-family="${font}">${ch}</text></svg>`,
      (p: string, s: string, ch: string, font: string) => `<svg viewBox="0 0 120 120" width="100" height="100"><defs><linearGradient id="b" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${p}"/><stop offset="100%" stop-color="${s}"/></linearGradient></defs><rect x="8" y="8" width="104" height="104" rx="26" fill="url(#b)"/><text x="60" y="73" text-anchor="middle" font-size="44" font-weight="bold" fill="#fff" font-family="${font}">${ch}</text></svg>`,
      (p: string, s: string, ch: string, font: string) => `<svg viewBox="0 0 120 120" width="100" height="100"><defs><linearGradient id="c" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${p}"/><stop offset="100%" stop-color="${s}"/></linearGradient></defs><polygon points="60,4 112,32 112,88 60,116 8,88 8,32" fill="url(#c)"/><text x="60" y="72" text-anchor="middle" font-size="38" font-weight="bold" fill="#fff" font-family="${font}">${ch}</text></svg>`,
    ];
    let html = `<div style="font-family:${F};max-width:480px;margin:0 auto;">
      <div style="text-align:center;padding:16px;background:linear-gradient(135deg,#667eea,#764ba2);border-radius:16px;color:#fff;margin-bottom:20px;">
        <div style="font-size:18px;font-weight:800;">ロゴデザイン提案</div>
        <div style="font-size:12px;opacity:0.8;margin-top:4px;">${brand}</div>
      </div>`;
    if (d.imageUrl) {
      html += `<div style="background:#f8fafc;border-radius:16px;overflow:hidden;margin-bottom:20px;border:1px solid #e2e8f0;">
        <img src="${d.imageUrl}" style="width:100%;aspect-ratio:1/1;object-fit:cover;display:block;" crossorigin="anonymous" />
        <div style="text-align:center;padding:8px;font-size:11px;color:#94a3b8;">AI\u753b\u50cf\u751f\u6210\u30a4\u30e1\u30fc\u30b8</div>
      </div>`;
    }
    d.concepts.forEach((c, i) => {
      const p = c.colors?.primary || "#667eea";
      const s = c.colors?.secondary || "#764ba2";
      const bg = c.colors?.bg || "#f8fafc";
      const font = c.fontStyle === "serif" ? "Georgia,serif" : c.fontStyle === "monospace" ? "'Courier New',monospace" : `${F}`;
      const ch = (brand || c.name || "A").slice(0, 2);
      html += `<div style="background:${bg};border-radius:16px;padding:20px;margin-bottom:16px;border:1px solid #e2e8f0;">
        <div style="display:flex;align-items:center;gap:16px;margin-bottom:12px;">
          ${shapes[i % 3](p, s, ch, font)}
          <div>
            <div style="font-size:18px;font-weight:800;color:${p};font-family:${font};">${c.name}</div>
            <div style="font-size:12px;color:#64748b;margin-top:2px;">${c.tagline || ""}</div>
          </div>
        </div>
        <div style="font-size:11px;color:#475569;margin-bottom:10px;line-height:1.5;">${c.symbol || ""}</div>
        <div style="display:flex;gap:8px;align-items:center;">
          <div style="width:28px;height:28px;border-radius:50%;background:${p};box-shadow:0 1px 4px ${p}60;"></div>
          <div style="width:28px;height:28px;border-radius:50%;background:${s};box-shadow:0 1px 4px ${s}60;"></div>
          <span style="font-size:10px;color:#94a3b8;margin-left:4px;">${p} / ${s}</span>
        </div>
      </div>`;
    });
    html += `</div>`;
    return html;
  },
};

// ─── TRAVEL PLAN ───
const plan: ToolTemplate = {
  prompt: `必ずJSON形式のみで回答（説明テキスト不要、JSONだけ）:
{"title":"タイトル","days":[{"day":1,"theme":"テーマ","activities":[{"time":"09:00","title":"名称","detail":"詳細","icon":"絵文字","cost":"¥5000"}],"hotel":{"name":"名前","area":"エリア","price":"¥25000/泊","rating":4.5}}],"budget":{"transport":0,"hotel":0,"food":0,"activity":0},"tips":["tip1"]}
日数が多い場合は主要5日分に絞ってください。各日3アクティビティまで。`,
  render: (raw, _ui) => {
    const d = parseJSON(raw) as { title: string; days: Array<{ day: number; theme: string; activities: Array<{ time: string; title: string; detail: string; icon: string; cost: string }>; hotel?: { name: string; area: string; price: string; rating: number } }>; budget?: Record<string, number>; tips?: string[] } | null;
    if (!d?.days?.length) return "";
    const gr = ["#667eea,#764ba2", "#f093fb,#f5576c", "#4facfe,#00f2fe", "#43e97b,#38f9d7", "#fa709a,#fee140"];
    let html = `<div style="font-family:${F};max-width:480px;margin:0 auto;">
      <div style="background:linear-gradient(135deg,#4facfe,#00f2fe);color:#fff;padding:20px;border-radius:16px;margin-bottom:20px;text-align:center;">
        <div style="font-size:20px;font-weight:800;">${d.title || "旅行プラン"}</div>
        <div style="font-size:12px;opacity:0.8;margin-top:4px;">${d.days.length}日間</div>
      </div>`;
    d.days.forEach((day, di) => {
      const g = gr[di % gr.length];
      html += `<div style="display:flex;align-items:center;gap:12px;margin:20px 0 10px;">
        <div style="width:48px;height:48px;border-radius:50%;background:linear-gradient(135deg,${g});display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:13px;flex-shrink:0;">Day${day.day}</div>
        <div style="font-size:15px;font-weight:700;color:#1e293b;">${day.theme || ""}</div>
      </div>`;
      day.activities?.forEach((a) => {
        html += `<div style="display:flex;gap:10px;padding:10px 12px;margin:4px 0 4px 24px;background:#fff;border-radius:12px;box-shadow:0 1px 4px rgba(0,0,0,0.05);border-left:3px solid ${g.split(",")[0]};">
          <span style="font-size:18px;margin-top:1px;">${a.icon || "📍"}</span>
          <div style="flex:1;">
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <span style="font-size:11px;color:#6366f1;font-weight:700;">${a.time || ""}</span>
              ${a.cost ? `<span style="font-size:10px;color:#059669;background:#ecfdf5;padding:2px 8px;border-radius:99px;font-weight:600;">${a.cost}</span>` : ""}
            </div>
            <div style="font-size:13px;font-weight:700;color:#1e293b;margin-top:2px;">${a.title}</div>
            ${a.detail ? `<div style="font-size:11px;color:#64748b;margin-top:1px;">${a.detail}</div>` : ""}
          </div>
        </div>`;
      });
      if (day.hotel) {
        const h = day.hotel;
        html += `<div style="margin:6px 0 0 24px;background:linear-gradient(135deg,#fef3c7,#fde68a);border-radius:12px;padding:10px 12px;border:1px solid #fcd34d;">
          <div style="display:flex;align-items:center;gap:6px;"><span>🏨</span><span style="font-size:13px;font-weight:700;color:#92400e;">${h.name}</span></div>
          <div style="display:flex;gap:10px;font-size:11px;color:#a16207;margin-top:3px;">
            <span>📍${h.area || ""}</span><span style="color:#d97706;">${"★".repeat(Math.floor(h.rating || 4))}</span><span style="font-weight:700;">${h.price || ""}</span>
          </div>
        </div>`;
      }
    });
    if (d.budget) {
      const entries = Object.entries(d.budget).filter(([, v]) => v > 0);
      const total = entries.reduce((s, [, v]) => s + v, 0);
      if (total > 0) {
        const bc = ["#6366f1", "#ec4899", "#14b8a6", "#f59e0b", "#8b5cf6"];
        const lb: Record<string, string> = { transport: "交通費", hotel: "宿泊費", food: "食費", activity: "アクティビティ", other: "その他" };
        html += `<div style="background:#fff;border-radius:16px;padding:16px;margin:20px 0;border:1px solid #e2e8f0;">
          <div style="font-size:14px;font-weight:700;color:#1e293b;margin-bottom:12px;">💰 予算: ¥${total.toLocaleString()}</div>`;
        entries.forEach(([k, v], i) => {
          const pct = Math.round(v / total * 100);
          html += `<div style="margin-bottom:8px;"><div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:2px;"><span style="color:#64748b;">${lb[k] || k}</span><span style="font-weight:700;">¥${v.toLocaleString()} (${pct}%)</span></div>
            <div style="height:8px;background:#f1f5f9;border-radius:4px;overflow:hidden;"><div style="height:100%;width:${pct}%;background:${bc[i % bc.length]};border-radius:4px;"></div></div></div>`;
        });
        html += `</div>`;
      }
    }
    if (d.tips?.length) {
      html += `<div style="background:#f0fdf4;border-radius:12px;padding:14px;border:1px solid #bbf7d0;">
        <div style="font-size:13px;font-weight:700;color:#166534;margin-bottom:6px;">💡 ポイント</div>`;
      d.tips.forEach((t) => { html += `<div style="font-size:11px;color:#15803d;padding:3px 0;">✓ ${t}</div>`; });
      html += `</div>`;
    }
    html += `</div>`;
    return html;
  },
};

// ─── COLOR ───
const color: ToolTemplate = {
  prompt: `必ずJSON形式のみで回答（説明テキスト不要、JSONだけ）:
{"name":"パレット名","colors":[{"hex":"#hex","name":"色名","usage":"用途"}],"combinations":[{"name":"名","bg":"#hex","text":"#hex","accent":"#hex"}]}
5-7色。`,
  render: (raw, _ui) => {
    const d = parseJSON(raw) as { name: string; colors: Array<{ hex: string; name: string; usage: string }>; combinations?: Array<{ name: string; bg: string; text: string; accent: string }> } | null;
    if (!d?.colors?.length) return "";
    let html = `<div style="font-family:${F};max-width:480px;margin:0 auto;">
      <div style="text-align:center;margin-bottom:16px;font-size:16px;font-weight:800;">${d.name || "カラーパレット"}</div>
      <div style="display:flex;flex-wrap:wrap;gap:12px;justify-content:center;margin-bottom:20px;">`;
    d.colors.forEach((c) => {
      const l = parseInt(c.hex?.slice(1, 3) || "80", 16) * 0.299 + parseInt(c.hex?.slice(3, 5) || "80", 16) * 0.587 + parseInt(c.hex?.slice(5, 7) || "80", 16) * 0.114;
      html += `<div style="text-align:center;"><div style="width:60px;height:60px;border-radius:14px;background:${c.hex};box-shadow:0 2px 8px ${c.hex}40;display:flex;align-items:center;justify-content:center;"><span style="font-size:9px;color:${l < 128 ? "#fff" : "#000"};opacity:0.8;">${c.hex}</span></div>
        <div style="font-size:10px;font-weight:600;margin-top:5px;">${c.name}</div><div style="font-size:9px;color:#94a3b8;">${c.usage}</div></div>`;
    });
    html += `</div>`;
    d.combinations?.forEach((c) => {
      html += `<div style="background:${c.bg};color:${c.text};padding:14px;border-radius:12px;margin-bottom:8px;"><div style="font-weight:700;">${c.name}</div><div style="font-size:11px;opacity:0.8;">サンプルテキスト</div>${c.accent ? `<div style="display:inline-block;background:${c.accent};color:#fff;padding:4px 12px;border-radius:6px;font-size:11px;font-weight:600;margin-top:8px;">ボタン</div>` : ""}</div>`;
    });
    html += `</div>`;
    return html;
  },
};

// ─── THUMBNAIL ───
const thumbnail: ToolTemplate = {
  prompt: `必ずJSON形式のみで回答（説明テキスト不要、JSONだけ）:
{"title":"メインテキスト（大きく表示）","subtitle":"サブテキスト","badge":"バッジ(必見/衝撃/速報等)","imagePrompt":"English prompt for AI image generation: describe a vivid, eye-catching background scene for this YouTube thumbnail. Be specific about colors, lighting, composition. Do NOT include any text in the image.","colors":{"bg1":"#hex","bg2":"#hex","text":"#hex","accent":"#hex"},"layout":"center|left"}`,
  render: (raw, _ui) => {
    const d = parseJSON(raw) as { title: string; subtitle: string; badge: string; imagePrompt: string; imageUrl: string; colors: { bg1: string; bg2: string; text: string; accent: string }; layout: string } | null;
    if (!d) return "";
    const c = { bg1: d.colors?.bg1 || "#1e1e2e", bg2: d.colors?.bg2 || "#6366f1", text: d.colors?.text || "#fff", accent: d.colors?.accent || "#ff0044" };
    let html = `<div style="font-family:${F};max-width:480px;margin:0 auto;">
      <div style="text-align:center;font-size:12px;color:#64748b;margin-bottom:8px;">YouTubeサムネイル${d.imageUrl ? "（AI画像生成）" : ""}</div>
      <div style="aspect-ratio:16/9;background:linear-gradient(135deg,${c.bg1},${c.bg2});border-radius:16px;overflow:hidden;display:flex;align-items:center;justify-content:center;padding:24px;position:relative;box-shadow:0 4px 16px rgba(0,0,0,0.15);">
        ${d.imageUrl ? `<img src="${d.imageUrl}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;" crossorigin="anonymous" />` : ""}
        ${d.imageUrl ? `<div style="position:absolute;inset:0;background:rgba(0,0,0,0.3);"></div>` : ""}
        ${d.badge ? `<div style="position:absolute;top:14px;left:14px;background:${c.accent};color:#fff;padding:5px 14px;border-radius:6px;font-size:13px;font-weight:900;z-index:1;">${d.badge}</div>` : ""}
        <div style="position:relative;z-index:1;${d.layout === "left" ? "text-align:left;padding-right:80px;" : "text-align:center;"}">
          <div style="font-size:28px;font-weight:900;color:${c.text};line-height:1.2;text-shadow:2px 2px 8px rgba(0,0,0,0.6);">${d.title || ""}</div>
          ${d.subtitle ? `<div style="font-size:14px;color:${c.text};opacity:0.9;margin-top:8px;text-shadow:1px 1px 4px rgba(0,0,0,0.5);">${d.subtitle}</div>` : ""}
        </div>
      </div>
    </div>`;
    return html;
  },
};

// ─── RECIPE ───
const recipe: ToolTemplate = {
  prompt: `必ずJSON形式のみで回答（説明テキスト不要、JSONだけ）:
{"recipes":[{"name":"レシピ名","emoji":"料理絵文字","time":"時間","difficulty":"簡単/普通/本格的","servings":"人数","ingredients":[{"name":"材料","amount":"分量"}],"steps":["手順1","手順2"]}]}`,
  render: (raw, _ui) => {
    const d = parseJSON(raw) as { recipes: Array<{ name: string; emoji: string; time: string; difficulty: string; servings: string; ingredients: Array<{ name: string; amount: string }>; steps: string[] }> } | null;
    if (!d?.recipes?.length) return "";
    const dc: Record<string, string> = { "簡単": "#22c55e", "普通": "#f59e0b", "本格的": "#ef4444" };
    let html = `<div style="font-family:${F};max-width:480px;margin:0 auto;">`;
    d.recipes.forEach((r) => {
      html += `<div style="background:#fff;border-radius:16px;overflow:hidden;margin-bottom:16px;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
        <div style="background:linear-gradient(135deg,#ff9a56,#ff6a88);padding:16px;color:#fff;">
          <div style="font-size:32px;">${r.emoji || "🍳"}</div>
          <div style="font-size:18px;font-weight:800;margin-top:4px;">${r.name}</div>
          <div style="display:flex;gap:6px;margin-top:8px;">
            <span style="background:rgba(255,255,255,0.25);padding:3px 10px;border-radius:99px;font-size:10px;">⏰ ${r.time}</span>
            <span style="background:${dc[r.difficulty] || "#6366f1"};padding:3px 10px;border-radius:99px;font-size:10px;">${r.difficulty}</span>
            <span style="background:rgba(255,255,255,0.25);padding:3px 10px;border-radius:99px;font-size:10px;">👤 ${r.servings}</span>
          </div>
        </div>
        <div style="padding:16px;">
          <div style="font-size:13px;font-weight:700;margin-bottom:6px;">📝 材料</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;margin-bottom:14px;">`;
      r.ingredients?.forEach((ing) => { html += `<div style="display:flex;justify-content:space-between;font-size:11px;padding:4px 8px;background:#f8fafc;border-radius:6px;"><span style="color:#475569;">${ing.name}</span><span style="font-weight:600;">${ing.amount}</span></div>`; });
      html += `</div><div style="font-size:13px;font-weight:700;margin-bottom:6px;">👨‍🍳 手順</div>`;
      r.steps?.forEach((step, si) => { html += `<div style="display:flex;gap:10px;margin-bottom:6px;"><div style="width:22px;height:22px;border-radius:50%;background:linear-gradient(135deg,#ff9a56,#ff6a88);color:#fff;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:800;flex-shrink:0;">${si + 1}</div><div style="font-size:12px;color:#475569;line-height:1.5;padding-top:2px;">${step}</div></div>`; });
      html += `</div></div>`;
    });
    html += `</div>`;
    return html;
  },
};

// ─── CALORIE ───
const calorie: ToolTemplate = {
  prompt: `必ずJSON形式のみで回答（説明テキスト不要、JSONだけ）:
{"totalCalories":650,"rating":"A|B|C|D","items":[{"name":"食品名","calories":250}],"totalNutrients":{"protein":25,"fat":20,"carbs":80},"advice":["アドバイス1"]}`,
  render: (raw, _ui) => {
    const d = parseJSON(raw) as { totalCalories: number; rating: string; items: Array<{ name: string; calories: number }>; totalNutrients: { protein: number; fat: number; carbs: number }; advice: string[] } | null;
    if (!d) return "";
    const rc: Record<string, string> = { A: "#22c55e", B: "#84cc16", C: "#f59e0b", D: "#ef4444" };
    let html = `<div style="font-family:${F};max-width:480px;margin:0 auto;">
      <div style="background:linear-gradient(135deg,#667eea,#764ba2);border-radius:16px;padding:20px;color:#fff;text-align:center;margin-bottom:16px;">
        <div style="font-size:42px;font-weight:900;">${d.totalCalories || 0}</div><div style="font-size:14px;opacity:0.8;">kcal</div>
        <div style="display:inline-block;background:${rc[d.rating] || "#6366f1"};padding:4px 16px;border-radius:99px;font-size:13px;font-weight:800;margin-top:8px;">評価: ${d.rating || "B"}</div>
      </div>`;
    if (d.totalNutrients) {
      const n = d.totalNutrients, t = (n.protein || 0) + (n.fat || 0) + (n.carbs || 0);
      const ns = [{ n: "タンパク質", v: n.protein, c: "#ef4444" }, { n: "脂質", v: n.fat, c: "#f59e0b" }, { n: "炭水化物", v: n.carbs, c: "#3b82f6" }];
      html += `<div style="background:#fff;border-radius:12px;padding:14px;margin-bottom:12px;border:1px solid #e2e8f0;">
        <div style="display:flex;height:12px;border-radius:6px;overflow:hidden;margin-bottom:12px;">`;
      ns.forEach((x) => { html += `<div style="width:${t ? (x.v / t * 100).toFixed(1) : 33}%;background:${x.c};"></div>`; });
      html += `</div>`;
      ns.forEach((x) => { html += `<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;"><div style="width:10px;height:10px;border-radius:3px;background:${x.c};"></div><span style="font-size:11px;color:#64748b;flex:1;">${x.n}</span><span style="font-size:12px;font-weight:700;">${x.v}g</span></div>`; });
      html += `</div>`;
    }
    if (d.items?.length) {
      html += `<div style="background:#fff;border-radius:12px;padding:14px;margin-bottom:12px;border:1px solid #e2e8f0;">`;
      d.items.forEach((i) => { html += `<div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid #f1f5f9;font-size:12px;"><span style="color:#475569;">${i.name}</span><span style="font-weight:700;">${i.calories}kcal</span></div>`; });
      html += `</div>`;
    }
    if (d.advice?.length) {
      html += `<div style="background:#eff6ff;border-radius:12px;padding:14px;border:1px solid #bfdbfe;">`;
      d.advice.forEach((a) => { html += `<div style="font-size:11px;color:#1e40af;padding:3px 0;">💡 ${a}</div>`; });
      html += `</div>`;
    }
    html += `</div>`;
    return html;
  },
};

// ─── MOCKUP ───
const mockup: ToolTemplate = {
  prompt: `必ずJSON形式のみで回答（説明テキスト不要、JSONだけ）:
{"title":"画面名","description":"画面の説明","imagePrompt":"English prompt for AI UI mockup generation: describe a modern, clean mobile app screen design. Include specific UI elements (buttons, cards, navigation), color scheme, typography style, and layout. Specify it as a professional UI/UX design rendered in high quality.","screens":[{"name":"画面名","elements":["要素1","要素2"],"flow":"ユーザーフロー説明"}],"colors":{"primary":"#hex","secondary":"#hex","bg":"#hex","text":"#hex"},"style":"ミニマル|モダン|ポップ等"}
2-3画面分を提案。`,
  render: (raw, _ui) => {
    const d = parseJSON(raw) as { title: string; description: string; imageUrl?: string; imagePrompt?: string; screens: Array<{ name: string; elements: string[]; flow: string }>; colors: { primary: string; secondary: string; bg: string; text: string }; style: string } | null;
    if (!d) return "";
    const p = d.colors?.primary || "#6366f1";
    const s = d.colors?.secondary || "#8b5cf6";
    const bg = d.colors?.bg || "#f8fafc";
    let html = `<div style="font-family:${F};max-width:480px;margin:0 auto;">
      <div style="text-align:center;padding:16px;background:linear-gradient(135deg,${p},${s});border-radius:16px;color:#fff;margin-bottom:20px;">
        <div style="font-size:18px;font-weight:800;">${d.title || "UIモックアップ"}</div>
        <div style="font-size:12px;opacity:0.8;margin-top:4px;">${d.style || ""} ${d.description || ""}</div>
      </div>`;
    if (d.imageUrl) {
      html += `<div style="background:#1e1e2e;border-radius:16px;overflow:hidden;margin-bottom:20px;padding:20px;display:flex;justify-content:center;">
        <div style="width:240px;border-radius:24px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,0.3);">
          <img src="${d.imageUrl}" style="width:100%;display:block;" crossorigin="anonymous" />
        </div>
      </div>
      <div style="text-align:center;font-size:11px;color:#94a3b8;margin:-12px 0 16px;">AI\u751f\u6210\u30e2\u30c3\u30af\u30a2\u30c3\u30d7</div>`;
    }
    d.screens?.forEach((scr, i) => {
      html += `<div style="background:${bg};border-radius:12px;padding:16px;margin-bottom:12px;border:1px solid #e2e8f0;">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">
          <div style="width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,${p},${s});color:#fff;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;">${i + 1}</div>
          <div style="font-size:14px;font-weight:700;color:#1e293b;">${scr.name}</div>
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px;">`;
      scr.elements?.forEach((el) => {
        html += `<span style="background:${p}15;color:${p};padding:3px 10px;border-radius:6px;font-size:11px;font-weight:600;">${el}</span>`;
      });
      html += `</div>`;
      if (scr.flow) {
        html += `<div style="font-size:11px;color:#64748b;line-height:1.5;">${scr.flow}</div>`;
      }
      html += `</div>`;
    });
    if (d.colors) {
      html += `<div style="display:flex;gap:8px;justify-content:center;padding:12px;">`;
      const cols = [{ l: "Primary", c: p }, { l: "Secondary", c: s }, { l: "BG", c: bg }];
      cols.forEach((x) => {
        html += `<div style="text-align:center;"><div style="width:36px;height:36px;border-radius:10px;background:${x.c};border:1px solid #e2e8f0;margin:0 auto;"></div><div style="font-size:9px;color:#94a3b8;margin-top:4px;">${x.l}</div></div>`;
      });
      html += `</div>`;
    }
    html += `</div>`;
    return html;
  },
};

// ─── EXPORTS ───
export const TOOL_TEMPLATES: Record<string, ToolTemplate> = { logo, color, thumbnail, plan, recipe, calorie, mockup };

export function getToolPrompt(toolId: string): string | null {
  return TOOL_TEMPLATES[toolId]?.prompt || null;
}

export function renderToolHtml(toolId: string, raw: string, userInput: string): string | null {
  const t = TOOL_TEMPLATES[toolId];
  if (!t) return null;
  try { const r = t.render(raw, userInput); return r || null; } catch { return null; }
}
