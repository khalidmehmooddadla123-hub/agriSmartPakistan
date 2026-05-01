import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

const SHOWN_KEY = 'agrismart_welcome_shown';
const ROTATE_MS = 5000;

const HADITHS = [
  {
    arabic: 'لَوْ أَنَّكُمْ تَوَكَّلْتُمْ عَلَى اللَّهِ حَقَّ تَوَكُّلِهِ لَرُزِقْتُمْ كَمَا تُرْزَقُ الطَّيْرُ، تَغْدُو خِمَاصًا وَتَرُوحُ بِطَانًا',
    urdu: 'اگر تم اللہ پر اس طرح بھروسہ کرو جیسا اس کا حق ہے، تو تمہیں اسی طرح رزق دیا جائے جیسے پرندوں کو دیا جاتا ہے، جو صبح خالی پیٹ نکلتے ہیں اور شام بھرے پیٹ لوٹتے ہیں۔',
    english: 'If you relied on Allah with the reliance He deserves, He would provide for you as He provides for the birds — they go out hungry in the morning and return full in the evening.',
    sourceAr: 'سنن ترمذی · ۲۳۴۴ · حسن صحیح',
    sourceEn: 'Sunan al-Tirmidhi 2344 · Hasan Sahih'
  },
  {
    arabic: 'مَا أَكَلَ أَحَدٌ طَعَامًا قَطُّ خَيْرًا مِنْ أَنْ يَأْكُلَ مِنْ عَمَلِ يَدِهِ',
    urdu: 'کسی نے اپنے ہاتھ کی کمائی سے بہتر کھانا کبھی نہیں کھایا۔',
    english: 'No one has ever eaten better food than what he eats from the work of his own hands.',
    sourceAr: 'صحیح بخاری · ۲۰۷۲',
    sourceEn: 'Sahih al-Bukhari 2072'
  },
  {
    arabic: 'مَا مِنْ مُسْلِمٍ يَغْرِسُ غَرْسًا أَوْ يَزْرَعُ زَرْعًا فَيَأْكُلُ مِنْهُ طَيْرٌ أَوْ إِنْسَانٌ أَوْ بَهِيمَةٌ إِلَّا كَانَ لَهُ بِهِ صَدَقَةٌ',
    urdu: 'جو مسلمان درخت لگائے یا کھیتی کرے، پھر اس سے کوئی پرندہ، انسان یا جانور کھائے، تو یہ اس کے لیے صدقہ ہے۔',
    english: 'No Muslim plants a tree or sows a seed, and a bird, person, or animal eats from it, except that it is regarded as charity for him.',
    sourceAr: 'صحیح بخاری · ۲۳۲۰',
    sourceEn: 'Sahih al-Bukhari 2320'
  },
  {
    arabic: 'اطْلُبُوا الرِّزْقَ فِي خَبَايَا الْأَرْضِ',
    urdu: 'زمین کے خزانوں میں رزق تلاش کرو (یعنی کاشتکاری اور کھیتی باڑی کے ذریعے)۔',
    english: 'Seek your provision in the depths of the earth (i.e., through agriculture and cultivation).',
    sourceAr: 'طبرانی · المعجم الاوسط',
    sourceEn: 'Al-Tabarani · Al-Mu\'jam al-Awsat'
  },
  {
    arabic: 'إِنَّ الرِّزْقَ لَيَطْلُبُ الْعَبْدَ كَمَا يَطْلُبُهُ أَجَلُهُ',
    urdu: 'بے شک رزق بندے کو ایسے ہی تلاش کرتا ہے جیسے اس کی موت اسے تلاش کرتی ہے۔',
    english: 'Verily, sustenance seeks the servant just as his appointed time of death seeks him.',
    sourceAr: 'صحیح ابن حبان · ۳۲۳۹',
    sourceEn: 'Sahih Ibn Hibban 3239'
  }
];

