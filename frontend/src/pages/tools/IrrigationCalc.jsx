import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toolsAPI } from '../../services/api';
import { Input, Select, Button, Card, StatBox } from '../../components/ui/FormControls';
import { FiDroplet, FiThermometer, FiCloud, FiArrowLeft, FiZap, FiClock, FiSun } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function IrrigationCalc() {
  const { i18n } = useTranslation();
  const isUrdu = i18n.language === 'ur';
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const [form, setForm] = useState({
    crop: 'Wheat',
    area: 1,
    soilType: 'loamy',
    lastIrrigationDays: 7,
    temperature: 30,
    humidity: 50,
    rainfall: 0
  });
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleCalculate = async () => {
    setLoading(true);
    try {
      const res = await toolsAPI.irrigation(form);
      setResult(res.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Calculation failed');
    } finally {
      setLoading(false);
    }
  };

  const urgencyColor = {
    high: 'bg-red-100 text-red-700 border-red-200',
    medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    low: 'bg-green-100 text-green-700 border-green-200'
  };

  return (
    <div className="space-y-5 sm:space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <Link to="/tools" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-green-600 mb-3">
          <FiArrowLeft size={14} /> {isUrdu ? 'ٹولز پر واپس' : 'Back to Tools'}
        </Link>
        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl p-5 sm:p-6 text-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0">
              <FiDroplet size={24} />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold">{isUrdu ? 'سمارٹ آبپاشی' : 'Smart Irrigation'}</h1>
              <p className="text-blue-100 text-xs sm:text-sm mt-0.5 line-clamp-2">
                {isUrdu ? 'اپنی فصل کے لیے صحیح پانی کی مقدار' : 'Find exact water your crop needs'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
        {/* Input Form */}
        <Card title={isUrdu ? 'فصل کی تفصیلات' : 'Crop Details'} icon={FiSun}>
          <div className="space-y-4">
            <Select
              label={isUrdu ? 'فصل' : 'Crop'}
              value={form.crop} onChange={set('crop')}
              options={['Wheat','Rice','Cotton','Sugarcane','Maize','Potato','Tomato','Onion','Mango','Vegetable']}
            />
            <Input
              label={isUrdu ? 'رقبہ (ایکڑ)' : 'Area (acres)'}
              type="number" min="0.1" step="0.1"
              value={form.area} onChange={set('area')}
            />
            <Select
              label={isUrdu ? 'مٹی کی قسم' : 'Soil Type'}
              value={form.soilType} onChange={set('soilType')}
              options={[
                { value: 'sandy', label: isUrdu ? 'ریتلی' : 'Sandy' },
                { value: 'loamy', label: isUrdu ? 'میرا' : 'Loamy' },
                { value: 'clay', label: isUrdu ? 'چکنی' : 'Clay' },
                { value: 'silty', label: isUrdu ? 'گاد دار' : 'Silty' }
              ]}
            />
            <Input
              label={isUrdu ? 'آخری آبپاشی کو کتنے دن ہوئے؟' : 'Days since last irrigation'}
              type="number" min="0" value={form.lastIrrigationDays} onChange={set('lastIrrigationDays')}
            />
            <div className="grid grid-cols-3 gap-3">
              <Input
                icon={FiThermometer} label={isUrdu ? 'درجہ حرارت °C' : 'Temp °C'}
                type="number" value={form.temperature} onChange={set('temperature')}
              />
              <Input
                icon={FiCloud} label={isUrdu ? 'نمی %' : 'Humidity %'}
                type="number" value={form.humidity} onChange={set('humidity')}
              />
              <Input
                icon={FiDroplet} label={isUrdu ? 'بارش mm' : 'Rain mm'}
                type="number" value={form.rainfall} onChange={set('rainfall')}
              />
            </div>
            <Button icon={FiZap} loading={loading} onClick={handleCalculate} className="w-full">
              {isUrdu ? 'حساب کریں' : 'Calculate Water Need'}
            </Button>
          </div>
        </Card>

        {/* Results */}
        <Card
          title={isUrdu ? 'نتیجہ' : 'Result'}
          icon={FiDroplet}
          badge={result?.urgency ? (
            <span className={`text-xs font-bold px-3 py-1 rounded-full border ${urgencyColor[result.urgency]}`}>
              {isUrdu ? (result.urgency === 'high' ? 'فوری' : result.urgency === 'medium' ? 'درمیانہ' : 'کم') : result.urgency.toUpperCase()}
            </span>
          ) : null}
        >
          {!result ? (
            <div className="text-center py-12 text-gray-400">
              <FiDroplet className="mx-auto mb-3 text-gray-300" size={48} />
              <p className="text-sm">{isUrdu ? 'فصل کی تفصیلات درج کریں اور حساب کریں' : 'Enter crop details and click Calculate'}</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <StatBox
                  label={isUrdu ? 'پانی کی ضرورت' : 'Water Needed'}
                  value={`${result.waterNeededMM} mm`}
                  subtitle={`${result.waterNeededM3?.toLocaleString()} m³`}
                  color="blue" icon={FiDroplet}
                />
                <StatBox
                  label={isUrdu ? 'آبپاشی کا وقت' : 'Duration'}
                  value={result.irrigationDuration || '-'}
                  subtitle={result.bestTime}
                  color="purple" icon={FiClock}
                />
              </div>

              <div className="bg-green-50 border border-green-100 rounded-xl p-4">
                <h4 className="font-semibold text-green-800 text-sm mb-2 flex items-center gap-2">
                  🌱 {isUrdu ? 'تجویز' : 'Recommendation'}
                </h4>
                <p className="text-sm text-green-800 leading-relaxed">
                  {isUrdu ? result.recommendationUrdu : result.recommendation}
                </p>
                {result.nextIrrigationDate && (
                  <p className="text-xs text-green-700 mt-2">
                    📅 {isUrdu ? 'اگلی آبپاشی' : 'Next irrigation'}: {result.nextIrrigationDate}
                  </p>
                )}
              </div>

              {result.waterSavingTip && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                  <h4 className="font-semibold text-blue-800 text-sm mb-2 flex items-center gap-2">
                    💧 {isUrdu ? 'پانی بچانے کا مشورہ' : 'Water Saving Tip'}
                  </h4>
                  <p className="text-sm text-blue-800 leading-relaxed">
                    {isUrdu ? result.waterSavingTipUrdu : result.waterSavingTip}
                  </p>
                </div>
              )}

              <div className="text-xs text-gray-400 text-center pt-2 border-t border-gray-100">
                {result.method === 'ai-enhanced' ? '🧠 AI-enhanced' : '📐 Math-based'} calculation
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
