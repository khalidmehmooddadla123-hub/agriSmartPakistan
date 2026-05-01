import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import {
  FiHome, FiDollarSign, FiCloud, FiFileText, FiBell, FiUser, FiSettings,
  FiX, FiSearch, FiMap, FiTool, FiShoppingCart, FiMessageSquare, FiCreditCard, FiLogOut,
  FiCalendar, FiPackage, FiFile
} from 'react-icons/fi';

const navSections = [
  {
    title: 'Overview',
    titleUr: 'جائزہ',
    items: [
      { path: '/dashboard', icon: FiHome, labelKey: 'nav.dashboard' },
      { path: '/prices', icon: FiDollarSign, labelKey: 'nav.prices' },
      { path: '/weather', icon: FiCloud, labelKey: 'nav.weather' },
      { path: '/map', icon: FiMap, labelKey: 'nav.map' },
      { path: '/news', icon: FiFileText, labelKey: 'nav.news' },
    ]
  },
  {
    title: 'My Farms',
    titleUr: 'میرے فارم',
    items: [
      { path: '/farms', icon: FiPackage, labelKey: 'nav.farms' },
      { path: '/calendar', icon: FiCalendar, labelKey: 'nav.calendar' },
    ]
  },
  {
    title: 'Smart Tools',
    titleUr: 'ہوشیار ٹولز',
    items: [
      { path: '/disease', icon: FiSearch, labelKey: 'nav.disease' },
      { path: '/tools', icon: FiTool, labelKey: 'nav.tools' },
    ]
  },
  {
    title: 'Business',
    titleUr: 'کاروبار',
    items: [
      { path: '/expenses', icon: FiDollarSign, labelKey: 'nav.expenses' },
      { path: '/marketplace', icon: FiShoppingCart, labelKey: 'nav.marketplace' },
      { path: '/subsidies', icon: FiCreditCard, labelKey: 'nav.subsidies' },
    ]
  },
  {
    title: 'Community',
    titleUr: 'کمیونٹی',
    items: [
      { path: '/forum', icon: FiMessageSquare, labelKey: 'nav.forum' },
      { path: '/notifications', icon: FiBell, labelKey: 'nav.notifications' },
    ]
  },
];

export default function Sidebar({ open, onClose }) {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const isUrdu = i18n.language === 'ur';

  const linkClass = ({ isActive }) =>
    `group flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13.5px] font-medium transition-all ${
      isActive
        ? 'bg-green-50 text-green-700 shadow-sm'
        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
    }`;

  return (
    <>
      {open && <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40 lg:hidden animate-fade-in-up" onClick={onClose} />}

      <aside className={`fixed top-0 left-0 rtl:right-0 rtl:left-auto z-50 h-full w-[272px] max-w-[85vw] bg-white border-r rtl:border-l rtl:border-r-0 border-gray-100 transform transition-transform duration-300 flex flex-col ${
        open
          ? 'translate-x-0'
          : 'max-lg:-translate-x-full max-lg:rtl:translate-x-full lg:translate-x-0'
      }`}>
        {/* Brand Header */}
        <div className="h-[72px] flex items-center justify-between px-5 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center text-lg shadow-md shadow-green-200">
              🌾
            </div>
            <div>
              <h1 className="text-[15px] font-bold text-gray-900 leading-tight">{t('app.name')}</h1>
              <p className="text-[10.5px] text-gray-400 leading-tight">Smart Agriculture</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-500">
            <FiX size={18} />
          </button>
        </div>

        {/* Scrollable Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {navSections.map((section, si) => (
            <div key={si}>
              <h3 className="text-[10px] font-semibold uppercase tracking-[0.08em] text-gray-400 px-3.5 mb-1.5">
                {isUrdu ? section.titleUr : section.title}
              </h3>
              <div className="space-y-0.5">
                {section.items.map(({ path, icon: Icon, labelKey }) => (
                  <NavLink key={path} to={path} className={linkClass} onClick={onClose}>
                    {({ isActive }) => (
                      <>
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                          isActive ? 'bg-green-100 text-green-700' : 'bg-gray-50 text-gray-500 group-hover:bg-gray-100'
                        }`}>
                          <Icon size={16} />
                        </div>
                        <span className="flex-1 truncate">{t(labelKey)}</span>
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}

          {user?.role === 'admin' && (
            <div>
              <h3 className="text-[10px] font-semibold uppercase tracking-[0.08em] text-gray-400 px-3.5 mb-1.5">
                {isUrdu ? 'ایڈمن' : 'Admin'}
              </h3>
              <NavLink to="/admin" className={linkClass} onClick={onClose}>
                {({ isActive }) => (
                  <>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      isActive ? 'bg-green-100 text-green-700' : 'bg-gray-50 text-gray-500'
                    }`}>
                      <FiSettings size={16} />
                    </div>
                    <span>{t('nav.admin')}</span>
                  </>
                )}
              </NavLink>
            </div>
          )}
        </nav>

        {/* User footer */}
        {user && (
          <div className="p-3 border-t border-gray-100 shrink-0">
            <NavLink to="/profile" className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors group">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-xl flex items-center justify-center font-bold shrink-0 shadow-sm">
                {user.fullName?.[0]?.toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold text-gray-800 truncate">{user.fullName}</p>
                <p className="text-[11px] text-gray-400 truncate">{user.email || user.phone}</p>
              </div>
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); logout(); }}
                className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                title={t('nav.logout')}
              >
                <FiLogOut size={15} />
              </button>
            </NavLink>
          </div>
        )}
      </aside>
    </>
  );
}
