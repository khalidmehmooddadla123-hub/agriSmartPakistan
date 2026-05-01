import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiArrowLeft, FiInfo, FiRefreshCw } from 'react-icons/fi';

/**
 * Pakistani Agricultural Unit Converter
 * Land area · Weight · Volume — all common Pakistani + standard units.
 * Conversion tables use Pakistan government / Punjab Revenue Dept official values.
 */

// === LAND AREA — base unit: square meter ===
// Pakistan/Punjab Revenue Dept standards
const LAND_UNITS = [
  { key: 'sarsahi',  en: 'Sarsahi',     ur: 'سرساہی',  toM2: 2.81032,    note: '1/9 Marla' },
  { key: 'marla',    en: 'Marla',       ur: 'مرلہ',    toM2: 25.2929,    note: '272.25 sq ft (Govt)' },
  { key: 'kanal',    en: 'Kanal',       ur: 'کنال',    toM2: 505.857,    note: '20 Marlas' },
  { key: 'ghumao',   en: 'Ghumao',      ur: 'گھماؤ',  toM2: 2023.428,   note: '4 Kanals' },
  { key: 'acre',     en: 'Acre',        ur: 'ایکڑ',   toM2: 4046.856,   note: '8 Kanals' },
  { key: 'killa',    en: 'Killa',       ur: 'کلّہ',   toM2: 4046.856,   note: 'Same as Acre' },
  { key: 'jareeb',   en: 'Jareeb',      ur: 'جریب',   toM2: 2023.428,   note: '4 Kanals (Sindh)' },
  { key: 'bigha',    en: 'Bigha (Pak)', ur: 'بیگھہ',  toM2: 2530.0,     note: '~5/8 Acre' },
  { key: 'murabba',  en: 'Murabba',     ur: 'مربع',   toM2: 101171.41,  note: '25 Acres / 200 Kanals' },
  { key: 'hectare',  en: 'Hectare',     ur: 'ہیکٹر',  toM2: 10000,      note: '10,000 m²' },
  { key: 'sqm',      en: 'Square Meter',ur: 'مربع میٹر', toM2: 1,        note: 'm²' },
  { key: 'sqft',     en: 'Square Foot', ur: 'مربع فٹ',  toM2: 0.092903,  note: 'ft²' },
  { key: 'sqyd',     en: 'Square Yard', ur: 'مربع گز',  toM2: 0.836127,  note: 'yd²' }
];

// === WEIGHT — base unit: kilogram ===
const WEIGHT_UNITS = [
  { key: 'kg',       en: 'Kilogram',  ur: 'کلوگرام',  toKg: 1,        note: 'Standard SI' },
  { key: 'maund',    en: 'Maund (Pakistani)', ur: 'من',       toKg: 40,       note: '40 kg (Pakistan)' },
  { key: 'seer',     en: 'Seer',      ur: 'سیر',     toKg: 1,        note: 'Modern PK seer = 1 kg' },
  { key: 'pao',      en: 'Pao',       ur: 'پاؤ',     toKg: 0.25,     note: 'Quarter seer' },
  { key: 'chatak',   en: 'Chatak',    ur: 'چھٹاک',   toKg: 0.0625,   note: '1/16 seer' },
  { key: 'tola',     en: 'Tola',      ur: 'تولہ',    toKg: 0.01166,  note: '11.66 g (gold standard)' },
  { key: 'bori50',   en: 'Bori (50kg)', ur: 'بوری (50)', toKg: 50,    note: 'Standard bag' },
  { key: 'bori100',  en: 'Bori (100kg)',ur: 'بوری (100)',toKg: 100,   note: 'Large bag' },
  { key: 'quintal',  en: 'Quintal',   ur: 'کوئنٹل',  toKg: 100,      note: '100 kg' },
  { key: 'tonne',    en: 'Tonne',     ur: 'ٹن',      toKg: 1000,     note: '1000 kg' },
  { key: 'gram',     en: 'Gram',      ur: 'گرام',    toKg: 0.001,    note: 'g' },
  { key: 'pound',    en: 'Pound',     ur: 'پاؤنڈ',   toKg: 0.453592, note: 'lb' }
];

