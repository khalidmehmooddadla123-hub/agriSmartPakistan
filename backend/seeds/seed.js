const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const dns = require('dns');

// Force Google DNS (some ISPs block MongoDB Atlas SRV lookups)
dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);

dotenv.config({ path: require('path').join(__dirname, '..', '.env') });

const User = require('../models/User');
const Location = require('../models/Location');
const Crop = require('../models/Crop');
const Price = require('../models/Price');
const News = require('../models/News');

const locations = [
  // Punjab
  { country: 'Pakistan', countryUrdu: 'پاکستان', province: 'Punjab', provinceUrdu: 'پنجاب', city: 'Lahore', cityUrdu: 'لاہور', latitude: 31.5204, longitude: 74.3587 },
  { country: 'Pakistan', countryUrdu: 'پاکستان', province: 'Punjab', provinceUrdu: 'پنجاب', city: 'Multan', cityUrdu: 'ملتان', latitude: 30.1575, longitude: 71.5249 },
  { country: 'Pakistan', countryUrdu: 'پاکستان', province: 'Punjab', provinceUrdu: 'پنجاب', city: 'Bahawalpur', cityUrdu: 'بہاولپور', latitude: 29.3956, longitude: 71.6836 },
  { country: 'Pakistan', countryUrdu: 'پاکستان', province: 'Punjab', provinceUrdu: 'پنجاب', city: 'Faisalabad', cityUrdu: 'فیصل آباد', latitude: 31.4504, longitude: 73.1350 },
  { country: 'Pakistan', countryUrdu: 'پاکستان', province: 'Punjab', provinceUrdu: 'پنجاب', city: 'Rawalpindi', cityUrdu: 'راولپنڈی', latitude: 33.5651, longitude: 73.0169 },
  { country: 'Pakistan', countryUrdu: 'پاکستان', province: 'Punjab', provinceUrdu: 'پنجاب', city: 'Sahiwal', cityUrdu: 'ساہیوال', latitude: 30.6682, longitude: 73.1114 },
  // Sindh
  { country: 'Pakistan', countryUrdu: 'پاکستان', province: 'Sindh', provinceUrdu: 'سندھ', city: 'Karachi', cityUrdu: 'کراچی', latitude: 24.8607, longitude: 67.0011 },
  { country: 'Pakistan', countryUrdu: 'پاکستان', province: 'Sindh', provinceUrdu: 'سندھ', city: 'Hyderabad', cityUrdu: 'حیدرآباد', latitude: 25.3960, longitude: 68.3578 },
  { country: 'Pakistan', countryUrdu: 'پاکستان', province: 'Sindh', provinceUrdu: 'سندھ', city: 'Sukkur', cityUrdu: 'سکھر', latitude: 27.7052, longitude: 68.8574 },
  // KPK
  { country: 'Pakistan', countryUrdu: 'پاکستان', province: 'KPK', provinceUrdu: 'خیبرپختونخوا', city: 'Peshawar', cityUrdu: 'پشاور', latitude: 34.0151, longitude: 71.5249 },
  { country: 'Pakistan', countryUrdu: 'پاکستان', province: 'KPK', provinceUrdu: 'خیبرپختونخوا', city: 'Mardan', cityUrdu: 'مردان', latitude: 34.1988, longitude: 72.0404 },
  // Balochistan
  { country: 'Pakistan', countryUrdu: 'پاکستان', province: 'Balochistan', provinceUrdu: 'بلوچستان', city: 'Quetta', cityUrdu: 'کوئٹہ', latitude: 30.1798, longitude: 66.9750 },
];

const crops = [
  { cropName: 'Wheat', cropNameUrdu: 'گندم', category: 'grain', unit: 'Maund', description: 'Major staple food crop' },
  { cropName: 'Rice', cropNameUrdu: 'چاول', category: 'grain', unit: 'Maund', description: 'Second major food crop' },
  { cropName: 'Cotton', cropNameUrdu: 'کپاس', category: 'fiber', unit: 'Maund', description: 'Major cash crop for textile industry' },
  { cropName: 'Sugarcane', cropNameUrdu: 'گنا', category: 'other', unit: 'Maund', description: 'Used for sugar production' },
  { cropName: 'Maize', cropNameUrdu: 'مکئی', category: 'grain', unit: 'Maund', description: 'Used for food and animal feed' },
  { cropName: 'Mango', cropNameUrdu: 'آم', category: 'fruit', unit: 'KG', description: 'Major fruit export crop' },
  { cropName: 'Tomato', cropNameUrdu: 'ٹماٹر', category: 'vegetable', unit: 'KG', description: 'Widely grown vegetable' },
  { cropName: 'Onion', cropNameUrdu: 'پیاز', category: 'vegetable', unit: 'KG', description: 'Essential kitchen vegetable' },
  { cropName: 'Potato', cropNameUrdu: 'آلو', category: 'vegetable', unit: 'KG', description: 'Staple vegetable crop' },
  { cropName: 'Chickpea', cropNameUrdu: 'چنا', category: 'grain', unit: 'Maund', description: 'Major pulse crop' },
  { cropName: 'Mustard', cropNameUrdu: 'سرسوں', category: 'oilseed', unit: 'Maund', description: 'Oilseed crop' },
  { cropName: 'Sunflower', cropNameUrdu: 'سورج مکھی', category: 'oilseed', unit: 'Maund', description: 'Oilseed crop for cooking oil' },
];

