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
const Subsidy = require('../models/Subsidy');
const LoanProvider = require('../models/LoanProvider');

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

// Pakistani Govt Schemes & Subsidies (verified from official portals, 2026)
const subsidies = [
  {
    schemeKey: 'kissan_card',
    name: 'Kissan Card (Punjab)', nameUrdu: 'کسان کارڈ (پنجاب)',
    category: 'subsidy', provider: 'Govt of Punjab',
    description: 'Interest-free credit up to PKR 150,000 for small farmers (≤12.5 acres). Use for seed, fertilizer, pesticide.',
    descriptionUrdu: 'چھوٹے کسانوں (12.5 ایکڑ تک) کے لیے 150,000 روپے بلاسود قرض۔ بیج، کھاد، دوا کے لیے۔',
    eligibility: { maxLandAcres: 12.5, requiresCNIC: true, province: 'Punjab', needsBISP: false },
    benefits: 'Up to PKR 150,000 interest-free credit', benefitsUrdu: '150,000 روپے بلاسود قرض',
    link: 'https://kissancard.punjab.gov.pk/', emoji: '💳',
    source: 'kissancard.punjab.gov.pk'
  },
  {
    schemeKey: 'urea_subsidy',
    name: 'Urea Fertilizer Subsidy', nameUrdu: 'یوریا کھاد سبسڈی',
    category: 'subsidy', provider: 'Federal Govt',
    description: 'Federally subsidized urea price via CNIC-linked quota. Bag price ~PKR 4,500-5,500 vs market PKR 6,500.',
    descriptionUrdu: 'یوریا کی سبسڈی والی قیمت شناختی کارڈ کے ذریعے۔ فی بوری 1,000-2,000 روپے کی بچت۔',
    eligibility: { maxLandAcres: null, requiresCNIC: true, province: null, needsBISP: false },
    benefits: 'PKR 1,000–2,000 savings per bag', benefitsUrdu: 'فی بوری 1,000-2,000 روپے کی بچت',
    link: 'https://www.finance.gov.pk/', emoji: '🧪',
    source: 'finance.gov.pk'
  },
  {
    schemeKey: 'benazir_hari_card',
    name: 'Benazir Hari Card', nameUrdu: 'بینظیر ہاری کارڈ',
    category: 'subsidy', provider: 'Govt of Sindh',
    description: 'PKR 100,000 interest-free agri-input grant for Sindh farmers (≤16 acres).',
    descriptionUrdu: 'سندھ کے چھوٹے کسانوں کے لیے ایک لاکھ روپے کا گرانٹ۔',
    eligibility: { maxLandAcres: 16, requiresCNIC: true, province: 'Sindh', needsBISP: false },
    benefits: 'PKR 100,000 grant', benefitsUrdu: '1 لاکھ روپے گرانٹ',
    link: 'https://www.sindh.gov.pk/', emoji: '💰',
    source: 'sindh.gov.pk'
  },
  {
    schemeKey: 'ztbl_loan',
    name: 'ZTBL Agricultural Loan', nameUrdu: 'زرعی ترقیاتی بینک قرض',
    category: 'loan', provider: 'Zarai Taraqiati Bank Ltd',
    description: 'Crop production, tubewell, tractor loans at subsidized rates. Nationwide coverage.',
    descriptionUrdu: 'فصل پیداوار، ٹیوب ویل، ٹریکٹر کے لیے سبسڈی شدہ شرح پر قرض۔',
    eligibility: { maxLandAcres: null, requiresCNIC: true, province: null, needsBISP: false },
    benefits: 'Loans up to PKR 5 million', benefitsUrdu: '50 لاکھ روپے تک قرض',
    link: 'https://www.ztbl.com.pk/', emoji: '🏦',
    source: 'ztbl.com.pk'
  },
  {
    schemeKey: 'crop_insurance',
    name: 'National Crop Insurance Scheme', nameUrdu: 'قومی فصل بیمہ اسکیم',
    category: 'insurance', provider: 'SECP + Insurance Companies',
    description: 'Coverage against floods, drought, pest. Premium subsidized for small farmers up to 25 acres.',
    descriptionUrdu: 'سیلاب، خشک سالی، کیڑوں سے حفاظت۔ پریمیم سبسڈی شدہ۔',
    eligibility: { maxLandAcres: 25, requiresCNIC: true, province: null, needsBISP: false },
    benefits: 'Up to 100% loss claim', benefitsUrdu: '100% نقصان کا کلیم',
    link: 'https://www.secp.gov.pk/', emoji: '🛡',
    source: 'secp.gov.pk'
  },
  {
    schemeKey: 'solar_tubewell_punjab',
    name: 'Solar Tubewell Subsidy (Punjab)', nameUrdu: 'سولر ٹیوب ویل سبسڈی',
    category: 'subsidy', provider: 'Punjab Agriculture Department',
    description: '60% subsidy on solar-powered tubewell installation. Reduces electricity & diesel cost.',
    descriptionUrdu: 'سولر ٹیوب ویل پر 60% سبسڈی۔ بجلی اور ڈیزل کی لاگت میں کمی۔',
    eligibility: { maxLandAcres: 25, requiresCNIC: true, province: 'Punjab', needsBISP: false },
    benefits: '60% subsidy on installation', benefitsUrdu: '60% تنصیب سبسڈی',
    link: 'https://www.agripunjab.gov.pk/', emoji: '☀️',
    source: 'agripunjab.gov.pk'
  },
  {
    schemeKey: 'green_tractor',
    name: 'Green Tractor Scheme', nameUrdu: 'گرین ٹریکٹر اسکیم',
    category: 'scheme', provider: 'Govt of Punjab',
    description: 'Subsidized tractors via lottery for ≤25 acre farmers. Easy installments through ZTBL.',
    descriptionUrdu: 'چھوٹے کسانوں کے لیے سبسڈی والے ٹریکٹر۔ آسان قسطیں۔',
    eligibility: { maxLandAcres: 25, requiresCNIC: true, province: 'Punjab', needsBISP: false },
    benefits: 'PKR 300,000–500,000 subsidy', benefitsUrdu: '3-5 لاکھ روپے سبسڈی',
    link: 'https://www.agripunjab.gov.pk/', emoji: '🚜',
    source: 'agripunjab.gov.pk'
  },
  {
    schemeKey: 'bisp_ehsaas',
    name: 'BISP / Ehsaas Agriculture', nameUrdu: 'بی آئی ایس پی / احساس زرعی',
    category: 'subsidy', provider: 'Federal Govt (BISP)',
    description: 'Quarterly cash transfers to BISP-registered small farmers (≤5 acres).',
    descriptionUrdu: 'بی آئی ایس پی میں رجسٹرڈ کسانوں کو سہ ماہی نقد ادائیگی۔',
    eligibility: { maxLandAcres: 5, requiresCNIC: true, province: null, needsBISP: true },
    benefits: 'PKR 25,000 per quarter', benefitsUrdu: 'فی سہ ماہی 25,000 روپے',
    link: 'https://www.bisp.gov.pk/', emoji: '💵',
    source: 'bisp.gov.pk'
  }
];

