const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const generateDietPdf = async (assessment, outputPath) => {
  const logoPath = path.resolve(__dirname, '../public/main-logo.png');
  const logoBase64 = fs.existsSync(logoPath)
    ? fs.readFileSync(logoPath, { encoding: 'base64' })
    : '';

  const plan = assessment.dietPlan || {};
  const user = assessment.user || {};

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: 'Segoe UI', sans-serif;
      margin: 0;
      padding: 0;
      color: #333;
    }
    .page {
      padding: 40px;
    }
    .cover {
        background: #566749;
        text-align: center;
        height: 100vh; /* fill full page height */
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        padding: 0;
        margin: 0;
        color: #ffffff;
    }
    .cover img {
      width: 140px;
      margin-bottom: 20px;
    }
    .page-break {
        page-break-before: always;
    }
    .cover h1 {
      font-size: 36px;
      color: #566749;
    }
    .client-info {
      font-size: 16px;
      margin-top: 20px;
    }
    h2 {
      color: #566749;
      font-size: 22px;
      margin-top: 30px;
      border-bottom: 2px solid #566749;
      padding-bottom: 5px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
    }
    th, td {
      border: 1px solid #ccc;
      padding: 8px;
    }
    th {
      background: #f8f6f2;
      text-align: left;
    }
    .section p {
      line-height: 1.6;
    }
    .toc li {
      margin-bottom: 5px;
    }
  </style>
</head>
<body>

<div class="cover">
  <img src="data:image/png;base64,${logoBase64}" alt="Logo" />
  <h1 style="color: #ffffff;">Personalized Diet & Wellness Plan</h1>
  <div class="client-info">
    <p><strong>Client:</strong> ${user.name || '-'} (${user.email || '-'})</p>
    <p><strong>Assessment ID:</strong> ${assessment._id}</p>
    <p><strong>Diet Type:</strong> ${plan.dietType || '-'}</p>
  </div>
</div>

<div class="page-break"></div>
<div class="page">
  <h2>📘 Table of Contents</h2>
  <ol class="toc">
    <li>📜 Summary</li>
    <li>🔥 Calorie & Macronutrient Breakdown</li>
    <li>🍳 Meal Plan</li>
    <li>🏃 Workout Plan</li>
    <li>💡 Lifestyle Tips</li>
    <li>📊 Progress Tracker</li>
    <li>📝 Final Notes</li>
  </ol>
</div>

<div class="page-break"></div>
<div class="page">
  <h2>📜 Summary</h2>
  <p>${plan.summary || '-'}</p>

  <h2>🔥 Calorie & Macronutrient Breakdown</h2>
  <p><strong>Calorie Target:</strong> ${plan.calories || '-'}</p>
  <table>
    <tr><th>Macronutrient</th><th>Percentage</th></tr>
    <tr><td>Carbs</td><td>${plan.macros?.carbs || '-'}%</td></tr>
    <tr><td>Protein</td><td>${plan.macros?.protein || '-'}%</td></tr>
    <tr><td>Fats</td><td>${plan.macros?.fats || '-'}%</td></tr>
  </table>
</div>

<div class="page-break"></div>
<div class="page">
  <h2>⏰ Fasting Window</h2>
  <p>${plan.fastingWindow || '-'}</p>

  <h2>🍳 Meal Plan</h2>
  <table>
    <tr><th>Meal</th><th>Description</th></tr>
    <tr><td>Breakfast</td><td>${plan.meals?.breakfast || '-'}</td></tr>
    <tr><td>Lunch</td><td>${plan.meals?.lunch || '-'}</td></tr>
    <tr><td>Dinner</td><td>${plan.meals?.dinner || '-'}</td></tr>
  </table>
</div>
<div class="page-break"></div>
<div class="page">
  <h2>🏃 Workout Plan</h2>
  <p>${(plan.workouts || '-').replace(/\n/g, '<br>')}</p>

  <h2>💡 Lifestyle Tips</h2>
  <p>${(plan.lifestyle || '-').replace(/\n/g, '<br>')}</p>
</div>
<div class="page-break"></div>
<div class="page">
  <h2>📊 Progress Tracker</h2>
  <p>Here you can track your weight and notes weekly to monitor your progress throughout the plan.</p>
  <table>
    <tr><th>Week</th><th>Weight</th><th>Notes</th></tr>
    ${Array.from({ length: 6 }).map((_, i) =>
      `<tr><td>${i + 1}</td><td>______</td><td>________________</td></tr>`
    ).join('')}
  </table>

  <h2>📝 Final Notes</h2>
  <p>${(plan.notes || '-').replace(/\n/g, '<br>')}</p>
</div>

</body>
</html>
`;

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

  await page.pdf({
    path: outputPath,
    format: 'A4',
    printBackground: true,
    displayHeaderFooter: true,
    footerTemplate: `
      <div style="font-size:10px;width:100%;text-align:center;color:#999;padding:5px 0;">
        Page <span class="pageNumber"></span> of <span class="totalPages"></span> &nbsp;|&nbsp; ${user.name || 'Client'} – Personalized Diet Plan
      </div>
    `,
    headerTemplate: `<div></div>`,
    margin: { top: '40px', bottom: '60px', left: '40px', right: '40px' },
  });

  await browser.close();
};

module.exports = generateDietPdf;
