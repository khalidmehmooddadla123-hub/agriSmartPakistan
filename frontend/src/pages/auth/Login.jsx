import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { FiMail, FiLock, FiGlobe, FiArrowRight, FiArrowLeft, FiCheckCircle, FiEye, FiEyeOff, FiAlertCircle } from 'react-icons/fi';
import useForceLight from '../../hooks/useForceLight';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Login() {
  useForceLight();
  const { t, i18n } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isUrdu = i18n.language === 'ur';
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [justRegistered, setJustRegistered] = useState(false);
  const [form, setForm] = useState({
    email: location.state?.prefillEmail || '',
    password: ''
  });
  const [errors, setErrors] = useState({});

  // After successful registration, prefill email + show welcome banner.
  useEffect(() => {
    if (location.state?.justRegistered) {
      setJustRegistered(true);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const set = (f) => (e) => {
    setForm({ ...form, [f]: e.target.value });
    if (errors[f]) setErrors({ ...errors, [f]: undefined });
  };

  const handleAuthError = (err, fallbackField, fallbackMsg) => {
    const data = err.response?.data;
    const field = data?.field || fallbackField;
    const message = data?.message || fallbackMsg || 'Something went wrong';
    setErrors(prev => ({ ...prev, [field]: message }));
  };

  const validate = () => {
    const e = {};
    if (!form.email) e.email = isUrdu ? 'ای میل درج کریں' : 'Please enter your email';
    else if (!EMAIL_RE.test(form.email)) e.email = isUrdu ? 'درست ای میل درج کریں' : 'Please enter a valid email';
    if (!form.password) e.password = isUrdu ? 'پاس ورڈ درج کریں' : 'Please enter your password';
    else if (form.password.length < 6) e.password = isUrdu ? 'پاس ورڈ بہت چھوٹا ہے' : 'Password is too short';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await authAPI.login({ email: form.email, password: form.password });
      login(res.data.data);
      toast.success(isUrdu ? 'خوش آمدید!' : 'Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      handleAuthError(err, 'password', 'Login failed');
    } finally { setLoading(false); }
  };

  const toggleLang = () => i18n.changeLanguage(isUrdu ? 'en' : 'ur');

  const goWelcome = () => {
    sessionStorage.removeItem('agrismart_welcome_shown');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex">
      {/* Left Branding Panel */}
      <div className="hidden lg:flex lg:w-[44%] relative overflow-hidden bg-gradient-to-br from-green-600 via-emerald-600 to-teal-700 text-white flex-col justify-between p-12">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-40 h-40 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-60 h-60 bg-green-300 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/3 w-32 h-32 bg-emerald-200 rounded-full blur-2xl" />
        </div>

        <div className="relative">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div className="w-11 h-11 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center text-2xl">🌾</div>
            <span className="text-xl font-bold">{t('app.name')}</span>
          </Link>
        </div>

        <div className="relative">
          <h1 className={`text-4xl font-bold leading-tight mb-4 ${isUrdu ? 'font-nastaliq leading-snug' : ''}`}>
            {isUrdu ? (
              <>سمارٹ کاشتکاری<br/><span className="text-green-200">آپ کے ہاتھ میں</span></>
            ) : (
              <>Smart Farming,<br/><span className="text-green-200">Smarter Decisions</span></>
            )}
          </h1>
          <p className="text-green-100 text-base leading-relaxed max-w-sm">
            {isUrdu
              ? 'AI سے چلنے والا زرعی پلیٹ فارم جو پاکستانی کسانوں کے لیے بنایا گیا ہے۔'
              : 'AI-powered platform built for Pakistani farmers with real-time prices, weather & disease detection.'}
          </p>

          <div className="mt-8 grid grid-cols-2 gap-4 max-w-sm">
            {[
              { emoji: '📊', en: 'Real-time Prices', ur: 'ریئل ٹائم قیمتیں' },
              { emoji: '🌤', en: '7-Day Weather', ur: '7 دن کا موسم' },
              { emoji: '🔬', en: 'AI Disease Scan', ur: 'AI بیماری اسکین' },
              { emoji: '📰', en: 'Agri News', ur: 'زرعی خبریں' },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-2.5 bg-white/10 backdrop-blur border border-white/10 rounded-xl px-3 py-2.5">
                <span className="text-xl">{f.emoji}</span>
                <span className="text-xs font-medium">{isUrdu ? f.ur : f.en}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative text-xs text-green-200/80">
          © 2026 AgriSmart360 · IUB FYP
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          {/* Mobile header */}
          <div className="lg:hidden flex items-center justify-between mb-8 gap-2">
            <button
              onClick={goWelcome}
              title={isUrdu ? 'خوش آمدید صفحہ پر واپس' : 'Back to welcome'}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 shrink-0 transition"
              aria-label="Back to welcome"
            >
              <FiArrowLeft size={17} className="rtl:rotate-180" />
            </button>
            <Link to="/" className="flex items-center gap-2 min-w-0">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center text-xl shadow-lg shadow-green-200 shrink-0">🌾</div>
              <span className="text-lg font-bold text-gray-900 truncate">{t('app.name')}</span>
            </Link>
            <button onClick={toggleLang} className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full shrink-0">
              <FiGlobe size={13} /> {isUrdu ? 'English' : 'اردو'}
            </button>
          </div>

          {/* Desktop header */}
          <div className="hidden lg:flex items-center justify-between mb-6 gap-3">
            <button
              onClick={goWelcome}
              className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 px-3.5 py-2 rounded-full transition"
            >
              <FiArrowLeft size={14} className="rtl:rotate-180" /> {isUrdu ? 'واپس' : 'Back to Welcome'}
            </button>
            <button onClick={toggleLang} className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-green-600 bg-white border border-gray-200 px-3.5 py-2 rounded-full card-soft">
              <FiGlobe size={14} /> {isUrdu ? 'English' : 'اردو'}
            </button>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-2">{t('auth.loginTitle')}</h2>
          <p className="text-gray-500 text-sm mb-6">{t('auth.loginSubtitle')}</p>

          {justRegistered && (
            <div className="mb-6 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3 animate-fade-in-up">
              <FiCheckCircle className="text-emerald-600 shrink-0 mt-0.5" size={20} />
              <div>
                <p className="text-sm font-bold text-emerald-900">
                  {isUrdu ? '✓ اکاؤنٹ کامیابی سے بن گیا!' : '✓ Account created successfully!'}
                </p>
                <p className="text-[12.5px] text-emerald-700 mt-0.5 leading-relaxed">
                  {isUrdu
                    ? 'اب آپ اپنے ای میل اور پاس ورڈ سے لاگ ان کریں'
                    : 'Now sign in with the credentials you just created.'}
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleLogin} noValidate className="space-y-4">
            <div>
              <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">{t('auth.email')}</label>
              <div className="relative">
                <FiMail className={`absolute left-4 rtl:right-4 rtl:left-auto top-1/2 -translate-y-1/2 ${errors.email ? 'text-red-400' : 'text-gray-400'}`} size={16} />
                <input type="email" value={form.email} onChange={set('email')}
                  className={`w-full pl-11 rtl:pr-11 rtl:pl-4 pr-4 py-3.5 border rounded-xl text-sm bg-white placeholder:text-gray-400 outline-none transition ${
                    errors.email ? 'border-red-300 ring-2 ring-red-100' : 'border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100'
                  }`}
                  placeholder="farmer@example.com" autoComplete="email" />
              </div>
              {errors.email && (
                <p className="mt-1.5 flex items-start gap-1.5 text-[12px] font-medium text-red-600 animate-fade-in">
                  <FiAlertCircle size={13} className="mt-0.5 shrink-0" /> {errors.email}
                </p>
              )}
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[13px] font-semibold text-gray-700">{t('auth.password')}</label>
                <Link to="/forgot-password" className="text-[12px] font-semibold text-green-600 hover:text-green-700">{t('auth.forgotPassword')}</Link>
              </div>
              <div className="relative">
                <FiLock className={`absolute left-4 rtl:right-4 rtl:left-auto top-1/2 -translate-y-1/2 ${errors.password ? 'text-red-400' : 'text-gray-400'}`} size={16} />
                <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={set('password')}
                  className={`w-full pl-11 rtl:pr-11 pr-11 rtl:pl-11 py-3.5 border rounded-xl text-sm bg-white placeholder:text-gray-400 outline-none transition ${
                    errors.password ? 'border-red-300 ring-2 ring-red-100' : 'border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100'
                  }`}
                  placeholder="••••••••" autoComplete="current-password" />
                <button type="button" onClick={() => setShowPassword(s => !s)} tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-4 rtl:left-4 rtl:right-auto top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-600 transition">
                  {showPassword ? <FiEyeOff size={17} /> : <FiEye size={17} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 flex items-start gap-1.5 text-[12px] font-medium text-red-600 animate-fade-in">
                  <FiAlertCircle size={13} className="mt-0.5 shrink-0" /> {errors.password}
                </p>
              )}
            </div>
            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3.5 rounded-xl font-semibold text-sm shadow-lg shadow-green-200 hover:shadow-xl hover:shadow-green-300 hover:scale-[1.01] disabled:opacity-50 transition-all">
              {loading ? t('common.loading') : (
                <>{t('auth.loginBtn')} <FiArrowRight size={16} className="rtl:rotate-180" /></>
              )}
            </button>
          </form>

          <p className="text-center mt-6 text-sm text-gray-600">
            {t('auth.noAccount')}{' '}
            <Link to="/register" className="text-green-600 font-semibold hover:text-green-700">{t('nav.register')}</Link>
          </p>

          {/* Demo credentials hint */}
          <div className="mt-6 bg-blue-50 border border-blue-100 rounded-xl p-3.5 text-xs text-blue-800">
            <p className="font-semibold mb-1">💡 {isUrdu ? 'ڈیمو اکاؤنٹس' : 'Demo Accounts'}</p>
            <p><strong>{isUrdu ? 'ایڈمن:' : 'Admin:'}</strong> admin@agrismart360.com / admin123</p>
            <p><strong>{isUrdu ? 'کسان:' : 'Farmer:'}</strong> farmer@agrismart360.com / farmer123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
