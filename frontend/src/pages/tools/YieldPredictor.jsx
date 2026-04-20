import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toolsAPI } from '../../services/api';
import { Input, Select, Button, Card, StatBox } from '../../components/ui/FormControls';
import { FiTrendingUp, FiArrowLeft, FiDollarSign, FiTarget, FiAlertTriangle } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function YieldPredictor() {
  const { i18n } = useTranslation();
  const isUrdu = i18n.language === 'ur';
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [form, setForm] = useState({
    crop: 'Wheat', area: 1, sowingDate: '', soilType: 'loamy',
    irrigationType: 'canal', inputsUsed: 'standard', rainfall: 100
  });
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleCalculate = async () => {
    setLoading(true);
    try {
      const res = await toolsAPI.yield(form);
      setResult(res.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'AI unavailable');
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-5 sm:space-y-6 max-w-6xl mx-auto">
      <div>
        <Link to="/tools" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-green-600 mb-3">
          <FiArrowLeft size={14} /> {isUrdu ? 'ٹولز پر واپس' : 'Back to Tools'}
        </Link>
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-5 sm:p-6 text-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0">
              <FiTrendingUp size={24} />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold">{isUrdu ? 'پیداوار کا اندازہ' : 'AI Yield Predictor'}</h1>
              <p className="text-purple-100 text-xs sm:text-sm mt-0.5 line-clamp-2">
                {isUrdu ? 'متوقع پیداوار اور آمدنی' : 'Predict expected harvest & revenue'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
        <Card title={isUrdu ? 'تفصیلات' : 'Input Details'}>
          <div className="space-y-4">
            <Select label={isUrdu ? 'فصل' : 'Crop'} value={form.crop} onChange={set('crop')}
              options={['Wheat','Rice','Cotton','Sugarcane','Maize','Potato','Tomato','Onion','Mango']} />
            <Input label={isUrdu ? 'رقبہ (ایکڑ)' : 'Area (acres)'} type="number" min="0.1" step="0.1"
              value={form.area} onChange={set('area')} />
            <Input label={isUrdu ? 'بجائی کی تاریخ' : 'Sowing Date'} type="date"
              value={form.sowingDate} onChange={set('sowingDate')} />
            <Select label={isUrdu ? 'آبپاشی کی قسم' : 'Irrigation Type'} value={form.irrigationType} onChange={set('irrigationType')}
              options={[
                { value: 'canal', label: isUrdu ? 'نہر' : 'Canal' },
                { value: 'tubewell', label: isUrdu ? 'ٹیوب ویل' : 'Tubewell' },
                { value: 'rain-fed', label: isUrdu ? 'بارانی' : 'Rain-fed' },
                { value: 'drip', label: isUrdu ? 'ڈرپ' : 'Drip' }
              ]} />
            <Select label={isUrdu ? 'استعمال شدہ اجزاء' : 'Inputs Used'} value={form.inputsUsed} onChange={set('inputsUsed')}
              options={[
                { value: 'minimal', label: isUrdu ? 'کم' : 'Minimal' },
                { value: 'standard', label: isUrdu ? 'معیاری' : 'Standard' },
                { value: 'high', label: isUrdu ? 'زیادہ' : 'High / Premium' }
              ]} />
            <Input label={isUrdu ? 'کل بارش (mm)' : 'Total Rainfall (mm)'} type="number"
              value={form.rainfall} onChange={set('rainfall')} />
            <Button icon={FiTrendingUp} loading={loading} onClick={handleCalculate} className="w-full">
              {isUrdu ? 'پیشگوئی کریں' : 'Predict Yield'}
            </Button>
          </div>
        </Card>

        <div className="lg:col-span-2">
          {!result ? (
            <Card><div className="text-center py-16 text-gray-400">
              <FiTrendingUp className="mx-auto mb-3 text-gray-300" size={48} />
              <p>{isUrdu ? 'تفصیلات درج کریں' : 'Fill the form to see prediction'}</p>
            </div></Card>
          ) : result.error ? (
            <Card><div className="text-center py-16 text-red-500">{result.error}</div></Card>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <StatBox
                  label={isUrdu ? 'متوقع پیداوار' : 'Expected Yield'}
                  value={`${result.expectedYieldMinMaunds || 0}-${result.expectedYieldMaxMaunds || 0}`}
                  subtitle={`Maund/acre • ${isUrdu ? 'اوسط' : 'avg'} ${result.nationalAverageMaunds || '-'}`}
                  color="purple" icon={FiTarget}
                />
                <StatBox
                  label={isUrdu ? 'متوقع آمدنی' : 'Expected Revenue'}
                  value={`PKR ${((result.estimatedRevenueMinPKR || 0)/1000).toFixed(0)}k-${((result.estimatedRevenueMaxPKR || 0)/1000).toFixed(0)}k`}
                  subtitle={`@PKR ${result.marketPricePerMaund || '-'}/maund`}
                  color="green" icon={FiDollarSign}
                />
              </div>

              <Card>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-gray-800">{isUrdu ? 'کل پیداوار' : 'Total Harvest'}</h4>
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                    {result.confidencePercent || 70}% {isUrdu ? 'اعتماد' : 'confidence'}
                  </span>
                </div>
                <p className="text-2xl font-bold text-green-700">{result.totalYieldRangeForArea}</p>
                <p className="text-sm text-gray-500 mt-2">
                  📅 {isUrdu ? 'کٹائی کا وقت' : 'Harvest'}: {isUrdu ? result.harvestTimingUrdu : result.harvestTiming}
                </p>
              </Card>

              {(result.riskFactors?.length || result.riskFactorsUrdu?.length) > 0 && (
                <Card title={isUrdu ? 'ممکنہ خطرات' : 'Risk Factors'} icon={FiAlertTriangle}>
                  <ul className="space-y-2">
                    {(isUrdu ? result.riskFactorsUrdu : result.riskFactors)?.map((r, i) => (
                      <li key={i} className="flex gap-2 text-sm text-yellow-800 bg-yellow-50 p-3 rounded-lg">
                        <span>⚠️</span><span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              )}

              {(result.improvementTips?.length || result.improvementTipsUrdu?.length) > 0 && (
                <Card title={isUrdu ? 'پیداوار بڑھانے کے ٹپس' : 'Improvement Tips'}>
                  <ul className="space-y-2">
                    {(isUrdu ? result.improvementTipsUrdu : result.improvementTips)?.map((t, i) => (
                      <li key={i} className="flex gap-2 text-sm text-green-800 bg-green-50 p-3 rounded-lg">
                        <span>💡</span><span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
