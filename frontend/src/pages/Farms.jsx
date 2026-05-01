import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { farmAPI, locationAPI } from '../services/api';
import { Input, Select, Button, Card, Textarea } from '../components/ui/FormControls';
import { FiPlus, FiMapPin, FiHome, FiX, FiArrowRight, FiEdit2, FiTrash2, FiDroplet, FiSun } from 'react-icons/fi';
import toast from 'react-hot-toast';

const SOIL_TYPES = [
  { v: 'sandy', en: 'Sandy', ur: 'ریتلی' },
  { v: 'loamy', en: 'Loamy', ur: 'میرا' },
  { v: 'clay', en: 'Clay', ur: 'چکنی' },
  { v: 'silty', en: 'Silty', ur: 'گاد دار' },
  { v: 'sandy_loam', en: 'Sandy Loam', ur: 'ریتلی میرا' },
  { v: 'clay_loam', en: 'Clay Loam', ur: 'چکنی میرا' },
];

const IRRIGATION = [
  { v: 'canal', en: 'Canal', ur: 'نہر' },
  { v: 'tubewell', en: 'Tubewell', ur: 'ٹیوب ویل' },
  { v: 'rain_fed', en: 'Rain-fed', ur: 'بارانی' },
  { v: 'mixed', en: 'Mixed', ur: 'مخلوط' },
  { v: 'drip', en: 'Drip', ur: 'ڈرپ' },
];

const OWNERSHIP = [
  { v: 'owned', en: 'Owned', ur: 'ذاتی' },
  { v: 'leased', en: 'Leased', ur: 'ٹھیکہ پر' },
  { v: 'shared', en: 'Shared', ur: 'مشترکہ' },
  { v: 'family', en: 'Family', ur: 'خاندانی' },
];

