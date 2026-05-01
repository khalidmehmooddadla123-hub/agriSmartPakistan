import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiHome, FiDollarSign, FiTool, FiShoppingCart, FiGrid } from 'react-icons/fi';

const ITEMS = [
  { path: '/dashboard', icon: FiHome, en: 'Home', ur: 'ہوم' },
  { path: '/prices', icon: FiDollarSign, en: 'Prices', ur: 'قیمت' },
  { path: '/tools', icon: FiTool, en: 'Tools', ur: 'ٹولز' },
  { path: '/marketplace', icon: FiShoppingCart, en: 'Market', ur: 'بازار' },
];

export default function BottomNav({ onMoreClick }) {
  const { i18n } = useTranslation();
  const isUrdu = i18n.language === 'ur';
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-30 lg:hidden card-soft">
      <div className="grid grid-cols-5 h-16">
        {ITEMS.map(({ path, icon: Icon, en, ur }) => {
          const isActive = location.pathname === path || location.pathname.startsWith(path + '/');
          return (
            <NavLink key={path} to={path}
              className={`flex flex-col items-center justify-center gap-0.5 transition-all relative ${
                isActive ? 'text-green-600' : 'text-gray-500 active:text-green-700'
              }`}>
              {isActive && <span className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-0.5 bg-green-600 rounded-b-full" />}
              <Icon size={20} className={isActive ? 'scale-110' : ''} />
              <span className="text-[10px] font-semibold">{isUrdu ? ur : en}</span>
            </NavLink>
          );
        })}
        {/* "More" — opens sidebar drawer */}
        <button onClick={onMoreClick}
          className="flex flex-col items-center justify-center gap-0.5 text-gray-500 active:text-green-700">
          <FiGrid size={20} />
          <span className="text-[10px] font-semibold">{isUrdu ? 'مزید' : 'More'}</span>
        </button>
      </div>
      {/* Safe area for iPhone notch */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}
