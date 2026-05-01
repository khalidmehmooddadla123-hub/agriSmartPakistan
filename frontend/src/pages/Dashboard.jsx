import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { priceAPI, weatherAPI, newsAPI, recommendationAPI, outbreakAPI, farmAPI } from '../services/api';
import {
  FiTrendingUp, FiTrendingDown, FiDroplet, FiWind,
  FiArrowRight, FiBarChart2, FiSearch, FiTool, FiShoppingCart, FiMessageSquare
} from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Loader from '../components/ui/Loader';

export default function Dashboard() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect to onboarding if user has no farms and hasn't skipped
  useEffect(() => {
    if (!user) return;
    if (localStorage.getItem('onboarded') === 'true') return;
    farmAPI.list()
      .then(res => {
        if ((res.data.data || []).length === 0) {
          navigate('/onboarding', { replace: true });
        } else {
          localStorage.setItem('onboarded', 'true');
        }
      })
      .catch(() => {});
  }, [user, navigate]);

  const [prices, setPrices] = useState([]);
  const [weather, setWeather] = useState(null);
  const [news, setNews] = useState([]);
  const [recommendations, setRecommendations] = useState(null);
  const [outbreaks, setOutbreaks] = useState([]);
  const [loading, setLoading] = useState(true);
  const isUrdu = i18n.language === 'ur';

  useEffect(() => {
    Promise.all([
      priceAPI.getLatest({ priceType: 'national' }).catch(() => ({ data: { data: [] } })),
      user?.locationID?._id ? weatherAPI.getByLocation(user.locationID._id).catch(() => ({ data: { data: null } })) : Promise.resolve({ data: { data: null } }),
      newsAPI.getAll({ limit: 3 }).catch(() => ({ data: { data: [] } })),
      recommendationAPI.get({ language: i18n.language }).catch(() => ({ data: { data: null } })),
      outbreakAPI.getAll().catch(() => ({ data: { data: [] } }))
    ]).then(([pricesRes, weatherRes, newsRes, recsRes, outbreakRes]) => {
      setPrices(pricesRes.data.data?.slice(0, 6) || []);
      setWeather(weatherRes.data.data);
      setNews(newsRes.data.data || []);
      setRecommendations(recsRes.data.data);
      const userProvince = user?.locationID?.province;
      const nearby = (outbreakRes.data.data || []).filter(o =>
        o.isOutbreak && (!userProvince || o.location?.province === userProvince)
      );
      setOutbreaks(nearby.slice(0, 2));
    }).finally(() => setLoading(false));
  }, [user]);

  const getChangePercent = (price, prev) => {
    if (!prev) return null;
    return ((price - prev) / prev * 100).toFixed(1);
  };

  if (loading) return <Loader label={isUrdu ? 'ڈیش بورڈ لوڈ ہو رہا ہے…' : 'Loading your dashboard…'} />;

  // Quick action cards
  const quickActions = [
    { to: '/disease', icon: FiSearch, title: isUrdu ? 'بیماری اسکین' : 'Disease Scan', desc: isUrdu ? 'تصویر سے تشخیص' : 'AI image diagnosis', color: 'bg-purple-50 text-purple-600' },
    { to: '/tools', icon: FiTool, title: isUrdu ? 'کسان ٹولز' : 'Farm Tools', desc: isUrdu ? 'کیلکولیٹرز' : 'Calculators & more', color: 'bg-blue-50 text-blue-600' },
    { to: '/marketplace', icon: FiShoppingCart, title: isUrdu ? 'بازار' : 'Marketplace', desc: isUrdu ? 'براہ راست فروخت' : 'Sell directly', color: 'bg-orange-50 text-orange-600' },
    { to: '/forum', icon: FiMessageSquare, title: isUrdu ? 'کمیونٹی' : 'Community', desc: isUrdu ? 'سوال پوچھیں' : 'Ask questions', color: 'bg-pink-50 text-pink-600' },
  ];

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Greeting Banner */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 p-5 sm:p-6 md:p-8 text-white card-elevated">
        <div className="absolute top-0 right-0 rtl:left-0 rtl:right-auto w-48 sm:w-64 h-48 sm:h-64 bg-white/10 rounded-full -mr-20 sm:-mr-32 -mt-20 sm:-mt-32 rtl:-ml-20 sm:rtl:-ml-32 rtl:mr-0 blur-2xl" />
        <div className="absolute bottom-0 left-1/2 w-32 sm:w-40 h-32 sm:h-40 bg-green-300/20 rounded-full blur-2xl" />
        <div className="relative">
          <p className="text-green-100 text-xs sm:text-sm font-medium">
            {isUrdu ? '👋 خوش آمدید' : '👋 Welcome back'}
          </p>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mt-1 truncate">
            {user?.fullName || 'Farmer'}
          </h1>
          <p className="text-green-100 mt-1 sm:mt-1.5 text-xs sm:text-sm max-w-md">
            {isUrdu
              ? 'آپ کی کھیتی کے لیے آج کا خلاصہ'
              : "Your farming snapshot for today"}
          </p>
          {weather && (
            <div className="mt-4 sm:mt-5 inline-flex items-center gap-3 sm:gap-4 bg-white/15 backdrop-blur-md rounded-xl sm:rounded-2xl px-4 sm:px-5 py-2.5 sm:py-3 border border-white/20">
              <div className="text-2xl sm:text-3xl font-bold">{weather.temperature}°</div>
              <div className="text-[11px] sm:text-xs space-y-0.5">
                <div className="capitalize font-medium">{weather.description}</div>
                <div className="flex items-center gap-2 sm:gap-3 text-green-100">
                  <span className="flex items-center gap-1"><FiDroplet size={11} /> {weather.humidity}%</span>
                  <span className="flex items-center gap-1"><FiWind size={11} /> {weather.windSpeed}<span className="hidden sm:inline"> km/h</span></span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Outbreak Alert */}
      {outbreaks.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 card-soft">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 bg-red-500 text-white rounded-xl flex items-center justify-center text-xl shrink-0">
              🚨
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-red-900 text-sm">
                {isUrdu ? 'آپ کے علاقے میں بیماری کا پھیلاؤ' : 'Disease Outbreak Near You'}
              </h3>
              <div className="mt-1 space-y-0.5">
                {outbreaks.map((o, i) => (
                  <p key={i} className="text-xs text-red-800">
                    <strong>{o.diseaseName}</strong> — {o.count} {isUrdu ? 'رپورٹس میں' : 'reports in'} {isUrdu && o.location?.cityUrdu ? o.location.cityUrdu : o.location?.city}
                  </p>
                ))}
              </div>
              <Link to="/disease" className="inline-flex items-center gap-1 text-xs font-semibold text-red-700 hover:text-red-900 mt-2">
                {isUrdu ? 'فصل چیک کریں' : 'Check your crops'} <FiArrowRight size={12} />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        {quickActions.map((a) => {
          const Icon = a.icon;
          return (
            <Link key={a.to} to={a.to}
              className="group bg-white border border-gray-100 hover:border-green-200 rounded-2xl p-3 sm:p-4 card-soft hover:card-elevated transition-all">
              <div className={`w-9 h-9 sm:w-11 sm:h-11 ${a.color} rounded-xl flex items-center justify-center mb-2 sm:mb-3 group-hover:scale-110 transition-transform`}>
                <Icon size={18} />
              </div>
              <h3 className="font-semibold text-gray-900 text-[13px] sm:text-sm truncate">{a.title}</h3>
              <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5 line-clamp-1">{a.desc}</p>
            </Link>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {/* Prices — spans full on md, 2 cols on lg */}
        <div className="md:col-span-2 lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 md:p-6 card-soft">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-[17px] font-bold text-gray-900 flex items-center gap-2">
                💰 {isUrdu ? 'آج کی قیمتیں' : "Today's Prices"}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {isUrdu ? 'ملکی منڈی کی تازہ ترین نرخیں' : 'Latest national market rates'}
              </p>
            </div>
            <Link to="/prices" className="text-xs font-semibold text-green-600 hover:text-green-700 flex items-center gap-1">
              {isUrdu ? 'سب دیکھیں' : 'View all'} <FiArrowRight size={12} className="rtl:rotate-180" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {prices.map((p, i) => {
              const change = getChangePercent(p.price, p.previousPrice);
              const isUp = change > 0;
              return (
                <Link key={i} to="/prices"
                  className="group bg-gray-50 hover:bg-white hover:border-green-200 border border-transparent rounded-xl p-3.5 transition-all">
                  <p className="text-xs text-gray-500 truncate mb-1">
                    {isUrdu ? p.cropID?.cropNameUrdu : p.cropID?.cropName}
                  </p>
                  <p className="text-[17px] font-bold text-gray-900">
                    {p.currency} {p.price?.toLocaleString()}
                  </p>
                  {change !== null && (
                    <div className={`flex items-center gap-1 text-[11px] font-semibold mt-1 ${isUp ? 'text-green-600' : 'text-red-500'}`}>
                      {isUp ? <FiTrendingUp size={11} /> : <FiTrendingDown size={11} />}
                      {isUp ? '+' : ''}{change}%
                    </div>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Mini chart */}
          {prices.length > 0 && (
            <div className="mt-5 pt-5 border-t border-gray-100">
              <p className="text-xs font-semibold text-gray-500 mb-3 flex items-center gap-1.5">
                <FiBarChart2 size={12} /> {isUrdu ? 'قیمت کا موازنہ' : 'Price Comparison'}
              </p>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={prices.map(p => ({
                  name: (isUrdu && p.cropID?.cropNameUrdu ? p.cropID.cropNameUrdu : p.cropID?.cropName || '').substring(0, 8),
                  price: p.price || 0,
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    cursor={{ fill: '#f9fafb' }}
                    contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e5e7eb' }}
                    formatter={(v) => [`PKR ${v.toLocaleString()}`, 'Price']}
                  />
                  <Bar dataKey="price" fill="#22c55e" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* News — 1 col */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 md:p-6 card-soft">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[17px] font-bold text-gray-900 flex items-center gap-2">
              📰 {isUrdu ? 'تازہ خبریں' : 'Latest News'}
            </h2>
            <Link to="/news" className="text-xs font-semibold text-green-600">
              {isUrdu ? 'سب' : 'All'}
            </Link>
          </div>
          <div className="space-y-3">
            {news.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">{t('news.noNews')}</p>
            ) : news.map(article => (
              <Link key={article._id} to="/news"
                className="block group">
                <div className="flex items-center gap-2 mb-1.5">
                  {article.isBreaking && (
                    <span className="text-[9px] font-bold bg-red-100 text-red-700 px-1.5 py-0.5 rounded">
                      {t('news.breaking')}
                    </span>
                  )}
                  <span className="text-[9px] text-gray-400 uppercase tracking-wide">
                    {article.category?.replace('_', ' ')}
                  </span>
                </div>
                <h4 className="text-[13px] font-semibold text-gray-900 line-clamp-2 group-hover:text-green-700 transition-colors">
                  {isUrdu && article.titleUrdu ? article.titleUrdu : article.title}
                </h4>
                <p className="text-[10.5px] text-gray-400 mt-1">
                  {new Date(article.publishedAt).toLocaleDateString()}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {recommendations?.recommendations?.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 md:p-6 card-soft">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-[17px] font-bold text-gray-900 flex items-center gap-2">
                🌱 {isUrdu ? 'فصل کی سفارشات' : 'Crop Recommendations'}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {recommendations.season}
                {recommendations.location ? ` • ${isUrdu && recommendations.location.cityUrdu ? recommendations.location.cityUrdu : recommendations.location.city}` : ''}
                {recommendations.weather ? ` • ${recommendations.weather.temperature}°C` : ''}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {recommendations.recommendations.slice(0, 6).map((rec, i) => (
              <div key={i}
                className="relative bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-3 border border-green-100">
                <div className="absolute top-2 right-2 rtl:left-2 rtl:right-auto">
                  <span className="text-[9px] bg-white text-green-700 px-1.5 py-0.5 rounded-full font-bold">
                    {rec.score}%
                  </span>
                </div>
                <div className="text-2xl mb-1">🌱</div>
                <h4 className="font-bold text-gray-900 text-[13px]">{isUrdu ? rec.cropUrdu : rec.crop}</h4>
                <p className="text-[10px] text-gray-500 mt-0.5">
                  💧 {isUrdu ? rec.waterNeedUrdu : rec.waterNeed} • 🌡 {rec.tempRange[0]}-{rec.tempRange[1]}°
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
