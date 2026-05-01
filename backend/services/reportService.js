/**
 * AgriSmart360 — Annual Farm Report Service
 *
 * Generates HTML reports (printable as PDF via browser).
 * Includes: farms summary, crops grown, expenses, revenue, profit, charts.
 */

const Farm = require('../models/Farm');
const Expense = require('../models/Expense');
const User = require('../models/User');

const formatPKR = (n) => `PKR ${(n || 0).toLocaleString()}`;

exports.generateAnnualReport = async (userId, year = new Date().getFullYear()) => {
  const user = await User.findById(userId).populate('locationID');
  if (!user) throw new Error('User not found');

  // Get all farms (including archived for full history)
  const farms = await Farm.find({ userID: userId })
    .populate('locationID', 'city province')
    .populate('crops.cropID', 'cropName cropNameUrdu unit');

  // Get all expenses for the year
  const expenses = await Expense.find({ userID: userId, year });

  // Aggregate
  const totalRevenue = expenses.filter(e => e.isRevenue).reduce((s, e) => s + e.amountPKR, 0);
  const totalExpenses = expenses.filter(e => !e.isRevenue).reduce((s, e) => s + e.amountPKR, 0);
  const profit = totalRevenue - totalExpenses;
  const margin = totalRevenue > 0 ? ((profit / totalRevenue) * 100).toFixed(1) : 0;

  const totalMaunds = expenses.filter(e => e.isRevenue && e.quantityMaunds)
    .reduce((s, e) => s + e.quantityMaunds, 0);
  const breakEven = totalMaunds > 0 ? Math.ceil(totalExpenses / totalMaunds) : null;

  const byCategory = {};
  expenses.filter(e => !e.isRevenue).forEach(e => {
    byCategory[e.category] = (byCategory[e.category] || 0) + e.amountPKR;
  });

  const byCrop = {};
  expenses.forEach(e => {
    const key = e.cropName || 'General';
    if (!byCrop[key]) byCrop[key] = { revenue: 0, expense: 0 };
    if (e.isRevenue) byCrop[key].revenue += e.amountPKR;
    else byCrop[key].expense += e.amountPKR;
  });

  const seasonStats = { Rabi: { revenue: 0, expense: 0 }, Kharif: { revenue: 0, expense: 0 } };
  expenses.forEach(e => {
    if (!seasonStats[e.season]) seasonStats[e.season] = { revenue: 0, expense: 0 };
    if (e.isRevenue) seasonStats[e.season].revenue += e.amountPKR;
    else seasonStats[e.season].expense += e.amountPKR;
  });

  const totalAreaAcres = farms.reduce((s, f) => s + (f.totalAreaAcres || 0), 0);
  const totalCropsGrown = farms.reduce((s, f) => s + (f.crops?.length || 0), 0);
  const harvestedThisYear = farms.reduce((s, f) =>
    s + (f.crops?.filter(c => c.status === 'harvested' && new Date(c.expectedHarvestDate || c.sowDate).getFullYear() === year).length || 0), 0);

  const isUrdu = user.language === 'ur';

  const html = `<!DOCTYPE html>
<html dir="${isUrdu ? 'rtl' : 'ltr'}" lang="${user.language || 'en'}">
<head>
  <meta charset="UTF-8">
  <title>AgriSmart360 — Annual Report ${year}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Plus Jakarta Sans', Arial, sans-serif;
      color: #1f2937;
      background: #f8fafc;
      line-height: 1.5;
    }
    .container { max-width: 850px; margin: 0 auto; padding: 24px; background: white; }
    .hero {
      background: linear-gradient(135deg, #16a34a, #059669, #0d9488);
      color: white;
      padding: 32px;
      border-radius: 24px;
      margin-bottom: 24px;
      position: relative;
      overflow: hidden;
    }
    .hero::after {
      content: '';
      position: absolute;
      top: -40px; right: -40px;
      width: 200px; height: 200px;
      background: rgba(255,255,255,0.1);
      border-radius: 50%;
      filter: blur(40px);
    }
    .hero-content { position: relative; z-index: 1; }
    .hero h1 { font-size: 32px; font-weight: 800; margin-bottom: 4px; }
    .hero .year { font-size: 48px; font-weight: 800; opacity: 0.9; margin: 8px 0; }
    .hero p { font-size: 14px; opacity: 0.9; }
    .hero .meta { margin-top: 16px; font-size: 12px; opacity: 0.85; }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-bottom: 24px;
    }
    .stat-card {
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 16px;
      padding: 16px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    .stat-card .label { font-size: 11px; color: #6b7280; text-transform: uppercase; font-weight: 600; }
    .stat-card .value { font-size: 22px; font-weight: 800; color: #1f2937; margin-top: 4px; }
    .stat-card .sub { font-size: 11px; color: #9ca3af; margin-top: 2px; }
    .stat-card.green { border-color: #bbf7d0; background: linear-gradient(135deg, #f0fdf4, white); }
    .stat-card.green .value { color: #15803d; }
    .stat-card.red { border-color: #fecaca; background: linear-gradient(135deg, #fef2f2, white); }
    .stat-card.red .value { color: #b91c1c; }
    .stat-card.blue { border-color: #bfdbfe; background: linear-gradient(135deg, #eff6ff, white); }
    .stat-card.blue .value { color: #1e40af; }
    .stat-card.purple { border-color: #e9d5ff; background: linear-gradient(135deg, #faf5ff, white); }
    .stat-card.purple .value { color: #7e22ce; }

    h2 {
      font-size: 18px;
      font-weight: 700;
      color: #1f2937;
      margin: 24px 0 12px;
      padding-bottom: 8px;
      border-bottom: 2px solid #16a34a;
    }
    .section { background: white; border: 1px solid #e5e7eb; border-radius: 16px; padding: 20px; margin-bottom: 16px; }

    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    table th { background: #f9fafb; padding: 10px; text-align: left; font-size: 11px; font-weight: 600; text-transform: uppercase; color: #6b7280; }
    table td { padding: 10px; border-top: 1px solid #f3f4f6; }
    table tr:hover { background: #f9fafb; }
    .text-right { text-align: right; }
    .text-green { color: #16a34a; font-weight: 700; }
    .text-red { color: #dc2626; font-weight: 700; }
    .text-bold { font-weight: 700; }

    .bar-row { display: flex; align-items: center; gap: 12px; margin: 8px 0; }
    .bar-row .name { width: 120px; font-size: 12px; font-weight: 600; }
    .bar-row .bar-track { flex: 1; height: 24px; background: #f3f4f6; border-radius: 8px; overflow: hidden; position: relative; }
    .bar-row .bar-fill {
      height: 100%;
      background: linear-gradient(90deg, #16a34a, #22c55e);
      border-radius: 8px;
      display: flex;
      align-items: center;
      padding: 0 8px;
      color: white;
      font-size: 11px;
      font-weight: 700;
      min-width: 40px;
    }
    .bar-row .value { width: 90px; text-align: right; font-size: 12px; font-weight: 700; }

    .farm-card {
      background: linear-gradient(135deg, #f0fdf4, white);
      border: 1px solid #bbf7d0;
      border-radius: 16px;
      padding: 16px;
      margin-bottom: 12px;
    }
    .farm-card h3 { font-size: 16px; font-weight: 700; color: #15803d; }
    .farm-card .meta { font-size: 12px; color: #166534; margin-top: 4px; }
    .farm-card .crops { font-size: 12px; color: #4b5563; margin-top: 8px; }

    .insights {
      background: linear-gradient(135deg, #fef3c7, #fde68a);
      border: 1px solid #fcd34d;
      border-radius: 16px;
      padding: 20px;
      margin: 16px 0;
    }
    .insights h2 { border-color: #d97706; color: #92400e; margin-top: 0; }
    .insights ul { padding-left: 20px; font-size: 13px; line-height: 1.8; color: #78350f; }

    .footer {
      text-align: center;
      padding: 24px;
      color: #9ca3af;
      font-size: 12px;
      margin-top: 24px;
      border-top: 1px solid #e5e7eb;
    }

    @media print {
      body { background: white; }
      .container { padding: 0; }
      .no-print { display: none; }
      .section, .stat-card { page-break-inside: avoid; box-shadow: none; }
      h2 { page-break-after: avoid; }
    }

    @page { size: A4; margin: 1.5cm; }
  </style>
</head>
<body>
  <div class="container">
    <!-- Hero -->
    <div class="hero">
      <div class="hero-content">
        <div style="font-size: 12px; opacity: 0.85; letter-spacing: 0.1em; text-transform: uppercase;">${isUrdu ? 'سالانہ کاشتکاری رپورٹ' : 'Annual Farming Report'}</div>
        <h1>🌾 AgriSmart360</h1>
        <div class="year">${year}</div>
        <p>${user.fullName} ${user.locationID ? `• ${user.locationID.city}, ${user.locationID.province}` : ''}</p>
        <div class="meta">${isUrdu ? 'تیار کیا گیا' : 'Generated'}: ${new Date().toLocaleDateString('en-PK', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
      </div>
    </div>

    <!-- Key Stats -->
    <div class="stats-grid">
      <div class="stat-card green">
        <div class="label">${isUrdu ? 'کل آمدنی' : 'Revenue'}</div>
        <div class="value">${formatPKR(totalRevenue)}</div>
        <div class="sub">${expenses.filter(e => e.isRevenue).length} ${isUrdu ? 'انٹریز' : 'entries'}</div>
      </div>
      <div class="stat-card red">
        <div class="label">${isUrdu ? 'اخراجات' : 'Expenses'}</div>
        <div class="value">${formatPKR(totalExpenses)}</div>
        <div class="sub">${expenses.filter(e => !e.isRevenue).length} ${isUrdu ? 'لاگت' : 'costs'}</div>
      </div>
      <div class="stat-card ${profit >= 0 ? 'green' : 'red'}">
        <div class="label">${isUrdu ? 'خالص منافع' : 'Net Profit'}</div>
        <div class="value">${formatPKR(profit)}</div>
        <div class="sub">${margin}% ${isUrdu ? 'مارجن' : 'margin'}</div>
      </div>
      <div class="stat-card blue">
        <div class="label">${isUrdu ? 'کل رقبہ' : 'Total Area'}</div>
        <div class="value">${totalAreaAcres}</div>
        <div class="sub">${isUrdu ? 'ایکڑ' : 'acres'} • ${farms.length} ${isUrdu ? 'فارم' : 'farms'}</div>
      </div>
    </div>

    <!-- Farms Section -->
    ${farms.length > 0 ? `
    <h2>🚜 ${isUrdu ? 'فارمز' : 'Farms'}</h2>
    <div class="section">
      ${farms.map(f => `
        <div class="farm-card">
          <h3>${f.name}</h3>
          <div class="meta">
            📐 ${f.totalAreaAcres} ${isUrdu ? 'ایکڑ' : 'acres'}
            ${f.locationID ? ` • 📍 ${f.locationID.city}` : ''}
            • 🌍 ${f.soilType}
            • 💧 ${f.irrigationSource}
          </div>
          ${f.crops?.length > 0 ? `<div class="crops">🌾 ${f.crops.length} ${isUrdu ? 'فصلیں' : 'crops'}: ${f.crops.map(c => c.cropID?.cropName || 'Unknown').join(', ')}</div>` : ''}
        </div>
      `).join('')}
    </div>
    ` : ''}

    <!-- Expenses by Category -->
    ${Object.keys(byCategory).length > 0 ? `
    <h2>💰 ${isUrdu ? 'زمرہ کے حساب سے اخراجات' : 'Expenses by Category'}</h2>
    <div class="section">
      ${(() => {
        const max = Math.max(...Object.values(byCategory));
        return Object.entries(byCategory).sort((a, b) => b[1] - a[1]).map(([cat, amt]) => `
          <div class="bar-row">
            <div class="name">${cat.charAt(0).toUpperCase() + cat.slice(1)}</div>
            <div class="bar-track">
              <div class="bar-fill" style="width: ${(amt / max * 100).toFixed(1)}%">${((amt / totalExpenses) * 100).toFixed(0)}%</div>
            </div>
            <div class="value">${formatPKR(amt)}</div>
          </div>
        `).join('');
      })()}
    </div>
    ` : ''}

    <!-- Crop Performance -->
    ${Object.keys(byCrop).length > 0 ? `
    <h2>🌾 ${isUrdu ? 'فصل کی کارکردگی' : 'Crop Performance'}</h2>
    <div class="section">
      <table>
        <thead>
          <tr>
            <th>${isUrdu ? 'فصل' : 'Crop'}</th>
            <th class="text-right">${isUrdu ? 'آمدنی' : 'Revenue'}</th>
            <th class="text-right">${isUrdu ? 'اخراجات' : 'Expenses'}</th>
            <th class="text-right">${isUrdu ? 'منافع' : 'Profit'}</th>
          </tr>
        </thead>
        <tbody>
          ${Object.entries(byCrop).sort((a, b) => (b[1].revenue - b[1].expense) - (a[1].revenue - a[1].expense)).map(([crop, data]) => {
            const p = data.revenue - data.expense;
            return `<tr>
              <td class="text-bold">${crop}</td>
              <td class="text-right text-green">${formatPKR(data.revenue)}</td>
              <td class="text-right text-red">${formatPKR(data.expense)}</td>
              <td class="text-right ${p >= 0 ? 'text-green' : 'text-red'}">${formatPKR(p)}</td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>
    ` : ''}

    <!-- Season Comparison -->
    <h2>🌤 ${isUrdu ? 'موسمی موازنہ' : 'Seasonal Comparison'}</h2>
    <div class="section" style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
      <div style="padding: 16px; background: #fffbeb; border-radius: 12px; border: 1px solid #fcd34d;">
        <div style="font-size: 12px; color: #78350f; font-weight: 700; text-transform: uppercase;">${isUrdu ? 'ربیع (سرما)' : 'Rabi (Winter)'}</div>
        <div style="font-size: 22px; font-weight: 700; color: #92400e; margin-top: 8px;">${formatPKR(seasonStats.Rabi.revenue - seasonStats.Rabi.expense)}</div>
        <div style="font-size: 11px; color: #78350f; margin-top: 4px;">
          ${formatPKR(seasonStats.Rabi.revenue)} ${isUrdu ? 'آمدنی' : 'rev'} • ${formatPKR(seasonStats.Rabi.expense)} ${isUrdu ? 'لاگت' : 'cost'}
        </div>
      </div>
      <div style="padding: 16px; background: #ecfdf5; border-radius: 12px; border: 1px solid #6ee7b7;">
        <div style="font-size: 12px; color: #065f46; font-weight: 700; text-transform: uppercase;">${isUrdu ? 'خریف (گرما)' : 'Kharif (Summer)'}</div>
        <div style="font-size: 22px; font-weight: 700; color: #047857; margin-top: 8px;">${formatPKR(seasonStats.Kharif.revenue - seasonStats.Kharif.expense)}</div>
        <div style="font-size: 11px; color: #065f46; margin-top: 4px;">
          ${formatPKR(seasonStats.Kharif.revenue)} ${isUrdu ? 'آمدنی' : 'rev'} • ${formatPKR(seasonStats.Kharif.expense)} ${isUrdu ? 'لاگت' : 'cost'}
        </div>
      </div>
    </div>

    <!-- Insights -->
    <div class="insights">
      <h2>💡 ${isUrdu ? 'بصیرت اور سفارشات' : 'Insights & Recommendations'}</h2>
      <ul>
        ${profit > 0
          ? `<li>${isUrdu ? `بہترین! آپ نے اس سال ${formatPKR(profit)} کا منافع کمایا (${margin}% مارجن)۔` : `Excellent! You earned ${formatPKR(profit)} profit this year (${margin}% margin).`}</li>`
          : `<li>${isUrdu ? `${formatPKR(Math.abs(profit))} کا نقصان ہوا۔ اخراجات کم کرنے یا زیادہ منافع والی فصلوں پر غور کریں۔` : `Loss of ${formatPKR(Math.abs(profit))}. Consider reducing costs or switching to higher-margin crops.`}</li>`
        }
        ${breakEven ? `<li>${isUrdu ? `بریک ایون قیمت: PKR ${breakEven}/من — اس سے کم میں نہ بیچیں۔` : `Break-even price: PKR ${breakEven}/Maund — never sell below this.`}</li>` : ''}
        ${Object.keys(byCategory).length > 0 ? `<li>${isUrdu ? `سب سے بڑی لاگت` : 'Biggest expense'}: ${Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0][0]} (${formatPKR(Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0][1])})</li>` : ''}
        ${harvestedThisYear > 0 ? `<li>${isUrdu ? `${harvestedThisYear} فصلیں اس سال کاٹیں` : `${harvestedThisYear} crops harvested this year`}</li>` : ''}
        <li>${isUrdu ? 'اگلے سال AI سفارشات استعمال کریں — منافع 20% تک بڑھ سکتا ہے!' : 'Use AI recommendations next year — profit can grow up to 20%!'}</li>
      </ul>
    </div>

    <div class="footer">
      <p><strong>AgriSmart360</strong> — ${isUrdu ? 'سمارٹ زراعت پاکستانی کسانوں کے لیے' : 'Smart Agriculture for Pakistani Farmers'}</p>
      <p style="margin-top: 4px;">${isUrdu ? 'یہ رپورٹ آپ کے ذاتی ڈیٹا سے خود بخود بنائی گئی' : 'Report auto-generated from your personal data'} • ${new Date().getFullYear()}</p>
      <p class="no-print" style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #e5e7eb;">
        💡 ${isUrdu ? 'PDF میں محفوظ کرنے کے لیے Ctrl+P دبائیں' : 'Press Ctrl+P (or Cmd+P) to save as PDF'}
      </p>
    </div>
  </div>
</body>
</html>`;

  return { html, summary: { totalRevenue, totalExpenses, profit, margin, totalMaunds, breakEven } };
};