// === VOLUME — base unit: liter ===
const VOLUME_UNITS = [
  { key: 'liter',    en: 'Liter',          ur: 'لیٹر',         toL: 1,            note: 'L' },
  { key: 'gallonUS', en: 'Gallon (US)',    ur: 'گیلن (US)',    toL: 3.78541,      note: 'US gal' },
  { key: 'gallonUK', en: 'Gallon (UK)',    ur: 'گیلن (برطانوی)',toL: 4.54609,     note: 'Imperial gal' },
  { key: 'm3',       en: 'Cubic Meter',    ur: 'مکعب میٹر',    toL: 1000,         note: 'm³' },
  { key: 'cusec',    en: 'Cusec (1 sec)',  ur: 'کیوسک (سیکنڈ)',toL: 28.3168,      note: 'ft³/sec for 1s' },
  { key: 'acreFt',   en: 'Acre-Foot',      ur: 'ایکڑ-فٹ',     toL: 1233481.84,   note: 'Irrigation: 1 acre, 1 ft deep' },
  { key: 'tankerSm', en: 'Tanker (small)', ur: 'ٹینکر (چھوٹا)',toL: 1000,         note: '1,000 L' },
  { key: 'tankerLg', en: 'Tanker (large)', ur: 'ٹینکر (بڑا)',  toL: 6000,         note: '6,000 L' },
  { key: 'cuft',     en: 'Cubic Foot',     ur: 'مکعب فٹ',      toL: 28.3168,      note: 'ft³' },
  { key: 'ml',       en: 'Milliliter',     ur: 'ملی لیٹر',     toL: 0.001,        note: 'mL' }
];

const TABS = [
  { key: 'land',   en: 'Land Area',  ur: 'رقبہ',   icon: '🌾', units: LAND_UNITS,  baseKey: 'toM2',
    quickEn: 'Quick: 1 Murabba = 25 Acres = 200 Kanals = 4,000 Marlas',
    quickUr: 'فوری: ۱ مربع = ۲۵ ایکڑ = ۲۰۰ کنال = ۴۰۰۰ مرلہ' },
  { key: 'weight', en: 'Weight',     ur: 'وزن',     icon: '⚖️', units: WEIGHT_UNITS, baseKey: 'toKg',
    quickEn: 'Quick: 1 Maund = 40 kg · 1 Quintal = 2.5 Maund · 1 Tonne = 25 Maund',
    quickUr: 'فوری: ۱ من = ۴۰ کلو · ۱ کوئنٹل = ۲.۵ من · ۱ ٹن = ۲۵ من' },
  { key: 'volume', en: 'Volume',     ur: 'حجم',    icon: '💧', units: VOLUME_UNITS, baseKey: 'toL',
    quickEn: 'Quick: 1 Acre-Foot = 1,233,482 L (covers 1 acre with 1 ft of water)',
    quickUr: 'فوری: ۱ ایکڑ-فٹ ≈ ۱۲ لاکھ ۳۳ ہزار لیٹر (آبپاشی)' }
];

const formatNum = (n) => {
  if (!isFinite(n) || isNaN(n)) return '—';
  if (n === 0) return '0';
  const abs = Math.abs(n);
  if (abs < 0.0001) return n.toExponential(2);
  if (abs >= 1e9) return (n / 1e9).toFixed(2) + 'B';
  if (abs >= 1e6) return (n / 1e6).toFixed(2) + 'M';
  if (abs >= 1000) return n.toLocaleString('en-PK', { maximumFractionDigits: 2 });
  if (abs >= 1) return n.toLocaleString('en-PK', { maximumFractionDigits: 4 });
  return n.toFixed(6).replace(/0+$/, '').replace(/\.$/, '');
};

