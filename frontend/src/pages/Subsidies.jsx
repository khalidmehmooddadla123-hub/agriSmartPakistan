import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, Input, Select, Button } from '../components/ui/FormControls';
import { FiBook, FiArrowLeft, FiExternalLink, FiCheckCircle, FiXCircle, FiAlertCircle } from 'react-icons/fi';

const SCHEMES = [
  {
    id: 'kissan_card',
    name: 'Kissan Card (Punjab)', nameUrdu: 'کسان کارڈ (پنجاب)',
    category: 'subsidy',
    provider: 'Govt of Punjab',
    description: 'Interest-free loans up to PKR 150,000 for small farmers. Can be used for seed, fertilizer, pesticide purchases.',
    descriptionUrdu: 'چھوٹے کسانوں کے لیے 150,000 روپے تک بلاسود قرض۔ بیج، کھاد، دوا کے لیے استعمال ہو سکتا ہے۔',
    eligibility: { maxLandAcres: 12.5, requiresCNIC: true, province: 'Punjab' },
    benefits: 'Up to PKR 150,000 interest-free credit',
    benefitsUrdu: '150,000 روپے تک بلاسود قرض',
    link: 'https://kissancard.punjab.gov.pk/',
    emoji: '💳'
  },
  {
    id: 'urea_subsidy',
    name: 'Urea Fertilizer Subsidy', nameUrdu: 'یوریا کھاد سبسڈی',
    category: 'subsidy',
    provider: 'Federal Govt',
    description: 'Fixed subsidized urea price. Farmers can buy at reduced rates through CNIC-linked quota system.',
    descriptionUrdu: 'یوریا کی مقررہ سبسڈی والی قیمت۔ کسان شناختی کارڈ کے ذریعے کم نرخوں پر خرید سکتے ہیں۔',
    eligibility: { maxLandAcres: null, requiresCNIC: true, province: null },
    benefits: 'PKR 1,000-2,000 savings per bag',
    benefitsUrdu: 'فی بوری 1,000-2,000 روپے کی بچت',
    link: 'https://www.finance.gov.pk/',
    emoji: '🧪'
  },
  {
    id: 'benazir_hari_card',
    name: 'Benazir Hari Card', nameUrdu: 'بینظیر ہاری کارڈ',
    category: 'subsidy',
    provider: 'Govt of Sindh',
    description: 'PKR 100,000 interest-free loan for Sindh farmers. Direct cash transfer for agricultural inputs.',
    descriptionUrdu: 'سندھ کے کسانوں کے لیے 100,000 روپے بلاسود قرض۔',
    eligibility: { maxLandAcres: 16, requiresCNIC: true, province: 'Sindh' },
    benefits: 'PKR 100,000 grant',
    benefitsUrdu: '1 لاکھ روپے کا گرانٹ',
    link: 'https://www.sindh.gov.pk/',
    emoji: '💰'
  },
  {
    id: 'zarai_taraqiati_bank_loan',
    name: 'ZTBL Agricultural Loan', nameUrdu: 'زرعی ترقیاتی بینک قرض',
    category: 'loan',
    provider: 'Zarai Taraqiati Bank',
    description: 'Crop production loans, tubewell loans, tractor loans at subsidized interest rates for farmers nationwide.',
    descriptionUrdu: 'فصل پیداوار، ٹیوب ویل، ٹریکٹر قرض کم شرح سود پر۔',
    eligibility: { maxLandAcres: null, requiresCNIC: true, province: null },
    benefits: 'Loans up to PKR 5 million',
    benefitsUrdu: '50 لاکھ روپے تک قرض',
    link: 'https://www.ztbl.com.pk/',
    emoji: '🏦'
  },
  {
    id: 'crop_insurance',
    name: 'National Crop Insurance Scheme', nameUrdu: 'قومی فصل بیمہ اسکیم',
    category: 'insurance',
    provider: 'Federal Govt + Insurance Cos',
    description: 'Insurance cover against floods, droughts, pest attacks. Premium partially subsidized by government.',
    descriptionUrdu: 'سیلاب، خشک سالی، کیڑوں سے نقصان کا بیمہ۔',
    eligibility: { maxLandAcres: null, requiresCNIC: true, province: null },
    benefits: 'Claim up to 100% crop loss',
    benefitsUrdu: 'فصل کا 100% نقصان کلیم',
    link: 'https://www.secp.gov.pk/',
    emoji: '🛡'
  },
  {
    id: 'solar_tubewell',
    name: 'Solar Tubewell Subsidy', nameUrdu: 'سولر ٹیوب ویل سبسڈی',
    category: 'subsidy',
    provider: 'Punjab Agriculture Dept',
    description: '60% subsidy on solar-powered tubewells for irrigation. Reduces electricity cost dramatically.',
    descriptionUrdu: 'سولر ٹیوب ویل پر 60% سبسڈی۔ بجلی کی قیمت میں نمایاں کمی۔',
    eligibility: { maxLandAcres: 25, requiresCNIC: true, province: 'Punjab' },
    benefits: '60% subsidy on installation cost',
    benefitsUrdu: 'تنصیب پر 60% سبسڈی',
    link: 'https://www.agripunjab.gov.pk/',
    emoji: '☀️'
  },
  {
    id: 'tractor_scheme',
    name: 'Green Tractor Scheme', nameUrdu: 'گرین ٹریکٹر اسکیم',
    category: 'scheme',
    provider: 'Govt of Punjab',
    description: 'Subsidized tractors for small farmers. Buy tractors at below-market rates with easy installments.',
    descriptionUrdu: 'چھوٹے کسانوں کے لیے سبسڈی والے ٹریکٹر۔',
    eligibility: { maxLandAcres: 25, requiresCNIC: true, province: 'Punjab' },
    benefits: 'PKR 300,000-500,000 subsidy',
    benefitsUrdu: '3-5 لاکھ سبسڈی',
    link: 'https://www.agripunjab.gov.pk/',
    emoji: '🚜'
  },
  {
    id: 'bisp',
    name: 'BISP / Ehsaas Agriculture', nameUrdu: 'بی آئی ایس پی / احساس زرعی',
    category: 'subsidy',
    provider: 'Federal Govt',
    description: 'Quarterly cash transfers for small farmers registered in BISP database.',
    descriptionUrdu: 'چھوٹے کسانوں کے لیے سہ ماہی نقد ترسیل۔',
    eligibility: { maxLandAcres: 5, requiresCNIC: true, province: null, needsBISP: true },
    benefits: 'PKR 25,000 per quarter',
    benefitsUrdu: 'فی سہ ماہی 25,000 روپے',
    link: 'https://www.bisp.gov.pk/',
    emoji: '💵'
  }
];

