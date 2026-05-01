import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiDroplet, FiZap, FiTrendingUp, FiRefreshCw, FiHeart, FiDollarSign, FiShoppingCart, FiMessageSquare, FiBook, FiArrowRight, FiCreditCard, FiSearch } from 'react-icons/fi';

const tools = [
  {
    path: '/tools/irrigation',
    icon: FiDroplet, color: 'from-blue-500 to-cyan-500',
    bg: 'bg-blue-50', text: 'text-blue-600',
    key: 'irrigation',
    titleEn: 'Smart Irrigation', titleUr: 'سمارٹ آبپاشی',
    descEn: 'Calculate exact water needs based on crop, soil & weather',
    descUr: 'فصل، مٹی اور موسم کی بنیاد پر پانی کی مقدار معلوم کریں',
    tag: 'Water Saver', tagUr: 'پانی بچائیں'
  },
  {
    path: '/tools/fertilizer',
    icon: FiZap, color: 'from-green-500 to-emerald-600',
    bg: 'bg-green-50', text: 'text-green-600',
    key: 'fertilizer',
    titleEn: 'Fertilizer Calculator', titleUr: 'کھاد کیلکولیٹر',
    descEn: 'NPK requirements with Pakistani brand recommendations',
    descUr: 'این پی کے کی ضرورت پاکستانی برانڈز کی سفارش کے ساتھ',
    tag: 'Saves Money', tagUr: 'پیسہ بچائیں'
  },
  {
    path: '/tools/yield',
    icon: FiTrendingUp, color: 'from-purple-500 to-pink-500',
    bg: 'bg-purple-50', text: 'text-purple-600',
    key: 'yield',
    titleEn: 'Yield Predictor', titleUr: 'پیداوار کا اندازہ',
    descEn: 'AI predicts expected harvest & revenue for your crop',
    descUr: 'AI آپ کی فصل کی متوقع پیداوار اور آمدنی بتاتا ہے',
    tag: 'AI Powered', tagUr: 'AI طاقتور'
  },
  {
    path: '/tools/rotation',
    icon: FiRefreshCw, color: 'from-amber-500 to-orange-500',
    bg: 'bg-amber-50', text: 'text-amber-600',
    key: 'rotation',
    titleEn: 'Crop Rotation', titleUr: 'فصل کی تبدیلی',
    descEn: 'Plan next crop for healthy soil & better profit',
    descUr: 'صحت مند مٹی اور بہتر منافع کے لیے اگلی فصل کی منصوبہ بندی',
    tag: 'Soil Health', tagUr: 'مٹی کی صحت'
  },
  {
    path: '/tools/zakat',
    icon: FiHeart, color: 'from-teal-500 to-green-500',
    bg: 'bg-teal-50', text: 'text-teal-600',
    key: 'zakat',
    titleEn: 'Zakat/Ushar Calculator', titleUr: 'زکوٰۃ/عشر کیلکولیٹر',
    descEn: 'Calculate obligatory Ushar on harvest per Islamic rules',
    descUr: 'اسلامی اصولوں کے مطابق فصل پر عشر کا حساب',
    tag: 'Islamic', tagUr: 'اسلامی'
  },
  {
    path: '/tools/loan',
    icon: FiCreditCard, color: 'from-blue-600 to-cyan-600',
    bg: 'bg-blue-50', text: 'text-blue-600',
    key: 'loan',
    titleEn: 'Loan & EMI Calculator', titleUr: 'قرض اور EMI',
    descEn: 'Calculate monthly EMI for ZTBL, HBL & Akhuwat agri loans',
    descUr: 'ZTBL، HBL، اخوت کے قرض کے لیے EMI کا حساب',
    tag: 'Finance', tagUr: 'مالیات'
  },
  {
    path: '/tools/identify',
    icon: FiSearch, color: 'from-purple-600 to-pink-600',
    bg: 'bg-purple-50', text: 'text-purple-600',
    key: 'identify',
    titleEn: 'AI Crop Identifier', titleUr: 'AI فصل کی شناخت',
    descEn: 'Upload a photo — AI tells you what crop it is',
    descUr: 'تصویر اپ لوڈ کریں — AI فصل پہچانے گا',
    tag: 'AI Vision', tagUr: 'AI ویژن'
  },
  {
    path: '/expenses',
    icon: FiDollarSign, color: 'from-red-500 to-pink-500',
    bg: 'bg-red-50', text: 'text-red-600',
    key: 'expenses',
    titleEn: 'Expense Tracker', titleUr: 'اخراجات کا ٹریکر',
    descEn: 'Track every rupee spent & calculate real profit',
    descUr: 'ہر روپیہ ٹریک کریں اور اصل منافع معلوم کریں',
    tag: 'Finance', tagUr: 'مالیات'
  },
  {
    path: '/marketplace',
    icon: FiShoppingCart, color: 'from-indigo-500 to-purple-500',
    bg: 'bg-indigo-50', text: 'text-indigo-600',
    key: 'marketplace',
    titleEn: 'Farmer Marketplace', titleUr: 'کسان بازار',
    descEn: 'Sell directly to buyers — skip the middleman',
    descUr: 'خریداروں کو براہ راست فروخت کریں — درمیانی نہیں',
    tag: 'Skip Middleman', tagUr: 'براہ راست فروخت'
  },
  {
    path: '/forum',
    icon: FiMessageSquare, color: 'from-pink-500 to-rose-500',
    bg: 'bg-pink-50', text: 'text-pink-600',
    key: 'forum',
    titleEn: 'Community Forum', titleUr: 'کمیونٹی فورم',
    descEn: 'Ask questions & learn from other Pakistani farmers',
    descUr: 'دوسرے پاکستانی کسانوں سے سوال پوچھیں اور سیکھیں',
    tag: 'Community', tagUr: 'کمیونٹی'
  },
  {
    path: '/subsidies',
    icon: FiBook, color: 'from-cyan-500 to-blue-500',
    bg: 'bg-cyan-50', text: 'text-cyan-600',
    key: 'subsidies',
    titleEn: 'Govt Subsidies', titleUr: 'حکومتی سبسڈیز',
    descEn: 'Find loans, schemes & financial support programs',
    descUr: 'قرض، اسکیمیں اور مالی امداد کے پروگرام تلاش کریں',
    tag: 'Free Money', tagUr: 'مفت رقم'
  }
];

