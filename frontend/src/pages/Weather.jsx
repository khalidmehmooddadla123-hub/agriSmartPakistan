import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { weatherAPI, locationAPI } from '../services/api';
import { FiDroplet, FiWind, FiEye, FiAlertTriangle, FiSun, FiCloud, FiSearch, FiMapPin, FiCheck, FiClock, FiX, FiCrosshair } from 'react-icons/fi';
import Loader from '../components/ui/Loader';

/**
 * Dynamic theme that picks a gradient + emoji ambience based on
 * the current weather description + local hour of day.
 */
function getWeatherTheme(weather) {
  const desc = (weather?.description || '').toLowerCase();
  const hour = new Date().getHours();
  const isNight = hour < 6 || hour >= 19;
  const hasRain = desc.includes('rain') || desc.includes('drizzle') || desc.includes('shower') || desc.includes('thunder');
  const isSnow = desc.includes('snow') || desc.includes('sleet');
  const isCloudy = desc.includes('cloud') || desc.includes('overcast');
  const isClear = desc.includes('clear') || desc.includes('sunny');
  const isFog = desc.includes('fog') || desc.includes('mist') || desc.includes('haze');

  if (hasRain) return {
    gradient: 'from-slate-700 via-blue-700 to-blue-900',
    accent: 'text-blue-100', icon: '🌧',
    bgEmoji: '💧', subtitle: 'Rainy weather'
  };
  if (isSnow) return {
    gradient: 'from-cyan-200 via-sky-300 to-blue-400',
    accent: 'text-cyan-50', icon: '❄️',
    bgEmoji: '❄️', subtitle: 'Snow / sleet'
  };
  if (isFog) return {
    gradient: 'from-slate-400 via-slate-500 to-slate-600',
    accent: 'text-slate-100', icon: '🌫',
    bgEmoji: '🌫', subtitle: 'Foggy / hazy'
  };
  if (isCloudy) return {
    gradient: isNight
      ? 'from-slate-700 via-slate-800 to-slate-900'
      : 'from-slate-400 via-blue-400 to-slate-500',
    accent: isNight ? 'text-slate-100' : 'text-blue-50',
    icon: isNight ? '☁️' : '⛅',
    bgEmoji: '☁️', subtitle: isNight ? 'Cloudy night' : 'Cloudy day'
  };
  if (isClear || !desc) {
    if (isNight) return {
      gradient: 'from-indigo-900 via-purple-900 to-slate-900',
      accent: 'text-indigo-100', icon: '🌙',
      bgEmoji: '✨', subtitle: 'Clear night'
    };
    if (hour < 9) return {
      gradient: 'from-rose-300 via-amber-300 to-yellow-400',
      accent: 'text-amber-50', icon: '🌅',
      bgEmoji: '🌅', subtitle: 'Sunrise'
    };
    if (hour > 17) return {
      gradient: 'from-orange-400 via-rose-500 to-purple-600',
      accent: 'text-rose-50', icon: '🌇',
      bgEmoji: '🌇', subtitle: 'Sunset'
    };
    return {
      gradient: 'from-amber-400 via-orange-400 to-yellow-500',
      accent: 'text-amber-50', icon: '☀️',
      bgEmoji: '☀️', subtitle: 'Sunny day'
    };
  }
  // Fallback
  return {
    gradient: 'from-blue-500 via-sky-500 to-cyan-500',
    accent: 'text-blue-100', icon: '🌤',
    bgEmoji: '🌤', subtitle: 'Partly cloudy'
  };
}

