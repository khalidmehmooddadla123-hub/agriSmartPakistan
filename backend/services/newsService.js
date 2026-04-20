const axios = require('axios');
const News = require('../models/News');

const GNEWS_BASE = 'https://gnews.io/api/v4';

// Diverse search queries covering ALL agriculture categories
const SEARCH_QUERIES = [
  // Crop Prices
  { q: 'crop prices pakistan wheat rice', category: 'crop_prices' },
  { q: 'mandi rates pakistan commodity market', category: 'crop_prices' },
  { q: 'cotton sugarcane prices pakistan', category: 'crop_prices' },
  // Government Policy
  { q: 'agriculture policy pakistan government', category: 'government_policy' },
  { q: 'pakistan agriculture minister budget', category: 'government_policy' },
  // Subsidies
  { q: 'agriculture subsidy pakistan farmer loan', category: 'subsidies' },
  { q: 'kisan package pakistan support scheme', category: 'subsidies' },
  // Pest & Disease
  { q: 'pest disease crop pakistan locust', category: 'pest_disease' },
  { q: 'crop disease wheat rust cotton virus', category: 'pest_disease' },
  // Climate
  { q: 'weather farming pakistan monsoon rain flood', category: 'climate' },
  { q: 'drought climate change agriculture pakistan', category: 'climate' },
  // Technology
  { q: 'agriculture technology pakistan drone', category: 'technology' },
  { q: 'smart farming digital agriculture innovation', category: 'technology' },
  // Market Trends
  { q: 'agriculture export pakistan production harvest', category: 'market_trends' },
  { q: 'food security pakistan farming yield', category: 'market_trends' },
];

