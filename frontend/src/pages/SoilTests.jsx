import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api, { farmAPI } from '../services/api';
import { Input, Select, Button, Card, Textarea, StatBox } from '../components/ui/FormControls';
import ImageUploader from '../components/ui/ImageUploader';
import {
  FiPlus, FiX, FiTrash2, FiActivity, FiTrendingUp, FiAward,
  FiAlertCircle, FiCheckCircle, FiCalendar, FiFileText
} from 'react-icons/fi';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import toast from 'react-hot-toast';

const TEXTURE = [
  { v: 'sandy', en: 'Sandy', ur: 'ریتلی' },
  { v: 'sandy_loam', en: 'Sandy Loam', ur: 'ریتلی میرا' },
  { v: 'loam', en: 'Loam', ur: 'میرا' },
  { v: 'silt_loam', en: 'Silt Loam', ur: 'گاد دار میرا' },
  { v: 'clay_loam', en: 'Clay Loam', ur: 'چکنی میرا' },
  { v: 'clay', en: 'Clay', ur: 'چکنی' },
];

const soilAPI = {
  list: (params) => api.get('/soil-tests', { params }),
  get: (id) => api.get(`/soil-tests/${id}`),
  create: (data) => api.post('/soil-tests', data),
  update: (id, data) => api.put(`/soil-tests/${id}`, data),
  delete: (id) => api.delete(`/soil-tests/${id}`),
};

const healthColor = (score) => {
  if (!score) return 'gray';
  if (score >= 80) return 'green';
  if (score >= 60) return 'blue';
  if (score >= 40) return 'yellow';
  return 'red';
};

