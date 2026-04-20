import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { FiMail, FiArrowLeft, FiCheckCircle } from 'react-icons/fi';

export default function ForgotPassword() {
  const { t, i18n } = useTranslation();
  const isUrdu = i18n.language === 'ur';
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authAPI.forgotPassword(email);
      setSent(true);
      toast.success(t('auth.resetLinkSent'));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-5xl block mb-3">🌾</span>
          <h1 className="text-2xl font-bold text-gray-800">{t('app.name')}</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {sent ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiCheckCircle className="text-green-600" size={32} />
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                {isUrdu ? 'ای میل بھیج دی گئی!' : 'Email Sent!'}
              </h2>
              <p className="text-gray-500 text-sm mb-6">
                {isUrdu
                  ? `ہم نے ${email} پر پاس ورڈ ری سیٹ لنک بھیج دیا ہے۔ براہ کرم اپنا ان باکس چیک کریں۔`
                  : `We've sent a password reset link to ${email}. Please check your inbox.`}
              </p>
              <Link to="/login" className="inline-flex items-center gap-2 text-green-600 font-medium hover:underline">
                <FiArrowLeft size={16} /> {t('nav.login')}
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold text-gray-800 mb-2">{t('auth.forgotPassword')}</h2>
              <p className="text-gray-500 text-sm mb-6">
                {isUrdu
                  ? 'اپنا ای میل درج کریں اور ہم آپ کو پاس ورڈ ری سیٹ لنک بھیجیں گے'
                  : 'Enter your email and we\'ll send you a link to reset your password'}
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.email')}</label>
                  <div className="relative">
                    <FiMail className="absolute left-3 rtl:right-3 rtl:left-auto top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email" required value={email} onChange={e => setEmail(e.target.value)}
                      className="w-full pl-10 rtl:pr-10 rtl:pl-4 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                      placeholder="farmer@example.com"
                    />
                  </div>
                </div>
                <button type="submit" disabled={loading}
                  className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50 transition">
                  {loading ? t('common.loading') : (isUrdu ? 'ری سیٹ لنک بھیجیں' : 'Send Reset Link')}
                </button>
              </form>

              <div className="mt-6 text-center">
                <Link to="/login" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-green-600">
                  <FiArrowLeft size={14} /> {isUrdu ? 'لاگ ان پر واپس جائیں' : 'Back to Login'}
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
