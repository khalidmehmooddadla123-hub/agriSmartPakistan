import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { FiMail, FiLock, FiPhone, FiGlobe, FiArrowRight, FiCheckCircle } from 'react-icons/fi';

export default function Login() {
  const { t, i18n } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const isUrdu = i18n.language === 'ur';
  const [mode, setMode] = useState('email');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', phone: '', otp: '' });
  const set = (f) => (e) => setForm({ ...form, [f]: e.target.value });

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authAPI.login({ email: form.email, password: form.password });
      login(res.data.data);
      toast.success(isUrdu ? 'خوش آمدید!' : 'Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  const handleRequestOTP = async () => {
    setLoading(true);
    try {
      const res = await authAPI.requestOTP(form.phone);
      setOtpSent(true);
      toast.success(t('auth.otpSent'));
      if (res.data.otp) toast.success(`Dev OTP: ${res.data.otp}`, { duration: 10000 });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setLoading(false); }
  };

  const handleOTPLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authAPI.verifyOTP({ phone: form.phone, otp: form.otp });
      login(res.data.data);
      toast.success(isUrdu ? 'خوش آمدید!' : 'Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'OTP failed');
    } finally { setLoading(false); }
  };

  const toggleLang = () => i18n.changeLanguage(isUrdu ? 'en' : 'ur');

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
          <h1 className="text-4xl font-bold leading-tight mb-4">
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
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-between mb-8">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center text-xl shadow-lg shadow-green-200">🌾</div>
              <span className="text-lg font-bold text-gray-900">{t('app.name')}</span>
            </Link>
            <button onClick={toggleLang} className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full">
              <FiGlobe size={13} /> {isUrdu ? 'English' : 'اردو'}
            </button>
          </div>

          {/* Language toggle (desktop) */}
          <div className="hidden lg:flex justify-end mb-6">
            <button onClick={toggleLang} className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-green-600 bg-white border border-gray-200 px-3.5 py-2 rounded-full card-soft">
              <FiGlobe size={14} /> {isUrdu ? 'English' : 'اردو'}
            </button>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-2">{t('auth.loginTitle')}</h2>
          <p className="text-gray-500 text-sm mb-8">{t('auth.loginSubtitle')}</p>

          {/* Tabs */}
          <div className="flex bg-gray-100 rounded-2xl p-1 mb-6">
            <button
              onClick={() => { setMode('email'); setOtpSent(false); }}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all ${mode === 'email' ? 'bg-white text-green-700 card-soft' : 'text-gray-500'}`}
            >
              <FiMail className="inline mr-1.5 rtl:ml-1.5 rtl:mr-0" size={15} /> Email
            </button>
            <button
              onClick={() => setMode('otp')}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all ${mode === 'otp' ? 'bg-white text-green-700 card-soft' : 'text-gray-500'}`}
            >
              <FiPhone className="inline mr-1.5 rtl:ml-1.5 rtl:mr-0" size={15} /> {t('auth.phoneOTP')}
            </button>
          </div>

          {mode === 'email' ? (
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">{t('auth.email')}</label>
                <div className="relative">
                  <FiMail className="absolute left-4 rtl:right-4 rtl:left-auto top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input type="email" required value={form.email} onChange={set('email')}
                    className="w-full pl-11 rtl:pr-11 rtl:pl-4 pr-4 py-3.5 border border-gray-200 rounded-xl text-sm bg-white placeholder:text-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none"
                    placeholder="farmer@example.com" />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[13px] font-semibold text-gray-700">{t('auth.password')}</label>
                  <Link to="/forgot-password" className="text-[12px] font-semibold text-green-600 hover:text-green-700">{t('auth.forgotPassword')}</Link>
                </div>
                <div className="relative">
                  <FiLock className="absolute left-4 rtl:right-4 rtl:left-auto top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input type="password" required value={form.password} onChange={set('password')}
                    className="w-full pl-11 rtl:pr-11 rtl:pl-4 pr-4 py-3.5 border border-gray-200 rounded-xl text-sm bg-white placeholder:text-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none"
                    placeholder="••••••••" />
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3.5 rounded-xl font-semibold text-sm shadow-lg shadow-green-200 hover:shadow-xl hover:shadow-green-300 hover:scale-[1.01] disabled:opacity-50 transition-all">
                {loading ? t('common.loading') : (
                  <>{t('auth.loginBtn')} <FiArrowRight size={16} className="rtl:rotate-180" /></>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleOTPLogin} className="space-y-4">
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">{t('auth.phone')}</label>
                <div className="relative">
                  <FiPhone className="absolute left-4 rtl:right-4 rtl:left-auto top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input type="tel" required value={form.phone} onChange={set('phone')}
                    className="w-full pl-11 rtl:pr-11 rtl:pl-4 pr-4 py-3.5 border border-gray-200 rounded-xl text-sm bg-white focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none"
                    placeholder="+923001234567" />
                </div>
              </div>
              {!otpSent ? (
                <button type="button" onClick={handleRequestOTP} disabled={loading || !form.phone}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3.5 rounded-xl font-semibold text-sm shadow-lg shadow-green-200 hover:shadow-xl disabled:opacity-50 transition-all">
                  {loading ? t('common.loading') : t('auth.requestOTP')}
                </button>
              ) : (
                <>
                  <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-2 text-[13px] text-green-800">
                    <FiCheckCircle size={16} className="shrink-0" />
                    <span>{t('auth.otpSent')}</span>
                  </div>
                  <div>
                    <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">{t('auth.enterOTP')}</label>
                    <input type="text" required maxLength={6} value={form.otp} onChange={set('otp')}
                      className="w-full px-4 py-3.5 border border-gray-200 rounded-xl text-center text-2xl font-bold tracking-[0.5em] bg-white focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none"
                      placeholder="000000" />
                  </div>
                  <button type="submit" disabled={loading || form.otp.length !== 6}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3.5 rounded-xl font-semibold text-sm shadow-lg shadow-green-200 disabled:opacity-50 transition-all">
                    {loading ? t('common.loading') : t('auth.verifyOTP')}
                  </button>
                </>
              )}
            </form>
          )}

          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold">
              {isUrdu ? 'یا' : 'or'}
            </span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <p className="text-center text-sm text-gray-600">
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
