import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { FiUsers, FiDatabase, FiDollarSign, FiFileText, FiBarChart2, FiSend, FiTrash2, FiToggleLeft, FiToggleRight } from 'react-icons/fi';

export default function AdminPanel() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('analytics');
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [broadcast, setBroadcast] = useState({ title: '', message: '' });

  const tabs = [
    { key: 'analytics', icon: FiBarChart2, label: t('admin.analytics') },
    { key: 'users', icon: FiUsers, label: t('admin.users') },
    { key: 'news', icon: FiFileText, label: t('admin.newsTab') },
    { key: 'broadcast', icon: FiSend, label: t('admin.broadcast') },
  ];

  useEffect(() => {
    if (activeTab === 'analytics') {
      adminAPI.getAnalytics().then(res => setAnalytics(res.data.data)).catch(() => {});
    } else if (activeTab === 'users') {
      setLoading(true);
      adminAPI.getUsers({ limit: 50 }).then(res => setUsers(res.data.data || [])).catch(() => {}).finally(() => setLoading(false));
    } else if (activeTab === 'news') {
      setLoading(true);
      adminAPI.getNews({ limit: 50 }).then(res => setNews(res.data.data || [])).catch(() => {}).finally(() => setLoading(false));
    }
  }, [activeTab]);

  const toggleUserStatus = async (id, isActive) => {
    try {
      await adminAPI.updateUserStatus(id, !isActive);
      setUsers(prev => prev.map(u => u._id === id ? { ...u, isActive: !isActive } : u));
      toast.success('User status updated');
    } catch { toast.error('Failed to update'); }
  };

  const deleteUser = async (id) => {
    if (!confirm('Are you sure?')) return;
    try {
      await adminAPI.deleteUser(id);
      setUsers(prev => prev.filter(u => u._id !== id));
      toast.success('User deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const deleteArticle = async (id) => {
    if (!confirm('Delete this article?')) return;
    try {
      await adminAPI.deleteNews(id);
      setNews(prev => prev.filter(n => n._id !== id));
      toast.success('Article deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const sendBroadcast = async () => {
    if (!broadcast.title || !broadcast.message) return toast.error('Fill all fields');
    try {
      const res = await adminAPI.broadcast(broadcast);
      toast.success(res.data.message);
      setBroadcast({ title: '', message: '' });
    } catch { toast.error('Failed to send broadcast'); }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-800">{t('admin.title')}</h1>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition ${
              activeTab === tab.key ? 'bg-green-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}>
            <tab.icon size={16} /> {tab.label}
          </button>
        ))}
      </div>

      {/* Analytics */}
      {activeTab === 'analytics' && analytics && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: t('admin.totalUsers'), value: analytics.totalUsers, color: 'blue' },
              { label: t('admin.activeFarmers'), value: analytics.totalFarmers, color: 'green' },
              { label: t('admin.totalCrops'), value: analytics.totalCrops, color: 'yellow' },
              { label: t('admin.publishedNews'), value: analytics.totalNews, color: 'purple' },
            ].map((stat, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Recent Users */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-semibold text-gray-800 mb-3">Recent Registrations</h3>
            <div className="space-y-2">
              {analytics.recentUsers?.map(u => (
                <div key={u._id} className="flex items-center justify-between py-2 border-b border-gray-50">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{u.fullName}</p>
                    <p className="text-xs text-gray-400">{u.email}</p>
                  </div>
                  <p className="text-xs text-gray-400">{new Date(u.createdAt).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Users */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-4 border-green-500 border-t-transparent"></div></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                  <tr>
                    <th className="px-4 py-3 text-left">{t('auth.fullName')}</th>
                    <th className="px-4 py-3 text-left">{t('auth.email')}</th>
                    <th className="px-4 py-3 text-center">Role</th>
                    <th className="px-4 py-3 text-center">{t('admin.status')}</th>
                    <th className="px-4 py-3 text-center">{t('admin.actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map(u => (
                    <tr key={u._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-800">{u.fullName}</td>
                      <td className="px-4 py-3 text-gray-500">{u.email || u.phone || '-'}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-xs px-2 py-1 rounded-full ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => toggleUserStatus(u._id, u.isActive)}
                          className={`text-lg ${u.isActive ? 'text-green-500' : 'text-gray-300'}`}>
                          {u.isActive ? <FiToggleRight size={24} /> : <FiToggleLeft size={24} />}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => deleteUser(u._id)} className="text-red-400 hover:text-red-600">
                          <FiTrash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* News Management */}
      {activeTab === 'news' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-4 border-green-500 border-t-transparent"></div></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                  <tr>
                    <th className="px-4 py-3 text-left">Title</th>
                    <th className="px-4 py-3 text-center">Category</th>
                    <th className="px-4 py-3 text-center">{t('admin.status')}</th>
                    <th className="px-4 py-3 text-center">Views</th>
                    <th className="px-4 py-3 text-center">{t('admin.actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {news.map(article => (
                    <tr key={article._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-800 max-w-xs truncate">{article.title}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{article.category?.replace('_', ' ')}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-xs px-2 py-1 rounded-full ${article.isPublished ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {article.isPublished ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-gray-500">{article.views}</td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => deleteArticle(article._id)} className="text-red-400 hover:text-red-600">
                          <FiTrash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Broadcast */}
      {activeTab === 'broadcast' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 max-w-lg">
          <h3 className="font-semibold text-gray-800 mb-4">{t('admin.sendBroadcast')}</h3>
          <div className="space-y-3">
            <input type="text" value={broadcast.title} onChange={e => setBroadcast({ ...broadcast, title: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-green-500 outline-none"
              placeholder={t('admin.broadcastTitle')} />
            <textarea value={broadcast.message} onChange={e => setBroadcast({ ...broadcast, message: e.target.value })}
              rows={4}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-green-500 outline-none resize-none"
              placeholder={t('admin.broadcastMessage')} />
            <button onClick={sendBroadcast}
              className="flex items-center gap-2 bg-green-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-green-700 transition">
              <FiSend size={16} /> {t('admin.sendBroadcast')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