// Generate farming tips based on weather conditions
function getFarmingTips(weather, lang) {
  const tips = { now: [], next: [] };
  if (!weather) return tips;

  const temp = weather.temperature;
  const humidity = weather.humidity;
  const wind = weather.windSpeed;
  const desc = (weather.description || '').toLowerCase();
  const hasRain = desc.includes('rain') || desc.includes('drizzle') || desc.includes('shower');
  const isCloudy = desc.includes('cloud') || desc.includes('overcast');
  const isClear = desc.includes('clear') || desc.includes('sunny');

  // Check upcoming rain from forecast
  const rainComing = weather.forecast?.some(d => d.precipitation > 60);

  const t = {
    en: {
      // NOW tips
      hotIrrigate: '🌡️ Temperature is high ({temp}°C). Water your crops early morning or late evening to reduce evaporation.',
      hotShade: '☀️ Extreme heat alert! Provide shade to nursery plants and young seedlings. Avoid field work 11AM-3PM.',
      coldProtect: '🥶 Cold weather ({temp}°C)! Cover sensitive crops with plastic sheets or straw mulch tonight.',
      frostAlert: '❄️ FROST DANGER! Temperature near freezing. Use smoke or overhead sprinklers to protect crops immediately.',
      rainDelay: '🌧️ Rain is occurring. Delay all spraying operations. Ensure field drainage channels are clear.',
      rainHarvest: '🌧️ Do NOT harvest crops during rain. Wait for dry weather to avoid grain moisture damage.',
      windSpray: '💨 Strong winds ({wind} km/h). Do NOT spray pesticides or fertilizer today - spray will drift and waste chemicals.',
      humidFungus: '💧 Humidity is very high ({hum}%). Monitor crops closely for fungal diseases. Increase ventilation in greenhouses.',
      clearSpray: '☀️ Clear weather - ideal time for pesticide/fertilizer application. Spray early morning before 9AM.',
      clearHarvest: '🌾 Good weather for harvesting. Collect ripe crops today while conditions are dry.',
      normalWater: '💧 Water your crops according to regular schedule. Check soil moisture before irrigating.',
      // NEXT tips
      rainComingHarvest: '🌧️ Rain expected in coming days. Harvest any ripe crops NOW before they get wet damage.',
      rainComingDrain: '🌧️ Rain forecast ahead. Clean all drainage channels and repair field bunds to prevent waterlogging.',
      rainComingDelay: '⏳ Rain expected soon. Delay sowing new seeds until after the rain passes.',
      rainComingSpray: '🧪 Rain coming - apply any needed fungicide/pesticide TODAY before rain washes it away.',
      dryPrepare: '☀️ Dry spell ahead. Stock irrigation water. Consider mulching around plants to retain moisture.',
      dryPlanting: '🌱 Dry weather expected. Good time to prepare fields and plan next sowing.',
      hotPrepare: '🌡️ Continued heat expected. Arrange shade nets for vegetable nurseries. Plan early-morning work schedule.',
      coolPlanting: '🌿 Cool weather ahead - perfect time for planting wheat, peas, and winter vegetables.',
      generalSoil: '🧑‍🌾 Check your soil health this week. Good time for soil testing to plan fertilizer for next season.',
      generalPest: '🔍 Regularly scout your fields for early signs of pest or disease. Early detection saves crops.'
    },
    ur: {
      hotIrrigate: '🌡️ درجہ حرارت زیادہ ہے ({temp} ڈگری)۔ بخارات کم کرنے کے لیے صبح سویرے یا شام کو فصلوں کو پانی دیں۔',
      hotShade: '☀️ شدید گرمی کا الرٹ! نرسری کے پودوں اور نئی پنیریوں کو سایہ دیں۔ صبح 11 سے دوپہر 3 تک کھیت میں کام سے بچیں۔',
      coldProtect: '🥶 سرد موسم ({temp} ڈگری)! حساس فصلوں کو آج رات پلاسٹک شیٹ یا بھوسے سے ڈھانپیں۔',
      frostAlert: '❄️ پالے کا خطرہ! درجہ حرارت جمنے کے قریب ہے۔ فصلوں کی حفاظت کے لیے فوری طور پر دھواں کریں یا اوپر سے پانی کا سپرے کریں۔',
      rainDelay: '🌧️ بارش ہو رہی ہے۔ سپرے کے تمام کام ملتوی کریں۔ کھیت کی نکاسی کی نالیاں صاف رکھیں۔',
      rainHarvest: '🌧️ بارش میں فصل نہ کاٹیں۔ خشک موسم کا انتظار کریں تاکہ دانوں میں نمی نہ آئے۔',
      windSpray: '💨 تیز ہوائیں ({wind} کلومیٹر فی گھنٹہ)۔ آج کیڑے مار دوا یا کھاد کا سپرے نہ کریں - سپرے بکھر جائے گا۔',
      humidFungus: '💧 نمی بہت زیادہ ہے ({hum}%)۔ فصلوں پر فنگس کی بیماریوں کی نگرانی کریں۔ گرین ہاؤس میں ہوا کا گزر بڑھائیں۔',
      clearSpray: '☀️ صاف موسم - کیڑے مار دوا یا کھاد سپرے کا بہترین وقت۔ صبح 9 بجے سے پہلے سپرے کریں۔',
      clearHarvest: '🌾 فصل کاٹنے کا اچھا موسم۔ آج پکی فصل کاٹ لیں جب تک موسم خشک ہے۔',
      normalWater: '💧 معمول کے مطابق فصلوں کو پانی دیں۔ آبپاشی سے پہلے مٹی کی نمی چیک کریں۔',
      rainComingHarvest: '🌧️ آنے والے دنوں میں بارش متوقع ہے۔ پکی فصل ابھی کاٹ لیں اس سے پہلے کہ بھیگ جائے۔',
      rainComingDrain: '🌧️ آگے بارش کی پیشگوئی ہے۔ نکاسی کی تمام نالیاں صاف کریں اور کھیت کے بند مرمت کریں۔',
      rainComingDelay: '⏳ جلد بارش متوقع ہے۔ نئے بیج بونے کا کام بارش گزرنے تک ملتوی کریں۔',
      rainComingSpray: '🧪 بارش آنے والی ہے - ضروری فنگس مار دوا یا کیڑے مار دوا آج ہی سپرے کریں۔',
      dryPrepare: '☀️ خشک موسم آ رہا ہے۔ آبپاشی کا پانی جمع کریں۔ نمی برقرار رکھنے کے لیے ملچ بچھائیں۔',
      dryPlanting: '🌱 خشک موسم متوقع ہے۔ کھیت تیار کرنے اور اگلی بجائی کی منصوبہ بندی کا اچھا وقت۔',
      hotPrepare: '🌡️ مسلسل گرمی متوقع ہے۔ سبزیوں کی نرسری کے لیے شیڈ نیٹ لگائیں۔ صبح سویرے کام کی منصوبہ بندی کریں۔',
      coolPlanting: '🌿 آگے ٹھنڈا موسم ہے - گندم، مٹر اور سردیوں کی سبزیاں لگانے کا بہترین وقت۔',
      generalSoil: '🧑‍🌾 اس ہفتے مٹی کی صحت چیک کریں۔ اگلے موسم کی کھاد کی منصوبہ بندی کے لیے مٹی کا ٹیسٹ کرائیں۔',
      generalPest: '🔍 باقاعدگی سے کھیتوں کا معائنہ کریں۔ بیماری کی جلد شناخت سے فصل بچ سکتی ہے۔'
    }
  };

  const l = lang === 'ur' ? t.ur : t.en;

  const fmt = (s) => s
    .replace('{temp}', temp)
    .replace('{wind}', wind)
    .replace('{hum}', humidity);

  // NOW tips based on current conditions
  if (temp >= 42) { tips.now.push(fmt(l.hotShade)); }
  else if (temp >= 35) { tips.now.push(fmt(l.hotIrrigate)); }

  if (temp <= 2) { tips.now.push(fmt(l.frostAlert)); }
  else if (temp <= 8) { tips.now.push(fmt(l.coldProtect)); }

  if (hasRain) { tips.now.push(fmt(l.rainDelay)); tips.now.push(fmt(l.rainHarvest)); }
  if (wind > 40) { tips.now.push(fmt(l.windSpray)); }
  if (humidity > 85) { tips.now.push(fmt(l.humidFungus)); }
  if (isClear && !hasRain && wind <= 20) { tips.now.push(fmt(l.clearSpray)); tips.now.push(fmt(l.clearHarvest)); }
  if (tips.now.length === 0) { tips.now.push(fmt(l.normalWater)); }

  // NEXT TIME tips based on forecast
  if (rainComing) {
    tips.next.push(fmt(l.rainComingHarvest));
    tips.next.push(fmt(l.rainComingDrain));
    tips.next.push(fmt(l.rainComingSpray));
  } else {
    if (temp >= 35) { tips.next.push(fmt(l.dryPrepare)); tips.next.push(fmt(l.hotPrepare)); }
    else if (temp <= 15) { tips.next.push(fmt(l.coolPlanting)); }
    else { tips.next.push(fmt(l.dryPlanting)); }
  }
  tips.next.push(fmt(l.generalSoil));
  tips.next.push(fmt(l.generalPest));

  return tips;
}

