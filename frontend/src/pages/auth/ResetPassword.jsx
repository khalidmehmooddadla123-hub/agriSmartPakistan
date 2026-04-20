import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { FiLock, FiCheckCircle } from 'react-icons/fi';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export default function ResetPassword() {
  const { t, i18n } = useTranslation();
  const isUrdu = i18n.language === 'ur';
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error(isUrdu ? 'پاس ورڈ مماثل نہیں ہیں' : 'Passwords do not match');
      return;
    }
    if (password.length < 8) {
      toast.error(isUrdu ? 'پاس ورڈ کم از کم 8 حروف کا ہونا چاہیے' : 'Password must be at least 8 characters');
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${API_BASE}/auth/reset-password/${token}`, { password });
      setSuccess(true);
      toast.success(t('auth.resetSuccess'));
    } catch (err) {
      toast.error(err.response?.data?.message || (isUrdu ? 'ری سیٹ ناکام — لنک ختم ہو چکا ہے' : 'Reset failed — link may be expired'));
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
          {success ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiCheckCircle className="text-green-600" size={32} />
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                {isUrdu ? 'پاس ورڈ تبدیل ہو گیا!' : 'Password Reset!'}
              </h2>
              <p className="text-gray-500 text-sm mb-6">
                {isUrdu
                  ? 'آپ کا پاس ورڈ کامیابی سے تبدیل ہو گیا ہے۔ اب آپ لاگ ان کر سکتے ہیں۔'
                  : 'Your password has been reset successfully. You can now log in with your new password.'}
              </p>
              <Link to="/login"
                className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition">
                {t('nav.login')}
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                {t('auth.resetPassword')}
              </h2>
              <p className="text-gray-500 text-sm mb-6">
                {isUrdu ? 'اپنا نیا پاس ورڈ درج کریں' : 'Enter your new password below'}
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('profile.newPassword')}</label>
                  <div className="relative">
                    <FiLock className="absolute left-3 rtl:right-3 rtl:left-auto top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="password" required value={password} onChange={e => setPassword(e.target.value)}
                      minLength={8}
                      className="w-full pl-10 rtl:pr-10 rtl:pl-4 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.confirmPassword')}</label>
                  <div className="relative">
                    <FiLock className="absolute left-3 rtl:right-3 rtl:left-auto top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                      minLength={8}
                      className="w-full pl-10 rtl:pr-10 rtl:pl-4 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
                <button type="submit" disabled={loading}
                  className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50 transition">
                  {loading ? t('common.loading') : t('auth.resetPassword')}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
