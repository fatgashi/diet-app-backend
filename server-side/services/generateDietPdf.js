// utils/generateDietPdf.js
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const days = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];

function safeNum(v, fallback=0) {
  if (v === null || v === undefined) return fallback;
  const n = Number(String(v).toString().replace(/[^\d.]/g,''));
  return Number.isFinite(n) ? n : fallback;
}

function percentNum(v, fallback=0) {
  // "35" or "35%" -> 35
  if (v === null || v === undefined) return fallback;
  const n = Number(String(v).replace('%',''));
  return Number.isFinite(n) ? n : fallback;
}

function getAnswer(assessment, enQuestion) {
  const hit = (assessment.answers || []).find(a => a?.question?.en === enQuestion);
  if (!hit) return '';
  const ans = hit.answer;
  if (Array.isArray(ans)) return ans.map(x => x?.en || x?.answer || x).join(', ');
  if (typeof ans === 'object' && ans?.answer) return ans.answer.en || ans.answer;
  return ans?.en || ans || '';
}

// Build an HTML list that references key answers (keeps it “personal”)
function buildWhyThisPlanHTML(a) {
  const goals = getAnswer(a, 'What do you want to achieve?');
  const eatStyle = getAnswer(a, 'Do you prefer to cook at home or eat out?');
  const activity = getAnswer(a, 'What is your activity level?');
  const fastingView = getAnswer(a, 'What do you know about Intermittent Fasting?');
  const sleep = getAnswer(a, 'Truthfully, what is an average night like for you?');
  const water = getAnswer(a, 'How much water do you drink every day?');

  const items = [
    goals && `Your goals: <strong>${goals}</strong> — the plan prioritizes foods & timing that support this.`,
    eatStyle && `Eating style: <strong>${eatStyle}</strong> — meal choices reflect your preference to keep adherence high.`,
    activity && `Activity level: <strong>${activity}</strong> — calorie target and workouts match your current baseline.`,
    fastingView && `Fasting experience: <strong>${fastingView}</strong> — fasting window is set to fit your comfort level.`,
    sleep && `Sleep: <strong>${sleep}</strong> — lifestyle tips include sleep hygiene for appetite & recovery.`,
    water && `Hydration: <strong>${water}</strong> — hydration goals are customized to your current intake.`,
  ].filter(Boolean);

  if (!items.length) return '<p>This plan is personalized based on your unique answers and lifestyle.</p>';
  return `<ul>${items.map(x => `<li>${x}</li>`).join('')}</ul>`;
}

