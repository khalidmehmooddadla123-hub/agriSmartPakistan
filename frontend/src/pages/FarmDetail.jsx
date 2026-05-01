import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { farmAPI, cropAPI, weatherAPI } from '../services/api';
import { Input, Select, Button, Card, Textarea, StatBox } from '../components/ui/FormControls';
import {
  FiArrowLeft, FiPlus, FiX, FiTrash2, FiCalendar, FiDroplet,
  FiMapPin, FiCloud, FiTrendingUp, FiPackage
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const STATUS = {
  planned: { en: 'Planned', ur: 'منصوبہ', color: 'bg-gray-100 text-gray-700' },
  sown: { en: 'Sown', ur: 'بویا گیا', color: 'bg-blue-100 text-blue-700' },
  growing: { en: 'Growing', ur: 'بڑھ رہا', color: 'bg-green-100 text-green-700' },
  harvested: { en: 'Harvested', ur: 'کاٹا گیا', color: 'bg-amber-100 text-amber-700' },
  failed: { en: 'Failed', ur: 'ناکام', color: 'bg-red-100 text-red-700' }
};

export default function FarmDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const isUrdu = i18n.language === 'ur';

  const [farm, setFarm] = useState(null);
  const [crops, setCrops] = useState([]);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddCrop, setShowAddCrop] = useState(false);

  const [cropForm, setCropForm] = useState({
    cropID: '', variety: '', areaAcres: '',
    sowDate: '', status: 'planned', notes: ''
  });
  const setF = (k) => (e) => setCropForm({ ...cropForm, [k]: e.target.value });

  const load = async () => {
    setLoading(true);
    try {
      const res = await farmAPI.get(id);
      setFarm(res.data.data);
      if (res.data.data?.locationID?._id) {
        weatherAPI.getByLocation(res.data.data.locationID._id)
          .then(wRes => setWeather(wRes.data.data))
          .catch(() => {});
      }
    } catch (err) {
      toast.error('Farm not found');
      navigate('/farms');
    } finally { setLoading(false); }
  };

  useEffect(() => {
    load();
    cropAPI.getAll().then(res => setCrops(res.data.data || [])).catch(() => {});
  }, [id]);

  const addCrop = async () => {
    if (!cropForm.cropID) {
      toast.error(isUrdu ? 'فصل منتخب کریں' : 'Select a crop');
      return;
    }
    try {
      const payload = {
        ...cropForm,
        areaAcres: cropForm.areaAcres ? parseFloat(cropForm.areaAcres) : undefined
      };
      await farmAPI.addCrop(id, payload);
      toast.success(isUrdu ? 'فصل شامل ہو گئی' : 'Crop added');
      setShowAddCrop(false);
      setCropForm({ cropID: '', variety: '', areaAcres: '', sowDate: '', status: 'planned', notes: '' });
      load();
    } catch (err) { toast.error('Failed'); }
  };

  const removeCrop = async (cropEntryId, cropName) => {
    if (!confirm(isUrdu ? `"${cropName}" ہٹا دیں؟` : `Remove "${cropName}"?`)) return;
    try {
      await farmAPI.removeCrop(id, cropEntryId);
      toast.success(isUrdu ? 'فصل ہٹ گئی' : 'Crop removed');
      load();
    } catch { toast.error('Failed'); }
  };

  const updateCropStatus = async (cropEntryId, newStatus) => {
    try {
      await farmAPI.updateCrop(id, cropEntryId, { status: newStatus });
      load();
    } catch { toast.error('Failed'); }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent" /></div>;
  }

  if (!farm) return null;

  const activeCrops = farm.crops?.filter(c => ['planned', 'sown', 'growing'].includes(c.status)) || [];
  const harvestedCrops = farm.crops?.filter(c => c.status === 'harvested') || [];
  const totalAreaUsed = farm.crops?.reduce((s, c) => s + (c.areaAcres || 0), 0) || 0;

  return (
    <div className="space-y-4 sm:space-y-5 animate-fade-in-up">
      <Link to="/farms" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-emerald-600">
        <FiArrowLeft size={14} /> {isUrdu ? 'فارمز پر واپس' : 'Back to Farms'}
      </Link>

      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-green-600 to-teal-700 rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-7 text-white card-elevated">
        <div className="absolute top-0 right-0 rtl:left-0 rtl:right-auto w-44 sm:w-60 h-44 sm:h-60 bg-white/10 rounded-full -mr-16 sm:-mr-20 -mt-16 sm:-mt-20 blur-2xl" />
        <div className="relative">
          <div className="flex items-start gap-3 sm:gap-4 mb-3">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 backdrop-blur rounded-xl sm:rounded-2xl flex items-center justify-center text-2xl sm:text-3xl shrink-0">🚜</div>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold truncate">{farm.name}</h1>
              {farm.locationID && (
                <p className="text-emerald-100 text-xs sm:text-sm flex items-center gap-1 mt-0.5 truncate">
                  <FiMapPin size={11} className="shrink-0" />
                  {farm.village ? `${farm.village}, ` : ''}{isUrdu && farm.locationID.cityUrdu ? farm.locationID.cityUrdu : farm.locationID.city}
                </p>
              )}
              <div className="flex gap-2 mt-2 flex-wrap">
                <span className="text-[11px] bg-white/15 backdrop-blur px-2 py-0.5 rounded-full">{farm.totalAreaAcres} {isUrdu ? 'ایکڑ' : 'acres'}</span>
                <span className="text-[11px] bg-white/15 backdrop-blur px-2 py-0.5 rounded-full">🌍 {farm.soilType}</span>
                <span className="text-[11px] bg-white/15 backdrop-blur px-2 py-0.5 rounded-full">💧 {farm.irrigationSource}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        <StatBox
          label={isUrdu ? 'کل رقبہ' : 'Total Area'}
          value={`${farm.totalAreaAcres}`}
          subtitle={isUrdu ? 'ایکڑ' : 'acres'}
          color="green" icon={FiPackage}
        />
        <StatBox
          label={isUrdu ? 'استعمال شدہ' : 'In Use'}
          value={`${totalAreaUsed.toFixed(1)}`}
          subtitle={`${((totalAreaUsed / farm.totalAreaAcres) * 100).toFixed(0)}%`}
          color="blue" icon={FiCalendar}
        />
        <StatBox
          label={isUrdu ? 'فعال فصلیں' : 'Active Crops'}
          value={activeCrops.length}
          color="purple" icon={FiTrendingUp}
        />
        <StatBox
          label={isUrdu ? 'کاٹی گئیں' : 'Harvested'}
          value={harvestedCrops.length}
          color="yellow" icon={FiPackage}
        />
      </div>

      {/* Weather card */}
      {weather && (
        <Card>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center text-xl">🌤</div>
              <div>
                <p className="text-xs text-gray-500">{isUrdu ? 'موجودہ موسم' : 'Current Weather'}</p>
                <p className="text-xl font-bold text-gray-900">{weather.temperature}°C</p>
                <p className="text-xs text-gray-500 capitalize">{weather.description}</p>
              </div>
            </div>
            <div className="flex gap-2 sm:gap-4 text-xs">
              <span className="flex items-center gap-1 text-gray-600"><FiDroplet size={12} /> {weather.humidity}%</span>
              <span className="flex items-center gap-1 text-gray-600"><FiCloud size={12} /> {weather.windSpeed} km/h</span>
            </div>
          </div>
        </Card>
      )}

      {/* Crops section */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900 text-sm sm:text-base flex items-center gap-2">
            🌱 {isUrdu ? 'اس فارم پر فصلیں' : 'Crops on This Farm'}
          </h3>
          <button onClick={() => setShowAddCrop(true)}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition">
            <FiPlus size={12} /> {isUrdu ? 'فصل شامل کریں' : 'Add Crop'}
          </button>
        </div>

        {farm.crops?.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <div className="text-5xl mb-2">🌾</div>
            <p className="text-sm">{isUrdu ? 'ابھی کوئی فصل نہیں' : 'No crops added yet'}</p>
            <p className="text-xs mt-1">{isUrdu ? 'پہلی فصل شامل کریں' : 'Add your first crop to get started'}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {farm.crops.map(crop => {
              const status = STATUS[crop.status] || STATUS.planned;
              return (
                <div key={crop._id} className="flex items-center gap-3 p-3 sm:p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition">
                  <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center text-2xl shrink-0">🌾</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <h4 className="font-bold text-gray-900 text-sm truncate">
                        {isUrdu && crop.cropID?.cropNameUrdu ? crop.cropID.cropNameUrdu : crop.cropID?.cropName}
                      </h4>
                      {crop.variety && <span className="text-[10px] text-gray-500">({crop.variety})</span>}
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${status.color}`}>
                        {isUrdu ? status.ur : status.en}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-gray-500 flex-wrap">
                      {crop.areaAcres && <span>📐 {crop.areaAcres} {isUrdu ? 'ایکڑ' : 'acres'}</span>}
                      {crop.sowDate && <span>🌱 {new Date(crop.sowDate).toLocaleDateString('en-PK')}</span>}
                      {crop.expectedHarvestDate && <span>📅 {isUrdu ? 'متوقع' : 'Harvest'}: {new Date(crop.expectedHarvestDate).toLocaleDateString('en-PK')}</span>}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 shrink-0">
                    <select
                      value={crop.status}
                      onChange={(e) => updateCropStatus(crop._id, e.target.value)}
                      className="text-[11px] px-2 py-1 bg-white border border-gray-200 rounded-md outline-none focus:border-emerald-500"
                    >
                      {Object.entries(STATUS).map(([k, s]) => (
                        <option key={k} value={k}>{isUrdu ? s.ur : s.en}</option>
                      ))}
                    </select>
                    <button onClick={() => removeCrop(crop._id, crop.cropID?.cropName)}
                      className="text-gray-400 hover:text-red-600 text-xs flex items-center justify-center gap-1">
                      <FiTrash2 size={11} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Add Crop Modal */}
      {showAddCrop && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4 animate-fade-in-up" onClick={() => setShowAddCrop(false)}>
          <div onClick={e => e.stopPropagation()} className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6 relative">
            <button onClick={() => setShowAddCrop(false)} className="absolute top-4 right-4 rtl:left-4 rtl:right-auto w-8 h-8 rounded-lg hover:bg-gray-100 text-gray-400 flex items-center justify-center">
              <FiX size={18} />
            </button>
            <h3 className="text-lg font-bold text-gray-900 mb-4">{isUrdu ? 'نئی فصل شامل کریں' : 'Add Crop to Farm'}</h3>
            <div className="space-y-4">
              <Select
                label={isUrdu ? 'فصل' : 'Crop'}
                value={cropForm.cropID} onChange={setF('cropID')}
                options={[
                  { value: '', label: isUrdu ? '— منتخب کریں —' : '— Select —' },
                  ...crops.map(c => ({ value: c._id, label: isUrdu && c.cropNameUrdu ? `${c.cropNameUrdu} (${c.cropName})` : c.cropName }))
                ]}
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label={isUrdu ? 'قسم' : 'Variety'}
                  value={cropForm.variety} onChange={setF('variety')}
                  placeholder={isUrdu ? 'مثلاً: گلیکسی-2013' : 'e.g. Galaxy-2013'}
                />
                <Input
                  label={isUrdu ? 'رقبہ (ایکڑ)' : 'Area (acres)'}
                  type="number" min="0" step="0.1"
                  value={cropForm.areaAcres} onChange={setF('areaAcres')}
                />
              </div>
              <Input
                label={isUrdu ? 'بجائی کی تاریخ' : 'Sow Date'}
                type="date"
                value={cropForm.sowDate} onChange={setF('sowDate')}
              />
              <Select
                label={isUrdu ? 'حالت' : 'Status'}
                value={cropForm.status} onChange={setF('status')}
                options={Object.entries(STATUS).map(([k, s]) => ({ value: k, label: isUrdu ? s.ur : s.en }))}
              />
              <Textarea
                label={isUrdu ? 'نوٹس' : 'Notes'}
                rows={2}
                value={cropForm.notes} onChange={setF('notes')}
              />
              <Button onClick={addCrop} className="w-full">
                {isUrdu ? 'فصل شامل کریں' : 'Add Crop'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
