import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { authAPI, locationAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { FiUser, FiMail, FiLock, FiMapPin, FiGlobe, FiArrowRight, FiArrowLeft, FiEye, FiEyeOff, FiAlertCircle } from 'react-icons/fi';
import useForceLight from '../../hooks/useForceLight';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Register() {
  useForceLight();
  const { t, i18n } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const isUrdu = i18n.language === 'ur';
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    fullName: '', email: '', password: '', confirmPassword: '',
    language: 'en', country: '', province: '', city: '', locationID: ''
  });
  const [countries, setCountries] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    locationAPI.getCountries()
      .then(res => setCountries(Array.isArray(res.data?.data) ? res.data.data : []))
      .catch(() => setCountries([]));
  }, []);

  useEffect(() => {
    if (form.country) {
      locationAPI.getProvinces(form.country)
        .then(res => setProvinces(Array.isArray(res.data?.data) ? res.data.data : []))
        .catch(() => setProvinces([]));
      setForm(f => ({ ...f, province: '', city: '', locationID: '' }));
    }
  }, [form.country]);

  useEffect(() => {
    if (form.country && form.province) {
      locationAPI.getCities(form.country, form.province)
        .then(res => setCities(Array.isArray(res.data?.data) ? res.data.data : []))
        .catch(() => setCities([]));
      setForm(f => ({ ...f, city: '', locationID: '' }));
    }
  }, [form.province]);

  const set = (field) => (e) => {
    const val = e.target.value;
    setForm(f => ({ ...f, [field]: val }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
    if (field === 'city') {
      const city = cities.find(c => c.name === val);
      if (city) setForm(f => ({ ...f, city: val, locationID: city.id }));
    }
  };

  const validate = () => {
    const e = {};
    if (!form.fullName || form.fullName.trim().length < 2) {
      e.fullName = isUrdu ? 'پورا نام درج کریں (کم از کم 2 حروف)' : 'Please enter your full name (at least 2 characters)';
    }
    if (!form.email) {
      e.email = isUrdu ? 'ای میل درج کریں' : 'Please enter your email';
    } else if (!EMAIL_RE.test(form.email)) {
      e.email = isUrdu ? 'درست ای میل درج کریں' : 'Please enter a valid email address';
    }
    if (!form.password) {
      e.password = isUrdu ? 'پاس ورڈ درکار ہے' : 'Password is required';
    } else if (form.password.length < 8) {
      e.password = isUrdu ? 'پاس ورڈ کم از کم 8 حروف کا ہونا چاہیے' : 'Password must be at least 8 characters';
    }
    if (!form.confirmPassword) {
      e.confirmPassword = isUrdu ? 'پاس ورڈ کی تصدیق کریں' : 'Please confirm your password';
    } else if (form.password !== form.confirmPassword) {
      e.confirmPassword = isUrdu ? 'پاس ورڈ مماثل نہیں' : 'Passwords do not match';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await authAPI.register({
        fullName: form.fullName,
        email: form.email,
        password: form.password,
        language: form.language,
        locationID: form.locationID || undefined
      });
      toast.success(
        isUrdu
          ? 'اکاؤنٹ بن گیا! اب لاگ ان کریں'
          : 'Account created! Please log in with your credentials.',
        { duration: 4500 }
      );
      // Send user to login page with their email pre-filled — they must
      // sign in with the credentials they just chose before they reach the app.
      navigate('/login', {
        replace: true,
        state: { prefillEmail: form.email, justRegistered: true }
      });
    } catch (err) {
      const data = err.response?.data;
      const field = data?.field || 'password';
      const msg = data?.message || 'Registration failed';
      setErrors(prev => ({ ...prev, [field]: msg }));
    } finally { setLoading(false); }
  };

  const toggleLang = () => i18n.changeLanguage(isUrdu ? 'en' : 'ur');
  const goWelcome = () => {
    sessionStorage.removeItem('agrismart_welcome_shown');
    navigate('/');
  };

  const fieldBase = (hasError) => hasError
    ? 'border-red-300 ring-2 ring-red-100'
    : 'border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100';
  const inputClass = (f) => `w-full pl-11 rtl:pr-11 rtl:pl-4 pr-4 py-3.5 border rounded-xl text-sm bg-white outline-none placeholder:text-gray-400 transition ${fieldBase(!!errors[f])}`;
  const pwdInputClass = (f) => `w-full pl-11 rtl:pr-11 pr-11 rtl:pl-11 py-3.5 border rounded-xl text-sm bg-white outline-none placeholder:text-gray-400 transition ${fieldBase(!!errors[f])}`;
  const selectClass = "w-full px-4 py-3.5 border border-gray-200 rounded-xl text-sm bg-white focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none disabled:bg-gray-50";

  // Inline error display helper
  const ErrLine = ({ field }) => errors[field] ? (
    <p className="mt-1.5 flex items-start gap-1.5 text-[12px] font-medium text-red-600 animate-fade-in">
      <FiAlertCircle size={13} className="mt-0.5 shrink-0" /> {errors[field]}
    </p>
  ) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <div className="max-w-2xl mx-auto p-4 sm:p-6 md:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 sm:mb-8 gap-2">
          <button
            onClick={goWelcome}
            title={isUrdu ? 'خوش آمدید صفحہ پر واپس' : 'Back to welcome'}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 shrink-0 transition"
            aria-label="Back to welcome"
          >
            <FiArrowLeft size={17} className="rtl:rotate-180" />
          </button>
          <Link to="/" className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center text-lg sm:text-xl shadow-lg shadow-green-200 shrink-0">🌾</div>
            <span className="text-base sm:text-lg font-bold text-gray-900 truncate">{t('app.name')}</span>
          </Link>
          <button onClick={toggleLang} className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 bg-white border border-gray-200 px-3 sm:px-3.5 py-2 rounded-full card-soft shrink-0">
            <FiGlobe size={14} /> {isUrdu ? 'English' : 'اردو'}
          </button>
        </div>

        {/* Title */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">{t('auth.registerTitle')}</h2>
          <p className="text-gray-500 text-sm mt-1">{t('auth.registerSubtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="bg-white rounded-3xl card-elevated p-6 md:p-8 space-y-5 border border-gray-100">
          {/* Full Name */}
          <div>
            <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">{t('auth.fullName')}</label>
            <div className="relative">
              <FiUser className={`absolute left-4 rtl:right-4 rtl:left-auto top-1/2 -translate-y-1/2 ${errors.fullName ? 'text-red-400' : 'text-gray-400'}`} size={16} />
              <input type="text" value={form.fullName} onChange={set('fullName')}
                className={inputClass('fullName')} placeholder="Khalid Mehmood" autoComplete="name" />
            </div>
            <ErrLine field="fullName" />
          </div>

          {/* Email */}
          <div>
            <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">{t('auth.email')}</label>
            <div className="relative">
              <FiMail className={`absolute left-4 rtl:right-4 rtl:left-auto top-1/2 -translate-y-1/2 ${errors.email ? 'text-red-400' : 'text-gray-400'}`} size={16} />
              <input type="email" value={form.email} onChange={set('email')}
                className={inputClass('email')} placeholder="you@example.com" autoComplete="email" />
            </div>
            <ErrLine field="email" />
          </div>

          {/* Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">{t('auth.password')}</label>
              <div className="relative">
                <FiLock className={`absolute left-4 rtl:right-4 rtl:left-auto top-1/2 -translate-y-1/2 ${errors.password ? 'text-red-400' : 'text-gray-400'}`} size={16} />
                <input type={showPwd ? 'text' : 'password'} value={form.password} onChange={set('password')}
                  className={pwdInputClass('password')} placeholder="Min 8 characters" autoComplete="new-password" />
                <button type="button" onClick={() => setShowPwd(s => !s)} tabIndex={-1}
                  aria-label={showPwd ? 'Hide password' : 'Show password'}
                  className="absolute right-4 rtl:left-4 rtl:right-auto top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-600 transition">
                  {showPwd ? <FiEyeOff size={17} /> : <FiEye size={17} />}
                </button>
              </div>
              <ErrLine field="password" />
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">{t('auth.confirmPassword')}</label>
              <div className="relative">
                <FiLock className={`absolute left-4 rtl:right-4 rtl:left-auto top-1/2 -translate-y-1/2 ${errors.confirmPassword ? 'text-red-400' : 'text-gray-400'}`} size={16} />
                <input type={showConfirm ? 'text' : 'password'} value={form.confirmPassword} onChange={set('confirmPassword')}
                  className={pwdInputClass('confirmPassword')} placeholder="Repeat password" autoComplete="new-password" />
                <button type="button" onClick={() => setShowConfirm(s => !s)} tabIndex={-1}
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
                  className="absolute right-4 rtl:left-4 rtl:right-auto top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-600 transition">
                  {showConfirm ? <FiEyeOff size={17} /> : <FiEye size={17} />}
                </button>
              </div>
              <ErrLine field="confirmPassword" />
            </div>
          </div>

          {/* Language */}
          <div>
            <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">{t('auth.selectLanguage')}</label>
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={() => setForm({ ...form, language: 'en' })}
                className={`py-3 rounded-xl font-semibold text-sm border-2 transition-all ${
                  form.language === 'en' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-600'
                }`}>
                🇬🇧 English
              </button>
              <button type="button" onClick={() => setForm({ ...form, language: 'ur' })}
                className={`py-3 rounded-xl font-semibold text-sm border-2 transition-all ${
                  form.language === 'ur' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-600'
                }`}>
                🇵🇰 اردو
              </button>
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="flex items-center gap-1.5 text-[13px] font-semibold text-gray-700 mb-1.5">
              <FiMapPin size={13} /> {t('auth.selectLocation')}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <select value={form.country} onChange={set('country')} className={selectClass}>
                <option value="">{t('auth.country')}</option>
                {countries.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
              </select>
              <select value={form.province} onChange={set('province')} className={selectClass} disabled={!form.country}>
                <option value="">{t('auth.province')}</option>
                {provinces.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
              </select>
              <select value={form.city} onChange={set('city')} className={selectClass} disabled={!form.province}>
                <option value="">{t('auth.city')}</option>
                {cities.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3.5 rounded-xl font-semibold text-sm shadow-lg shadow-green-200 hover:shadow-xl hover:scale-[1.01] disabled:opacity-50 transition-all">
            {loading ? t('common.loading') : (
              <>{t('auth.registerBtn')} <FiArrowRight size={16} className="rtl:rotate-180" /></>
            )}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-gray-600">
          {t('auth.hasAccount')}{' '}
          <Link to="/login" className="text-green-600 font-semibold hover:text-green-700">{t('nav.login')}</Link>
        </p>
      </div>
    </div>
  );
}
