import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiHome, FiArrowLeft } from 'react-icons/fi';

export default function NotFound() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md">
        <div className="mb-6">
          <span className="text-8xl font-bold text-green-600">404</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          {t('errors.pageNotFound', 'Page Not Found')}
        </h1>
        <p className="text-gray-500 mb-2">
          {t('errors.pageNotFoundUrdu', 'صفحہ نہیں ملا')}
        </p>
        <p className="text-gray-400 text-sm mb-8">
          {t('errors.pageNotFoundDesc', 'The page you are looking for does not exist or has been moved.')}
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition font-medium"
          >
            <FiHome size={18} />
            {t('nav.dashboard', 'Dashboard')}
          </Link>
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 bg-gray-200 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-300 transition font-medium"
          >
            <FiArrowLeft size={18} />
            {t('common.back', 'Go Back')}
          </button>
        </div>
      </div>
    </div>
  );
}