export default function Farms() {
  const { i18n } = useTranslation();
  const isUrdu = i18n.language === 'ur';
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingFarm, setEditingFarm] = useState(null);
  const [locations, setLocations] = useState([]);

  const blankForm = {
    name: '', village: '', locationID: '',
    totalAreaAcres: '', soilType: 'loamy',
    irrigationSource: 'canal', ownership: 'owned', notes: ''
  };
  const [form, setForm] = useState(blankForm);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const load = async () => {
    setLoading(true);
    try {
      const res = await farmAPI.list();
      setFarms(res.data.data || []);
    } catch (err) { /* ignore */ }
    finally { setLoading(false); }
  };

  useEffect(() => {
    load();
    locationAPI.getAll().then(res => setLocations(res.data.data || [])).catch(() => {});
  }, []);

  const openCreate = () => {
    setEditingFarm(null);
    setForm(blankForm);
    setShowForm(true);
  };

  const openEdit = (farm) => {
    setEditingFarm(farm);
    setForm({
      name: farm.name || '',
      village: farm.village || '',
      locationID: farm.locationID?._id || farm.locationID || '',
      totalAreaAcres: farm.totalAreaAcres || '',
      soilType: farm.soilType || 'loamy',
      irrigationSource: farm.irrigationSource || 'canal',
      ownership: farm.ownership || 'owned',
      notes: farm.notes || ''
    });
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!form.name || !form.totalAreaAcres) {
      toast.error(isUrdu ? 'نام اور رقبہ ضروری ہیں' : 'Name and area are required');
      return;
    }
    try {
      const payload = { ...form, totalAreaAcres: parseFloat(form.totalAreaAcres) };
      if (!payload.locationID) delete payload.locationID;

      if (editingFarm) {
        await farmAPI.update(editingFarm._id, payload);
        toast.success(isUrdu ? 'فارم اپ ڈیٹ ہو گیا' : 'Farm updated');
      } else {
        await farmAPI.create(payload);
        toast.success(isUrdu ? 'نیا فارم شامل ہو گیا!' : 'Farm added!');
      }
      setShowForm(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const handleDelete = async (farm) => {
    if (!confirm(isUrdu ? `"${farm.name}" حذف کریں؟` : `Delete "${farm.name}"?`)) return;
    try {
      await farmAPI.delete(farm._id);
      toast.success(isUrdu ? 'فارم آرکائیو ہو گیا' : 'Farm archived');
      load();
    } catch { toast.error('Failed'); }
  };

  return (
    <div className="space-y-4 sm:space-y-5 animate-fade-in-up">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-green-600 to-teal-700 rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-7 text-white card-elevated">
        <div className="absolute top-0 right-0 rtl:left-0 rtl:right-auto w-44 sm:w-60 h-44 sm:h-60 bg-white/10 rounded-full -mr-16 sm:-mr-20 -mt-16 sm:-mt-20 blur-2xl" />
        <div className="relative flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 backdrop-blur rounded-xl sm:rounded-2xl flex items-center justify-center text-2xl sm:text-3xl shrink-0">🚜</div>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold truncate">
                {isUrdu ? 'میرے فارم' : 'My Farms'}
              </h1>
              <p className="text-emerald-100 text-xs sm:text-sm mt-1">
                {isUrdu
                  ? `${farms.length} فارم ٹریک کریں — ہر ایک کے لیے علیحدہ فصلیں`
                  : `Manage ${farms.length} farms — separate crops, expenses & schedules per plot`}
              </p>
            </div>
          </div>
          <button onClick={openCreate}
            className="flex items-center gap-1.5 bg-white text-emerald-700 hover:bg-emerald-50 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold shadow-lg transition shrink-0">
            <FiPlus size={14} /> {isUrdu ? 'نیا فارم' : 'Add Farm'}
          </button>
        </div>
      </div>

      {/* Empty state */}
      {!loading && farms.length === 0 && (
        <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 py-12 sm:py-16 text-center">
          <div className="text-6xl sm:text-7xl mb-3">🌾</div>
          <h3 className="font-bold text-gray-900 text-lg mb-1">
            {isUrdu ? 'ابھی کوئی فارم نہیں' : 'No farms yet'}
          </h3>
          <p className="text-sm text-gray-500 max-w-sm mx-auto mb-5 px-4">
            {isUrdu
              ? 'اپنا پہلا فارم شامل کریں اور علیحدہ پلاٹ، فصلیں، اور اخراجات ٹریک کریں'
              : 'Add your first farm to start tracking individual plots, crops, and expenses'}
          </p>
          <button onClick={openCreate}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition">
            <FiPlus size={15} /> {isUrdu ? 'پہلا فارم بنائیں' : 'Add First Farm'}
          </button>
        </div>
      )}

      {/* Farms grid */}
      {farms.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {farms.map(farm => {
            const activeCrops = farm.crops?.filter(c => ['planned', 'sown', 'growing'].includes(c.status)).length || 0;
            return (
              <div key={farm._id} className="bg-white rounded-2xl border border-gray-100 hover:border-emerald-200 hover:shadow-md transition-all overflow-hidden">
                {/* Top gradient strip */}
                <div className="h-2 bg-gradient-to-r from-emerald-500 to-green-500" />
                <div className="p-4 sm:p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-11 h-11 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center text-xl">
                      🌾
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(farm)}
                        className="w-8 h-8 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 flex items-center justify-center">
                        <FiEdit2 size={14} />
                      </button>
                      <button onClick={() => handleDelete(farm)}
                        className="w-8 h-8 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 flex items-center justify-center">
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <h3 className="font-bold text-gray-900 text-base sm:text-lg truncate">{farm.name}</h3>
                  {farm.locationID && (
                    <p className="text-xs sm:text-sm text-gray-500 mt-0.5 flex items-center gap-1 truncate">
                      <FiMapPin size={11} className="shrink-0" />
                      {farm.village ? `${farm.village}, ` : ''}{isUrdu && farm.locationID.cityUrdu ? farm.locationID.cityUrdu : farm.locationID.city}
                    </p>
                  )}

                  {/* Stats row */}
                  <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-gray-100">
                    <div>
                      <p className="text-[10px] uppercase text-gray-400 font-semibold">{isUrdu ? 'رقبہ' : 'Area'}</p>
                      <p className="text-sm font-bold text-gray-900">{farm.totalAreaAcres} <span className="text-[10px] text-gray-500">{isUrdu ? 'ایکڑ' : 'acres'}</span></p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase text-gray-400 font-semibold">{isUrdu ? 'فعال' : 'Active'}</p>
                      <p className="text-sm font-bold text-emerald-600">{activeCrops} <span className="text-[10px] text-gray-500">{isUrdu ? 'فصلیں' : 'crops'}</span></p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase text-gray-400 font-semibold">{isUrdu ? 'مٹی' : 'Soil'}</p>
                      <p className="text-sm font-bold text-gray-700 truncate">
                        {SOIL_TYPES.find(s => s.v === farm.soilType)?.[isUrdu ? 'ur' : 'en']?.split(' ')[0] || farm.soilType}
                      </p>
                    </div>
                  </div>

                  <Link to={`/farms/${farm._id}`}
                    className="mt-4 flex items-center justify-center gap-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 py-2 rounded-xl text-xs sm:text-sm font-semibold transition">
                    {isUrdu ? 'تفصیل دیکھیں' : 'View Details'} <FiArrowRight size={12} className="rtl:rotate-180" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4 animate-fade-in-up" onClick={() => setShowForm(false)}>
          <div onClick={e => e.stopPropagation()} className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6 relative">
            <button onClick={() => setShowForm(false)} className="absolute top-4 right-4 rtl:left-4 rtl:right-auto w-8 h-8 rounded-lg hover:bg-gray-100 text-gray-400 flex items-center justify-center">
              <FiX size={18} />
            </button>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
              {editingFarm ? (isUrdu ? 'فارم میں ترمیم' : 'Edit Farm') : (isUrdu ? 'نیا فارم' : 'Add New Farm')}
            </h3>
            <div className="space-y-4">
              <Input
                label={isUrdu ? 'فارم کا نام' : 'Farm Name'}
                value={form.name} onChange={set('name')}
                placeholder={isUrdu ? 'مثلاً: گاؤں والا کھیت' : 'e.g. Bahawalpur Plot'}
                icon={FiHome}
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label={isUrdu ? 'رقبہ (ایکڑ)' : 'Area (acres)'}
                  type="number" min="0.1" step="0.1"
                  value={form.totalAreaAcres} onChange={set('totalAreaAcres')}
                />
                <Input
                  label={isUrdu ? 'گاؤں / موضع' : 'Village / Mauza'}
                  value={form.village} onChange={set('village')}
                  placeholder={isUrdu ? 'گاؤں کا نام' : 'Village name'}
                />
              </div>
              <Select
                label={isUrdu ? 'شہر' : 'City'}
                value={form.locationID} onChange={set('locationID')}
                options={[
                  { value: '', label: isUrdu ? '— شہر منتخب کریں —' : '— Select city —' },
                  ...locations.map(l => ({ value: l._id, label: `${isUrdu && l.cityUrdu ? l.cityUrdu : l.city}, ${l.province}` }))
                ]}
              />
              <div className="grid grid-cols-2 gap-3">
                <Select
                  label={isUrdu ? 'مٹی کی قسم' : 'Soil Type'}
                  icon={FiSun}
                  value={form.soilType} onChange={set('soilType')}
                  options={SOIL_TYPES.map(s => ({ value: s.v, label: isUrdu ? s.ur : s.en }))}
                />
                <Select
                  label={isUrdu ? 'آبپاشی' : 'Irrigation'}
                  icon={FiDroplet}
                  value={form.irrigationSource} onChange={set('irrigationSource')}
                  options={IRRIGATION.map(s => ({ value: s.v, label: isUrdu ? s.ur : s.en }))}
                />
              </div>
              <Select
                label={isUrdu ? 'ملکیت' : 'Ownership'}
                value={form.ownership} onChange={set('ownership')}
                options={OWNERSHIP.map(s => ({ value: s.v, label: isUrdu ? s.ur : s.en }))}
              />
              <Textarea
                label={isUrdu ? 'نوٹس (اختیاری)' : 'Notes (optional)'}
                rows={2}
                value={form.notes} onChange={set('notes')}
                placeholder={isUrdu ? 'کوئی اضافی معلومات' : 'Any additional info'}
              />
              <Button onClick={handleSubmit} className="w-full">
                {editingFarm ? (isUrdu ? 'محفوظ کریں' : 'Save Changes') : (isUrdu ? 'فارم بنائیں' : 'Create Farm')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