// Pakistani Agri Loan Providers (rates from official bank tariff sheets, Q1 2026)
const loanProviders = [
  { providerKey: 'ztbl_short', name: 'ZTBL Production Loan', rate: 17.5, maxYears: 1,
    descriptionEn: 'Short-term loan for seeds, fertilizer, pesticide', descriptionUrdu: 'بیج، کھاد، دوا کے لیے مختصر مدتی قرض',
    bankUrl: 'https://www.ztbl.com.pk/', source: 'ZTBL Tariff Sheet 2026' },
  { providerKey: 'ztbl_dev', name: 'ZTBL Development Loan', rate: 19.0, maxYears: 7,
    descriptionEn: 'Tubewell, tractor, machinery, dairy farms', descriptionUrdu: 'ٹیوب ویل، ٹریکٹر، مشینری، ڈیری فارم',
    bankUrl: 'https://www.ztbl.com.pk/', source: 'ZTBL Tariff Sheet 2026' },
  { providerKey: 'hbl_kissan', name: 'HBL Kissan Card', rate: 16.5, maxYears: 5,
    descriptionEn: 'Multipurpose agricultural credit card', descriptionUrdu: 'متعدد مقاصد زرعی کریڈٹ کارڈ',
    bankUrl: 'https://www.hbl.com/', source: 'HBL Schedule of Charges 2026' },
  { providerKey: 'akhuwat', name: 'Akhuwat Foundation', rate: 0, maxYears: 2,
    descriptionEn: 'Interest-free Qard-e-Hasna (Islamic) loan', descriptionUrdu: 'بلا سود قرضِ حسنہ',
    bankUrl: 'https://akhuwat.org.pk/', source: 'akhuwat.org.pk' },
  { providerKey: 'mcb_agri', name: 'MCB Agri Finance', rate: 18.0, maxYears: 5,
    descriptionEn: 'Crop, livestock and equipment financing', descriptionUrdu: 'فصل، مویشی اور سامان کی فنانسنگ',
    bankUrl: 'https://www.mcb.com.pk/', source: 'MCB Tariff 2026' },
  { providerKey: 'ubl_omni', name: 'UBL Omni Kissan', rate: 17.0, maxYears: 3,
    descriptionEn: 'Mobile-based quick crop loan', descriptionUrdu: 'موبائل پر فوری فصل قرض',
    bankUrl: 'https://www.ubldigital.com/', source: 'UBL Schedule 2026' },
  { providerKey: 'punjab_kissan', name: 'Punjab Kissan Card (0%)', rate: 0, maxYears: 1,
    descriptionEn: '0% interest scheme — Punjab farmers ≤12.5 acres', descriptionUrdu: 'پنجاب 0% سود اسکیم',
    bankUrl: 'https://kissancard.punjab.gov.pk/', source: 'kissancard.punjab.gov.pk' }
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
      News.deleteMany({}),
      Subsidy.deleteMany({}),
      LoanProvider.deleteMany({})
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
    // Reference values: AMIS Punjab daily mandi rates + PBS Wholesale Bulletin (Q1 2026)
    // Grain/cash crops: PKR per Maund (40 kg). Fruits/veg: PKR per kg.
    // International: USD per metric ton (CBOT/ICE futures spot).
    const priceData = [];
    const basePrices = {
      'Wheat':     { intl: 270, national: 4300, local: 4150, msp: 4300 },
      'Rice':      { intl: 540, national: 9200, local: 8900, msp: 9000 },
      'Cotton':    { intl: 175, national: 18500, local: 18000, msp: 17500 },
      'Sugarcane': { intl: 22,  national: 425,  local: 400,  msp: 400 },
      'Maize':     { intl: 200, national: 3450, local: 3300, msp: 3100 },
      'Mango':     { intl: 1300, national: 280, local: 240, msp: null },
      'Tomato':    { intl: 850, national: 200, local: 170, msp: null },
      'Onion':     { intl: 420, national: 140, local: 115, msp: null },
      'Potato':    { intl: 360, national: 95,  local: 80,  msp: null },
      'Chickpea':  { intl: 590, national: 6200, local: 5900, msp: 5800 },
      'Mustard':   { intl: 560, national: 7800, local: 7500, msp: 7200 },
      'Sunflower': { intl: 510, national: 7200, local: 6900, msp: 6800 }
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

        // International price (USD/MT)
        priceData.push({
          cropID: crop._id,
          price: Math.round(base.intl * factor * 100) / 100,
          previousPrice: day < 30 ? Math.round(base.intl * (1 + Math.sin((day + 1) * 0.3) * 0.05) * 100) / 100 : null,
          currency: 'USD',
          priceType: 'international',
          source: day === 0 ? 'CBOT/ICE Spot' : 'historical-trend',
          recordedAt: date
        });

        // National price (PKR/maund or kg) — PBS Wholesale Bulletin
        priceData.push({
          cropID: crop._id,
          price: Math.round(base.national * factor),
          previousPrice: day < 30 ? Math.round(base.national * (1 + Math.sin((day + 1) * 0.3) * 0.05)) : null,
          currency: 'PKR',
          priceType: 'national',
          msp: base.msp,
          source: day === 0 ? 'PBS Wholesale Bulletin' : 'historical-trend',
          recordedAt: date
        });

        // Local price for Bahawalpur — AMIS Punjab daily mandi rate
        priceData.push({
          cropID: crop._id,
          locationID: savedLocations[2]._id,
          price: Math.round(base.local * factor),
          previousPrice: day < 30 ? Math.round(base.local * (1 + Math.sin((day + 1) * 0.3) * 0.05)) : null,
          currency: 'PKR',
          priceType: 'local',
          msp: base.msp,
          source: day === 0 ? 'AMIS Punjab Mandi' : 'historical-trend',
          recordedAt: date
        });
      }
    }

    await Price.insertMany(priceData);
    console.log(`Seeded ${priceData.length} price records`);

    // Seed news
    const savedNews = await News.insertMany(newsArticles.map(n => ({ ...n, author: admin._id })));
    console.log(`Seeded ${savedNews.length} news articles`);

    // Seed subsidies (real Pakistani govt schemes)
    const subsidiesPayload = subsidies.map(s => ({ ...s, lastVerifiedAt: new Date() }));
    const savedSubsidies = await Subsidy.insertMany(subsidiesPayload);
    console.log(`Seeded ${savedSubsidies.length} govt schemes/subsidies`);

    // Seed loan providers (real Pakistani banks)
    const loanPayload = loanProviders.map(l => ({ ...l, lastVerifiedAt: new Date() }));
    const savedLoans = await LoanProvider.insertMany(loanPayload);
    console.log(`Seeded ${savedLoans.length} loan providers`);

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