export default function FarmTools() {
  const { i18n } = useTranslation();
  const isUrdu = i18n.language === 'ur';

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 text-white card-elevated">
        <div className="absolute top-0 right-0 rtl:left-0 rtl:right-auto w-44 sm:w-60 h-44 sm:h-60 bg-white/10 rounded-full -mr-16 sm:-mr-20 -mt-16 sm:-mt-20 blur-2xl" />
        <div className="absolute bottom-0 left-1/3 w-32 sm:w-40 h-32 sm:h-40 bg-emerald-300/20 rounded-full blur-2xl" />
        <div className="relative flex items-start gap-3 sm:gap-4">
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 backdrop-blur rounded-xl sm:rounded-2xl flex items-center justify-center text-2xl sm:text-3xl shrink-0">🧰</div>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">{isUrdu ? 'کسان ٹولز' : 'Farmer Tools'}</h1>
            <p className="text-green-100 text-xs sm:text-sm mt-1 max-w-xl">
              {isUrdu
                ? 'اسمارٹ فیصلوں کے لیے پیشہ ور کیلکولیٹرز'
                : 'Professional calculators & community for smarter farming'}
            </p>
            <div className="flex gap-1.5 sm:gap-2 mt-3 sm:mt-4 flex-wrap">
              <span className="bg-white/15 backdrop-blur border border-white/20 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-semibold">🧠 AI</span>
              <span className="bg-white/15 backdrop-blur border border-white/20 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-semibold">🇵🇰 Pakistan</span>
              <span className="bg-white/15 backdrop-blur border border-white/20 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-semibold">🆓 Free</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <Link
              key={tool.path}
              to={tool.path}
              className="group bg-white rounded-2xl border border-gray-100 hover:border-green-300 hover:shadow-lg transition-all duration-300 p-6 overflow-hidden relative"
            >
              {/* Gradient hover background */}
              <div className={`absolute top-0 right-0 rtl:left-0 rtl:right-auto w-32 h-32 bg-gradient-to-br ${tool.color} opacity-0 group-hover:opacity-10 rounded-full blur-3xl transition-opacity duration-500`} />

              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-14 h-14 ${tool.bg} ${tool.text} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <Icon size={26} />
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${tool.bg} ${tool.text}`}>
                    {isUrdu ? tool.tagUr : tool.tag}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-gray-800 mb-1.5">
                  {isUrdu ? tool.titleUr : tool.titleEn}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-4 min-h-[2.5rem]">
                  {isUrdu ? tool.descUr : tool.descEn}
                </p>

                <div className={`flex items-center gap-2 text-sm font-semibold ${tool.text} group-hover:gap-3 transition-all`}>
                  {isUrdu ? 'کھولیں' : 'Open Tool'}
                  <FiArrowRight size={16} className="rtl:rotate-180" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 flex items-start gap-4">
        <span className="text-3xl">💡</span>
        <div>
          <h4 className="font-semibold text-blue-900 mb-1">
            {isUrdu ? 'یہ ٹولز کیسے مدد کرتے ہیں؟' : 'How These Tools Help You'}
          </h4>
          <p className="text-sm text-blue-800 leading-relaxed">
            {isUrdu
              ? 'ہر ٹول پاکستانی کسانوں کے لیے خاص طور پر ڈیزائن کیا گیا ہے۔ AI کا استعمال کرکے آپ کی مخصوص صورتحال کے مطابق درست مشورہ ملتا ہے — مقامی برانڈز، روپے میں قیمتیں، اور اردو میں وضاحت۔'
              : 'Each tool is designed specifically for Pakistani farmers. AI-powered recommendations consider your unique situation — local brands, prices in PKR, and explanations in Urdu.'}
          </p>
        </div>
      </div>
    </div>
  );
}