// YouTube agriculture video channels/search links for Pakistan
const AGRICULTURE_VIDEOS = [
  {
    title: 'Modern Wheat Farming Techniques in Punjab Pakistan',
    titleUrdu: 'پنجاب پاکستان میں گندم کی جدید کاشتکاری',
    content: 'Learn the latest wheat farming techniques being used by progressive farmers in Punjab. This video covers seed selection, soil preparation, irrigation management, and harvest timing for maximum yield.',
    category: 'technology',
    source: 'Agriculture Pakistan',
    sourceUrl: 'https://www.youtube.com/results?search_query=wheat+farming+techniques+pakistan+punjab',
    imageUrl: 'https://img.youtube.com/vi/farming/default.jpg',
    videoUrl: 'https://www.youtube.com/results?search_query=wheat+farming+pakistan+2026',
    isVideo: true
  },
  {
    title: 'Cotton Leaf Curl Virus Treatment - Complete Guide for Pakistani Farmers',
    titleUrdu: 'کپاس کے پتوں کا مروڑ وائرس - پاکستانی کسانوں کے لیے مکمل علاج',
    content: 'Comprehensive guide on identifying and treating Cotton Leaf Curl Virus (CLCuV) in Pakistan. Covers whitefly control, resistant varieties, and spray schedule.',
    category: 'pest_disease',
    source: 'Farming Guide PK',
    sourceUrl: 'https://www.youtube.com/results?search_query=cotton+leaf+curl+virus+treatment+pakistan',
    videoUrl: 'https://www.youtube.com/results?search_query=cotton+leaf+curl+virus+pakistan',
    isVideo: true
  },
  {
    title: 'Government Agriculture Subsidy 2026 - How to Apply Online',
    titleUrdu: 'حکومتی زرعی سبسڈی 2026 - آن لائن درخواست کا طریقہ',
    content: 'Step by step guide on how Pakistani farmers can apply for government agriculture subsidies in 2026. Covers Kisan Card, tractor subsidy, seed subsidy and solar tube well schemes.',
    category: 'subsidies',
    source: 'Kisan Guide',
    sourceUrl: 'https://www.youtube.com/results?search_query=agriculture+subsidy+pakistan+2026+apply',
    videoUrl: 'https://www.youtube.com/results?search_query=pakistan+agriculture+subsidy+2026',
    isVideo: true
  },
  {
    title: 'Today Crop Market Rates - Wheat Rice Cotton Prices in Pakistan Mandis',
    titleUrdu: 'آج کی فصل منڈی ریٹ - پاکستان منڈیوں میں گندم چاول کپاس کی قیمتیں',
    content: 'Daily update on crop prices in major mandis of Pakistan including Lahore, Multan, Faisalabad, Karachi. Covers wheat, rice, cotton, maize, and sugarcane rates.',
    category: 'crop_prices',
    source: 'Mandi Rates Pakistan',
    sourceUrl: 'https://www.youtube.com/results?search_query=today+mandi+rates+pakistan+crop+prices',
    videoUrl: 'https://www.youtube.com/results?search_query=today+crop+prices+pakistan+mandi',
    isVideo: true
  },
  {
    title: 'Drip Irrigation System Installation Guide for Small Farmers',
    titleUrdu: 'چھوٹے کسانوں کے لیے ڈرپ آبپاشی نظام لگانے کا مکمل طریقہ',
    content: 'Complete installation guide for drip irrigation system suitable for Pakistani small farmers. Save 60% water and increase crop yield by 40%. Government subsidy available.',
    category: 'technology',
    source: 'Smart Farming PK',
    sourceUrl: 'https://www.youtube.com/results?search_query=drip+irrigation+pakistan+farmer+guide',
    videoUrl: 'https://www.youtube.com/results?search_query=drip+irrigation+pakistan+installation',
    isVideo: true
  },
  {
    title: 'Rice Blast Disease Prevention - Spray Schedule and Resistant Varieties',
    titleUrdu: 'چاول کے بلاسٹ مرض سے بچاؤ - سپرے شیڈول اور مزاحم اقسام',
    content: 'Detailed guide on preventing and treating Rice Blast disease in Pakistan. Learn the correct spray schedule, recommended fungicides, and best resistant rice varieties for Pakistani climate.',
    category: 'pest_disease',
    source: 'Crop Doctor PK',
    sourceUrl: 'https://www.youtube.com/results?search_query=rice+blast+disease+treatment+pakistan',
    videoUrl: 'https://www.youtube.com/results?search_query=rice+blast+disease+pakistan+spray',
    isVideo: true
  },
  {
    title: 'Monsoon Weather Alert 2026 - Farming Advisory for All Provinces',
    titleUrdu: 'مانسون موسم الرٹ 2026 - تمام صوبوں کے لیے کاشتکاری مشورے',
    content: 'Pakistan Meteorological Department monsoon forecast for 2026 with specific farming advisories for Punjab, Sindh, KPK and Balochistan. Prepare your fields for heavy rains.',
    category: 'climate',
    source: 'Weather PK',
    sourceUrl: 'https://www.youtube.com/results?search_query=monsoon+2026+pakistan+agriculture+advisory',
    videoUrl: 'https://www.youtube.com/results?search_query=monsoon+pakistan+farming+2026',
    isVideo: true
  },
  {
    title: 'Tomato and Vegetable Farming - High Profit Business for Pakistani Farmers',
    titleUrdu: 'ٹماٹر اور سبزیوں کی کاشت - پاکستانی کسانوں کے لیے زیادہ منافع والا کاروبار',
    content: 'How to start profitable tomato and vegetable farming in Pakistan. Covers seed selection, tunnel farming, pest management, and marketing strategies for best prices.',
    category: 'market_trends',
    source: 'Agri Business PK',
    sourceUrl: 'https://www.youtube.com/results?search_query=tomato+vegetable+farming+pakistan+profitable',
    videoUrl: 'https://www.youtube.com/results?search_query=vegetable+farming+pakistan+profit',
    isVideo: true
  },
  {
    title: 'PM Kisan Card 2026 - Registration Process and Benefits Explained',
    titleUrdu: 'وزیراعظم کسان کارڈ 2026 - رجسٹریشن کا طریقہ اور فوائد',
    content: 'Complete guide on PM Kisan Card 2026 for Pakistani farmers. Learn how to register, check eligibility, and claim benefits including subsidized seeds, fertilizers, and agricultural loans.',
    category: 'subsidies',
    source: 'Pakistan Farmer Help',
    sourceUrl: 'https://www.youtube.com/results?search_query=kisan+card+2026+pakistan+registration',
    videoUrl: 'https://www.youtube.com/results?search_query=kisan+card+pakistan+2026',
    isVideo: true
  },
  {
    title: 'Mango Export Business from Pakistan - Complete Guide',
    titleUrdu: 'پاکستان سے آم کی برآمد کا کاروبار - مکمل رہنمائی',
    content: 'How to start mango export business from Pakistan. Covers quality standards, packaging, international buyers, documentation, and profit margins for Sindhri and Chaunsa varieties.',
    category: 'market_trends',
    source: 'Export Pakistan',
    sourceUrl: 'https://www.youtube.com/results?search_query=mango+export+pakistan+business+guide',
    videoUrl: 'https://www.youtube.com/results?search_query=mango+export+pakistan+2026',
    isVideo: true
  }
];

