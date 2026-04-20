import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toolsAPI } from '../../services/api';
import { Input, Select, Button, Card, StatBox } from '../../components/ui/FormControls';
import { FiHeart, FiArrowLeft, FiDollarSign } from 'react-icons/fi';

export default function ZakatCalc() {
  const { i18n } = useTranslation();
  const isUrdu = i18n.language === 'ur';
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [form, setForm] = useState({ harvestMaunds: 40, pricePerMaund: 4000, irrigationType: 'irrigated' });
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleCalculate = async () => {
    setLoading(true);
    try {
      const res = await toolsAPI.zakat({
        harvestMaunds: parseFloat(form.harvestMaunds),
        pricePerMaund: parseFloat(form.pricePerMaund),
        irrigationType: form.irrigationType
      });
      setResult(res.data.data);
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-5 sm:space-y-6 max-w-4xl mx-auto">
      <div>
        <Link to="/tools" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-green-600 mb-3">
          <FiArrowLeft size={14} /> {isUrdu ? 'ٹولز پر واپس' : 'Back to Tools'}
        </Link>
        <div className="bg-gradient-to-r from-teal-500 to-green-500 rounded-2xl p-5 sm:p-6 text-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0">
              <FiHeart size={24} />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold">{isUrdu ? 'عشر کیلکولیٹر' : 'Zakat/Ushar Calculator'}</h1>
              <p className="text-teal-100 text-xs sm:text-sm mt-0.5 line-clamp-2">
                {isUrdu ? 'اسلامی اصولوں کے مطابق فصل پر واجب عشر' : 'Calculate obligatory Ushar per Islamic rules'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Input
              label={isUrdu ? 'کل فصل (من)' : 'Total Harvest (Maund)'}
              type="number" min="0" step="0.1"
              value={form.harvestMaunds} onChange={set('harvestMaunds')}
            />
            <Input
              label={isUrdu ? 'قیمت فی من (PKR)' : 'Price per Maund (PKR)'}
              type="number" min="0"
              value={form.pricePerMaund} onChange={set('pricePerMaund')}
            />
            <Select
              label={isUrdu ? 'آبپاشی کی قسم' : 'Irrigation Type'}
              value={form.irrigationType} onChange={set('irrigationType')}
              options={[
                { value: 'rain-fed', label: isUrdu ? 'بارانی (10% عشر)' : 'Rain-fed (10% Ushar)' },
                { value: 'irrigated', label: isUrdu ? 'آبی - ٹیوب ویل/نہر (5% نصف عشر)' : 'Irrigated - Tubewell/Canal (5% Nisf-Ushar)' }
              ]}
            />
            <Button icon={FiHeart} loading={loading} onClick={handleCalculate} className="w-full">
              {isUrdu ? 'عشر کا حساب' : 'Calculate Ushar'}
            </Button>
          </div>

          <div>
            {!result ? (
              <div className="text-center py-16 text-gray-400 h-full flex items-center justify-center">
                <div>
                  <FiHeart className="mx-auto mb-3 text-gray-300" size={48} />
                  <p className="text-sm">{isUrdu ? 'تفصیلات درج کریں' : 'Enter harvest details'}</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <StatBox
                    label={isUrdu ? 'کل قیمت' : 'Total Value'}
                    value={`PKR ${result.totalValuePKR?.toLocaleString()}`}
                    color="blue" icon={FiDollarSign}
                  />
                  <StatBox
                    label={isUrdu ? 'عشر کی شرح' : 'Ushar Rate'}
                    value={`${result.usharRate}%`}
                    subtitle={isUrdu ? result.usharRateLabelUrdu : result.usharRateLabel}
                    color="green"
                  />
                </div>

                <div className={`rounded-xl p-5 ${result.isEligible ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white' : 'bg-gray-100 text-gray-700'}`}>
                  <p className="text-sm opacity-90">{isUrdu ? 'واجب عشر' : 'Obligatory Ushar'}</p>
                  <p className="text-3xl font-bold mt-1">PKR {result.usharAmountPKR?.toLocaleString()}</p>
                  <p className="text-sm opacity-90 mt-1">
                    = {result.usharInMaunds} {isUrdu ? 'من' : 'Maund'}
                  </p>
                </div>

                <div className={`border rounded-xl p-4 text-sm ${result.isEligible ? 'bg-green-50 border-green-200 text-green-800' : 'bg-yellow-50 border-yellow-200 text-yellow-800'}`}>
                  <p className="font-medium">{isUrdu ? result.noteUrdu : result.note}</p>
                  <p className="text-xs mt-2 opacity-80">
                    {isUrdu
                      ? `نصاب: ${result.nisabMaunds} من (653 کلوگرام گندم کے برابر)`
                      : `Nisab: ${result.nisabMaunds} maund (equivalent to 653 kg wheat)`}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Info */}
      <Card>
        <h3 className="font-bold text-gray-800 mb-3">📖 {isUrdu ? 'عشر کے بارے میں' : 'About Ushar'}</h3>
        <div className="text-sm text-gray-700 space-y-2">
          <p>{isUrdu
            ? '• بارانی زمین (بغیر خرچ آبپاشی): 10% عشر'
            : '• Rain-fed land (no irrigation cost): 10% Ushar'}
          </p>
          <p>{isUrdu
            ? '• آبی زمین (ٹیوب ویل، نہر): 5% نصف عشر'
            : '• Irrigated land (tubewell, canal): 5% Nisf-Ushar'}
          </p>
          <p>{isUrdu
            ? '• نصاب: کم از کم تقریباً 653 کلوگرام (16.3 من) گندم یا برابر'
            : '• Nisab: Minimum ~653 kg (16.3 maunds) of wheat or equivalent'}
          </p>
          <p>{isUrdu
            ? '• غریبوں، مسکینوں، اور زکوٰۃ کے آٹھ مصارف پر تقسیم کریں'
            : '• Distribute to the poor, needy, and eight categories mentioned in Quran'}
          </p>
        </div>
      </Card>
    </div>
  );
}
