import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

/**
 * Listens for the 'backend-waking' event fired by api.js when Render's
 * free-tier server is cold-booting. Shows a helpful toast so users know
 * to wait instead of thinking the app is broken.
 */
export default function ColdStartNotifier() {
  const { i18n } = useTranslation();
  const isUrdu = i18n.language === 'ur';

  useEffect(() => {
    const handler = () => {
      toast.loading(
        isUrdu
          ? 'سرور بیدار ہو رہا ہے، ایک لمحہ انتظار کریں...'
          : 'Server is waking up — please wait a moment...',
        {
          duration: 15000,
          position: 'top-center',
          style: {
            background: '#fef3c7',
            color: '#92400e',
            border: '1px solid #fde68a',
            fontSize: '13px',
            fontWeight: '600'
          },
          icon: '⏳'
        }
      );
    };

    window.addEventListener('backend-waking', handler);
    return () => window.removeEventListener('backend-waking', handler);
  }, [isUrdu]);

  return null;
}