export default function SoilTests() {
  const { i18n } = useTranslation();
  const isUrdu = i18n.language === 'ur';
  const [tests, setTests] = useState([]);
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const [farmFilter, setFarmFilter] = useState('');

  const blank = {
    farmID: '', testDate: new Date().toISOString().split('T')[0],
    labName: '', reportFileUrl: '',
    pH: '', ec: '', organicMatter: '',
    nitrogenN: '', phosphorusP: '', potassiumK: '',
    zinc: '', iron: '', textureClass: '',
    notes: ''
  };
  const [form, setForm] = useState(blank);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const load = () => {
    setLoading(true);
    const params = farmFilter ? { farmID: farmFilter } : {};
    soilAPI.list(params)
      .then(res => setTests(res.data.data || []))
      .catch(() => setTests([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [farmFilter]);

  useEffect(() => {
    farmAPI.list().then(res => setFarms(res.data.data || [])).catch(() => {});
  }, []);

  const handleSubmit = async () => {
    if (!form.farmID) {
      toast.error(isUrdu ? 'فارم منتخب کریں' : 'Select a farm');
      return;
    }
    setAnalyzing(true);
    try {
      const payload = { ...form };
      // Convert numeric fields
      ['pH', 'ec', 'organicMatter', 'nitrogenN', 'phosphorusP', 'potassiumK', 'zinc', 'iron'].forEach(k => {
        if (payload[k] === '') delete payload[k];
        else payload[k] = parseFloat(payload[k]);
      });
      const res = await soilAPI.create(payload);
      toast.success(isUrdu ? 'AI تجزیہ مکمل!' : 'AI analysis complete!');
      setShowForm(false);
      setForm(blank);
      setSelectedTest(res.data.data);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setAnalyzing(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm(isUrdu ? 'حذف کریں؟' : 'Delete this test?')) return;
    await soilAPI.delete(id);
    toast.success(isUrdu ? 'حذف ہو گیا' : 'Deleted');
    if (selectedTest?._id === id) setSelectedTest(null);
    load();
  };

  // Build trend chart data
  const trendData = tests
    .filter(t => !farmFilter || t.farmID?._id === farmFilter)
    .slice(0, 10).reverse()
    .map(t => ({
      date: new Date(t.testDate).toLocaleDateString('en', { month: 'short', year: '2-digit' }),
      score: t.healthScore || 0,
      pH: t.pH || null,
      N: t.nitrogenN || null,
      P: t.phosphorusP || null
    }));

  const avgHealth = tests.length > 0
    ? Math.round(tests.filter(t => t.healthScore).reduce((s, t) => s + t.healthScore, 0) / tests.filter(t => t.healthScore).length)
    : 0;

  return (
    <div className="space-y-4 sm:space-y-5 animate-fade-in-up">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-amber-700 via-orange-700 to-red-700 rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-7 text-white card-elevated">
        <div className="absolute top-0 right-0 rtl:left-0 rtl:right-auto w-44 sm:w-60 h-44 sm:h-60 bg-white/10 rounded-full -mr-16 sm:-mr-20 -mt-16 sm:-mt-20 blur-2xl" />
        <div className="relative flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 backdrop-blur rounded-xl sm:rounded-2xl flex items-center justify-center text-2xl sm:text-3xl shrink-0">🌱</div>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold truncate">
                {isUrdu ? 'مٹی کی صحت ٹریکر' : 'Soil Health Tracker'}
              </h1>
              <p className="text-amber-100 text-xs sm:text-sm mt-1 line-clamp-2">
                {isUrdu
                  ? 'AI تجزیہ کے ساتھ مٹی کی رپورٹس کو ٹریک کریں — pH, NPK, اور مزید'
                  : 'Track soil reports with AI analysis — pH, NPK, micronutrients & recommendations'}
              </p>
            </div>
          </div>
          <button onClick={() => { setForm(blank); setShowForm(true); }}
            className="flex items-center gap-1.5 bg-white text-amber-700 hover:bg-amber-50 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold shadow-lg transition shrink-0">
            <FiPlus size={14} /> {isUrdu ? 'نیا ٹیسٹ' : 'New Test'}
          </button>
        </div>
      </div>

      {/* Stats */}
      {tests.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
          <StatBox
            label={isUrdu ? 'کل ٹیسٹ' : 'Total Tests'}
            value={tests.length}
            color="blue" icon={FiFileText}
          />
          <StatBox
            label={isUrdu ? 'اوسط صحت' : 'Avg Health'}
            value={`${avgHealth}/100`}
            color={healthColor(avgHealth)} icon={FiAward}
          />
          <StatBox
            label={isUrdu ? 'فارمز' : 'Farms Tested'}
            value={[...new Set(tests.map(t => t.farmID?._id || t.farmID))].filter(Boolean).length}
            color="purple" icon={FiActivity}
          />
          <StatBox
            label={isUrdu ? 'تازہ ترین' : 'Latest'}
            value={tests[0] ? new Date(tests[0].testDate).toLocaleDateString('en', { month: 'short', day: 'numeric' }) : '-'}
            color="yellow" icon={FiCalendar}
          />
        </div>
      )}

      {/* Filter */}
      {farms.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setFarmFilter('')}
            className={`text-xs px-3.5 py-1.5 rounded-full font-semibold transition ${
              !farmFilter ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600'
            }`}>
            {isUrdu ? 'تمام فارمز' : 'All Farms'}
          </button>
          {farms.map(f => (
            <button key={f._id} onClick={() => setFarmFilter(f._id)}
              className={`text-xs px-3.5 py-1.5 rounded-full font-semibold transition ${
                farmFilter === f._id ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600'
              }`}>
              🚜 {f.name}
            </button>
          ))}
        </div>
      )}

      {/* Trend chart */}
      {trendData.length >= 2 && (
        <Card>
          <h3 className="font-bold text-gray-900 text-sm mb-3 flex items-center gap-2">
            📈 {isUrdu ? 'صحت کا رجحان' : 'Health Score Trend'}
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 10, border: '1px solid #e5e7eb' }} />
              <Line type="monotone" dataKey="score" stroke="#16a34a" strokeWidth={3} dot={{ r: 5, fill: '#16a34a' }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Empty state */}
      {!loading && tests.length === 0 && (
        <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 py-12 sm:py-16 text-center">
          <div className="text-6xl sm:text-7xl mb-3">🌱</div>
          <h3 className="font-bold text-gray-900 text-lg mb-1">
            {isUrdu ? 'ابھی کوئی مٹی ٹیسٹ نہیں' : 'No soil tests yet'}
          </h3>
          <p className="text-sm text-gray-500 max-w-sm mx-auto mb-5 px-4">
            {isUrdu
              ? 'مٹی کا ٹیسٹ لیب میں کرائیں اور AI سے ذاتی سفارشات حاصل کریں'
              : 'Get soil tested at a lab, then enter results here for AI-powered recommendations'}
          </p>
          <button onClick={() => { setForm(blank); setShowForm(true); }}
            className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition">
            <FiPlus size={15} /> {isUrdu ? 'پہلا ٹیسٹ' : 'Add First Test'}
          </button>
        </div>
      )}

      {/* Tests list */}
      {tests.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {tests.map(test => {
            const color = healthColor(test.healthScore);
            const colorClasses = {
              green: 'bg-green-50 border-green-200 text-green-700',
              blue: 'bg-blue-50 border-blue-200 text-blue-700',
              yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700',
              red: 'bg-red-50 border-red-200 text-red-700',
              gray: 'bg-gray-50 border-gray-200 text-gray-700'
            }[color];
            return (
              <div key={test._id} onClick={() => setSelectedTest(test)}
                className="bg-white rounded-2xl border border-gray-100 hover:border-amber-200 hover:shadow-md transition-all overflow-hidden cursor-pointer">
                <div className={`h-2 ${color === 'green' ? 'bg-green-500' : color === 'blue' ? 'bg-blue-500' : color === 'yellow' ? 'bg-yellow-500' : color === 'red' ? 'bg-red-500' : 'bg-gray-400'}`} />
                <div className="p-4 sm:p-5">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm truncate">
                        🚜 {test.farmID?.name || 'Unknown Farm'}
                      </h3>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <FiCalendar size={10} /> {new Date(test.testDate).toLocaleDateString()}
                      </p>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(test._id); }}
                      className="text-gray-400 hover:text-red-600 p-1">
                      <FiTrash2 size={13} />
                    </button>
                  </div>
                  {test.healthScore !== undefined && (
                    <div className={`mt-3 p-2.5 rounded-xl border ${colorClasses}`}>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase opacity-80">{isUrdu ? 'صحت' : 'Health'}</span>
                        <span className="text-2xl font-bold">{test.healthScore}/100</span>
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-3 gap-1.5 mt-3 text-center text-[11px]">
                    <div className="bg-gray-50 rounded-lg py-1.5">
                      <p className="text-gray-400">pH</p>
                      <p className="font-bold text-gray-800">{test.pH || '—'}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg py-1.5">
                      <p className="text-gray-400">N</p>
                      <p className="font-bold text-gray-800">{test.nitrogenN || '—'}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg py-1.5">
                      <p className="text-gray-400">P</p>
                      <p className="font-bold text-gray-800">{test.phosphorusP || '—'}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail modal */}
      {selectedTest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4 animate-fade-in-up" onClick={() => setSelectedTest(null)}>
          <div onClick={e => e.stopPropagation()} className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6 relative">
            <button onClick={() => setSelectedTest(null)} className="absolute top-4 right-4 rtl:left-4 rtl:right-auto w-8 h-8 rounded-lg hover:bg-gray-100 text-gray-400 flex items-center justify-center">
              <FiX size={18} />
            </button>
            <div className="mb-5">
              <h3 className="text-xl font-bold text-gray-900">🚜 {selectedTest.farmID?.name}</h3>
              <p className="text-sm text-gray-500 mt-0.5">{new Date(selectedTest.testDate).toLocaleDateString('en-PK', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
              {selectedTest.labName && <p className="text-xs text-gray-500 mt-0.5">🔬 {selectedTest.labName}</p>}
            </div>

            {selectedTest.healthScore !== undefined && (
              <div className={`p-4 rounded-2xl border-2 mb-4 ${
                healthColor(selectedTest.healthScore) === 'green' ? 'bg-green-50 border-green-200' :
                healthColor(selectedTest.healthScore) === 'blue' ? 'bg-blue-50 border-blue-200' :
                healthColor(selectedTest.healthScore) === 'yellow' ? 'bg-yellow-50 border-yellow-200' :
                healthColor(selectedTest.healthScore) === 'red' ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase">{isUrdu ? 'مٹی کی صحت کا اسکور' : 'Soil Health Score'}</span>
                  <span className="text-3xl font-bold">{selectedTest.healthScore}/100</span>
                </div>
                <p className="text-sm">{isUrdu && selectedTest.aiAssessmentUrdu ? selectedTest.aiAssessmentUrdu : selectedTest.aiAssessment}</p>
              </div>
            )}

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-4">
              {[
                ['pH', selectedTest.pH], ['EC', selectedTest.ec],
                ['OM%', selectedTest.organicMatter],
                ['N', selectedTest.nitrogenN], ['P', selectedTest.phosphorusP], ['K', selectedTest.potassiumK],
                ['Zn', selectedTest.zinc], ['Fe', selectedTest.iron]
              ].filter(([_, v]) => v !== undefined && v !== null && v !== '').map(([k, v], i) => (
                <div key={i} className="bg-gray-50 rounded-lg p-2 text-center">
                  <p className="text-[10px] text-gray-400 uppercase font-semibold">{k}</p>
                  <p className="text-sm font-bold text-gray-800">{v}</p>
                </div>
              ))}
            </div>

            {selectedTest.recommendations && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                <h4 className="font-bold text-amber-900 text-sm mb-2 flex items-center gap-2">
                  💡 {isUrdu ? 'AI سفارشات' : 'AI Recommendations'}
                </h4>
                <div className="text-sm text-amber-900 whitespace-pre-line leading-relaxed">
                  {isUrdu && selectedTest.recommendationsUrdu ? selectedTest.recommendationsUrdu : selectedTest.recommendations}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Test Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4 animate-fade-in-up" onClick={() => !analyzing && setShowForm(false)}>
          <div onClick={e => e.stopPropagation()} className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6 relative">
            <button onClick={() => setShowForm(false)} disabled={analyzing} className="absolute top-4 right-4 rtl:left-4 rtl:right-auto w-8 h-8 rounded-lg hover:bg-gray-100 text-gray-400 flex items-center justify-center disabled:opacity-30">
              <FiX size={18} />
            </button>
            <h3 className="text-lg font-bold mb-4">{isUrdu ? 'نئی مٹی رپورٹ شامل کریں' : 'Add Soil Test Report'}</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Select label={isUrdu ? 'فارم' : 'Farm'} value={form.farmID} onChange={set('farmID')}
                  options={[
                    { value: '', label: isUrdu ? '— منتخب کریں —' : '— Select —' },
                    ...farms.map(f => ({ value: f._id, label: f.name }))
                  ]} />
                <Input label={isUrdu ? 'تاریخ' : 'Test Date'} type="date" value={form.testDate} onChange={set('testDate')} />
              </div>
              <Input label={isUrdu ? 'لیب کا نام (اختیاری)' : 'Lab Name (optional)'} value={form.labName} onChange={set('labName')} placeholder="AARI Faisalabad" />

              <div className="border-t border-gray-100 pt-4">
                <p className="text-xs font-bold uppercase text-gray-500 mb-3">{isUrdu ? 'بنیادی نتائج' : 'Primary Results'}</p>
                <div className="grid grid-cols-3 gap-2">
                  <Input label="pH" type="number" step="0.1" value={form.pH} onChange={set('pH')} placeholder="7.5" />
                  <Input label="EC (dS/m)" type="number" step="0.1" value={form.ec} onChange={set('ec')} />
                  <Input label="OM %" type="number" step="0.1" value={form.organicMatter} onChange={set('organicMatter')} />
                  <Input label="N (ppm)" type="number" value={form.nitrogenN} onChange={set('nitrogenN')} />
                  <Input label="P (ppm)" type="number" value={form.phosphorusP} onChange={set('phosphorusP')} />
                  <Input label="K (ppm)" type="number" value={form.potassiumK} onChange={set('potassiumK')} />
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <p className="text-xs font-bold uppercase text-gray-500 mb-3">{isUrdu ? 'مائیکرو نیوٹرینٹ (اختیاری)' : 'Micronutrients (optional)'}</p>
                <div className="grid grid-cols-2 gap-2">
                  <Input label="Zinc (ppm)" type="number" step="0.1" value={form.zinc} onChange={set('zinc')} />
                  <Input label="Iron (ppm)" type="number" step="0.1" value={form.iron} onChange={set('iron')} />
                </div>
              </div>

              <Select label={isUrdu ? 'بناوٹ' : 'Texture'} value={form.textureClass} onChange={set('textureClass')}
                options={[
                  { value: '', label: isUrdu ? '— منتخب کریں —' : '— Select —' },
                  ...TEXTURE.map(t => ({ value: t.v, label: isUrdu ? t.ur : t.en }))
                ]} />

              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">
                  📎 {isUrdu ? 'لیب رپورٹ کی تصویر (اختیاری)' : 'Lab Report Photo (optional)'}
                </label>
                <ImageUploader
                  value={form.reportFileUrl ? [form.reportFileUrl] : []}
                  onChange={(urls) => setForm({ ...form, reportFileUrl: urls[0] || '' })}
                  single max={1}
                />
              </div>

              <Textarea label={isUrdu ? 'نوٹس' : 'Notes'} rows={2} value={form.notes} onChange={set('notes')} />

              <Button onClick={handleSubmit} loading={analyzing} className="w-full">
                {analyzing
                  ? (isUrdu ? 'AI تجزیہ ہو رہا ہے...' : 'AI analyzing...')
                  : (isUrdu ? 'محفوظ کریں + AI تجزیہ' : 'Save + AI Analysis')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
