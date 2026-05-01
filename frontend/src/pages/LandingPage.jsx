import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import {
  FiBarChart2, FiCloud, FiSearch, FiFileText, FiBell, FiShield,
  FiGlobe, FiArrowRight, FiArrowLeft, FiStar, FiUsers, FiMapPin, FiCheckCircle,
  FiMenu, FiX, FiHome
} from 'react-icons/fi';
import WelcomeSplash from '../components/WelcomeSplash';
import PreloadScreen from '../components/PreloadScreen';
import Reveal from '../components/Reveal';
import useForceLight from '../hooks/useForceLight';

export default function LandingPage() {
  const { t, i18n } = useTranslation();
  const isUrdu = i18n.language === 'ur';
  const toggleLang = () => i18n.changeLanguage(isUrdu ? 'en' : 'ur');
  const [mobileMenu, setMobileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [pageReady, setPageReady] = useState(false);
  useForceLight();

  // Preload: wait for fonts + a tiny minimum so the first paint is clean,
  // then drop the loader and let Bismillah/Welcome/Hero render at once.
  useEffect(() => {
    const fontReady = (document.fonts && document.fonts.ready) ? document.fonts.ready : Promise.resolve();
    const minDelay = new Promise(r => setTimeout(r, 700));
    Promise.all([fontReady, minDelay]).then(() => setPageReady(true));
  }, []);

  const showWelcomeAgain = () => {
    sessionStorage.removeItem('agrismart_welcome_shown');
    window.dispatchEvent(new Event('show-welcome-splash'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const features = [
    { icon: FiBarChart2, color: 'bg-green-100 text-green-600', title: isUrdu ? 'ریئل ٹائم فصل کی قیمتیں' : 'Real-Time Crop Prices', desc: isUrdu ? 'بین الاقوامی، قومی اور مقامی منڈی کی قیمتیں فوری طور پر دیکھیں' : 'Track international, national & local mandi prices with 30-day trend charts' },
    { icon: FiCloud, color: 'bg-blue-100 text-blue-600', title: isUrdu ? 'موسم کی پیشگوئی' : '7-Day Weather Forecast', desc: isUrdu ? 'اپنے مقام کے مطابق موسم اور کاشتکاری مشورے' : 'Location-based weather with farming advisories & agricultural tips' },
    { icon: FiSearch, color: 'bg-purple-100 text-purple-600', title: isUrdu ? 'فصل کی بیماری کی تشخیص' : 'AI Disease Detection', desc: isUrdu ? 'تصویر اپ لوڈ کریں اور فوری بیماری کی تشخیص حاصل کریں' : 'Upload a leaf image & get instant diagnosis with treatment solutions' },
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

  if (!pageReady) {
    return <PreloadScreen />;
  }

  return (
    <div className="min-h-screen bg-white overflow-x-hidden animate-fade-in">
      <WelcomeSplash />

      {/* Navbar */}
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm'
            : 'bg-white/70 backdrop-blur-sm border-b border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={showWelcomeAgain}
              title={isUrdu ? 'خوش آمدید صفحہ پر واپس' : 'Back to welcome'}
              className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition shrink-0"
              aria-label="Back to welcome splash"
            >
              <FiArrowLeft size={17} className="rtl:rotate-180" />
            </button>
            <Link to="/" className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <span className="text-xl sm:text-2xl">🌾</span>
              <span className="text-base sm:text-xl font-extrabold bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text text-transparent">{t('app.name')}</span>
            </Link>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1.5 lg:gap-3">
            <button onClick={toggleLang} className="flex items-center gap-1 text-[13px] text-gray-600 hover:text-green-700 px-2.5 lg:px-3 py-2 rounded-lg hover:bg-green-50 font-medium transition">
              <FiGlobe size={15} /> {isUrdu ? 'English' : 'اردو'}
            </button>
            <Link to="/login" className="text-[13px] font-semibold text-gray-700 hover:text-green-700 px-3 lg:px-4 py-2 rounded-lg hover:bg-gray-50 transition">
              {t('nav.login')}
            </Link>
            <Link to="/register" className="text-[13px] font-semibold bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 lg:px-5 py-2 rounded-xl hover:shadow-lg hover:shadow-green-200 transition-all">
              {t('nav.register')}
            </Link>
          </div>

          {/* Mobile burger */}
          <button
            onClick={() => setMobileMenu(!mobileMenu)}
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-700"
            aria-label="Toggle menu"
          >
            {mobileMenu ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenu && (
          <div className="md:hidden bg-white border-t border-gray-100 px-3 py-3 space-y-1.5 animate-slide-up">
            <button onClick={() => { toggleLang(); setMobileMenu(false); }} className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-green-50 hover:text-green-700">
              <FiGlobe size={15} /> {isUrdu ? 'English' : 'اردو'}
            </button>
            <Link to="/login" onClick={() => setMobileMenu(false)} className="block px-3 py-2.5 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50">
              {t('nav.login')}
            </Link>
            <Link to="/register" onClick={() => setMobileMenu(false)} className="block px-3 py-2.5 rounded-lg text-sm font-semibold bg-gradient-to-r from-green-600 to-emerald-600 text-white text-center shadow-md">
              {t('nav.register')}
            </Link>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 sm:pt-28 lg:pt-32 pb-12 sm:pb-16 md:pb-20 px-4 overflow-hidden">
        {/* Background decor */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-white to-emerald-50" />
        <div className="absolute top-20 -left-20 w-72 sm:w-96 h-72 sm:h-96 bg-green-200/30 rounded-full blur-3xl animate-float" />
        <div className="absolute -top-10 right-1/4 w-60 h-60 bg-emerald-200/30 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.2s' }} />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-teal-100/40 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />

        <div className="relative max-w-7xl mx-auto grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="animate-slide-right">
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur border border-green-200 text-green-700 text-[12px] sm:text-sm font-semibold px-3 sm:px-4 py-1.5 sm:py-2 rounded-full mb-4 sm:mb-6 shadow-sm">
              <FiStar size={14} className="text-yellow-500" /> {isUrdu ? 'پاکستانی کسانوں کے لیے #1 پلیٹ فارم' : '#1 Platform for Pakistani Farmers'}
            </div>
            <h1 className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-[1.1] mb-4 sm:mb-6 tracking-tight ${isUrdu ? 'font-nastaliq leading-[1.5]' : ''}`}>
              {isUrdu ? (
                <>سمارٹ زراعت<br/><span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">آسان فیصلے</span></>
              ) : (
                <>Smart Farming,<br/><span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Better Decisions</span></>
              )}
            </h1>
            <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8 max-w-lg leading-relaxed">
              {isUrdu
                ? 'ریئل ٹائم فصل کی قیمتیں، موسم کی پیشگوئی، بیماری کی تشخیص، اور زرعی خبریں — سب ایک جگہ۔'
                : 'Real-time crop prices, weather forecasts, AI disease detection, and agriculture news — all in one platform built for Pakistani farmers.'}
            </p>
            <div className="flex flex-wrap gap-3 sm:gap-4">
              <Link to="/register" className="group inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-2xl text-sm sm:text-lg font-semibold hover:shadow-xl hover:shadow-green-200 hover:-translate-y-0.5 transition-all">
                {isUrdu ? 'مفت شروع کریں' : 'Get Started Free'}
                <FiArrowRight className="group-hover:translate-x-1 transition rtl:rotate-180" />
              </Link>
              <Link to="/login" className="inline-flex items-center gap-2 bg-white text-gray-700 px-6 sm:px-8 py-3 sm:py-4 rounded-2xl text-sm sm:text-lg font-medium border-2 border-gray-200 hover:border-green-300 hover:bg-green-50 transition">
                {isUrdu ? 'لاگ ان کریں' : 'Sign In'}
              </Link>
            </div>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-6 sm:mt-8 text-xs sm:text-sm text-gray-500">
              <span className="flex items-center gap-1"><FiCheckCircle className="text-green-500" /> {isUrdu ? 'مفت' : 'Free forever'}</span>
              <span className="flex items-center gap-1"><FiCheckCircle className="text-green-500" /> {isUrdu ? 'اردو سپورٹ' : 'Urdu support'}</span>
              <span className="flex items-center gap-1"><FiCheckCircle className="text-green-500" /> {isUrdu ? 'AI طاقتور' : 'AI powered'}</span>
            </div>
          </div>

          {/* Hero card preview */}
          <div className="hidden lg:block animate-scale-in delay-300">
            <div className="relative">
              {/* Glow */}
              <div className="absolute -inset-4 bg-gradient-to-br from-green-400/30 to-emerald-500/30 rounded-3xl blur-2xl" />
              <div className="relative bg-gradient-to-br from-green-600 to-emerald-700 rounded-3xl p-8 text-white shadow-2xl shadow-green-300/40 transform hover:rotate-0 rotate-1 transition-transform duration-500">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center text-2xl">🌾</div>
                  <div>
                    <h3 className="font-bold text-lg">AgriSmart360</h3>
                    <p className="text-green-200 text-sm">{isUrdu ? 'لائیو ڈیش بورڈ' : 'Live Dashboard'}</p>
                  </div>
                  <span className="ml-auto rtl:mr-auto rtl:ml-0 flex items-center gap-1.5 text-xs bg-green-400/20 px-2 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-300 animate-pulse" /> Live
                  </span>
                </div>
                <div className="space-y-3">
                  <div className="bg-white/15 rounded-xl p-4 backdrop-blur border border-white/10">
                    <p className="text-green-200 text-xs mb-1">{isUrdu ? 'گندم کی قیمت' : 'Wheat Price'}</p>
                    <p className="text-2xl font-bold">PKR 4,300 <span className="text-sm text-green-200 font-normal">/maund</span></p>
                    <p className="text-xs text-emerald-200 mt-1">↑ +2.3% {isUrdu ? 'اس ہفتے' : 'this week'}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/15 rounded-xl p-3 backdrop-blur border border-white/10">
                      <p className="text-green-200 text-xs">{isUrdu ? 'درجہ حرارت' : 'Temperature'}</p>
                      <p className="text-xl font-bold">32°C</p>
                    </div>
                    <div className="bg-white/15 rounded-xl p-3 backdrop-blur border border-white/10">
                      <p className="text-green-200 text-xs">{isUrdu ? 'نمی' : 'Humidity'}</p>
                      <p className="text-xl font-bold">65%</p>
                    </div>
                  </div>
                  <div className="bg-white/15 rounded-xl p-3 backdrop-blur border border-white/10">
                    <p className="text-green-200 text-xs mb-1">{isUrdu ? 'الرٹ' : 'Smart Alert'}</p>
                    <p className="text-sm">🔔 {isUrdu ? 'چاول کی قیمت آپ کی حد سے اوپر' : 'Rice price above your threshold'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-12 sm:py-16 bg-gradient-to-r from-green-600 to-emerald-700 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-yellow-200 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          {stats.map((stat, i) => (
            <Reveal key={i} delay={i * 100} className="text-center">
              <p className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-1 sm:mb-2 tracking-tight">{stat.value}</p>
              <p className="text-green-100 text-xs sm:text-sm font-medium">{stat.label}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-20 px-4 bg-gray-50" id="features">
        <div className="max-w-7xl mx-auto">
          <Reveal className="text-center mb-12 sm:mb-16">
            <span className="inline-block text-xs sm:text-sm font-bold text-green-700 bg-green-100 px-3 py-1 rounded-full mb-3">
              {isUrdu ? 'خصوصیات' : 'FEATURES'}
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 mb-3 sm:mb-4 tracking-tight">
              {isUrdu ? 'ہماری طاقتور خصوصیات' : 'Powerful Features'}
            </h2>
            <p className="text-sm sm:text-base text-gray-500 max-w-2xl mx-auto">
              {isUrdu
                ? 'ایک پلیٹ فارم پر وہ سب کچھ جو ایک کسان کو ضرورت ہے'
                : 'Everything a farmer needs to make data-driven decisions, all in one platform'}
            </p>
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {features.map((f, i) => (
              <Reveal key={i} delay={i * 80} className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 hover:shadow-xl hover:border-green-200 hover:-translate-y-1 transition-all duration-300 group">
                <div className={`w-12 h-12 ${f.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-transform`}>
                  <f.icon size={22} />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 sm:py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <Reveal className="text-center mb-12 sm:mb-16">
            <span className="inline-block text-xs sm:text-sm font-bold text-green-700 bg-green-100 px-3 py-1 rounded-full mb-3">
              {isUrdu ? 'طریقہ کار' : 'GET STARTED'}
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
              {isUrdu ? 'تین آسان قدم' : 'Three Simple Steps'}
            </h2>
          </Reveal>
          <div className="grid md:grid-cols-3 gap-6 sm:gap-8 relative">
            {/* Connecting line on desktop */}
            <div className="hidden md:block absolute top-8 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-green-200 via-emerald-300 to-green-200" />
            {steps.map((step, i) => (
              <Reveal key={i} delay={i * 150} className="relative text-center bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 hover:shadow-lg transition">
                <div className="relative w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-2xl flex items-center justify-center text-xl sm:text-2xl font-bold mx-auto mb-3 sm:mb-4 shadow-lg shadow-green-300/40">
                  {step.num}
                  <span className="absolute inset-0 rounded-2xl bg-white/30 animate-pulse-ring" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1.5 sm:mb-2">{step.title}</h3>
                <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">{step.desc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 sm:py-20 px-4 bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="max-w-7xl mx-auto">
          <Reveal className="text-center mb-12 sm:mb-16">
            <span className="inline-block text-xs sm:text-sm font-bold text-green-700 bg-white px-3 py-1 rounded-full mb-3 shadow-sm">
              {isUrdu ? 'تجربات' : 'TESTIMONIALS'}
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
              {isUrdu ? 'کسانوں کے تجربات' : 'What Farmers Say'}
            </h2>
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[
              { name: isUrdu ? 'محمد اکرم' : 'Muhammad Akram', city: isUrdu ? 'لاہور' : 'Lahore', text: isUrdu ? 'اس ایپ کی وجہ سے میں نے گندم بہترین قیمت پر بیچی۔ قیمت الرٹس بہت مفید ہیں۔' : 'I sold my wheat at the best price thanks to price alerts. This app changed how I farm.' },
              { name: isUrdu ? 'فاطمہ بیگم' : 'Fatima Begum', city: isUrdu ? 'ملتان' : 'Multan', text: isUrdu ? 'بیماری کی تشخیص نے میری کپاس کی فصل بچائی۔ اردو سپورٹ بہت اچھی ہے۔' : 'Disease detection saved my cotton crop. The Urdu support makes it accessible for everyone.' },
              { name: isUrdu ? 'علی حسن' : 'Ali Hassan', city: isUrdu ? 'فیصل آباد' : 'Faisalabad', text: isUrdu ? 'موسم کے مشورے اور خبریں بہت مفید ہیں۔ ہر کسان کو یہ استعمال کرنا چاہیے۔' : 'Weather advisories helped me plan irrigation perfectly. Every farmer needs this app.' },
            ].map((review, i) => (
              <Reveal key={i} delay={i * 120} className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="flex gap-1 mb-3">
                  {[...Array(5)].map((_, j) => <FiStar key={j} className="text-yellow-400 fill-yellow-400" size={16} />)}
                </div>
                <p className="text-sm text-gray-600 mb-4 leading-relaxed">"{review.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-full flex items-center justify-center font-bold text-sm shadow">
                    {review.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{review.name}</p>
                    <p className="text-xs text-gray-400 flex items-center gap-1"><FiMapPin size={10} /> {review.city}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-16 sm:py-20 px-4 bg-gradient-to-br from-green-600 to-emerald-700 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-yellow-300 rounded-full blur-3xl animate-float" />
          <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-96 h-96 bg-emerald-300 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />
        </div>
        <Reveal className="relative max-w-3xl mx-auto text-center text-white">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-3 sm:mb-4 tracking-tight">
            {isUrdu ? 'آج ہی سمارٹ کاشتکاری شروع کریں' : 'Start Smart Farming Today'}
          </h2>
          <p className="text-green-100 text-base sm:text-lg mb-6 sm:mb-8 max-w-xl mx-auto">
            {isUrdu
              ? 'ہزاروں کسان پہلے سے استعمال کر رہے ہیں — مفت رجسٹر کریں'
              : 'Join thousands of farmers already making data-driven decisions — completely free'}
          </p>
          <Link to="/register" className="inline-flex items-center gap-2 bg-white text-green-700 px-8 sm:px-10 py-3.5 sm:py-4 rounded-2xl text-base sm:text-lg font-bold hover:bg-green-50 hover:-translate-y-0.5 transition-all shadow-2xl">
            {isUrdu ? 'مفت اکاؤنٹ بنائیں' : 'Create Free Account'} <FiArrowRight className="rtl:rotate-180" />
          </Link>
        </Reveal>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-10 sm:py-12 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <span className="text-2xl">🌾</span>
              <span className="text-lg font-bold text-white">{t('app.name')}</span>
            </div>
            <p className="text-xs sm:text-sm leading-relaxed">{t('app.tagline')}</p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-2 sm:mb-3 text-sm">{isUrdu ? 'خصوصیات' : 'Features'}</h4>
            <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
              <li>{isUrdu ? 'فصل کی قیمتیں' : 'Crop Prices'}</li>
              <li>{isUrdu ? 'موسم کی پیشگوئی' : 'Weather Forecast'}</li>
              <li>{isUrdu ? 'بیماری کی تشخیص' : 'Disease Detection'}</li>
              <li>{isUrdu ? 'زرعی خبریں' : 'Agriculture News'}</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-2 sm:mb-3 text-sm">{isUrdu ? 'پلیٹ فارم' : 'Platform'}</h4>
            <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
              <li><Link to="/login" className="hover:text-white transition">{t('nav.login')}</Link></li>
              <li><Link to="/register" className="hover:text-white transition">{t('nav.register')}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-2 sm:mb-3 text-sm">{isUrdu ? 'رابطہ' : 'Contact'}</h4>
            <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm break-all">
              <li>admin@agrismart360.com</li>
              <li>{isUrdu ? 'پاکستان' : 'Pakistan'}</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-gray-800 text-center text-xs sm:text-sm">
          <p>&copy; 2026 AgriSmart360. {isUrdu ? 'جملہ حقوق محفوظ ہیں' : 'All rights reserved'}.</p>
        </div>
      </footer>
    </div>
  );
}