export default function WelcomeSplash() {
  const { i18n } = useTranslation();
  const isUrdu = i18n.language === 'ur';
  const [show, setShow] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [index, setIndex] = useState(0);
  const [fading, setFading] = useState(false);

  const dismiss = useCallback(() => {
    setLeaving(true);
    setTimeout(() => setShow(false), 600);
  }, []);

  useEffect(() => {
    if (!sessionStorage.getItem(SHOWN_KEY)) {
      setShow(true);
      sessionStorage.setItem(SHOWN_KEY, '1');
    }
    const onKey = (e) => { if (show && (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ')) dismiss(); };
    const onShowAgain = () => {
      setLeaving(false);
      setFading(false);
      setIndex(0);
      setShow(true);
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('show-welcome-splash', onShowAgain);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('show-welcome-splash', onShowAgain);
    };
  }, [dismiss, show]);

  // Rotate Hadiths every 5s with smooth fade transition
  useEffect(() => {
    if (!show || leaving) return;
    const tick = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setIndex((i) => (i + 1) % HADITHS.length);
        setFading(false);
      }, 400);
    }, ROTATE_MS);
    return () => clearInterval(tick);
  }, [show, leaving]);

  if (!show) return null;

  const h = HADITHS[index];

  return (
    <div
      role="button"
      tabIndex={0}
      className={`fixed inset-0 z-[9999] flex flex-col overflow-y-auto cursor-pointer ${leaving ? 'splash-leave' : ''}`}
      style={{
        background: 'linear-gradient(135deg, #064e3b 0%, #047857 35%, #0d9488 70%, #14b8a6 100%)',
        backgroundSize: '200% 200%',
        animation: leaving ? undefined : 'gradientShift 8s ease infinite'
      }}
      onClick={dismiss}
    >
      {/* Glow orbs */}
      <div className="absolute -top-20 -left-16 w-72 h-72 sm:w-96 sm:h-96 bg-emerald-300/25 rounded-full blur-3xl animate-float pointer-events-none" />
      <div className="absolute -bottom-20 -right-10 w-72 h-72 sm:w-[28rem] sm:h-[28rem] bg-teal-200/15 rounded-full blur-3xl animate-float pointer-events-none" style={{ animationDelay: '1.5s' }} />
      <div className="absolute top-1/3 right-1/4 w-40 h-40 bg-yellow-200/15 rounded-full blur-2xl animate-float pointer-events-none" style={{ animationDelay: '0.6s' }} />

      {/* Decorative dot pattern */}
      <div
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.5) 1px, transparent 0)',
          backgroundSize: '24px 24px'
        }}
      />

      {/* === Top: Rotating Hadith === */}
      <div className="relative w-full px-3 sm:px-4 pt-6 sm:pt-8 pb-2">
        <div className="max-w-3xl mx-auto" onClick={(e) => e.stopPropagation()}>
          {/* Top label ornament */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <span className="h-px flex-1 max-w-[60px] sm:max-w-[100px] bg-gradient-to-r from-transparent to-yellow-300/50" />
            <span className="text-yellow-300 text-base sm:text-xl">۞</span>
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.25em] text-yellow-200/95">
              {isUrdu ? 'حدیثِ مبارکہ' : 'Hadith Sharif'}
            </span>
            <span className="text-yellow-300 text-base sm:text-xl">۞</span>
            <span className="h-px flex-1 max-w-[60px] sm:max-w-[100px] bg-gradient-to-l from-transparent to-yellow-300/50" />
          </div>

          {/* Hadith card */}
          <div className="relative bg-white/[0.07] backdrop-blur-md border border-white/15 rounded-2xl p-4 sm:p-6 md:p-7 shadow-xl">
            {/* Corner accents */}
            <span className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 text-yellow-300/60 text-xs sm:text-sm select-none">❋</span>
            <span className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 text-yellow-300/60 text-xs sm:text-sm select-none">❋</span>
            <span className="absolute bottom-1.5 left-1.5 sm:bottom-2 sm:left-2 text-yellow-300/60 text-xs sm:text-sm select-none">❋</span>
            <span className="absolute bottom-1.5 right-1.5 sm:bottom-2 sm:right-2 text-yellow-300/60 text-xs sm:text-sm select-none">❋</span>

            <div
              className="transition-opacity duration-400"
              style={{ opacity: fading ? 0 : 1 }}
            >
              {/* Arabic */}
              <p
                dir="rtl"
                className="font-arabic text-white text-base sm:text-lg md:text-2xl text-center leading-loose px-1 sm:px-3"
                style={{ textShadow: '0 1px 8px rgba(0,0,0,0.3)' }}
              >
                {h.arabic}
              </p>

              {/* Divider */}
              <div className="flex items-center justify-center gap-2 my-3 sm:my-4">
                <span className="h-px w-10 sm:w-16 bg-yellow-300/30" />
                <span className="text-yellow-300/70 text-[10px]">✦</span>
                <span className="h-px w-10 sm:w-16 bg-yellow-300/30" />
              </div>

              {/* Urdu */}
              <p
                dir="rtl"
                className="font-nastaliq text-emerald-50 text-sm sm:text-base md:text-lg text-center px-1 sm:px-3"
              >
                {h.urdu}
              </p>

              {/* English (only when EN mode) */}
              {!isUrdu && (
                <p className="mt-3 sm:mt-4 text-emerald-100/80 text-[11px] sm:text-xs md:text-sm text-center leading-relaxed italic px-1 sm:px-3">
                  "{h.english}"
                </p>
              )}

              {/* Source */}
              <div className="mt-3 sm:mt-4 flex items-center justify-center gap-1.5 sm:gap-2 text-yellow-200/95">
                <span className="text-xs sm:text-sm">📜</span>
                <p className="text-[9.5px] sm:text-[11px] md:text-xs font-semibold tracking-wide">
                  {isUrdu ? h.sourceAr : h.sourceEn}
                </p>
              </div>
            </div>
          </div>

          {/* Position dots */}
          <div className="flex items-center justify-center gap-1.5 sm:gap-2 mt-3 sm:mt-4">
            {HADITHS.map((_, i) => (
              <button
                key={i}
                onClick={(e) => {
                  e.stopPropagation();
                  setFading(true);
                  setTimeout(() => { setIndex(i); setFading(false); }, 250);
                }}
                aria-label={`Hadith ${i + 1}`}
                className={`transition-all rounded-full ${
                  i === index
                    ? 'w-6 sm:w-8 h-1.5 sm:h-2 bg-yellow-300'
                    : 'w-1.5 sm:w-2 h-1.5 sm:h-2 bg-white/30 hover:bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* === Bottom: Brand + dismiss === */}
      <div className="relative flex-1 flex flex-col items-center justify-center text-center px-6 pb-8 sm:pb-10">
        <div className="relative mb-4 sm:mb-6">
          <span className="absolute inset-0 rounded-full bg-white/40 animate-pulse-ring" />
          <span className="absolute inset-0 rounded-full bg-white/30 animate-pulse-ring" style={{ animationDelay: '0.4s' }} />
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-white rounded-full flex items-center justify-center text-3xl sm:text-4xl md:text-5xl shadow-2xl animate-scale-in">
            🌾
          </div>
        </div>

        <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight animate-slide-up delay-200">
          AgriSmart<span className="text-yellow-300">360</span>
        </h1>

        <p className="mt-2 sm:mt-3 text-emerald-50/90 text-xs sm:text-sm md:text-base font-medium animate-slide-up delay-400 max-w-md">
          {isUrdu
            ? 'پاکستانی کسانوں کے لیے سمارٹ زراعت کا پلیٹ فارم'
            : 'Smart Farming Platform for Pakistani Farmers'}
        </p>

        <button
          onClick={(e) => { e.stopPropagation(); dismiss(); }}
          className="mt-6 sm:mt-8 inline-flex items-center gap-2 bg-white text-emerald-700 hover:bg-emerald-50 font-bold text-sm sm:text-base px-6 sm:px-8 py-2.5 sm:py-3 rounded-full shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all animate-fade-in delay-500"
        >
          {isUrdu ? 'جاری رکھیں' : 'Continue to Site'}
          <span className="rtl:rotate-180">→</span>
        </button>

        <p className="mt-3 text-white/50 text-[10px] sm:text-xs animate-fade-in delay-700">
          {isUrdu ? 'یا کہیں بھی تھپتپائیں' : 'or tap anywhere'}
        </p>
      </div>
    </div>
  );
}
