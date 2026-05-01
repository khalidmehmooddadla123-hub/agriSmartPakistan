import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Input } from '../components/ui/FormControls';
import {
  FiSearch, FiHelpCircle, FiChevronDown, FiMail, FiPhone,
  FiMessageSquare, FiBook, FiPlay, FiExternalLink
} from 'react-icons/fi';

const FAQS = [
  {
    category: 'Getting Started', categoryUr: 'شروع کرنا',
    items: [
      {
        q: 'How do I add my first farm?',
        qUr: 'پہلا فارم کیسے شامل کروں؟',
        a: 'Go to "My Farms" in the sidebar → click "Add Farm" button → fill in name, location, area, soil type, and irrigation source. You can add up to unlimited farms.',
        aUr: 'سائڈبار میں "میرے فارم" پر جائیں → "نیا فارم" پر کلک کریں → نام، مقام، رقبہ، مٹی کی قسم اور آبپاشی کا ذریعہ بھریں۔ آپ لامحدود فارمز شامل کر سکتے ہیں۔'
      },
      {
        q: 'Is AgriSmart360 really free?',
        qUr: 'کیا AgriSmart360 واقعی مفت ہے؟',
        a: 'Yes, all features are 100% free. No hidden charges, no subscription, no premium tier. Built specifically for Pakistani farmers as a Final Year Project at IUB.',
        aUr: 'جی ہاں، تمام فیچرز 100% مفت ہیں۔ کوئی چھپی ہوئی فیس نہیں، کوئی سبسکرپشن نہیں۔ پاکستانی کسانوں کے لیے IUB میں FYP کے طور پر بنایا گیا۔'
      },
      {
        q: 'Can I use this on my phone?',
        qUr: 'کیا یہ موبائل پر چلے گا؟',
        a: 'Yes! AgriSmart360 works perfectly on phones, tablets, and computers. You can also "Install" it as an app on your phone for offline access.',
        aUr: 'جی ہاں! AgriSmart360 موبائل، ٹیبلٹ اور کمپیوٹر پر بالکل کام کرتا ہے۔ آپ اسے فون پر ایپ کے طور پر بھی انسٹال کر سکتے ہیں۔'
      },
    ]
  },
  {
    category: 'Crop Prices & Weather', categoryUr: 'فصل کی قیمت اور موسم',
    items: [
      {
        q: 'How often are prices updated?',
        qUr: 'قیمتیں کتنی بار اپ ڈیٹ ہوتی ہیں؟',
        a: 'Crop prices update every 30 minutes automatically. You can see the "Last Updated" time on each price card.',
        aUr: 'فصل کی قیمتیں ہر 30 منٹ بعد خود بخود اپ ڈیٹ ہوتی ہیں۔ ہر قیمت کارڈ پر "آخری اپ ڈیٹ" کا وقت نظر آتا ہے۔'
      },
      {
        q: 'How do I get price alerts?',
        qUr: 'قیمت کے الرٹس کیسے ملیں گے؟',
        a: 'In Profile → Notifications, enable Email or SMS alerts. Then in your daily digest, you\'ll receive prices for crops you\'ve selected.',
        aUr: 'پروفائل → اطلاعات میں جا کر ای میل یا SMS فعال کریں۔ پھر آپ کو روزانہ منتخب فصلوں کی قیمتیں ملیں گی۔'
      },
      {
        q: 'Where does weather data come from?',
        qUr: 'موسم کا ڈیٹا کہاں سے آتا ہے؟',
        a: 'We use OpenWeatherMap, the same source used by professional meteorologists. Updates every 30 minutes for your selected location.',
        aUr: 'ہم OpenWeatherMap استعمال کرتے ہیں — وہی ذریعہ جو پیشہ ور موسمیات کے ماہر استعمال کرتے ہیں۔'
      },
    ]
  },
  {
    category: 'AI & Disease Detection', categoryUr: 'AI اور بیماری کی تشخیص',
    items: [
      {
        q: 'How accurate is the AI disease detection?',
        qUr: 'AI کی تشخیص کتنی درست ہے؟',
        a: 'Our system combines Hugging Face image ML + Google Gemini AI for ~90% accuracy on common diseases. For best results, take a clear photo in daylight and add symptom description.',
        aUr: 'ہمارا سسٹم Hugging Face ML + Google Gemini AI استعمال کرتا ہے، جو عام بیماریوں پر ~90% درست ہے۔ بہترین نتائج کے لیے دن کی روشنی میں صاف تصویر لیں اور علامات بھی لکھیں۔'
      },
      {
        q: 'Can I ask the chatbot in Urdu?',
        qUr: 'کیا میں چیٹ بوٹ سے اردو میں پوچھ سکتا ہوں؟',
        a: 'Yes! The AI chatbot supports both Urdu and English perfectly. You can also click the microphone icon to speak instead of typing.',
        aUr: 'جی ہاں! AI چیٹ بوٹ اردو اور انگریزی دونوں میں مکمل کام کرتا ہے۔ آپ مائیکرو فون آئیکن کلک کرکے بول بھی سکتے ہیں۔'
      },
      {
        q: 'What if AI gives wrong diagnosis?',
        qUr: 'اگر AI غلط تشخیص دے تو؟',
        a: 'Always verify with a local agriculture expert before applying chemicals. The AI is a guide, not a replacement. Use the Community Forum to ask other farmers.',
        aUr: 'ادویات استعمال کرنے سے پہلے ہمیشہ مقامی زرعی ماہر سے تصدیق کریں۔ AI رہنمائی ہے، متبادل نہیں۔ کمیونٹی فورم پر دوسرے کسانوں سے بھی پوچھیں۔'
      },
    ]
  },
  {
    category: 'Marketplace & Equipment', categoryUr: 'بازار اور مشینری',
    items: [
      {
        q: 'How does the farmer marketplace work?',
        qUr: 'کسان بازار کیسے کام کرتا ہے؟',
        a: 'List your crops with photos and price → buyers contact you directly via phone/WhatsApp/email. No middleman, no commission. AgriSmart360 only connects you.',
        aUr: 'اپنی فصل کی تصویر اور قیمت کے ساتھ فہرست بنائیں → خریدار آپ سے براہ راست فون/واٹس ایپ/ای میل پر رابطہ کریں گے۔ کوئی درمیانی نہیں، کوئی کمیشن نہیں۔'
      },
      {
        q: 'Is it safe to share my phone number?',
        qUr: 'کیا اپنا فون نمبر شیئر کرنا محفوظ ہے؟',
        a: 'Only people who actively click "Contact" see your number. Use WhatsApp option for safer messaging. Do not share OTPs or banking info with anyone.',
        aUr: 'صرف وہی لوگ آپ کا نمبر دیکھ سکتے ہیں جو "رابطہ" کلک کرتے ہیں۔ محفوظ پیغام رسانی کے لیے واٹس ایپ استعمال کریں۔ OTP یا بینک کی معلومات کبھی کسی کو نہ دیں۔'
      },
      {
        q: 'How do I rent out my tractor?',
        qUr: 'اپنا ٹریکٹر کرایہ پر کیسے دوں؟',
        a: 'Go to Equipment Rental → click "List" → fill type, model, daily rate, and photos. Other farmers in your area will see and contact you.',
        aUr: 'مشینری کرایہ → "فہرست" پر کلک کریں → قسم، ماڈل، روزانہ کرایہ اور تصاویر بھریں۔ آپ کے علاقے کے کسان آپ سے رابطہ کریں گے۔'
      },
    ]
  },
  {
    category: 'Tools & Calculators', categoryUr: 'ٹولز اور کیلکولیٹرز',
    items: [
      {
        q: 'How accurate are the calculators?',
        qUr: 'کیلکولیٹرز کتنے درست ہیں؟',
        a: 'Calculators use established agronomy formulas (Penman-Monteith for irrigation, Hargreaves for ET) plus Gemini AI for Pakistan-specific recommendations. Treat results as professional guidance.',
        aUr: 'کیلکولیٹرز پیشہ ور زرعی فارمولے استعمال کرتے ہیں + Gemini AI پاکستانی سفارشات کے لیے۔ نتائج کو پیشہ ور رہنمائی سمجھیں۔'
      },
      {
        q: 'Why is the Zakat calculator showing 5% sometimes and 10% other times?',
        qUr: 'زکوٰۃ کیلکولیٹر کبھی 5% کبھی 10% کیوں دکھاتا ہے؟',
        a: 'Per Islamic jurisprudence: 10% (Ushar) for rain-fed land (no irrigation cost), 5% (Nisf-Ushar) for tube-well/canal irrigated land where you spent on water.',
        aUr: 'اسلامی فقہ کے مطابق: 10% (عشر) بارانی زمین کے لیے، 5% (نصف عشر) ٹیوب ویل/نہر کی آبپاشی والی زمین کے لیے۔'
      },
    ]
  },
  {
    category: 'Account & Privacy', categoryUr: 'اکاؤنٹ اور پرائیویسی',
    items: [
      {
        q: 'How do I change my password?',
        qUr: 'پاس ورڈ کیسے تبدیل کروں؟',
        a: 'Go to Profile → Security tab → fill current and new password → click "Change Password".',
        aUr: 'پروفائل → سیکیورٹی ٹیب پر جائیں → موجودہ اور نیا پاس ورڈ بھریں → "پاس ورڈ تبدیل کریں" پر کلک کریں۔'
      },
      {
        q: 'I forgot my password!',
        qUr: 'میں پاس ورڈ بھول گیا!',
        a: 'On the login page, click "Forgot Password" → enter your email → check inbox for reset link (also check spam folder).',
        aUr: 'لاگ ان صفحہ پر "پاس ورڈ بھول گئے" کلک کریں → ای میل درج کریں → ان باکس چیک کریں (سپیم فولڈر بھی)۔'
      },
      {
        q: 'How do I delete my account?',
        qUr: 'اکاؤنٹ کیسے حذف کروں؟',
        a: 'Email admin@agrismart360.com from your registered email with "Account Deletion Request" subject. Account + all data deleted within 7 days.',
        aUr: 'admin@agrismart360.com پر اپنی رجسٹرڈ ای میل سے "Account Deletion Request" کے ساتھ ای میل بھیجیں۔ 7 دن میں اکاؤنٹ + ڈیٹا حذف ہو جائے گا۔'
      },
    ]
  }
];

