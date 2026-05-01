import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { useTheme } from '../../context/ThemeContext';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { notificationAPI } from '../../services/api';
import { FiBell, FiMenu, FiGlobe, FiLogOut, FiUser, FiSun, FiMoon, FiChevronDown, FiSearch, FiCommand } from 'react-icons/fi';

export default function Navbar({ onMenuClick, onSearchClick }) {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const { unreadCount: socketUnread, setCount } = useSocket();
  const { darkMode, toggleDarkMode } = useTheme();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    if (user) {
      notificationAPI.getAll({ limit: 1 })
        .then(res => {
          const count = res.data.unreadCount || 0;
          setUnreadCount(count);
          setCount(count);
        })
        .catch(() => {});
    }
  }, [user]);

  useEffect(() => setUnreadCount(socketUnread), [socketUnread]);

  const toggleLanguage = () => i18n.changeLanguage(i18n.language === 'en' ? 'ur' : 'en');

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-30">
      <div className="px-3 sm:px-4 md:px-6 h-16 md:h-[72px] flex items-center justify-between gap-2">
        {/* Left */}
        <div className="flex items-center gap-3">
          <button onClick={onMenuClick} className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-600">
            <FiMenu size={20} />
          </button>
          <Link to="/dashboard" className="lg:hidden flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center text-base shadow-sm">🌾</div>
            <span className="text-gray-900 font-bold">{t('app.name')}</span>
          </Link>
        </div>

        {/* Search button (desktop) */}
        <button
          onClick={onSearchClick}
          className="hidden md:flex items-center gap-2 mx-auto bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-500 transition w-full max-w-md"
          title="Search (Ctrl+K)"
        >
          <FiSearch size={15} />
          <span className="flex-1 text-left rtl:text-right">{i18n.language === 'ur' ? 'تلاش کریں...' : 'Search anything...'}</span>
          <kbd className="text-[10px] bg-white border border-gray-200 rounded px-1.5 py-0.5 font-semibold flex items-center gap-0.5">
            <FiCommand size={10} /> K
          </kbd>
        </button>

        {/* Right */}
        <div className="flex items-center gap-1.5">
          {/* Search button (mobile only) */}
          <button onClick={onSearchClick}
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-600">
            <FiSearch size={18} />
          </button>

          {/* Dark Mode */}
          <button
            onClick={toggleDarkMode}
            className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-600"
            title={darkMode ? 'Light Mode' : 'Dark Mode'}
          >
            {darkMode ? <FiSun size={18} /> : <FiMoon size={18} />}
          </button>

          {/* Language */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-2.5 sm:px-3.5 h-10 text-[12px] sm:text-[13px] rounded-xl hover:bg-gray-100 text-gray-600 font-semibold"
          >
            <FiGlobe size={15} />
            <span>{i18n.language === 'en' ? 'اردو' : 'EN'}</span>
          </button>

          {user && (
            <>
              {/* Notifications */}
              <Link to="/notifications" className="relative w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-600">
                <FiBell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm border-2 border-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>

              {/* Divider (hidden on mobile to save space) */}
              <div className="hidden sm:block w-px h-6 bg-gray-200 mx-1" />

              {/* User menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 pl-1.5 pr-3 rtl:pr-1.5 rtl:pl-3 h-10 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-lg flex items-center justify-center font-bold text-[13px] shadow-sm">
                    {user.fullName?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="hidden md:inline text-[13px] font-semibold text-gray-800 max-w-[120px] truncate">{user.fullName}</span>
                  <FiChevronDown size={14} className="hidden md:inline text-gray-500" />
                </button>

                {showUserMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                    <div className="absolute right-0 rtl:left-0 rtl:right-auto mt-2 w-56 bg-white border border-gray-100 rounded-2xl card-floating py-2 z-50 animate-fade-in-up">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-900 truncate">{user.fullName}</p>
                        <p className="text-xs text-gray-500 truncate mt-0.5">{user.email || user.phone}</p>
                      </div>
                      <div className="py-1">
                        <Link
                          to="/profile"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-3 px-4 py-2 text-[13px] text-gray-700 hover:bg-gray-50"
                        >
                          <FiUser size={15} className="text-gray-400" /> {t('nav.profile')}
                        </Link>
                        <button
                          onClick={() => { logout(); setShowUserMenu(false); }}
                          className="flex items-center gap-3 w-full px-4 py-2 text-[13px] text-red-600 hover:bg-red-50"
                        >
                          <FiLogOut size={15} /> {t('nav.logout')}
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
