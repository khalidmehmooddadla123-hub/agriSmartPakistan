import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { notificationAPI } from '../services/api';
import { FiBell, FiCheck, FiDollarSign, FiCloud, FiFileText, FiRadio, FiInbox } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { SkeletonNotifications } from '../components/ui/Skeleton';

const typeConfig = {
  price_alert: { icon: FiDollarSign, color: 'bg-green-100 text-green-600', label: { en: 'Price Alert', ur: 'قیمت الرٹ' } },
  weather_alert: { icon: FiCloud, color: 'bg-blue-100 text-blue-600', label: { en: 'Weather', ur: 'موسم' } },
  news: { icon: FiFileText, color: 'bg-purple-100 text-purple-600', label: { en: 'News', ur: 'خبریں' } },
  broadcast: { icon: FiRadio, color: 'bg-amber-100 text-amber-600', label: { en: 'Broadcast', ur: 'نشریات' } },
  daily_digest: { icon: FiBell, color: 'bg-pink-100 text-pink-600', label: { en: 'Digest', ur: 'خلاصہ' } },
};

export default function Notifications() {
  const { t, i18n } = useTranslation();
  const isUrdu = i18n.language === 'ur';
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState('all');

  const fetchNotifications = () => {
    setLoading(true);
    notificationAPI.getAll({ limit: 50 })
      .then(res => {
        setNotifications(res.data.data || []);
        setUnreadCount(res.data.unreadCount || 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchNotifications(); }, []);

  const markRead = async (id) => {
    try {
      await notificationAPI.markRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {}
  };

  const markAllRead = async () => {
    try {
      await notificationAPI.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success(isUrdu ? 'سب پڑھا ہوا نشان لگا' : 'All marked as read');
    } catch {}
  };

  const timeAgo = (date) => {
    const s = Math.floor((Date.now() - new Date(date)) / 1000);
    if (s < 60) return isUrdu ? 'ابھی' : 'just now';
    if (s < 3600) return `${Math.floor(s / 60)} ${isUrdu ? 'منٹ پہلے' : 'min ago'}`;
    if (s < 86400) return `${Math.floor(s / 3600)} ${isUrdu ? 'گھنٹے پہلے' : 'h ago'}`;
    return `${Math.floor(s / 86400)} ${isUrdu ? 'دن پہلے' : 'd ago'}`;
  };

  const filtered = filter === 'all' ? notifications
    : filter === 'unread' ? notifications.filter(n => !n.isRead)
    : notifications.filter(n => n.type === filter);

  const filters = [
    { v: 'all', en: 'All', ur: 'تمام', count: notifications.length },
    { v: 'unread', en: 'Unread', ur: 'نہیں پڑھا', count: unreadCount },
    { v: 'price_alert', en: 'Prices', ur: 'قیمتیں' },
    { v: 'weather_alert', en: 'Weather', ur: 'موسم' },
    { v: 'broadcast', en: 'Broadcasts', ur: 'نشریات' },
  ];

  return (
    <div className="space-y-5 animate-fade-in-up max-w-3xl mx-auto">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-rose-500 via-pink-500 to-fuchsia-500 rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-7 text-white card-elevated">
        <div className="absolute top-0 right-0 rtl:left-0 rtl:right-auto w-40 sm:w-52 h-40 sm:h-52 bg-white/10 rounded-full -mr-16 sm:-mr-20 -mt-16 sm:-mt-20 blur-2xl" />
        <div className="relative flex items-center justify-between gap-3 sm:gap-4 flex-wrap">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="relative w-11 h-11 sm:w-12 sm:h-12 bg-white/20 backdrop-blur rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0">
              <FiBell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 rtl:-left-1 rtl:right-auto min-w-[18px] h-[18px] px-1 bg-yellow-300 text-red-700 text-[9px] font-bold rounded-full flex items-center justify-center shadow">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold truncate">{t('notifications.title')}</h1>
              <p className="text-pink-100 text-[11px] sm:text-xs mt-0.5">
                {unreadCount > 0
                  ? `${unreadCount} ${isUrdu ? 'نئی' : 'unread'}`
                  : (isUrdu ? 'سب پڑھی ہوئی' : 'All caught up!')}
              </p>
            </div>
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllRead}
              className="flex items-center gap-1.5 bg-white/20 backdrop-blur hover:bg-white/30 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-semibold transition border border-white/20 shrink-0">
              <FiCheck size={12} /> <span className="hidden sm:inline">{t('notifications.markAllRead')}</span><span className="sm:hidden">{isUrdu ? 'سب' : 'Read'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {filters.map(f => (
          <button key={f.v} onClick={() => setFilter(f.v)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
              filter === f.v
                ? 'bg-gray-900 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}>
            {isUrdu ? f.ur : f.en}
            {f.count !== undefined && f.count > 0 && (
              <span className={`text-[10px] px-1.5 rounded-full ${
                filter === f.v ? 'bg-white/20' : 'bg-gray-100'
              }`}>{f.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      {loading ? (
        <SkeletonNotifications />
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 py-16 text-center">
          <div className="text-6xl mb-3">📭</div>
          <h3 className="font-bold text-gray-900 mb-1">
            {filter === 'unread'
              ? (isUrdu ? 'سب پڑھی ہوئی!' : 'All caught up!')
              : t('notifications.noNotifications')}
          </h3>
          <p className="text-sm text-gray-500">
            {isUrdu ? 'ہمیں آپ کے لیے اپ ڈیٹس آئیں گی تو یہاں دکھائیں گے' : "We'll show updates here when they arrive"}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(notif => {
            const cfg = typeConfig[notif.type] || typeConfig.broadcast;
            const Icon = cfg.icon;
            return (
              <div key={notif._id}
                onClick={() => !notif.isRead && markRead(notif._id)}
                className={`group bg-white rounded-2xl p-4 transition-all cursor-pointer card-soft hover:card-elevated border ${
                  notif.isRead ? 'border-gray-100' : 'border-l-4 border-l-green-500 border-r-gray-100 border-y-gray-100 rtl:border-r-4 rtl:border-r-green-500 rtl:border-l-gray-100'
                }`}>
                <div className="flex items-start gap-3">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${cfg.color}`}>
                    <Icon size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        {isUrdu ? cfg.label.ur : cfg.label.en}
                      </span>
                      {!notif.isRead && <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />}
                    </div>
                    <h4 className={`text-sm ${notif.isRead ? 'font-medium text-gray-700' : 'font-bold text-gray-900'}`}>
                      {notif.title}
                    </h4>
                    <p className="text-[13px] text-gray-600 mt-0.5 leading-relaxed">{notif.message}</p>
                    <p className="text-[11px] text-gray-400 mt-1.5">{timeAgo(notif.createdAt)}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
