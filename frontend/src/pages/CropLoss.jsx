import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api, { farmAPI } from '../services/api';
import { Input, Select, Button, Card, Textarea, StatBox } from '../components/ui/FormControls';
import ImageUploader from '../components/ui/ImageUploader';
import {
  FiPlus, FiX, FiTrash2, FiAlertCircle, FiFileText, FiMapPin,
  FiCalendar, FiCheckCircle, FiClock, FiDollarSign
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const CAUSES = [
  { v: 'flood', en: 'Flood', ur: 'سیلاب', emoji: '🌊', color: 'bg-blue-100 text-blue-700' },
  { v: 'drought', en: 'Drought', ur: 'خشک سالی', emoji: '☀️', color: 'bg-yellow-100 text-yellow-700' },
  { v: 'hailstorm', en: 'Hailstorm', ur: 'اولے', emoji: '🧊', color: 'bg-cyan-100 text-cyan-700' },
  { v: 'pest', en: 'Pest Attack', ur: 'کیڑے', emoji: '🦗', color: 'bg-orange-100 text-orange-700' },
  { v: 'disease', en: 'Disease', ur: 'بیماری', emoji: '🦠', color: 'bg-red-100 text-red-700' },
  { v: 'fire', en: 'Fire', ur: 'آگ', emoji: '🔥', color: 'bg-red-100 text-red-700' },
  { v: 'frost', en: 'Frost', ur: 'پالا', emoji: '❄️', color: 'bg-blue-100 text-blue-700' },
  { v: 'wind_storm', en: 'Wind Storm', ur: 'آندھی', emoji: '🌪', color: 'bg-gray-100 text-gray-700' },
  { v: 'lightning', en: 'Lightning', ur: 'بجلی', emoji: '⚡', color: 'bg-purple-100 text-purple-700' },
  { v: 'rodents', en: 'Rodents', ur: 'چوہے', emoji: '🐀', color: 'bg-amber-100 text-amber-700' },
  { v: 'theft', en: 'Theft', ur: 'چوری', emoji: '🥷', color: 'bg-red-100 text-red-700' },
  { v: 'other', en: 'Other', ur: 'دیگر', emoji: '⚠️', color: 'bg-gray-100 text-gray-700' },
];

const STATUS = {
  documented: { en: 'Documented', ur: 'دستاویز کیا گیا', color: 'bg-blue-100 text-blue-700', icon: FiFileText },
  submitted: { en: 'Submitted', ur: 'جمع کرائی', color: 'bg-yellow-100 text-yellow-700', icon: FiClock },
  under_review: { en: 'Under Review', ur: 'زیر غور', color: 'bg-purple-100 text-purple-700', icon: FiClock },
  approved: { en: 'Approved', ur: 'منظور شدہ', color: 'bg-green-100 text-green-700', icon: FiCheckCircle },
  rejected: { en: 'Rejected', ur: 'رد', color: 'bg-red-100 text-red-700', icon: FiX },
  paid: { en: 'Paid', ur: 'ادا شدہ', color: 'bg-emerald-100 text-emerald-700', icon: FiCheckCircle },
  not_filed: { en: 'Not Filed', ur: 'نہیں جمع', color: 'bg-gray-100 text-gray-700', icon: FiAlertCircle },
};

const INSURANCE_COMPANIES = [
  'NICL (National Insurance Co.)',
  'Adamjee Insurance',
  'EFU General Insurance',
  'Jubilee Insurance',
  'TPL Insurance',
  'IGI General Insurance',
  'Other'
];

const lossAPI = {
  list: (params) => api.get('/crop-loss', { params }),
  create: (data) => api.post('/crop-loss', data),
  update: (id, data) => api.put(`/crop-loss/${id}`, data),
  delete: (id) => api.delete(`/crop-loss/${id}`),
};

export default function CropLoss() {
  const { i18n } = useTranslation();
  const isUrdu = i18n.language === 'ur';
  const [reports, setReports] = useState([]);
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const blank = {
    farmID: '', cropName: '', damageDate: new Date().toISOString().split('T')[0],
    cause: 'flood', causeDescription: '',
    affectedAreaAcres: '', damagePercent: 50, estimatedLossPKR: '',
    photos: [], insuranceCompany: '', policyNumber: '',
    notes: ''
  };
  const [form, setForm] = useState(blank);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const load = () => {
    setLoading(true);
    lossAPI.list()
      .then(res => setReports(res.data.data || []))
      .catch(() => setReports([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    farmAPI.list().then(res => setFarms(res.data.data || [])).catch(() => {});
  }, []);

  const captureGPS = () => {
    if (!navigator.geolocation) {
      toast.error(isUrdu ? 'GPS دستیاب نہیں' : 'GPS not available');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm(f => ({
          ...f,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude
        }));
        toast.success(isUrdu ? '📍 مقام کیپچر ہو گیا' : '📍 GPS captured');
      },
      () => toast.error(isUrdu ? 'GPS رسائی نہیں ملی' : 'GPS access denied')
    );
  };

  const handleSubmit = async () => {
    if (!form.farmID || !form.cropName || !form.affectedAreaAcres) {
      toast.error(isUrdu ? 'ضروری فیلڈز بھریں' : 'Fill required fields');
      return;
    }
    try {
      const payload = {
        ...form,
        affectedAreaAcres: parseFloat(form.affectedAreaAcres),
        damagePercent: parseInt(form.damagePercent),
        estimatedLossPKR: form.estimatedLossPKR ? parseFloat(form.estimatedLossPKR) : undefined,
        photos: (form.photos || []).map(url => ({ url, capturedAt: new Date() }))
      };
      await lossAPI.create(payload);
      toast.success(isUrdu ? 'رپورٹ محفوظ ہو گئی' : 'Report saved');
      setShowForm(false);
      setForm(blank);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm(isUrdu ? 'رپورٹ حذف کریں؟' : 'Delete this report?')) return;
    await lossAPI.delete(id);
    load();
  };

  const updateStatus = async (id, status) => {
    try {
      await lossAPI.update(id, { claimStatus: status });
      toast.success(isUrdu ? 'حالت اپ ڈیٹ ہو گئی' : 'Status updated');
      load();
    } catch { toast.error('Failed'); }
  };

  const downloadReport = (id) => {
    const apiBase = (import.meta.env.VITE_API_URL || '/api');
    const token = localStorage.getItem('token');
    fetch(`${apiBase}/crop-loss/${id}/report`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.text())
      .then(html => {
        const blob = new Blob([html], { type: 'text/html' });
        window.open(URL.createObjectURL(blob), '_blank');
      })
      .catch(() => toast.error(isUrdu ? 'رپورٹ ناکام' : 'Report failed'));
  };

  const totalLoss = reports.reduce((s, r) => s + (r.estimatedLossPKR || 0), 0);
  const pendingClaims = reports.filter(r => ['submitted', 'under_review'].includes(r.claimStatus)).length;
  const approvedClaims = reports.filter(r => ['approved', 'paid'].includes(r.claimStatus)).length;
  const totalRecovered = reports.filter(r => r.claimStatus === 'paid').reduce((s, r) => s + (r.claimAmount || 0), 0);

  return (
    <div className="space-y-4 sm:space-y-5 animate-fade-in-up">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-red-600 via-rose-600 to-pink-600 rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-7 text-white card-elevated">
        <div className="absolute top-0 right-0 rtl:left-0 rtl:right-auto w-44 sm:w-60 h-44 sm:h-60 bg-white/10 rounded-full -mr-16 sm:-mr-20 -mt-16 sm:-mt-20 blur-2xl" />
        <div className="relative flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 backdrop-blur rounded-xl sm:rounded-2xl flex items-center justify-center text-2xl sm:text-3xl shrink-0">🚨</div>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold truncate">
                {isUrdu ? 'فصل کا نقصان' : 'Crop Loss & Insurance'}
              </h1>
              <p className="text-red-100 text-xs sm:text-sm mt-1 line-clamp-2">
                {isUrdu
                  ? 'سیلاب، خشکی، اولوں کا ثبوت — تصویر، GPS اور بیمہ دعوے کے ساتھ'
                  : 'Document floods, drought, hail damage with photos & GPS for insurance claims'}
              </p>
            </div>
          </div>
          <button onClick={() => { setForm(blank); setShowForm(true); }}
            className="flex items-center gap-1.5 bg-white text-red-700 hover:bg-red-50 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold shadow-lg transition shrink-0">
            <FiPlus size={14} /> {isUrdu ? 'رپورٹ' : 'Report'}
          </button>
        </div>
      </div>

      {/* Stats */}
      {reports.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
          <StatBox label={isUrdu ? 'کل رپورٹس' : 'Total Reports'} value={reports.length} color="blue" icon={FiFileText} />
          <StatBox label={isUrdu ? 'کل نقصان' : 'Total Loss'} value={`PKR ${(totalLoss/1000).toFixed(0)}k`} color="red" icon={FiDollarSign} />
          <StatBox label={isUrdu ? 'زیر غور' : 'Pending'} value={pendingClaims} color="yellow" icon={FiClock} />
          <StatBox label={isUrdu ? 'وصول' : 'Recovered'} value={`PKR ${(totalRecovered/1000).toFixed(0)}k`} color="green" icon={FiCheckCircle} />
        </div>
      )}

      {/* Empty state */}
      {!loading && reports.length === 0 && (
        <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 py-12 sm:py-16 text-center">
          <div className="text-6xl sm:text-7xl mb-3">🚨</div>
          <h3 className="font-bold text-gray-900 text-lg mb-1">
            {isUrdu ? 'کوئی نقصان رپورٹ نہیں' : 'No damage reports yet'}
          </h3>
          <p className="text-sm text-gray-500 max-w-sm mx-auto mb-5 px-4">
            {isUrdu
              ? 'فصل کے نقصان کا ثبوت تصویر اور GPS کے ساتھ محفوظ کریں — بیمہ دعوے کے لیے فوری رپورٹ بنائیں'
              : 'Document any crop damage with photos & GPS — auto-generate insurance claim PDFs'}
          </p>
          <button onClick={() => { setForm(blank); setShowForm(true); }}
            className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition">
            <FiPlus size={15} /> {isUrdu ? 'پہلی رپورٹ' : 'Create First Report'}
          </button>
        </div>
      )}

      {/* Reports list */}
      {reports.length > 0 && (
        <div className="space-y-3">
          {reports.map(r => {
            const cause = CAUSES.find(c => c.v === r.cause) || CAUSES[CAUSES.length - 1];
            const status = STATUS[r.claimStatus] || STATUS.documented;
            const StatusIcon = status.icon;
            return (
              <Card key={r._id}>
                <div className="flex items-start gap-3 sm:gap-4 flex-wrap">
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 ${cause.color} rounded-xl flex items-center justify-center text-2xl shrink-0`}>
                    {cause.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-bold text-gray-900 truncate">{r.cropName}</h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cause.color}`}>
                        {isUrdu ? cause.ur : cause.en}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${status.color}`}>
                        <StatusIcon size={10} />
                        {isUrdu ? status.ur : status.en}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 truncate">
                      🚜 {r.farmID?.name} • 📐 {r.affectedAreaAcres} {isUrdu ? 'ایکڑ' : 'acres'}
                      {r.damagePercent ? ` • ${r.damagePercent}% damage` : ''}
                      • 📅 {new Date(r.damageDate).toLocaleDateString()}
                    </p>
                    {r.estimatedLossPKR > 0 && (
                      <p className="text-sm font-bold text-red-600 mt-1">
                        {isUrdu ? 'تخمینی نقصان' : 'Estimated Loss'}: PKR {r.estimatedLossPKR.toLocaleString()}
                      </p>
                    )}

                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                      <button onClick={() => downloadReport(r._id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold transition">
                        <FiFileText size={12} /> {isUrdu ? 'PDF رپورٹ' : 'Download Claim'}
                      </button>
                      <select value={r.claimStatus}
                        onChange={(e) => updateStatus(r._id, e.target.value)}
                        className="text-xs px-2 py-1 bg-white border border-gray-200 rounded-lg outline-none focus:border-red-400">
                        {Object.entries(STATUS).map(([k, s]) => (
                          <option key={k} value={k}>{isUrdu ? s.ur : s.en}</option>
                        ))}
                      </select>
                      <button onClick={() => handleDelete(r._id)}
                        className="ml-auto rtl:mr-auto rtl:ml-0 text-gray-400 hover:text-red-600 p-1">
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4 animate-fade-in-up" onClick={() => setShowForm(false)}>
          <div onClick={e => e.stopPropagation()} className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6 relative">
            <button onClick={() => setShowForm(false)} className="absolute top-4 right-4 rtl:left-4 rtl:right-auto w-8 h-8 rounded-lg hover:bg-gray-100 text-gray-400 flex items-center justify-center">
              <FiX size={18} />
            </button>
            <h3 className="text-lg font-bold mb-4">{isUrdu ? 'نقصان رپورٹ کریں' : 'Report Crop Damage'}</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Select label={isUrdu ? 'فارم' : 'Farm'} value={form.farmID} onChange={set('farmID')}
                  options={[
                    { value: '', label: '— Select —' },
                    ...farms.map(f => ({ value: f._id, label: f.name }))
                  ]} />
                <Input label={isUrdu ? 'فصل' : 'Crop'} value={form.cropName} onChange={set('cropName')} placeholder="Wheat" />
              </div>
              <Select label={isUrdu ? 'وجہ' : 'Cause'} value={form.cause} onChange={set('cause')}
                options={CAUSES.map(c => ({ value: c.v, label: `${c.emoji} ${isUrdu ? c.ur : c.en}` }))} />
              <Input label={isUrdu ? 'نقصان کی تاریخ' : 'Damage Date'} type="date" value={form.damageDate} onChange={set('damageDate')} />
              <div className="grid grid-cols-2 gap-3">
                <Input label={isUrdu ? 'متاثرہ رقبہ (ایکڑ)' : 'Affected Area (acres)'} type="number" min="0" step="0.1" value={form.affectedAreaAcres} onChange={set('affectedAreaAcres')} />
                <Input label={isUrdu ? 'نقصان %' : 'Damage %'} type="number" min="0" max="100" value={form.damagePercent} onChange={set('damagePercent')} />
              </div>
              <Input label={isUrdu ? 'تخمینی نقصان (PKR)' : 'Estimated Loss (PKR)'} type="number" min="0" value={form.estimatedLossPKR} onChange={set('estimatedLossPKR')} placeholder="50000" />
              <Textarea label={isUrdu ? 'تفصیل' : 'Description'} rows={2} value={form.causeDescription} onChange={set('causeDescription')} placeholder={isUrdu ? 'کیا ہوا؟' : 'What happened?'} />

              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">📸 {isUrdu ? 'ثبوت کی تصویریں' : 'Photo Evidence'}</label>
                <ImageUploader value={form.photos} onChange={(urls) => setForm({ ...form, photos: urls })} max={5} />
              </div>

              <button type="button" onClick={captureGPS}
                className="w-full flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 py-2 rounded-lg text-xs font-semibold transition">
                <FiMapPin size={13} /> {form.latitude
                  ? (isUrdu ? `📍 محفوظ: ${form.latitude.toFixed(4)}, ${form.longitude.toFixed(4)}` : `📍 Saved: ${form.latitude.toFixed(4)}, ${form.longitude.toFixed(4)}`)
                  : (isUrdu ? 'GPS مقام کیپچر کریں' : 'Capture GPS Location')}
              </button>

              <div className="border-t border-gray-100 pt-4">
                <p className="text-xs font-bold uppercase text-gray-500 mb-3">{isUrdu ? 'بیمہ معلومات (اختیاری)' : 'Insurance Info (optional)'}</p>
                <div className="grid grid-cols-2 gap-3">
                  <Select label={isUrdu ? 'بیمہ کمپنی' : 'Insurance Co.'} value={form.insuranceCompany} onChange={set('insuranceCompany')}
                    options={[
                      { value: '', label: '—' },
                      ...INSURANCE_COMPANIES.map(c => ({ value: c, label: c }))
                    ]} />
                  <Input label={isUrdu ? 'پالیسی #' : 'Policy #'} value={form.policyNumber} onChange={set('policyNumber')} />
                </div>
              </div>

              <Button onClick={handleSubmit} className="w-full">
                {isUrdu ? 'رپورٹ محفوظ کریں' : 'Save Report'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
