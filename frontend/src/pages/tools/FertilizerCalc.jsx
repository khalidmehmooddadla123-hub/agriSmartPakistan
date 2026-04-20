import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toolsAPI } from '../../services/api';
import { Input, Select, Button, Card, StatBox } from '../../components/ui/FormControls';
import { FiZap, FiArrowLeft, FiDollarSign, FiPackage } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function FertilizerCalc() {
  const { i18n } = useTranslation();
  const isUrdu = i18n.language === 'ur';
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [form, setForm] = useState({
    crop: 'Wheat', area: 1, soilType: 'loamy', previousCrop: ''
  });
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleCalculate = async () => {
    setLoading(true);
    try {
      const res = await toolsAPI.fertilizer(form);
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
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-5 sm:p-6 text-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0">
              <FiZap size={24} />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold">{isUrdu ? 'کھاد کیلکولیٹر' : 'Fertilizer Calculator'}</h1>
              <p className="text-green-100 text-xs sm:text-sm mt-0.5 line-clamp-2">
                {isUrdu ? 'مقامی برانڈز اور مہینہ بہ مہینہ پلان' : 'NPK with Pakistani brand recommendations'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
        <Card title={isUrdu ? 'تفصیلات درج کریں' : 'Enter Details'} icon={FiPackage}>
          <div className="space-y-4">
            <Select
              label={isUrdu ? 'فصل' : 'Crop'}
              value={form.crop} onChange={set('crop')}
              options={['Wheat','Rice','Cotton','Sugarcane','Maize','Potato','Tomato','Onion','Mango','Chickpea','Mustard','Sunflower']}
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
                { value: 'clay', label: isUrdu ? 'چکنی' : 'Clay' }
              ]}
            />
            <Select
              label={isUrdu ? 'پچھلی فصل (اختیاری)' : 'Previous Crop (optional)'}
              value={form.previousCrop} onChange={set('previousCrop')}
              options={[
                { value: '', label: isUrdu ? 'نہیں / پہلی بار' : 'None / First time' },
                'Wheat','Rice','Cotton','Sugarcane','Maize','Chickpea','Mustard'
              ]}
            />
            <Button icon={FiZap} loading={loading} onClick={handleCalculate} className="w-full">
              {isUrdu ? 'حساب کریں' : 'Calculate NPK'}
            </Button>
          </div>
        </Card>

        <div className="lg:col-span-2">
          {!result ? (
            <Card>
              <div className="text-center py-16 text-gray-400">
                <FiZap className="mx-auto mb-3 text-gray-300" size={48} />
                <p>{isUrdu ? 'فصل کی تفصیلات درج کریں' : 'Enter crop details to get AI recommendation'}</p>
              </div>
            </Card>
          ) : result.error ? (
            <Card>
              <div className="text-center py-16 text-red-500">
                <p>{result.error}</p>
              </div>
            </Card>
          ) : (
            <div className="space-y-4">
              {/* Cost Summary */}
              <div className="grid grid-cols-4 gap-3">
                <StatBox
                  label="N (kg)" value={result.nitrogenKg || 0} color="green"
                />
                <StatBox
                  label="P (kg)" value={result.phosphorusKg || 0} color="blue"
                />
                <StatBox
                  label="K (kg)" value={result.potassiumKg || 0} color="purple"
                />
                <StatBox
                  label={isUrdu ? 'کل قیمت' : 'Total Cost'}
                  value={`PKR ${result.totalCostPKR?.toLocaleString() || 0}`}
                  color="red" icon={FiDollarSign}
                />
              </div>

              {/* Fertilizers list */}
              <Card title={isUrdu ? 'تجویز کردہ کھادیں' : 'Recommended Fertilizers'}>
                <div className="space-y-3">
                  {result.fertilizers?.map((f, i) => (
                    <div key={i} className="border border-gray-100 rounded-xl p-4 hover:border-green-300 transition">
                      <div className="flex items-start justify-between flex-wrap gap-2">
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-800">
                            {isUrdu && f.nameUrdu ? f.nameUrdu : f.name}
                          </h4>
                          {f.brand && <p className="text-xs text-gray-500 mt-0.5">🏷 {f.brand}</p>}
                          <p className="text-xs text-green-700 mt-1">
                            🕐 {isUrdu && f.applicationTimeUrdu ? f.applicationTimeUrdu : f.applicationTime}
                          </p>
                          {f.purpose && <p className="text-xs text-gray-600 mt-1 italic">{f.purpose}</p>}
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-gray-800">{f.totalQuantity || f.quantityPerAcre}</p>
                          <p className="text-xs text-gray-500">{f.pricePerUnit}</p>
                          <p className="text-sm font-bold text-red-600 mt-1">
                            PKR {f.totalPricePKR?.toLocaleString() || '-'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Schedule */}
              {result.applicationSchedule && (
                <Card title={isUrdu ? 'مہینہ بہ مہینہ پلان' : 'Application Schedule'}>
                  <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                    {isUrdu && result.applicationScheduleUrdu ? result.applicationScheduleUrdu : result.applicationSchedule}
                  </p>
                </Card>
              )}

              {/* Tips */}
              {(result.tipsEn?.length || result.tipsUr?.length) > 0 && (
                <Card title={isUrdu ? 'ماہرین کے مشورے' : 'Expert Tips'}>
                  <ul className="space-y-2">
                    {(isUrdu ? result.tipsUr : result.tipsEn)?.map((tip, i) => (
                      <li key={i} className="flex gap-2 text-sm text-gray-700">
                        <span className="text-green-600 font-bold">✓</span>
                        <span>{tip}</span>
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
