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
  const isUrdu = i18n.language === 'ur';

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

  const toggleLanguage = () => i18n.changeLanguage(isUrdu ? 'en' : 'ur');

  return (
    <nav className="app-navbar backdrop-blur-md border-b sticky top-0 z-30">
      <div className="px-2.5 sm:px-4 md:px-6 h-14 sm:h-16 md:h-[68px] flex items-center justify-between gap-1.5 sm:gap-3">
        {/* Left — burger + brand on mobile */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 min-w-0">
          <button
            onClick={onMenuClick}
            className="lg:hidden w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-600 shrink-0 transition"
            aria-label="Open menu"
          >
            <FiMenu size={19} />
          </button>
          <Link to="/dashboard" className="lg:hidden flex items-center gap-1.5 sm:gap-2 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center text-sm sm:text-base shadow-sm shrink-0">🌾</div>
            <span className="text-gray-900 font-bold text-sm sm:text-base truncate">{t('app.name')}</span>
          </Link>
        </div>

        {/* Center — search bar (desktop only) */}
        <button
          onClick={onSearchClick}
          className="hidden md:flex items-center gap-2 mx-auto bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-green-200 rounded-xl px-3 py-2 text-sm text-gray-500 transition w-full max-w-md"
          title="Search (Ctrl+K)"
        >
          <FiSearch size={15} />
          <span className="flex-1 text-left rtl:text-right">{isUrdu ? 'تلاش کریں...' : 'Search anything...'}</span>
          <kbd className="text-[10px] bg-white border border-gray-200 rounded px-1.5 py-0.5 font-semibold flex items-center gap-0.5 shrink-0">
            <FiCommand size={10} /> K
          </kbd>
        </button>

        {/* Right — actions */}
        <div className="flex items-center gap-0.5 sm:gap-1.5 shrink-0">
          {/* Search (mobile only) */}
          <button
            onClick={onSearchClick}
            className="md:hidden w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-600 transition"
            aria-label="Search"
          >
            <FiSearch size={18} />
          </button>

          {/* Dark Mode (≥sm) */}
          <button
            onClick={toggleDarkMode}
            className="hidden sm:flex w-10 h-10 items-center justify-center rounded-xl hover:bg-gray-100 text-gray-600 transition"
            title={darkMode ? 'Light Mode' : 'Dark Mode'}
            aria-label="Toggle theme"
          >
            {darkMode ? <FiSun size={18} /> : <FiMoon size={18} />}
          </button>

          {/* Language (≥sm) */}
          <button
            onClick={toggleLanguage}
            className="hidden sm:flex items-center gap-1.5 px-2.5 sm:px-3 h-10 text-[12px] sm:text-[13px] rounded-xl hover:bg-gray-100 text-gray-600 font-semibold transition"
            aria-label="Toggle language"
          >
            <FiGlobe size={15} />
            <span>{isUrdu ? 'EN' : 'اردو'}</span>
          </button>

          {user && (
            <>
              {/* Notifications */}
              <Link
                to="/notifications"
                className="relative w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-600 transition"
                aria-label="Notifications"
              >
                <FiBell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 sm:top-1.5 sm:right-1.5 min-w-[16px] h-[16px] sm:min-w-[18px] sm:h-[18px] px-1 bg-gradient-to-br from-red-500 to-rose-500 text-white text-[9px] sm:text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm border-2 border-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>

              <div className="hidden sm:block w-px h-6 bg-gray-200 mx-1" />

              {/* User menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-1.5 sm:gap-2 pl-1 pr-1.5 sm:pl-1.5 sm:pr-3 rtl:sm:pr-1.5 rtl:sm:pl-3 h-9 sm:h-10 rounded-xl hover:bg-gray-100 transition-colors"
                  aria-label="User menu"
                >
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-lg flex items-center justify-center font-bold text-xs sm:text-[13px] shadow-sm shrink-0">
                    {user.fullName?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="hidden md:inline text-[13px] font-semibold text-gray-800 max-w-[100px] lg:max-w-[140px] truncate">{user.fullName}</span>
                  <FiChevronDown size={14} className="hidden md:inline text-gray-500" />
                </button>

                {showUserMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                    <div className="absolute right-0 rtl:left-0 rtl:right-auto mt-2 w-60 sm:w-64 bg-white border border-gray-100 rounded-2xl card-floating py-2 z-50 animate-fade-in-up">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-900 truncate">{user.fullName}</p>
                        <p className="text-xs text-gray-500 truncate mt-0.5">{user.email || user.phone}</p>
                      </div>
                      <div className="py-1">
                        <Link
                          to="/profile"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-[13px] text-gray-700 hover:bg-gray-50 transition"
                        >
                          <FiUser size={15} className="text-gray-400" /> {t('nav.profile')}
                        </Link>
                        {/* Language toggle in menu (xs only — below sm breakpoint) */}
                        <button
                          onClick={() => { toggleLanguage(); setShowUserMenu(false); }}
                          className="sm:hidden flex items-center gap-3 w-full px-4 py-2.5 text-[13px] text-gray-700 hover:bg-gray-50 transition"
                        >
                          <FiGlobe size={15} className="text-gray-400" />
                          {isUrdu ? 'English' : 'اردو'}
                        </button>
                        {/* Theme toggle in menu (xs only) */}
                        <button
                          onClick={() => { toggleDarkMode(); setShowUserMenu(false); }}
                          className="sm:hidden flex items-center gap-3 w-full px-4 py-2.5 text-[13px] text-gray-700 hover:bg-gray-50 transition"
                        >
                          {darkMode ? <FiSun size={15} className="text-gray-400" /> : <FiMoon size={15} className="text-gray-400" />}
                          {darkMode ? 'Light Mode' : 'Dark Mode'}
                        </button>
                        <div className="my-1 h-px bg-gray-100" />
                        <button
                          onClick={() => { logout(); setShowUserMenu(false); }}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-[13px] text-red-600 hover:bg-red-50 transition"
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
