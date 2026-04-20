const axios = require('axios');
const Weather = require('../models/Weather');
const Location = require('../models/Location');

const OPENWEATHER_BASE = 'https://api.openweathermap.org/data/2.5';

// Fetch weather from OpenWeatherMap and cache it
exports.fetchAndCacheWeather = async (locationID) => {
  try {
    const location = await Location.findById(locationID);
    if (!location || !location.latitude || !location.longitude) return null;

    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey || apiKey === 'your_openweathermap_api_key') {
      console.log('[WEATHER] No API key - returning mock data');
      return await createMockWeather(locationID, location);
    }

    console.log(`[WEATHER] Fetching real data for ${location.city} (${location.latitude}, ${location.longitude})`);

    // Current weather
    const currentRes = await axios.get(`${OPENWEATHER_BASE}/weather`, {
      params: { lat: location.latitude, lon: location.longitude, appid: apiKey, units: 'metric' },
      timeout: 10000
    });

    // 5-day / 3-hour forecast (free tier)
    const forecastRes = await axios.get(`${OPENWEATHER_BASE}/forecast`, {
      params: { lat: location.latitude, lon: location.longitude, appid: apiKey, units: 'metric' },
      timeout: 10000
    });

    const current = currentRes.data;
    const forecastData = forecastRes.data.list;

    // Group 3-hour intervals into daily forecasts
    const dailyMap = {};
    forecastData.forEach(item => {
      const date = item.dt_txt.split(' ')[0];
      if (!dailyMap[date]) {
        dailyMap[date] = { temps: [], humidity: [], wind: [], descriptions: [], icons: [], precip: [] };
      }
      dailyMap[date].temps.push(item.main.temp);
      dailyMap[date].humidity.push(item.main.humidity);
      dailyMap[date].wind.push(item.wind.speed);
      dailyMap[date].descriptions.push(item.weather[0].description);
      dailyMap[date].icons.push(item.weather[0].icon);
      dailyMap[date].precip.push((item.pop || 0) * 100);
    });

    // Build forecast array (up to 5 days from free API)
    const today = new Date().toISOString().split('T')[0];
    const forecast = Object.entries(dailyMap)
      .filter(([date]) => date >= today)
      .slice(0, 7)
      .map(([date, data]) => ({
        date: new Date(date),
        tempMin: Math.round(Math.min(...data.temps)),
        tempMax: Math.round(Math.max(...data.temps)),
        humidity: Math.round(data.humidity.reduce((a, b) => a + b, 0) / data.humidity.length),
        windSpeed: Math.round((data.wind.reduce((a, b) => a + b, 0) / data.wind.length) * 3.6),
        description: data.descriptions[Math.floor(data.descriptions.length / 2)],
        icon: data.icons[Math.floor(data.icons.length / 2)],
        precipitation: Math.round(Math.max(...data.precip))
      }));

    const weatherData = {
      locationID,
      temperature: Math.round(current.main.temp),
      feelsLike: Math.round(current.main.feels_like),
      humidity: current.main.humidity,
      windSpeed: Math.round(current.wind.speed * 3.6), // m/s to km/h
      description: current.weather[0].description,
      icon: current.weather[0].icon,
      pressure: current.main.pressure,
      visibility: current.visibility,
      forecast,
      updatedAt: new Date()
    };

    // Save to DB (upsert)
    const weather = await Weather.findOneAndUpdate(
      { locationID },
      weatherData,
      { new: true, upsert: true }
    ).populate('locationID', 'city cityUrdu province provinceUrdu country countryUrdu latitude longitude');

    console.log(`[WEATHER] Real data saved: ${location.city} = ${weatherData.temperature}°C, ${weatherData.description}`);
    return weather;
  } catch (error) {
    console.error('[WEATHER] API fetch error:', error.response?.data?.message || error.message);
    // Return whatever cached data exists
    const cached = await Weather.findOne({ locationID }).populate('locationID');
    if (cached) {
      console.log('[WEATHER] Returning cached data');
      return cached;
    }
    return null;
  }
};