export default function Weather() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const lang = i18n.language;
  const isUrdu = lang === 'ur';
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [locations, setLocations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedLocationName, setSelectedLocationName] = useState('');

  const dayNames = {
    en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    ur: ['اتوار', 'پیر', 'منگل', 'بدھ', 'جمعرات', 'جمعہ', 'ہفتہ']
  };

  // Load all locations for search
  useEffect(() => {
    locationAPI.getAll()
      .then(res => setLocations(res.data.data || []))
      .catch(() => {});
  }, []);

  // Load weather for user's location on mount
  useEffect(() => {
    const locId = user?.locationID?._id || user?.locationID;
    if (locId) {
      loadWeather(locId);
      const loc = user?.locationID;
      if (loc?.city) setSelectedLocationName(`${loc.city}, ${loc.province}`);
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadWeather = (locationId) => {
    setLoading(true);
    weatherAPI.getByLocation(locationId)
      .then(res => {
        setWeather(res.data.data);
      })
      .catch(() => setWeather(null))
      .finally(() => setLoading(false));
  };

  // Search locations as user types
  useEffect(() => {
    if (searchQuery.length < 2) { setSearchResults([]); return; }
    const q = searchQuery.toLowerCase();
    const results = locations.filter(loc =>
      loc.city?.toLowerCase().includes(q) ||
      loc.cityUrdu?.includes(searchQuery) ||
      loc.district?.toLowerCase().includes(q) ||
      loc.districtUrdu?.includes(searchQuery) ||
      loc.province?.toLowerCase().includes(q) ||
      loc.provinceUrdu?.includes(searchQuery)
    ).slice(0, 15);
    setSearchResults(results);
  }, [searchQuery, locations]);

  const selectLocation = (loc) => {
    setSearchQuery('');
    setSearchResults([]);
    setSelectedLocationName(`${loc.city}, ${loc.province}`);
    loadWeather(loc._id);
  };

  const tips = getFarmingTips(weather, lang);
  const theme = getWeatherTheme(weather);

  if (loading) {
    return <Loader label={isUrdu ? 'موسم لوڈ ہو رہا ہے…' : 'Loading weather…'} />;
  }

  return (
    <div className="space-y-5 animate-fade-in-up">
      {/* Hero with dynamic weather/time theme — outer wrapper has NO overflow-hidden so the search dropdown can extend below */}
      <div className="relative">
      <div className={`relative bg-gradient-to-br ${theme.gradient} rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-7 text-white card-elevated transition-all duration-700`}>
        {/* Decorative orbs + floating emoji clipped to the rounded corners */}
        <div className="absolute inset-0 overflow-hidden rounded-2xl sm:rounded-3xl pointer-events-none">
          <div className="absolute -top-6 right-6 text-7xl sm:text-9xl opacity-20 animate-float select-none">{theme.bgEmoji}</div>
          <div className="absolute top-0 right-0 rtl:left-0 rtl:right-auto w-44 sm:w-60 h-44 sm:h-60 bg-white/15 rounded-full -mr-16 sm:-mr-20 -mt-16 sm:-mt-20 blur-2xl" />
          <div className="absolute -bottom-12 -left-12 rtl:-right-12 rtl:left-auto w-48 h-48 bg-white/10 rounded-full blur-3xl" />
        </div>

        <div className="relative">
          <div className="flex items-start gap-3 mb-4 sm:mb-5">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/25 backdrop-blur rounded-xl sm:rounded-2xl flex items-center justify-center text-2xl sm:text-3xl shrink-0 shadow-lg">
              {theme.icon}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight">{t('weather.title')}</h1>
              <p className={`${theme.accent} text-[11px] sm:text-xs mt-0.5 line-clamp-1 font-medium`}>
                {isUrdu ? 'لائیو موسم + کاشتکاری مشورے' : `${theme.subtitle} · live weather + farming tips`}
              </p>
            </div>
          </div>

          {/* Beautiful search bar */}
          <div className="relative">
            <div className="relative bg-white rounded-2xl shadow-2xl shadow-black/10">
              <FiSearch className="absolute left-4 rtl:right-4 rtl:left-auto top-1/2 -translate-y-1/2 text-emerald-600" size={17} />
              <input
                type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-12 rtl:pr-12 pr-12 rtl:pl-12 py-3 sm:py-3.5 text-gray-900 rounded-2xl text-sm focus:ring-4 focus:ring-white/40 outline-none placeholder:text-gray-400"
                placeholder={t('weather.searchPlace')}
              />
              {searchQuery ? (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 rtl:left-3 rtl:right-auto top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg hover:bg-gray-100 text-gray-400 flex items-center justify-center transition">
                  <FiX size={15} />
                </button>
              ) : selectedLocationName ? (
                <div className="absolute right-3 rtl:left-3 rtl:right-auto top-1/2 -translate-y-1/2 flex items-center gap-1 text-emerald-700 text-[11px] font-bold bg-emerald-50 px-2.5 py-1 rounded-full max-w-[120px] truncate">
                  <FiMapPin size={11} className="shrink-0" /> {selectedLocationName}
                </div>
              ) : null}
            </div>

            {searchResults.length > 0 && (
              <div className="absolute left-0 right-0 mt-2 bg-white rounded-2xl overflow-hidden card-floating z-50 max-h-72 overflow-y-auto animate-fade-in-up">
                {searchResults.map(loc => (
                  <button key={loc._id} onClick={() => selectLocation(loc)}
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm hover:bg-emerald-50 transition border-b border-gray-50 last:border-0 text-left rtl:text-right">
                    <div className="w-9 h-9 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600 shrink-0">
                      <FiMapPin size={15} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{isUrdu && loc.cityUrdu ? loc.cityUrdu : loc.city}</p>
                      <p className="text-[11px] text-gray-400 truncate">
                        {loc.district && loc.district !== loc.city && (
                          <>{isUrdu && loc.districtUrdu ? loc.districtUrdu : loc.district} · </>
                        )}
                        {isUrdu && loc.provinceUrdu ? loc.provinceUrdu : loc.province}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>{/* close inner gradient card */}
      </div>{/* close outer wrapper */}

      {!weather ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 py-16 text-center">
          <div className="text-6xl mb-3">🌤</div>
          <h2 className="font-bold text-gray-900 mb-1">{t('weather.selectLocation')}</h2>
          <p className="text-sm text-gray-500">{isUrdu ? 'اوپر سے شہر منتخب کریں' : 'Choose a city above to begin'}</p>
        </div>
      ) : (
        <>
          {/* Current weather big card with dynamic theme */}
          <div className="bg-white rounded-2xl border border-gray-100 card-soft overflow-hidden">
            <div className={`relative bg-gradient-to-br ${theme.gradient} p-5 sm:p-6 md:p-7 text-white overflow-hidden transition-all duration-700`}>
              <div className="absolute top-0 right-0 rtl:left-0 rtl:right-auto w-40 sm:w-52 h-40 sm:h-52 bg-white/15 rounded-full -mr-12 sm:-mr-16 -mt-12 sm:-mt-16 blur-2xl" />
              <div className="absolute -bottom-10 -left-10 rtl:-right-10 rtl:left-auto w-40 h-40 bg-white/10 rounded-full blur-3xl" />
              {/* Floating ambient icon */}
              <div className="absolute -bottom-4 right-4 text-8xl sm:text-9xl opacity-20 animate-float select-none pointer-events-none">
                {theme.icon}
              </div>

              <div className="relative flex items-end justify-between flex-wrap gap-3 sm:gap-4">
                <div className="min-w-0 flex-1">
                  <p className={`${theme.accent} text-[11px] sm:text-xs flex items-center gap-1 mb-2 truncate font-medium`}>
                    <FiMapPin size={11} className="shrink-0" /> {selectedLocationName}
                  </p>
                  <div className="flex items-end gap-2 sm:gap-3">
                    <span className="text-6xl sm:text-7xl md:text-8xl font-extrabold leading-none tracking-tight" style={{ textShadow: '0 2px 12px rgba(0,0,0,0.15)' }}>
                      {weather.temperature}°
                    </span>
                    <div className="pb-1 sm:pb-2 min-w-0">
                      <p className="text-sm sm:text-base md:text-lg capitalize font-semibold truncate">{weather.description}</p>
                      <p className={`${theme.accent} text-[11px] sm:text-xs`}>{t('weather.feelsLike')} {weather.feelsLike}°C</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 divide-x rtl:divide-x-reverse divide-gray-100 p-4">
              <div className="text-center px-2">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mx-auto mb-1.5">
                  <FiDroplet size={16} />
                </div>
                <p className="text-lg font-bold text-gray-900">{weather.humidity}%</p>
                <p className="text-[10.5px] text-gray-500 uppercase tracking-wide">{t('weather.humidity')}</p>
              </div>
              <div className="text-center px-2">
                <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mx-auto mb-1.5">
                  <FiWind size={16} />
                </div>
                <p className="text-lg font-bold text-gray-900">{weather.windSpeed}</p>
                <p className="text-[10.5px] text-gray-500 uppercase tracking-wide">km/h</p>
              </div>
              <div className="text-center px-2">
                <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mx-auto mb-1.5">
                  <FiEye size={16} />
                </div>
                <p className="text-lg font-bold text-gray-900">{weather.pressure || '—'}</p>
                <p className="text-[10.5px] text-gray-500 uppercase tracking-wide">hPa</p>
              </div>
            </div>
          </div>

          {/* Farming Tips */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-green-100 card-soft p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-green-100 text-green-600 rounded-lg flex items-center justify-center">
                  <FiCheck size={15} />
                </div>
                <h3 className="font-bold text-gray-900 text-sm">{t('weather.farmingTips')}</h3>
              </div>
              <div className="space-y-1.5">
                {tips.now.map((tip, i) => (
                  <div key={i} className="text-[13px] text-gray-700 bg-green-50/50 rounded-xl p-3 leading-relaxed border border-green-50">
                    {tip}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-blue-100 card-soft p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                  <FiClock size={15} />
                </div>
                <h3 className="font-bold text-gray-900 text-sm">{t('weather.nextTimeTips')}</h3>
              </div>
              <div className="space-y-1.5">
                {tips.next.map((tip, i) => (
                  <div key={i} className="text-[13px] text-gray-700 bg-blue-50/50 rounded-xl p-3 leading-relaxed border border-blue-50">
                    {tip}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 7-Day Forecast */}
          <div className="bg-white rounded-2xl border border-gray-100 card-soft p-5">
            <h3 className="font-bold text-gray-900 text-sm mb-4 flex items-center gap-2">
              📅 {t('weather.sevenDay')}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
              {weather.forecast?.map((day, i) => {
                const d = new Date(day.date);
                const dn = (dayNames[lang] || dayNames.en)[d.getDay()];
                const isRainy = day.precipitation > 60;
                const isHot = day.tempMax >= 38;
                const isCool = day.tempMax <= 18;
                let dayIcon = '☀️';
                let dayBg = 'bg-amber-50 hover:bg-amber-100';
                if (isRainy) { dayIcon = '🌧'; dayBg = 'bg-blue-50 hover:bg-blue-100'; }
                else if (isHot) { dayIcon = '🔥'; dayBg = 'bg-orange-50 hover:bg-orange-100'; }
                else if (isCool) { dayIcon = '❄️'; dayBg = 'bg-cyan-50 hover:bg-cyan-100'; }
                else if (day.precipitation > 30) { dayIcon = '⛅'; dayBg = 'bg-slate-50 hover:bg-slate-100'; }
                return (
                  <div key={i} className={`rounded-xl p-3 text-center transition-all hover:scale-[1.04] hover:shadow-md cursor-default ${
                    i === 0
                      ? `bg-gradient-to-br ${theme.gradient} text-white shadow-md`
                      : dayBg
                  }`}>
                    <p className={`text-[11px] font-bold ${i === 0 ? 'text-white' : 'text-gray-700'}`}>{dn}</p>
                    <p className={`text-[9.5px] ${i === 0 ? theme.accent : 'text-gray-400'}`}>
                      {d.toLocaleDateString('en-PK', { month: 'short', day: 'numeric' })}
                    </p>
                    <div className="my-2 text-2xl">
                      {i === 0 ? theme.icon : dayIcon}
                    </div>
                    <p className={`text-sm font-bold ${i === 0 ? 'text-white' : 'text-gray-900'}`}>{day.tempMax}°</p>
                    <p className={`text-[11px] ${i === 0 ? theme.accent : 'text-gray-400'}`}>{day.tempMin}°</p>
                    <div className={`mt-1 text-[10px] flex items-center justify-center gap-0.5 ${i === 0 ? theme.accent : 'text-blue-500'}`}>
                      <FiDroplet size={9} /> {day.precipitation}%
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Advisories */}
          {weather.advisories?.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 card-soft p-5">
              <h3 className="font-bold text-gray-900 text-sm mb-3 flex items-center gap-2">
                <FiAlertTriangle className="text-amber-500" size={15} /> {t('weather.advisories')}
              </h3>
              <div className="space-y-2">
                {weather.advisories.map((adv, i) => (
                  <div key={i} className={`p-3.5 rounded-xl flex items-start gap-3 ${
                    adv.severity === 'high' ? 'bg-red-50' :
                    adv.severity === 'medium' ? 'bg-amber-50' : 'bg-green-50'
                  }`}>
                    <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                      adv.severity === 'high' ? 'bg-red-500' :
                      adv.severity === 'medium' ? 'bg-amber-500' : 'bg-green-500'
                    }`} />
                    <p className={`text-[13px] leading-relaxed ${
                      adv.severity === 'high' ? 'text-red-800' :
                      adv.severity === 'medium' ? 'text-amber-800' : 'text-green-800'
                    }`}>
                      {(lang !== 'en' && adv.messageUrdu) ? adv.messageUrdu : adv.message}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
