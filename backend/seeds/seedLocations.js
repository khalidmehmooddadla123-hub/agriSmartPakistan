const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: require('path').join(__dirname, '..', '.env') });
const Location = require('../models/Location');

const allLocations = [
  // ============ PUNJAB ============
  { country: 'Pakistan', countryUrdu: 'پاکستان', province: 'Punjab', provinceUrdu: 'پنجاب', city: 'Lahore', cityUrdu: 'لاہور', latitude: 31.5204, longitude: 74.3587 },
  { country: 'Pakistan', countryUrdu: 'پاکستان', province: 'Punjab', provinceUrdu: 'پنجاب', city: 'Faisalabad', cityUrdu: 'فیصل آباد', latitude: 31.4504, longitude: 73.1350 },
  { country: 'Pakistan', countryUrdu: 'پاکستان', province: 'Punjab', provinceUrdu: 'پنجاب', city: 'Rawalpindi', cityUrdu: 'راولپنڈی', latitude: 33.5651, longitude: 73.0169 },
  { country: 'Pakistan', countryUrdu: 'پاکستان', province: 'Punjab', provinceUrdu: 'پنجاب', city: 'Multan', cityUrdu: 'ملتان', latitude: 30.1575, longitude: 71.5249 },
  { country: 'Pakistan', countryUrdu: 'پاکستان', province: 'Punjab', provinceUrdu: 'پنجاب', city: 'Gujranwala', cityUrdu: 'گوجرانوالہ', latitude: 32.1877, longitude: 74.1945 },
  { country: 'Pakistan', countryUrdu: 'پاکستان', province: 'Punjab', provinceUrdu: 'پنجاب', city: 'Sialkot', cityUrdu: 'سیالکوٹ', latitude: 32.4945, longitude: 74.5229 },
  { country: 'Pakistan', countryUrdu: 'پاکستان', province: 'Punjab', provinceUrdu: 'پنجاب', city: 'Bahawalpur', cityUrdu: 'بہاولپور', latitude: 29.3956, longitude: 71.6836 },
  { country: 'Pakistan', countryUrdu: 'پاکستان', province: 'Punjab', provinceUrdu: 'پنجاب', city: 'Sargodha', cityUrdu: 'سرگودھا', latitude: 32.0836, longitude: 72.6711 },
  { country: 'Pakistan', countryUrdu: 'پاکستان', province: 'Punjab', provinceUrdu: 'پنجاب', city: 'Sahiwal', cityUrdu: 'ساہیوال', latitude: 30.6682, longitude: 73.1114 },
  { country: 'Pakistan', countryUrdu: 'پاکستان', province: 'Punjab', provinceUrdu: 'پنجاب', city: 'Jhang', cityUrdu: 'جھنگ', latitude: 31.2681, longitude: 72.3181 },
  { country: 'Pakistan', countryUrdu: 'پاکستان', province: 'Punjab', provinceUrdu: 'پنجاب', city: 'Rahim Yar Khan', cityUrdu: 'رحیم یار خان', latitude: 28.4202, longitude: 70.2952 },
  { country: 'Pakistan', countryUrdu: 'پاکستان', province: 'Punjab', provinceUrdu: 'پنجاب', city: 'Sheikhupura', cityUrdu: 'شیخوپورہ', latitude: 31.7131, longitude: 73.9850 },
  { country: 'Pakistan', countryUrdu: 'پاکستان', province: 'Punjab', provinceUrdu: 'پنجاب', city: 'Gujrat', cityUrdu: 'گجرات', latitude: 32.5742, longitude: 74.0789 },
  { country: 'Pakistan', countryUrdu: 'پاکستان', province: 'Punjab', provinceUrdu: 'پنجاب', city: 'Kasur', cityUrdu: 'قصور', latitude: 31.1167, longitude: 74.4500 },
  { country: 'Pakistan', countryUrdu: 'پاکستان', province: 'Punjab', provinceUrdu: 'پنجاب', city: 'Okara', cityUrdu: 'اوکاڑہ', latitude: 30.8100, longitude: 73.4597 },
  { country: 'Pakistan', countryUrdu: 'پاکستان', province: 'Punjab', provinceUrdu: 'پنجاب', city: 'Dera Ghazi Khan', cityUrdu: 'ڈیرہ غازی خان', latitude: 30.0489, longitude: 70.6455 },
  { country: 'Pakistan', countryUrdu: 'پاکستان', province: 'Punjab', provinceUrdu: 'پنجاب', city: 'Chiniot', cityUrdu: 'چنیوٹ', latitude: 31.7197, longitude: 72.9781 },
  { country: 'Pakistan', countryUrdu: 'پاکستان', province: 'Punjab', provinceUrdu: 'پنجاب', city: 'Jhelum', cityUrdu: 'جہلم', latitude: 32.9425, longitude: 73.7257 },
  { country: 'Pakistan', countryUrdu: 'پاکستان', province: 'Punjab', provinceUrdu: 'پنجاب', city: 'Khanewal', cityUrdu: 'خانیوال', latitude: 30.3018, longitude: 71.9321 },
  { country: 'Pakistan', countryUrdu: 'پاکستان', province: 'Punjab', provinceUrdu: 'پنجاب', city: 'Muzaffargarh', cityUrdu: 'مظفرگڑھ', latitude: 30.0713, longitude: 71.1943 },
  { country: 'Pakistan', countryUrdu: 'پاکستان', province: 'Punjab', provinceUrdu: 'پنجاب', city: 'Vehari', cityUrdu: 'وہاڑی', latitude: 30.0452, longitude: 72.3489 },
  { country: 'Pakistan', countryUrdu: 'پاکستان', province: 'Punjab', provinceUrdu: 'پنجاب', city: 'Attock', cityUrdu: 'اٹک', latitude: 33.7660, longitude: 72.3609 },
  { country: 'Pakistan', countryUrdu: 'پاکستان', province: 'Punjab', provinceUrdu: 'پنجاب', city: 'Mianwali', cityUrdu: 'میانوالی', latitude: 32.5853, longitude: 71.5436 },
  { country: 'Pakistan', countryUrdu: 'پاکستان', province: 'Punjab', provinceUrdu: 'پنجاب', city: 'Chakwal', cityUrdu: 'چکوال', latitude: 32.9328, longitude: 72.8630 },
  { country: 'Pakistan', countryUrdu: 'پاکستان', province: 'Punjab', provinceUrdu: 'پنجاب', city: 'Bahawalnagar', cityUrdu: 'بہاولنگر', latitude: 29.9943, longitude: 73.2544 },
  { country: 'Pakistan', countryUrdu: 'پاکستان', province: 'Punjab', provinceUrdu: 'پنجاب', city: 'Toba Tek Singh', cityUrdu: 'ٹوبہ ٹیک سنگھ', latitude: 30.9709, longitude: 72.4826 },
  { country: 'Pakistan', countryUrdu: 'پاکستان', province: 'Punjab', provinceUrdu: 'پنجاب', city: 'Lodhran', cityUrdu: 'لودھراں', latitude: 29.5368, longitude: 71.6326 },
  { country: 'Pakistan', countryUrdu: 'پاکستان', province: 'Punjab', provinceUrdu: 'پنجاب', city: 'Layyah', cityUrdu: 'لیہ', latitude: 30.9693, longitude: 70.9428 },
  { country: 'Pakistan', countryUrdu: 'پاکستان', province: 'Punjab', provinceUrdu: 'پنجاب', city: 'Narowal', cityUrdu: 'نارووال', latitude: 32.1024, longitude: 74.8730 },
  { country: 'Pakistan', countryUrdu: 'پاکستان', province: 'Punjab', provinceUrdu: 'پنجاب', city: 'Hafizabad', cityUrdu: 'حافظ آباد', latitude: 32.0709, longitude: 73.6880 },
  { country: 'Pakistan', countryUrdu: 'پاکستان', province: 'Punjab', provinceUrdu: 'پنجاب', city: 'Mandi Bahauddin', cityUrdu: 'منڈی بہاؤالدین', latitude: 32.5861, longitude: 73.4917 },
  { country: 'Pakistan', countryUrdu: 'پاکستان', province: 'Punjab', provinceUrdu: 'پنجاب', city: 'Khushab', cityUrdu: 'خوشاب', latitude: 32.2917, longitude: 72.3519 },
  { country: 'Pakistan', countryUrdu: 'پاکستان', province: 'Punjab', provinceUrdu: 'پنجاب', city: 'Bhakkar', cityUrdu: 'بھکر', latitude: 31.6082, longitude: 71.0855 },
  { country: 'Pakistan', countryUrdu: 'پاکستان', province: 'Punjab', provinceUrdu: 'پنجاب', city: 'Pakpattan', cityUrdu: 'پاکپتن', latitude: 30.3420, longitude: 73.3891 },
  { country: 'Pakistan', countryUrdu: 'پاکستان', province: 'Punjab', provinceUrdu: 'پنجاب', city: 'Nankana Sahib', cityUrdu: 'ننکانہ صاحب', latitude: 31.4500, longitude: 73.7000 },
  { country: 'Pakistan', countryUrdu: 'پاکستان', province: 'Punjab', provinceUrdu: 'پنجاب', city: 'Rajanpur', cityUrdu: 'راجن پور', latitude: 29.1044, longitude: 70.3301 },
  // ============ SINDH ============
  { country: 'Pakistan', countryUrdu: 'پاکستان', province: 'Sindh', provinceUrdu: 'سندھ', city: 'Karachi', cityUrdu: 'کراچی', latitude: 24.8607, longitude: 67.0011 },
  { country: 'Pakistan', countryUrdu: 'پاکستان', province: 'Sindh', provinceUrdu: 'سندھ', city: 'Hyderabad', cityUrdu: 'حیدرآباد', latitude: 25.3960, longitude: 68.3578 },
  { country: 'Pakistan', countryUrdu: 'پاکستان', province: 'Sindh', provinceUrdu: 'سندھ', city: 'Sukkur', cityUrdu: 'سکھر', latitude: 27.7052, longitude: 68.8574 },
  { country: 'Pakistan', countryUrdu: 'پاکستان', province: 'Sindh', provinceUrdu: 'سندھ', city: 'Larkana', cityUrdu: 'لاڑکانہ', latitude: 27.5600, longitude: 68.2264 },
  { country: 'Pakistan', countryUrdu: 'پاکستان', province: 'Sindh', provinceUrdu: 'سندھ', city: 'Nawabshah', cityUrdu: 'نوابشاہ', latitude: 26.2483, longitude: 68.4101 },
  { country: 'Pakistan', countryUrdu: 'پاکستان', province: 'Sindh', provinceUrdu: 'سندھ', city: 'Mirpur Khas', cityUrdu: 'میرپور خاص', latitude: 25.5276, longitude: 69.0159 },
  { country: 'Pakistan', countryUrdu: 'پاکستان', province: 'Sindh', provinceUrdu: 'سندھ', city: 'Jacobabad', cityUrdu: 'جیکب آباد', latitude: 28.2769, longitude: 68.4514 },
  { country: 'Pakistan', countryUrdu: 'پاکستان', province: 'Sindh', provinceUrdu: 'سندھ', city: 'Shikarpur', cityUrdu: 'شکارپور', latitude: 27.9556, longitude: 68.6382 },
  { country: 'Pakistan', countryUrdu: 'پاکستان', province: 'Sindh', provinceUrdu: 'سندھ', city: 'Khairpur', cityUrdu: 'خیرپور', latitude: 27.5295, longitude: 68.7592 },
  { country: 'Pakistan', countryUrdu: 'پاکستان', province: 'Sindh', provinceUrdu: 'سندھ', city: 'Dadu', cityUrdu: 'دادو', latitude: 26.7319, longitude: 67.7750 },
  { country: 'Pakistan', countryUrdu: 'پاکستان', province: 'Sindh', provinceUrdu: 'سندھ', city: 'Thatta', cityUrdu: 'ٹھٹہ', latitude: 24.7461, longitude: 67.9236 },
  { country: 'Pakistan', countryUrdu: 'پاکستان', province: 'Sindh', provinceUrdu: 'سندھ', city: 'Badin', cityUrdu: 'بدین', latitude: 24.6560, longitude: 68.8370 },
  { country: 'Pakistan', countryUrdu: 'پاکستان', province: 'Sindh', provinceUrdu: 'سندھ', city: 'Sanghar', cityUrdu: 'سانگھڑ', latitude: 26.0472, longitude: 68.9481 },
  { country: 'Pakistan', countryUrdu: 'پاکستان', province: 'Sindh', provinceUrdu: 'سندھ', city: 'Umerkot', cityUrdu: 'عمرکوٹ', latitude: 25.3614, longitude: 69.7361 },
  { country: 'Pakistan', countryUrdu: 'پاکستان', province: 'Sindh', provinceUrdu: 'سندھ', city: 'Tharparkar', cityUrdu: 'تھرپارکر', latitude: 24.7394, longitude: 69.8120 },
  // ============ KPK ============
  { country: 'Pakistan', countryUrdu: 'پاکستان', province: 'KPK', provinceUrdu: 'خیبرپختونخوا', city: 'Peshawar', cityUrdu: 'پشاور', latitude: 34.0151, longitude: 71.5249 },
  { country: 'Pakistan', countryUrdu: 'پاکستان', province: 'KPK', provinceUrdu: 'خیبرپختونخوا', city: 'Mardan', cityUrdu: 'مردان', latitude: 34.1988, longitude: 72.0404 },
  { country: 'Pakistan', countryUrdu: 'پاکستان', province: 'KPK', provinceUrdu: 'خیبرپختونخوا', city: 'Abbottabad', cityUrdu: 'ایبٹ آباد', latitude: 34.1688, longitude: 73.2215 },
  { country: 'Pakistan', countryUrdu: 'پاکستان', province: 'KPK', provinceUrdu: 'خیبرپختونخوا', city: 'Mansehra', cityUrdu: 'مانسہرہ', latitude: 34.3300, longitude: 73.2000 },
  { country: 'Pakistan', countryUrdu: 'پاکستان', province: 'KPK', provinceUrdu: 'خیبرپختونخوا', city: 'Swat', cityUrdu: 'سوات', latitude: 35.2227, longitude: 72.4258 },
  { country: 'Pakistan', countryUrdu: 'پاکستان', province: 'KPK', provinceUrdu: 'خیبرپختونخوا', city: 'Kohat', cityUrdu: 'کوہاٹ', latitude: 33.5869, longitude: 71.4414 },
  { country: 'Pakistan', countryUrdu: 'پاکستان', province: 'KPK', provinceUrdu: 'خیبرپختونخوا', city: 'Bannu', cityUrdu: 'بنوں', latitude: 32.9889, longitude: 70.6046 },
  { country: 'Pakistan', countryUrdu: 'پاکستان', province: 'KPK', provinceUrdu: 'خیبرپختونخوا', city: 'Dera Ismail Khan', cityUrdu: 'ڈیرہ اسماعیل خان', latitude: 31.8626, longitude: 70.9019 },
  { country: 'Pakistan', countryUrdu: 'پاکستان', province: 'KPK', provinceUrdu: 'خیبرپختونخوا', city: 'Nowshera', cityUrdu: 'نوشہرہ', latitude: 34.0153, longitude: 71.9747 },
  { country: 'Pakistan', countryUrdu: 'پاکستان', province: 'KPK', provinceUrdu: 'خیبرپختونخوا', city: 'Charsadda', cityUrdu: 'چارسدہ', latitude: 34.1453, longitude: 71.7308 },
  { country: 'Pakistan', countryUrdu: 'پاکستان', province: 'KPK', provinceUrdu: 'خیبرپختونخوا', city: 'Swabi', cityUrdu: 'صوابی', latitude: 34.1167, longitude: 72.4667 },
  { country: 'Pakistan', countryUrdu: 'پاکستان', province: 'KPK', provinceUrdu: 'خیبرپختونخوا', city: 'Haripur', cityUrdu: 'ہری پور', latitude: 33.9942, longitude: 72.9330 },
  { country: 'Pakistan', countryUrdu: 'پاکستان', province: 'KPK', provinceUrdu: 'خیبرپختونخوا', city: 'Chitral', cityUrdu: 'چترال', latitude: 35.8518, longitude: 71.7864 },
  { country: 'Pakistan', countryUrdu: 'پاکستان', province: 'KPK', provinceUrdu: 'خیبرپختونخوا', city: 'Dir', cityUrdu: 'دیر', latitude: 35.2072, longitude: 71.8750 },
  // ============ BALOCHISTAN ============
  { country: 'Pakistan', countryUrdu: 'پاکستان', province: 'Balochistan', provinceUrdu: 'بلوچستان', city: 'Quetta', cityUrdu: 'کوئٹہ', latitude: 30.1798, longitude: 66.9750 },
  { country: 'Pakistan', countryUrdu: 'پاکستان', province: 'Balochistan', provinceUrdu: 'بلوچستان', city: 'Gwadar', cityUrdu: 'گوادر', latitude: 25.1264, longitude: 62.3225 },
  { country: 'Pakistan', countryUrdu: 'پاکستان', province: 'Balochistan', provinceUrdu: 'بلوچستان', city: 'Turbat', cityUrdu: 'تربت', latitude: 26.0031, longitude: 63.0544 },
  { country: 'Pakistan', countryUrdu: 'پاکستان', province: 'Balochistan', provinceUrdu: 'بلوچستان', city: 'Khuzdar', cityUrdu: 'خضدار', latitude: 27.8000, longitude: 66.6167 },
  { country: 'Pakistan', countryUrdu: 'پاکستان', province: 'Balochistan', provinceUrdu: 'بلوچستان', city: 'Hub', cityUrdu: 'حب', latitude: 25.0489, longitude: 66.8883 },
  { country: 'Pakistan', countryUrdu: 'پاکستان', province: 'Balochistan', provinceUrdu: 'بلوچستان', city: 'Chaman', cityUrdu: 'چمن', latitude: 30.9210, longitude: 66.4597 },
  { country: 'Pakistan', countryUrdu: 'پاکستان', province: 'Balochistan', provinceUrdu: 'بلوچستان', city: 'Sibi', cityUrdu: 'سبی', latitude: 29.5430, longitude: 67.8773 },
  { country: 'Pakistan', countryUrdu: 'پاکستان', province: 'Balochistan', provinceUrdu: 'بلوچستان', city: 'Zhob', cityUrdu: 'ژوب', latitude: 31.3417, longitude: 69.4486 },
  { country: 'Pakistan', countryUrdu: 'پاکستان', province: 'Balochistan', provinceUrdu: 'بلوچستان', city: 'Loralai', cityUrdu: 'لورالائی', latitude: 30.3705, longitude: 68.5970 },
  { country: 'Pakistan', countryUrdu: 'پاکستان', province: 'Balochistan', provinceUrdu: 'بلوچستان', city: 'Dalbandin', cityUrdu: 'دالبندین', latitude: 28.8886, longitude: 64.4056 },
  // ============ GILGIT-BALTISTAN ============
  { country: 'Pakistan', countryUrdu: 'پاکستان', province: 'Gilgit-Baltistan', provinceUrdu: 'گلگت بلتستان', city: 'Gilgit', cityUrdu: 'گلگت', latitude: 35.9208, longitude: 74.3144 },
  { country: 'Pakistan', countryUrdu: 'پاکستان', province: 'Gilgit-Baltistan', provinceUrdu: 'گلگت بلتستان', city: 'Skardu', cityUrdu: 'سکردو', latitude: 35.2971, longitude: 75.6330 },
  { country: 'Pakistan', countryUrdu: 'پاکستان', province: 'Gilgit-Baltistan', provinceUrdu: 'گلگت بلتستان', city: 'Hunza', cityUrdu: 'ہنزہ', latitude: 36.3167, longitude: 74.6500 },
  // ============ AZAD KASHMIR ============
  { country: 'Pakistan', countryUrdu: 'پاکستان', province: 'Azad Kashmir', provinceUrdu: 'آزاد کشمیر', city: 'Muzaffarabad', cityUrdu: 'مظفرآباد', latitude: 34.3700, longitude: 73.4711 },
  { country: 'Pakistan', countryUrdu: 'پاکستان', province: 'Azad Kashmir', provinceUrdu: 'آزاد کشمیر', city: 'Mirpur', cityUrdu: 'میرپور', latitude: 33.1481, longitude: 73.7514 },
  { country: 'Pakistan', countryUrdu: 'پاکستان', province: 'Azad Kashmir', provinceUrdu: 'آزاد کشمیر', city: 'Rawalakot', cityUrdu: 'راولاکوٹ', latitude: 33.8579, longitude: 73.7651 },
  // ============ ISLAMABAD ============
  { country: 'Pakistan', countryUrdu: 'پاکستان', province: 'Islamabad', provinceUrdu: 'اسلام آباد', city: 'Islamabad', cityUrdu: 'اسلام آباد', latitude: 33.6844, longitude: 73.0479 },
];

async function seedLocations() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Remove old locations
    await Location.deleteMany({});
    console.log('Cleared old locations');

    // Insert all
    const saved = await Location.insertMany(allLocations);
    console.log(`Seeded ${saved.length} cities across all provinces of Pakistan`);

    // Summary
    const summary = {};
    allLocations.forEach(l => {
      summary[l.province] = (summary[l.province] || 0) + 1;
    });
    console.log('\nBreakdown:');
    Object.entries(summary).sort().forEach(([prov, count]) => {
      console.log(`  ${prov}: ${count} cities`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

seedLocations();
