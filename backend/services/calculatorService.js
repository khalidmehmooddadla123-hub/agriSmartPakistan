/**
 * AgriSmart360 — Farmer Calculator Services
 *
 * All calculators use Gemini AI for Pakistan-specific accuracy.
 * Each returns a structured JSON that the frontend can render consistently.
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

const MODEL_CHAIN = ['gemini-2.0-flash', 'gemini-flash-latest', 'gemini-2.5-flash'];
let genAI = null;

const getClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key') return null;
  if (!genAI) genAI = new GoogleGenerativeAI(apiKey);
  return genAI;
};

const extractJSON = (text) => {
  if (!text) return null;
  let cleaned = text.trim().replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/, '').trim();
  try { return JSON.parse(cleaned); } catch {}
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (match) { try { return JSON.parse(match[0]); } catch { return null; } }
  return null;
};

const callGemini = async (prompt, temp = 0.3) => {
  const client = getClient();
  if (!client) return null;

  let lastErr;
  for (const modelName of MODEL_CHAIN) {
    try {
      const model = client.getGenerativeModel({
        model: modelName,
        generationConfig: {
          temperature: temp,
          maxOutputTokens: 2500,
          responseMimeType: 'application/json'
        }
      });
      const result = await model.generateContent(prompt);
      return extractJSON(result.response.text().trim());
    } catch (err) {
      lastErr = err;
      const msg = err.message || '';
      if (!(msg.includes('503') || msg.includes('429') || msg.includes('overload'))) break;
      console.warn(`[CALC] Model ${modelName} overloaded, trying next...`);
    }
  }
  console.error('[CALC] Gemini error:', lastErr?.message);
  return null;
};

// ==================================================================
// 1. SMART IRRIGATION CALCULATOR
// ==================================================================
exports.calculateIrrigation = async ({ crop, area, soilType, lastIrrigationDays, temperature, humidity, rainfall, language = 'en' }) => {
  // Math-based fallback using simplified Penman-Monteith
  const crop_coefficients = {
    wheat: 1.15, rice: 1.2, cotton: 1.1, sugarcane: 1.25, maize: 1.15,
    potato: 1.15, tomato: 1.15, onion: 1.05, mango: 0.85, vegetable: 1.0
  };
  const cropKey = crop?.toLowerCase() || 'wheat';
  const kc = crop_coefficients[cropKey] || 1.0;

  // Reference ET (simplified Hargreaves)
  const t = temperature || 25;
  const eto = 0.0023 * (t + 17.8) * Math.sqrt(10) * 0.408 * (t + 273);
  const dailyEtMm = Math.max(2, Math.min(10, eto * kc / 100));
  const totalEtMm = dailyEtMm * (lastIrrigationDays || 7);
  const effectiveRain = (rainfall || 0) * 0.8;
  const netWaterNeedMm = Math.max(0, totalEtMm - effectiveRain);

  // 1mm over 1 acre = 4047 liters. Convert to m³
  const waterNeedM3 = (netWaterNeedMm * (area || 1) * 4047) / 1000;

  // Use Gemini for personalized advice if available
  const prompt = `A Pakistani farmer needs irrigation advice:
- Crop: ${crop}
- Area: ${area} acres
- Soil: ${soilType || 'loamy'}
- Days since last irrigation: ${lastIrrigationDays || 7}
- Current temperature: ${temperature || 25}°C
- Humidity: ${humidity || 50}%
- Recent rainfall: ${rainfall || 0}mm
- Calculated water need: ${Math.round(netWaterNeedMm)}mm (${Math.round(waterNeedM3)} m³)

Return JSON:
{
  "waterNeededMM": number,
  "waterNeededM3": number,
  "recommendation": "Short actionable advice in English (2-3 sentences)",
  "recommendationUrdu": "یہ مشورہ اردو میں",
  "irrigationDuration": "Estimated hours if using tubewell (typical 0.05 m³/sec discharge)",
  "nextIrrigationDate": "YYYY-MM-DD format",
  "bestTime": "Early morning (5-7 AM) or evening (5-7 PM)",
  "waterSavingTip": "One actionable tip to save water",
  "waterSavingTipUrdu": "پانی بچانے کا ایک مشورہ",
  "urgency": "high | medium | low"
}`;

  const aiResult = await callGemini(prompt);
  if (aiResult) return { ...aiResult, method: 'ai-enhanced' };

  // Math fallback
  const hours = Math.round(waterNeedM3 / (0.05 * 3600));
  return {
    waterNeededMM: Math.round(netWaterNeedMm),
    waterNeededM3: Math.round(waterNeedM3),
    recommendation: netWaterNeedMm > 30 ? 'Irrigate within 1-2 days' : netWaterNeedMm > 15 ? 'Irrigate within 3-4 days' : 'No irrigation needed yet',
    recommendationUrdu: netWaterNeedMm > 30 ? '1-2 دن میں آبپاشی کریں' : netWaterNeedMm > 15 ? '3-4 دن میں آبپاشی کریں' : 'ابھی آبپاشی کی ضرورت نہیں',
    irrigationDuration: `${hours} hours`,
    bestTime: 'Early morning or evening',
    waterSavingTip: 'Use furrow or drip irrigation to save 30% water',
    waterSavingTipUrdu: 'نالی یا ڈرپ آبپاشی استعمال کریں، 30% پانی بچائیں',
    urgency: netWaterNeedMm > 30 ? 'high' : netWaterNeedMm > 15 ? 'medium' : 'low',
    method: 'math-calculation'
  };
};

// ==================================================================
// 2. FERTILIZER CALCULATOR (NPK)
// ==================================================================
exports.calculateFertilizer = async ({ crop, area, soilType, previousCrop, language = 'en' }) => {
  const prompt = `A Pakistani farmer needs fertilizer recommendation:
- Crop to grow: ${crop}
- Area: ${area} acres
- Soil type: ${soilType || 'loamy'}
- Previous crop: ${previousCrop || 'none'}

Provide Pakistani-specific fertilizer recommendations with EXACT brand names (Engro, FFC, Fatima, Sarsabz) and current PKR prices.

Return ONLY JSON:
{
  "totalCostPKR": number,
  "fertilizers": [
    {
      "name": "DAP (Di-Ammonium Phosphate)",
      "nameUrdu": "ڈی اے پی",
      "brand": "Engro or FFC Sona DAP",
      "quantityPerAcre": "50 kg",
      "totalQuantity": "X kg (for given area)",
      "pricePerUnit": "PKR 14,500 per 50kg bag",
      "totalPricePKR": number,
      "applicationTime": "At sowing",
      "applicationTimeUrdu": "بجائی کے وقت",
      "purpose": "Phosphorus for root development"
    }
  ],
  "applicationSchedule": "Overall month-by-month plan in English",
  "applicationScheduleUrdu": "مہینہ بہ مہینہ پلان اردو میں",
  "tipsEn": ["tip1", "tip2", "tip3"],
  "tipsUr": ["tip1 urdu", "tip2 urdu", "tip3 urdu"],
  "nitrogenKg": number,
  "phosphorusKg": number,
  "potassiumKg": number
}

Be exact — use real 2025 Pakistani fertilizer prices.`;

  const result = await callGemini(prompt);
  return result || {
    error: 'AI unavailable — please try again later',
    totalCostPKR: 0,
    fertilizers: []
  };
};

// ==================================================================
// 3. CROP YIELD PREDICTOR
// ==================================================================
exports.predictYield = async ({ crop, area, sowingDate, soilType, irrigationType, inputsUsed, rainfall, language = 'en' }) => {
  const daysSinceSow = sowingDate ? Math.floor((Date.now() - new Date(sowingDate).getTime()) / (1000 * 60 * 60 * 24)) : null;

  const prompt = `Predict yield for a Pakistani farmer's crop:
- Crop: ${crop}
- Area: ${area} acres
- Sowing date: ${sowingDate || 'not specified'}${daysSinceSow ? ` (${daysSinceSow} days ago)` : ''}
- Soil: ${soilType || 'loamy'}
- Irrigation: ${irrigationType || 'canal'}
- Inputs used: ${inputsUsed || 'standard'}
- Rainfall received: ${rainfall || 'average'} mm

Return ONLY JSON with Pakistani yield benchmarks (national average + expected):
{
  "expectedYieldMinMaunds": number,
  "expectedYieldMaxMaunds": number,
  "nationalAverageMaunds": number,
  "bestCaseMaunds": number,
  "totalYieldRangeForArea": "X-Y Maunds (for given area)",
  "estimatedRevenueMinPKR": number,
  "estimatedRevenueMaxPKR": number,
  "marketPricePerMaund": number,
  "confidencePercent": number,
  "harvestTiming": "Expected harvest month or date range",
  "harvestTimingUrdu": "کٹائی کا متوقع وقت",
  "riskFactors": ["factor 1", "factor 2"],
  "riskFactorsUrdu": ["خطرہ 1", "خطرہ 2"],
  "improvementTips": ["Top 3 tips to maximize yield"],
  "improvementTipsUrdu": ["پیداوار بڑھانے کے ٹپس"]
}

Use real Pakistan yields: Wheat 30-45 Maund/acre, Rice 40-60 Maund/acre, Cotton 25-40 Maund/acre.`;

  const result = await callGemini(prompt, 0.4);
  return result || { error: 'AI unavailable' };
};

// ==================================================================
// 4. CROP ROTATION PLANNER
// ==================================================================
exports.suggestCropRotation = async ({ lastCrops, soilType, region, season, language = 'en' }) => {
  const prompt = `A Pakistani farmer needs crop rotation advice:
- Last 3 crops grown: ${Array.isArray(lastCrops) ? lastCrops.join(', ') : lastCrops}
- Soil type: ${soilType || 'loamy'}
- Region: ${region || 'Punjab'}
- Upcoming season: ${season || 'Rabi'}

Suggest the best 3 crops to plant next for soil health AND profit. Consider Pakistan crop calendar.

Return ONLY JSON:
{
  "recommendations": [
    {
      "crop": "Crop name",
      "cropUrdu": "اردو نام",
      "score": 0-100,
      "reason": "Why this crop — soil health benefit, market demand, climate fit",
      "reasonUrdu": "اردو میں وجہ",
      "expectedProfitPerAcre": "PKR X-Y",
      "difficulty": "easy | medium | hard",
      "soilBenefit": "E.g. fixes nitrogen, breaks pest cycle",
      "soilBenefitUrdu": "مٹی کا فائدہ",
      "sowingTime": "Month range",
      "marketDemand": "high | medium | low"
    }
  ],
  "avoidCrops": ["crops to avoid after the last crop", "and why"],
  "avoidCropsUrdu": ["اجتناب کریں"],
  "generalTip": "One pro tip about rotation",
  "generalTipUrdu": "ایک خاص مشورہ"
}`;

  const result = await callGemini(prompt);
  return result || { error: 'AI unavailable' };
};

// ==================================================================
// 5. ZAKAT / USHAR CALCULATOR
// ==================================================================
exports.calculateZakat = ({ harvestMaunds, pricePerMaund, irrigationType }) => {
  const totalValue = (harvestMaunds || 0) * (pricePerMaund || 0);

  // Islamic jurisprudence: 10% (Ushar) for rain-fed, 5% (Nisf-Ushar) for irrigated
  const usharRate = irrigationType === 'rain-fed' ? 0.10 : 0.05;
  const usharAmount = totalValue * usharRate;
  const usharInMaunds = (harvestMaunds || 0) * usharRate;

  // Nisab check (approximate — 653 kg of wheat as per standard)
  const nisabMaunds = 653 / 40; // ~16.3 Maunds
  const isEligible = (harvestMaunds || 0) >= nisabMaunds;

  return {
    totalHarvestMaunds: harvestMaunds,
    totalValuePKR: Math.round(totalValue),
    irrigationType,
    usharRate: usharRate * 100,
    usharRateLabel: irrigationType === 'rain-fed' ? '10% (Ushar — rain-fed)' : '5% (Nisf-Ushar — irrigated)',
    usharRateLabelUrdu: irrigationType === 'rain-fed' ? '10% (عشر — بارانی)' : '5% (نصف عشر — آبی)',
    usharAmountPKR: Math.round(usharAmount),
    usharInMaunds: Math.round(usharInMaunds * 100) / 100,
    nisabMaunds: Math.round(nisabMaunds * 100) / 100,
    isEligible,
    note: isEligible
      ? 'Your harvest exceeds nisab — Ushar is obligatory (wajib).'
      : `Your harvest is below nisab (${Math.round(nisabMaunds)} maunds). Ushar is not obligatory.`,
    noteUrdu: isEligible
      ? 'آپ کی فصل نصاب سے زیادہ ہے — عشر واجب ہے۔'
      : `فصل نصاب (${Math.round(nisabMaunds)} من) سے کم ہے۔ عشر واجب نہیں۔`
  };
};
