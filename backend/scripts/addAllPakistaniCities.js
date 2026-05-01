/**
 * Adds 90+ Pakistani cities to the Location collection.
 * Uses upsert by city+province so it's safe to re-run — won't duplicate
 * or wipe any existing locations.
 *
 * Run: node backend/scripts/addAllPakistaniCities.js
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const dns = require('dns');
const path = require('path');

dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const Location = require('../models/Location');

const PK = 'Pakistan';
const PK_UR = 'پاکستان';

// 90+ cities across Pakistan — ordered by province (agri-relevance prioritised)
const cities = [
  // === Punjab (largest agricultural province) ===
  { province: 'Punjab', provinceUrdu: 'پنجاب', city: 'Lahore',           cityUrdu: 'لاہور',          latitude: 31.5204, longitude: 74.3587 },
  { province: 'Punjab', provinceUrdu: 'پنجاب', city: 'Faisalabad',       cityUrdu: 'فیصل آباد',      latitude: 31.4504, longitude: 73.1350 },
  { province: 'Punjab', provinceUrdu: 'پنجاب', city: 'Rawalpindi',       cityUrdu: 'راولپنڈی',       latitude: 33.5651, longitude: 73.0169 },
  { province: 'Punjab', provinceUrdu: 'پنجاب', city: 'Multan',           cityUrdu: 'ملتان',          latitude: 30.1575, longitude: 71.5249 },
  { province: 'Punjab', provinceUrdu: 'پنجاب', city: 'Gujranwala',       cityUrdu: 'گوجرانوالہ',     latitude: 32.1877, longitude: 74.1945 },
  { province: 'Punjab', provinceUrdu: 'پنجاب', city: 'Sialkot',          cityUrdu: 'سیالکوٹ',        latitude: 32.4945, longitude: 74.5229 },
  { province: 'Punjab', provinceUrdu: 'پنجاب', city: 'Bahawalpur',       cityUrdu: 'بہاولپور',       latitude: 29.3956, longitude: 71.6836 },
  { province: 'Punjab', provinceUrdu: 'پنجاب', city: 'Sargodha',         cityUrdu: 'سرگودھا',        latitude: 32.0836, longitude: 72.6711 },
  { province: 'Punjab', provinceUrdu: 'پنجاب', city: 'Sheikhupura',      cityUrdu: 'شیخوپورہ',       latitude: 31.7167, longitude: 73.9850 },
  { province: 'Punjab', provinceUrdu: 'پنجاب', city: 'Sahiwal',          cityUrdu: 'ساہیوال',        latitude: 30.6682, longitude: 73.1114 },
  { province: 'Punjab', provinceUrdu: 'پنجاب', city: 'Jhang',            cityUrdu: 'جھنگ',           latitude: 31.2693, longitude: 72.3169 },
  { province: 'Punjab', provinceUrdu: 'پنجاب', city: 'Rahim Yar Khan',   cityUrdu: 'رحیم یار خان',   latitude: 28.4202, longitude: 70.2952 },
  { province: 'Punjab', provinceUrdu: 'پنجاب', city: 'Gujrat',           cityUrdu: 'گجرات',          latitude: 32.5740, longitude: 74.0789 },
  { province: 'Punjab', provinceUrdu: 'پنجاب', city: 'Kasur',            cityUrdu: 'قصور',           latitude: 31.1156, longitude: 74.4467 },
  { province: 'Punjab', provinceUrdu: 'پنجاب', city: 'Okara',            cityUrdu: 'اوکاڑہ',         latitude: 30.8138, longitude: 73.4534 },
  { province: 'Punjab', provinceUrdu: 'پنجاب', city: 'Dera Ghazi Khan',  cityUrdu: 'ڈیرہ غازی خان',  latitude: 30.0489, longitude: 70.6455 },
  { province: 'Punjab', provinceUrdu: 'پنجاب', city: 'Hafizabad',        cityUrdu: 'حافظ آباد',      latitude: 32.0712, longitude: 73.6884 },
  { province: 'Punjab', provinceUrdu: 'پنجاب', city: 'Sadiqabad',        cityUrdu: 'صادق آباد',      latitude: 28.3040, longitude: 70.1335 },
  { province: 'Punjab', provinceUrdu: 'پنجاب', city: 'Khanewal',         cityUrdu: 'خانیوال',        latitude: 30.3014, longitude: 71.9320 },
  { province: 'Punjab', provinceUrdu: 'پنجاب', city: 'Chiniot',          cityUrdu: 'چنیوٹ',          latitude: 31.7204, longitude: 72.9788 },
  { province: 'Punjab', provinceUrdu: 'پنجاب', city: 'Mianwali',         cityUrdu: 'میانوالی',       latitude: 32.5839, longitude: 71.5412 },
  { province: 'Punjab', provinceUrdu: 'پنجاب', city: 'Vehari',           cityUrdu: 'وہاڑی',          latitude: 30.0331, longitude: 72.3534 },
  { province: 'Punjab', provinceUrdu: 'پنجاب', city: 'Toba Tek Singh',   cityUrdu: 'ٹوبہ ٹیک سنگھ',  latitude: 30.9709, longitude: 72.4825 },
  { province: 'Punjab', provinceUrdu: 'پنجاب', city: 'Jhelum',           cityUrdu: 'جہلم',           latitude: 32.9425, longitude: 73.7257 },
  { province: 'Punjab', provinceUrdu: 'پنجاب', city: 'Khanpur',          cityUrdu: 'خانپور',         latitude: 28.6453, longitude: 70.6592 },
  { province: 'Punjab', provinceUrdu: 'پنجاب', city: 'Muzaffargarh',     cityUrdu: 'مظفرگڑھ',        latitude: 30.0728, longitude: 71.1939 },
  { province: 'Punjab', provinceUrdu: 'پنجاب', city: 'Khushab',          cityUrdu: 'خوشاب',          latitude: 32.2955, longitude: 72.3489 },
  { province: 'Punjab', provinceUrdu: 'پنجاب', city: 'Bhakkar',          cityUrdu: 'بھکر',           latitude: 31.6259, longitude: 71.0654 },
  { province: 'Punjab', provinceUrdu: 'پنجاب', city: 'Lodhran',          cityUrdu: 'لودھراں',        latitude: 29.5340, longitude: 71.6336 },
  { province: 'Punjab', provinceUrdu: 'پنجاب', city: 'Pakpattan',        cityUrdu: 'پاکپتن',         latitude: 30.3415, longitude: 73.3889 },
  { province: 'Punjab', provinceUrdu: 'پنجاب', city: 'Attock',           cityUrdu: 'اٹک',            latitude: 33.7666, longitude: 72.3597 },
  { province: 'Punjab', provinceUrdu: 'پنجاب', city: 'Mandi Bahauddin',  cityUrdu: 'منڈی بہاؤالدین', latitude: 32.5861, longitude: 73.4915 },
  { province: 'Punjab', provinceUrdu: 'پنجاب', city: 'Layyah',           cityUrdu: 'لیہ',            latitude: 30.9693, longitude: 70.9428 },
  { province: 'Punjab', provinceUrdu: 'پنجاب', city: 'Burewala',         cityUrdu: 'بورے والا',      latitude: 30.1649, longitude: 72.6816 },
  { province: 'Punjab', provinceUrdu: 'پنجاب', city: 'Chakwal',          cityUrdu: 'چکوال',          latitude: 32.9333, longitude: 72.8500 },
  { province: 'Punjab', provinceUrdu: 'پنجاب', city: 'Nankana Sahib',    cityUrdu: 'ننکانہ صاحب',    latitude: 31.4493, longitude: 73.7106 },
  { province: 'Punjab', provinceUrdu: 'پنجاب', city: 'Wah Cantt',        cityUrdu: 'واہ کینٹ',       latitude: 33.7972, longitude: 72.7128 },
  { province: 'Punjab', provinceUrdu: 'پنجاب', city: 'Murree',           cityUrdu: 'مری',            latitude: 33.9070, longitude: 73.3943 },
  { province: 'Punjab', provinceUrdu: 'پنجاب', city: 'Wazirabad',        cityUrdu: 'وزیر آباد',      latitude: 32.4422, longitude: 74.1196 },
  { province: 'Punjab', provinceUrdu: 'پنجاب', city: 'Daska',            cityUrdu: 'ڈسکہ',           latitude: 32.3242, longitude: 74.3499 },
  { province: 'Punjab', provinceUrdu: 'پنجاب', city: 'Jaranwala',        cityUrdu: 'جڑانوالہ',       latitude: 31.3327, longitude: 73.4226 },
  { province: 'Punjab', provinceUrdu: 'پنجاب', city: 'Mailsi',           cityUrdu: 'میلسی',          latitude: 29.8019, longitude: 72.1716 },
  { province: 'Punjab', provinceUrdu: 'پنجاب', city: 'Kabirwala',        cityUrdu: 'کبیر والا',      latitude: 30.4042, longitude: 71.8683 },

  // === Sindh ===
  { province: 'Sindh', provinceUrdu: 'سندھ', city: 'Karachi',         cityUrdu: 'کراچی',         latitude: 24.8607, longitude: 67.0011 },
  { province: 'Sindh', provinceUrdu: 'سندھ', city: 'Hyderabad',       cityUrdu: 'حیدرآباد',      latitude: 25.3960, longitude: 68.3578 },
  { province: 'Sindh', provinceUrdu: 'سندھ', city: 'Sukkur',          cityUrdu: 'سکھر',          latitude: 27.7052, longitude: 68.8574 },
  { province: 'Sindh', provinceUrdu: 'سندھ', city: 'Larkana',         cityUrdu: 'لاڑکانہ',       latitude: 27.5598, longitude: 68.2120 },
  { province: 'Sindh', provinceUrdu: 'سندھ', city: 'Nawabshah',       cityUrdu: 'نواب شاہ',      latitude: 26.2442, longitude: 68.4100 },
  { province: 'Sindh', provinceUrdu: 'سندھ', city: 'Mirpur Khas',     cityUrdu: 'میرپور خاص',    latitude: 25.5276, longitude: 69.0140 },
  { province: 'Sindh', provinceUrdu: 'سندھ', city: 'Jacobabad',       cityUrdu: 'جیکب آباد',     latitude: 28.2828, longitude: 68.4376 },
  { province: 'Sindh', provinceUrdu: 'سندھ', city: 'Shikarpur',       cityUrdu: 'شکارپور',       latitude: 27.9554, longitude: 68.6385 },
  { province: 'Sindh', provinceUrdu: 'سندھ', city: 'Khairpur',        cityUrdu: 'خیرپور',        latitude: 27.5295, longitude: 68.7592 },
  { province: 'Sindh', provinceUrdu: 'سندھ', city: 'Dadu',            cityUrdu: 'دادو',          latitude: 26.7319, longitude: 67.7790 },
  { province: 'Sindh', provinceUrdu: 'سندھ', city: 'Thatta',          cityUrdu: 'ٹھٹہ',          latitude: 24.7475, longitude: 67.9230 },
  { province: 'Sindh', provinceUrdu: 'سندھ', city: 'Badin',           cityUrdu: 'بدین',          latitude: 24.6556, longitude: 68.8378 },
  { province: 'Sindh', provinceUrdu: 'سندھ', city: 'Umerkot',         cityUrdu: 'عمرکوٹ',        latitude: 25.3625, longitude: 69.7461 },
  { province: 'Sindh', provinceUrdu: 'سندھ', city: 'Sanghar',         cityUrdu: 'سانگھڑ',        latitude: 26.0476, longitude: 68.9472 },
  { province: 'Sindh', provinceUrdu: 'سندھ', city: 'Ghotki',          cityUrdu: 'گھوٹکی',        latitude: 28.0067, longitude: 69.3122 },
  { province: 'Sindh', provinceUrdu: 'سندھ', city: 'Tando Allahyar',  cityUrdu: 'ٹنڈو الہ یار',  latitude: 25.4602, longitude: 68.7186 },
  { province: 'Sindh', provinceUrdu: 'سندھ', city: 'Tando Adam',      cityUrdu: 'ٹنڈو آدم',      latitude: 25.7666, longitude: 68.6622 },
  { province: 'Sindh', provinceUrdu: 'سندھ', city: 'Naushahro Feroze',cityUrdu: 'نوشہرو فیروز',  latitude: 26.8389, longitude: 68.1228 },

  // === Khyber Pakhtunkhwa ===
  { province: 'KPK', provinceUrdu: 'خیبرپختونخوا', city: 'Peshawar',          cityUrdu: 'پشاور',           latitude: 34.0151, longitude: 71.5249 },
  { province: 'KPK', provinceUrdu: 'خیبرپختونخوا', city: 'Mardan',            cityUrdu: 'مردان',           latitude: 34.1988, longitude: 72.0404 },
  { province: 'KPK', provinceUrdu: 'خیبرپختونخوا', city: 'Mingora',           cityUrdu: 'مینگورہ',         latitude: 34.7795, longitude: 72.3614 },
  { province: 'KPK', provinceUrdu: 'خیبرپختونخوا', city: 'Abbottabad',        cityUrdu: 'ایبٹ آباد',       latitude: 34.1463, longitude: 73.2117 },
  { province: 'KPK', provinceUrdu: 'خیبرپختونخوا', city: 'Kohat',             cityUrdu: 'کوہاٹ',           latitude: 33.5811, longitude: 71.4490 },
  { province: 'KPK', provinceUrdu: 'خیبرپختونخوا', city: 'Bannu',             cityUrdu: 'بنوں',            latitude: 32.9854, longitude: 70.6017 },
  { province: 'KPK', provinceUrdu: 'خیبرپختونخوا', city: 'Dera Ismail Khan',  cityUrdu: 'ڈیرہ اسماعیل خان',latitude: 31.8313, longitude: 70.9019 },
  { province: 'KPK', provinceUrdu: 'خیبرپختونخوا', city: 'Nowshera',          cityUrdu: 'نوشہرہ',          latitude: 34.0153, longitude: 71.9747 },
  { province: 'KPK', provinceUrdu: 'خیبرپختونخوا', city: 'Charsadda',         cityUrdu: 'چارسدہ',          latitude: 34.1454, longitude: 71.7308 },
  { province: 'KPK', provinceUrdu: 'خیبرپختونخوا', city: 'Mansehra',          cityUrdu: 'مانسہرہ',         latitude: 34.3334, longitude: 73.1965 },
  { province: 'KPK', provinceUrdu: 'خیبرپختونخوا', city: 'Haripur',           cityUrdu: 'ہری پور',         latitude: 34.0014, longitude: 72.9333 },
  { province: 'KPK', provinceUrdu: 'خیبرپختونخوا', city: 'Swabi',             cityUrdu: 'صوابی',           latitude: 34.1167, longitude: 72.4691 },
  { province: 'KPK', provinceUrdu: 'خیبرپختونخوا', city: 'Chitral',           cityUrdu: 'چترال',           latitude: 35.8511, longitude: 71.7868 },
  { province: 'KPK', provinceUrdu: 'خیبرپختونخوا', city: 'Hangu',             cityUrdu: 'ہنگو',            latitude: 33.5263, longitude: 71.0649 },
  { province: 'KPK', provinceUrdu: 'خیبرپختونخوا', city: 'Karak',             cityUrdu: 'کرک',             latitude: 33.1175, longitude: 71.0931 },
  { province: 'KPK', provinceUrdu: 'خیبرپختونخوا', city: 'Lakki Marwat',      cityUrdu: 'لکی مروت',        latitude: 32.6080, longitude: 70.9114 },
  { province: 'KPK', provinceUrdu: 'خیبرپختونخوا', city: 'Tank',              cityUrdu: 'ٹانک',            latitude: 32.2181, longitude: 70.3833 },

  // === Balochistan ===
  { province: 'Balochistan', provinceUrdu: 'بلوچستان', city: 'Quetta',   cityUrdu: 'کوئٹہ',   latitude: 30.1798, longitude: 66.9750 },
  { province: 'Balochistan', provinceUrdu: 'بلوچستان', city: 'Turbat',   cityUrdu: 'تربت',    latitude: 25.9966, longitude: 63.0644 },
  { province: 'Balochistan', provinceUrdu: 'بلوچستان', city: 'Khuzdar',  cityUrdu: 'خضدار',   latitude: 27.8120, longitude: 66.6147 },
  { province: 'Balochistan', provinceUrdu: 'بلوچستان', city: 'Chaman',   cityUrdu: 'چمن',     latitude: 30.9214, longitude: 66.4598 },
  { province: 'Balochistan', provinceUrdu: 'بلوچستان', city: 'Hub',      cityUrdu: 'حب',      latitude: 25.0150, longitude: 66.9000 },
  { province: 'Balochistan', provinceUrdu: 'بلوچستان', city: 'Loralai',  cityUrdu: 'لورالائی',latitude: 30.3679, longitude: 68.5970 },
  { province: 'Balochistan', provinceUrdu: 'بلوچستان', city: 'Sibi',     cityUrdu: 'سبی',     latitude: 29.5429, longitude: 67.8773 },
  { province: 'Balochistan', provinceUrdu: 'بلوچستان', city: 'Gwadar',   cityUrdu: 'گوادر',   latitude: 25.1216, longitude: 62.3253 },
  { province: 'Balochistan', provinceUrdu: 'بلوچستان', city: 'Mastung',  cityUrdu: 'مستونگ',  latitude: 29.7997, longitude: 66.8460 },
  { province: 'Balochistan', provinceUrdu: 'بلوچستان', city: 'Pishin',   cityUrdu: 'پشین',    latitude: 30.5832, longitude: 66.9943 },
  { province: 'Balochistan', provinceUrdu: 'بلوچستان', city: 'Zhob',     cityUrdu: 'ژوب',     latitude: 31.3415, longitude: 69.4496 },
  { province: 'Balochistan', provinceUrdu: 'بلوچستان', city: 'Kalat',    cityUrdu: 'قلات',    latitude: 29.0263, longitude: 66.5907 },

  // === Gilgit-Baltistan ===
  { province: 'Gilgit-Baltistan', provinceUrdu: 'گلگت بلتستان', city: 'Gilgit', cityUrdu: 'گلگت', latitude: 35.9221, longitude: 74.3087 },
  { province: 'Gilgit-Baltistan', provinceUrdu: 'گلگت بلتستان', city: 'Skardu', cityUrdu: 'سکردو', latitude: 35.2971, longitude: 75.6305 },
  { province: 'Gilgit-Baltistan', provinceUrdu: 'گلگت بلتستان', city: 'Hunza',  cityUrdu: 'ہنزہ',  latitude: 36.3206, longitude: 74.6500 },
  { province: 'Gilgit-Baltistan', provinceUrdu: 'گلگت بلتستان', city: 'Chilas', cityUrdu: 'چلاس', latitude: 35.4186, longitude: 74.0944 },

  // === Azad Jammu & Kashmir ===
  { province: 'Azad Kashmir', provinceUrdu: 'آزاد کشمیر', city: 'Muzaffarabad', cityUrdu: 'مظفر آباد', latitude: 34.3702, longitude: 73.4711 },
  { province: 'Azad Kashmir', provinceUrdu: 'آزاد کشمیر', city: 'Mirpur (AJK)', cityUrdu: 'میرپور (آزاد کشمیر)', latitude: 33.1471, longitude: 73.7515 },
  { province: 'Azad Kashmir', provinceUrdu: 'آزاد کشمیر', city: 'Rawalakot',    cityUrdu: 'راولاکوٹ',  latitude: 33.8587, longitude: 73.7589 },
  { province: 'Azad Kashmir', provinceUrdu: 'آزاد کشمیر', city: 'Kotli',        cityUrdu: 'کوٹلی',     latitude: 33.5181, longitude: 73.9023 },
  { province: 'Azad Kashmir', provinceUrdu: 'آزاد کشمیر', city: 'Bagh',         cityUrdu: 'باغ',       latitude: 33.9789, longitude: 73.7805 },

  // === Islamabad Capital Territory ===
  { province: 'Islamabad', provinceUrdu: 'اسلام آباد', city: 'Islamabad', cityUrdu: 'اسلام آباد', latitude: 33.6844, longitude: 73.0479 }
];

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB');
    console.log(`Importing ${cities.length} Pakistani cities (upsert — won't duplicate existing)…\n`);

    let inserted = 0, updated = 0;
    for (const c of cities) {
      const doc = { country: PK, countryUrdu: PK_UR, ...c };
      const res = await Location.updateOne(
        { country: PK, province: c.province, city: c.city },
        { $set: doc },
        { upsert: true }
      );
      if (res.upsertedCount) inserted++;
      else if (res.modifiedCount) updated++;
    }

    const total = await Location.countDocuments({ country: PK });
    console.log(`\n✓ Done.`);
    console.log(`  ${inserted} new cities inserted`);
    console.log(`  ${updated} existing cities updated`);
    console.log(`  ${total} total Pakistani locations now in DB`);
    process.exit(0);
  } catch (e) {
    console.error('✗ Failed:', e.message);
    process.exit(1);
  }
}

run();