export default function Subsidies() {
  const { i18n } = useTranslation();
  const isUrdu = i18n.language === 'ur';
  const [filter, setFilter] = useState('all');
  const [check, setCheck] = useState({ landAcres: '', province: '', hasCNIC: true, onBISP: false });

  const filtered = filter === 'all' ? SCHEMES : SCHEMES.filter(s => s.category === filter);

  const checkEligibility = (scheme) => {
    const e = scheme.eligibility;
    const land = parseFloat(check.landAcres) || 0;
    if (!check.landAcres) return null;
    if (e.requiresCNIC && !check.hasCNIC) return { eligible: false, reason: isUrdu ? 'شناختی کارڈ درکار' : 'CNIC required' };
    if (e.maxLandAcres && land > e.maxLandAcres) return { eligible: false, reason: isUrdu ? `زیادہ سے زیادہ ${e.maxLandAcres} ایکڑ` : `Max ${e.maxLandAcres} acres` };
    if (e.province && check.province && check.province !== e.province) return { eligible: false, reason: isUrdu ? `صرف ${e.province}` : `${e.province} only` };
    if (e.needsBISP && !check.onBISP) return { eligible: false, reason: isUrdu ? 'BISP درکار' : 'BISP required' };
    return { eligible: true };
  };

  return (
    <div className="space-y-4 sm:space-y-5 max-w-6xl mx-auto">
      <div>
        <Link to="/tools" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-green-600 mb-3">
          <FiArrowLeft size={14} /> {isUrdu ? 'ٹولز پر واپس' : 'Back to Tools'}
        </Link>
        <div className="bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl p-5 sm:p-6 text-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0">
              <FiBook size={24} />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold">{isUrdu ? 'حکومتی سبسڈیز' : 'Govt Subsidies'}</h1>
              <p className="text-cyan-100 text-xs sm:text-sm mt-0.5 line-clamp-2">
                {isUrdu ? 'مفت پروگرامز اور قرض' : 'Free programs, loans & subsidies for farmers'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Eligibility Checker */}
      <Card title={isUrdu ? '✅ اہلیت چیک کریں' : '✅ Check Your Eligibility'}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <Input label={isUrdu ? 'رقبہ (ایکڑ)' : 'Land (acres)'} type="number"
            value={check.landAcres} onChange={(e) => setCheck({ ...check, landAcres: e.target.value })} />
          <Select label={isUrdu ? 'صوبہ' : 'Province'}
            value={check.province} onChange={(e) => setCheck({ ...check, province: e.target.value })}
            options={[
              { value: '', label: isUrdu ? 'کوئی بھی' : 'Any' },
              'Punjab','Sindh','KPK','Balochistan'
            ]} />
          <div className="flex items-end">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={check.hasCNIC} onChange={(e) => setCheck({ ...check, hasCNIC: e.target.checked })} className="w-4 h-4" />
              {isUrdu ? 'میرے پاس شناختی کارڈ ہے' : 'I have CNIC'}
            </label>
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={check.onBISP} onChange={(e) => setCheck({ ...check, onBISP: e.target.checked })} className="w-4 h-4" />
              {isUrdu ? 'BISP میں رجسٹرڈ' : 'Registered in BISP'}
            </label>
          </div>
        </div>
      </Card>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          { v: 'all', en: 'All', ur: 'تمام', icon: '📋' },
          { v: 'subsidy', en: 'Subsidies', ur: 'سبسڈیز', icon: '💰' },
          { v: 'loan', en: 'Loans', ur: 'قرض', icon: '🏦' },
          { v: 'insurance', en: 'Insurance', ur: 'بیمہ', icon: '🛡' },
          { v: 'scheme', en: 'Schemes', ur: 'اسکیمیں', icon: '📝' }
        ].map(f => (
          <button key={f.v} onClick={() => setFilter(f.v)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
              filter === f.v ? 'bg-green-600 text-white' : 'bg-white border border-gray-200 text-gray-600'
            }`}>
            {f.icon} {isUrdu ? f.ur : f.en}
          </button>
        ))}
      </div>

      {/* Schemes List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(s => {
          const e = check.landAcres ? checkEligibility(s) : null;
          return (
            <div key={s.id} className="bg-white rounded-2xl border border-gray-100 hover:shadow-md p-5 transition">
              <div className="flex items-start gap-3 mb-3">
                <span className="text-4xl">{s.emoji}</span>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800">{isUrdu ? s.nameUrdu : s.name}</h3>
                  <p className="text-xs text-gray-500">{s.provider}</p>
                </div>
                {e && (
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${e.eligible ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {e.eligible ? <><FiCheckCircle className="inline" size={12} /> {isUrdu ? 'اہل' : 'Eligible'}</> : <><FiXCircle className="inline" size={12} /> {e.reason}</>}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 leading-relaxed mb-3">
                {isUrdu ? s.descriptionUrdu : s.description}
              </p>
              <div className="bg-green-50 border border-green-100 rounded-lg p-3 mb-3">
                <p className="text-xs font-semibold text-green-800">
                  💎 {isUrdu ? 'فائدہ' : 'Benefit'}
                </p>
                <p className="text-sm font-bold text-green-700 mt-1">
                  {isUrdu ? s.benefitsUrdu : s.benefits}
                </p>
              </div>
              <a href={s.link} target="_blank" rel="noreferrer">
                <Button icon={FiExternalLink} variant="outline" className="w-full">
                  {isUrdu ? 'درخواست دیں' : 'Apply Now'}
                </Button>
              </a>
            </div>
          );
        })}
      </div>

      {/* Info */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 flex items-start gap-3">
        <FiAlertCircle className="text-yellow-600 shrink-0 mt-0.5" size={20} />
        <div>
          <p className="text-sm font-medium text-yellow-900">
            {isUrdu ? 'اہم نوٹس' : 'Important Notice'}
          </p>
          <p className="text-xs text-yellow-800 mt-1">
            {isUrdu
              ? 'یہ معلومات صرف آگاہی کے لیے ہے۔ شرائط اور اہلیت تبدیل ہو سکتی ہے۔ درخواست سے پہلے سرکاری ویب سائٹ پر جا کر تصدیق کریں۔'
              : 'This information is for guidance only. Terms and eligibility may change. Always verify with the official website before applying.'}
          </p>
        </div>
      </div>
    </div>
  );
}
