import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiBarChart2, FiCloud, FiSearch, FiFileText, FiBell, FiShield, FiGlobe, FiArrowRight, FiStar, FiUsers, FiMapPin, FiCheckCircle } from 'react-icons/fi';

export default function LandingPage() {
  const { t, i18n } = useTranslation();
  const isUrdu = i18n.language === 'ur';
  const toggleLang = () => i18n.changeLanguage(isUrdu ? 'en' : 'ur');

  const features = [
    { icon: FiBarChart2, color: 'bg-green-100 text-green-600', title: isUrdu ? 'ریئل ٹائم فصل کی قیمتیں' : 'Real-Time Crop Prices', desc: isUrdu ? 'بین الاقوامی، قومی اور مقامی منڈی کی قیمتیں فوری طور پر دیکھیں' : 'Track international, national & local mandi prices with 30-day trend charts' },
    { icon: FiCloud, color: 'bg-blue-100 text-blue-600', title: isUrdu ? 'موسم کی پیشگوئی' : '7-Day Weather Forecast', desc: isUrdu ? 'اپنے مقام کے مطابق موسم اور کاشتکاری مشورے' : 'Location-based weather with farming advisories & agricultural tips' },
    { icon: FiSearch, color: 'bg-purple-100 text-purple-600', title: isUrdu ? 'فصل کی بیماری کی تشخیص' : 'Disease Detection', desc: isUrdu ? 'تصویر اپ لوڈ کریں اور فوری بیماری کی تشخیص حاصل کریں' : 'Upload a leaf image & get instant diagnosis with treatment solutions' },
    { icon: FiFileText, color: 'bg-orange-100 text-orange-600', title: isUrdu ? 'زرعی خبریں' : 'Agriculture News', desc: isUrdu ? '7 زمروں میں تازہ ترین زرعی خبریں' : 'Curated news in 7 categories — policy, market trends, pest alerts & more' },
    { icon: FiBell, color: 'bg-red-100 text-red-600', title: isUrdu ? 'سمارٹ الرٹس' : 'Smart Alerts', desc: isUrdu ? 'قیمت اور موسم کے الرٹس ای میل اور ایس ایم ایس کے ذریعے' : 'Price & weather alerts via Email, SMS & in-app notifications' },
    { icon: FiGlobe, color: 'bg-teal-100 text-teal-600', title: isUrdu ? 'اردو اور انگریزی' : 'Bilingual Support', desc: isUrdu ? 'مکمل اردو اور انگریزی سپورٹ بشمول آواز' : 'Full English & Urdu support including text-to-speech for results' },
  ];

  const stats = [
    { value: '12+', label: isUrdu ? 'فصلیں ٹریک' : 'Crops Tracked' },
    { value: '50+', label: isUrdu ? 'بیماریوں کا ڈیٹا' : 'Disease Database' },
    { value: '12', label: isUrdu ? 'پاکستانی شہر' : 'Pakistan Cities' },
    { value: '24/7', label: isUrdu ? 'لائیو اپ ڈیٹس' : 'Live Updates' },
  ];

  const steps = [
    { num: '1', title: isUrdu ? 'اکاؤنٹ بنائیں' : 'Create Account', desc: isUrdu ? 'مفت رجسٹر کریں اور اپنا مقام منتخب کریں' : 'Sign up free & select your location and crops' },
    { num: '2', title: isUrdu ? 'فصلیں منتخب کریں' : 'Select Crops', desc: isUrdu ? 'اپنی دلچسپی کی فصلیں اور الرٹس سیٹ کریں' : 'Choose your crops & set price alert thresholds' },
    { num: '3', title: isUrdu ? 'فیصلے کریں' : 'Make Decisions', desc: isUrdu ? 'ریئل ٹائم ڈیٹا سے بہتر فیصلے کریں' : 'Use real-time data & AI to make smarter farming decisions' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-md border-b border-gray-100 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌾</span>
            <span className="text-xl font-bold text-green-700">{t('app.name')}</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={toggleLang} className="flex items-center gap-1 text-sm text-gray-500 hover:text-green-600 px-3 py-2 rounded-lg">
              <FiGlobe size={16} /> {isUrdu ? 'English' : 'اردو'}
            </button>
            <Link to="/login" className="text-sm font-medium text-gray-700 hover:text-green-600 px-3 py-2">
              {t('nav.login')}
            </Link>
            <Link to="/register" className="text-sm font-medium bg-green-600 text-white px-5 py-2.5 rounded-xl hover:bg-green-700 transition">
              {t('nav.register')}
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 bg-gradient-to-br from-green-50 via-white to-emerald-50">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 text-sm font-medium px-4 py-2 rounded-full mb-6">
              <FiStar size={14} /> {isUrdu ? 'پاکستانی کسانوں کے لیے #1 پلیٹ فارم' : '#1 Platform for Pakistani Farmers'}
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              {isUrdu ? (
                <>سمارٹ زراعت<br/><span className="text-green-600">آسان فیصلے</span></>
              ) : (
                <>Smart Farming,<br/><span className="text-green-600">Better Decisions</span></>
              )}
            </h1>
            <p className="text-lg text-gray-600 mb-8 max-w-lg">
              {isUrdu
                ? 'ریئل ٹائم فصل کی قیمتیں، موسم کی پیشگوئی، بیماری کی تشخیص، اور زرعی خبریں — سب ایک جگہ۔'
                : 'Real-time crop prices, weather forecasts, disease detection, and agriculture news — all in one platform built for Pakistani farmers.'}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/register" className="inline-flex items-center gap-2 bg-green-600 text-white px-8 py-4 rounded-2xl text-lg font-semibold hover:bg-green-700 transition shadow-lg shadow-green-200">
                {isUrdu ? 'مفت شروع کریں' : 'Get Started Free'} <FiArrowRight />
              </Link>
              <Link to="/login" className="inline-flex items-center gap-2 bg-white text-gray-700 px-8 py-4 rounded-2xl text-lg font-medium border-2 border-gray-200 hover:border-green-300 transition">
                {isUrdu ? 'لاگ ان کریں' : 'Sign In'}
              </Link>
            </div>
            <div className="flex items-center gap-6 mt-8 text-sm text-gray-500">
              <span className="flex items-center gap-1"><FiCheckCircle className="text-green-500" /> {isUrdu ? 'مفت' : 'Free forever'}</span>
              <span className="flex items-center gap-1"><FiCheckCircle className="text-green-500" /> {isUrdu ? 'اردو سپورٹ' : 'Urdu support'}</span>
              <span className="flex items-center gap-1"><FiCheckCircle className="text-green-500" /> {isUrdu ? 'ایس ایم ایس الرٹس' : 'SMS alerts'}</span>
            </div>
          </div>
          <div className="hidden lg:block">
            <div className="relative">
              <div className="bg-gradient-to-br from-green-600 to-emerald-500 rounded-3xl p-8 text-white shadow-2xl shadow-green-200 transform rotate-1">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-3xl">🌾</span>
                  <div>
                    <h3 className="font-bold text-lg">AgriSmart360</h3>
                    <p className="text-green-200 text-sm">Dashboard Preview</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="bg-white/20 rounded-xl p-4 backdrop-blur">
                    <p className="text-green-200 text-xs mb-1">{isUrdu ? 'گندم کی قیمت' : 'Wheat Price'}</p>
                    <p className="text-2xl font-bold">PKR 3,850 <span className="text-sm text-green-200">+2.3%</span></p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/20 rounded-xl p-3 backdrop-blur">
                      <p className="text-green-200 text-xs">{isUrdu ? 'درجہ حرارت' : 'Temperature'}</p>
                      <p className="text-xl font-bold">32°C</p>
                    </div>
                    <div className="bg-white/20 rounded-xl p-3 backdrop-blur">
                      <p className="text-green-200 text-xs">{isUrdu ? 'نمی' : 'Humidity'}</p>
                      <p className="text-xl font-bold">65%</p>
                    </div>
                  </div>
                  <div className="bg-white/20 rounded-xl p-3 backdrop-blur">
                    <p className="text-green-200 text-xs mb-1">{isUrdu ? 'الرٹ' : 'Alert'}</p>
                    <p className="text-sm">🔔 {isUrdu ? 'چاول کی قیمت آپ کی حد سے اوپر' : 'Rice price above your threshold'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-green-600">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <div key={i} className="text-center">
              <p className="text-4xl md:text-5xl font-bold text-white mb-2">{stat.value}</p>
              <p className="text-green-200 text-sm font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-gray-50" id="features">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {isUrdu ? 'ہماری خصوصیات' : 'Powerful Features'}
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              {isUrdu
                ? 'ایک پلیٹ فارم پر وہ سب کچھ جو ایک کسان کو ضرورت ہے'
                : 'Everything a farmer needs to make data-driven decisions, all in one platform'}
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg hover:border-green-200 transition group">
                <div className={`w-12 h-12 ${f.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition`}>
                  <f.icon size={22} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {isUrdu ? 'کیسے کام کرتا ہے؟' : 'How It Works'}
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 bg-green-600 text-white rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-lg shadow-green-200">
                  {step.num}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 bg-green-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {isUrdu ? 'کسانوں کے تجربات' : 'What Farmers Say'}
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: isUrdu ? 'محمد اکرم' : 'Muhammad Akram', city: isUrdu ? 'لاہور' : 'Lahore', text: isUrdu ? 'اس ایپ کی وجہ سے میں نے گندم بہترین قیمت پر بیچی۔ قیمت الرٹس بہت مفید ہیں۔' : 'I sold my wheat at the best price thanks to price alerts. This app changed how I farm.' },
              { name: isUrdu ? 'فاطمہ بیگم' : 'Fatima Begum', city: isUrdu ? 'ملتان' : 'Multan', text: isUrdu ? 'بیماری کی تشخیص نے میری کپاس کی فصل بچائی۔ اردو سپورٹ بہت اچھی ہے۔' : 'Disease detection saved my cotton crop. The Urdu support makes it accessible for everyone.' },
              { name: isUrdu ? 'علی حسن' : 'Ali Hassan', city: isUrdu ? 'فیصل آباد' : 'Faisalabad', text: isUrdu ? 'موسم کے مشورے اور خبریں بہت مفید ہیں۔ ہر کسان کو یہ استعمال کرنا چاہیے۔' : 'Weather advisories helped me plan irrigation perfectly. Every farmer needs this app.' },
            ].map((review, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100">
                <div className="flex gap-1 mb-3">
                  {[...Array(5)].map((_, j) => <FiStar key={j} className="text-yellow-400 fill-yellow-400" size={16} />)}
                </div>
                <p className="text-sm text-gray-600 mb-4 leading-relaxed">"{review.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 text-green-700 rounded-full flex items-center justify-center font-bold text-sm">
                    {review.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{review.name}</p>
                    <p className="text-xs text-gray-400 flex items-center gap-1"><FiMapPin size={10} /> {review.city}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-green-600 to-emerald-700">
        <div className="max-w-3xl mx-auto text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {isUrdu ? 'آج ہی سمارٹ کاشتکاری شروع کریں' : 'Start Smart Farming Today'}
          </h2>
          <p className="text-green-100 text-lg mb-8">
            {isUrdu
              ? 'ہزاروں کسان پہلے سے استعمال کر رہے ہیں — مفت رجسٹر کریں'
              : 'Join thousands of farmers already making data-driven decisions — completely free'}
          </p>
          <Link to="/register" className="inline-flex items-center gap-2 bg-white text-green-700 px-10 py-4 rounded-2xl text-lg font-bold hover:bg-green-50 transition shadow-xl">
            {isUrdu ? 'مفت اکاؤنٹ بنائیں' : 'Create Free Account'} <FiArrowRight />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🌾</span>
              <span className="text-lg font-bold text-white">{t('app.name')}</span>
            </div>
            <p className="text-sm">{t('app.tagline')}</p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">{isUrdu ? 'خصوصیات' : 'Features'}</h4>
            <ul className="space-y-2 text-sm">
              <li>{isUrdu ? 'فصل کی قیمتیں' : 'Crop Prices'}</li>
              <li>{isUrdu ? 'موسم کی پیشگوئی' : 'Weather Forecast'}</li>
              <li>{isUrdu ? 'بیماری کی تشخیص' : 'Disease Detection'}</li>
              <li>{isUrdu ? 'زرعی خبریں' : 'Agriculture News'}</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">{isUrdu ? 'پلیٹ فارم' : 'Platform'}</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/login" className="hover:text-white transition">{t('nav.login')}</Link></li>
              <li><Link to="/register" className="hover:text-white transition">{t('nav.register')}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">{isUrdu ? 'رابطہ' : 'Contact'}</h4>
            <ul className="space-y-2 text-sm">
              <li>admin@agrismart360.com</li>
              <li>{isUrdu ? 'اسلام آباد، پاکستان' : 'Pakistan'}</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-8 pt-8 border-t border-gray-800 text-center text-sm">
          <p>&copy; 2026 AgriSmart360. {isUrdu ? 'جملہ حقوق محفوظ ہیں' : 'All rights reserved'}.</p>
        </div>
      </footer>
    </div>
  );
}
