import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { userAPI, locationAPI, cropAPI } from '../services/api';
import { Input, Select, Button, Card } from '../components/ui/FormControls';
import toast from 'react-hot-toast';
import {
  FiSave, FiLock, FiMapPin, FiBell, FiUser, FiPackage, FiGlobe,
  FiMail, FiPhone, FiShield, FiSun, FiMoon, FiCheckCircle
} from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext';

const TABS = [
  { id: 'personal', en: 'Personal', ur: 'ذاتی', icon: FiUser },
  { id: 'location', en: 'Location', ur: 'مقام', icon: FiMapPin },
  { id: 'crops', en: 'Crops', ur: 'فصلیں', icon: FiPackage },
  { id: 'notifications', en: 'Notifications', ur: 'اطلاعات', icon: FiBell },
  { id: 'security', en: 'Security', ur: 'سیکیورٹی', icon: FiShield },
  { id: 'preferences', en: 'Preferences', ur: 'ترجیحات', icon: FiGlobe },
];

export default function Profile() {
  const { i18n } = useTranslation();
  const { user, updateUser } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const isUrdu = i18n.language === 'ur';

  const [tab, setTab] = useState('personal');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    fullName: '', notifEmail: true, notifSMS: false, notifTime: '06:00'
  });
  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
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
    locationAPI.getCountries().then(res => setCountries(Array.isArray(res.data?.data) ? res.data.data : [])).catch(() => setCountries([]));
  }, [user]);

  useEffect(() => {
    if (locForm.country) {
      locationAPI.getProvinces(locForm.country)
        .then(res => setProvinces(Array.isArray(res.data?.data) ? res.data.data : []))
        .catch(() => setProvinces([]));
    }
  }, [locForm.country]);

  useEffect(() => {
    if (locForm.country && locForm.province) {
      locationAPI.getCities(locForm.country, locForm.province)
        .then(res => setCities(Array.isArray(res.data?.data) ? res.data.data : []))
        .catch(() => setCities([]));
    }
  }, [locForm.province]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });
  const setLoc = (k) => (e) => {
    const val = e.target.value;
    setLocForm(p => ({ ...p, [k]: val }));
    if (k === 'city') {
      const c = cities.find(c => c.name === val);
      if (c) setLocForm(p => ({ ...p, city: val, locationID: c.id }));
    }
  };

  const toggleCrop = (cropId) => {
    setSelectedCrops(prev => prev.includes(cropId) ? prev.filter(c => c !== cropId) : [...prev, cropId]);
  };

  const savePersonal = async () => {
    setSaving(true);
    try {
      const res = await userAPI.updateProfile({ fullName: form.fullName });
      updateUser(res.data.data);
      toast.success(isUrdu ? 'محفوظ ہو گیا' : 'Saved');
    } catch (err) { toast.error('Failed'); }
    finally { setSaving(false); }
  };

  const saveLocation = async () => {
    if (!locForm.locationID) {
      toast.error(isUrdu ? 'شہر منتخب کریں' : 'Select a city');
      return;
    }
    setSaving(true);
    try {
      const res = await userAPI.updateProfile({ locationID: locForm.locationID });
      updateUser(res.data.data);
      toast.success(isUrdu ? 'مقام محفوظ ہو گیا' : 'Location saved');
    } catch (err) { toast.error('Failed'); }
    finally { setSaving(false); }
  };

  const saveCrops = async () => {
    setSaving(true);
    try {
      const res = await userAPI.updateProfile({ selectedCrops });
      updateUser(res.data.data);
      toast.success(isUrdu ? `${selectedCrops.length} فصلیں محفوظ` : `${selectedCrops.length} crops saved`);
    } catch (err) { toast.error('Failed'); }
    finally { setSaving(false); }
  };

  const saveNotifications = async () => {
    setSaving(true);
    try {
      const res = await userAPI.updateProfile({
        notifEmail: form.notifEmail,
        notifSMS: form.notifSMS,
        notifTime: form.notifTime
      });
      updateUser(res.data.data);
      toast.success(isUrdu ? 'اطلاعات کی ترتیبات محفوظ' : 'Notification settings saved');
    } catch (err) { toast.error('Failed'); }
    finally { setSaving(false); }
  };

  const changePassword = async () => {
    if (passForm.newPassword !== passForm.confirmPassword) {
      toast.error(isUrdu ? 'پاس ورڈ مماثل نہیں' : 'Passwords do not match');
      return;
    }
    if (passForm.newPassword.length < 8) {
      toast.error(isUrdu ? 'پاس ورڈ کم از کم 8 حروف' : 'Min 8 characters');
      return;
    }
    setSaving(true);
    try {
      await userAPI.changePassword({
        currentPassword: passForm.currentPassword,
        newPassword: passForm.newPassword
      });
      toast.success(isUrdu ? 'پاس ورڈ تبدیل ہو گیا' : 'Password changed');
      setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const setLanguage = (lang) => {
    i18n.changeLanguage(lang);
    userAPI.updateProfile({ language: lang })
      .then(res => updateUser(res.data.data))
      .catch(() => {});
    toast.success(lang === 'ur' ? 'زبان اردو پر سیٹ ہو گئی' : 'Language set to English');
  };

  return (
    <div className="space-y-4 sm:space-y-5 animate-fade-in-up">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-700 via-gray-800 to-zinc-900 rounded-2xl sm:rounded-3xl p-5 sm:p-6 text-white card-elevated">
        <div className="absolute top-0 right-0 rtl:left-0 rtl:right-auto w-44 h-44 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
        <div className="relative flex items-center gap-3 sm:gap-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl font-bold shrink-0 shadow-lg">
            {user?.fullName?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl font-bold truncate">{user?.fullName}</h1>
            <p className="text-gray-300 text-xs sm:text-sm truncate">{user?.email || user?.phone}</p>
            {user?.role === 'admin' && (
              <span className="inline-block mt-1 text-[10px] bg-red-500 text-white px-2 py-0.5 rounded-full font-bold uppercase">Admin</span>
            )}
          </div>
        </div>
      </div>

      {/* Tabs (scroll horizontally on mobile) */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {TABS.map(t => {
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`shrink-0 flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
                tab === t.id ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}>
              <Icon size={14} /> {isUrdu ? t.ur : t.en}
            </button>
          );
        })}
      </div>

      {/* Personal */}
      {tab === 'personal' && (
        <Card title={isUrdu ? 'ذاتی معلومات' : 'Personal Information'}>
          <div className="space-y-4">
            <Input label={isUrdu ? 'پورا نام' : 'Full Name'} icon={FiUser}
              value={form.fullName} onChange={set('fullName')} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input label={isUrdu ? 'ای میل' : 'Email'} icon={FiMail}
                value={user?.email || ''} disabled />
              <Input label={isUrdu ? 'فون' : 'Phone'} icon={FiPhone}
                value={user?.phone || ''} disabled />
            </div>
            <p className="text-[11px] text-gray-400">
              {isUrdu ? 'ای میل اور فون تبدیل کرنے کے لیے سپورٹ سے رابطہ کریں' : 'Contact support to change email or phone'}
            </p>
            <Button onClick={savePersonal} loading={saving} icon={FiSave}>
              {isUrdu ? 'محفوظ کریں' : 'Save Changes'}
            </Button>
          </div>
        </Card>
      )}

      {/* Location */}
      {tab === 'location' && (
        <Card title={isUrdu ? 'بنیادی مقام' : 'Primary Location'}>
          <div className="space-y-4">
            <p className="text-xs text-gray-500">
              {isUrdu
                ? 'یہ آپ کا بنیادی مقام ہے۔ موسم اور قیمتوں کی پیشگوئی اس کے مطابق ہوگی۔ مزید فارمز "میرے فارم" میں شامل کریں۔'
                : 'This is your primary location for weather forecasts and pricing. Add additional farms in "My Farms".'}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Select label={isUrdu ? 'ملک' : 'Country'} value={locForm.country} onChange={setLoc('country')}
                options={[{ value: '', label: '—' }, ...countries.map(c => ({ value: c.name, label: c.name }))]} />
              <Select label={isUrdu ? 'صوبہ' : 'Province'} value={locForm.province} onChange={setLoc('province')}
                options={[{ value: '', label: '—' }, ...provinces.map(p => ({ value: p.name, label: p.name }))]}
                disabled={!locForm.country} />
              <Select label={isUrdu ? 'شہر' : 'City'} value={locForm.city} onChange={setLoc('city')}
                options={[{ value: '', label: '—' }, ...cities.map(c => ({ value: c.name, label: c.name }))]}
                disabled={!locForm.province} />
            </div>
            <Button onClick={saveLocation} loading={saving} icon={FiSave}>
              {isUrdu ? 'مقام محفوظ کریں' : 'Save Location'}
            </Button>
          </div>
        </Card>
      )}

      {/* Crops */}
      {tab === 'crops' && (
        <Card title={isUrdu ? 'میری فصلیں' : 'My Crops'}>
          <p className="text-xs text-gray-500 mb-4">
            {isUrdu ? 'منتخب فصلوں کی قیمتیں روزانہ ای میل میں آئیں گی' : 'Selected crops appear in your daily price digest'}
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3 mb-4">
            {crops.map(c => (
              <button key={c._id} onClick={() => toggleCrop(c._id)}
                className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${
                  selectedCrops.includes(c._id)
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-100 bg-gray-50 hover:border-green-200'
                }`}>
                <span className="text-2xl">🌾</span>
                <span className="text-[10px] sm:text-xs font-semibold text-gray-700 text-center truncate w-full">
                  {isUrdu && c.cropNameUrdu ? c.cropNameUrdu : c.cropName}
                </span>
                {selectedCrops.includes(c._id) && <FiCheckCircle className="text-green-600" size={11} />}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-gray-400 mb-4">
            {selectedCrops.length} {isUrdu ? 'منتخب' : 'selected'}
          </p>
          <Button onClick={saveCrops} loading={saving} icon={FiSave}>
            {isUrdu ? 'فصلیں محفوظ کریں' : 'Save Crops'}
          </Button>
        </Card>
      )}

      {/* Notifications */}
      {tab === 'notifications' && (
        <Card title={isUrdu ? 'اطلاعات کی ترتیبات' : 'Notification Settings'}>
          <div className="space-y-4">
            <label className="flex items-start gap-3 p-4 rounded-xl border-2 border-gray-100 hover:border-green-200 cursor-pointer transition-all">
              <input type="checkbox" checked={form.notifEmail} onChange={set('notifEmail')}
                className="w-5 h-5 mt-0.5 accent-green-600" />
              <div className="flex-1">
                <p className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                  📧 {isUrdu ? 'ای میل اطلاعات' : 'Email Notifications'}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {isUrdu ? 'روزانہ صبح قیمتیں + موسم + خبریں' : 'Daily morning digest with prices + weather + news'}
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 p-4 rounded-xl border-2 border-gray-100 hover:border-green-200 cursor-pointer transition-all">
              <input type="checkbox" checked={form.notifSMS} onChange={set('notifSMS')}
                className="w-5 h-5 mt-0.5 accent-green-600" />
              <div className="flex-1">
                <p className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                  📱 {isUrdu ? 'ایس ایم ایس الرٹس' : 'SMS Alerts'}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {isUrdu ? 'صرف اہم الرٹس (موسم، قیمت، بیماری)' : 'Critical alerts only (weather, prices, disease)'}
                </p>
              </div>
            </label>

            <Input label={isUrdu ? 'صبح کی اطلاع کا وقت' : 'Daily Digest Time'}
              icon={FiBell} type="time" value={form.notifTime} onChange={set('notifTime')} />

            <Button onClick={saveNotifications} loading={saving} icon={FiSave}>
              {isUrdu ? 'محفوظ کریں' : 'Save Settings'}
            </Button>
          </div>
        </Card>
      )}

      {/* Security */}
      {tab === 'security' && (
        <Card title={isUrdu ? 'پاس ورڈ تبدیل کریں' : 'Change Password'}>
          <div className="space-y-4 max-w-md">
            <Input label={isUrdu ? 'موجودہ پاس ورڈ' : 'Current Password'}
              icon={FiLock} type="password"
              value={passForm.currentPassword}
              onChange={(e) => setPassForm({ ...passForm, currentPassword: e.target.value })} />
            <Input label={isUrdu ? 'نیا پاس ورڈ' : 'New Password'}
              icon={FiLock} type="password" minLength={8}
              value={passForm.newPassword}
              onChange={(e) => setPassForm({ ...passForm, newPassword: e.target.value })}
              placeholder={isUrdu ? 'کم از کم 8 حروف' : 'Min 8 characters'} />
            <Input label={isUrdu ? 'پاس ورڈ کی تصدیق' : 'Confirm New Password'}
              icon={FiLock} type="password"
              value={passForm.confirmPassword}
              onChange={(e) => setPassForm({ ...passForm, confirmPassword: e.target.value })} />
            <Button onClick={changePassword} loading={saving} icon={FiLock}
              disabled={!passForm.currentPassword || !passForm.newPassword}>
              {isUrdu ? 'پاس ورڈ تبدیل کریں' : 'Change Password'}
            </Button>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-100">
            <h4 className="font-bold text-red-700 text-sm mb-2">⚠ {isUrdu ? 'خطرناک زون' : 'Danger Zone'}</h4>
            <p className="text-xs text-gray-500 mb-3">
              {isUrdu ? 'اکاؤنٹ حذف کرنے کے لیے سپورٹ سے رابطہ کریں' : 'To delete your account, please contact support'}
            </p>
            <a href="mailto:admin@agrismart360.com?subject=Account Deletion Request"
              className="inline-block bg-red-50 text-red-700 px-4 py-2 rounded-xl text-xs font-semibold hover:bg-red-100">
              📧 {isUrdu ? 'اکاؤنٹ حذف کی درخواست' : 'Request Account Deletion'}
            </a>
          </div>
        </Card>
      )}

      {/* Preferences */}
      {tab === 'preferences' && (
        <Card title={isUrdu ? 'ترجیحات' : 'Preferences'}>
          <div className="space-y-5">
            <div>
              <label className="block text-[13px] font-semibold text-gray-700 mb-2">
                🌐 {isUrdu ? 'زبان' : 'Language'}
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setLanguage('en')}
                  className={`py-3 rounded-xl font-semibold text-sm border-2 transition-all flex items-center justify-center gap-2 ${
                    i18n.language === 'en' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-600'
                  }`}>
                  🇬🇧 English
                </button>
                <button onClick={() => setLanguage('ur')}
                  className={`py-3 rounded-xl font-semibold text-sm border-2 transition-all flex items-center justify-center gap-2 ${
                    i18n.language === 'ur' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-600'
                  }`}>
                  🇵🇰 اردو
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-gray-700 mb-2">
                🎨 {isUrdu ? 'تھیم' : 'Theme'}
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => darkMode && toggleDarkMode()}
                  className={`py-3 rounded-xl font-semibold text-sm border-2 transition-all flex items-center justify-center gap-2 ${
                    !darkMode ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-600'
                  }`}>
                  <FiSun size={16} /> {isUrdu ? 'لائٹ' : 'Light'}
                </button>
                <button onClick={() => !darkMode && toggleDarkMode()}
                  className={`py-3 rounded-xl font-semibold text-sm border-2 transition-all flex items-center justify-center gap-2 ${
                    darkMode ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-600'
                  }`}>
                  <FiMoon size={16} /> {isUrdu ? 'ڈارک' : 'Dark'}
                </button>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
              <h4 className="font-semibold text-blue-900 text-sm mb-1">
                💡 {isUrdu ? 'ٹِپ' : 'Pro Tip'}
              </h4>
              <p className="text-xs text-blue-800">
                {isUrdu
                  ? 'موسم اور قیمتوں کی اطلاعات پانے کے لیے "اطلاعات" ٹیب میں ای میل اور SMS فعال کریں۔'
                  : 'Enable both email and SMS in the Notifications tab to never miss critical price alerts.'}
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
