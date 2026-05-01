/**
 * Comprehensive Pakistan administrative units — all 160+ districts and ~400 tehsils
 * across all 4 provinces, ICT, AJK, and Gilgit-Baltistan.
 *
 * Each entry has: city (tehsil/town), district, province, Urdu names, and lat/lng.
 * Upserts on (country + province + city) — safe to re-run.
 *
 * Run: node backend/scripts/addAllDistrictsAndTehsils.js
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

// Compact format: [city, cityUrdu, district, districtUrdu, lat, lng]
// All under one province per block.
const dataset = {
  Punjab: { provinceUrdu: 'پنجاب', tehsils: [
    // Lahore Division
    ['Lahore',          'لاہور',          'Lahore',          'لاہور',          31.5204, 74.3587],
    ['Kasur',           'قصور',           'Kasur',           'قصور',           31.1156, 74.4467],
    ['Kot Radha Kishan','کوٹ رادھا کشن', 'Kasur',           'قصور',           31.1497, 74.1058],
    ['Pattoki',         'پتوکی',          'Kasur',           'قصور',           31.0210, 73.8530],
    ['Chunian',         'چونیاں',         'Kasur',           'قصور',           30.9667, 73.9831],
    ['Sheikhupura',     'شیخوپورہ',       'Sheikhupura',     'شیخوپورہ',       31.7167, 73.9850],
    ['Ferozewala',      'فیروزوالہ',      'Sheikhupura',     'شیخوپورہ',       31.6533, 74.1544],
    ['Sharaqpur',       'شرقپور',         'Sheikhupura',     'شیخوپورہ',       31.4661, 74.0972],
    ['Muridke',         'مرید کے',        'Sheikhupura',     'شیخوپورہ',       31.8025, 74.2622],
    ['Nankana Sahib',   'ننکانہ صاحب',    'Nankana Sahib',   'ننکانہ صاحب',    31.4493, 73.7106],
    ['Sangla Hill',     'سانگلہ ہل',      'Nankana Sahib',   'ننکانہ صاحب',    31.7174, 73.3804],
    ['Shahkot',         'شاہکوٹ',         'Nankana Sahib',   'ننکانہ صاحب',    31.5664, 73.4828],

    // Faisalabad Division
    ['Faisalabad',      'فیصل آباد',      'Faisalabad',      'فیصل آباد',      31.4504, 73.1350],
    ['Jaranwala',       'جڑانوالہ',       'Faisalabad',      'فیصل آباد',      31.3327, 73.4226],
    ['Samundri',        'سمندری',         'Faisalabad',      'فیصل آباد',      31.0622, 72.9513],
    ['Tandlianwala',    'تاندلیانوالہ',   'Faisalabad',      'فیصل آباد',      30.9487, 73.1318],
    ['Chak Jhumra',     'چک جھمرہ',       'Faisalabad',      'فیصل آباد',      31.5610, 73.1838],
    ['Jhang',           'جھنگ',           'Jhang',           'جھنگ',           31.2693, 72.3169],
    ['Shorkot',         'شورکوٹ',         'Jhang',           'جھنگ',           30.8392, 72.0681],
    ['Athara Hazari',   'اٹھارہ ہزاری',   'Jhang',           'جھنگ',           31.0925, 71.9472],
    ['Toba Tek Singh',  'ٹوبہ ٹیک سنگھ',  'Toba Tek Singh',  'ٹوبہ ٹیک سنگھ',  30.9709, 72.4825],
    ['Gojra',           'گوجرہ',          'Toba Tek Singh',  'ٹوبہ ٹیک سنگھ',  31.1487, 72.6855],
    ['Kamalia',         'کمالیہ',         'Toba Tek Singh',  'ٹوبہ ٹیک سنگھ',  30.7264, 72.6448],
    ['Pir Mahal',       'پیر محل',        'Toba Tek Singh',  'ٹوبہ ٹیک سنگھ',  30.7681, 72.4286],
    ['Chiniot',         'چنیوٹ',          'Chiniot',         'چنیوٹ',          31.7204, 72.9788],
    ['Lalian',          'لالیاں',         'Chiniot',         'چنیوٹ',          31.8263, 72.7361],
    ['Bhowana',         'بھوآنہ',         'Chiniot',         'چنیوٹ',          31.5772, 72.6364],

    // Gujranwala Division
    ['Gujranwala',      'گوجرانوالہ',     'Gujranwala',      'گوجرانوالہ',     32.1877, 74.1945],
    ['Wazirabad',       'وزیرآباد',       'Wazirabad',       'وزیرآباد',       32.4422, 74.1196],
    ['Kamoke',          'کامونکی',        'Gujranwala',      'گوجرانوالہ',     31.9742, 74.2228],
    ['Nowshera Virkan', 'نوشہرہ ورکاں',   'Gujranwala',      'گوجرانوالہ',     32.0489, 73.9739],
    ['Sialkot',         'سیالکوٹ',        'Sialkot',         'سیالکوٹ',        32.4945, 74.5229],
    ['Daska',           'ڈسکہ',           'Sialkot',         'سیالکوٹ',        32.3242, 74.3499],
    ['Pasrur',          'پسرور',          'Sialkot',         'سیالکوٹ',        32.2667, 74.6667],
    ['Sambrial',        'سمبڑیال',        'Sialkot',         'سیالکوٹ',        32.4773, 74.3520],
    ['Narowal',         'نارووال',        'Narowal',         'نارووال',        32.1006, 74.8800],
    ['Shakargarh',      'شکرگڑھ',         'Narowal',         'نارووال',        32.2697, 75.1572],
    ['Zafarwal',        'ظفروال',         'Narowal',         'نارووال',        32.3414, 74.9011],
    ['Hafizabad',       'حافظ آباد',      'Hafizabad',       'حافظ آباد',      32.0712, 73.6884],
    ['Pindi Bhattian',  'پنڈی بھٹیاں',    'Hafizabad',       'حافظ آباد',      31.8978, 73.2731],
    ['Gujrat',          'گجرات',          'Gujrat',          'گجرات',          32.5740, 74.0789],
    ['Kharian',         'کھاریاں',        'Gujrat',          'گجرات',          32.8118, 73.8627],
    ['Sarai Alamgir',   'سرائے عالمگیر',  'Gujrat',          'گجرات',          32.8978, 73.7552],
    ['Mandi Bahauddin', 'منڈی بہاؤالدین', 'Mandi Bahauddin', 'منڈی بہاؤالدین', 32.5861, 73.4915],
    ['Phalia',          'پھالیہ',         'Mandi Bahauddin', 'منڈی بہاؤالدین', 32.4356, 73.5782],
    ['Malakwal',        'ملکوال',         'Mandi Bahauddin', 'منڈی بہاؤالدین', 32.5544, 73.2095],

    // Rawalpindi Division
    ['Rawalpindi',      'راولپنڈی',       'Rawalpindi',      'راولپنڈی',       33.5651, 73.0169],
    ['Taxila',          'ٹیکسلا',         'Rawalpindi',      'راولپنڈی',       33.7373, 72.7993],
    ['Gujar Khan',      'گوجر خان',       'Rawalpindi',      'راولپنڈی',       33.2543, 73.3046],
    ['Kahuta',          'کہوٹہ',          'Rawalpindi',      'راولپنڈی',       33.5894, 73.3925],
    ['Kallar Syedan',   'کلر سیداں',      'Rawalpindi',      'راولپنڈی',       33.4033, 73.3686],
    ['Murree',          'مری',            'Rawalpindi',      'راولپنڈی',       33.9070, 73.3943],
    ['Wah Cantt',       'واہ کینٹ',       'Rawalpindi',      'راولپنڈی',       33.7972, 72.7128],
    ['Attock',          'اٹک',            'Attock',          'اٹک',            33.7666, 72.3597],
    ['Hassanabdal',     'حسن ابدال',      'Attock',          'اٹک',            33.8194, 72.6911],
    ['Hazro',           'حضرو',           'Attock',          'اٹک',            33.9097, 72.5097],
    ['Pindi Gheb',      'پنڈی گھیب',      'Attock',          'اٹک',            33.2382, 72.2682],
    ['Fatehjang',       'فتح جنگ',        'Attock',          'اٹک',            33.5683, 72.6386],
    ['Chakwal',         'چکوال',          'Chakwal',         'چکوال',          32.9333, 72.8500],
    ['Talagang',        'تلہ گنگ',        'Chakwal',         'چکوال',          32.9281, 72.4172],
    ['Choa Saidan Shah','چوآ سیدن شاہ',   'Chakwal',         'چکوال',          32.7281, 72.9819],
    ['Kallar Kahar',    'کلر کہار',       'Chakwal',         'چکوال',          32.7733, 72.7042],
    ['Jhelum',          'جہلم',           'Jhelum',          'جہلم',           32.9425, 73.7257],
    ['Pind Dadan Khan', 'پنڈ دادن خان',   'Jhelum',          'جہلم',           32.5872, 73.0397],
    ['Sohawa',          'سوہاوہ',         'Jhelum',          'جہلم',           33.1583, 73.4044],
    ['Dina',            'دینہ',           'Jhelum',          'جہلم',           33.0297, 73.5963],

    // Sargodha Division
    ['Sargodha',        'سرگودھا',        'Sargodha',        'سرگودھا',        32.0836, 72.6711],
    ['Bhalwal',         'بھلوال',         'Sargodha',        'سرگودھا',        32.2667, 72.8989],
    ['Sahiwal',         'سرگودھا - ساہیوال','Sargodha',      'سرگودھا',        31.9747, 72.3286],
    ['Kot Momin',       'کوٹ مومن',       'Sargodha',        'سرگودھا',        32.4689, 72.6058],
    ['Shahpur',         'شاہپور',         'Sargodha',        'سرگودھا',        32.2700, 72.4644],
    ['Silanwali',       'سلانوالی',       'Sargodha',        'سرگودھا',        31.8136, 72.5400],
    ['Mianwali',        'میانوالی',       'Mianwali',        'میانوالی',       32.5839, 71.5412],
    ['Isakhel',         'عیسیٰ خیل',      'Mianwali',        'میانوالی',       32.6878, 71.2761],
    ['Piplan',          'پپلاں',          'Mianwali',        'میانوالی',       32.4750, 71.4019],
    ['Khushab',         'خوشاب',          'Khushab',         'خوشاب',          32.2955, 72.3489],
    ['Quaidabad',       'قائد آباد',      'Khushab',         'خوشاب',          32.3143, 71.7886],
    ['Naushera',        'نوشہرہ (پنجاب)', 'Khushab',         'خوشاب',          32.5481, 72.2178],
    ['Bhakkar',         'بھکر',           'Bhakkar',         'بھکر',           31.6259, 71.0654],
    ['Darya Khan',      'دریا خان',       'Bhakkar',         'بھکر',           31.7919, 71.1078],
    ['Mankera',         'منکیرہ',         'Bhakkar',         'بھکر',           31.4147, 71.4242],
    ['Kallur Kot',      'کلور کوٹ',       'Bhakkar',         'بھکر',           32.1631, 71.0794],

    // Multan Division
    ['Multan',          'ملتان',          'Multan',          'ملتان',          30.1575, 71.5249],
    ['Shujabad',        'شجاع آباد',      'Multan',          'ملتان',          29.8814, 71.2933],
    ['Jalalpur Pirwala','جلال پور پیر والا','Multan',         'ملتان',          29.5300, 71.2697],
    ['Khanewal',        'خانیوال',        'Khanewal',        'خانیوال',        30.3014, 71.9320],
    ['Mian Channu',     'میاں چنوں',      'Khanewal',        'خانیوال',        30.4419, 72.3553],
    ['Kabirwala',       'کبیر والا',      'Khanewal',        'خانیوال',        30.4042, 71.8683],
    ['Jahanian',        'جہانیاں',        'Khanewal',        'خانیوال',        30.0689, 71.8092],
    ['Lodhran',         'لودھراں',        'Lodhran',         'لودھراں',        29.5340, 71.6336],
    ['Dunyapur',        'دنیاپور',        'Lodhran',         'لودھراں',        29.8055, 71.7449],
    ['Kahror Pakka',    'کہروڑپکا',       'Lodhran',         'لودھراں',        29.6228, 71.9069],
    ['Vehari',          'وہاڑی',          'Vehari',          'وہاڑی',          30.0331, 72.3534],
    ['Burewala',        'بورے والا',      'Vehari',          'وہاڑی',          30.1649, 72.6816],
    ['Mailsi',          'میلسی',          'Vehari',          'وہاڑی',          29.8019, 72.1716],

    // Bahawalpur Division
    ['Bahawalpur',      'بہاولپور',       'Bahawalpur',      'بہاولپور',       29.3956, 71.6836],
    ['Hasilpur',        'حاصل پور',       'Bahawalpur',      'بہاولپور',       29.6964, 72.5500],
    ['Yazman',          'یزمان',          'Bahawalpur',      'بہاولپور',       29.1239, 71.7458],
    ['Ahmadpur East',   'احمد پور شرقیہ', 'Bahawalpur',      'بہاولپور',       29.1428, 71.2628],
    ['Khairpur Tamewali','خیرپور ٹامیوالی','Bahawalpur',     'بہاولپور',       29.5811, 72.2336],
    ['Bahawalnagar',    'بہاولنگر',       'Bahawalnagar',    'بہاولنگر',       29.9833, 73.2667],
    ['Chishtian',       'چشتیاں',         'Bahawalnagar',    'بہاولنگر',       29.7972, 72.8569],
    ['Haroonabad',      'ہارون آباد',     'Bahawalnagar',    'بہاولنگر',       29.6092, 73.1356],
    ['Minchinabad',     'منچن آباد',      'Bahawalnagar',    'بہاولنگر',       30.1531, 73.5697],
    ['Fort Abbas',      'فورٹ عباس',      'Bahawalnagar',    'بہاولنگر',       29.1817, 72.8569],
    ['Rahim Yar Khan',  'رحیم یار خان',   'Rahim Yar Khan',  'رحیم یار خان',   28.4202, 70.2952],
    ['Sadiqabad',       'صادق آباد',      'Rahim Yar Khan',  'رحیم یار خان',   28.3040, 70.1335],
    ['Khanpur',         'خانپور',         'Rahim Yar Khan',  'رحیم یار خان',   28.6453, 70.6592],
    ['Liaquatpur',      'لیاقت پور',      'Rahim Yar Khan',  'رحیم یار خان',   28.9333, 70.9333],

    // DG Khan Division
    ['Dera Ghazi Khan', 'ڈیرہ غازی خان',  'Dera Ghazi Khan', 'ڈیرہ غازی خان',  30.0489, 70.6455],
    ['Taunsa',          'تونسہ',          'Dera Ghazi Khan', 'ڈیرہ غازی خان',  30.7039, 70.6519],
    ['Kot Chutta',      'کوٹ چھٹہ',       'Dera Ghazi Khan', 'ڈیرہ غازی خان',  30.0500, 70.7536],
    ['Layyah',          'لیہ',            'Layyah',          'لیہ',            30.9693, 70.9428],
    ['Karor Lal Esan',  'کروڑ لال عیسن',  'Layyah',          'لیہ',            31.2179, 70.9542],
    ['Chaubara',        'چوبارہ',         'Layyah',          'لیہ',            30.8147, 71.5575],
    ['Muzaffargarh',    'مظفرگڑھ',        'Muzaffargarh',    'مظفرگڑھ',        30.0728, 71.1939],
    ['Kot Addu',        'کوٹ ادو',        'Kot Addu',        'کوٹ ادو',        30.4708, 70.9650],
    ['Alipur',          'علی پور',        'Muzaffargarh',    'مظفرگڑھ',        29.3819, 70.9078],
    ['Jatoi',           'جتوئی',          'Muzaffargarh',    'مظفرگڑھ',        29.5167, 70.8500],
    ['Rajanpur',        'راجن پور',       'Rajanpur',        'راجن پور',       29.1042, 70.3294],
    ['Jampur',          'جام پور',        'Rajanpur',        'راجن پور',       29.6411, 70.5764],
    ['Rojhan',          'روجھان',         'Rajanpur',        'راجن پور',       28.6893, 69.9989],

    // Sahiwal Division
    ['Sahiwal',         'ساہیوال',        'Sahiwal',         'ساہیوال',        30.6682, 73.1114],
    ['Chichawatni',     'چیچہ وطنی',      'Sahiwal',         'ساہیوال',        30.5331, 72.6919],
    ['Okara',           'اوکاڑہ',         'Okara',           'اوکاڑہ',         30.8138, 73.4534],
    ['Depalpur',        'دیپالپور',       'Okara',           'اوکاڑہ',         30.6694, 73.6494],
    ['Renala Khurd',    'رینالہ خورد',    'Okara',           'اوکاڑہ',         30.8761, 73.6017],
    ['Pakpattan',       'پاکپتن',         'Pakpattan',       'پاکپتن',         30.3415, 73.3889],
    ['Arifwala',        'عارف والا',      'Pakpattan',       'پاکپتن',         30.2911, 73.0658]
  ]},

  Sindh: { provinceUrdu: 'سندھ', tehsils: [
    // Karachi Division
    ['Karachi',         'کراچی',          'Karachi',         'کراچی',          24.8607, 67.0011],
    ['Karachi East',    'کراچی ایسٹ',     'Karachi East',    'کراچی ایسٹ',     24.9105, 67.0853],
    ['Karachi West',    'کراچی ویسٹ',     'Karachi West',    'کراچی ویسٹ',     24.9347, 66.9419],
    ['Karachi Central', 'کراچی سینٹرل',   'Karachi Central', 'کراچی سینٹرل',   24.9067, 67.0700],
    ['Karachi South',   'کراچی ساؤتھ',    'Karachi South',   'کراچی ساؤتھ',    24.8556, 67.0089],
    ['Malir',           'ملیر',           'Malir',           'ملیر',           24.8939, 67.2050],
    ['Korangi',         'کورنگی',         'Korangi',         'کورنگی',         24.8533, 67.1303],
    ['Kemari',          'کیماڑی',         'Kemari',          'کیماڑی',         24.8281, 66.9686],
    // Hyderabad Division
    ['Hyderabad',       'حیدرآباد',       'Hyderabad',       'حیدرآباد',       25.3960, 68.3578],
    ['Tando Muhammad Khan','ٹنڈو محمد خان','Tando Muhammad Khan','ٹنڈو محمد خان',25.1228, 68.5378],
    ['Tando Allahyar',  'ٹنڈو الہ یار',   'Tando Allahyar',  'ٹنڈو الہ یار',   25.4602, 68.7186],
    ['Tando Adam',      'ٹنڈو آدم',       'Sanghar',         'سانگھڑ',         25.7666, 68.6622],
    ['Matiari',         'مٹیاری',         'Matiari',         'مٹیاری',         25.5953, 68.4486],
    ['Hala',            'ہالا',           'Matiari',         'مٹیاری',         25.8167, 68.4083],
    ['Jamshoro',        'جامشورو',        'Jamshoro',        'جامشورو',        25.4286, 68.2814],
    ['Kotri',           'کوٹری',          'Jamshoro',        'جامشورو',        25.3667, 68.3083],
    ['Sehwan',          'سیہون',          'Jamshoro',        'جامشورو',        26.4258, 67.8639],
    ['Manjhand',        'مانجھند',        'Jamshoro',        'جامشورو',        25.8344, 68.2506],
    // Mirpur Khas Division
    ['Mirpur Khas',     'میرپور خاص',     'Mirpur Khas',     'میرپور خاص',     25.5276, 69.0140],
    ['Digri',           'ڈگری',           'Mirpur Khas',     'میرپور خاص',     25.1547, 69.1075],
    ['Jhuddo',          'جھڈو',           'Mirpur Khas',     'میرپور خاص',     25.1833, 69.3000],
    ['Sindhri',         'سندھری',         'Mirpur Khas',     'میرپور خاص',     25.6911, 69.0500],
    ['Umerkot',         'عمرکوٹ',         'Umerkot',         'عمرکوٹ',         25.3625, 69.7461],
    ['Kunri',           'کنری',           'Umerkot',         'عمرکوٹ',         25.1747, 69.5667],
    ['Pithoro',         'پتھورو',         'Umerkot',         'عمرکوٹ',         25.5083, 69.3833],
    ['Mithi',           'مٹھی',           'Tharparkar',      'تھرپارکر',       24.7333, 69.7976],
    ['Diplo',           'ڈپلو',           'Tharparkar',      'تھرپارکر',       24.4667, 69.5833],
    ['Nagarparkar',     'ناگرپارکر',      'Tharparkar',      'تھرپارکر',       24.3592, 70.7531],
    ['Chachro',         'چھاچھرو',        'Tharparkar',      'تھرپارکر',       25.1167, 70.2500],
    // Sukkur Division
    ['Sukkur',          'سکھر',           'Sukkur',          'سکھر',           27.7052, 68.8574],
    ['Rohri',           'روہڑی',          'Sukkur',          'سکھر',           27.6921, 68.8950],
    ['Pano Akil',       'پنوں عاقل',      'Sukkur',          'سکھر',           27.8511, 69.1117],
    ['Khairpur',        'خیرپور',         'Khairpur',        'خیرپور',         27.5295, 68.7592],
    ['Kingri',          'کنگری',          'Khairpur',        'خیرپور',         27.4133, 69.0719],
    ['Faiz Ganj',       'فیض گنج',        'Khairpur',        'خیرپور',         27.0656, 68.5969],
    ['Gambat',          'گمبٹ',           'Khairpur',        'خیرپور',         27.3536, 68.5219],
    ['Ghotki',          'گھوٹکی',         'Ghotki',          'گھوٹکی',         28.0067, 69.3122],
    ['Mirpur Mathelo',  'میرپور ماتھیلو', 'Ghotki',          'گھوٹکی',         28.0286, 69.5714],
    ['Ubauro',          'اوبارو',         'Ghotki',          'گھوٹکی',         28.1483, 69.7297],
    ['Daharki',         'ڈاہرکی',         'Ghotki',          'گھوٹکی',         28.0436, 69.7197],
    // Larkana Division
    ['Larkana',         'لاڑکانہ',        'Larkana',         'لاڑکانہ',        27.5598, 68.2120],
    ['Ratodero',        'رتو ڈیرو',       'Larkana',         'لاڑکانہ',        27.7997, 68.2731],
    ['Dokri',           'ڈوکری',          'Larkana',         'لاڑکانہ',        27.3792, 67.9061],
    ['Bakrani',         'بکرانی',         'Larkana',         'لاڑکانہ',        27.5667, 68.1167],
    ['Shikarpur',       'شکارپور',        'Shikarpur',       'شکارپور',        27.9554, 68.6385],
    ['Khanpur (Sindh)', 'خانپور (سندھ)',  'Shikarpur',       'شکارپور',        27.9008, 68.5311],
    ['Garhi Yasin',     'گڑھی یاسین',     'Shikarpur',       'شکارپور',        27.9650, 68.5128],
    ['Lakhi',           'لاکھی',          'Shikarpur',       'شکارپور',        27.7311, 68.0539],
    ['Jacobabad',       'جیکب آباد',      'Jacobabad',       'جیکب آباد',      28.2828, 68.4376],
    ['Garhi Khairo',    'گڑھی خیرو',      'Jacobabad',       'جیکب آباد',      28.0681, 68.0072],
    ['Thul',            'تھل',            'Jacobabad',       'جیکب آباد',      28.2389, 68.7833],
    ['Kashmore',        'کشمور',          'Kashmore',        'کشمور',          28.4333, 69.5833],
    ['Kandhkot',        'کندھ کوٹ',       'Kashmore',        'کشمور',          28.2389, 69.1789],
    ['Tangwani',        'ٹانگوانی',       'Kashmore',        'کشمور',          28.4789, 69.2522],
    ['Kamber',          'قمبر',           'Kamber Shahdadkot','قمبر شہداد کوٹ', 27.5870, 68.0011],
    ['Shahdadkot',      'شہداد کوٹ',      'Kamber Shahdadkot','قمبر شہداد کوٹ', 27.8500, 67.9000],
    ['Warah',           'وارہ',           'Kamber Shahdadkot','قمبر شہداد کوٹ', 27.4519, 67.7972],
    ['Miro Khan',       'میرو خان',       'Kamber Shahdadkot','قمبر شہداد کوٹ', 27.7689, 68.0394],
    // Shaheed Benazirabad Division
    ['Nawabshah',       'نواب شاہ',       'Shaheed Benazirabad','شہید بے نظیر آباد',26.2442,68.4100],
    ['Sakrand',         'سکرنڈ',          'Shaheed Benazirabad','شہید بے نظیر آباد',26.1389,68.2722],
    ['Daur',            'دور',            'Shaheed Benazirabad','شہید بے نظیر آباد',26.4528,68.3164],
    ['Naushahro Feroze','نوشہرو فیروز',   'Naushahro Feroze','نوشہرو فیروز',   26.8389, 68.1228],
    ['Moro',            'مورو',           'Naushahro Feroze','نوشہرو فیروز',   26.6622, 68.0083],
    ['Kandiaro',        'کنڈیارو',        'Naushahro Feroze','نوشہرو فیروز',   27.0533, 68.2261],
    ['Mehrabpur',       'مہرابپور',       'Naushahro Feroze','نوشہرو فیروز',   27.1761, 68.2378],
    ['Sanghar',         'سانگھڑ',         'Sanghar',         'سانگھڑ',         26.0476, 68.9472],
    ['Shahdadpur',      'شہداد پور',      'Sanghar',         'سانگھڑ',         25.9244, 68.6206],
    ['Sinjhoro',        'سنجھورو',        'Sanghar',         'سانگھڑ',         26.0397, 68.8167],
    ['Khipro',          'کھپرو',          'Sanghar',         'سانگھڑ',         25.8278, 69.3722],
    ['Tando Bago',      'ٹنڈو باگو',      'Badin',           'بدین',           24.7833, 68.9667],
    ['Badin',           'بدین',           'Badin',           'بدین',           24.6556, 68.8378],
    ['Matli',           'مٹلی',           'Badin',           'بدین',           25.0306, 68.6592],
    ['Talhar',          'تلہار',          'Badin',           'بدین',           24.8861, 68.8208],
    ['Golarchi',        'گولارچی',        'Badin',           'بدین',           24.7281, 68.7383],
    ['Thatta',          'ٹھٹہ',           'Thatta',          'ٹھٹہ',           24.7475, 67.9230],
    ['Mirpur Sakro',    'میرپور ساکرو',   'Thatta',          'ٹھٹہ',           24.5450, 67.6800],
    ['Sujawal',         'سجاول',          'Sujawal',         'سجاول',          24.6075, 68.0794],
    ['Mirpur Bathoro',  'میرپور بٹھورو',  'Sujawal',         'سجاول',          24.7333, 68.2500],
    ['Jati',            'جاٹی',           'Sujawal',         'سجاول',          24.3567, 68.2614],
    ['Dadu',            'دادو',           'Dadu',            'دادو',           26.7319, 67.7790],
    ['Khairpur Nathan Shah','خیرپور ناتھن شاہ','Dadu',        'دادو',           27.0892, 67.7411],
    ['Mehar',           'میہڑ',           'Dadu',            'دادو',           27.1875, 67.8181],
    ['Johi',            'جوہی',           'Dadu',            'دادو',           26.6928, 67.6178]
  ]},

  KPK: { provinceUrdu: 'خیبرپختونخوا', tehsils: [
    // Peshawar Division
    ['Peshawar',        'پشاور',          'Peshawar',        'پشاور',          34.0151, 71.5249],
    ['Charsadda',       'چارسدہ',         'Charsadda',       'چارسدہ',         34.1454, 71.7308],
    ['Tangi',           'ٹانگی',          'Charsadda',       'چارسدہ',         34.3000, 71.6500],
    ['Shabqadar',       'شبقدر',          'Charsadda',       'چارسدہ',         34.2167, 71.5500],
    ['Nowshera',        'نوشہرہ',         'Nowshera',        'نوشہرہ',         34.0153, 71.9747],
    ['Pabbi',           'پبی',            'Nowshera',        'نوشہرہ',         34.0028, 71.7969],
    ['Jehangira',       'جہانگیرہ',       'Nowshera',        'نوشہرہ',         34.0233, 72.1989],
    ['Khyber',          'خیبر',           'Khyber',          'خیبر',           34.1000, 71.0000],
    ['Jamrud',          'جمرود',          'Khyber',          'خیبر',           34.0000, 71.3833],
    ['Landi Kotal',     'لنڈی کوتل',      'Khyber',          'خیبر',           34.0986, 71.1431],
    ['Mohmand',         'مہمند',          'Mohmand',         'مہمند',          34.5333, 71.4000],
    // Mardan Division
    ['Mardan',          'مردان',          'Mardan',          'مردان',          34.1988, 72.0404],
    ['Takht Bhai',      'تخت بھائی',      'Mardan',          'مردان',          34.3169, 72.0036],
    ['Katlang',         'کاٹلنگ',         'Mardan',          'مردان',          34.3667, 72.1500],
    ['Swabi',           'صوابی',          'Swabi',           'صوابی',          34.1167, 72.4691],
    ['Lahor (Swabi)',   'لاہور (صوابی)',  'Swabi',           'صوابی',          34.0436, 72.5022],
    ['Topi',            'ٹوپی',           'Swabi',           'صوابی',          34.0728, 72.6228],
    // Hazara Division
    ['Abbottabad',      'ایبٹ آباد',      'Abbottabad',      'ایبٹ آباد',      34.1463, 73.2117],
    ['Havelian',        'حویلیاں',        'Abbottabad',      'ایبٹ آباد',      34.0539, 73.1572],
    ['Mansehra',        'مانسہرہ',        'Mansehra',        'مانسہرہ',        34.3334, 73.1965],
    ['Balakot',         'بالاکوٹ',        'Mansehra',        'مانسہرہ',        34.5481, 73.3539],
    ['Oghi',            'اوگھی',          'Mansehra',        'مانسہرہ',        34.5083, 72.9583],
    ['Haripur',         'ہری پور',        'Haripur',         'ہری پور',        34.0014, 72.9333],
    ['Khanpur (KPK)',   'خانپور (خیبرپختونخوا)','Haripur',   'ہری پور',        33.8000, 72.9333],
    ['Battagram',       'بٹگرام',         'Battagram',       'بٹگرام',         34.6783, 73.0233],
    ['Allai',           'علائی',          'Battagram',       'بٹگرام',         34.7833, 73.1500],
    ['Tor Ghar',        'تور غر',         'Tor Ghar',        'تور غر',         34.7833, 72.9833],
    ['Kohistan',        'کوہستان',        'Kohistan',        'کوہستان',        35.4500, 73.0333],
    ['Dassu',           'داسو',           'Upper Kohistan',  'بالائی کوہستان', 35.4156, 73.0794],
    ['Pattan',          'پٹن',            'Lower Kohistan',  'زیریں کوہستان',  35.0297, 72.9925],
    // Kohat Division
    ['Kohat',           'کوہاٹ',          'Kohat',           'کوہاٹ',          33.5811, 71.4490],
    ['Lachi',           'لاچی',           'Kohat',           'کوہاٹ',          33.3833, 71.3333],
    ['Hangu',           'ہنگو',           'Hangu',           'ہنگو',           33.5263, 71.0649],
    ['Thal',            'تھل',            'Hangu',           'ہنگو',           33.3711, 70.5483],
    ['Karak',           'کرک',            'Karak',           'کرک',            33.1175, 71.0931],
    ['Banda Daud Shah', 'بانڈہ داؤد شاہ', 'Karak',           'کرک',            33.2625, 71.2192],
    ['Kurram',          'کرم',            'Kurram',          'کرم',            33.8167, 70.0500],
    ['Parachinar',      'پاراچنار',       'Kurram',          'کرم',            33.8978, 70.0997],
    ['Sadda',           'صدہ',            'Lower Kurram',    'زیریں کرم',      33.7044, 70.3692],
    ['Orakzai',         'اورکزئی',        'Orakzai',         'اورکزئی',        33.6667, 70.8333],
    // Bannu Division
    ['Bannu',           'بنوں',           'Bannu',           'بنوں',           32.9854, 70.6017],
    ['Domel',           'ڈومیل',          'Bannu',           'بنوں',           32.9000, 70.5000],
    ['Lakki Marwat',    'لکی مروت',       'Lakki Marwat',    'لکی مروت',       32.6080, 70.9114],
    ['Naurang',         'نوارنگ',         'Lakki Marwat',    'لکی مروت',       32.5417, 70.7842],
    ['North Waziristan','شمالی وزیرستان', 'North Waziristan','شمالی وزیرستان', 32.9514, 70.0500],
    ['Miran Shah',      'میرانشاہ',       'North Waziristan','شمالی وزیرستان', 32.9939, 70.0697],
    ['South Waziristan','جنوبی وزیرستان', 'South Waziristan','جنوبی وزیرستان', 32.4000, 69.7500],
    ['Wana',            'وانا',           'South Waziristan','جنوبی وزیرستان', 32.3009, 69.5703],
    // DI Khan Division
    ['Dera Ismail Khan','ڈیرہ اسماعیل خان','Dera Ismail Khan','ڈیرہ اسماعیل خان',31.8313,70.9019],
    ['Paharpur',        'پہاڑپور',        'Dera Ismail Khan','ڈیرہ اسماعیل خان',31.6850,70.9528],
    ['Kulachi',         'کلاچی',          'Dera Ismail Khan','ڈیرہ اسماعیل خان',31.9333,70.4592],
    ['Daraban',         'درابن',          'Dera Ismail Khan','ڈیرہ اسماعیل خان',31.5681,70.3422],
    ['Tank',            'ٹانک',           'Tank',            'ٹانک',           32.2181, 70.3833],
    // Malakand Division
    ['Mingora',         'مینگورہ',        'Swat',            'سوات',           34.7795, 72.3614],
    ['Saidu Sharif',    'سیدو شریف',      'Swat',            'سوات',           34.7445, 72.3551],
    ['Matta',           'مٹہ',            'Swat',            'سوات',           34.9667, 72.4500],
    ['Khwazakhela',     'خوازہ خیلہ',     'Swat',            'سوات',           34.9117, 72.4742],
    ['Buner',           'بونیر',          'Buner',           'بونیر',          34.4500, 72.6500],
    ['Daggar',          'ڈگر',            'Buner',           'بونیر',          34.4986, 72.4644],
    ['Shangla',         'شانگلہ',         'Shangla',         'شانگلہ',         34.9000, 72.7167],
    ['Alpuri',          'الپوری',         'Shangla',         'شانگلہ',         34.9000, 72.6500],
    ['Lower Dir',       'دیر زیریں',      'Lower Dir',       'دیر زیریں',      34.8000, 72.0000],
    ['Timergara',       'ٹیمرگرہ',        'Lower Dir',       'دیر زیریں',      34.8311, 71.8425],
    ['Upper Dir',       'دیر بالا',       'Upper Dir',       'دیر بالا',       35.2061, 71.8769],
    ['Wari',            'واری',           'Upper Dir',       'دیر بالا',       35.0833, 71.8000],
    ['Chitral',         'چترال',          'Chitral',         'چترال',          35.8511, 71.7868],
    ['Drosh',           'دروش',           'Chitral',         'چترال',          35.5544, 71.7869],
    ['Mastuj',          'مستوج',          'Upper Chitral',   'بالائی چترال',   36.2622, 72.5181],
    ['Bajaur',          'باجوڑ',          'Bajaur',          'باجوڑ',          34.7333, 71.5167],
    ['Khaar',           'خار',            'Bajaur',          'باجوڑ',          34.7406, 71.5450]
  ]},

  Balochistan: { provinceUrdu: 'بلوچستان', tehsils: [
    // Quetta Division
    ['Quetta',          'کوئٹہ',          'Quetta',          'کوئٹہ',          30.1798, 66.9750],
    ['Pishin',          'پشین',           'Pishin',          'پشین',           30.5832, 66.9943],
    ['Karezat',         'کاریزات',        'Pishin',          'پشین',           30.7167, 66.7500],
    ['Killa Abdullah',  'قلعہ عبداللہ',   'Killa Abdullah',  'قلعہ عبداللہ',   30.7333, 66.6500],
    ['Chaman',          'چمن',            'Killa Abdullah',  'قلعہ عبداللہ',   30.9214, 66.4598],
    ['Gulistan',        'گلستان',         'Killa Abdullah',  'قلعہ عبداللہ',   30.6000, 66.5833],
    ['Mastung',         'مستونگ',         'Mastung',         'مستونگ',         29.7997, 66.8460],
    ['Dasht',           'دشت',            'Mastung',         'مستونگ',         30.2000, 66.6500],
    ['Kalat',           'قلات',           'Kalat',           'قلات',           29.0263, 66.5907],
    ['Mangochar',       'مانگوچر',        'Kalat',           'قلات',           29.4292, 66.6019],
    // Sibi Division
    ['Sibi',            'سبی',            'Sibi',            'سبی',            29.5429, 67.8773],
    ['Kohlu',           'کوہلو',          'Kohlu',           'کوہلو',          29.8917, 69.2522],
    ['Dera Bugti',      'ڈیرہ بگٹی',      'Dera Bugti',      'ڈیرہ بگٹی',      28.9967, 69.1469],
    ['Sui',             'سوئی',           'Dera Bugti',      'ڈیرہ بگٹی',      28.6219, 69.1900],
    ['Harnai',          'ہرنائی',         'Harnai',          'ہرنائی',         30.0986, 67.9300],
    ['Ziarat',          'زیارت',          'Ziarat',          'زیارت',          30.3819, 67.7256],
    // Naseerabad Division
    ['Dera Murad Jamali','ڈیرہ مراد جمالی','Naseerabad',     'نصیر آباد',      28.5167, 68.1828],
    ['Tamboo',          'ٹمبو',           'Naseerabad',      'نصیر آباد',      28.3500, 68.0500],
    ['Jaffarabad',      'جعفرآباد',       'Jaffarabad',      'جعفرآباد',       28.3081, 68.4356],
    ['Usta Muhammad',   'استہ محمد',      'Jaffarabad',      'جعفرآباد',       28.1761, 68.0431],
    ['Sohbatpur',       'سہبت پور',       'Sohbatpur',       'سہبت پور',       28.5197, 68.5414],
    ['Jhal Magsi',      'جھل مگسی',       'Jhal Magsi',      'جھل مگسی',       28.2961, 67.5358],
    // Makran Division
    ['Turbat',          'تربت',           'Kech',            'کیچ',            25.9966, 63.0644],
    ['Buleda',          'بلیدہ',          'Kech',            'کیچ',            26.4250, 63.4828],
    ['Tump',            'تمپ',            'Kech',            'کیچ',            26.1339, 62.3700],
    ['Gwadar',          'گوادر',          'Gwadar',          'گوادر',          25.1216, 62.3253],
    ['Pasni',           'پسنی',           'Gwadar',          'گوادر',          25.2614, 63.4711],
    ['Jiwani',          'جیونی',          'Gwadar',          'گوادر',          25.0386, 61.7456],
    ['Ormara',          'اورماڑہ',        'Gwadar',          'گوادر',          25.2089, 64.6353],
    ['Panjgur',         'پنجگور',         'Panjgur',         'پنجگور',         26.9669, 64.0931],
    ['Awaran',          'آواران',         'Awaran',          'آواران',         26.4644, 65.2306],
    // Kalat Division
    ['Khuzdar',         'خضدار',          'Khuzdar',         'خضدار',          27.8120, 66.6147],
    ['Wadh',            'وڈھ',            'Khuzdar',         'خضدار',          27.3458, 66.4233],
    ['Nal',             'نل',             'Khuzdar',         'خضدار',          27.4097, 66.3083],
    ['Kharan',          'خاران',          'Kharan',          'خاران',          28.5833, 65.4189],
    ['Washuk',          'واشک',           'Washuk',          'واشک',           27.2231, 64.7553],
    ['Lasbela',         'لسبیلہ',         'Lasbela',         'لسبیلہ',         26.2422, 66.3097],
    ['Hub',             'حب',             'Lasbela',         'لسبیلہ',         25.0150, 66.9000],
    ['Bela',            'بیلہ',           'Lasbela',         'لسبیلہ',         26.2300, 66.3000],
    ['Uthal',           'اوتھل',          'Lasbela',         'لسبیلہ',         25.8089, 66.6189],
    // Loralai/Zhob Division
    ['Loralai',         'لورالائی',       'Loralai',         'لورالائی',       30.3679, 68.5970],
    ['Mekhtar',         'میختر',          'Loralai',         'لورالائی',       30.4492, 69.4014],
    ['Duki',            'دکی',            'Duki',            'دکی',            30.1542, 68.5814],
    ['Musakhel',        'موسی خیل',       'Musakhel',        'موسی خیل',       30.8500, 69.8167],
    ['Barkhan',         'بارکھان',        'Barkhan',         'بارکھان',        29.8997, 69.5236],
    ['Zhob',            'ژوب',            'Zhob',            'ژوب',            31.3415, 69.4496],
    ['Sherani',         'شیرانی',         'Sherani',         'شیرانی',         31.5500, 69.7500],
    // Chagai Division
    ['Dalbandin',       'دالبندین',       'Chagai',          'چاغی',           28.8908, 64.4053],
    ['Nokkundi',        'نوک کنڈی',       'Chagai',          'چاغی',           28.8167, 62.7500],
    ['Nushki',          'نوشکی',          'Nushki',          'نوشکی',          29.5497, 66.0214]
  ]},

  'Gilgit-Baltistan': { provinceUrdu: 'گلگت بلتستان', tehsils: [
    ['Gilgit',          'گلگت',           'Gilgit',          'گلگت',           35.9221, 74.3087],
    ['Danyore',         'دانیور',         'Gilgit',          'گلگت',           35.9542, 74.3942],
    ['Diamer',          'دیامر',          'Diamer',          'دیامر',          35.4186, 74.0944],
    ['Chilas',          'چلاس',           'Diamer',          'دیامر',          35.4186, 74.0944],
    ['Astore',          'استور',          'Astore',          'استور',          35.3636, 74.8508],
    ['Eidgah',          'عیدگاہ',         'Astore',          'استور',          35.3556, 74.8519],
    ['Skardu',          'سکردو',          'Skardu',          'سکردو',          35.2971, 75.6305],
    ['Shigar',          'شگر',            'Shigar',          'شگر',            35.4231, 75.7361],
    ['Kharmang',        'کھرمنگ',         'Kharmang',        'کھرمنگ',         35.1297, 76.1311],
    ['Ghanche',         'گانچھے',         'Ghanche',         'گانچھے',         35.2750, 76.2208],
    ['Khaplu',          'کھپلو',          'Ghanche',         'گانچھے',         35.1483, 76.3486],
    ['Hunza',           'ہنزہ',           'Hunza',           'ہنزہ',           36.3206, 74.6500],
    ['Karimabad',       'کریم آباد',      'Hunza',           'ہنزہ',           36.3253, 74.6700],
    ['Aliabad',         'علی آباد',       'Hunza',           'ہنزہ',           36.3128, 74.6394],
    ['Nagar',           'نگر',            'Nagar',           'نگر',            36.1547, 74.7286],
    ['Ghizer',          'غذر',            'Ghizer',          'غذر',            36.3500, 73.2333],
    ['Gahkuch',         'گاہکوچ',         'Ghizer',          'غذر',            36.3403, 73.7906]
  ]},

  'Azad Kashmir': { provinceUrdu: 'آزاد کشمیر', tehsils: [
    ['Muzaffarabad',    'مظفر آباد',      'Muzaffarabad',    'مظفر آباد',      34.3702, 73.4711],
    ['Patikka',         'پتیکہ',          'Muzaffarabad',    'مظفر آباد',      34.4781, 73.6428],
    ['Hattian Bala',    'ہٹیاں بالا',     'Hattian Bala',    'ہٹیاں بالا',     34.4083, 73.7944],
    ['Chikkar',         'چکار',           'Hattian Bala',    'ہٹیاں بالا',     34.4708, 73.6306],
    ['Athmuqam',        'اٹھمقام',        'Neelum',          'نیلم',           34.6353, 73.8917],
    ['Sharda',          'شاردہ',          'Neelum',          'نیلم',           34.7967, 74.1833],
    ['Kel',             'کیل',            'Neelum',          'نیلم',           34.8222, 74.3531],
    ['Mirpur (AJK)',    'میرپور (آزاد کشمیر)','Mirpur',      'میرپور',         33.1471, 73.7515],
    ['Dadyal',          'ڈڈیال',          'Mirpur',          'میرپور',         33.0728, 73.6519],
    ['Bhimber',         'بھمبر',          'Bhimber',         'بھمبر',          32.9856, 74.0789],
    ['Samahni',         'سماہنی',         'Bhimber',         'بھمبر',          32.8456, 74.0319],
    ['Barnala',         'برنالہ',         'Bhimber',         'بھمبر',          33.0517, 74.1119],
    ['Kotli',           'کوٹلی',          'Kotli',           'کوٹلی',          33.5181, 73.9023],
    ['Sehnsa',          'سیہنسا',         'Kotli',           'کوٹلی',          33.4378, 74.0633],
    ['Charhoi',         'چڑھوئی',         'Kotli',           'کوٹلی',          33.6517, 74.0228],
    ['Rawalakot',       'راولاکوٹ',       'Poonch',          'پونچھ',          33.8587, 73.7589],
    ['Hajira',          'ہجیرہ',          'Poonch',          'پونچھ',          33.7733, 74.1222],
    ['Thorar',          'تھوار',          'Poonch',          'پونچھ',          33.7869, 73.8728],
    ['Pallandri',       'پلندری',         'Sudhanoti',       'سدھنوتی',        33.7117, 73.7011],
    ['Trarkhel',        'ترارکھل',        'Sudhanoti',       'سدھنوتی',        33.7281, 73.6786],
    ['Bagh',            'باغ',            'Bagh',            'باغ',            33.9789, 73.7805],
    ['Dheerkot',        'ڈھیرکوٹ',        'Bagh',            'باغ',            33.9100, 73.6389],
    ['Haveli',          'ہویلی',          'Haveli',          'ہویلی',          34.0531, 74.0894],
    ['Khurshidabad',    'خورشیدآباد',     'Haveli',          'ہویلی',          34.1275, 74.1497]
  ]},

  Islamabad: { provinceUrdu: 'اسلام آباد', tehsils: [
    ['Islamabad',       'اسلام آباد',     'Islamabad',       'اسلام آباد',     33.6844, 73.0479]
  ]}
};

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB\n');

    let total = 0;
    for (const [province, info] of Object.entries(dataset)) {
      total += info.tehsils.length;
    }
    console.log(`Importing ${total} cities/tehsils across all districts (upsert — won't duplicate)…\n`);

    let inserted = 0, updated = 0, perProvince = {};
    for (const [province, info] of Object.entries(dataset)) {
      let p = 0;
      for (const t of info.tehsils) {
        const [city, cityUrdu, district, districtUrdu, lat, lng] = t;
        const doc = {
          country: PK, countryUrdu: PK_UR,
          province, provinceUrdu: info.provinceUrdu,
          city, cityUrdu,
          district, districtUrdu,
          latitude: lat, longitude: lng
        };
        const res = await Location.updateOne(
          { country: PK, province, city },
          { $set: doc },
          { upsert: true }
        );
        if (res.upsertedCount) inserted++;
        else if (res.modifiedCount) updated++;
        p++;
      }
      perProvince[province] = p;
    }

    const dbTotal = await Location.countDocuments({ country: PK });
    console.log('✓ Done.');
    console.log(`  ${inserted} new tehsils inserted`);
    console.log(`  ${updated} existing tehsils updated`);
    console.log(`  ${dbTotal} total Pakistani locations now in DB\n`);
    console.log('  Per-province coverage:');
    for (const [p, c] of Object.entries(perProvince)) {
      console.log(`    ${p.padEnd(20)} ${c} cities/tehsils`);
    }
    process.exit(0);
  } catch (e) {
    console.error('✗ Failed:', e.message);
    process.exit(1);
  }
}

run();
