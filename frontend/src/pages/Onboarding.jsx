import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { farmAPI, locationAPI, cropAPI, userAPI } from '../services/api';
import { Input, Select, Button, Textarea } from '../components/ui/FormControls';
import {
  FiCheck, FiArrowRight, FiArrowLeft, FiHome, FiMapPin,
  FiBell, FiX, FiPackage
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const STEPS = [
  { id: 1, key: 'welcome', en: 'Welcome', ur: 'خوش آمدید', icon: '👋' },
  { id: 2, key: 'farm', en: 'First Farm', ur: 'پہلا فارم', icon: '🚜' },
  { id: 3, key: 'crops', en: 'Crops', ur: 'فصلیں', icon: '🌾' },
  { id: 4, key: 'alerts', en: 'Alerts', ur: 'الرٹس', icon: '🔔' },
  { id: 5, key: 'done', en: 'All Set!', ur: 'مکمل!', icon: '🎉' }
];

export default function Onboarding() {
  const { i18n } = useTranslation();
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const isUrdu = i18n.language === 'ur';

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [locations, setLocations] = useState([]);
  const [crops, setCrops] = useState([]);

  const [farmData, setFarmData] = useState({
    name: '',
    locationID: '',
    village: '',
    totalAreaAcres: '',
    soilType: 'loamy',
    irrigationSource: 'canal'
  });

  const [selectedCrops, setSelectedCrops] = useState([]);

  const [prefs, setPrefs] = useState({
    notifEmail: true,
    notifSMS: false,
    notifTime: '06:00'
  });

  useEffect(() => {
    locationAPI.getAll().then(res => setLocations(res.data.data || [])).catch(() => {});
    cropAPI.getAll().then(res => setCrops(res.data.data || [])).catch(() => {});
  }, []);

  const setF = (k) => (e) => setFarmData({ ...farmData, [k]: e.target.value });
  const setP = (k) => (e) => setPrefs({ ...prefs, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  const toggleCrop = (cropId) => {
    setSelectedCrops(prev =>
      prev.includes(cropId) ? prev.filter(c => c !== cropId) : [...prev, cropId]
    );
  };

  const next = () => setStep(s => Math.min(s + 1, STEPS.length));
  const back = () => setStep(s => Math.max(s - 1, 1));

  const skip = () => {
    localStorage.setItem('onboarded', 'true');
    navigate('/dashboard');
  };

  const finish = async () => {
    setSubmitting(true);
    try {
      // Step 2: Create farm if data provided
      if (farmData.name && farmData.totalAreaAcres) {
        const payload = {
          ...farmData,
          totalAreaAcres: parseFloat(farmData.totalAreaAcres)
        };
        if (!payload.locationID) delete payload.locationID;
        await farmAPI.create(payload);
      }

      // Step 3 + 4: Save user prefs + selected crops
      await userAPI.updateProfile({
        selectedCrops,
        notifEmail: prefs.notifEmail,
        notifSMS: prefs.notifSMS,
        notifTime: prefs.notifTime
      });

      updateUser({ selectedCrops });
      localStorage.setItem('onboarded', 'true');
      toast.success(isUrdu ? '🎉 سب تیار!' : '🎉 All set up!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Setup failed — you can do this later from Profile');
      localStorage.setItem('onboarded', 'true');
      navigate('/dashboard');
    } finally { setSubmitting(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-6 animate-fade-in-up">
      <div className="w-full max-w-2xl">
        {/* Skip top-right */}
        <div className="flex justify-end mb-4">
          <button onClick={skip} className="text-xs text-gray-500 hover:text-gray-700 font-semibold">
            {isUrdu ? 'بعد میں کریں →' : 'Skip for now →'}
          </button>
        </div>

        {/* Progress */}
        <div className="bg-white rounded-3xl card-elevated p-6 sm:p-8 border border-gray-100">
          {/* Steps */}
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex-1 flex items-center">
                <div className={`flex flex-col items-center transition-all ${
                  step >= s.id ? 'text-green-600' : 'text-gray-300'
                }`}>
                  <div className={`w-9 sm:w-10 h-9 sm:h-10 rounded-full flex items-center justify-center text-sm sm:text-base font-bold transition-all ${
                    step > s.id ? 'bg-green-600 text-white scale-110' :
                    step === s.id ? 'bg-green-100 text-green-700 ring-4 ring-green-50' :
                    'bg-gray-100 text-gray-400'
                  }`}>
                    {step > s.id ? <FiCheck size={16} /> : s.icon}
                  </div>
                  <span className="hidden sm:block text-[10px] mt-1.5 font-semibold">
                    {isUrdu ? s.ur : s.en}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-1 sm:mx-2 transition-all ${
                    step > s.id ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* Content */}
          <div className="min-h-[320px] sm:min-h-[360px] flex flex-col">
            {/* Step 1: Welcome */}
            {step === 1 && (
              <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
                <div className="text-6xl sm:text-7xl mb-2">👋</div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {isUrdu ? `خوش آمدید، ${user?.fullName?.split(' ')[0] || 'کسان'}!` : `Welcome, ${user?.fullName?.split(' ')[0] || 'Farmer'}!`}
                </h1>
                <p className="text-sm sm:text-base text-gray-600 max-w-md">
                  {isUrdu
                    ? 'AgriSmart360 آپ کی کاشتکاری کو سمارٹ بنائے گا۔ آئیے 4 منٹ میں سیٹ اپ کریں:'
                    : "Let's set up AgriSmart360 in 4 quick steps to make your farming smarter:"}
                </p>
                <div className="grid grid-cols-2 gap-3 mt-4 w-full max-w-md">
                  {[
                    { emoji: '🚜', en: 'Add your farm', ur: 'فارم شامل کریں' },
                    { emoji: '🌾', en: 'Pick your crops', ur: 'فصلیں چنیں' },
                    { emoji: '🔔', en: 'Set alerts', ur: 'الرٹس سیٹ کریں' },
                    { emoji: '🚀', en: 'Start using app', ur: 'ایپ استعمال کریں' },
                  ].map((b, i) => (
                    <div key={i} className="bg-green-50 rounded-xl p-3 flex items-center gap-2 border border-green-100">
                      <span className="text-2xl">{b.emoji}</span>
                      <span className="text-xs sm:text-sm font-medium text-green-800">{isUrdu ? b.ur : b.en}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Farm */}
            {step === 2 && (
              <div className="flex-1 space-y-4">
                <div className="text-center mb-4">
                  <div className="text-5xl mb-2">🚜</div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                    {isUrdu ? 'اپنا پہلا فارم شامل کریں' : 'Add Your First Farm'}
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">
                    {isUrdu ? 'بعد میں مزید فارمز شامل کر سکتے ہیں' : 'You can add more farms later'}
                  </p>
                </div>
                <Input
                  label={isUrdu ? 'فارم کا نام' : 'Farm Name'}
                  icon={FiHome}
                  value={farmData.name} onChange={setF('name')}
                  placeholder={isUrdu ? 'مثلاً: گاؤں والا کھیت' : 'e.g. Bahawalpur Plot'}
                />
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label={isUrdu ? 'رقبہ (ایکڑ)' : 'Area (acres)'}
                    type="number" min="0.1" step="0.1"
                    value={farmData.totalAreaAcres} onChange={setF('totalAreaAcres')}
                    placeholder="5"
                  />
                  <Input
                    label={isUrdu ? 'گاؤں' : 'Village'}
                    value={farmData.village} onChange={setF('village')}
                  />
                </div>
                <Select
                  label={isUrdu ? 'شہر' : 'City'}
                  icon={FiMapPin}
                  value={farmData.locationID} onChange={setF('locationID')}
                  options={[
                    { value: '', label: isUrdu ? '— شہر منتخب کریں —' : '— Select city —' },
                    ...locations.map(l => ({
                      value: l._id,
                      label: `${isUrdu && l.cityUrdu ? l.cityUrdu : l.city}, ${l.province}`
                    }))
                  ]}
                />
                <div className="grid grid-cols-2 gap-3">
                  <Select
                    label={isUrdu ? 'مٹی کی قسم' : 'Soil Type'}
                    value={farmData.soilType} onChange={setF('soilType')}
                    options={[
                      { value: 'loamy', label: isUrdu ? 'میرا' : 'Loamy' },
                      { value: 'sandy', label: isUrdu ? 'ریتلی' : 'Sandy' },
                      { value: 'clay', label: isUrdu ? 'چکنی' : 'Clay' },
                    ]}
                  />
                  <Select
                    label={isUrdu ? 'آبپاشی' : 'Irrigation'}
                    value={farmData.irrigationSource} onChange={setF('irrigationSource')}
                    options={[
                      { value: 'canal', label: isUrdu ? 'نہر' : 'Canal' },
                      { value: 'tubewell', label: isUrdu ? 'ٹیوب ویل' : 'Tubewell' },
                      { value: 'rain_fed', label: isUrdu ? 'بارانی' : 'Rain-fed' },
                    ]}
                  />
                </div>
              </div>
            )}

            {/* Step 3: Crops */}
            {step === 3 && (
              <div className="flex-1 space-y-4">
                <div className="text-center mb-4">
                  <div className="text-5xl mb-2">🌾</div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                    {isUrdu ? 'آپ کون سی فصلیں اگاتے ہیں؟' : 'Which crops do you grow?'}
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">
                    {isUrdu ? 'منتخب فصلوں کی قیمتیں روزانہ ای میل میں آئیں گی' : 'Selected crops will appear in your daily price digest'}
                  </p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 max-h-72 overflow-y-auto">
                  {crops.map(c => (
                    <button key={c._id} onClick={() => toggleCrop(c._id)}
                      className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${
                        selectedCrops.includes(c._id)
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-100 bg-gray-50 hover:border-green-200'
                      }`}>
                      <span className="text-xl sm:text-2xl">🌾</span>
                      <span className="text-[11px] sm:text-xs font-semibold text-gray-700 text-center">
                        {isUrdu && c.cropNameUrdu ? c.cropNameUrdu : c.cropName}
                      </span>
                      {selectedCrops.includes(c._id) && (
                        <FiCheck className="text-green-600" size={12} />
                      )}
                    </button>
                  ))}
                </div>
                <p className="text-center text-xs text-gray-400">
                  {selectedCrops.length} {isUrdu ? 'منتخب' : 'selected'}
                </p>
              </div>
            )}

            {/* Step 4: Alerts */}
            {step === 4 && (
              <div className="flex-1 space-y-4">
                <div className="text-center mb-4">
                  <div className="text-5xl mb-2">🔔</div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                    {isUrdu ? 'الرٹس کیسے ملیں؟' : 'How should we alert you?'}
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">
                    {isUrdu ? 'بعد میں سیٹنگز سے تبدیل کر سکتے ہیں' : "You can change these later in Settings"}
                  </p>
                </div>
                <div className="space-y-3">
                  <label className="flex items-start gap-3 p-4 rounded-xl border-2 border-gray-100 hover:border-green-200 cursor-pointer transition-all">
                    <input type="checkbox" checked={prefs.notifEmail} onChange={setP('notifEmail')}
                      className="w-5 h-5 mt-0.5 accent-green-600" />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                        📧 {isUrdu ? 'ای میل اطلاعات' : 'Email Notifications'}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {isUrdu
                          ? 'روزانہ صبح قیمتیں + موسم + خبریں ای میل پر'
                          : 'Daily morning digest with prices + weather + news'}
                      </p>
                    </div>
                  </label>
                  <label className="flex items-start gap-3 p-4 rounded-xl border-2 border-gray-100 hover:border-green-200 cursor-pointer transition-all">
                    <input type="checkbox" checked={prefs.notifSMS} onChange={setP('notifSMS')}
                      className="w-5 h-5 mt-0.5 accent-green-600" />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                        📱 {isUrdu ? 'ایس ایم ایس الرٹس' : 'SMS Alerts'}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {isUrdu
                          ? 'صرف اہم الرٹس (موسم، قیمت، بیماری)'
                          : 'Critical alerts only (weather, prices, disease)'}
                      </p>
                    </div>
                  </label>
                  <Input
                    label={isUrdu ? 'صبح کی اطلاع کا وقت' : 'Morning Notification Time'}
                    icon={FiBell}
                    type="time"
                    value={prefs.notifTime} onChange={setP('notifTime')}
                  />
                </div>
              </div>
            )}

            {/* Step 5: Done */}
            {step === 5 && (
              <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
                <div className="text-7xl sm:text-8xl">🎉</div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {isUrdu ? 'سب تیار!' : "You're all set!"}
                </h1>
                <p className="text-sm sm:text-base text-gray-600 max-w-md">
                  {isUrdu
                    ? `${farmData.name ? '✓ فارم بنا، ' : ''}${selectedCrops.length} فصلیں منتخب، اور الرٹس فعال ہیں۔ AgriSmart360 آپ کی مدد کے لیے تیار ہے!`
                    : `${farmData.name ? '✓ Farm created, ' : ''}${selectedCrops.length} crops selected, and alerts configured. AgriSmart360 is ready to help you grow smarter!`}
                </p>
                <div className="grid grid-cols-3 gap-2 mt-4 w-full max-w-md text-center">
                  <div className="bg-green-50 rounded-xl p-3 border border-green-100">
                    <div className="text-2xl mb-1">📊</div>
                    <p className="text-[10px] sm:text-xs font-semibold text-green-800">{isUrdu ? 'لائیو قیمتیں' : 'Live Prices'}</p>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                    <div className="text-2xl mb-1">🌤</div>
                    <p className="text-[10px] sm:text-xs font-semibold text-blue-800">{isUrdu ? 'موسم الرٹ' : 'Weather Alerts'}</p>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-3 border border-purple-100">
                    <div className="text-2xl mb-1">🤖</div>
                    <p className="text-[10px] sm:text-xs font-semibold text-purple-800">{isUrdu ? 'AI مشیر' : 'AI Advisor'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-between gap-3 mt-6 pt-6 border-t border-gray-100">
            {step > 1 ? (
              <button onClick={back}
                className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 font-semibold px-3 py-2 rounded-lg hover:bg-gray-50">
                <FiArrowLeft size={14} /> {isUrdu ? 'پیچھے' : 'Back'}
              </button>
            ) : <div />}

            {step < STEPS.length ? (
              <Button onClick={next}>
                {isUrdu ? 'آگے' : 'Next'} <FiArrowRight size={14} className="rtl:rotate-180" />
              </Button>
            ) : (
              <Button onClick={finish} loading={submitting}>
                {isUrdu ? 'شروع کریں 🚀' : "Let's Go 🚀"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
