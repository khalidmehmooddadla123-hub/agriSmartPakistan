import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  FiSearch, FiX, FiArrowRight, FiHome, FiDollarSign, FiCloud, FiSearch as FiZap,
  FiTool, FiShoppingCart, FiMessageSquare, FiBell, FiUser, FiPackage, FiCalendar,
  FiActivity, FiTruck, FiHelpCircle, FiMap, FiFileText, FiCreditCard, FiCommand, FiAlertCircle
} from 'react-icons/fi';

const ROUTES = [
  // Main
  { path: '/dashboard', icon: FiHome, en: 'Dashboard', ur: 'ڈیش بورڈ', cat: 'Main', keywords: 'home overview' },
  { path: '/prices', icon: FiDollarSign, en: 'Crop Prices', ur: 'فصل کی قیمتیں', cat: 'Main', keywords: 'mandi rates wheat rice' },
  { path: '/weather', icon: FiCloud, en: 'Weather Forecast', ur: 'موسم', cat: 'Main', keywords: '7 day forecast advisories' },
  { path: '/news', icon: FiFileText, en: 'Agriculture News', ur: 'زرعی خبریں', cat: 'Main', keywords: 'news articles' },
  { path: '/map', icon: FiMap, en: 'Interactive Map', ur: 'فصل کا نقشہ', cat: 'Main', keywords: 'pakistan locations' },

  // Farms
  { path: '/farms', icon: FiPackage, en: 'My Farms', ur: 'میرے فارم', cat: 'Farms', keywords: 'plots fields' },
  { path: '/calendar', icon: FiCalendar, en: 'Crop Calendar', ur: 'فصل کیلنڈر', cat: 'Farms', keywords: 'milestones reminders' },
  { path: '/soil-tests', icon: FiActivity, en: 'Soil Tests', ur: 'مٹی ٹیسٹ', cat: 'Farms', keywords: 'pH NPK health' },
  { path: '/crop-loss', icon: FiAlertCircle, en: 'Crop Loss Reports', ur: 'فصل کا نقصان', cat: 'Farms', keywords: 'damage insurance flood' },

  // AI
  { path: '/disease', icon: FiZap, en: 'Disease Scanner', ur: 'بیماری اسکینر', cat: 'AI', keywords: 'ai diagnosis chatbot' },
  { path: '/tools', icon: FiTool, en: 'Farm Tools', ur: 'ٹولز', cat: 'AI', keywords: 'calculators irrigation fertilizer' },
  { path: '/tools/identify', icon: FiZap, en: 'AI Crop Identifier', ur: 'AI فصل کی شناخت', cat: 'AI', keywords: 'identify plant photo' },
  { path: '/tools/loan', icon: FiDollarSign, en: 'Loan Calculator', ur: 'قرض کیلکولیٹر', cat: 'AI', keywords: 'emi interest ztbl hbl' },
  { path: '/tools/irrigation', icon: FiTool, en: 'Irrigation Calculator', ur: 'آبپاشی کیلکولیٹر', cat: 'AI', keywords: 'water need' },
  { path: '/tools/fertilizer', icon: FiTool, en: 'Fertilizer Calculator', ur: 'کھاد کیلکولیٹر', cat: 'AI', keywords: 'npk dap urea' },
  { path: '/tools/yield', icon: FiTool, en: 'Yield Predictor', ur: 'پیداوار', cat: 'AI', keywords: 'harvest revenue' },
  { path: '/tools/rotation', icon: FiTool, en: 'Crop Rotation', ur: 'فصل کی تبدیلی', cat: 'AI', keywords: 'soil health' },
  { path: '/tools/zakat', icon: FiTool, en: 'Zakat Calculator', ur: 'عشر کیلکولیٹر', cat: 'AI', keywords: 'islamic ushar' },

  // Business
  { path: '/expenses', icon: FiDollarSign, en: 'Expense Tracker', ur: 'اخراجات', cat: 'Business', keywords: 'profit cost money' },
  { path: '/marketplace', icon: FiShoppingCart, en: 'Marketplace', ur: 'بازار', cat: 'Business', keywords: 'sell crops buyers' },
  { path: '/equipment', icon: FiTruck, en: 'Equipment Rental', ur: 'مشینری کرایہ', cat: 'Business', keywords: 'tractor thresher rent' },
  { path: '/subsidies', icon: FiCreditCard, en: 'Subsidies & Schemes', ur: 'سبسڈیز', cat: 'Business', keywords: 'kissan card loan' },

  // Community
  { path: '/forum', icon: FiMessageSquare, en: 'Community Forum', ur: 'کمیونٹی', cat: 'Community', keywords: 'questions farmers' },
  { path: '/notifications', icon: FiBell, en: 'Notifications', ur: 'اطلاعات', cat: 'Community', keywords: 'alerts' },
  { path: '/help', icon: FiHelpCircle, en: 'Help & FAQ', ur: 'مدد', cat: 'Community', keywords: 'support faq' },

  // Account
  { path: '/profile', icon: FiUser, en: 'Profile Settings', ur: 'پروفائل', cat: 'Account', keywords: 'account password' },
];