export default function UnitConverter() {
  const { i18n } = useTranslation();
  const isUrdu = i18n.language === 'ur';

  const [tab, setTab] = useState('land');
  const [value, setValue] = useState('1');
  const [fromUnit, setFromUnit] = useState('marla');

  const activeTab = TABS.find(t => t.key === tab);
  const baseKey = activeTab.baseKey;
  const units = activeTab.units;

  // Reset fromUnit when tab changes
  const switchTab = (k) => {
    setTab(k);
    const next = TABS.find(t => t.key === k);
    setFromUnit(next.units[0].key);
    setValue('1');
  };

  const conversions = useMemo(() => {
    const v = parseFloat(value);
    if (!isFinite(v)) return units.map(u => ({ ...u, result: 0 }));
    const fromObj = units.find(u => u.key === fromUnit);
    if (!fromObj) return [];
    const baseValue = v * fromObj[baseKey]; // value in base SI unit
    return units.map(u => ({ ...u, result: baseValue / u[baseKey] }));
  }, [value, fromUnit, units, baseKey]);

  const heroGradient =
    tab === 'land'   ? 'from-green-600 via-emerald-600 to-teal-600' :
    tab === 'weight' ? 'from-amber-600 via-orange-600 to-red-600' :
                       'from-blue-600 via-cyan-600 to-sky-600';

  return (
    <div className="space-y-5 max-w-5xl mx-auto animate-fade-in-up">
      <div>
        <Link to="/tools" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-green-600 mb-3">
          <FiArrowLeft size={14} className="rtl:rotate-180" /> {isUrdu ? 'ٹولز پر واپس' : 'Back to Tools'}
        </Link>

        {/* Hero */}
        <div className="relative">
          <div className={`relative bg-gradient-to-br ${heroGradient} rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-7 text-white card-elevated transition-all duration-500`}>
            <div className="absolute inset-0 overflow-hidden rounded-2xl sm:rounded-3xl pointer-events-none">
              <div className="absolute -top-12 -right-12 rtl:-left-12 rtl:right-auto w-48 h-48 bg-white/15 rounded-full blur-3xl" />
              <div className="absolute -bottom-10 -left-10 rtl:-right-10 rtl:left-auto w-44 h-44 bg-yellow-200/20 rounded-full blur-3xl" />
            </div>
            <div className="relative flex items-center gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 backdrop-blur rounded-xl sm:rounded-2xl flex items-center justify-center text-2xl sm:text-3xl shrink-0">
                {activeTab.icon}
              </div>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight">
                  {isUrdu ? 'پیمائش کنورٹر' : 'Pakistani Units Converter'}
                </h1>
                <p className="text-white/90 text-xs sm:text-sm mt-0.5">
                  {isUrdu ? 'مرلہ، کنال، ایکڑ، مربع، من، سیر، گیلن — سب ایک جگہ' : 'Marla, Kanal, Acre, Murabba, Maund, Seer, Gallon — all in one'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab selector */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => switchTab(t.key)}
            className={`group relative overflow-hidden rounded-xl sm:rounded-2xl p-3 sm:p-4 text-center transition-all ${
              tab === t.key
                ? 'bg-white border-2 border-emerald-500 card-elevated'
                : 'bg-white border border-gray-100 hover:border-emerald-200 card-soft'
            }`}
          >
            <div className="text-2xl sm:text-3xl mb-1.5">{t.icon}</div>
            <p className={`text-xs sm:text-sm font-bold ${tab === t.key ? 'text-emerald-700' : 'text-gray-700'}`}>
              {isUrdu ? t.ur : t.en}
            </p>
          </button>
        ))}
      </div>

      {/* Input panel */}
      <div className="bg-white rounded-2xl border border-gray-100 card-soft p-5 sm:p-6">
        <label className="block text-[13px] font-semibold text-gray-700 mb-2">
          {isUrdu ? 'قدر داخل کریں' : 'Enter value'}
        </label>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="number"
            min="0"
            step="any"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="flex-1 px-4 py-3.5 border-2 border-gray-200 rounded-xl text-2xl sm:text-3xl font-bold text-gray-900 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none placeholder:text-gray-300"
            placeholder="0"
          />
          <select
            value={fromUnit}
            onChange={(e) => setFromUnit(e.target.value)}
            className="sm:w-56 px-4 py-3.5 border-2 border-gray-200 rounded-xl text-base font-semibold text-gray-800 bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none cursor-pointer"
          >
            {units.map(u => (
              <option key={u.key} value={u.key}>
                {u.en} {u.en !== u.ur ? `(${u.ur})` : ''}
              </option>
            ))}
          </select>
          <button
            onClick={() => setValue('1')}
            title={isUrdu ? 'دوبارہ سیٹ' : 'Reset'}
            className="px-4 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl flex items-center justify-center gap-1.5 text-sm font-semibold transition shrink-0"
          >
            <FiRefreshCw size={15} /> <span className="sm:hidden">{isUrdu ? 'دوبارہ' : 'Reset'}</span>
          </button>
        </div>

        {/* Quick chips */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {[1, 5, 10, 25, 50, 100].map(q => (
            <button
              key={q}
              onClick={() => setValue(String(q))}
              className="px-3 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-full transition"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Quick conversion fact */}
      <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-100 rounded-2xl p-4 flex items-start gap-3">
        <FiInfo className="text-emerald-600 shrink-0 mt-0.5" size={18} />
        <p className="text-[13px] sm:text-sm text-emerald-900 leading-relaxed font-medium">
          {isUrdu ? activeTab.quickUr : activeTab.quickEn}
        </p>
      </div>

      {/* Results grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {conversions.map(u => {
          const isFrom = u.key === fromUnit;
          return (
            <div
              key={u.key}
              className={`relative rounded-2xl p-4 sm:p-5 transition-all hover:scale-[1.02] cursor-default ${
                isFrom
                  ? 'bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-200'
                  : 'bg-white border border-gray-100 hover:border-emerald-200 hover:shadow-md'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <p className={`text-[11px] sm:text-xs font-bold uppercase tracking-wider ${isFrom ? 'text-emerald-50' : 'text-gray-500'}`}>
                  {u.en}
                </p>
                <p className={`text-[11px] font-medium ${isFrom ? 'text-emerald-100' : 'text-gray-400'}`}>
                  {u.ur}
                </p>
              </div>
              <p className={`text-2xl sm:text-3xl font-extrabold leading-tight tracking-tight ${isFrom ? 'text-white' : 'text-gray-900'}`}>
                {formatNum(u.result)}
              </p>
              <p className={`text-[10.5px] mt-1.5 ${isFrom ? 'text-emerald-100' : 'text-gray-400'}`}>
                {u.note}
              </p>
            </div>
          );
        })}
      </div>

      {/* Reference table */}
      <div className="bg-white rounded-2xl border border-gray-100 card-soft p-5">
        <h3 className="font-bold text-gray-900 text-sm mb-3 flex items-center gap-2">
          📚 {isUrdu ? 'حوالہ جدول' : 'Reference Conversions'}
        </h3>
        {tab === 'land' && (
          <div className="space-y-1.5 text-[13px] text-gray-700">
            <p><strong>9 Sarsahi</strong> = 1 Marla (مرلہ)</p>
            <p><strong>20 Marla</strong> = 1 Kanal (کنال)</p>
            <p><strong>4 Kanal</strong> = 1 Ghumao (گھماؤ) = 1 Jareeb</p>
            <p><strong>8 Kanal</strong> = 1 Acre (ایکڑ) = 1 Killa (کلّہ)</p>
            <p><strong>25 Acre</strong> = 1 Murabba (مربع) = 200 Kanal = 4,000 Marla</p>
            <p><strong>1 Hectare</strong> = 2.471 Acres ≈ 19.77 Kanal</p>
            <p><strong>1 Marla</strong> = 272.25 sq ft = 25.293 m² (Govt of Punjab standard)</p>
          </div>
        )}
        {tab === 'weight' && (
          <div className="space-y-1.5 text-[13px] text-gray-700">
            <p><strong>1 Maund (من)</strong> = 40 kg (Pakistani standard)</p>
            <p><strong>1 Seer (سیر)</strong> = 1 kg (modern Pakistani usage)</p>
            <p><strong>4 Pao</strong> = 1 Seer · <strong>16 Chatak</strong> = 1 Seer</p>
            <p><strong>1 Quintal</strong> = 100 kg = 2.5 Maund</p>
            <p><strong>1 Tonne</strong> = 1,000 kg = 25 Maund = 20 Bori (50 kg)</p>
            <p><strong>1 Tola</strong> = 11.66 g (used for gold/silver)</p>
            <p><strong>1 Pound (lb)</strong> = 0.4536 kg</p>
          </div>
        )}
        {tab === 'volume' && (
          <div className="space-y-1.5 text-[13px] text-gray-700">
            <p><strong>1 Liter</strong> = 0.264 US Gallon = 0.220 Imperial Gallon</p>
            <p><strong>1 m³</strong> = 1,000 Liters = 35.31 ft³</p>
            <p><strong>1 Acre-Foot</strong> ≈ 1,233,482 L — water needed to cover 1 acre with 1 ft depth</p>
            <p><strong>1 Cusec</strong> = 28.32 L/sec = 1.7 m³/min (canal flow rate)</p>
            <p><strong>Tractor tanker (small)</strong> ≈ 1,000 L · <strong>large</strong> ≈ 6,000 L</p>
            <p><strong>1 Gallon (US)</strong> = 3.785 L · <strong>Imperial</strong> = 4.546 L</p>
          </div>
        )}
      </div>
    </div>
  );
}
