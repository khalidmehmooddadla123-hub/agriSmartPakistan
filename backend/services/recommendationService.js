/**
 * Crop Recommendation Engine
 * Recommends crops based on location, weather, season, and market prices
 */

// Pakistan crop calendar: which crops grow best in which months
const cropCalendar = {
  wheat: { sowMonths: [10, 11, 12], harvestMonths: [3, 4, 5], tempRange: [10, 25], waterNeed: 'medium', provinces: ['Punjab', 'Sindh', 'KPK', 'Balochistan'] },
  rice: { sowMonths: [5, 6, 7], harvestMonths: [10, 11], tempRange: [20, 37], waterNeed: 'high', provinces: ['Punjab', 'Sindh'] },
  cotton: { sowMonths: [4, 5, 6], harvestMonths: [9, 10, 11], tempRange: [21, 37], waterNeed: 'medium', provinces: ['Punjab', 'Sindh'] },
  sugarcane: { sowMonths: [2, 3, 9, 10], harvestMonths: [11, 12, 1, 2], tempRange: [20, 35], waterNeed: 'high', provinces: ['Punjab', 'Sindh', 'KPK'] },
  maize: { sowMonths: [2, 3, 7, 8], harvestMonths: [5, 6, 10, 11], tempRange: [18, 32], waterNeed: 'medium', provinces: ['Punjab', 'KPK'] },
  potato: { sowMonths: [10, 11, 1, 2], harvestMonths: [2, 3, 4], tempRange: [15, 25], waterNeed: 'medium', provinces: ['Punjab', 'KPK'] },
  tomato: { sowMonths: [1, 2, 7, 8], harvestMonths: [4, 5, 10, 11], tempRange: [18, 30], waterNeed: 'medium', provinces: ['Punjab', 'Sindh', 'KPK', 'Balochistan'] },
  onion: { sowMonths: [10, 11, 12], harvestMonths: [3, 4, 5], tempRange: [13, 30], waterNeed: 'low', provinces: ['Punjab', 'Sindh', 'Balochistan'] },
  mango: { sowMonths: [2, 3], harvestMonths: [5, 6, 7, 8], tempRange: [24, 40], waterNeed: 'medium', provinces: ['Punjab', 'Sindh'] },
  mustard: { sowMonths: [10, 11], harvestMonths: [2, 3], tempRange: [10, 25], waterNeed: 'low', provinces: ['Punjab', 'Sindh', 'KPK'] },
  lentil: { sowMonths: [10, 11], harvestMonths: [3, 4], tempRange: [10, 25], waterNeed: 'low', provinces: ['Punjab', 'KPK'] },
  chickpea: { sowMonths: [10, 11], harvestMonths: [3, 4], tempRange: [10, 25], waterNeed: 'low', provinces: ['Punjab', 'KPK', 'Balochistan'] }
};

// Urdu crop names
const cropUrdu = {
  wheat: 'گندم', rice: 'چاول', cotton: 'کپاس', sugarcane: 'گنا',
  maize: 'مکئی', potato: 'آلو', tomato: 'ٹماٹر', onion: 'پیاز',
  mango: 'آم', mustard: 'سرسوں', lentil: 'مسور دال', chickpea: 'چنا'
};

/**
 * Get crop recommendations based on conditions
 */
exports.getRecommendations = (params = {}) => {
  const {
    temperature,
    humidity,
    province,
    month = new Date().getMonth() + 1,
    language = 'en'
  } = params;

  const recommendations = [];

  for (const [cropName, data] of Object.entries(cropCalendar)) {
    let score = 0;
    const reasons = [];
    const reasonsUrdu = [];

    // Season match (most important)
    if (data.sowMonths.includes(month)) {
      score += 40;
      reasons.push('Perfect sowing season');
      reasonsUrdu.push('بوائی کا بہترین موسم');
    } else if (data.harvestMonths.includes(month)) {
      score += 15;
      reasons.push('Harvest season');
      reasonsUrdu.push('کٹائی کا موسم');
    }

    // Temperature match
    if (temperature !== undefined) {
      if (temperature >= data.tempRange[0] && temperature <= data.tempRange[1]) {
        score += 25;
        reasons.push(`Temperature (${temperature}°C) is ideal`);
        reasonsUrdu.push(`درجہ حرارت (${temperature}°C) موزوں ہے`);
      } else if (Math.abs(temperature - data.tempRange[0]) <= 5 || Math.abs(temperature - data.tempRange[1]) <= 5) {
        score += 10;
        reasons.push('Temperature is acceptable');
        reasonsUrdu.push('درجہ حرارت قابل قبول ہے');
      }
    }

    // Province match
    if (province) {
      const prov = province.toLowerCase();
      if (data.provinces.some(p => prov.includes(p.toLowerCase()))) {
        score += 20;
        reasons.push(`Grows well in ${province}`);
        reasonsUrdu.push(`${province} میں اچھی پیداوار`);
      }
    }

    // Humidity / water need match
    if (humidity !== undefined) {
      if ((data.waterNeed === 'high' && humidity > 60) ||
          (data.waterNeed === 'medium' && humidity >= 40 && humidity <= 75) ||
          (data.waterNeed === 'low' && humidity < 60)) {
        score += 15;
        reasons.push('Water conditions suitable');
        reasonsUrdu.push('پانی کی صورتحال موزوں');
      }
    }

    if (score >= 30) {
      recommendations.push({
        crop: cropName,
        cropUrdu: cropUrdu[cropName],
        score,
        waterNeed: data.waterNeed,
        waterNeedUrdu: data.waterNeed === 'high' ? 'زیادہ' : data.waterNeed === 'medium' ? 'درمیانی' : 'کم',
        sowMonths: data.sowMonths,
        harvestMonths: data.harvestMonths,
        tempRange: data.tempRange,
        reasons: language === 'ur' ? reasonsUrdu : reasons
      });
    }
  }

  // Sort by score descending
  recommendations.sort((a, b) => b.score - a.score);

  return recommendations.slice(0, 6);
};

/**
 * Get current season name
 */
exports.getCurrentSeason = (month = new Date().getMonth() + 1) => {
  if (month >= 3 && month <= 5) return { en: 'Rabi Harvest / Kharif Prep', ur: 'ربیع کٹائی / خریف تیاری' };
  if (month >= 6 && month <= 8) return { en: 'Kharif (Summer) Season', ur: 'خریف (گرما) موسم' };
  if (month >= 9 && month <= 11) return { en: 'Kharif Harvest / Rabi Prep', ur: 'خریف کٹائی / ربیع تیاری' };
  return { en: 'Rabi (Winter) Season', ur: 'ربیع (سرما) موسم' };
};