function buildWeeklyTable(plan) {
  if (!plan.weeklyMeals) return '';
  const nice = (s)=> (s && s.trim().length ? s : '—');

  const dayTitle = d => d[0].toUpperCase() + d.slice(1);

  return `
    <table>
      <thead>
        <tr>
          <th style="width:110px">Day</th>
          <th>Breakfast</th>
          <th>Lunch</th>
          <th>Dinner</th>
        </tr>
      </thead>
      <tbody>
        ${days.map(d => `
          <tr>
            <td class="fw">${dayTitle(d)}</td>
            <td>${nice(plan.weeklyMeals[d]?.breakfast)}</td>
            <td>${nice(plan.weeklyMeals[d]?.lunch)}</td>
            <td>${nice(plan.weeklyMeals[d]?.dinner)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

const generateDietPdf = async (assessment, outputPath) => {
  const logoPath = path.resolve(__dirname, '../public/main-logo.png');
  const logoBase64 = fs.existsSync(logoPath)
    ? fs.readFileSync(logoPath, { encoding: 'base64' })
    : '';

  const plan = assessment.dietPlan || {};
  const user = assessment.user || {};

  // ---- Numbers (avoid NaN) ----
  const kcal = safeNum(plan.calories); // from "2000 kcal" → 2000
  const cP = percentNum(plan.macros?.carbs);
  const pP = percentNum(plan.macros?.protein);
  const fP = percentNum(plan.macros?.fats);
  const sumP = Math.max(cP + pP + fP, 1); // avoid 0
  // Normalize if over/under 100
  const carbsPct = Math.round((cP / sumP) * 100);
  const protPct  = Math.round((pP / sumP) * 100);
  const fatsPct  = 100 - carbsPct - protPct;

  const carbsG = Math.round((kcal * carbsPct / 100) / 4);
  const protG  = Math.round((kcal * protPct / 100) / 4);
  const fatsG  = Math.round((kcal * fatsPct / 100) / 9);

  // Donut conic-gradient stops
  const a = carbsPct;
  const b = carbsPct + protPct;
  // brand-friendly muted greens
  const C1 = '#8a9a7b'; // carbs
  const C2 = '#566749'; // protein
  const C3 = '#b7c3a3'; // fats

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: 'Segoe UI','Helvetica Neue',Arial,sans-serif;
      margin:0; padding:0; color:#566749; background:#f8f6f2; line-height:1.6;
    }
    .page { padding:50px; background:#f8f6f2; min-height:100vh; }
    .cover { text-align:center; height:100vh; display:flex; flex-direction:column; justify-content:center; align-items:center; padding:0; margin:0; color:#566749; background:linear-gradient(135deg,#f8f6f2 0%,#ffffff 100%); position:relative; }
    .cover-content { position:relative; z-index:2; background:rgba(255,255,255,0.9); padding:60px; border-radius:20px; box-shadow:0 20px 40px rgba(86,103,73,0.1); border:2px solid rgba(86,103,73,0.1); }
    .cover img { width:120px; margin-bottom:30px; filter:drop-shadow(0 4px 8px rgba(86,103,73,0.2)); }
    .page-break { page-break-before:always; }
    .cover h1 { font-size:42px; color:#566749; margin:0 0 20px 0; font-weight:700; letter-spacing:-0.5px; }
    .cover-subtitle { font-size:18px; color:#8a9a7b; margin-bottom:30px; font-weight:300; }
    .client-info { background:rgba(86,103,73,0.05); padding:25px; border-radius:15px; border-left:4px solid #566749; text-align:left; max-width:420px; }
    .client-info p { margin:6px 0; font-size:14px; }
    h2 { color:#566749; font-size:28px; margin:40px 0 20px; font-weight:700; position:relative; padding-bottom:15px; }
    h2::after { content:''; position:absolute; bottom:0; left:0; width:60px; height:4px; background:linear-gradient(90deg,#566749,#8a9a7b); border-radius:2px; }
    .section-header { display:flex; align-items:center; gap:15px; margin-bottom:25px; }
    .section-icon { font-size:32px; }
    .highlight-box { background:linear-gradient(135deg, rgba(86,103,73,0.05), rgba(138,154,123,0.05)); border:2px solid rgba(86,103,73,0.1); border-radius:12px; padding:25px; margin:25px 0; position:relative; }
    table { width:100%; border-collapse:collapse; margin:20px 0; background:#fff; border-radius:12px; overflow:hidden; box-shadow:0 4px 20px rgba(86,103,73,0.1); }
    th,td { padding:14px 16px; text-align:left; border-bottom:1px solid #e8e4d8; vertical-align:top; }
    th { background:linear-gradient(135deg,#566749,#8a9a7b); color:#fff; font-weight:600; font-size:15px; }
    td { font-size:15px; color:#566749; }
    tr:hover { background-color:rgba(86,103,73,0.02); }
    .grid-2 { display:grid; grid-template-columns:1.2fr 1fr; gap:24px; align-items:center; }
    .legend { display:flex; gap:14px; margin-top:10px; flex-wrap:wrap; }
    .legend-item { display:flex; align-items:center; gap:8px; font-size:14px; }
    .dot { width:12px; height:12px; border-radius:3px; }
    .dot.c { background:${C1}; } .dot.p { background:${C2}; } .dot.f { background:${C3}; }

    /* Donut */
    .donut-wrap { display:flex; gap:24px; align-items:center; }
    .donut {
      width:180px; height:180px; border-radius:50%;
      background: conic-gradient(${C1} 0% ${a}% , ${C2} ${a}% ${b}% , ${C3} ${b}% 100%);
      position:relative;
      box-shadow:0 8px 20px rgba(86,103,73,0.15);
    }
    .donut::before {
      content:''; position:absolute; inset:28px; background:#fff; border-radius:50%;
      box-shadow: inset 0 0 0 2px rgba(86,103,73,0.08);
    }
    .donut-center {
      position:absolute; inset:0; display:flex; align-items:center; justify-content:center; font-weight:700; color:#566749;
    }
    .fw { font-weight:600; }

    .toc { background:#fff; padding:30px; border-radius:15px; box-shadow:0 4px 20px rgba(86,103,73,0.1); }
    .toc li { margin-bottom:10px; padding:10px 12px; background:rgba(86,103,73,0.03); border-radius:8px; border-left:3px solid #566749; font-size:15px; }

    .footer-note { text-align:center; margin-top:28px; padding:16px; background:rgba(86,103,73,0.05); border-radius:10px; font-style:italic; color:#8a9a7b; }
  </style>
</head>
<body>

<!-- Cover -->
<div class="cover">
  <div class="cover-content">
    ${logoBase64 ? `<img src="data:image/png;base64,${logoBase64}" alt="Logo" />` : ''}
    <h1>Personalized Diet & Wellness Plan</h1>
    <p class="cover-subtitle">Your journey to optimal health starts here</p>
    <div class="client-info">
      <p><strong>Client:</strong> ${user.name || '-'}</p>
      <p><strong>Email:</strong> ${user.email || '-'}</p>
      <p><strong>Assessment ID:</strong> ${assessment._id}</p>
      <p><strong>Diet Type:</strong> ${plan.dietType || '-'}</p>
    </div>
  </div>
</div>

<!-- TOC -->
<div class="page-break"></div>
<div class="page">
  <div class="section-header"><span class="section-icon">📋</span><h2>Table of Contents</h2></div>
  <ol class="toc">
    <li>📊 Executive Summary</li>
    <li>🔥 Calorie & Macronutrient Analysis</li>
    <li>🍳 Weekly Meal Plan (7 Days)</li>
    <li>⏰ Fasting Schedule</li>
    <li>🏃‍♀️ Fitness Recommendations</li>
    <li>💡 Lifestyle & Wellness Tips</li>
    <li>🧩 Why This Plan Fits You</li>
    <li>📈 Progress Tracking</li>
    <li>📝 Additional Notes</li>
  </ol>
</div>

<!-- Executive Summary -->
<div class="page-break"></div>
<div class="page">
  <div class="section-header"><span class="section-icon">📊</span><h2>Executive Summary</h2></div>
  <div class="highlight-box">
    <p>${plan.summary || 'Your plan is tailored to your goals, schedule and preferences based on your assessment.'}</p>
  </div>
</div>

<!-- Calories / Macros with Donut -->
<div class="page-break"></div>
<div class="page">
  <div class="section-header"><span class="section-icon">🔥</span><h2>Calorie & Macronutrient Analysis</h2></div>
  <div class="grid-2">
    <div>
      <div class="highlight-box">
        <p><strong>Daily Calorie Target:</strong> <span style="font-size:18px; font-weight:700;">${kcal ? `${kcal} kcal/day` : (plan.calories || '-')}</span></p>
        <table>
          <thead><tr><th>Macronutrient</th><th>%</th><th>Grams / day</th></tr></thead>
          <tbody>
            <tr><td class="fw">Carbohydrates</td><td>${carbsPct}%</td><td>${kcal ? `${carbsG} g` : '—'}</td></tr>
            <tr><td class="fw">Protein</td><td>${protPct}%</td><td>${kcal ? `${protG} g` : '—'}</td></tr>
            <tr><td class="fw">Healthy Fats</td><td>${fatsPct}%</td><td>${kcal ? `${fatsG} g` : '—'}</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="donut-wrap">
      <div class="donut"><div class="donut-center">${kcal ? `${kcal} kcal` : ''}</div></div>
      <div class="legend">
        <div class="legend-item"><span class="dot c"></span> Carbs ${carbsPct}%</div>
        <div class="legend-item"><span class="dot p"></span> Protein ${protPct}%</div>
        <div class="legend-item"><span class="dot f"></span> Fats ${fatsPct}%</div>
      </div>
    </div>
  </div>
</div>

<!-- Weekly Meal Plan -->
<div class="page-break"></div>
<div class="page">
  <div class="section-header"><span class="section-icon">🍳</span><h2>Weekly Meal Plan (7 Days)</h2></div>
  ${buildWeeklyTable(plan) || `
    <p class="highlight-box">No weekly plan provided. Your simple day plan will repeat for 7 days by default.</p>
    <table>
      <thead><tr><th>Meal</th><th>Description</th><th>Timing</th></tr></thead>
      <tbody>
        <tr><td class="fw">Breakfast</td><td>${plan.meals?.breakfast || '—'}</td><td>7:00–8:00</td></tr>
        <tr><td class="fw">Lunch</td><td>${plan.meals?.lunch || '—'}</td><td>12:00–13:00</td></tr>
        <tr><td class="fw">Dinner</td><td>${plan.meals?.dinner || '—'}</td><td>18:00–19:00</td></tr>
      </tbody>
    </table>
  `}
</div>

<!-- Fasting -->
<div class="page-break"></div>
<div class="page">
  <div class="section-header"><span class="section-icon">⏰</span><h2>Fasting Schedule</h2></div>
  <div class="highlight-box">
    <p><strong>Recommended Window:</strong> ${plan.fastingWindow || '16:8 (16 hours fasting, 8 hours eating)'}</p>
    <p>Align meal times within this window to support appetite control and energy.</p>
  </div>
</div>

<!-- Fitness -->
<div class="page-break"></div>
<div class="page">
  <div class="section-header"><span class="section-icon">🏃‍♀️</span><h2>Fitness Recommendations</h2></div>
  <div class="highlight-box">
    <p>${(plan.workouts || 'Aim for 3–4 sessions/week: 2 resistance, 1 cardio/HIIT, 1 optional mobility.').replace(/\n/g,'<br>')}</p>
  </div>
</div>

<!-- Lifestyle -->
<div class="page-break"></div>
<div class="page">
  <div class="section-header"><span class="section-icon">💡</span><h2>Lifestyle & Wellness Tips</h2></div>
  <div class="highlight-box">
    <p>${(plan.lifestyle || 'Improve sleep hygiene, hydrate 6–8 glasses/day, manage stress with brief breathwork.').replace(/\n/g,'<br>')}</p>
  </div>
</div>

<!-- Why this plan fits you (references answers) -->
<div class="page-break"></div>
<div class="page">
  <div class="section-header"><span class="section-icon">🧩</span><h2>Why This Plan Fits You</h2></div>
  <div class="highlight-box">
    ${buildWhyThisPlanHTML(assessment)}
  </div>
</div>

<!-- Progress & Notes -->
<div class="page-break"></div>
<div class="page">
  <div class="section-header"><span class="section-icon">📈</span><h2>Progress Tracking</h2></div>
  <table>
    <thead><tr><th style="width:90px">Week</th><th>Weight (kg)</th><th>Notes / Measurements</th></tr></thead>
    <tbody>
      ${Array.from({length:8}).map((_,i)=>`<tr><td class="fw">${i+1}</td><td></td><td></td></tr>`).join('')}
    </tbody>
  </table>

  <div class="section-header"><span class="section-icon">📝</span><h2>Additional Notes</h2></div>
  <div class="highlight-box">
    <p>${(plan.notes || 'Stay consistent, reassess every 2–4 weeks, and adjust as needed.').replace(/\n/g,'<br>')}</p>
  </div>

  <div class="footer-note">
    "The only bad workout is the one that didn't happen."
  </div>
</div>

</body>
</html>
`;

  // Puppeteer
  const browser = await puppeteer.launch(); // add args if your host requires no-sandbox
  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
  await page.pdf({
    path: outputPath,
    format: 'A4',
    printBackground: true,
    displayHeaderFooter: true,
    footerTemplate: `
      <div style="font-size:10px;width:100%;text-align:center;color:#8a9a7b;padding:10px 0;font-family:'Segoe UI',sans-serif;">
        Page <span class="pageNumber"></span> of <span class="totalPages"></span> &nbsp;|&nbsp; ${user.name || 'Client'} – Personalized Diet & Wellness Plan
      </div>`,
    headerTemplate: `<div></div>`,
    margin: { top: '40px', bottom: '70px', left: '40px', right: '40px' }
  });
  await browser.close();
};

module.exports = generateDietPdf;
