import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Input, Select, Button, Card, StatBox } from '../../components/ui/FormControls';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Bar, BarChart } from 'recharts';
import { FiDollarSign, FiArrowLeft, FiPercent, FiCalendar, FiTrendingDown, FiInfo, FiClock } from 'react-icons/fi';
import { loanAPI } from '../../services/api';

const CUSTOM_PROVIDER = {
  _id: 'custom',
  providerKey: 'custom',
  name: 'Custom Rate',
  rate: 15.0,
  maxYears: 10,
  descriptionEn: 'Manual entry',
  descriptionUrdu: 'دستی'
};

export default function LoanCalc() {
  const { i18n } = useTranslation();
  const isUrdu = i18n.language === 'ur';

  const [providers, setProviders] = useState([]);
  const [loadingProviders, setLoadingProviders] = useState(true);
  const [providersError, setProvidersError] = useState(null);
  const [providerKey, setProviderKey] = useState('');
  const [amount, setAmount] = useState(200000);
  const [tenureYears, setTenureYears] = useState(1);
  const [customRate, setCustomRate] = useState(15);
  const [monthlyIncome, setMonthlyIncome] = useState(50000);

  useEffect(() => {
    let cancelled = false;
    setLoadingProviders(true);
    loanAPI.list()
      .then(res => {
        if (cancelled) return;
        const data = Array.isArray(res.data?.data) ? res.data.data : [];
        const withCustom = [...data, CUSTOM_PROVIDER];
        setProviders(withCustom);
        if (data.length > 0) setProviderKey(data[0].providerKey);
        else setProviderKey('custom');
        setProvidersError(null);
      })
      .catch(err => {
        if (cancelled) return;
        setProvidersError(err.response?.data?.message || err.message || 'Failed to load loan providers');
        setProviders([CUSTOM_PROVIDER]);
        setProviderKey('custom');
      })
      .finally(() => { if (!cancelled) setLoadingProviders(false); });
    return () => { cancelled = true; };
  }, []);

  const selected = providers.find(p => p.providerKey === providerKey) || CUSTOM_PROVIDER;
  const rate = providerKey === 'custom' ? parseFloat(customRate) : selected.rate;

  // EMI = P * R * (1+R)^N / ((1+R)^N - 1)
  // Where R = monthly rate, N = total months
  const calc = useMemo(() => {
    const P = parseFloat(amount) || 0;
    const R = (parseFloat(rate) || 0) / 12 / 100;
    const N = (parseFloat(tenureYears) || 1) * 12;
    if (P === 0 || N === 0) return { emi: 0, totalPayable: 0, totalInterest: 0, schedule: [] };

    let emi;
    if (R === 0) {
      // Interest-free loan
      emi = P / N;
    } else {
      emi = P * R * Math.pow(1 + R, N) / (Math.pow(1 + R, N) - 1);
    }
    const totalPayable = emi * N;
    const totalInterest = totalPayable - P;

    // Build amortization schedule (yearly summary)
    const schedule = [];
    let balance = P;
    for (let m = 1; m <= N; m++) {
      const interestPayment = balance * R;
      const principalPayment = emi - interestPayment;
      balance -= principalPayment;
      // Push yearly snapshot
      if (m % 12 === 0 || m === N) {
        schedule.push({
          year: Math.ceil(m / 12),
          balance: Math.max(0, Math.round(balance)),
          paidPrincipal: Math.round(P - balance),
          paidInterest: Math.round(emi * m - (P - balance))
        });
      }
    }

    return {
      emi: Math.round(emi),
      totalPayable: Math.round(totalPayable),
      totalInterest: Math.round(totalInterest),
      schedule
    };
  }, [amount, rate, tenureYears]);

  // Affordability check
  const monthlyEMI = calc.emi;
  const debtRatio = monthlyIncome > 0 ? (monthlyEMI / parseFloat(monthlyIncome)) * 100 : 0;
  const affordability = debtRatio < 30 ? 'safe' : debtRatio < 50 ? 'warning' : 'risky';

  const breakdownData = [
    { name: isUrdu ? 'اصل رقم' : 'Principal', value: parseFloat(amount), color: '#3b82f6' },
    { name: isUrdu ? 'سود' : 'Interest', value: calc.totalInterest, color: '#ef4444' }
  ];

  const formatPKR = (n) => `PKR ${(n || 0).toLocaleString()}`;

  return (
    <div className="space-y-5 max-w-6xl mx-auto animate-fade-in-up">
      <div>
        <Link to="/tools" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-green-600 mb-3">
          <FiArrowLeft size={14} /> {isUrdu ? 'ٹولز پر واپس' : 'Back to Tools'}
        </Link>
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-5 sm:p-6 text-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 rounded-xl sm:rounded-2xl flex items-center justify-center text-2xl sm:text-3xl shrink-0">🏦</div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold">{isUrdu ? 'قرض اور EMI کیلکولیٹر' : 'Loan & EMI Calculator'}</h1>
              <p className="text-blue-100 text-xs sm:text-sm mt-0.5 line-clamp-2">
                {isUrdu ? 'پاکستانی زرعی قرض کے لیے ماہانہ قسط کا حساب' : 'Monthly EMI for Pakistani agri loans (ZTBL, HBL, Akhuwat, MCB)'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
        {/* Input */}
        <Card title={isUrdu ? 'تفصیلات' : 'Loan Details'}>
          <div className="space-y-4">
            {loadingProviders ? (
              <div className="text-xs text-gray-500 py-2">{isUrdu ? 'لوڈ ہو رہا ہے…' : 'Loading providers…'}</div>
            ) : (
              <Select
                label={isUrdu ? 'بینک / پروگرام' : 'Provider'}
                value={providerKey}
                onChange={(e) => {
                  setProviderKey(e.target.value);
                  const p = providers.find(pp => pp.providerKey === e.target.value);
                  if (p && tenureYears > p.maxYears) setTenureYears(p.maxYears);
                }}
                options={providers.map(p => ({ value: p.providerKey, label: p.name }))}
              />
            )}
            {providersError && (
              <div className="text-[11px] text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-lg p-2">
                {isUrdu ? 'بینک ڈیٹا لوڈ نہیں ہوا، دستی شرح استعمال کریں' : 'Bank list unavailable — use Custom Rate'}
              </div>
            )}
            {selected && providerKey !== 'custom' && (
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-2.5">
                <p className="text-[11px] text-blue-700 font-semibold">
                  {selected.rate}% {isUrdu ? 'شرح سود' : 'rate'} · {isUrdu ? 'زیادہ سے زیادہ' : 'max'} {selected.maxYears} {isUrdu ? 'سال' : 'yrs'}
                </p>
                <p className="text-[10.5px] text-blue-600 mt-0.5">
                  {isUrdu ? (selected.descriptionUrdu || selected.descriptionEn) : selected.descriptionEn}
                </p>
                {selected.lastVerifiedAt && (
                  <p className="text-[10px] text-blue-500/80 mt-1 flex items-center gap-1">
                    <FiClock size={9} /> {isUrdu ? 'تصدیق شدہ:' : 'Verified:'} {new Date(selected.lastVerifiedAt).toLocaleDateString('en-PK', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </p>
                )}
              </div>
            )}
            {providerKey === 'custom' && (
              <Input
                label={isUrdu ? 'اپنی شرح سود (%)' : 'Custom Interest Rate (%)'}
                icon={FiPercent}
                type="number" min="0" max="50" step="0.1"
                value={customRate}
                onChange={(e) => setCustomRate(e.target.value)}
              />
            )}
            <Input
              label={isUrdu ? 'قرض کی رقم (PKR)' : 'Loan Amount (PKR)'}
              icon={FiDollarSign}
              type="number" min="10000" step="10000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <Input
              label={`${isUrdu ? 'مدت (سال)' : 'Tenure (years)'} — Max ${selected.maxYears}`}
              icon={FiCalendar}
              type="number" min="0.5" max={selected.maxYears} step="0.5"
              value={tenureYears}
              onChange={(e) => setTenureYears(e.target.value)}
            />
            <Input
              label={isUrdu ? 'ماہانہ آمدنی (اختیاری)' : 'Monthly Income (optional)'}
              icon={FiDollarSign}
              type="number" min="0"
              value={monthlyIncome}
              onChange={(e) => setMonthlyIncome(e.target.value)}
            />
          </div>
        </Card>

        {/* Results */}
        <div className="lg:col-span-2 space-y-4">
          {/* Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
            <StatBox
              label={isUrdu ? 'ماہانہ EMI' : 'Monthly EMI'}
              value={formatPKR(calc.emi)}
              color="blue" icon={FiDollarSign}
            />
            <StatBox
              label={isUrdu ? 'کل ادا' : 'Total Payable'}
              value={formatPKR(calc.totalPayable)}
              color="purple"
            />
            <StatBox
              label={isUrdu ? 'کل سود' : 'Total Interest'}
              value={formatPKR(calc.totalInterest)}
              color="red" icon={FiTrendingDown}
            />
            <StatBox
              label={isUrdu ? 'سود %' : 'Interest %'}
              value={`${rate}%`}
              subtitle={isUrdu ? 'سالانہ' : 'per year'}
              color="yellow" icon={FiPercent}
            />
          </div>

          {/* Affordability check */}
          {monthlyIncome > 0 && (
            <Card>
              <h3 className="font-bold text-gray-900 text-sm mb-3 flex items-center gap-2">
                <FiInfo size={14} /> {isUrdu ? 'برداشت کرنے کی صلاحیت' : 'Affordability Check'}
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">{isUrdu ? 'EMI / آمدنی' : 'EMI / Income Ratio'}</span>
                  <span className={`font-bold ${
                    affordability === 'safe' ? 'text-green-600' :
                    affordability === 'warning' ? 'text-yellow-600' : 'text-red-600'
                  }`}>{debtRatio.toFixed(1)}%</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${
                    affordability === 'safe' ? 'bg-green-500' :
                    affordability === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                  }`} style={{ width: `${Math.min(100, debtRatio)}%` }} />
                </div>
                <p className={`text-xs leading-relaxed ${
                  affordability === 'safe' ? 'text-green-700' :
                  affordability === 'warning' ? 'text-yellow-700' : 'text-red-700'
                }`}>
                  {affordability === 'safe' &&
                    (isUrdu ? '✓ محفوظ — یہ قرض آپ کی آمدنی کے 30% سے کم ہے' : '✓ Safe — EMI is below 30% of your income')}
                  {affordability === 'warning' &&
                    (isUrdu ? '⚠ احتیاط — قرض آپ کی آمدنی کا 30-50% ہے' : '⚠ Caution — EMI is 30–50% of income, manageable but tight')}
                  {affordability === 'risky' &&
                    (isUrdu ? '⚠ خطرناک — یہ قرض آپ کی آمدنی کے 50% سے زیادہ ہے' : '⚠ Risky — EMI exceeds 50% of income, consider lower amount')}
                </p>
              </div>
            </Card>
          )}

          {/* Breakdown Bar */}
          <Card title={isUrdu ? 'قرض کی تقسیم' : 'Loan Breakdown'}>
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={breakdownData} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={80} />
                <Tooltip formatter={v => formatPKR(v)} />
                <Bar dataKey="value" fill="#3b82f6" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <p className="text-[11px] text-gray-500 text-center">
              {isUrdu
                ? `آپ ${formatPKR(amount)} لیں گے، ${formatPKR(calc.totalInterest)} سود دیں گے`
                : `You borrow ${formatPKR(amount)} and pay ${formatPKR(calc.totalInterest)} as interest`}
            </p>
          </Card>

          {/* Yearly schedule */}
          {calc.schedule.length > 0 && (
            <Card title={isUrdu ? 'سال بہ سال جدول' : 'Year-by-Year Schedule'}>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={calc.schedule}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                  <XAxis dataKey="year" tick={{ fontSize: 11 }} tickFormatter={v => `Yr ${v}`} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={v => formatPKR(v)} />
                  <Line type="monotone" dataKey="balance" stroke="#dc2626" strokeWidth={2.5} name={isUrdu ? 'باقی' : 'Balance'} />
                  <Line type="monotone" dataKey="paidPrincipal" stroke="#16a34a" strokeWidth={2.5} name={isUrdu ? 'ادا اصل' : 'Principal Paid'} />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          )}
        </div>
      </div>

      {/* Tip card */}
      <Card className="bg-blue-50 border-blue-100">
        <div className="flex items-start gap-3">
          <div className="text-2xl">💡</div>
          <div>
            <h4 className="font-bold text-blue-900 text-sm mb-1">
              {isUrdu ? 'پیشہ ور مشورہ' : 'Pro Tip'}
            </h4>
            <p className="text-xs text-blue-800 leading-relaxed">
              {isUrdu
                ? 'بلا سود اسکیموں جیسے "Akhuwat Foundation" یا "Punjab Kissan Card" کو ترجیح دیں۔ اگر بینک سے قرض لینا پڑے، ZTBL کی پروڈکشن لون شرح سب سے کم ہے۔'
                : 'Prefer 0% interest schemes like Akhuwat Foundation or Punjab Kissan Card. If bank loan is needed, ZTBL Production Loan has the lowest rate (17.5%).'}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
