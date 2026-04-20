import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { authAPI, locationAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { FiUser, FiMail, FiLock, FiPhone, FiMapPin, FiGlobe, FiArrowRight } from 'react-icons/fi';

export default function Register() {
  const { t, i18n } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const isUrdu = i18n.language === 'ur';
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    fullName: '', email: '', phone: '', password: '', confirmPassword: '',
    language: 'en', country: '', province: '', city: '', locationID: ''
  });
  const [countries, setCountries] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);

  useEffect(() => {
    locationAPI.getCountries().then(res => setCountries(res.data.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (form.country) {
      locationAPI.getProvinces(form.country).then(res => setProvinces(res.data.data)).catch(() => {});
      setForm(f => ({ ...f, province: '', city: '', locationID: '' }));
    }
  }, [form.country]);

  useEffect(() => {
    if (form.country && form.province) {
      locationAPI.getCities(form.country, form.province).then(res => setCities(res.data.data)).catch(() => {});
      setForm(f => ({ ...f, city: '', locationID: '' }));
    }
  }, [form.province]);

  const set = (field) => (e) => {
    const val = e.target.value;
    setForm(f => ({ ...f, [field]: val }));
    if (field === 'city') {
      const city = cities.find(c => c.name === val);
      if (city) setForm(f => ({ ...f, city: val, locationID: city.id }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      return toast.error(isUrdu ? 'پاس ورڈ مماثل نہیں' : 'Passwords do not match');
    }
    setLoading(true);
    try {
      const res = await authAPI.register({
        fullName: form.fullName,
        email: form.email || undefined,
        phone: form.phone || undefined,
        password: form.password,
        language: form.language,
        locationID: form.locationID || undefined
      });
      login(res.data.data);
      toast.success(isUrdu ? 'اکاؤنٹ بن گیا!' : 'Account created!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  const toggleLang = () => i18n.changeLanguage(isUrdu ? 'en' : 'ur');

  const inputClass = "w-full pl-11 rtl:pr-11 rtl:pl-4 pr-4 py-3.5 border border-gray-200 rounded-xl text-sm bg-white focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none placeholder:text-gray-400";
  const selectClass = "w-full px-4 py-3.5 border border-gray-200 rounded-xl text-sm bg-white focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none disabled:bg-gray-50";

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <div className="max-w-2xl mx-auto p-6 md:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-11 h-11 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center text-xl shadow-lg shadow-green-200">🌾</div>
            <span className="text-lg font-bold text-gray-900">{t('app.name')}</span>
          </Link>
          <button onClick={toggleLang} className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 bg-white border border-gray-200 px-3.5 py-2 rounded-full card-soft">
            <FiGlobe size={14} /> {isUrdu ? 'English' : 'اردو'}
          </button>
        </div>

        {/* Title */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">{t('auth.registerTitle')}</h2>
          <p className="text-gray-500 text-sm mt-1">{t('auth.registerSubtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl card-elevated p-6 md:p-8 space-y-5 border border-gray-100">
          {/* Full Name */}
          <div>
            <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">{t('auth.fullName')}</label>
            <div className="relative">
              <FiUser className="absolute left-4 rtl:right-4 rtl:left-auto top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input type="text" required value={form.fullName} onChange={set('fullName')}
                className={inputClass} placeholder="Khalid Mehmood" />
            </div>
          </div>

          {/* Email & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">{t('auth.email')}</label>
              <div className="relative">
                <FiMail className="absolute left-4 rtl:right-4 rtl:left-auto top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input type="email" value={form.email} onChange={set('email')}
                  className={inputClass} placeholder="you@example.com" />
              </div>
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">{t('auth.phone')}</label>
              <div className="relative">
                <FiPhone className="absolute left-4 rtl:right-4 rtl:left-auto top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input type="tel" value={form.phone} onChange={set('phone')}
                  className={inputClass} placeholder="+923001234567" />
              </div>
            </div>
          </div>

          {/* Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">{t('auth.password')}</label>
              <div className="relative">
                <FiLock className="absolute left-4 rtl:right-4 rtl:left-auto top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input type="password" required minLength={8} value={form.password} onChange={set('password')}
                  className={inputClass} placeholder="Min 8 characters" />
              </div>
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">{t('auth.confirmPassword')}</label>
              <div className="relative">
                <FiLock className="absolute left-4 rtl:right-4 rtl:left-auto top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input type="password" required minLength={8} value={form.confirmPassword} onChange={set('confirmPassword')}
                  className={inputClass} placeholder="Repeat password" />
              </div>
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