// Generate agricultural advisories based on weather
exports.generateAdvisories = (weather) => {
  const advisories = [];
  if (!weather) return advisories;

  const temp = weather.temperature;
  const humidity = weather.humidity;
  const windSpeed = weather.windSpeed;
  const desc = (weather.description || '').toLowerCase();

  if (temp <= 4) {
    advisories.push({
      type: 'frost',
      severity: 'high',
      message: `Frost expected tonight (${temp}°C): protect sensitive crops with covers or overhead irrigation`,
      messageUrdu: `آج رات پالا پڑنے کا امکان (${temp} ڈگری): حساس فصلوں کو ڈھانپیں یا اوپر سے پانی دیں`
    });
  }
  if (temp >= 42) {
    advisories.push({
      type: 'heat',
      severity: 'high',
      message: `Extreme heat alert (${temp}°C): increase irrigation frequency and provide shade for livestock`,
      messageUrdu: `شدید گرمی کا الرٹ (${temp} ڈگری): پانی زیادہ دیں اور مویشیوں کو سایہ فراہم کریں`
    });
  }
  if (temp >= 35 && temp < 42) {
    advisories.push({
      type: 'heat',
      severity: 'medium',
      message: `High temperature (${temp}°C): water crops early morning or late evening to reduce evaporation`,
      messageUrdu: `زیادہ درجہ حرارت (${temp} ڈگری): بخارات کم کرنے کے لیے صبح سویرے یا شام کو پانی دیں`
    });
  }
  if (humidity > 85) {
    advisories.push({
      type: 'humidity',
      severity: 'medium',
      message: `High humidity (${humidity}%): monitor crops for fungal diseases. Avoid overhead watering.`,
      messageUrdu: `زیادہ نمی (${humidity}%): فنگس کی بیماریوں کا خیال رکھیں۔ اوپر سے پانی نہ دیں`
    });
  }
  if (windSpeed > 40) {
    advisories.push({
      type: 'wind',
      severity: 'high',
      message: `Strong winds (${windSpeed} km/h): do not spray pesticides today. Secure greenhouse structures.`,
      messageUrdu: `تیز ہوائیں (${windSpeed} کلومیٹر): آج سپرے نہ کریں۔ گرین ہاؤس محفوظ کریں`
    });
  }
  if (desc.includes('rain') || desc.includes('drizzle') || desc.includes('shower')) {
    advisories.push({
      type: 'rain',
      severity: 'medium',
      message: 'Rain detected: delay pesticide spraying. Ensure field drainage channels are clear.',
      messageUrdu: 'بارش ہو رہی ہے: سپرے ملتوی کریں۔ کھیت کی نکاسی کی نالیاں صاف رکھیں'
    });
  }

  // Check forecast for upcoming weather
  if (weather.forecast && weather.forecast.length > 0) {
    const hasRainComing = weather.forecast.some(d => d.precipitation > 60);
    if (hasRainComing) {
      advisories.push({
        type: 'rain_forecast',
        severity: 'medium',
        message: 'Heavy rain expected in coming days: harvest ripe crops now and clear drainage channels',
        messageUrdu: 'آنے والے دنوں میں شدید بارش متوقع: پکی فصل ابھی کاٹ لیں اور نکاسی صاف رکھیں'
      });
    }
  }

  if (advisories.length === 0) {
    advisories.push({
      type: 'normal',
      severity: 'low',
      message: `Weather is favorable (${temp}°C, ${humidity}% humidity). Good conditions for farming activities.`,
      messageUrdu: `موسم سازگار ہے (${temp} ڈگری، ${humidity}% نمی)۔ کھیتی باڑی کی سرگرمیوں کے لیے اچھے حالات ہیں`
    });
  }

  return advisories;
};

// Mock weather for development without API key
async function createMockWeather(locationID, location) {
  const today = new Date();
  const forecast = [];
  for (let i = 0; i < 5; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    forecast.push({
      date,
      tempMin: 18 + Math.floor(Math.random() * 8),
      tempMax: 28 + Math.floor(Math.random() * 10),
      humidity: 40 + Math.floor(Math.random() * 40),
      windSpeed: 5 + Math.floor(Math.random() * 20),
      description: ['clear sky', 'few clouds', 'scattered clouds', 'light rain', 'sunny'][Math.floor(Math.random() * 5)],
      icon: ['01d', '02d', '03d', '10d', '01d'][Math.floor(Math.random() * 5)],
      precipitation: Math.floor(Math.random() * 60)
    });
  }

  const weatherData = {
    locationID,
    temperature: 25 + Math.floor(Math.random() * 10),
    feelsLike: 27 + Math.floor(Math.random() * 8),
    humidity: 55 + Math.floor(Math.random() * 30),
    windSpeed: 10 + Math.floor(Math.random() * 15),
    description: 'partly cloudy (mock)',
    icon: '02d',
    pressure: 1013,
    visibility: 10000,
    forecast,
    updatedAt: new Date()
  };

  const weather = await Weather.findOneAndUpdate(
    { locationID },
    weatherData,
    { new: true, upsert: true }
  ).populate('locationID', 'city cityUrdu province provinceUrdu country countryUrdu latitude longitude');

  return weather;
}
