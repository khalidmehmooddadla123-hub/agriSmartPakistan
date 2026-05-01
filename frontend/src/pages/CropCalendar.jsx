import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { calendarAPI } from '../services/api';
import { Card, StatBox } from '../components/ui/FormControls';
import { FiCalendar, FiClock, FiCheck, FiAlertCircle, FiArrowRight } from 'react-icons/fi';

export default function CropCalendar() {
  const { i18n } = useTranslation();
  const isUrdu = i18n.language === 'ur';
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('upcoming');

  useEffect(() => {
    setLoading(true);
    calendarAPI.list()
      .then(res => setEvents(res.data.data || []))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, []);

  const today = events.filter(e => e.isToday);
  const upcoming = events.filter(e => e.isUpcoming);
  const overdue = events.filter(e => e.isPast && !e.completed);
  const future = events.filter(e => !e.isPast && !e.isUpcoming && !e.isToday);

  const grouped = {
    today,
    upcoming: filter === 'upcoming' ? upcoming : (filter === 'overdue' ? overdue : future),
    overdue
  };

  const filteredEvents = filter === 'today' ? today
    : filter === 'overdue' ? overdue
    : filter === 'future' ? future
    : upcoming;

  const groupByDate = (list) => {
    const groups = {};
    list.forEach(e => {
      const dateKey = new Date(e.date).toLocaleDateString('en-CA');
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(e);
    });
    return groups;
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(d);
    target.setHours(0, 0, 0, 0);
    const diff = Math.floor((target - today) / 86400000);

    if (diff === 0) return isUrdu ? 'آج' : 'Today';
    if (diff === 1) return isUrdu ? 'کل' : 'Tomorrow';
    if (diff === -1) return isUrdu ? 'گزشتہ کل' : 'Yesterday';
    return d.toLocaleDateString(isUrdu ? 'ur-PK' : 'en-PK', {
      weekday: 'short', month: 'short', day: 'numeric'
    });
  };

  const filters = [
    { v: 'today', en: 'Today', ur: 'آج', count: today.length, color: 'bg-emerald-100 text-emerald-700' },
    { v: 'upcoming', en: 'Next 7 Days', ur: 'اگلے 7 دن', count: upcoming.length, color: 'bg-blue-100 text-blue-700' },
    { v: 'overdue', en: 'Overdue', ur: 'تاخیر شدہ', count: overdue.length, color: 'bg-red-100 text-red-700' },
    { v: 'future', en: 'Future', ur: 'بعد میں', count: future.length, color: 'bg-purple-100 text-purple-700' },
  ];

  return (
    <div className="space-y-4 sm:space-y-5 animate-fade-in-up">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-7 text-white card-elevated">
        <div className="absolute top-0 right-0 rtl:left-0 rtl:right-auto w-44 sm:w-60 h-44 sm:h-60 bg-white/10 rounded-full -mr-16 sm:-mr-20 -mt-16 sm:-mt-20 blur-2xl" />
        <div className="relative flex items-start gap-3 sm:gap-4">
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 backdrop-blur rounded-xl sm:rounded-2xl flex items-center justify-center text-2xl sm:text-3xl shrink-0">📅</div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold truncate">
              {isUrdu ? 'فصل کیلنڈر' : 'Crop Calendar'}
            </h1>
            <p className="text-amber-100 text-xs sm:text-sm mt-1">
              {isUrdu
                ? 'آپ کی فصلوں کے لیے پرسنلائزڈ شیڈول — یاد دہانیاں + ہر کام کا وقت'
                : 'Personalized schedule for all your crops — never miss irrigation, fertilizer, or harvest'}
            </p>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        <StatBox
          label={isUrdu ? 'آج' : 'Today'}
          value={today.length}
          color="green" icon={FiCheck}
        />
        <StatBox
          label={isUrdu ? 'اگلے 7 دن' : 'Next 7 Days'}
          value={upcoming.length}
          color="blue" icon={FiClock}
        />
        <StatBox
          label={isUrdu ? 'تاخیر' : 'Overdue'}
          value={overdue.length}
          color="red" icon={FiAlertCircle}
        />
        <StatBox
          label={isUrdu ? 'کل ایونٹس' : 'Total'}
          value={events.length}
          color="purple" icon={FiCalendar}
        />
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {filters.map(f => (
          <button key={f.v} onClick={() => setFilter(f.v)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
              filter === f.v
                ? 'bg-gray-900 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}>
            {isUrdu ? f.ur : f.en}
            {f.count > 0 && (
              <span className={`text-[10px] px-1.5 rounded-full ${
                filter === f.v ? 'bg-white/20' : f.color
              }`}>{f.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Events */}
      {loading ? (
        <div className="text-center py-16 text-gray-400">{isUrdu ? 'لوڈ ہو رہا ہے' : 'Loading...'}</div>
      ) : filteredEvents.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <div className="text-6xl mb-3">📅</div>
            <h3 className="font-bold text-gray-900 mb-1">
              {filter === 'today' && (isUrdu ? 'آج کوئی کام نہیں' : 'No tasks today')}
              {filter === 'upcoming' && (isUrdu ? 'اگلے 7 دن میں کچھ نہیں' : 'Nothing in the next 7 days')}
              {filter === 'overdue' && (isUrdu ? 'سب کام مکمل!' : 'All caught up!')}
              {filter === 'future' && (isUrdu ? 'مستقبل میں کچھ نہیں' : 'No future events')}
            </h3>
            <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
              {events.length === 0
                ? (isUrdu ? 'فارم پر فصل شامل کریں اور بجائی کی تاریخ سیٹ کریں — کیلنڈر خود بنے گا' : 'Add crops to your farms with sow dates — calendar auto-generates')
                : (isUrdu ? 'مختلف فلٹر آزمائیں' : 'Try a different filter')}
            </p>
            {events.length === 0 && (
              <Link to="/farms" className="inline-flex items-center gap-2 mt-4 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition">
                {isUrdu ? 'فارم پر جائیں' : 'Go to Farms'} <FiArrowRight size={13} className="rtl:rotate-180" />
              </Link>
            )}
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupByDate(filteredEvents)).map(([dateKey, items]) => (
            <Card key={dateKey} className={items[0].isPast ? 'border-l-4 border-l-red-500 rtl:border-l-0 rtl:border-r-4 rtl:border-r-red-500' : ''}>
              <div className="flex items-center gap-2 mb-3">
                <FiCalendar size={14} className={items[0].isToday ? 'text-emerald-600' : items[0].isPast ? 'text-red-500' : 'text-gray-400'} />
                <h3 className="font-bold text-gray-900 text-sm">
                  {formatDate(dateKey)}
                  {items[0].isToday && <span className="ml-2 rtl:mr-2 rtl:ml-0 text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">{isUrdu ? 'آج' : 'TODAY'}</span>}
                </h3>
              </div>
              <div className="space-y-2">
                {items.map((event, i) => (
                  <Link key={i} to={`/farms/${event.farmId}`}
                    className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-emerald-50 rounded-xl transition group">
                    <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center text-xl shrink-0">
                      {event.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 text-sm">
                        {isUrdu ? event.labelUrdu : event.label}
                      </h4>
                      <p className="text-xs text-gray-500 truncate">
                        🌾 {isUrdu && event.cropNameUrdu ? event.cropNameUrdu : event.cropName}
                        {event.variety ? ` (${event.variety})` : ''}
                        {' • '}
                        🚜 {event.farmName}
                      </p>
                    </div>
                    <FiArrowRight size={14} className="text-gray-300 group-hover:text-emerald-600 rtl:rotate-180 shrink-0" />
                  </Link>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Info card */}
      {events.length > 0 && (
        <Card className="bg-blue-50 border-blue-100">
          <div className="flex items-start gap-3">
            <div className="text-2xl">💡</div>
            <div>
              <h4 className="font-bold text-blue-900 text-sm mb-1">
                {isUrdu ? 'یاد دہانیاں خود بخود ملیں گی' : 'Auto-Reminders Enabled'}
              </h4>
              <p className="text-xs text-blue-800 leading-relaxed">
                {isUrdu
                  ? 'ہر اہم سرگرمی سے ایک دن پہلے آپ کو ای میل اور ان ایپ نوٹیفکیشن ملے گی۔ کاموں کو یاد رکھنے کی ضرورت نہیں!'
                  : 'You\'ll get email + in-app notifications 1 day before every milestone. No need to remember dates manually!'}
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