function detectCategory(title, description) {
  const text = `${title} ${description}`.toLowerCase();
  const categoryKeywords = {
    crop_prices: ['price', 'mandi', 'rate', 'market', 'commodity', 'export', 'import', 'trade', 'cost'],
    government_policy: ['government', 'policy', 'minister', 'budget', 'regulation', 'act', 'law'],
    pest_disease: ['pest', 'disease', 'locust', 'virus', 'fungus', 'blight', 'spray', 'pesticide', 'insect'],
    climate: ['weather', 'rain', 'flood', 'drought', 'climate', 'monsoon', 'temperature', 'frost', 'heat'],
    technology: ['technology', 'drone', 'AI', 'digital', 'app', 'innovation', 'machinery', 'tractor', 'solar'],
    market_trends: ['trend', 'forecast', 'demand', 'supply', 'production', 'yield', 'harvest', 'season', 'crop'],
    subsidies: ['subsidy', 'loan', 'credit', 'bank', 'support', 'relief', 'package', 'scheme', 'kisan']
  };

  let bestCategory = 'market_trends';
  let bestScore = 0;
  for (const [cat, keywords] of Object.entries(categoryKeywords)) {
    let score = 0;
    for (const kw of keywords) {
      if (text.includes(kw)) score++;
    }
    if (score > bestScore) { bestScore = score; bestCategory = cat; }
  }
  return bestCategory;
}

/**
 * Fetch real news from GNews API with diverse queries
 */
async function fetchRealNews() {
  const apiKey = process.env.GNEWS_API_KEY;
  if (!apiKey || apiKey === 'your_gnews_api_key') {
    console.log('[NEWS] No GNews API key - skipping');
    return [];
  }

  const allArticles = [];

  // Pick 5 random queries from different categories to maximize diversity
  const shuffled = [...SEARCH_QUERIES].sort(() => Math.random() - 0.5);
  const selectedQueries = shuffled.slice(0, 5);

  for (const query of selectedQueries) {
    try {
      const res = await axios.get(`${GNEWS_BASE}/search`, {
        params: {
          q: query.q,
          lang: 'en',
          country: 'pk',
          max: 10,
          apikey: apiKey
        },
        timeout: 10000
      });

      if (res.data?.articles) {
        // Tag with forced category for better categorization
        res.data.articles.forEach(a => { a._hintCategory = query.category; });
        allArticles.push(...res.data.articles);
      }
      console.log(`[NEWS] "${query.q}" → ${res.data?.articles?.length || 0} articles`);
    } catch (err) {
      console.log(`[NEWS] Failed "${query.q}":`, err.response?.data?.message || err.message);
    }
  }

  // Also get top Pakistan headlines
  try {
    const topRes = await axios.get(`${GNEWS_BASE}/top-headlines`, {
      params: { category: 'nation', lang: 'en', country: 'pk', max: 10, apikey: apiKey },
      timeout: 10000
    });
    if (topRes.data?.articles) allArticles.push(...topRes.data.articles);
  } catch {}

  // Deduplicate
  const seen = new Set();
  const unique = allArticles.filter(a => {
    if (seen.has(a.url)) return false;
    seen.add(a.url);
    return true;
  });

  console.log(`[NEWS] Total unique: ${unique.length} articles`);
  return unique;
}

/**
 * Fetch and save real news + video content
 */
async function refreshNews() {
  let saved = 0;

  // 1. Fetch real news from GNews
  const articles = await fetchRealNews();
  for (const article of articles) {
    try {
      const exists = await News.findOne({ sourceUrl: article.url });
      if (exists) continue;

      const category = article._hintCategory || detectCategory(article.title, article.description || '');

      await News.create({
        title: article.title,
        content: article.content || article.description || article.title,
        summary: article.description || '',
        category,
        source: article.source?.name || 'News',
        sourceUrl: article.url,
        imageUrl: article.image || null,
        isPublished: true,
        publishedAt: new Date(article.publishedAt) || new Date()
      });
      saved++;
    } catch {}
  }

  // 2. Add agriculture video content (if not already added)
  for (const video of AGRICULTURE_VIDEOS) {
    try {
      const exists = await News.findOne({ sourceUrl: video.sourceUrl });
      if (exists) continue;

      await News.create({
        title: video.title,
        titleUrdu: video.titleUrdu,
        content: video.content,
        summary: video.content.substring(0, 200),
        category: video.category,
        source: video.source,
        sourceUrl: video.sourceUrl,
        imageUrl: video.imageUrl || null,
        isPublished: true,
        isBreaking: false,
        tags: ['video'],
        publishedAt: new Date()
      });
      saved++;
    } catch {}
  }

  console.log(`[NEWS] Total saved: ${saved} new items`);
  return saved;
}

module.exports = { fetchRealNews, refreshNews };
