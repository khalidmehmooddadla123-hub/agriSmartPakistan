import { useState, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { MapContainer, TileLayer, Popup, CircleMarker, useMap } from 'react-leaflet';
import { locationAPI, priceAPI, weatherAPI } from '../services/api';
import {
  FiThermometer, FiDroplet, FiDollarSign, FiMapPin, FiSearch,
  FiCrosshair, FiX, FiLayers, FiTrendingUp, FiTrendingDown
} from 'react-icons/fi';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Loader from '../components/ui/Loader';

// Fix Leaflet default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Helper component that exposes map controls (fly-to)
function MapController({ flyTo }) {
  const map = useMap();
  useEffect(() => {
    if (flyTo) {
      map.flyTo([flyTo.lat, flyTo.lng], flyTo.zoom || 9, { duration: 1.4 });
    }
  }, [flyTo, map]);
  return null;
}

const PAKISTAN_CENTER = [30.3753, 69.3451];

export default function CropMap() {
  const { i18n } = useTranslation();
  const isUrdu = i18n.language === 'ur';
  const [mapData, setMapData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [layer, setLayer] = useState('prices'); // prices | weather | both
  const [search, setSearch] = useState('');
  const [flyTo, setFlyTo] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => { loadMapData(); }, []);

  const loadMapData = async () => {
    setLoading(true);
    try {
      const locRes = await locationAPI.getAll();
      const locs = locRes.data.data || [];
      const data = await Promise.all(locs.map(async (loc) => {
        let weather = null, prices = [];
        try { const w = await weatherAPI.getByLocation(loc._id); weather = w.data.data; } catch {}
        try {
          const p = await priceAPI.getLatest({ priceType: 'local', locationID: loc._id });
          prices = p.data.data?.slice(0, 3) || [];
        } catch {}
        return { ...loc, weather, prices };
      }));
      setMapData(data);
    } finally {
      setLoading(false);
    }
  };

  // Stats summary
  const stats = useMemo(() => {
    const withTemp = mapData.filter(d => d.weather?.temperature !== undefined);
    const hottest = withTemp.reduce((a, b) => (a?.weather?.temperature ?? -99) > b.weather.temperature ? a : b, null);
    const coolest = withTemp.reduce((a, b) => (a?.weather?.temperature ?? 99) < b.weather.temperature ? a : b, null);
    const cities = mapData.filter(d => d.latitude && d.longitude).length;
    return { hottest, coolest, cities };
  }, [mapData]);

  // Search filter
  const searchResults = useMemo(() => {
    if (search.length < 2) return [];
    const q = search.toLowerCase();
    return mapData.filter(d =>
      d.city?.toLowerCase().includes(q) ||
      d.cityUrdu?.includes(search) ||
      d.district?.toLowerCase().includes(q) ||
      d.districtUrdu?.includes(search) ||
      d.province?.toLowerCase().includes(q) ||
      d.provinceUrdu?.includes(search)
    ).slice(0, 15);
  }, [search, mapData]);

  const goToCity = (loc) => {
    setFlyTo({ lat: loc.latitude, lng: loc.longitude, zoom: 9, _ts: Date.now() });
    setSelectedId(loc._id);
    setSearch('');
  };

  const goToMyLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setFlyTo({ lat: pos.coords.latitude, lng: pos.coords.longitude, zoom: 11, _ts: Date.now() }),
      () => {}
    );
  };

  const getWeatherColor = (temp) => {
    if (temp === undefined || temp === null) return '#9ca3af';
    if (temp >= 40) return '#dc2626';
    if (temp >= 35) return '#f97316';
    if (temp >= 25) return '#eab308';
    if (temp >= 15) return '#22c55e';
    return '#3b82f6';
  };

  const getPriceColor = (prices) => {
    if (!prices || prices.length === 0) return '#9ca3af';
    const hasUp = prices.some(p => p.previousPrice && p.price > p.previousPrice);
    const hasDown = prices.some(p => p.previousPrice && p.price < p.previousPrice);
    if (hasUp && !hasDown) return '#16a34a';
    if (hasDown && !hasUp) return '#dc2626';
    return '#eab308';
  };

  return (
    <div className="space-y-4 sm:space-y-5 animate-fade-in-up">
      {/* Hero with integrated search — outer wrapper has NO overflow-hidden so the search dropdown can extend below */}
      <div className="relative">
        <div className="relative rounded-2xl sm:rounded-3xl bg-gradient-to-br from-emerald-600 via-green-600 to-teal-700 p-5 sm:p-6 text-white card-elevated">
          {/* Decorative orbs in their own clipped layer (so they don't overflow the rounded corners) */}
          <div className="absolute inset-0 overflow-hidden rounded-2xl sm:rounded-3xl pointer-events-none">
            <div className="absolute -top-16 -right-16 rtl:-left-16 rtl:right-auto w-56 h-56 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-12 -left-12 rtl:-right-12 rtl:left-auto w-48 h-48 bg-yellow-300/15 rounded-full blur-3xl" />
          </div>

          <div className="relative flex items-start gap-3 sm:gap-4 mb-4 sm:mb-5 flex-wrap">
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 backdrop-blur rounded-xl sm:rounded-2xl flex items-center justify-center text-2xl shrink-0">
            🗺
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">
              {isUrdu ? 'انٹرایکٹو نقشہ' : 'Interactive Pakistan Map'}
            </h1>
            <p className="text-emerald-100 text-xs sm:text-sm mt-0.5">
              {isUrdu ? 'پاکستان بھر کی فصلوں کی قیمتیں اور موسم — ایک نظر میں' : 'Live crop prices & weather across Pakistan, at a glance'}
            </p>
          </div>
          {!loading && (
            <div className="flex gap-3 sm:gap-4 text-center shrink-0 bg-white/10 backdrop-blur border border-white/15 rounded-2xl px-4 py-2">
              <div>
                <p className="text-xl sm:text-2xl font-extrabold leading-none">{stats.cities}</p>
                <p className="text-[10px] uppercase tracking-wider text-emerald-100/90 mt-0.5">{isUrdu ? 'شہر' : 'Cities'}</p>
              </div>
              {stats.hottest?.weather && (
                <div>
                  <p className="text-xl sm:text-2xl font-extrabold leading-none">{stats.hottest.weather.temperature}°</p>
                  <p className="text-[10px] uppercase tracking-wider text-emerald-100/90 mt-0.5">🔥 {isUrdu ? 'گرم ترین' : 'Hottest'}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <div className="relative">
            <FiSearch className="absolute left-4 rtl:right-4 rtl:left-auto top-1/2 -translate-y-1/2 text-emerald-600" size={17} />
            <input
              type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 rtl:pr-12 pr-12 rtl:pl-12 py-3 sm:py-3.5 bg-white text-gray-900 rounded-2xl text-sm shadow-lg focus:ring-4 focus:ring-white/30 outline-none placeholder:text-gray-400"
              placeholder={isUrdu ? 'شہر تلاش کریں…' : 'Search any Pakistani city…'}
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-12 rtl:left-12 rtl:right-auto top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <FiX size={15} />
              </button>
            )}
            <button
              onClick={goToMyLocation}
              title={isUrdu ? 'میری لوکیشن' : 'My location'}
              className="absolute right-3 rtl:left-3 rtl:right-auto top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 flex items-center justify-center transition"
            >
              <FiCrosshair size={15} />
            </button>
          </div>

          {/* Dropdown results */}
          {searchResults.length > 0 && (
            <div className="absolute left-0 right-0 mt-2 bg-white rounded-2xl card-floating overflow-hidden z-50 max-h-72 overflow-y-auto animate-fade-in-up">
              {searchResults.map(loc => (
                <button
                  key={loc._id}
                  onClick={() => goToCity(loc)}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm hover:bg-emerald-50 transition border-b border-gray-50 last:border-0 text-left rtl:text-right"
                >
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
                  {loc.weather && (
                    <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-1 rounded-full shrink-0">
                      {loc.weather.temperature}°C
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
        </div>{/* close inner gradient card */}
      </div>{/* close outer wrapper */}

      {/* Layer + Legend */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex bg-white rounded-xl border border-gray-100 p-1 card-soft shrink-0">
          {[
            { key: 'prices', icon: FiDollarSign, en: 'Prices', ur: 'قیمتیں', color: 'green' },
            { key: 'weather', icon: FiThermometer, en: 'Weather', ur: 'موسم', color: 'blue' },
            { key: 'both', icon: FiLayers, en: 'Both', ur: 'دونوں', color: 'purple' }
          ].map(opt => (
            <button
              key={opt.key}
              onClick={() => setLayer(opt.key)}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-[13px] font-semibold transition ${
                layer === opt.key
                  ? `bg-${opt.color}-600 text-white shadow-md`
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
              style={layer === opt.key ? { background: opt.color === 'green' ? '#16a34a' : opt.color === 'blue' ? '#2563eb' : '#9333ea' } : {}}
            >
              <opt.icon size={13} /> {isUrdu ? opt.ur : opt.en}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 sm:gap-3 text-[11px] sm:text-xs text-gray-600">
          {(layer === 'weather' || layer === 'both') && (
            <>
              <span className="inline-flex items-center gap-1 bg-white px-2.5 py-1 rounded-full border border-gray-100"><span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> &lt;15°</span>
              <span className="inline-flex items-center gap-1 bg-white px-2.5 py-1 rounded-full border border-gray-100"><span className="w-2.5 h-2.5 rounded-full bg-green-500" /> 15-25°</span>
              <span className="inline-flex items-center gap-1 bg-white px-2.5 py-1 rounded-full border border-gray-100"><span className="w-2.5 h-2.5 rounded-full bg-yellow-500" /> 25-35°</span>
              <span className="inline-flex items-center gap-1 bg-white px-2.5 py-1 rounded-full border border-gray-100"><span className="w-2.5 h-2.5 rounded-full bg-orange-500" /> 35-40°</span>
              <span className="inline-flex items-center gap-1 bg-white px-2.5 py-1 rounded-full border border-gray-100"><span className="w-2.5 h-2.5 rounded-full bg-red-600" /> &gt;40°</span>
            </>
          )}
          {layer === 'prices' && (
            <>
              <span className="inline-flex items-center gap-1 bg-white px-2.5 py-1 rounded-full border border-gray-100"><FiTrendingUp size={11} className="text-green-600" /> {isUrdu ? 'بڑھیں' : 'Up'}</span>
              <span className="inline-flex items-center gap-1 bg-white px-2.5 py-1 rounded-full border border-gray-100"><FiTrendingDown size={11} className="text-red-600" /> {isUrdu ? 'گریں' : 'Down'}</span>
              <span className="inline-flex items-center gap-1 bg-white px-2.5 py-1 rounded-full border border-gray-100"><span className="w-2.5 h-2.5 rounded-full bg-yellow-500" /> {isUrdu ? 'مخلوط' : 'Mixed'}</span>
            </>
          )}
        </div>
      </div>

      {/* Map */}
      <div className="rounded-2xl overflow-hidden border border-gray-100 card-soft" style={{ height: '520px' }}>
        {loading ? (
          <div className="flex items-center justify-center h-full bg-emerald-50/40">
            <Loader label={isUrdu ? 'نقشہ تیار ہو رہا ہے…' : 'Preparing your map…'} />
          </div>
        ) : (
          <MapContainer center={PAKISTAN_CENTER} zoom={5} style={{ height: '100%', width: '100%' }} scrollWheelZoom={true}>
            <TileLayer
              attribution='&copy; OpenStreetMap'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapController flyTo={flyTo} />
            {mapData.filter(loc => loc.latitude && loc.longitude).map((loc) => {
              const color = layer === 'weather'
                ? getWeatherColor(loc.weather?.temperature)
                : layer === 'prices'
                  ? getPriceColor(loc.prices)
                  : getWeatherColor(loc.weather?.temperature); // both: show weather color
              const isSelected = loc._id === selectedId;
              return (
                <CircleMarker
                  key={loc._id}
                  center={[loc.latitude, loc.longitude]}
                  radius={isSelected ? 16 : 12}
                  pathOptions={{
                    fillColor: color,
                    color: isSelected ? '#0f766e' : '#fff',
                    weight: isSelected ? 3 : 2,
                    opacity: 1,
                    fillOpacity: 0.85
                  }}
                  eventHandlers={{ click: () => setSelectedId(loc._id) }}
                >
                  <Popup>
                    <div className="min-w-[220px] text-sm">
                      <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-100">
                        <h3 className="font-bold text-gray-900 text-base">
                          {isUrdu && loc.cityUrdu ? loc.cityUrdu : loc.city}
                        </h3>
                        <span className="text-[10px] text-gray-400 font-medium">
                          {isUrdu && loc.provinceUrdu ? loc.provinceUrdu : loc.province}
                        </span>
                      </div>

                      {loc.weather && (layer === 'weather' || layer === 'both') && (
                        <div className="mb-2 p-2.5 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border border-blue-100">
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-1.5">
                              <FiThermometer className="text-blue-600" size={14} />
                              <span className="font-bold text-base">{loc.weather.temperature}°C</span>
                            </div>
                            <span className="text-xs capitalize text-gray-600">{loc.weather.description}</span>
                          </div>
                          <div className="flex gap-3 text-[11px] text-gray-600">
                            <span className="flex items-center gap-1"><FiDroplet size={10} /> {loc.weather.humidity}%</span>
                            <span>💨 {loc.weather.windSpeed} km/h</span>
                          </div>
                        </div>
                      )}

                      {loc.prices.length > 0 && (layer === 'prices' || layer === 'both') && (
                        <div className="space-y-1 p-2.5 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-100">
                          <p className="text-[10px] font-bold text-green-800 uppercase tracking-wide flex items-center gap-1 mb-1">
                            <FiDollarSign size={10} /> {isUrdu ? 'مقامی منڈی' : 'Local Mandi'}
                          </p>
                          {loc.prices.map((p, i) => {
                            const change = p.previousPrice ? ((p.price - p.previousPrice) / p.previousPrice * 100).toFixed(1) : null;
                            const up = change > 0;
                            return (
                              <div key={i} className="flex justify-between items-center text-xs">
                                <span className="text-gray-700">{isUrdu ? p.cropID?.cropNameUrdu : p.cropID?.cropName}</span>
                                <span className="font-semibold text-gray-900">
                                  {p.currency} {p.price?.toLocaleString()}
                                  {change && (
                                    <span className={`ml-1 ${up ? 'text-green-600' : 'text-red-500'}`}>
                                      {up ? '↑' : '↓'}{Math.abs(change)}%
                                    </span>
                                  )}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {!loc.weather && loc.prices.length === 0 && (
                        <p className="text-xs text-gray-400 italic text-center py-3">{isUrdu ? 'ڈیٹا دستیاب نہیں' : 'No data available'}</p>
                      )}
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}
          </MapContainer>
        )}
      </div>
    </div>
  );
}
