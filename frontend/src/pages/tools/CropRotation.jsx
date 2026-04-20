import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toolsAPI } from '../../services/api';
import { Input, Select, Button, Card } from '../../components/ui/FormControls';
import { FiRefreshCw, FiArrowLeft, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function CropRotation() {
  const { i18n } = useTranslation();
  const isUrdu = i18n.language === 'ur';
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [form, setForm] = useState({
    lastCrops: 'Wheat,Rice,Wheat', soilType: 'loamy', region: 'Punjab', season: 'Rabi'
  });
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleCalculate = async () => {
    setLoading(true);
    try {
      const res = await toolsAPI.rotation({
        ...form,
        lastCrops: form.lastCrops.split(',').map(s => s.trim()).filter(Boolean)
      });
      setResult(res.data.data);
    } catch (err) {
      toast.error('AI unavailable');
    } finally { setLoading(false); }
  };

  const difficultyColor = {
    easy: 'bg-green-100 text-green-700',
    medium: 'bg-yellow-100 text-yellow-700',
    hard: 'bg-red-100 text-red-700'
  };

  return (
    <div className="space-y-5 sm:space-y-6 max-w-6xl mx-auto">
      <div>
        <Link to="/tools" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-green-600 mb-3">
          <FiArrowLeft size={14} /> {isUrdu ? 'ٹولز پر واپس' : 'Back to Tools'}
        </Link>
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-5 sm:p-6 text-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0">
              <FiRefreshCw size={24} />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold">{isUrdu ? 'فصل کی تبدیلی' : 'Crop Rotation Planner'}</h1>
              <p className="text-amber-100 text-xs sm:text-sm mt-0.5 line-clamp-2">
                {isUrdu ? 'صحت مند مٹی اور بہتر منافع کے لیے' : 'Plan next crop for soil & profit'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
        <Card title={isUrdu ? 'پچھلی فصلیں' : 'Previous Crops'}>
          <div className="space-y-4">
            <Input label={isUrdu ? 'پچھلی 3 فصلیں (کوما سے الگ کریں)' : 'Last 3 crops (comma separated)'}
              value={form.lastCrops} onChange={set('lastCrops')}
              placeholder="Wheat, Rice, Wheat" />
            <Select label={isUrdu ? 'مٹی کی قسم' : 'Soil Type'}
              value={form.soilType} onChange={set('soilType')}
              options={[
                { value: 'sandy', label: isUrdu ? 'ریتلی' : 'Sandy' },
                { value: 'loamy', label: isUrdu ? 'میرا' : 'Loamy' },
                { value: 'clay', label: isUrdu ? 'چکنی' : 'Clay' }
              ]} />
            <Select label={isUrdu ? 'علاقہ' : 'Region'}
              value={form.region} onChange={set('region')}
              options={['Punjab','Sindh','KPK','Balochistan']} />
            <Select label={isUrdu ? 'آنے والا موسم' : 'Upcoming Season'}
              value={form.season} onChange={set('season')}
              options={[
                { value: 'Rabi', label: isUrdu ? 'ربیع (سرما)' : 'Rabi (Winter)' },
                { value: 'Kharif', label: isUrdu ? 'خریف (گرما)' : 'Kharif (Summer)' }
              ]} />
            <Button icon={FiRefreshCw} loading={loading} onClick={handleCalculate} className="w-full">
              {isUrdu ? 'تجویز کریں' : 'Get Recommendations'}
            </Button>
          </div>
        </Card>

        <div className="lg:col-span-2">
          {!result ? (
            <Card><div className="text-center py-16 text-gray-400">
              <FiRefreshCw className="mx-auto mb-3 text-gray-300" size={48} />
              <p>{isUrdu ? 'تفصیلات درج کریں' : 'Fill form for AI recommendations'}</p>
            </div></Card>
          ) : result.error ? (
            <Card><div className="text-center py-16 text-red-500">{result.error}</div></Card>
          ) : (
            <div className="space-y-4">
              {/* Recommendations */}
              {result.recommendations?.map((r, i) => (
                <div key={i} className={`bg-white rounded-2xl border-2 ${i === 0 ? 'border-amber-300 shadow-md' : 'border-gray-100'} p-5 relative`}>
                  {i === 0 && (
                    <span className="absolute -top-3 left-4 rtl:right-4 rtl:left-auto bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                      ⭐ {isUrdu ? 'سب سے بہتر' : 'BEST MATCH'}
                    </span>
                  )}
                  <div className="flex items-start justify-between flex-wrap gap-3 mb-3">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        🌱 {isUrdu ? r.cropUrdu : r.crop}
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${difficultyColor[r.difficulty] || 'bg-gray-100'}`}>
                          {isUrdu ? (r.difficulty === 'easy' ? 'آسان' : r.difficulty === 'hard' ? 'مشکل' : 'درمیانہ') : r.difficulty}
                        </span>
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">🗓 {r.sowingTime}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-amber-600">{r.score}/100</div>
                      <div className="text-xs text-gray-500">{isUrdu ? 'اسکور' : 'Match Score'}</div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed mb-3">
                    {isUrdu ? r.reasonUrdu : r.reason}
                  </p>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-green-50 p-2 rounded-lg">
                      <span className="font-semibold text-green-800">💰 {isUrdu ? 'منافع/ایکڑ' : 'Profit/acre'}: </span>
                      <span className="text-green-700">{r.expectedProfitPerAcre}</span>
                    </div>
                    <div className="bg-blue-50 p-2 rounded-lg">
                      <span className="font-semibold text-blue-800">🌍 {isUrdu ? 'مٹی کا فائدہ' : 'Soil'}: </span>
                      <span className="text-blue-700">{isUrdu ? r.soilBenefitUrdu : r.soilBenefit}</span>
                    </div>
                  </div>
                </div>
              ))}

              {/* Avoid */}
              {(result.avoidCrops?.length || result.avoidCropsUrdu?.length) > 0 && (
                <Card title={isUrdu ? 'ان سے پرہیز کریں' : 'Avoid These'} icon={FiXCircle}>
                  <ul className="space-y-2">
                    {(isUrdu ? result.avoidCropsUrdu : result.avoidCrops)?.map((c, i) => (
                      <li key={i} className="flex gap-2 text-sm text-red-700 bg-red-50 p-3 rounded-lg">
                        <span>❌</span><span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              )}

              {result.generalTip && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <h4 className="font-semibold text-amber-800 text-sm mb-1 flex items-center gap-2">
                    💡 {isUrdu ? 'خاص مشورہ' : 'Pro Tip'}
                  </h4>
                  <p className="text-sm text-amber-800">{isUrdu ? result.generalTipUrdu : result.generalTip}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