export default function CommandPalette({ open, onClose }) {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const isUrdu = i18n.language === 'ur';
  const [query, setQuery] = useState('');
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setQuery('');
      setActiveIdx(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  // Cmd+K / Ctrl+K listener
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (open) onClose();
        else window.dispatchEvent(new CustomEvent('open-command-palette'));
      }
      if (e.key === 'Escape' && open) onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  const filtered = !query ? ROUTES : ROUTES.filter(r => {
    const q = query.toLowerCase();
    return r.en.toLowerCase().includes(q) ||
           r.ur.includes(query) ||
           r.keywords.toLowerCase().includes(q) ||
           r.cat.toLowerCase().includes(q);
  });

  const grouped = filtered.reduce((acc, r) => {
    if (!acc[r.cat]) acc[r.cat] = [];
    acc[r.cat].push(r);
    return acc;
  }, {});

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIdx(i => Math.min(i + 1, filtered.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIdx(i => Math.max(i - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const item = filtered[activeIdx];
        if (item) {
          navigate(item.path);
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, filtered, activeIdx, navigate, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[150] flex items-start justify-center pt-20 sm:pt-24 px-4 animate-fade-in-up"
      onClick={onClose}>
      <div onClick={e => e.stopPropagation()}
        className="bg-white rounded-2xl card-floating w-full max-w-xl max-h-[70vh] flex flex-col overflow-hidden">
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-100">
          <FiSearch className="text-gray-400 shrink-0" size={18} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => { setQuery(e.target.value); setActiveIdx(0); }}
            placeholder={isUrdu ? 'تلاش کریں...' : 'Search pages, tools, features...'}
            className="flex-1 outline-none text-sm bg-transparent"
          />
          <kbd className="hidden sm:flex text-[10px] bg-gray-100 text-gray-500 px-2 py-1 rounded font-semibold">ESC</kbd>
          <button onClick={onClose} className="sm:hidden text-gray-400 hover:text-gray-600">
            <FiX size={18} />
          </button>
        </div>

        {/* Results */}
        <div className="overflow-y-auto flex-1 py-2">
          {filtered.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="text-5xl mb-2">🔍</div>
              <p className="text-sm text-gray-500">{isUrdu ? 'کوئی نتیجہ نہیں' : 'No results found'}</p>
              <p className="text-xs text-gray-400 mt-1">{isUrdu ? 'مختلف الفاظ آزمائیں' : 'Try different keywords'}</p>
            </div>
          ) : (
            Object.entries(grouped).map(([cat, items]) => (
              <div key={cat} className="mb-2">
                <div className="px-4 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  {cat}
                </div>
                {items.map((item) => {
                  const globalIdx = filtered.indexOf(item);
                  const Icon = item.icon;
                  const isActive = globalIdx === activeIdx;
                  return (
                    <button
                      key={item.path}
                      onMouseEnter={() => setActiveIdx(globalIdx)}
                      onClick={() => { navigate(item.path); onClose(); }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left rtl:text-right transition ${
                        isActive ? 'bg-green-50 text-green-700' : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                        isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        <Icon size={15} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold truncate">{isUrdu ? item.ur : item.en}</div>
                        <div className="text-[10.5px] text-gray-400 truncate">{item.path}</div>
                      </div>
                      {isActive && <FiArrowRight size={14} className="text-green-600 rtl:rotate-180" />}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 px-4 py-2.5 flex items-center justify-between text-[10px] text-gray-400 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline">↑↓ {isUrdu ? 'حرکت' : 'Navigate'}</span>
            <span className="hidden sm:inline">↵ {isUrdu ? 'منتخب' : 'Select'}</span>
            <span>{filtered.length} {isUrdu ? 'نتیجے' : 'results'}</span>
          </div>
          <div className="flex items-center gap-1">
            <FiCommand size={10} />
            <span className="font-semibold">K</span>
          </div>
        </div>
      </div>
    </div>
  );
}