const newsArticles = [
  {
    title: 'Government Announces New Wheat Support Price for 2026',
    titleUrdu: 'حکومت نے 2026 کے لیے گندم کی نئی سپورٹ پرائس کا اعلان کیا',
    content: 'The federal government has announced an increase in the Minimum Support Price (MSP) for wheat from PKR 3,900 to PKR 4,300 per maund for the upcoming harvest season. This decision aims to ensure fair prices for farmers across all provinces.',
    contentUrdu: 'وفاقی حکومت نے آنے والے فصل کے موسم کے لیے گندم کی کم از کم سپورٹ پرائس 3,900 روپے سے بڑھا کر 4,300 روپے فی من کرنے کا اعلان کیا ہے۔',
    summary: 'Wheat MSP increased to PKR 4,300 per maund for 2026 harvest season.',
    category: 'government_policy',
    source: 'Ministry of Agriculture',
    isPublished: true, isBreaking: true, publishedAt: new Date()
  },
  {
    title: 'Heavy Rainfall Expected in Punjab During April',
    titleUrdu: 'اپریل میں پنجاب میں شدید بارشوں کی توقع',
    content: 'Pakistan Meteorological Department has issued an advisory for heavy rainfall across Punjab province during the first two weeks of April. Farmers are advised to ensure proper drainage in their fields and delay harvesting of ripe wheat crops.',
    contentUrdu: 'محکمہ موسمیات نے اپریل کے پہلے دو ہفتوں میں پنجاب بھر میں شدید بارشوں کی ایڈوائزری جاری کی ہے۔',
    summary: 'PMD advisory: heavy rains in Punjab in early April. Farmers should prepare drainage.',
    category: 'climate',
    source: 'PMD',
    isPublished: true, publishedAt: new Date(Date.now() - 86400000)
  },
  {
    title: 'Cotton Prices Surge on International Markets',
    titleUrdu: 'بین الاقوامی منڈیوں میں کپاس کی قیمتوں میں اضافہ',
    content: 'International cotton prices have surged by 12% over the past month due to supply constraints in major producing countries. Pakistani cotton farmers may benefit from this global trend.',
    contentUrdu: 'بڑے پیداواری ممالک میں سپلائی کی کمی کی وجہ سے بین الاقوامی کپاس کی قیمتوں میں گزشتہ مہینے 12 فیصد اضافہ ہوا ہے۔',
    summary: 'Cotton prices up 12% globally, benefiting Pakistani farmers.',
    category: 'market_trends',
    source: 'Bloomberg Agriculture',
    isPublished: true, publishedAt: new Date(Date.now() - 172800000)
  },
  {
    title: 'New Pest Alert: Locust Swarms Detected in Sindh Border Areas',
    titleUrdu: 'نئی کیڑوں کی وارننگ: سندھ کے سرحدی علاقوں میں ٹڈی دل دیکھے گئے',
    content: 'Agricultural authorities have detected locust swarms near the Sindh-Balochistan border. Farmers in affected areas are advised to report sightings and follow preventive spraying guidelines.',
    contentUrdu: 'زرعی حکام نے سندھ-بلوچستان سرحد کے قریب ٹڈی دل دیکھے ہیں۔ متاثرہ علاقوں کے کسانوں کو مشورہ ہے کہ وہ رپورٹ کریں۔',
    summary: 'Locust swarms detected near Sindh border. Farmers advised to take precautions.',
    category: 'pest_disease',
    source: 'Department of Plant Protection',
    isPublished: true, publishedAt: new Date(Date.now() - 259200000)
  },
  {
    title: 'Agricultural Technology: Drone Spraying Approved for Pakistani Farms',
    titleUrdu: 'زرعی ٹیکنالوجی: پاکستانی کھیتوں کے لیے ڈرون سپرے کی منظوری',
    content: 'The government has approved the use of agricultural drones for crop spraying operations. This technology can reduce pesticide usage by 30% while improving coverage efficiency.',
    contentUrdu: 'حکومت نے فصل کی سپرے کے لیے زرعی ڈرونز کے استعمال کی منظوری دے دی ہے۔',
    summary: 'Drone spraying approved for Pakistani farms. 30% reduction in pesticide use expected.',
    category: 'technology',
    source: 'PARC',
    isPublished: true, publishedAt: new Date(Date.now() - 345600000)
  }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Location.deleteMany({}),
      Crop.deleteMany({}),
      Price.deleteMany({}),
      News.deleteMany({})
    ]);
    console.log('Cleared existing data');

    // Seed locations
    const savedLocations = await Location.insertMany(locations);
    console.log(`Seeded ${savedLocations.length} locations`);

    // Seed crops
    const savedCrops = await Crop.insertMany(crops);
    console.log(`Seeded ${savedCrops.length} crops`);

    // Seed admin user
    const admin = await User.create({
      fullName: 'Admin User',
      email: 'admin@agrismart360.com',
      passwordHash: 'admin123',
      role: 'admin',
      language: 'en',
      locationID: savedLocations[0]._id,
      isVerified: true,
      isActive: true
    });
    console.log('Admin created: admin@agrismart360.com / admin123');

    // Seed demo farmer
    const farmer = await User.create({
      fullName: 'Khalid Mehmood',
      email: 'farmer@agrismart360.com',
      phone: '+923001234567',
      passwordHash: 'farmer123',
      role: 'farmer',
      language: 'en',
      locationID: savedLocations[2]._id, // Bahawalpur
      selectedCrops: [savedCrops[0]._id, savedCrops[1]._id, savedCrops[2]._id],
      isVerified: true,
      isActive: true
    });
    console.log('Demo farmer created: farmer@agrismart360.com / farmer123');

    // Seed prices (last 30 days for each crop)
    const priceData = [];
    const basePrices = {
      'Wheat': { intl: 320, national: 4100, local: 3800, msp: 4000, currency_intl: 'USD' },
      'Rice': { intl: 450, national: 8500, local: 8200, msp: 8000, currency_intl: 'USD' },
      'Cotton': { intl: 180, national: 18000, local: 17500, msp: 17000, currency_intl: 'USD' },
      'Sugarcane': { intl: 25, national: 350, local: 320, msp: 300, currency_intl: 'USD' },
      'Maize': { intl: 210, national: 3200, local: 3000, msp: 2900, currency_intl: 'USD' },
      'Mango': { intl: 1200, national: 250, local: 220, msp: null, currency_intl: 'USD' },
      'Tomato': { intl: 800, national: 180, local: 150, msp: null, currency_intl: 'USD' },
      'Onion': { intl: 400, national: 120, local: 100, msp: null, currency_intl: 'USD' },
      'Potato': { intl: 350, national: 80, local: 65, msp: null, currency_intl: 'USD' },
      'Chickpea': { intl: 600, national: 5500, local: 5200, msp: 5000, currency_intl: 'USD' },
      'Mustard': { intl: 550, national: 7000, local: 6800, msp: 6500, currency_intl: 'USD' },
      'Sunflower': { intl: 500, national: 6500, local: 6200, msp: 6000, currency_intl: 'USD' }
    };

    for (let day = 30; day >= 0; day--) {
      const date = new Date();
      date.setDate(date.getDate() - day);
      date.setHours(12, 0, 0, 0);

      for (const crop of savedCrops) {
        const base = basePrices[crop.cropName];
        if (!base) continue;

        const dayVariation = Math.sin(day * 0.3) * 0.05;
        const randomVariation = (Math.random() - 0.5) * 0.03;
        const factor = 1 + dayVariation + randomVariation;

        // International price
        priceData.push({
          cropID: crop._id,
          price: Math.round(base.intl * factor * 100) / 100,
          previousPrice: day < 30 ? Math.round(base.intl * (1 + Math.sin((day + 1) * 0.3) * 0.05) * 100) / 100 : null,
          currency: 'USD',
          priceType: 'international',
          source: 'commodity-exchange',
          recordedAt: date
        });

        // National price
        priceData.push({
          cropID: crop._id,
          price: Math.round(base.national * factor),
          previousPrice: day < 30 ? Math.round(base.national * (1 + Math.sin((day + 1) * 0.3) * 0.05)) : null,
          currency: 'PKR',
          priceType: 'national',
          msp: base.msp,
          source: 'PMEX',
          recordedAt: date
        });

        // Local price for Bahawalpur
        priceData.push({
          cropID: crop._id,
          locationID: savedLocations[2]._id,
          price: Math.round(base.local * factor),
          previousPrice: day < 30 ? Math.round(base.local * (1 + Math.sin((day + 1) * 0.3) * 0.05)) : null,
          currency: 'PKR',
          priceType: 'local',
          msp: base.msp,
          source: 'local-mandi',
          recordedAt: date
        });
      }
    }

    await Price.insertMany(priceData);
    console.log(`Seeded ${priceData.length} price records`);

    // Seed news
    const savedNews = await News.insertMany(newsArticles.map(n => ({ ...n, author: admin._id })));
    console.log(`Seeded ${savedNews.length} news articles`);

    console.log('\nSeed completed successfully!');
    console.log('---');
    console.log('Admin Login:  admin@agrismart360.com / admin123');
    console.log('Farmer Login: farmer@agrismart360.com / farmer123');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seed();
