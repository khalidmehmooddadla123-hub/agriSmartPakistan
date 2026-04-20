import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { userAPI, locationAPI, cropAPI } from '../services/api';
import toast from 'react-hot-toast';
import { FiSave, FiLock, FiMapPin, FiBell } from 'react-icons/fi';

export default function Profile() {
  const { t } = useTranslation();
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    fullName: '', language: 'en', notifEmail: true, notifSMS: false, notifTime: '06:00'
  });
  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '' });
  const [crops, setCrops] = useState([]);
  const [selectedCrops, setSelectedCrops] = useState([]);
  const [countries, setCountries] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);
  const [locForm, setLocForm] = useState({ country: '', province: '', city: '', locationID: '' });

  useEffect(() => {
    if (user) {
      setForm({
        fullName: user.fullName || '',
        language: user.language || 'en',
        notifEmail: user.notifEmail ?? true,
        notifSMS: user.notifSMS ?? false,
        notifTime: user.notifTime || '06:00'
      });
      setSelectedCrops(user.selectedCrops?.map(c => c._id || c) || []);
      if (user.locationID) {
        const loc = user.locationID;
        setLocForm({
          country: loc.country || '', province: loc.province || '',
          city: loc.city || '', locationID: loc._id || ''
        });
      }
    }
    cropAPI.getAll().then(res => setCrops(res.data.data || [])).catch(() => {});
    locationAPI.getCountries().then(res => setCountries(res.data.data || [])).catch(() => {});
  }, [user]);

  useEffect(() => {
    if (locForm.country) {
      locationAPI.getProvinces(locForm.country).then(res => setProvinces(res.data.data || [])).catch(() => {});
    }
  }, [locForm.country]);

  useEffect(() => {
    if (locForm.country && locForm.province) {
      locationAPI.getCities(locForm.country, locForm.province).then(res => setCities(res.data.data || [])).catch(() => {});
    }
  }, [locForm.province]);

  const saveProfile = async () => {
    setLoading(true);
    try {
      const res = await userAPI.updateProfile({
        ...form,
        selectedCrops,
        locationID: locForm.locationID || undefined
      });
      updateUser(res.data.data);
      toast.success(t('profile.save') + ' ✓');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    try {
      await userAPI.changePassword(passForm);
      toast.success('Password changed!');
      setPassForm({ currentPassword: '', newPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    }
  };

  const toggleCrop = (id) => {
    setSelectedCrops(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const inputClass = "w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-sm";

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-800">{t('profile.title')}</h1>

      {/* Personal Info */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="font-semibold text-gray-800 mb-4">{t('profile.personalInfo')}</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-gray-600 mb-1">{t('auth.fullName')}</label>
            <input type="text" value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })}
              className={inputClass} />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">{t('auth.selectLanguage')}</label>
            <select value={form.language} onChange={e => setForm({ ...form, language: e.target.value })} className={inputClass}>
              <option value="en">English</option>
              <option value="ur">اردو (Urdu)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <FiMapPin size={16} /> {t('profile.locationSettings')}
        </h3>
        <div className="grid grid-cols-3 gap-3">
          <select value={locForm.country}
            onChange={e => setLocForm({ country: e.target.value, province: '', city: '', locationID: '' })}
            className={inputClass}>
            <option value="">{t('auth.country')}</option>
            {countries.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
          </select>
          <select value={locForm.province}
            onChange={e => setLocForm({ ...locForm, province: e.target.value, city: '', locationID: '' })}
            className={inputClass} disabled={!locForm.country}>
            <option value="">{t('auth.province')}</option>
            {provinces.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
          </select>
          <select value={locForm.city}
            onChange={e => {
              const city = cities.find(c => c.name === e.target.value);
              setLocForm({ ...locForm, city: e.target.value, locationID: city?.id || '' });
            }}
            className={inputClass} disabled={!locForm.province}>
            <option value="">{t('auth.city')}</option>
            {cities.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
          </select>
        </div>
      </div>

      {/* Crop Preferences */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="font-semibold text-gray-800 mb-4">{t('profile.cropPreferences')}</h3>
        <div className="flex flex-wrap gap-2">
          {crops.map(crop => (
            <button key={crop._id} onClick={() => toggleCrop(crop._id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                selectedCrops.includes(crop._id)
                  ? 'bg-green-600 text-white border-green-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-green-300'
              }`}>
              {crop.cropName}
            </button>
          ))}
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <FiBell size={16} /> {t('profile.notificationSettings')}
        </h3>
        <div className="space-y-3">
          <label className="flex items-center justify-between">
            <span className="text-sm text-gray-700">{t('profile.emailNotif')}</span>
            <input type="checkbox" checked={form.notifEmail}
              onChange={e => setForm({ ...form, notifEmail: e.target.checked })}
              className="w-5 h-5 text-green-600 rounded" />
          </label>
          <label className="flex items-center justify-between">
            <span className="text-sm text-gray-700">{t('profile.smsNotif')}</span>
            <input type="checkbox" checked={form.notifSMS}
              onChange={e => setForm({ ...form, notifSMS: e.target.checked })}
              className="w-5 h-5 text-green-600 rounded" />
          </label>
        </div>
      </div>

      <button onClick={saveProfile} disabled={loading}
        className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50 transition">
        <FiSave size={18} /> {loading ? t('common.loading') : t('profile.save')}
      </button>

      {/* Change Password */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <FiLock size={16} /> {t('profile.changePassword')}
        </h3>
        <form onSubmit={changePassword} className="space-y-3">
          <input type="password" required value={passForm.currentPassword}
            onChange={e => setPassForm({ ...passForm, currentPassword: e.target.value })}
            className={inputClass} placeholder={t('profile.currentPassword')} />
          <input type="password" required minLength={8} value={passForm.newPassword}
            onChange={e => setPassForm({ ...passForm, newPassword: e.target.value })}
            className={inputClass} placeholder={t('profile.newPassword')} />
          <button type="submit"
            className="bg-gray-800 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-900 transition">
            {t('profile.changePassword')}
          </button>
        </form>
      </div>
    </div>
  );
}