export default function Help() {
  const { i18n } = useTranslation();
  const isUrdu = i18n.language === 'ur';
  const [search, setSearch] = useState('');
  const [openItem, setOpenItem] = useState(null);

  const filtered = FAQS.map(cat => ({
    ...cat,
    items: cat.items.filter(item => {
      if (!search) return true;
      const q = search.toLowerCase();
      return item.q.toLowerCase().includes(q) ||
             item.a.toLowerCase().includes(q) ||
             item.qUr.includes(search) ||
             item.aUr.includes(search);
    })
  })).filter(cat => cat.items.length > 0);

  return (
    <div className="space-y-4 sm:space-y-5 animate-fade-in-up max-w-4xl mx-auto">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-7 text-white card-elevated">
        <div className="absolute top-0 right-0 rtl:left-0 rtl:right-auto w-44 sm:w-60 h-44 sm:h-60 bg-white/10 rounded-full -mr-16 sm:-mr-20 -mt-16 sm:-mt-20 blur-2xl" />
        <div className="relative">
          <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 backdrop-blur rounded-xl sm:rounded-2xl flex items-center justify-center text-2xl sm:text-3xl shrink-0">💡</div>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">
                {isUrdu ? 'مدد اور سوالات' : 'Help & FAQ'}
              </h1>
              <p className="text-blue-100 text-xs sm:text-sm mt-1">
                {isUrdu
                  ? 'AgriSmart360 کے بارے میں عام سوال + جواب'
                  : 'Common questions & answers about AgriSmart360'}
              </p>
            </div>
          </div>
          <div className="relative">
            <FiSearch className="absolute left-3.5 rtl:right-3.5 rtl:left-auto top-1/2 -translate-y-1/2 text-indigo-500" size={15} />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 rtl:pr-10 rtl:pl-4 pr-4 py-2.5 bg-white text-gray-800 rounded-xl text-sm focus:ring-4 focus:ring-white/30 outline-none placeholder:text-gray-400"
              placeholder={isUrdu ? 'سوال تلاش کریں...' : 'Search questions...'} />
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        {[
          { emoji: '🚀', en: 'Quick Start', ur: 'فوری شروع', cat: 'Getting Started' },
          { emoji: '💰', en: 'Prices Help', ur: 'قیمت مدد', cat: 'Crop Prices & Weather' },
          { emoji: '🤖', en: 'AI Help', ur: 'AI مدد', cat: 'AI & Disease Detection' },
          { emoji: '🛒', en: 'Marketplace', ur: 'بازار', cat: 'Marketplace & Equipment' },
        ].map((item, i) => (
          <button key={i} onClick={() => {
            const target = document.getElementById(item.cat);
            if (target) target.scrollIntoView({ behavior: 'smooth' });
          }}
            className="bg-white border border-gray-100 hover:border-blue-200 hover:shadow-md rounded-2xl p-3 sm:p-4 transition text-left">
            <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">{item.emoji}</div>
            <p className="font-semibold text-gray-900 text-xs sm:text-sm">{isUrdu ? item.ur : item.en}</p>
          </button>
        ))}
      </div>

      {/* FAQs */}
      {filtered.length === 0 ? (
        <Card>
          <div className="text-center py-8">
            <div className="text-5xl mb-2">🔍</div>
            <p className="text-gray-500 text-sm">{isUrdu ? 'کوئی سوال نہیں ملا' : 'No matching questions found'}</p>
            <p className="text-xs text-gray-400 mt-1">{isUrdu ? 'مختلف الفاظ آزمائیں' : 'Try different keywords'}</p>
          </div>
        </Card>
      ) : (
        filtered.map((cat, ci) => (
          <Card key={ci} title={`${isUrdu ? cat.categoryUr : cat.category}`}>
            <div id={cat.category} className="space-y-2">
              {cat.items.map((item, i) => {
                const itemId = `${ci}-${i}`;
                const isOpen = openItem === itemId;
                return (
                  <div key={i} className="border border-gray-100 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setOpenItem(isOpen ? null : itemId)}
                      className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-gray-50 hover:bg-gray-100 transition text-left rtl:text-right"
                    >
                      <span className="font-semibold text-gray-900 text-sm flex-1">
                        {isUrdu ? item.qUr : item.q}
                      </span>
                      <FiChevronDown size={16}
                        className={`text-gray-400 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isOpen && (
                      <div className="px-4 py-3.5 text-sm text-gray-700 leading-relaxed bg-white border-t border-gray-100 animate-fade-in-up">
                        {isUrdu ? item.aUr : item.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        ))
      )}

      {/* Contact section */}
      <Card>
        <h3 className="font-bold text-gray-900 text-base mb-1">📞 {isUrdu ? 'مزید مدد چاہیے؟' : 'Need more help?'}</h3>
        <p className="text-xs text-gray-500 mb-4">
          {isUrdu ? 'ہم سے رابطہ کرنے کے لیے یہ آپشنز استعمال کریں' : 'Reach out via any of these channels'}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <a href="mailto:admin@agrismart360.com" className="flex items-center gap-3 bg-blue-50 hover:bg-blue-100 p-3.5 rounded-xl transition group">
            <div className="w-10 h-10 bg-blue-100 group-hover:bg-blue-200 text-blue-600 rounded-lg flex items-center justify-center">
              <FiMail size={16} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] text-blue-700 font-semibold">Email</p>
              <p className="text-xs text-blue-900 truncate">admin@agrismart360.com</p>
            </div>
          </a>
          <a href="/forum" className="flex items-center gap-3 bg-pink-50 hover:bg-pink-100 p-3.5 rounded-xl transition group">
            <div className="w-10 h-10 bg-pink-100 group-hover:bg-pink-200 text-pink-600 rounded-lg flex items-center justify-center">
              <FiMessageSquare size={16} />
            </div>
            <div>
              <p className="text-[11px] text-pink-700 font-semibold">{isUrdu ? 'کمیونٹی' : 'Community'}</p>
              <p className="text-xs text-pink-900">{isUrdu ? 'فورم پر پوچھیں' : 'Ask the forum'}</p>
            </div>
          </a>
          <a href="/disease" className="flex items-center gap-3 bg-purple-50 hover:bg-purple-100 p-3.5 rounded-xl transition group">
            <div className="w-10 h-10 bg-purple-100 group-hover:bg-purple-200 text-purple-600 rounded-lg flex items-center justify-center">
              <FiHelpCircle size={16} />
            </div>
            <div>
              <p className="text-[11px] text-purple-700 font-semibold">AI {isUrdu ? 'مشیر' : 'Advisor'}</p>
              <p className="text-xs text-purple-900">{isUrdu ? '24/7 چیٹ بوٹ' : '24/7 chatbot'}</p>
            </div>
          </a>
        </div>
      </Card>
    </div>
  );
}
