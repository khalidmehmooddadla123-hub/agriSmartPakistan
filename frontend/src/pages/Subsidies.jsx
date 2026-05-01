import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, Input, Select, Button } from '../components/ui/FormControls';
import { FiBook, FiArrowLeft, FiExternalLink, FiCheckCircle, FiXCircle, FiAlertCircle, FiClock } from 'react-icons/fi';
import { subsidyAPI } from '../services/api';

export default function Subsidies() {
  const { i18n } = useTranslation();
  const isUrdu = i18n.language === 'ur';
  const [filter, setFilter] = useState('all');
  const [check, setCheck] = useState({ landAcres: '', province: '', hasCNIC: true, onBISP: false });
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    subsidyAPI.list()
      .then(res => {
        if (cancelled) return;
        setSchemes(Array.isArray(res.data?.data) ? res.data.data : []);
        setError(null);
      })
      .catch(err => {
        if (cancelled) return;
        setError(err.response?.data?.message || err.message || 'Failed to load subsidies');
        setSchemes([]);
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const filtered = filter === 'all' ? schemes : schemes.filter(s => s.category === filter);

  const checkEligibility = (scheme) => {
    const e = scheme.eligibility || {};
    const land = parseFloat(check.landAcres) || 0;
    if (!check.landAcres) return null;
    if (e.requiresCNIC && !check.hasCNIC) return { eligible: false, reason: isUrdu ? 'شناختی کارڈ درکار' : 'CNIC required' };
    if (e.maxLandAcres && land > e.maxLandAcres) return { eligible: false, reason: isUrdu ? `زیادہ سے زیادہ ${e.maxLandAcres} ایکڑ` : `Max ${e.maxLandAcres} acres` };
    if (e.province && check.province && check.province !== e.province) return { eligible: false, reason: isUrdu ? `صرف ${e.province}` : `${e.province} only` };
    if (e.needsBISP && !check.onBISP) return { eligible: false, reason: isUrdu ? 'BISP درکار' : 'BISP required' };
    return { eligible: true };
  };

  const formatVerifiedDate = (d) => {
    if (!d) return null;
    try {
      return new Date(d).toLocaleDateString(isUrdu ? 'ur-PK' : 'en-PK', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch { return null; }
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
      {loading && (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
          <div className="animate-spin h-8 w-8 border-2 border-green-500 border-t-transparent rounded-full mx-auto" />
          <p className="text-sm text-gray-500 mt-3">{isUrdu ? 'لوڈ ہو رہا ہے…' : 'Loading schemes from server…'}</p>
        </div>
      )}

      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex items-start gap-3">
          <FiAlertCircle className="text-red-600 shrink-0 mt-0.5" size={20} />
          <div>
            <p className="text-sm font-semibold text-red-900">{isUrdu ? 'لوڈ ناکام' : 'Failed to load'}</p>
            <p className="text-xs text-red-700 mt-1">{error}</p>
          </div>
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
          <p className="text-gray-500">{isUrdu ? 'کوئی اسکیم نہیں ملی' : 'No schemes available yet'}</p>
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(s => {
            const e = check.landAcres ? checkEligibility(s) : null;
            const verifiedOn = formatVerifiedDate(s.lastVerifiedAt);
            return (
              <div key={s._id} className="bg-white rounded-2xl border border-gray-100 hover:shadow-md p-5 transition">
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-4xl">{s.emoji || '📋'}</span>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-800">{isUrdu ? (s.nameUrdu || s.name) : s.name}</h3>
                    <p className="text-xs text-gray-500">{s.provider}</p>
                  </div>
                  {e && (
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${e.eligible ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {e.eligible ? <><FiCheckCircle className="inline" size={12} /> {isUrdu ? 'اہل' : 'Eligible'}</> : <><FiXCircle className="inline" size={12} /> {e.reason}</>}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 leading-relaxed mb-3">
                  {isUrdu ? (s.descriptionUrdu || s.description) : s.description}
                </p>
                <div className="bg-green-50 border border-green-100 rounded-lg p-3 mb-3">
                  <p className="text-xs font-semibold text-green-800">
                    💎 {isUrdu ? 'فائدہ' : 'Benefit'}
                  </p>
                  <p className="text-sm font-bold text-green-700 mt-1">
                    {isUrdu ? (s.benefitsUrdu || s.benefits) : s.benefits}
                  </p>
                </div>
                {verifiedOn && (
                  <p className="text-[10.5px] text-gray-400 flex items-center gap-1 mb-2">
                    <FiClock size={10} /> {isUrdu ? 'آخری تصدیق:' : 'Last verified:'} {verifiedOn}
                  </p>
                )}
                <a href={s.link} target="_blank" rel="noreferrer">
                  <Button icon={FiExternalLink} variant="outline" className="w-full">
                    {isUrdu ? 'درخواست دیں' : 'Apply Now'}
                  </Button>
                </a>
              </div>
            );
          })}
        </div>
      )}

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
