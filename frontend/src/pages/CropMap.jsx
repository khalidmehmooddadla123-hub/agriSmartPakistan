import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import { locationAPI, priceAPI, weatherAPI } from '../services/api';
import { FiThermometer, FiDroplet, FiDollarSign, FiMapPin } from 'react-icons/fi';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default marker icon issue
import L from 'leaflet';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export default function CropMap() {
  const { i18n } = useTranslation();
  const isUrdu = i18n.language === 'ur';
  const [locations, setLocations] = useState([]);
  const [mapData, setMapData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [layer, setLayer] = useState('prices'); // prices | weather

  useEffect(() => {
    loadMapData();
  }, []);

  const loadMapData = async () => {
    try {
      const locRes = await locationAPI.getAll();
      const locs = locRes.data.data || [];
      setLocations(locs);

      // Load price and weather data for each location
      const dataPromises = locs.map(async (loc) => {
        let weather = null;
        let prices = [];

        try {
          const wRes = await weatherAPI.getByLocation(loc._id);
          weather = wRes.data.data;
        } catch {}

        try {
          const pRes = await priceAPI.getLatest({ priceType: 'local', locationID: loc._id });
          prices = pRes.data.data?.slice(0, 3) || [];
        } catch {}

        return { ...loc, weather, prices };
      });

      const data = await Promise.all(dataPromises);
      setMapData(data);
    } catch (err) {
      console.error('Map data load failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const getWeatherColor = (temp) => {
    if (temp === undefined || temp === null) return '#6b7280';
    if (temp >= 40) return '#dc2626';
    if (temp >= 35) return '#f97316';
    if (temp >= 25) return '#eab308';
    if (temp >= 15) return '#22c55e';
    return '#3b82f6';
  };

  const getPriceColor = (prices) => {
    if (!prices || prices.length === 0) return '#6b7280';
    const hasUp = prices.some(p => p.previousPrice && p.price > p.previousPrice);
    const hasDown = prices.some(p => p.previousPrice && p.price < p.previousPrice);
    if (hasUp && !hasDown) return '#16a34a';
    if (hasDown && !hasUp) return '#dc2626';
    return '#eab308';
  };

  // Pakistan center coordinates
  const pakistanCenter = [30.3753, 69.3451];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FiMapPin className="text-green-600" />
            {isUrdu ? 'انٹرایکٹو نقشہ' : 'Interactive Map'}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {isUrdu ? 'پاکستان بھر میں فصلوں کی قیمتیں اور موسم' : 'Crop prices & weather across Pakistan'}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setLayer('prices')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition ${
              layer === 'prices' ? 'bg-green-600 text-white' : 'bg-white text-gray-600 border border-gray-200'
            }`}>
            <FiDollarSign size={14} /> {isUrdu ? 'قیمتیں' : 'Prices'}
          </button>
          <button onClick={() => setLayer('weather')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition ${
              layer === 'weather' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200'
            }`}>
            <FiThermometer size={14} /> {isUrdu ? 'موسم' : 'Weather'}
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white rounded-xl border border-gray-100 p-3 flex flex-wrap gap-4 text-xs">
        {layer === 'weather' ? (
          <>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-blue-500"></span> {isUrdu ? 'ٹھنڈا' : 'Cold'} (&lt;15°C)</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-500"></span> {isUrdu ? 'معتدل' : 'Mild'} (15-25°C)</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-yellow-500"></span> {isUrdu ? 'گرم' : 'Warm'} (25-35°C)</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-orange-500"></span> {isUrdu ? 'بہت گرم' : 'Hot'} (35-40°C)</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-600"></span> {isUrdu ? 'شدید گرمی' : 'Extreme'} (&gt;40°C)</span>
          </>
        ) : (
          <>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-600"></span> {isUrdu ? 'قیمتیں بڑھیں' : 'Prices Up'}</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-600"></span> {isUrdu ? 'قیمتیں گریں' : 'Prices Down'}</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-yellow-500"></span> {isUrdu ? 'مخلوط' : 'Mixed'}</span>
          </>
        )}
      </div>

      {/* Map */}
      <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm" style={{ height: '500px' }}>
        {loading ? (
          <div className="flex items-center justify-center h-full bg-gray-50">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
          </div>
        ) : (
          <MapContainer center={pakistanCenter} zoom={5} style={{ height: '100%', width: '100%' }} scrollWheelZoom={true}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {mapData.filter(loc => loc.latitude && loc.longitude).map((loc) => (
              <CircleMarker
                key={loc._id}
                center={[loc.latitude, loc.longitude]}
                radius={12}
                pathOptions={{
                  fillColor: layer === 'weather'
                    ? getWeatherColor(loc.weather?.temperature)
                    : getPriceColor(loc.prices),
                  color: '#fff',
                  weight: 2,
                  opacity: 1,
                  fillOpacity: 0.85,
                }}
              >
                <Popup>
                  <div className="min-w-[200px] text-sm">
                    <h3 className="font-bold text-gray-800 text-base mb-2">
                      {isUrdu && loc.cityUrdu ? loc.cityUrdu : loc.city}
                      <span className="text-xs text-gray-400 font-normal ml-1">
                        {isUrdu && loc.provinceUrdu ? loc.provinceUrdu : loc.province}
                      </span>
                    </h3>

                    {/* Weather info */}
                    {loc.weather && (
                      <div className="mb-2 p-2 bg-blue-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <FiThermometer className="text-blue-600" size={14} />
                          <span className="font-semibold">{loc.weather.temperature}°C</span>
                          <span className="text-xs text-gray-500 capitalize">{loc.weather.description}</span>
                        </div>
                        <div className="flex gap-3 text-xs text-gray-500">
                          <span><FiDroplet className="inline" size={10} /> {loc.weather.humidity}%</span>
                          <span>💨 {loc.weather.windSpeed} km/h</span>
                        </div>
                      </div>
                    )}

                    {/* Price info */}
                    {loc.prices.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-gray-600 flex items-center gap-1">
                          <FiDollarSign size={12} /> {isUrdu ? 'مقامی قیمتیں' : 'Local Prices'}
                        </p>
                        {loc.prices.map((p, i) => {
                          const change = p.previousPrice ? ((p.price - p.previousPrice) / p.previousPrice * 100).toFixed(1) : null;
                          return (
                            <div key={i} className="flex justify-between items-center text-xs">
                              <span>{isUrdu ? p.cropID?.cropNameUrdu : p.cropID?.cropName}</span>
                              <span className="font-medium">
                                {p.currency} {p.price?.toLocaleString()}
                                {change && (
                                  <span className={`ml-1 ${change > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                    {change > 0 ? '+' : ''}{change}%
                                  </span>
                                )}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {!loc.weather && loc.prices.length === 0 && (
                      <p className="text-xs text-gray-400">{isUrdu ? 'ڈیٹا دستیاب نہیں' : 'No data available'}</p>
                    )}
                  </div>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
        )}
      </div>
    </div>
  );
}
