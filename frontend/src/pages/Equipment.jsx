import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import { Input, Select, Button, Card, Textarea } from '../components/ui/FormControls';
import ImageUploader from '../components/ui/ImageUploader';
import {
  FiPlus, FiX, FiSearch, FiPhone, FiMail, FiEye, FiTrash2,
  FiPackage, FiMapPin, FiTrendingUp
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const TYPES = [
  { v: '', en: 'All Types', ur: 'تمام', emoji: '🔧' },
  { v: 'tractor', en: 'Tractor', ur: 'ٹریکٹر', emoji: '🚜' },
  { v: 'thresher', en: 'Thresher', ur: 'تھریشر', emoji: '🌾' },
  { v: 'tubewell', en: 'Tubewell', ur: 'ٹیوب ویل', emoji: '💧' },
  { v: 'plow', en: 'Plow', ur: 'ہل', emoji: '⛏' },
  { v: 'harvester', en: 'Harvester', ur: 'ہارویسٹر', emoji: '🌾' },
  { v: 'seed_drill', en: 'Seed Drill', ur: 'بیج ڈرل', emoji: '🌱' },
  { v: 'sprayer', en: 'Sprayer', ur: 'سپرے', emoji: '💨' },
  { v: 'trolley', en: 'Trolley', ur: 'ٹرالی', emoji: '🚛' },
  { v: 'rotavator', en: 'Rotavator', ur: 'روٹاویٹر', emoji: '⚙️' },
  { v: 'cultivator', en: 'Cultivator', ur: 'کلٹیویٹر', emoji: '🌾' },
];

const RATE_MODES = [
  { v: 'hourly', en: 'per hour', ur: 'فی گھنٹہ' },
  { v: 'daily', en: 'per day', ur: 'فی دن' },
  { v: 'per_acre', en: 'per acre', ur: 'فی ایکڑ' },
  { v: 'per_job', en: 'per job', ur: 'فی کام' },
];

const equipAPI = {
  list: (params) => api.get('/equipment', { params }),
  mine: () => api.get('/equipment/mine'),
  create: (data) => api.post('/equipment', data),
  delete: (id) => api.delete(`/equipment/${id}`),
  inquire: (id) => api.post(`/equipment/${id}/inquire`),
};

export default function Equipment() {
  const { i18n } = useTranslation();
  const isUrdu = i18n.language === 'ur';
  const [tab, setTab] = useState('browse');
  const [items, setItems] = useState([]);
  const [mine, setMine] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState(null);
  const [filters, setFilters] = useState({ type: '', search: '', province: '' });

  const blank = {
    type: 'tractor', brand: '', model: '', yearMade: '',
    title: '', description: '',
    rentMode: 'daily', ratePKR: '',
    horsepower: '', fuelType: 'diesel',
    village: '', images: [],
    contactPreference: 'all'
  };
  const [form, setForm] = useState(blank);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const load = async () => {
    setLoading(true);
    try {
      if (tab === 'browse') {
        const res = await equipAPI.list(filters);
        setItems(res.data.data || []);
      } else {
        const res = await equipAPI.mine();
        setMine(res.data.data || []);
      }
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [tab, filters.type, filters.province]);

  const handleSubmit = async () => {
    if (!form.title || !form.ratePKR) {
      toast.error(isUrdu ? 'عنوان اور قیمت ضروری ہیں' : 'Title and rate required');
      return;
    }
    try {
      const payload = {
        ...form,
        ratePKR: parseFloat(form.ratePKR),
        yearMade: form.yearMade ? parseInt(form.yearMade) : undefined,
        horsepower: form.horsepower ? parseFloat(form.horsepower) : undefined
      };
      await equipAPI.create(payload);
      toast.success(isUrdu ? 'فہرست بن گئی!' : 'Listed!');
      setShowForm(false);
      setForm(blank);
      setTab('mine');
      load();
    } catch (err) { toast.error('Failed'); }
  };

  const handleDelete = async (id) => {
    if (!confirm(isUrdu ? 'حذف کریں؟' : 'Delete?')) return;
    await equipAPI.delete(id);
    load();
  };

  const handleInquire = async (item) => {
    setSelected(item);
    try { await equipAPI.inquire(item._id); } catch {}
  };

  const apiBase = (import.meta.env.VITE_API_URL || '/api').replace(/\/api$/, '');
  const fullImg = (url) => url?.startsWith('http') ? url : `${apiBase}${url}`;

  const list = tab === 'browse' ? items : mine;

  return (
    <div className="space-y-4 sm:space-y-5 animate-fade-in-up">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-orange-600 via-amber-600 to-yellow-600 rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-7 text-white card-elevated">
        <div className="absolute top-0 right-0 rtl:left-0 rtl:right-auto w-44 sm:w-60 h-44 sm:h-60 bg-white/10 rounded-full -mr-16 sm:-mr-20 -mt-16 sm:-mt-20 blur-2xl" />
        <div className="relative flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 backdrop-blur rounded-xl sm:rounded-2xl flex items-center justify-center text-2xl sm:text-3xl shrink-0">🚜</div>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold truncate">
                {isUrdu ? 'مشینری کرایہ' : 'Equipment Rental'}
              </h1>
              <p className="text-orange-100 text-xs sm:text-sm mt-1 line-clamp-2">
                {isUrdu
                  ? 'ٹریکٹر، تھریشر، ٹیوب ویل کرایہ پر — یا اپنا کرایہ پر دیں'
                  : 'Rent tractors, threshers, tubewells nearby — or list yours to earn extra income'}
              </p>
            </div>
          </div>
          <button onClick={() => { setForm(blank); setShowForm(true); }}
            className="flex items-center gap-1.5 bg-white text-orange-700 hover:bg-orange-50 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold shadow-lg transition shrink-0">
            <FiPlus size={14} /> {isUrdu ? 'فہرست' : 'List'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button onClick={() => setTab('browse')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition ${
            tab === 'browse' ? 'bg-orange-600 text-white' : 'bg-white border border-gray-200 text-gray-600'
          }`}>
          <FiSearch size={14} /> {isUrdu ? 'براؤز کریں' : 'Browse'}
        </button>
        <button onClick={() => setTab('mine')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition ${
            tab === 'mine' ? 'bg-orange-600 text-white' : 'bg-white border border-gray-200 text-gray-600'
          }`}>
          <FiPackage size={14} /> {isUrdu ? 'میری فہرستیں' : 'My Listings'}
        </button>
      </div>

      {/* Filter pills (browse only) */}
      {tab === 'browse' && (
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {TYPES.map(t => (
            <button key={t.v || 'all'} onClick={() => setFilters({ ...filters, type: t.v })}
              className={`shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
                filters.type === t.v ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600'
              }`}>
              <span>{t.emoji}</span> {isUrdu ? t.ur : t.en}
            </button>
          ))}
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="text-center py-16 text-gray-400">{isUrdu ? 'لوڈ' : 'Loading'}...</div>
      ) : list.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 py-16 text-center">
          <div className="text-6xl mb-3">🚜</div>
          <h3 className="font-bold text-gray-900">
            {isUrdu ? 'کوئی فہرست نہیں' : 'No equipment listed yet'}
          </h3>
          <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto px-4">
            {tab === 'mine'
              ? (isUrdu ? 'اپنی پہلی مشینری شامل کریں — اضافی آمدنی کریں' : 'List your first equipment to earn rental income')
              : (isUrdu ? 'مختلف فلٹر آزمائیں' : 'Try different filters')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {list.map(item => {
            const type = TYPES.find(t => t.v === item.type) || TYPES[0];
            const rateMode = RATE_MODES.find(r => r.v === item.rentMode);
            const img = item.images?.[0];
            return (
              <div key={item._id} className="bg-white rounded-2xl border border-gray-100 hover:shadow-md hover:border-orange-200 transition-all overflow-hidden">
                {img ? (
                  <div className="aspect-video bg-gray-100 overflow-hidden">
                    <img src={fullImg(img)} alt={item.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                  </div>
                ) : (
                  <div className="aspect-video bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center text-7xl">{type.emoji}</div>
                )}
                <div className="p-4 sm:p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-bold uppercase">
                      {type.emoji} {isUrdu ? type.ur : type.en}
                    </span>
                    {!item.available && (
                      <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold uppercase">
                        {isUrdu ? 'بک' : 'Booked'}
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-gray-900 text-base truncate">{item.title}</h3>
                  {item.brand && <p className="text-xs text-gray-500 mt-0.5">{item.brand}{item.model ? ` ${item.model}` : ''}{item.yearMade ? ` • ${item.yearMade}` : ''}</p>}

                  <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-3 mt-3">
                    <p className="text-2xl font-bold text-orange-700">PKR {item.ratePKR?.toLocaleString()}</p>
                    <p className="text-xs text-orange-600">{isUrdu ? rateMode?.ur : rateMode?.en}</p>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500 mt-3">
                    <span className="flex items-center gap-1"><FiMapPin size={11} /> {item.city || 'Unknown'}</span>
                    <span className="flex items-center gap-1"><FiEye size={11} /> {item.views || 0}</span>
                  </div>

                  <div className="mt-3">
                    {tab === 'browse' ? (
                      <Button onClick={() => handleInquire(item)} className="w-full">
                        {isUrdu ? 'مالک سے رابطہ' : 'Contact Owner'}
                      </Button>
                    ) : (
                      <Button onClick={() => handleDelete(item._id)} variant="danger" className="w-full">
                        <FiTrash2 size={13} /> {isUrdu ? 'حذف' : 'Delete'}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Contact Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4 animate-fade-in-up" onClick={() => setSelected(null)}>
          <div onClick={e => e.stopPropagation()} className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 relative">
            <button onClick={() => setSelected(null)} className="absolute top-4 right-4 rtl:left-4 rtl:right-auto w-8 h-8 rounded-lg hover:bg-gray-100 text-gray-400 flex items-center justify-center">
              <FiX size={18} />
            </button>
            <h3 className="text-lg font-bold mb-1">{isUrdu ? 'مالک سے رابطہ' : 'Contact Owner'}</h3>
            <p className="text-sm text-gray-500 mb-4 truncate">{selected.title}</p>
            <div className="space-y-3">
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="font-bold text-gray-800">{selected.ownerID?.fullName}</p>
                <p className="text-xs text-gray-500 mt-0.5">📍 {selected.city}, {selected.province}</p>
              </div>
              {selected.ownerID?.phone && (
                <a href={`tel:${selected.ownerID.phone}`}
                  className="flex items-center gap-3 bg-green-50 hover:bg-green-100 p-3 rounded-xl transition">
                  <FiPhone className="text-green-600" size={18} />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">{isUrdu ? 'فون' : 'Call'}</p>
                    <p className="font-bold text-green-700">{selected.ownerID.phone}</p>
                  </div>
                </a>
              )}
              {selected.ownerID?.phone && (
                <a href={`https://wa.me/${selected.ownerID.phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer"
                  className="flex items-center gap-3 bg-emerald-50 hover:bg-emerald-100 p-3 rounded-xl transition">
                  <span className="text-xl">💬</span>
                  <div>
                    <p className="text-xs text-gray-500">WhatsApp</p>
                    <p className="font-bold text-emerald-700">{isUrdu ? 'پیغام بھیجیں' : 'Message'}</p>
                  </div>
                </a>
              )}
              {selected.ownerID?.email && (
                <a href={`mailto:${selected.ownerID.email}`}
                  className="flex items-center gap-3 bg-blue-50 hover:bg-blue-100 p-3 rounded-xl transition">
                  <FiMail className="text-blue-600" size={18} />
                  <div>
                    <p className="text-xs text-gray-500">{isUrdu ? 'ای میل' : 'Email'}</p>
                    <p className="font-bold text-blue-700 truncate">{selected.ownerID.email}</p>
                  </div>
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4 animate-fade-in-up" onClick={() => setShowForm(false)}>
          <div onClick={e => e.stopPropagation()} className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6 relative">
            <button onClick={() => setShowForm(false)} className="absolute top-4 right-4 rtl:left-4 rtl:right-auto w-8 h-8 rounded-lg hover:bg-gray-100 text-gray-400 flex items-center justify-center">
              <FiX size={18} />
            </button>
            <h3 className="text-lg font-bold mb-4">{isUrdu ? 'مشینری شامل کریں' : 'List Equipment'}</h3>
            <div className="space-y-4">
              <Select label={isUrdu ? 'قسم' : 'Type'} value={form.type} onChange={set('type')}
                options={TYPES.filter(t => t.v).map(t => ({ value: t.v, label: `${t.emoji} ${isUrdu ? t.ur : t.en}` }))} />
              <Input label={isUrdu ? 'عنوان' : 'Title'} value={form.title} onChange={set('title')}
                placeholder={isUrdu ? 'مثلاً: مساے فرگوسن 240 ٹریکٹر' : 'e.g. Massey Ferguson 240 Tractor'} />
              <div className="grid grid-cols-2 gap-3">
                <Input label={isUrdu ? 'برانڈ' : 'Brand'} value={form.brand} onChange={set('brand')} placeholder="Massey, Belarus..." />
                <Input label={isUrdu ? 'سال' : 'Year'} type="number" value={form.yearMade} onChange={set('yearMade')} placeholder="2018" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input label={isUrdu ? 'کرایہ (PKR)' : 'Rate (PKR)'} type="number" value={form.ratePKR} onChange={set('ratePKR')} />
                <Select label={isUrdu ? 'حساب' : 'Per'} value={form.rentMode} onChange={set('rentMode')}
                  options={RATE_MODES.map(r => ({ value: r.v, label: isUrdu ? r.ur : r.en }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input label="HP" type="number" value={form.horsepower} onChange={set('horsepower')} placeholder="50" />
                <Input label={isUrdu ? 'گاؤں' : 'Village'} value={form.village} onChange={set('village')} />
              </div>
              <Textarea label={isUrdu ? 'تفصیل' : 'Description'} rows={2} value={form.description} onChange={set('description')} />
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">📸 {isUrdu ? 'تصویریں' : 'Photos'}</label>
                <ImageUploader value={form.images} onChange={(urls) => setForm({ ...form, images: urls })} max={3} />
              </div>
              <Button onClick={handleSubmit} className="w-full">
                {isUrdu ? 'فہرست شائع کریں' : 'Publish Listing'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
