import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { priceAPI, cropAPI, locationAPI, exportAPI } from '../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { FiTrendingUp, FiTrendingDown, FiSearch, FiBarChart2, FiMapPin, FiX, FiDownload } from 'react-icons/fi';
import { SkeletonTable } from '../components/ui/Skeleton';

export default function Prices() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const isUrdu = i18n.language === 'ur';
  const [prices, setPrices] = useState([]);
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('national');
  const [selectedCrop, setSelectedCrop] = useState('');
  const [chartData, setChartData] = useState([]);
  const [chartCrop, setChartCrop] = useState(null);
  const [search, setSearch] = useState('');

  const [locations, setLocations] = useState([]);
  const [locationSearch, setLocationSearch] = useState('');
  const [locationResults, setLocationResults] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedLocationName, setSelectedLocationName] = useState('');

  useEffect(() => {
    cropAPI.getAll().then(res => setCrops(res.data.data || [])).catch(() => {});
    locationAPI.getAll().then(res => setLocations(res.data.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (user?.locationID) {
      const loc = user.locationID;
      setSelectedLocation(loc._id || loc);
      if (loc.city) setSelectedLocationName(`${loc.city}, ${loc.province}`);
    }
  }, [user]);

  useEffect(() => {
    setLoading(true);
    const params = { priceType: activeTab };
    if (activeTab === 'local' && selectedLocation) params.locationID = selectedLocation;
    priceAPI.getLatest(params)
      .then(res => setPrices(res.data.data || []))
      .catch(() => setPrices([]))
      .finally(() => setLoading(false));
  }, [activeTab, selectedLocation]);

  useEffect(() => {
    if (locationSearch.length < 2) { setLocationResults([]); return; }
    const q = locationSearch.toLowerCase();
    const results = locations.filter(loc =>
      loc.city?.toLowerCase().includes(q) ||
      loc.cityUrdu?.includes(locationSearch) ||
      loc.province?.toLowerCase().includes(q)
    ).slice(0, 8);
    setLocationResults(results);
  }, [locationSearch, locations]);

  const selectLocation = (loc) => {
    setSelectedLocation(loc._id);
    setSelectedLocationName(`${loc.city}, ${loc.province}`);
    setLocationSearch('');
    setLocationResults([]);
  };

  const showChart = async (crop) => {
    const cropId = crop._id || crop.cropID?._id;
    setChartCrop(crop.cropID || crop);
    try {
      const params = { priceType: activeTab, days: 30 };
      if (activeTab === 'local' && selectedLocation) params.locationID = selectedLocation;
      const res = await priceAPI.getHistory(cropId, params);
      setChartData((res.data.data || []).map(p => ({
        date: new Date(p.recordedAt).toLocaleDateString('en-PK', { month: 'short', day: 'numeric' }),
        price: p.price
      })));
    } catch {
      setChartData([]);
    }
  };

  const filtered = prices.filter(p => {
    const name = p.cropID?.cropName?.toLowerCase() || '';
    const nameUr = p.cropID?.cropNameUrdu || '';
    const matchSearch = !search || name.includes(search.toLowerCase()) || nameUr.includes(search);
    const matchCrop = !selectedCrop || p.cropID?._id === selectedCrop;
    return matchSearch && matchCrop;
  });

  const tabs = [
    { key: 'international', label: t('prices.international'), emoji: '🌍', color: 'from-blue-500 to-cyan-500' },
    { key: 'national', label: t('prices.national'), emoji: '🇵🇰', color: 'from-green-500 to-emerald-500' },
    { key: 'local', label: t('prices.local'), emoji: '📍', color: 'from-amber-500 to-orange-500' }
  ];

  const exportCSV = async () => {
    try {
      const params = { priceType: activeTab, days: 30 };
      if (activeTab === 'local' && selectedLocation) params.locationID = selectedLocation;
      const res = await exportAPI.pricesCSV(params);
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a'); a.href = url; a.download = `prices-${activeTab}.csv`; a.click(); URL.revokeObjectURL(url);
    } catch {}
  };

  const exportPDF = async () => {
    try {
      const params = { priceType: activeTab };
      if (activeTab === 'local' && selectedLocation) params.locationID = selectedLocation;
      const res = await exportAPI.pricesPDF(params);
      const url = URL.createObjectURL(new Blob([res.data], { type: 'text/html' }));
      window.open(url, '_blank');
    } catch {}
  };

  return (
    <div className="space-y-5 animate-fade-in-up">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-7 text-white card-elevated">
        <div className="absolute top-0 right-0 rtl:left-0 rtl:right-auto w-44 sm:w-60 h-44 sm:h-60 bg-white/10 rounded-full -mr-16 sm:-mr-20 -mt-16 sm:-mt-20 blur-2xl" />
        <div className="relative flex items-center justify-between gap-3 sm:gap-4 flex-wrap">
          <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 backdrop-blur rounded-xl sm:rounded-2xl flex items-center justify-center text-2xl sm:text-3xl shrink-0">💰</div>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold truncate">{t('prices.title')}</h1>
              <p className="text-green-100 text-xs sm:text-sm mt-1 line-clamp-2">
                {isUrdu ? 'لائیو منڈی نرخیں' : 'Live market rates, updated every 30 min'}
              </p>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <button onClick={exportCSV}
              className="flex items-center gap-1.5 px-3 sm:px-3.5 py-2 bg-white/15 backdrop-blur hover:bg-white/25 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-semibold transition border border-white/20">
              <FiDownload size={12} /> CSV
            </button>
            <button onClick={exportPDF}
              className="flex items-center gap-1.5 px-3 sm:px-3.5 py-2 bg-white/15 backdrop-blur hover:bg-white/25 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-semibold transition border border-white/20">
              <FiDownload size={12} /> PDF
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`group relative overflow-hidden rounded-xl sm:rounded-2xl p-2.5 sm:p-4 text-left transition-all ${
              activeTab === tab.key
                ? `bg-gradient-to-br ${tab.color} text-white card-elevated`
                : 'bg-white border border-gray-100 text-gray-700 hover:border-gray-200 card-soft'
            }`}>
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="text-xl sm:text-2xl">{tab.emoji}</span>
              <div className="min-w-0">
                <p className="font-bold text-[12px] sm:text-sm truncate">{tab.label}</p>
                <p className={`text-[10px] sm:text-[11px] mt-0.5 hidden sm:block ${activeTab === tab.key ? 'text-white/80' : 'text-gray-500'}`}>
                  {tab.key === 'international' && (isUrdu ? 'عالمی USD' : 'Global USD')}
                  {tab.key === 'national' && (isUrdu ? 'پاکستان منڈی' : 'Pakistan')}
                  {tab.key === 'local' && (isUrdu ? 'شہر کی منڈی' : 'City mandi')}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Local location picker */}
      {activeTab === 'local' && (
        <div className="bg-white rounded-2xl border border-gray-100 p-4 card-soft">
          <label className="flex items-center gap-1.5 text-[13px] font-semibold text-gray-700 mb-2">
            <FiMapPin size={13} /> {isUrdu ? 'مقامی منڈی کا شہر' : 'Local Mandi City'}
          </label>
          <div className="relative">
            <FiSearch className="absolute left-3.5 rtl:right-3.5 rtl:left-auto top-1/2 -translate-y-1/2 text-gray-400" size={15} />
            <input type="text" value={locationSearch} onChange={e => setLocationSearch(e.target.value)}
              className="w-full pl-10 rtl:pr-10 rtl:pl-4 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-green-400 focus:ring-2 focus:ring-green-100 outline-none bg-gray-50"
              placeholder={isUrdu ? 'شہر تلاش کریں...' : 'Search city...'} />
            {selectedLocationName && !locationSearch && (
              <div className="absolute right-3 rtl:left-3 rtl:right-auto top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                <span className="text-[12px] bg-green-50 text-green-700 px-2 py-1 rounded-lg font-semibold">
                  📍 {selectedLocationName}
                </span>
                <button onClick={() => { setSelectedLocation(null); setSelectedLocationName(''); }}
                  className="text-gray-400 hover:text-red-500">
                  <FiX size={14} />
                </button>
              </div>
            )}
          </div>
          {locationResults.length > 0 && (
            <div className="mt-2 border border-gray-100 rounded-xl overflow-hidden card-elevated max-h-60 overflow-y-auto">
              {locationResults.map(loc => (
                <button key={loc._id} onClick={() => selectLocation(loc)}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-[13px] hover:bg-green-50 transition border-b border-gray-50 last:border-0 text-left rtl:text-right">
                  <FiMapPin className="text-green-500 shrink-0" size={14} />
                  <div>
                    <span className="font-semibold text-gray-800">
                      {isUrdu && loc.cityUrdu ? loc.cityUrdu : loc.city}
                    </span>
                    <span className="text-xs text-gray-400 ml-2 rtl:mr-2 rtl:ml-0">
                      {isUrdu && loc.provinceUrdu ? loc.provinceUrdu : loc.province}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Search filters */}
      <div className="flex gap-2 sm:gap-3 flex-wrap">
        <div className="relative flex-1 min-w-full sm:min-w-[200px]">
          <FiSearch className="absolute left-3.5 rtl:right-3.5 rtl:left-auto top-1/2 -translate-y-1/2 text-gray-400" size={15} />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 rtl:pr-10 rtl:pl-4 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:border-green-400 focus:ring-2 focus:ring-green-100 outline-none"
            placeholder={isUrdu ? 'فصل تلاش کریں' : 'Search crop...'} />
        </div>
        <select value={selectedCrop} onChange={e => setSelectedCrop(e.target.value)}
          className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:border-green-400 outline-none">
          <option value="">{t('prices.allCrops')}</option>
          {crops.map(c => <option key={c._id} value={c._id}>{isUrdu && c.cropNameUrdu ? c.cropNameUrdu : c.cropName}</option>)}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <SkeletonTable rows={6} cols={5} />
      ) : activeTab === 'local' && !selectedLocation ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-16 text-center">
          <div className="text-6xl mb-3">📍</div>
          <h3 className="font-bold text-gray-900">{isUrdu ? 'شہر منتخب کریں' : 'Select a City'}</h3>
          <p className="text-sm text-gray-500 mt-1">{isUrdu ? 'مقامی قیمتیں دیکھنے کے لیے اوپر شہر منتخب کریں' : 'Choose a city above to view local mandi prices'}</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">{t('prices.noData')}</div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 card-soft overflow-hidden">
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3 text-left rtl:text-right font-semibold">{t('prices.crop')}</th>
                  <th className="px-5 py-3 text-right rtl:text-left font-semibold">{t('prices.price')}</th>
                  <th className="px-5 py-3 text-right rtl:text-left font-semibold">{t('prices.change')}</th>
                  {activeTab !== 'international' && <th className="px-5 py-3 text-right rtl:text-left font-semibold">{t('prices.msp')}</th>}
                  <th className="px-5 py-3 text-center font-semibold">{t('prices.trend')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((p, i) => {
                  const change = p.previousPrice ? ((p.price - p.previousPrice) / p.previousPrice * 100).toFixed(1) : null;
                  const isUp = change > 0;
                  const belowMsp = p.msp && p.price < p.msp;
                  return (
                    <tr key={i} className="hover:bg-gray-50 transition">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">🌾</span>
                          <div>
                            <div className="font-semibold text-gray-900 text-[13px]">
                              {isUrdu && p.cropID?.cropNameUrdu ? p.cropID.cropNameUrdu : p.cropID?.cropName}
                            </div>
                            <div className="text-[10.5px] text-gray-400">per {p.cropID?.unit}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-right rtl:text-left">
                        <div className={`font-bold text-[14px] ${belowMsp ? 'text-red-600' : 'text-gray-900'}`}>
                          {p.currency} {p.price?.toLocaleString()}
                        </div>
                        {belowMsp && <div className="text-[10px] text-red-500">{isUrdu ? 'MSP سے نیچے' : 'Below MSP'}</div>}
                      </td>
                      <td className="px-5 py-3.5 text-right rtl:text-left">
                        {change !== null ? (
                          <span className={`inline-flex items-center gap-1 text-[11.5px] font-bold px-2 py-1 rounded-full ${
                            isUp ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
                          }`}>
                            {isUp ? <FiTrendingUp size={11} /> : <FiTrendingDown size={11} />}
                            {isUp ? '+' : ''}{change}%
                          </span>
                        ) : '—'}
                      </td>
                      {activeTab !== 'international' && (
                        <td className="px-5 py-3.5 text-right rtl:text-left text-gray-500 text-[12px]">
                          {p.msp ? `PKR ${p.msp.toLocaleString()}` : '—'}
                        </td>
                      )}
                      <td className="px-5 py-3.5 text-center">
                        <button onClick={() => showChart(p)}
                          className="w-8 h-8 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 inline-flex items-center justify-center transition"
                          title="30-day trend">
                          <FiBarChart2 size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden divide-y divide-gray-100">
            {filtered.map((p, i) => {
              const change = p.previousPrice ? ((p.price - p.previousPrice) / p.previousPrice * 100).toFixed(1) : null;
              const isUp = change > 0;
              const belowMsp = p.msp && p.price < p.msp;
              return (
                <div key={i} className="p-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className="text-2xl shrink-0">🌾</span>
                    <div className="min-w-0">
                      <div className="font-semibold text-gray-900 text-sm truncate">
                        {isUrdu && p.cropID?.cropNameUrdu ? p.cropID.cropNameUrdu : p.cropID?.cropName}
                      </div>
                      <div className="text-xs text-gray-400">per {p.cropID?.unit}</div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className={`font-bold text-sm ${belowMsp ? 'text-red-600' : 'text-gray-900'}`}>
                      {p.currency} {p.price?.toLocaleString()}
                    </div>
                    {change !== null && (
                      <div className={`text-[11px] font-semibold ${isUp ? 'text-green-600' : 'text-red-500'}`}>
                        {isUp ? '↑' : '↓'} {Math.abs(change)}%
                      </div>
                    )}
                  </div>
                  <button onClick={() => showChart(p)}
                    className="w-9 h-9 rounded-lg bg-green-50 text-green-600 flex items-center justify-center shrink-0">
                    <FiBarChart2 size={15} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Chart */}
      {chartCrop && chartData.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 card-soft p-5 animate-fade-in-up">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                📈 {t('prices.trend')}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {isUrdu && chartCrop.cropNameUrdu ? chartCrop.cropNameUrdu : chartCrop.cropName}
                {activeTab === 'local' && selectedLocationName && ` • ${selectedLocationName}`}
              </p>
            </div>
            <button onClick={() => { setChartCrop(null); setChartData([]); }}
              className="w-8 h-8 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 flex items-center justify-center">
              <FiX size={15} />
            </button>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 10, border: '1px solid #e5e7eb', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
              <Area type="monotone" dataKey="price" stroke="#16a34a" strokeWidth={2.5} fill="url(#priceGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
