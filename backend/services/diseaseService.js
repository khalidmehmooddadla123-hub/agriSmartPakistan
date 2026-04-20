/**
 * AgriSmart360 - Crop Disease Detection Service
 * Comprehensive knowledge base of common Pakistani crop diseases
 * with bilingual (English/Urdu) diagnosis, causes, and solutions
 */

const diseaseDatabase = [
  // ========== WHEAT DISEASES ==========
  {
    id: 'wheat_stripe_rust',
    crop: 'Wheat',
    cropUrdu: 'گندم',
    name: 'Wheat Stripe Rust (Yellow Rust)',
    nameUrdu: 'گندم کی پیلی زنگ (سٹرائپ رسٹ)',
    scientificName: 'Puccinia striiformis',
    symptoms: 'Bright yellow to orange pustules arranged in parallel STRIPES along the leaf veins (distinguishing feature). Stripes run lengthwise on the leaf blade. Leaves turn yellow, dry out, and collapse. Most severe on upper leaves. Can affect ear heads in late stages.',
    symptomsUrdu: 'پتوں کی رگوں کے ساتھ متوازی لائنوں میں چمکدار پیلے سے نارنجی دانے (یہ پہچان ہے)۔ دھاریاں پتے کی لمبائی میں ہوتی ہیں۔ پتے پیلے ہو کر سوکھ جاتے ہیں۔ بالی پر بھی آ سکتی ہے۔',
    cause: 'Caused by Puccinia striiformis fungus. Favors COOL humid weather (10-15°C) and high moisture/dew. Spreads rapidly through wind-borne spores over hundreds of kilometers. Most common in northern Punjab, KPK, and hilly areas. Dense planting and susceptible varieties increase risk.',
    causeUrdu: 'پکسینیا سٹرائی فورمس فنگس کی وجہ سے۔ ٹھنڈے نم موسم (10-15°C) اور زیادہ اوس میں تیزی سے پھیلتی ہے۔ ہوا کے ذریعے سینکڑوں کلومیٹر تک منتقل ہوتی ہے۔ شمالی پنجاب، خیبرپختونخوا اور پہاڑی علاقوں میں عام ہے۔',
    solution: '1. SPRAY IMMEDIATELY: Tilt 250 EC (Propiconazole) @ 300 ml/acre in 150L water, OR Nativo 75WG @ 120 g/acre, OR Amistar Top @ 200 ml/acre.\n2. Cost: approximately PKR 800-1,500 per acre.\n3. Repeat spray after 12-15 days if symptoms persist.\n4. For next season, plant Pakistani rust-resistant varieties: Galaxy-2013, Akbar-2019, Ujala-2016, or Faisalabad-2008.\n5. Avoid excessive nitrogen fertilizer (use urea only at recommended rate).\n6. Ensure proper plant spacing (9 inch row-to-row) for air flow.\n7. Report outbreak to your local Agriculture Extension office — stripe rust spreads fast across neighboring fields.',
    solutionUrdu: '1. فوری سپرے: Tilt 250 EC (پروپیکونازول) 300 ملی لیٹر فی ایکڑ 150 لیٹر پانی میں، یا Nativo 75WG 120 گرام فی ایکڑ، یا Amistar Top 200 ملی لیٹر فی ایکڑ۔\n2. قیمت: تقریباً 800-1,500 روپے فی ایکڑ۔\n3. علامات جاری رہیں تو 12-15 دن بعد دوبارہ سپرے کریں۔\n4. اگلے موسم کے لیے مزاحم اقسام: گلیکسی-2013، اکبر-2019، اجالا-2016، یا فیصل آباد-2008۔\n5. زیادہ نائٹروجن کھاد نہ ڈالیں۔\n6. قطاروں میں 9 انچ کا فاصلہ رکھیں۔\n7. اپنے قریبی زرعی دفتر کو اطلاع دیں — پیلی زنگ تیزی سے پھیلتی ہے۔',
    severity: 'high',
    keywords: ['stripe rust', 'yellow rust', 'yellow stripes', 'parallel', 'veins', 'striiformis', 'cool', 'northern']
  },
  {
    id: 'wheat_leaf_rust',
    crop: 'Wheat',
    cropUrdu: 'گندم',
    name: 'Wheat Leaf Rust (Brown Rust)',
    nameUrdu: 'گندم کی بھوری زنگ (پتوں کی زنگ)',
    scientificName: 'Puccinia triticina',
    symptoms: 'Orange to reddish-brown round or oval pustules scattered RANDOMLY (not in stripes) on the upper leaf surface. Pustules are smaller than stripe rust. Leaves become yellow and dry out. Common in all wheat-growing areas.',
    symptomsUrdu: 'پتے کی اوپری سطح پر نارنجی سے سرخ بھورے گول دانے، بکھرے ہوئے (دھاریوں میں نہیں)۔ دانے پیلی زنگ سے چھوٹے ہوتے ہیں۔ پتے پیلے ہو کر سوکھ جاتے ہیں۔',
    cause: 'Caused by Puccinia triticina fungus. Favors WARM humid weather (15-25°C). Spreads through wind-borne spores. Common in central Punjab and Sindh. Excessive nitrogen and dense planting increase risk.',
    causeUrdu: 'پکسینیا ٹریٹیسینا فنگس کی وجہ سے۔ گرم نم موسم (15-25°C) میں ہوتی ہے۔ ہوا کے ذریعے پھیلتی ہے۔ وسطی پنجاب اور سندھ میں عام۔',
    solution: '1. Spray Tilt 250 EC (Propiconazole) @ 300 ml/acre, OR Folicur @ 250 ml/acre.\n2. Cost: PKR 700-1,200 per acre.\n3. Resistant varieties: Galaxy-2013, Faisalabad-2008, Inqlab-91 (older but still used).\n4. Avoid late sowing — early November sowing reduces risk.\n5. Control volunteer wheat plants (they harbor fungus between seasons).\n6. Balance fertilizer: do not exceed recommended nitrogen.',
    solutionUrdu: '1. Tilt 250 EC 300 ملی لیٹر فی ایکڑ سپرے، یا Folicur 250 ملی لیٹر فی ایکڑ۔\n2. قیمت: 700-1,200 روپے فی ایکڑ۔\n3. مزاحم اقسام: گلیکسی-2013، فیصل آباد-2008، انقلاب-91۔\n4. دیر سے بجائی نہ کریں — نومبر کے اوائل میں بجائی بہتر ہے۔\n5. خود رو گندم کے پودے نکال دیں۔',
    severity: 'high',
    keywords: ['leaf rust', 'brown rust', 'orange', 'scattered', 'triticina', 'reddish brown', 'random']
  },
  {
    id: 'wheat_stem_rust',
    crop: 'Wheat',
    cropUrdu: 'گندم',
    name: 'Wheat Stem Rust (Black Rust)',
    nameUrdu: 'گندم کی کالی زنگ (تنوں کی زنگ)',
    scientificName: 'Puccinia graminis',
    symptoms: 'Large, elongated, dark reddish-brown pustules on STEMS, leaf sheaths, and sometimes ear heads (not just leaves — distinguishing feature). Later turn into black spore masses. Severe lodging (plant falls over). Most destructive of the three rusts.',
    symptomsUrdu: 'تنوں، پتوں کے غلاف، اور بعض اوقات بالی پر بڑے لمبے گہرے سرخ بھورے دانے (صرف پتوں پر نہیں — یہ پہچان ہے)۔ بعد میں سیاہ ہو جاتے ہیں۔ پودے گر جاتے ہیں۔ تینوں زنگوں میں سب سے خطرناک۔',
    cause: 'Caused by Puccinia graminis fungus. Favors WARM weather (20-30°C) and high humidity. Spreads via wind-borne spores. Has UG99 race which is aggressive and can break resistance. Common in late-maturing wheat areas.',
    causeUrdu: 'پکسینیا گرامنس فنگس کی وجہ سے۔ گرم موسم (20-30°C) اور نمی میں پھلتی ہے۔ UG99 نسل خطرناک ہے۔',
    solution: '1. URGENT: Spray Nativo 75WG @ 120 g/acre OR Amistar Top @ 200 ml/acre IMMEDIATELY.\n2. Cost: PKR 1,200-2,000 per acre.\n3. Plant UG99-resistant varieties: Akbar-2019, Ujala-2016, Borlaug-2016.\n4. Remove Barberry bushes near fields (alternate host).\n5. Early sowing (November 1-15) helps escape severe infection.\n6. Burn infected crop residue after harvest — spores survive in stubble.\n7. REPORT to Agriculture department — stem rust is regulated.',
    solutionUrdu: '1. فوری: Nativo 75WG 120 گرام فی ایکڑ یا Amistar Top 200 ملی لیٹر فی ایکڑ سپرے۔\n2. قیمت: 1,200-2,000 روپے فی ایکڑ۔\n3. UG99 مزاحم اقسام: اکبر-2019، اجالا-2016، بورلاگ-2016۔\n4. نومبر 1-15 تک بجائی بہتر۔\n5. متاثرہ باقیات جلا دیں۔\n6. زرعی محکمے کو اطلاع دیں۔',
    severity: 'high',
    keywords: ['stem rust', 'black rust', 'graminis', 'stem', 'ug99', 'dark brown', 'lodging', 'stalk']
  },
  {
    id: 'wheat_smut',
    crop: 'Wheat',
    cropUrdu: 'گندم',
    name: 'Loose Smut of Wheat',
    nameUrdu: 'گندم کی کنگیاری (لوز سمٹ)',
    symptoms: 'Black powdery mass replaces the wheat grain head. Entire ear becomes black dust-like spore mass.',
    symptomsUrdu: 'گندم کی بالی کی جگہ سیاہ پاؤڈر نما مادہ بن جاتا ہے۔ پوری بالی سیاہ دھول جیسی ہو جاتی ہے۔',
    cause: 'Caused by Ustilago tritici fungus. The fungus infects the seed during flowering. Using infected seeds spreads the disease. Warm and humid conditions (20-25°C) during flowering favor infection.',
    causeUrdu: 'یوسٹیلاگو ٹریٹیسی فنگس کی وجہ سے ہوتی ہے۔ فنگس پھول آنے کے دوران بیج کو متاثر کرتی ہے۔ متاثرہ بیج استعمال کرنے سے بیماری پھیلتی ہے۔ پھول آنے کے دوران گرم اور نم موسم (20-25 ڈگری) بیماری کو بڑھاتا ہے۔',
    solution: '1. Treat seeds with systemic fungicide (Carboxin or Vitavax) before sowing.\n2. Use certified disease-free seeds.\n3. Hot water treatment: soak seeds in water at 52°C for 10 minutes.\n4. Grow resistant varieties.\n5. Remove and burn infected plants before spores spread.',
    solutionUrdu: '1. بجائی سے پہلے بیج کو سسٹمک فنگس مار دوا (کاربوکسن یا وٹاوکس) سے ٹریٹ کریں۔\n2. تصدیق شدہ بیماری سے پاک بیج استعمال کریں۔\n3. گرم پانی کا علاج: بیج کو 52 ڈگری پانی میں 10 منٹ بھگوئیں۔\n4. مزاحم اقسام لگائیں۔\n5. بیضوں کے پھیلنے سے پہلے متاثرہ پودے نکال کر جلا دیں۔',
    severity: 'high',
    keywords: ['smut', 'black', 'powder', 'ear', 'head', 'wheat', 'dust']
  },
  // ========== RICE DISEASES ==========
  {
    id: 'rice_blast',
    crop: 'Rice',
    cropUrdu: 'چاول',
    name: 'Rice Blast Disease',
    nameUrdu: 'چاول کا بلاسٹ مرض',
    symptoms: 'Diamond-shaped gray-green lesions on leaves with brown borders. Nodes turn black and break. Panicle neck turns brown causing empty grains.',
    symptomsUrdu: 'پتوں پر ہیرے کی شکل کے سبز بھورے دھبے بھورے کناروں کے ساتھ۔ گانٹھیں سیاہ ہو کر ٹوٹ جاتی ہیں۔ بالی کی گردن بھوری ہو کر خالی دانے بنتے ہیں۔',
    cause: 'Caused by Magnaporthe oryzae fungus. Spreads rapidly in cool nights (20-25°C), high humidity (>90%), and prolonged leaf wetness. Excessive nitrogen and dense planting increase susceptibility.',
    causeUrdu: 'میگناپورتھے اورائزے فنگس سے ہوتی ہے۔ ٹھنڈی راتوں (20-25 ڈگری)، زیادہ نمی (90% سے زیادہ) اور پتوں کی طویل تری میں تیزی سے پھیلتی ہے۔ زیادہ نائٹروجن اور گھنی بجائی خطرہ بڑھاتی ہے۔',
    solution: '1. Apply Tricyclazole (Beam) fungicide at 0.6g/L water spray.\n2. Use blast-resistant rice varieties (IRRI-6, Super Basmati treated).\n3. Reduce nitrogen fertilizer, apply in split doses.\n4. Maintain proper water management in paddies.\n5. Ensure adequate spacing between plants.\n6. Burn infected crop residue after harvest.',
    solutionUrdu: '1. ٹرائسائکلازول (بیم) فنگس مار دوا 0.6 گرام فی لیٹر پانی میں سپرے کریں۔\n2. بلاسٹ مزاحم چاول کی اقسام استعمال کریں (آئی آر آئی-6)۔\n3. نائٹروجن کھاد کم ڈالیں، قسطوں میں دیں۔\n4. کھیت میں پانی کا مناسب انتظام رکھیں۔\n5. پودوں میں مناسب فاصلہ رکھیں۔\n6. فصل کاٹنے کے بعد متاثرہ باقیات جلا دیں۔',
    severity: 'high',
    keywords: ['blast', 'rice', 'diamond', 'lesion', 'gray', 'neck', 'panicle']
  },
  {
    id: 'rice_brown_spot',
    crop: 'Rice',
    cropUrdu: 'چاول',
    name: 'Brown Spot of Rice',
    nameUrdu: 'چاول کا بھورا دھبہ',
    symptoms: 'Oval brown spots with gray centers on leaves. Spots may merge causing large dead areas. Infected grains become discolored.',
    symptomsUrdu: 'پتوں پر بیضوی بھورے دھبے جن کے درمیان سلیٹی رنگ۔ دھبے مل کر بڑے مردہ حصے بناتے ہیں۔ متاثرہ دانے بدرنگ ہو جاتے ہیں۔',
    cause: 'Caused by Bipolaris oryzae fungus. Occurs in nutrient-deficient soils, especially low potassium and silicon. Water stress and poor soil fertility worsen the disease.',
    causeUrdu: 'بائپولیرس اورائزے فنگس سے ہوتی ہے۔ غذائیت کی کمی والی مٹی میں ہوتی ہے خاص طور پر پوٹاشیم اور سلیکون کی کمی سے۔ پانی کی کمی اور خراب زرخیزی بیماری کو بگاڑتی ہے۔',
    solution: '1. Apply Mancozeb fungicide (2.5g/L) as foliar spray.\n2. Ensure balanced fertilization with adequate potassium (K).\n3. Use disease-free and treated seeds.\n4. Maintain proper water levels in paddies.\n5. Add silicon-based fertilizers to improve resistance.',
    solutionUrdu: '1. مینکوزیب فنگس مار دوا (2.5 گرام فی لیٹر) پتوں پر سپرے کریں۔\n2. متوازن کھاد ڈالیں خاص طور پر پوٹاشیم (کے) کافی مقدار میں۔\n3. بیماری سے پاک اور ٹریٹ شدہ بیج استعمال کریں۔\n4. کھیت میں پانی کی مناسب سطح برقرار رکھیں۔\n5. مزاحمت بڑھانے کے لیے سلیکون والی کھاد ڈالیں۔',
    severity: 'medium',
    keywords: ['brown', 'spot', 'rice', 'oval', 'gray center', 'discolored']
  },
  // ========== COTTON DISEASES ==========
  {
    id: 'cotton_leaf_curl',
    crop: 'Cotton',
    cropUrdu: 'کپاس',
    name: 'Cotton Leaf Curl Virus (CLCuV)',
    nameUrdu: 'کپاس کے پتوں کا مروڑ وائرس',
    symptoms: 'Leaves curl upward, thicken, and develop dark green vein swelling. Small leaf-like outgrowths (enations) appear on undersides. Stunted growth and reduced boll formation.',
    symptomsUrdu: 'پتے اوپر کی طرف مڑ جاتے ہیں، موٹے ہو جاتے ہیں اور رگوں پر گہری سبز سوجن آ جاتی ہے۔ پتوں کی نچلی سطح پر چھوٹے پتے نما ابھار بنتے ہیں۔ پودے کی نشوونما رک جاتی ہے اور ٹینڈے کم بنتے ہیں۔',
    cause: 'Caused by Cotton Leaf Curl Virus transmitted by whitefly (Bemisia tabaci). Whiteflies suck plant sap and spread the virus from plant to plant. Hot dry weather (30-35°C) favors whitefly multiplication.',
    causeUrdu: 'کاٹن لیف کرل وائرس سے ہوتی ہے جو سفید مکھی (بیمیسیا ٹبیسی) سے پھیلتی ہے۔ سفید مکھیاں پودے کا رس چوستی ہیں اور وائرس ایک پودے سے دوسرے میں منتقل کرتی ہیں۔ گرم خشک موسم (30-35 ڈگری) سفید مکھی کی افزائش بڑھاتا ہے۔',
    solution: '1. Spray Imidacloprid or Acetamiprid to control whiteflies.\n2. Use CLCuV-resistant cotton varieties (FH-142, MNH-886, NIAB-878).\n3. Install yellow sticky traps to monitor whitefly population.\n4. Uproot and destroy severely infected plants early.\n5. Avoid late sowing as whitefly population peaks in late season.\n6. Maintain clean fields - remove weeds that host whiteflies.',
    solutionUrdu: '1. سفید مکھی کے خاتمے کے لیے امیڈاکلوپرڈ یا ایسٹامپرڈ سپرے کریں۔\n2. وائرس مزاحم کپاس کی اقسام لگائیں (ایف ایچ-142، ایم این ایچ-886، نیاب-878)۔\n3. سفید مکھی کی نگرانی کے لیے پیلے چپکنے والے ٹریپ لگائیں۔\n4. شدید متاثرہ پودوں کو جلد اکھاڑ کر تلف کریں۔\n5. دیر سے بجائی سے بچیں کیونکہ موسم کے آخر میں سفید مکھی زیادہ ہوتی ہے۔\n6. کھیت صاف رکھیں - سفید مکھی والی جڑی بوٹیاں نکالیں۔',
    severity: 'high',
    keywords: ['curl', 'cotton', 'whitefly', 'vein', 'thicken', 'enation', 'stunted']
  },
  {
    id: 'cotton_boll_rot',
    crop: 'Cotton',
    cropUrdu: 'کپاس',
    name: 'Cotton Boll Rot',
    nameUrdu: 'کپاس کے ٹینڈے کی سڑاند',
    symptoms: 'Bolls turn brown/black and become soft and mushy. White or pink fungal growth visible on bolls. Fibers inside become discolored and damaged.',
    symptomsUrdu: 'ٹینڈے بھورے/سیاہ ہو کر نرم اور گلے سڑے ہو جاتے ہیں۔ ٹینڈوں پر سفید یا گلابی فنگس نظر آتی ہے۔ اندر کے ریشے بدرنگ اور خراب ہو جاتے ہیں۔',
    cause: 'Caused by multiple fungi (Aspergillus, Fusarium). Occurs during heavy rainfall, high humidity, and waterlogging. Insect damage (bollworm) creates entry points for fungi.',
    causeUrdu: 'کئی فنگس (ایسپرجیلس، فیوزیریم) سے ہوتی ہے۔ شدید بارش، زیادہ نمی اور پانی کھڑا ہونے سے ہوتی ہے۔ کیڑوں (بال ورم) سے ٹینڈوں پر زخم بنتے ہیں جن سے فنگس داخل ہوتی ہے۔',
    solution: '1. Apply Copper Oxychloride spray on bolls.\n2. Improve field drainage to prevent waterlogging.\n3. Control bollworms with appropriate insecticides.\n4. Pick mature bolls timely, don\'t leave them in wet conditions.\n5. Maintain proper plant spacing for air circulation.',
    solutionUrdu: '1. ٹینڈوں پر کاپر آکسی کلورائیڈ سپرے کریں۔\n2. پانی کی نکاسی بہتر بنائیں تاکہ پانی نہ کھڑا ہو۔\n3. مناسب کیڑے مار ادویات سے بال ورم کا خاتمہ کریں۔\n4. پکے ٹینڈے بروقت چنیں، نم حالات میں نہ چھوڑیں۔\n5. ہوا کی آمد کے لیے پودوں میں مناسب فاصلہ رکھیں۔',
    severity: 'medium',
    keywords: ['boll', 'rot', 'cotton', 'brown', 'black', 'soft', 'mushy', 'pink']
  },
  // ========== MANGO DISEASES ==========
  {
    id: 'mango_anthracnose',
    crop: 'Mango',
    cropUrdu: 'آم',
    name: 'Mango Anthracnose',
    nameUrdu: 'آم کا اینتھریکنوز',
    symptoms: 'Black/dark brown spots on leaves, flowers, and fruits. Flower blight causes flower drop. Fruit develops sunken dark lesions during ripening.',
    symptomsUrdu: 'پتوں، پھولوں اور پھلوں پر سیاہ/گہرے بھورے دھبے۔ پھولوں پر بلائیٹ سے پھول جھڑ جاتے ہیں۔ پکنے کے دوران پھل پر دھنسے ہوئے سیاہ دھبے بنتے ہیں۔',
    cause: 'Caused by Colletotrichum gloeosporioides fungus. Spreads in warm wet weather during flowering (rain + 25-30°C). High humidity and rain splash spread spores from infected to healthy parts.',
    causeUrdu: 'کولیٹوٹرائکم فنگس سے ہوتی ہے۔ پھول آنے کے دوران گرم نم موسم (بارش + 25-30 ڈگری) میں پھیلتی ہے۔ زیادہ نمی اور بارش کے چھینٹے بیضوں کو متاثرہ سے صحت مند حصوں تک پھیلاتے ہیں۔',
    solution: '1. Spray Carbendazim (Bavistin) at flowering and fruit set stage.\n2. Apply Copper-based fungicide before monsoon rains.\n3. Prune dead branches to improve air circulation.\n4. Collect and destroy fallen infected fruits and leaves.\n5. Apply post-harvest hot water treatment (52°C for 5 min) to fruits.\n6. Avoid overhead irrigation during flowering.',
    solutionUrdu: '1. پھول اور پھل بننے کے مرحلے پر کاربنڈازم (باوسٹن) سپرے کریں۔\n2. مانسون بارشوں سے پہلے تانبے والی فنگس مار دوا لگائیں۔\n3. مردہ شاخیں کاٹیں تاکہ ہوا گزر سکے۔\n4. گرے ہوئے متاثرہ پھل اور پتے جمع کر کے تلف کریں۔\n5. پھلوں کو کاٹنے کے بعد گرم پانی (52 ڈگری 5 منٹ) میں ڈبوئیں۔\n6. پھول آنے کے دوران اوپر سے پانی نہ دیں۔',
    severity: 'high',
    keywords: ['mango', 'black', 'spot', 'anthracnose', 'flower', 'drop', 'sunken', 'dark']
  },
  // ========== TOMATO DISEASES ==========
  {
    id: 'tomato_early_blight',
    crop: 'Tomato',
    cropUrdu: 'ٹماٹر',
    name: 'Early Blight of Tomato',
    nameUrdu: 'ٹماٹر کا ابتدائی جھلساؤ',
    symptoms: 'Dark brown circular spots with concentric rings (target-like pattern) on lower leaves first. Leaves yellow around spots and drop. Fruit develops dark sunken spots near stem.',
    symptomsUrdu: 'نچلے پتوں پر گہرے بھورے گول دھبے جن میں حلقے (نشانے جیسے) بنتے ہیں۔ دھبوں کے ارد گرد پتے پیلے ہو کر گرتے ہیں۔ پھل پر ڈنٹھل کے قریب گہرے دھنسے دھبے بنتے ہیں۔',
    cause: 'Caused by Alternaria solani fungus. Survives in soil and infected debris. Spreads through rain splash, wind, and contaminated tools. Warm humid weather (24-29°C) with alternating wet and dry periods favors it.',
    causeUrdu: 'الٹرنیریا سولانی فنگس سے ہوتی ہے۔ مٹی اور متاثرہ باقیات میں زندہ رہتی ہے۔ بارش کے چھینٹوں، ہوا اور آلودہ اوزاروں سے پھیلتی ہے۔ گرم نم موسم (24-29 ڈگری) جس میں تر اور خشک ادوار بدلتے ہوں بیماری بڑھاتا ہے۔',
    solution: '1. Spray Mancozeb or Chlorothalonil fungicide every 7-10 days.\n2. Remove and destroy lower infected leaves immediately.\n3. Mulch around plants to prevent soil splash.\n4. Use drip irrigation instead of overhead watering.\n5. Rotate crops - don\'t plant tomato/potato in same field consecutively.\n6. Stake plants to keep foliage off the ground.',
    solutionUrdu: '1. ہر 7-10 دن بعد مینکوزیب یا کلوروتھالونل فنگس مار دوا سپرے کریں۔\n2. نچلے متاثرہ پتے فوری نکال کر تلف کریں۔\n3. پودوں کے گرد ملچ بچھائیں تاکہ مٹی کے چھینٹے نہ لگیں۔\n4. اوپر سے پانی دینے کی بجائے ڈرپ آبپاشی استعمال کریں۔\n5. فصل بدلیں - ایک ہی کھیت میں لگاتار ٹماٹر/آلو نہ لگائیں۔\n6. پودوں کو سہارا دیں تاکہ پتے زمین سے نہ لگیں۔',
    severity: 'medium',
    keywords: ['tomato', 'blight', 'concentric', 'ring', 'target', 'brown', 'circular', 'early']
  },
  {
    id: 'tomato_late_blight',
    crop: 'Tomato',
    cropUrdu: 'ٹماٹر',
    name: 'Late Blight of Tomato',
    nameUrdu: 'ٹماٹر کا آخری جھلساؤ',
    symptoms: 'Large irregular water-soaked dark green/brown patches on leaves. White fuzzy mold visible on undersides in wet weather. Fruits develop firm brown irregular patches. Entire plant can collapse rapidly.',
    symptomsUrdu: 'پتوں پر بڑے بے ترتیب پانی بھرے گہرے سبز/بھورے دھبے۔ نم موسم میں نچلی سطح پر سفید روئیں دار پھپھوندی نظر آتی ہے۔ پھلوں پر سخت بھورے بے ترتیب دھبے بنتے ہیں۔ پورا پودا تیزی سے مر سکتا ہے۔',
    cause: 'Caused by Phytophthora infestans water mold. Extremely aggressive in cool wet weather (10-20°C). Spreads very rapidly through wind-borne spores during rain. Can destroy entire fields in days.',
    causeUrdu: 'فائیٹوفتھورا فنگس سے ہوتی ہے۔ ٹھنڈے نم موسم (10-20 ڈگری) میں انتہائی جارحانہ ہوتی ہے۔ بارش کے دوران ہوا سے اڑنے والے بیضوں سے بہت تیزی سے پھیلتی ہے۔ دنوں میں پورا کھیت تباہ کر سکتی ہے۔',
    solution: '1. IMMEDIATELY spray Metalaxyl + Mancozeb (Ridomil Gold) at first sign.\n2. Remove and destroy infected plants - do NOT compost.\n3. Improve air circulation with proper spacing and staking.\n4. Avoid overhead watering, use drip irrigation.\n5. Apply preventive copper fungicide before rainy season.\n6. Never work in field when plants are wet.',
    solutionUrdu: '1. پہلی علامت پر فوری طور پر میٹالیکسل + مینکوزیب (ریڈومل گولڈ) سپرے کریں۔\n2. متاثرہ پودے نکال کر تلف کریں - کمپوسٹ نہ بنائیں۔\n3. مناسب فاصلے اور سہارے سے ہوا کی آمد بہتر بنائیں۔\n4. اوپر سے پانی نہ دیں، ڈرپ آبپاشی استعمال کریں۔\n5. بارش کے موسم سے پہلے تانبے والی فنگس مار دوا کا بچاؤ سپرے کریں۔\n6. جب پودے گیلے ہوں تو کھیت میں کام نہ کریں۔',
    severity: 'high',
    keywords: ['tomato', 'late blight', 'water-soaked', 'fuzzy', 'white mold', 'collapse', 'irregular']
  },
  // ========== POTATO DISEASES ==========
  {
    id: 'potato_late_blight',
    crop: 'Potato',
    cropUrdu: 'آلو',
    name: 'Potato Late Blight',
    nameUrdu: 'آلو کا لیٹ بلائیٹ',
    symptoms: 'Dark water-soaked lesions on leaf tips and edges. White mold on leaf undersides. Brown firm rot on tubers with granular rusty-brown flesh inside.',
    symptomsUrdu: 'پتوں کے کناروں اور نوکوں پر گہرے پانی بھرے دھبے۔ پتوں کی نچلی سطح پر سفید پھپھوندی۔ آلو پر بھورا سخت سڑاند جس کے اندر دانے دار زنگ آلود بھورا گودا ہو۔',
    cause: 'Caused by Phytophthora infestans. Same pathogen as tomato late blight. Spreads in cool wet conditions. Infected seed tubers are the main source.',
    causeUrdu: 'فائیٹوفتھورا انفیسٹینز سے ہوتی ہے۔ ٹماٹر کے لیٹ بلائیٹ جیسی ہی بیماری۔ ٹھنڈے نم حالات میں پھیلتی ہے۔ متاثرہ بیج آلو بنیادی ذریعہ ہیں۔',
    solution: '1. Plant certified disease-free seed tubers.\n2. Spray Ridomil Gold (Metalaxyl + Mancozeb) preventively.\n3. Hill up soil around plants to protect tubers.\n4. Destroy infected plant tops before harvesting.\n5. Harvest in dry weather and cure tubers before storage.',
    solutionUrdu: '1. تصدیق شدہ بیماری سے پاک بیج آلو لگائیں۔\n2. بچاؤ کے طور پر ریڈومل گولڈ (میٹالیکسل + مینکوزیب) سپرے کریں۔\n3. آلوؤں کی حفاظت کے لیے پودوں کے گرد مٹی چڑھائیں۔\n4. کٹائی سے پہلے متاثرہ بوٹیاں تلف کریں۔\n5. خشک موسم میں کھودیں اور ذخیرہ سے پہلے آلو سکھائیں۔',
    severity: 'high',
    keywords: ['potato', 'blight', 'dark', 'water-soaked', 'white mold', 'tuber', 'rot']
  },
  // ========== SUGARCANE DISEASES ==========
  {
    id: 'sugarcane_red_rot',
    crop: 'Sugarcane',
    cropUrdu: 'گنا',
    name: 'Red Rot of Sugarcane',
    nameUrdu: 'گنے کی سرخ سڑاند',
    symptoms: 'Leaves dry from tip downwards turning straw-colored. Splitting the cane reveals red discoloration of internal tissues with white patches. Cane has alcoholic smell. Stunted growth.',
    symptomsUrdu: 'پتے نوک سے نیچے کی طرف سوکھ کر بھوسے کے رنگ کے ہو جاتے ہیں۔ گنا چیرنے پر اندرونی حصے سرخ ہو جاتے ہیں سفید دھبوں کے ساتھ۔ گنے سے شراب جیسی بو آتی ہے۔ نشوونما رک جاتی ہے۔',
    cause: 'Caused by Colletotrichum falcatum fungus. Enters through wounds from borers or cutting. Infected seed cane (setts) is the primary source. Waterlogged conditions and hot humid weather promote it.',
    causeUrdu: 'کولیٹوٹرائکم فالکیٹم فنگس سے ہوتی ہے۔ بورر کیڑوں یا کاٹنے سے بنے زخموں سے داخل ہوتی ہے۔ متاثرہ بیج گنا (سیٹ) بنیادی ذریعہ ہے۔ پانی بھرے حالات اور گرم نم موسم بیماری بڑھاتے ہیں۔',
    solution: '1. Use disease-free healthy seed cane (setts) from certified sources.\n2. Treat setts with Carbendazim (1g/L) by soaking for 30 minutes before planting.\n3. Remove and burn infected canes immediately.\n4. Ensure proper field drainage.\n5. Grow resistant varieties (HSF-240, CPF-237).\n6. Avoid ratooning from infected fields.',
    solutionUrdu: '1. تصدیق شدہ ذرائع سے بیماری سے پاک صحت مند بیج گنا استعمال کریں۔\n2. بجائی سے پہلے سیٹوں کو کاربنڈازم (1 گرام فی لیٹر) میں 30 منٹ بھگوئیں۔\n3. متاثرہ گنے فوری نکال کر جلا دیں۔\n4. کھیت کی نکاسی آب مناسب رکھیں۔\n5. مزاحم اقسام لگائیں (ایچ ایس ایف-240، سی پی ایف-237)۔\n6. متاثرہ کھیت سے مونڈھی فصل نہ لیں۔',
    severity: 'high',
    keywords: ['sugarcane', 'red', 'rot', 'straw', 'white patches', 'alcoholic', 'smell']
  },
  // ========== GENERAL / COMMON ==========
  {
    id: 'powdery_mildew',
    crop: 'Multiple (Wheat, Vegetables, Mango)',
    cropUrdu: 'متعدد فصلیں',
    name: 'Powdery Mildew',
    nameUrdu: 'سفید چورنی پھپھوندی',
    symptoms: 'White powdery fungal coating on upper surface of leaves. Leaves curl, turn yellow, and die. Affects wheat, peas, mango, cucurbits, and many vegetables.',
    symptomsUrdu: 'پتوں کی اوپری سطح پر سفید پاؤڈر نما فنگس کی تہہ۔ پتے مڑ کر پیلے ہو جاتے ہیں اور مر جاتے ہیں۔ گندم، مٹر، آم، کدو اور بہت سی سبزیوں کو متاثر کرتی ہے۔',
    cause: 'Caused by various Erysiphe fungi species. Spreads in dry warm days and cool nights. Unlike most fungi, does NOT need free water - spreads in dry conditions with moderate humidity (50-70%).',
    causeUrdu: 'ایریسیفے فنگس کی مختلف اقسام سے ہوتی ہے۔ خشک گرم دن اور ٹھنڈی راتوں میں پھیلتی ہے۔ دوسری فنگس کے برعکس اسے پانی کی ضرورت نہیں - خشک حالات میں معتدل نمی (50-70%) میں پھیلتی ہے۔',
    solution: '1. Spray Sulfur-based fungicide (Thiovit) or Karathane.\n2. Apply Neem oil spray (5ml/L) as organic alternative.\n3. Remove heavily infected leaves.\n4. Ensure adequate plant spacing.\n5. Avoid excessive nitrogen fertilizer.\n6. Water at base of plants, not on foliage.',
    solutionUrdu: '1. سلفر والی فنگس مار دوا (تھیوویٹ) یا کراتھین سپرے کریں۔\n2. نامیاتی متبادل کے طور پر نیم کے تیل کا سپرے (5 ملی لیٹر فی لیٹر) کریں۔\n3. شدید متاثرہ پتے نکال دیں۔\n4. پودوں میں مناسب فاصلہ رکھیں۔\n5. نائٹروجن کھاد زیادہ نہ ڈالیں۔\n6. پتوں پر نہیں بلکہ پودوں کی جڑوں میں پانی دیں۔',
    severity: 'medium',
    keywords: ['powdery', 'mildew', 'white', 'powder', 'coating', 'curl']
  },
  {
    id: 'bacterial_leaf_blight',
    crop: 'Rice',
    cropUrdu: 'چاول',
    name: 'Bacterial Leaf Blight',
    nameUrdu: 'بیکٹیریل پتوں کا جھلساؤ',
    symptoms: 'Water-soaked yellow stripes along leaf margins that turn white/gray. Milky bacterial ooze visible on leaves in morning. Leaves dry up from tips and edges.',
    symptomsUrdu: 'پتوں کے کناروں پر پانی بھری پیلی دھاریاں جو سفید/سلیٹی ہو جاتی ہیں۔ صبح کے وقت پتوں پر دودھیا بیکٹیریا کا رساؤ نظر آتا ہے۔ پتے نوکوں اور کناروں سے سوکھ جاتے ہیں۔',
    cause: 'Caused by Xanthomonas oryzae bacteria. Enters through wounds and natural openings. Spreads through irrigation water, rain splash, and infected seeds. Monsoon flooding worsens it.',
    causeUrdu: 'زینتھوموناس اورائزے بیکٹیریا سے ہوتی ہے۔ زخموں اور قدرتی سوراخوں سے داخل ہوتا ہے۔ آبپاشی کے پانی، بارش کے چھینٹوں اور متاثرہ بیجوں سے پھیلتا ہے۔ مانسون سیلاب بیماری بگاڑتا ہے۔',
    solution: '1. Use resistant rice varieties.\n2. Avoid excess nitrogen fertilizer (promotes lush growth susceptible to bacteria).\n3. Drain fields periodically.\n4. Use balanced potassium fertilization to strengthen plants.\n5. Apply Streptomycin sulfate spray in severe cases.\n6. Use certified disease-free seeds.',
    solutionUrdu: '1. مزاحم چاول کی اقسام استعمال کریں۔\n2. زیادہ نائٹروجن کھاد سے بچیں (زیادہ نشوونما بیکٹیریا کو آسانی دیتی ہے)۔\n3. وقفے وقفے سے کھیت کا پانی نکالیں۔\n4. پودوں کو مضبوط کرنے کے لیے متوازن پوٹاشیم کھاد ڈالیں۔\n5. شدید صورت میں سٹریپٹومائسن سلفیٹ سپرے کریں۔\n6. تصدیق شدہ بیماری سے پاک بیج استعمال کریں۔',
    severity: 'high',
    keywords: ['bacterial', 'blight', 'rice', 'yellow', 'stripe', 'ooze', 'milky', 'white']
  }
];

