const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: require('path').join(__dirname, '..', '.env') });
const Price = require('../models/Price');
const Crop = require('../models/Crop');
const Location = require('../models/Location');

// Real-world base prices (April 2026 approximate) in PKR per unit
const basePrices = {
  'Wheat':      { intl: 315, national: 4300, localBase: 4000, msp: 4000, unit: 'Maund' },
  'Rice':       { intl: 480, national: 9200, localBase: 8800, msp: 8500, unit: 'Maund' },
  'Cotton':     { intl: 195, national: 19500, localBase: 18500, msp: 18000, unit: 'Maund' },
  'Sugarcane':  { intl: 28, national: 380, localBase: 340, msp: 340, unit: 'Maund' },
  'Maize':      { intl: 225, national: 3500, localBase: 3200, msp: 3000, unit: 'Maund' },
  'Mango':      { intl: 1350, national: 280, localBase: 220, msp: null, unit: 'KG' },
  'Tomato':     { intl: 850, national: 200, localBase: 150, msp: null, unit: 'KG' },
  'Onion':      { intl: 420, national: 140, localBase: 110, msp: null, unit: 'KG' },
  'Potato':     { intl: 380, national: 95, localBase: 70, msp: null, unit: 'KG' },
  'Chickpea':   { intl: 650, national: 5800, localBase: 5400, msp: 5200, unit: 'Maund' },
  'Mustard':    { intl: 580, national: 7500, localBase: 7000, msp: 6800, unit: 'Maund' },
  'Sunflower':  { intl: 520, national: 7000, localBase: 6500, msp: 6200, unit: 'Maund' }
};

// Province-wise price multipliers (local prices vary by region)
const provinceMultipliers = {
  'Punjab': 1.0,
  'Sindh': 0.95,
  'KPK': 1.05,
  'Balochistan': 0.90,
  'Gilgit-Baltistan': 1.15,
  'Azad Kashmir': 1.10,
  'Islamabad': 1.08
};

// City-level slight variation (nearby cities have similar prices, distant cities differ)
function cityVariation(city) {
  let hash = 0;
  for (let i = 0; i < city.length; i++) {
    hash = ((hash << 5) - hash) + city.charCodeAt(i);
    hash |= 0;
  }
  return 0.95 + (Math.abs(hash) % 100) / 1000; // 0.95 to 1.05
}

async function seedPrices() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear old prices
    await Price.deleteMany({});
    console.log('Cleared old prices');

    const crops = await Crop.find({ isActive: true });
    const locations = await Location.find({});
    console.log(`Found ${crops.length} crops and ${locations.length} locations`);

    const allPrices = [];
    const now = new Date();

    for (let day = 30; day >= 0; day--) {
      const date = new Date(now);
      date.setDate(date.getDate() - day);
      date.setHours(12, 0, 0, 0);

      // Daily market variation (simulates real market movement)
      const dayTrend = Math.sin(day * 0.2) * 0.03; // +/- 3% seasonal
      const dailyNoise = (Math.random() - 0.5) * 0.02; // +/- 1% daily
      const dayFactor = 1 + dayTrend + dailyNoise;

      for (const crop of crops) {
        const base = basePrices[crop.cropName];
        if (!base) continue;

        const prevDayFactor = 1 + Math.sin((day + 1) * 0.2) * 0.03;

        // ===== INTERNATIONAL PRICE (one global price per crop) =====
        const intlPrice = Math.round(base.intl * dayFactor * 100) / 100;
        const intlPrev = Math.round(base.intl * prevDayFactor * 100) / 100;
        allPrices.push({
          cropID: crop._id,
          price: intlPrice,
          previousPrice: day < 30 ? intlPrev : null,
          currency: 'USD',
          priceType: 'international',
          source: 'Global Commodity Exchange',
          recordedAt: date
        });

        // ===== NATIONAL PRICE (one price for whole Pakistan) =====
        const nationalPrice = Math.round(base.national * dayFactor);
        const nationalPrev = Math.round(base.national * prevDayFactor);
        allPrices.push({
          cropID: crop._id,
          price: nationalPrice,
          previousPrice: day < 30 ? nationalPrev : null,
          currency: 'PKR',
          priceType: 'national',
          msp: base.msp,
          source: 'PMEX / National Board',
          recordedAt: date
        });

        // ===== LOCAL PRICES (per city - only for today and last 7 days to save space) =====
        if (day <= 7) {
          for (const loc of locations) {
            const provMult = provinceMultipliers[loc.province] || 1.0;
            const cityMult = cityVariation(loc.city);
            const localPrice = Math.round(base.localBase * dayFactor * provMult * cityMult);
            const localPrev = Math.round(base.localBase * prevDayFactor * provMult * cityMult);

            allPrices.push({
              cropID: crop._id,
              locationID: loc._id,
              price: localPrice,
              previousPrice: day < 7 ? localPrev : null,
              currency: 'PKR',
              priceType: 'local',
              msp: base.msp,
              source: `${loc.city} Mandi`,
              recordedAt: date
            });
          }
        }
      }
    }

    // Insert in batches
    const batchSize = 5000;
    let inserted = 0;
    for (let i = 0; i < allPrices.length; i += batchSize) {
      const batch = allPrices.slice(i, i + batchSize);
      await Price.insertMany(batch);
      inserted += batch.length;
      console.log(`Inserted ${inserted}/${allPrices.length} prices...`);
    }

    console.log(`\nTotal prices seeded: ${allPrices.length}`);
    console.log('  International: ' + (31 * crops.length) + ' records (30 days × ' + crops.length + ' crops)');
    console.log('  National: ' + (31 * crops.length) + ' records');
    console.log('  Local: ' + (8 * crops.length * locations.length) + ' records (8 days × ' + crops.length + ' crops × ' + locations.length + ' cities)');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

seedPrices();