/**
 * Analyze uploaded image and detect disease
 * Uses keyword matching from user description + image filename hints
 * In production, this would connect to a trained ML model
 */
function detectDisease(description = '', cropHint = '') {
  const text = `${description} ${cropHint}`.toLowerCase();

  let bestMatch = null;
  let bestScore = 0;

  for (const disease of diseaseDatabase) {
    let score = 0;

    // Match keywords
    for (const keyword of disease.keywords) {
      if (text.includes(keyword.toLowerCase())) {
        score += 10;
      }
    }

    // Match crop name
    if (text.includes(disease.crop.toLowerCase())) {
      score += 15;
    }

    // Match symptom words
    const symptomWords = disease.symptoms.toLowerCase().split(/\s+/);
    for (const word of symptomWords) {
      if (word.length > 4 && text.includes(word)) {
        score += 3;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestMatch = disease;
    }
  }

  // If no good match, return the most common disease as default
  if (!bestMatch || bestScore < 5) {
    // Return based on crop hint or default
    if (text.includes('wheat') || text.includes('گندم')) {
      // Pick specific rust based on keywords in text
      if (text.includes('stripe') || text.includes('yellow') || text.includes('پیلی')) {
        bestMatch = diseaseDatabase.find(d => d.id === 'wheat_stripe_rust');
      } else if (text.includes('stem') || text.includes('black') || text.includes('کالی')) {
        bestMatch = diseaseDatabase.find(d => d.id === 'wheat_stem_rust');
      } else {
        bestMatch = diseaseDatabase.find(d => d.id === 'wheat_leaf_rust');
      }
    } else if (text.includes('rice') || text.includes('چاول')) {
      bestMatch = diseaseDatabase.find(d => d.id === 'rice_blast');
    } else if (text.includes('cotton') || text.includes('کپاس')) {
      bestMatch = diseaseDatabase.find(d => d.id === 'cotton_leaf_curl');
    } else if (text.includes('tomato') || text.includes('ٹماٹر')) {
      bestMatch = diseaseDatabase.find(d => d.id === 'tomato_early_blight');
    } else if (text.includes('mango') || text.includes('آم')) {
      bestMatch = diseaseDatabase.find(d => d.id === 'mango_anthracnose');
    } else if (text.includes('potato') || text.includes('آلو')) {
      bestMatch = diseaseDatabase.find(d => d.id === 'potato_late_blight');
    } else if (text.includes('sugarcane') || text.includes('گنا')) {
      bestMatch = diseaseDatabase.find(d => d.id === 'sugarcane_red_rot');
    } else {
      bestMatch = diseaseDatabase[0]; // Default
    }
  }

  return {
    disease: bestMatch,
    confidence: Math.min(95, Math.max(60, bestScore * 3 + 50))
  };
}

/**
 * Chat about farming / disease questions
 * Returns relevant disease info based on the question
 */
function chatResponse(question, language = 'en') {
  const q = question.toLowerCase();
  const isUrdu = language === 'ur';

  // Find relevant disease based on question
  let matched = null;
  let bestScore = 0;

  for (const disease of diseaseDatabase) {
    let score = 0;
    const allText = `${disease.name} ${disease.symptoms} ${disease.nameUrdu} ${disease.symptomsUrdu} ${disease.crop}`.toLowerCase();

    const words = q.split(/\s+/);
    for (const word of words) {
      if (word.length > 2 && allText.includes(word)) {
        score += 5;
      }
    }
    for (const kw of disease.keywords) {
      if (q.includes(kw)) score += 10;
    }

    if (score > bestScore) {
      bestScore = score;
      matched = disease;
    }
  }

  if (matched && bestScore >= 5) {
    if (isUrdu) {
      return `🌿 **${matched.nameUrdu}** (${matched.cropUrdu})\n\n` +
        `🔍 **علامات:** ${matched.symptomsUrdu}\n\n` +
        `❓ **یہ کیوں پھیلتی ہے:** ${matched.causeUrdu}\n\n` +
        `✅ **علاج:** \n${matched.solutionUrdu}`;
    } else {
      return `🌿 **${matched.name}** (${matched.crop})\n\n` +
        `🔍 **Symptoms:** ${matched.symptoms}\n\n` +
        `❓ **Why it spreads:** ${matched.cause}\n\n` +
        `✅ **Solution:** \n${matched.solution}`;
    }
  }

  // General farming advice
  if (isUrdu) {
    if (q.includes('کھاد') || q.includes('fertilizer')) {
      return '🌱 **کھاد کا مشورہ:**\n\nمتوازن کھاد استعمال کریں۔ نائٹروجن، فاسفورس اور پوٹاشیم (NPK) کا صحیح تناسب رکھیں۔ زیادہ نائٹروجن بیماریوں کو بڑھاتی ہے۔ مٹی کا ٹیسٹ کرائیں تاکہ صحیح مقدار معلوم ہو سکے۔';
    }
    if (q.includes('پانی') || q.includes('آبپاشی') || q.includes('irrigation')) {
      return '💧 **آبپاشی کا مشورہ:**\n\nصبح سویرے پانی دیں۔ ڈرپ آبپاشی بہترین ہے۔ پتوں پر پانی نہ پڑنے دیں۔ زیادہ پانی سے جڑ سڑاند ہو سکتی ہے۔ کھیت کی نکاسی آب اچھی رکھیں۔';
    }
    return '🤖 میں فصلوں کی بیماریوں کے بارے میں مدد کر سکتا ہوں۔ براہ کرم بتائیں:\n- کون سی فصل متاثر ہے؟\n- پتوں/پھلوں پر کیا علامات ہیں؟\n- کیا رنگ نظر آ رہے ہیں؟\n\nمثال: "گندم کے پتوں پر بھورے دھبے" یا "ٹماٹر کے پتے مڑ رہے ہیں"';
  } else {
    if (q.includes('fertilizer') || q.includes('nutrient')) {
      return '🌱 **Fertilizer Advice:**\n\nUse balanced NPK fertilization. Excessive nitrogen promotes disease susceptibility. Get your soil tested to know exact requirements. Apply fertilizer in split doses for better absorption.';
    }
    if (q.includes('water') || q.includes('irrigation')) {
      return '💧 **Irrigation Advice:**\n\nWater early morning. Drip irrigation is most efficient. Avoid wetting foliage. Overwatering causes root rot. Ensure proper field drainage.';
    }
    return '🤖 I can help with crop disease identification and treatment. Please tell me:\n- Which crop is affected?\n- What symptoms do you see on leaves/fruits?\n- What colors/patterns are visible?\n\nExample: "brown spots on wheat leaves" or "tomato leaves curling"';
  }
}

/**
 * Get all diseases for a specific crop
 */
function getDiseasesByCrop(crop) {
  return diseaseDatabase.filter(d =>
    d.crop.toLowerCase().includes(crop.toLowerCase()) ||
    d.cropUrdu.includes(crop)
  );
}

module.exports = { detectDisease, chatResponse, getDiseasesByCrop, diseaseDatabase };
