import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';
import Loader from '../../components/ui/Loader';
import {
  FiUsers, FiFileText, FiBarChart2, FiSend, FiTrash2, FiToggleLeft, FiToggleRight,
  FiAward, FiCreditCard, FiPlus, FiEdit2, FiSearch, FiX, FiChevronLeft, FiChevronRight,
  FiPackage, FiDollarSign, FiMapPin, FiRefreshCw, FiCheck
} from 'react-icons/fi';

const PAGE_SIZE = 20;

const errMsg = (e, fallback) => e.response?.data?.message || e.message || fallback;

// Sticky-header + sticky-footer modal that scrolls overflow content cleanly on small screens.
function Modal({ open, onClose, title, onSave, saving, children, size = 'lg' }) {
  if (!open) return null;
  const maxW = size === 'xl' ? 'max-w-3xl' : size === 'md' ? 'max-w-md' : 'max-w-2xl';
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in-up" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()}
        className={`bg-white w-full ${maxW} sm:rounded-2xl rounded-t-2xl flex flex-col max-h-[92vh] sm:max-h-[88vh]`}>
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white rounded-t-2xl z-10">
          <h3 className="font-bold text-gray-900">{title}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-gray-100 text-gray-500 flex items-center justify-center"><FiX size={18} /></button>
        </div>
        <div className="px-5 py-4 overflow-y-auto flex-1">{children}</div>
        <div className="px-5 py-3 border-t border-gray-100 flex gap-2 justify-end sticky bottom-0 bg-white">
          <button onClick={onClose} disabled={saving}
            className="px-4 py-2 text-sm text-gray-600 rounded-lg hover:bg-gray-100 disabled:opacity-50">Cancel</button>
          <button onClick={onSave} disabled={saving}
            className="flex items-center gap-2 px-5 py-2 text-sm bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed">
            {saving ? <><Loader inline /> Saving…</> : <><FiCheck size={15} /> Save</>}
          </button>
        </div>
      </div>
    </div>
  );
}

function Pager({ page, total, pageSize, onChange }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between gap-3 px-2 py-2.5 text-sm">
      <span className="text-gray-500 text-xs">
        Page {page} of {totalPages} · {total} total
      </span>
      <div className="flex gap-1.5">
        <button onClick={() => onChange(page - 1)} disabled={page <= 1}
          className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 flex items-center gap-1">
          <FiChevronLeft size={14} /> Prev
        </button>
        <button onClick={() => onChange(page + 1)} disabled={page >= totalPages}
          className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 flex items-center gap-1">
          Next <FiChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}

// Debounce hook for search inputs
function useDebounce(value, ms = 350) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

const inputCls = "w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none";

export default function AdminPanel() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('analytics');

  const tabs = [
    { key: 'analytics', icon: FiBarChart2, label: t('admin.analytics') },
    { key: 'users',     icon: FiUsers,     label: t('admin.users') },
    { key: 'news',      icon: FiFileText,  label: t('admin.newsTab') },
    { key: 'crops',     icon: FiPackage,   label: 'Crops' },
    { key: 'prices',    icon: FiDollarSign,label: 'Prices' },
    { key: 'locations', icon: FiMapPin,    label: 'Locations' },
    { key: 'subsidies', icon: FiAward,     label: 'Subsidies' },
    { key: 'loans',     icon: FiCreditCard,label: 'Loan Providers' },
    { key: 'broadcast', icon: FiSend,      label: t('admin.broadcast') }
  ];

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">{t('admin.title')}</h1>
      </div>

      {/* Scrollable tab bar */}
      <div className="bg-white border border-gray-100 rounded-xl card-soft overflow-x-auto">
        <div className="flex gap-1 p-1 min-w-max">
          {tabs.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-[13px] font-semibold transition shrink-0 ${
                activeTab === tab.key ? 'bg-green-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'
              }`}>
              <tab.icon size={15} /> {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'analytics' && <AnalyticsTab />}
      {activeTab === 'users' && <UsersTab />}
      {activeTab === 'news' && <NewsTab />}
      {activeTab === 'crops' && <CropsTab />}
      {activeTab === 'prices' && <PricesTab />}
      {activeTab === 'locations' && <LocationsTab />}
      {activeTab === 'subsidies' && <SubsidiesTab />}
      {activeTab === 'loans' && <LoansTab />}
      {activeTab === 'broadcast' && <BroadcastTab />}
    </div>
  );
}

// =================== ANALYTICS ===================
function AnalyticsTab() {
  const { t } = useTranslation();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    adminAPI.getAnalytics()
      .then(res => setAnalytics(res.data.data))
      .catch(e => toast.error(errMsg(e, 'Failed to load analytics')))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;
  if (!analytics) return <div className="text-center py-12 text-gray-500 text-sm">No analytics available.</div>;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: t('admin.totalUsers'), value: analytics.totalUsers, color: 'from-blue-500 to-cyan-500' },
          { label: t('admin.activeFarmers'), value: analytics.totalFarmers, color: 'from-green-500 to-emerald-500' },
          { label: t('admin.totalCrops'), value: analytics.totalCrops, color: 'from-amber-500 to-orange-500' },
          { label: t('admin.publishedNews'), value: analytics.totalNews, color: 'from-purple-500 to-pink-500' }
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 card-soft p-4 sm:p-5 relative overflow-hidden">
            <div className={`absolute -top-6 -right-6 w-20 h-20 bg-gradient-to-br ${s.color} opacity-20 rounded-full blur-2xl`} />
            <p className="text-xs sm:text-sm text-gray-500 truncate">{s.label}</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1">{s.value ?? 0}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 card-soft p-5">
        <h3 className="font-semibold text-gray-800 mb-3">Recent Registrations</h3>
        <div className="space-y-2">
          {analytics.recentUsers?.length ? analytics.recentUsers.map(u => (
            <div key={u._id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0 gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-800 truncate">{u.fullName}</p>
                <p className="text-xs text-gray-400 truncate">{u.email}</p>
              </div>
              <p className="text-xs text-gray-400 shrink-0">{new Date(u.createdAt).toLocaleDateString()}</p>
            </div>
          )) : <p className="text-sm text-gray-400 italic">No recent registrations</p>}
        </div>
      </div>
    </div>
  );
}

// =================== USERS ===================
function UsersTab() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [pendingId, setPendingId] = useState(null);
  const dq = useDebounce(search);

  const load = () => {
    setLoading(true);
    adminAPI.getUsers({ page, limit: PAGE_SIZE, search: dq || undefined })
      .then(res => { setUsers(res.data.data || []); setTotal(res.data.total || 0); })
      .catch(e => toast.error(errMsg(e, 'Failed to load users')))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, [page, dq]);
  useEffect(() => { setPage(1); }, [dq]);

  const toggleStatus = async (u) => {
    setPendingId(u._id);
    try {
      await adminAPI.updateUserStatus(u._id, !u.isActive);
      setUsers(prev => prev.map(x => x._id === u._id ? { ...x, isActive: !u.isActive } : x));
      toast.success('User status updated');
    } catch (e) { toast.error(errMsg(e, 'Failed to update')); }
    finally { setPendingId(null); }
  };

  const remove = async (id) => {
    if (!confirm('Delete this user permanently?')) return;
    setPendingId(id);
    try {
      await adminAPI.deleteUser(id);
      setUsers(prev => prev.filter(x => x._id !== id));
      setTotal(n => Math.max(0, n - 1));
      toast.success('User deleted');
    } catch (e) { toast.error(errMsg(e, 'Failed to delete')); }
    finally { setPendingId(null); }
  };

  return (
    <div className="space-y-3">
      <div className="bg-white rounded-xl border border-gray-100 p-3 flex items-center gap-2">
        <FiSearch className="text-gray-400 shrink-0 ml-1" size={16} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, email, phone…"
          className="flex-1 outline-none bg-transparent text-sm" />
        {search && <button onClick={() => setSearch('')} className="w-7 h-7 rounded hover:bg-gray-100 text-gray-400"><FiX size={14} /></button>}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 card-soft overflow-hidden">
        {loading ? <Loader /> : users.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">No users found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Email / Phone</th>
                  <th className="px-4 py-3 text-center">Role</th>
                  <th className="px-4 py-3 text-center">Active</th>
                  <th className="px-4 py-3 text-center w-24">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map(u => (
                  <tr key={u._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800 max-w-[180px] truncate">{u.fullName}</td>
                    <td className="px-4 py-3 text-gray-500 max-w-[220px] truncate">{u.email || u.phone || '—'}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-[11px] px-2 py-1 rounded-full font-semibold ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>{u.role}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => toggleStatus(u)} disabled={pendingId === u._id}
                        className={`${u.isActive ? 'text-green-500' : 'text-gray-300'} disabled:opacity-50`}>
                        {u.isActive ? <FiToggleRight size={24} /> : <FiToggleLeft size={24} />}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => remove(u._id)} disabled={pendingId === u._id}
                        className="text-red-400 hover:text-red-600 disabled:opacity-50"><FiTrash2 size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pager page={page} total={total} pageSize={PAGE_SIZE} onChange={setPage} />
      </div>
    </div>
  );
}

// =================== NEWS ===================
const NEWS_CATEGORIES = ['general', 'government_policy', 'climate', 'market_trends', 'pest_disease', 'technology', 'crops'];

function NewsTab() {
  const [news, setNews] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [pendingId, setPendingId] = useState(null);

  const load = () => {
    setLoading(true);
    adminAPI.getNews({ page, limit: PAGE_SIZE })
      .then(res => { setNews(res.data.data || []); setTotal(res.data.total || 0); })
      .catch(e => toast.error(errMsg(e, 'Failed to load news')))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, [page]);

  const blank = () => ({
    title: '', titleUrdu: '', summary: '', content: '', contentUrdu: '',
    category: 'general', source: '', isPublished: false, isBreaking: false
  });

  const save = async () => {
    if (!editing.title || !editing.content) return toast.error('Title and content are required');
    setSaving(true);
    try {
      if (editing._id) {
        const res = await adminAPI.updateNews(editing._id, editing);
        setNews(prev => prev.map(n => n._id === editing._id ? res.data.data : n));
        toast.success('Article updated');
      } else {
        const res = await adminAPI.createNews(editing);
        setNews(prev => [res.data.data, ...prev]);
        setTotal(n => n + 1);
        toast.success('Article created');
      }
      setEditing(null);
    } catch (e) { toast.error(errMsg(e, 'Save failed')); }
    finally { setSaving(false); }
  };

  const remove = async (id) => {
    if (!confirm('Delete this article?')) return;
    setPendingId(id);
    try {
      await adminAPI.deleteNews(id);
      setNews(prev => prev.filter(n => n._id !== id));
      setTotal(n => Math.max(0, n - 1));
      toast.success('Article deleted');
    } catch (e) { toast.error(errMsg(e, 'Failed to delete')); }
    finally { setPendingId(null); }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-sm text-gray-500">{total} articles</p>
        <button onClick={() => setEditing(blank())}
          className="flex items-center gap-1.5 bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-green-700">
          <FiPlus size={14} /> Add Article
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 card-soft overflow-hidden">
        {loading ? <Loader /> : news.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">No articles yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">Title</th>
                  <th className="px-4 py-3 text-center">Category</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-center">Views</th>
                  <th className="px-4 py-3 text-center w-28">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {news.map(a => (
                  <tr key={a._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800 max-w-[260px] truncate">{a.title}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-[11px] bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{a.category?.replace(/_/g, ' ')}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-[11px] px-2 py-1 rounded-full font-semibold ${a.isPublished ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {a.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-gray-500">{a.views || 0}</td>
                    <td className="px-4 py-3 text-center space-x-2">
                      <button onClick={() => setEditing(a)} className="text-blue-500 hover:text-blue-700"><FiEdit2 size={15} /></button>
                      <button onClick={() => remove(a._id)} disabled={pendingId === a._id}
                        className="text-red-400 hover:text-red-600 disabled:opacity-50"><FiTrash2 size={15} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pager page={page} total={total} pageSize={PAGE_SIZE} onChange={setPage} />
      </div>

      <Modal open={!!editing} onClose={() => !saving && setEditing(null)} saving={saving}
        title={editing?._id ? 'Edit Article' : 'Add Article'} onSave={save}>
        {editing && (
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input className={inputCls} placeholder="Title (English) *" value={editing.title}
                onChange={e => setEditing({ ...editing, title: e.target.value })} />
              <input className={inputCls} placeholder="Title (Urdu)" value={editing.titleUrdu || ''}
                onChange={e => setEditing({ ...editing, titleUrdu: e.target.value })} />
            </div>
            <textarea className={inputCls} rows={2} placeholder="Summary (1-line teaser)" value={editing.summary || ''}
              onChange={e => setEditing({ ...editing, summary: e.target.value })} />
            <textarea className={inputCls} rows={5} placeholder="Content (English) *" value={editing.content}
              onChange={e => setEditing({ ...editing, content: e.target.value })} />
            <textarea className={inputCls} rows={5} placeholder="Content (Urdu)" value={editing.contentUrdu || ''}
              onChange={e => setEditing({ ...editing, contentUrdu: e.target.value })} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <select className={inputCls} value={editing.category} onChange={e => setEditing({ ...editing, category: e.target.value })}>
                {NEWS_CATEGORIES.map(c => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}
              </select>
              <input className={inputCls} placeholder="Source (e.g. PMD, Bloomberg)" value={editing.source || ''}
                onChange={e => setEditing({ ...editing, source: e.target.value })} />
            </div>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={editing.isPublished} onChange={e => setEditing({ ...editing, isPublished: e.target.checked })} />
                Published (visible to users)
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={editing.isBreaking || false} onChange={e => setEditing({ ...editing, isBreaking: e.target.checked })} />
                🔴 Breaking news
              </label>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

// =================== CROPS ===================
function CropsTab() {
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [pendingId, setPendingId] = useState(null);
  const [search, setSearch] = useState('');
  const dq = useDebounce(search);

  const load = () => {
    setLoading(true);
    adminAPI.getCrops({ search: dq || undefined })
      .then(res => setCrops(res.data.data || []))
      .catch(e => toast.error(errMsg(e, 'Failed to load crops')))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, [dq]);

  const blank = () => ({ cropName: '', cropNameUrdu: '', category: 'grain', unit: 'Maund', description: '', descriptionUrdu: '', isActive: true });

  const save = async () => {
    if (!editing.cropName || !editing.category || !editing.unit) return toast.error('Name, category, unit required');
    setSaving(true);
    try {
      if (editing._id) {
        const res = await adminAPI.updateCrop(editing._id, editing);
        setCrops(prev => prev.map(c => c._id === editing._id ? res.data.data : c));
        toast.success('Crop updated');
      } else {
        const res = await adminAPI.createCrop(editing);
        setCrops(prev => [...prev, res.data.data]);
        toast.success('Crop created');
      }
      setEditing(null);
    } catch (e) { toast.error(errMsg(e, 'Save failed')); }
    finally { setSaving(false); }
  };

  const remove = async (id) => {
    if (!confirm('Delete this crop?')) return;
    setPendingId(id);
    try {
      await adminAPI.deleteCrop(id);
      setCrops(prev => prev.filter(c => c._id !== id));
      toast.success('Crop deleted');
    } catch (e) { toast.error(errMsg(e, 'Failed to delete')); }
    finally { setPendingId(null); }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-sm text-gray-500">{crops.length} crops</p>
        <button onClick={() => setEditing(blank())}
          className="flex items-center gap-1.5 bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-green-700">
          <FiPlus size={14} /> Add Crop
        </button>
      </div>
      <div className="bg-white rounded-xl border border-gray-100 p-3 flex items-center gap-2">
        <FiSearch className="text-gray-400 shrink-0 ml-1" size={16} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or category…"
          className="flex-1 outline-none bg-transparent text-sm" />
        {search && <button onClick={() => setSearch('')} className="w-7 h-7 rounded hover:bg-gray-100 text-gray-400"><FiX size={14} /></button>}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 card-soft overflow-hidden">
        {loading ? <Loader /> : crops.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">No crops found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Urdu</th>
                  <th className="px-4 py-3 text-center">Category</th>
                  <th className="px-4 py-3 text-center">Unit</th>
                  <th className="px-4 py-3 text-center">Active</th>
                  <th className="px-4 py-3 text-center w-24">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {crops.map(c => (
                  <tr key={c._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">{c.cropName}</td>
                    <td className="px-4 py-3 text-gray-600">{c.cropNameUrdu || '—'}</td>
                    <td className="px-4 py-3 text-center"><span className="text-[11px] bg-gray-100 px-2 py-1 rounded-full">{c.category}</span></td>
                    <td className="px-4 py-3 text-center text-xs">{c.unit}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-[11px] px-2 py-1 rounded-full font-semibold ${c.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {c.isActive ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center space-x-2">
                      <button onClick={() => setEditing(c)} className="text-blue-500 hover:text-blue-700"><FiEdit2 size={15} /></button>
                      <button onClick={() => remove(c._id)} disabled={pendingId === c._id}
                        className="text-red-400 hover:text-red-600 disabled:opacity-50"><FiTrash2 size={15} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={!!editing} onClose={() => !saving && setEditing(null)} saving={saving}
        title={editing?._id ? 'Edit Crop' : 'Add Crop'} onSave={save} size="lg">
        {editing && (
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input className={inputCls} placeholder="Crop name (English) *" value={editing.cropName}
                onChange={e => setEditing({ ...editing, cropName: e.target.value })} />
              <input className={inputCls} placeholder="نام (Urdu)" value={editing.cropNameUrdu || ''}
                onChange={e => setEditing({ ...editing, cropNameUrdu: e.target.value })} />
              <select className={inputCls} value={editing.category} onChange={e => setEditing({ ...editing, category: e.target.value })}>
                {['grain','vegetable','fruit','fiber','oilseed','spice','other'].map(c => <option key={c}>{c}</option>)}
              </select>
              <select className={inputCls} value={editing.unit} onChange={e => setEditing({ ...editing, unit: e.target.value })}>
                {['Maund','KG','Tonne','Bag','Bunch','Piece'].map(u => <option key={u}>{u}</option>)}
              </select>
            </div>
            <textarea className={inputCls} rows={2} placeholder="Description (English)" value={editing.description || ''}
              onChange={e => setEditing({ ...editing, description: e.target.value })} />
            <textarea className={inputCls} rows={2} placeholder="تفصیل (Urdu)" value={editing.descriptionUrdu || ''}
              onChange={e => setEditing({ ...editing, descriptionUrdu: e.target.value })} />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={editing.isActive} onChange={e => setEditing({ ...editing, isActive: e.target.checked })} />
              Active (visible to farmers)
            </label>
          </div>
        )}
      </Modal>
    </div>
  );
}

// =================== PRICES ===================
function PricesTab() {
  const [prices, setPrices] = useState([]);
  const [crops, setCrops] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [pendingId, setPendingId] = useState(null);
  const [filterType, setFilterType] = useState('');

  useEffect(() => {
    adminAPI.getCrops().then(r => setCrops(r.data.data || [])).catch(() => {});
  }, []);

  const load = () => {
    setLoading(true);
    adminAPI.getPrices({ page, limit: PAGE_SIZE, priceType: filterType || undefined })
      .then(res => { setPrices(res.data.data || []); setTotal(res.data.total || 0); })
      .catch(e => toast.error(errMsg(e, 'Failed to load prices')))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, [page, filterType]);

  const blank = () => ({ cropID: '', priceType: 'national', price: '', currency: 'PKR', msp: '', source: 'manual' });

  const save = async () => {
    if (!editing.cropID || !editing.priceType) return toast.error('Crop and type required');
    const priceNum = Number(editing.price);
    if (!isFinite(priceNum) || priceNum <= 0) return toast.error('Enter a valid positive price');
    setSaving(true);
    try {
      const payload = {
        ...editing,
        price: priceNum,
        msp: editing.msp ? Number(editing.msp) : null
      };
      if (editing._id) {
        const res = await adminAPI.updatePrice(editing._id, payload);
        setPrices(prev => prev.map(p => p._id === editing._id ? res.data.data : p));
        toast.success('Price updated');
      } else {
        const res = await adminAPI.createPrice(payload);
        load();
        toast.success('Price created');
      }
      setEditing(null);
    } catch (e) { toast.error(errMsg(e, 'Save failed')); }
    finally { setSaving(false); }
  };

  const remove = async (id) => {
    if (!confirm('Delete this price record?')) return;
    setPendingId(id);
    try {
      await adminAPI.deletePrice(id);
      setPrices(prev => prev.filter(p => p._id !== id));
      setTotal(n => Math.max(0, n - 1));
      toast.success('Price deleted');
    } catch (e) { toast.error(errMsg(e, 'Failed to delete')); }
    finally { setPendingId(null); }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <p className="text-sm text-gray-500">{total} records</p>
          <select value={filterType} onChange={e => { setPage(1); setFilterType(e.target.value); }}
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm">
            <option value="">All types</option>
            <option value="international">International</option>
            <option value="national">National</option>
            <option value="local">Local</option>
          </select>
        </div>
        <button onClick={() => setEditing(blank())}
          className="flex items-center gap-1.5 bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-green-700">
          <FiPlus size={14} /> Add Price
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 card-soft overflow-hidden">
        {loading ? <Loader /> : prices.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">No prices found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">Crop</th>
                  <th className="px-4 py-3 text-center">Type</th>
                  <th className="px-4 py-3 text-right">Price</th>
                  <th className="px-4 py-3 text-right">MSP</th>
                  <th className="px-4 py-3 text-left">Location</th>
                  <th className="px-4 py-3 text-center">Recorded</th>
                  <th className="px-4 py-3 text-center w-24">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {prices.map(p => (
                  <tr key={p._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">{p.cropID?.cropName || '—'}</td>
                    <td className="px-4 py-3 text-center"><span className="text-[11px] bg-gray-100 px-2 py-1 rounded-full">{p.priceType}</span></td>
                    <td className="px-4 py-3 text-right font-bold">{p.currency} {p.price?.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-gray-500 text-xs">{p.msp ? `PKR ${p.msp.toLocaleString()}` : '—'}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{p.locationID?.city || '—'}</td>
                    <td className="px-4 py-3 text-center text-xs text-gray-500">{new Date(p.recordedAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-center space-x-2">
                      <button onClick={() => setEditing({ ...p, cropID: p.cropID?._id || p.cropID })} className="text-blue-500 hover:text-blue-700"><FiEdit2 size={15} /></button>
                      <button onClick={() => remove(p._id)} disabled={pendingId === p._id}
                        className="text-red-400 hover:text-red-600 disabled:opacity-50"><FiTrash2 size={15} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pager page={page} total={total} pageSize={PAGE_SIZE} onChange={setPage} />
      </div>

      <Modal open={!!editing} onClose={() => !saving && setEditing(null)} saving={saving}
        title={editing?._id ? 'Edit Price' : 'Add Price'} onSave={save}>
        {editing && (
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <select className={inputCls} value={editing.cropID} onChange={e => setEditing({ ...editing, cropID: e.target.value })}>
                <option value="">— Select crop * —</option>
                {crops.map(c => <option key={c._id} value={c._id}>{c.cropName}</option>)}
              </select>
              <select className={inputCls} value={editing.priceType} onChange={e => setEditing({ ...editing, priceType: e.target.value })}>
                <option value="international">International (USD)</option>
                <option value="national">National (PKR)</option>
                <option value="local">Local Mandi (PKR)</option>
              </select>
              <input className={inputCls} type="number" min="0" step="any" placeholder="Price *" value={editing.price}
                onChange={e => setEditing({ ...editing, price: e.target.value })} />
              <select className={inputCls} value={editing.currency} onChange={e => setEditing({ ...editing, currency: e.target.value })}>
                <option>PKR</option><option>USD</option><option>EUR</option>
              </select>
              <input className={inputCls} type="number" min="0" step="any" placeholder="MSP (optional)" value={editing.msp || ''}
                onChange={e => setEditing({ ...editing, msp: e.target.value })} />
              <input className={inputCls} placeholder="Source (PBS, AMIS, manual…)" value={editing.source || ''}
                onChange={e => setEditing({ ...editing, source: e.target.value })} />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

// =================== LOCATIONS ===================
function LocationsTab() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [pendingId, setPendingId] = useState(null);
  const dq = useDebounce(search);

  const load = () => {
    setLoading(true);
    adminAPI.getLocations({ page, limit: PAGE_SIZE, search: dq || undefined })
      .then(res => { setItems(res.data.data || []); setTotal(res.data.total || 0); })
      .catch(e => toast.error(errMsg(e, 'Failed to load locations')))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, [page, dq]);
  useEffect(() => { setPage(1); }, [dq]);

  const save = async () => {
    if (!editing.city || !editing.province) return toast.error('City and province required');
    setSaving(true);
    try {
      const res = await adminAPI.updateLocation(editing._id, editing);
      setItems(prev => prev.map(l => l._id === editing._id ? res.data.data : l));
      toast.success('Location updated');
      setEditing(null);
    } catch (e) { toast.error(errMsg(e, 'Save failed')); }
    finally { setSaving(false); }
  };

  const remove = async (id) => {
    if (!confirm('Delete this location?')) return;
    setPendingId(id);
    try {
      await adminAPI.deleteLocation(id);
      setItems(prev => prev.filter(l => l._id !== id));
      setTotal(n => Math.max(0, n - 1));
      toast.success('Deleted');
    } catch (e) { toast.error(errMsg(e, 'Failed to delete')); }
    finally { setPendingId(null); }
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-500">{total} locations · use the seed scripts to bulk-add cities</p>
      <div className="bg-white rounded-xl border border-gray-100 p-3 flex items-center gap-2">
        <FiSearch className="text-gray-400 shrink-0 ml-1" size={16} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search city, district, province…"
          className="flex-1 outline-none bg-transparent text-sm" />
        {search && <button onClick={() => setSearch('')} className="w-7 h-7 rounded hover:bg-gray-100 text-gray-400"><FiX size={14} /></button>}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 card-soft overflow-hidden">
        {loading ? <Loader /> : items.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">No locations.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">City</th>
                  <th className="px-4 py-3 text-left">District</th>
                  <th className="px-4 py-3 text-left">Province</th>
                  <th className="px-4 py-3 text-center">Lat / Lng</th>
                  <th className="px-4 py-3 text-center w-24">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map(l => (
                  <tr key={l._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">{l.city} {l.cityUrdu && <span className="text-xs text-gray-400 ml-1">({l.cityUrdu})</span>}</td>
                    <td className="px-4 py-3 text-gray-600">{l.district || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{l.province}</td>
                    <td className="px-4 py-3 text-center text-xs text-gray-500">
                      {l.latitude && l.longitude ? `${l.latitude.toFixed(2)}, ${l.longitude.toFixed(2)}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-center space-x-2">
                      <button onClick={() => setEditing(l)} className="text-blue-500 hover:text-blue-700"><FiEdit2 size={15} /></button>
                      <button onClick={() => remove(l._id)} disabled={pendingId === l._id}
                        className="text-red-400 hover:text-red-600 disabled:opacity-50"><FiTrash2 size={15} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pager page={page} total={total} pageSize={PAGE_SIZE} onChange={setPage} />
      </div>

      <Modal open={!!editing} onClose={() => !saving && setEditing(null)} saving={saving}
        title="Edit Location" onSave={save}>
        {editing && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <input className={inputCls} placeholder="City *" value={editing.city || ''}
              onChange={e => setEditing({ ...editing, city: e.target.value })} />
            <input className={inputCls} placeholder="شہر" value={editing.cityUrdu || ''}
              onChange={e => setEditing({ ...editing, cityUrdu: e.target.value })} />
            <input className={inputCls} placeholder="District" value={editing.district || ''}
              onChange={e => setEditing({ ...editing, district: e.target.value })} />
            <input className={inputCls} placeholder="ضلع" value={editing.districtUrdu || ''}
              onChange={e => setEditing({ ...editing, districtUrdu: e.target.value })} />
            <input className={inputCls} placeholder="Province *" value={editing.province || ''}
              onChange={e => setEditing({ ...editing, province: e.target.value })} />
            <input className={inputCls} placeholder="صوبہ" value={editing.provinceUrdu || ''}
              onChange={e => setEditing({ ...editing, provinceUrdu: e.target.value })} />
            <input className={inputCls} type="number" step="any" placeholder="Latitude" value={editing.latitude ?? ''}
              onChange={e => setEditing({ ...editing, latitude: e.target.value === '' ? null : Number(e.target.value) })} />
            <input className={inputCls} type="number" step="any" placeholder="Longitude" value={editing.longitude ?? ''}
              onChange={e => setEditing({ ...editing, longitude: e.target.value === '' ? null : Number(e.target.value) })} />
          </div>
        )}
      </Modal>
    </div>
  );
}

// =================== SUBSIDIES ===================
function SubsidiesTab() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [pendingId, setPendingId] = useState(null);

  const load = () => {
    setLoading(true);
    adminAPI.getSubsidies()
      .then(res => setItems(res.data.data || []))
      .catch(e => toast.error(errMsg(e, 'Failed to load subsidies')))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const blank = () => ({
    schemeKey: '', name: '', nameUrdu: '', category: 'subsidy', provider: '',
    description: '', descriptionUrdu: '', benefits: '', benefitsUrdu: '',
    link: '', emoji: '📋', isActive: true,
    eligibility: { maxLandAcres: '', requiresCNIC: true, province: '', needsBISP: false }
  });

  const save = async ({ refreshVerification = false } = {}) => {
    if (!editing.schemeKey || !editing.name || !editing.link) return toast.error('Key, name and link are required');
    setSaving(true);
    const payload = {
      ...editing,
      eligibility: {
        ...editing.eligibility,
        maxLandAcres: editing.eligibility.maxLandAcres === '' ? null : Number(editing.eligibility.maxLandAcres),
        province: editing.eligibility.province || null
      },
      ...(refreshVerification && { refreshVerification: true })
    };
    try {
      if (editing._id) {
        const res = await adminAPI.updateSubsidy(editing._id, payload);
        setItems(prev => prev.map(s => s._id === editing._id ? res.data.data : s));
        toast.success(refreshVerification ? 'Updated and re-verified' : 'Subsidy updated');
      } else {
        const res = await adminAPI.createSubsidy(payload);
        setItems(prev => [...prev, res.data.data]);
        toast.success('Subsidy created');
      }
      setEditing(null);
    } catch (e) { toast.error(errMsg(e, 'Save failed')); }
    finally { setSaving(false); }
  };

  const remove = async (id) => {
    if (!confirm('Delete this subsidy?')) return;
    setPendingId(id);
    try {
      await adminAPI.deleteSubsidy(id);
      setItems(prev => prev.filter(s => s._id !== id));
      toast.success('Deleted');
    } catch (e) { toast.error(errMsg(e, 'Failed to delete')); }
    finally { setPendingId(null); }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-sm text-gray-500">{items.length} schemes</p>
        <button onClick={() => setEditing(blank())}
          className="flex items-center gap-1.5 bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-green-700">
          <FiPlus size={14} /> Add Scheme
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 card-soft overflow-hidden">
        {loading ? <Loader /> : items.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">No schemes yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-center">Category</th>
                  <th className="px-4 py-3 text-left">Provider</th>
                  <th className="px-4 py-3 text-center">Verified</th>
                  <th className="px-4 py-3 text-center">Active</th>
                  <th className="px-4 py-3 text-center w-24">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map(s => (
                  <tr key={s._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800 max-w-[240px] truncate"><span className="mr-2">{s.emoji}</span>{s.name}</td>
                    <td className="px-4 py-3 text-center"><span className="text-[11px] bg-gray-100 px-2 py-1 rounded-full">{s.category}</span></td>
                    <td className="px-4 py-3 text-gray-500 max-w-[180px] truncate">{s.provider}</td>
                    <td className="px-4 py-3 text-center text-xs text-gray-500">{s.lastVerifiedAt ? new Date(s.lastVerifiedAt).toLocaleDateString() : '—'}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-[11px] px-2 py-1 rounded-full font-semibold ${s.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {s.isActive ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center space-x-2">
                      <button onClick={() => setEditing(s)} className="text-blue-500 hover:text-blue-700"><FiEdit2 size={15} /></button>
                      <button onClick={() => remove(s._id)} disabled={pendingId === s._id}
                        className="text-red-400 hover:text-red-600 disabled:opacity-50"><FiTrash2 size={15} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={!!editing} onClose={() => !saving && setEditing(null)} saving={saving} size="xl"
        title={editing?._id ? 'Edit Scheme' : 'Add Scheme'} onSave={() => save()}>
        {editing && (
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input className={inputCls} placeholder="Scheme key * (kissan_card)" value={editing.schemeKey}
                onChange={e => setEditing({ ...editing, schemeKey: e.target.value })} disabled={!!editing._id} />
              <select className={inputCls} value={editing.category}
                onChange={e => setEditing({ ...editing, category: e.target.value })}>
                <option value="subsidy">Subsidy</option>
                <option value="loan">Loan</option>
                <option value="insurance">Insurance</option>
                <option value="scheme">Scheme</option>
              </select>
              <input className={inputCls} placeholder="Name (English) *" value={editing.name}
                onChange={e => setEditing({ ...editing, name: e.target.value })} />
              <input className={inputCls} placeholder="نام (Urdu)" value={editing.nameUrdu}
                onChange={e => setEditing({ ...editing, nameUrdu: e.target.value })} />
              <input className={inputCls} placeholder="Provider" value={editing.provider}
                onChange={e => setEditing({ ...editing, provider: e.target.value })} />
              <input className={inputCls} placeholder="Emoji 📋" value={editing.emoji}
                onChange={e => setEditing({ ...editing, emoji: e.target.value })} />
            </div>
            <textarea className={inputCls} rows={2} placeholder="Description (English)" value={editing.description}
              onChange={e => setEditing({ ...editing, description: e.target.value })} />
            <textarea className={inputCls} rows={2} placeholder="تفصیل (Urdu)" value={editing.descriptionUrdu}
              onChange={e => setEditing({ ...editing, descriptionUrdu: e.target.value })} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input className={inputCls} placeholder="Benefits" value={editing.benefits}
                onChange={e => setEditing({ ...editing, benefits: e.target.value })} />
              <input className={inputCls} placeholder="فوائد" value={editing.benefitsUrdu}
                onChange={e => setEditing({ ...editing, benefitsUrdu: e.target.value })} />
            </div>
            <input className={inputCls} placeholder="Official link (https://…) *" value={editing.link}
              onChange={e => setEditing({ ...editing, link: e.target.value })} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input className={inputCls} type="number" min="0" placeholder="Max land (acres)" value={editing.eligibility.maxLandAcres ?? ''}
                onChange={e => setEditing({ ...editing, eligibility: { ...editing.eligibility, maxLandAcres: e.target.value } })} />
              <select className={inputCls} value={editing.eligibility.province || ''}
                onChange={e => setEditing({ ...editing, eligibility: { ...editing.eligibility, province: e.target.value } })}>
                <option value="">Any province</option>
                <option>Punjab</option><option>Sindh</option><option>KPK</option><option>Balochistan</option>
              </select>
            </div>
            <div className="flex flex-wrap gap-4 pt-1">
              <label className="flex items-center gap-2"><input type="checkbox" checked={editing.eligibility.requiresCNIC}
                onChange={e => setEditing({ ...editing, eligibility: { ...editing.eligibility, requiresCNIC: e.target.checked } })} /> Requires CNIC</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={editing.eligibility.needsBISP}
                onChange={e => setEditing({ ...editing, eligibility: { ...editing.eligibility, needsBISP: e.target.checked } })} /> Needs BISP</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={editing.isActive}
                onChange={e => setEditing({ ...editing, isActive: e.target.checked })} /> Active</label>
            </div>
            {editing._id && (
              <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3 flex items-center justify-between gap-3">
                <p className="text-xs text-emerald-800">
                  Last verified: {editing.lastVerifiedAt ? new Date(editing.lastVerifiedAt).toLocaleDateString() : '—'}
                </p>
                <button onClick={() => save({ refreshVerification: true })} disabled={saving}
                  className="flex items-center gap-1.5 text-xs font-semibold bg-emerald-600 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-700 disabled:opacity-50">
                  <FiRefreshCw size={12} /> Save & re-verify now
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

// =================== LOAN PROVIDERS ===================
function LoansTab() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [pendingId, setPendingId] = useState(null);

  const load = () => {
    setLoading(true);
    adminAPI.getLoanProviders()
      .then(res => setItems(res.data.data || []))
      .catch(e => toast.error(errMsg(e, 'Failed to load providers')))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const blank = () => ({ providerKey: '', name: '', rate: 0, maxYears: 1, descriptionEn: '', descriptionUrdu: '', bankUrl: '', isActive: true });

  const save = async ({ refreshVerification = false } = {}) => {
    if (!editing.providerKey || !editing.name || !editing.descriptionEn) return toast.error('Key, name, description required');
    const rate = Number(editing.rate);
    const maxYears = Number(editing.maxYears);
    if (!isFinite(rate) || rate < 0 || rate > 50) return toast.error('Rate must be a number between 0 and 50');
    if (!isFinite(maxYears) || maxYears < 0.5) return toast.error('Max years must be at least 0.5');
    setSaving(true);
    const payload = { ...editing, rate, maxYears, ...(refreshVerification && { refreshVerification: true }) };
    try {
      if (editing._id) {
        const res = await adminAPI.updateLoanProvider(editing._id, payload);
        setItems(prev => prev.map(l => l._id === editing._id ? res.data.data : l));
        toast.success(refreshVerification ? 'Updated and re-verified' : 'Provider updated');
      } else {
        const res = await adminAPI.createLoanProvider(payload);
        setItems(prev => [...prev, res.data.data]);
        toast.success('Provider created');
      }
      setEditing(null);
    } catch (e) { toast.error(errMsg(e, 'Save failed')); }
    finally { setSaving(false); }
  };

  const remove = async (id) => {
    if (!confirm('Delete this loan provider?')) return;
    setPendingId(id);
    try {
      await adminAPI.deleteLoanProvider(id);
      setItems(prev => prev.filter(l => l._id !== id));
      toast.success('Deleted');
    } catch (e) { toast.error(errMsg(e, 'Failed to delete')); }
    finally { setPendingId(null); }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-sm text-gray-500">{items.length} providers</p>
        <button onClick={() => setEditing(blank())}
          className="flex items-center gap-1.5 bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-green-700">
          <FiPlus size={14} /> Add Provider
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 card-soft overflow-hidden">
        {loading ? <Loader /> : items.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">No providers yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">Provider</th>
                  <th className="px-4 py-3 text-center">Rate %</th>
                  <th className="px-4 py-3 text-center">Max Years</th>
                  <th className="px-4 py-3 text-center">Verified</th>
                  <th className="px-4 py-3 text-center">Active</th>
                  <th className="px-4 py-3 text-center w-24">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map(l => (
                  <tr key={l._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800 max-w-[200px] truncate">{l.name}</td>
                    <td className="px-4 py-3 text-center font-semibold">{l.rate}%</td>
                    <td className="px-4 py-3 text-center">{l.maxYears}</td>
                    <td className="px-4 py-3 text-center text-xs text-gray-500">{l.lastVerifiedAt ? new Date(l.lastVerifiedAt).toLocaleDateString() : '—'}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-[11px] px-2 py-1 rounded-full font-semibold ${l.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {l.isActive ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center space-x-2">
                      <button onClick={() => setEditing(l)} className="text-blue-500 hover:text-blue-700"><FiEdit2 size={15} /></button>
                      <button onClick={() => remove(l._id)} disabled={pendingId === l._id}
                        className="text-red-400 hover:text-red-600 disabled:opacity-50"><FiTrash2 size={15} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={!!editing} onClose={() => !saving && setEditing(null)} saving={saving}
        title={editing?._id ? 'Edit Provider' : 'Add Provider'} onSave={() => save()}>
        {editing && (
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input className={inputCls} placeholder="Provider key * (ztbl_short)" value={editing.providerKey}
                onChange={e => setEditing({ ...editing, providerKey: e.target.value })} disabled={!!editing._id} />
              <input className={inputCls} placeholder="Display name *" value={editing.name}
                onChange={e => setEditing({ ...editing, name: e.target.value })} />
              <input className={inputCls} type="number" min="0" max="50" step="0.1" placeholder="Rate % (0-50)" value={editing.rate}
                onChange={e => setEditing({ ...editing, rate: e.target.value })} />
              <input className={inputCls} type="number" min="0.5" step="0.5" placeholder="Max years" value={editing.maxYears}
                onChange={e => setEditing({ ...editing, maxYears: e.target.value })} />
            </div>
            <input className={inputCls} placeholder="Description (English) *" value={editing.descriptionEn}
              onChange={e => setEditing({ ...editing, descriptionEn: e.target.value })} />
            <input className={inputCls} placeholder="تفصیل" value={editing.descriptionUrdu}
              onChange={e => setEditing({ ...editing, descriptionUrdu: e.target.value })} />
            <input className={inputCls} placeholder="Bank URL (https://…)" value={editing.bankUrl}
              onChange={e => setEditing({ ...editing, bankUrl: e.target.value })} />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={editing.isActive} onChange={e => setEditing({ ...editing, isActive: e.target.checked })} />
              Active (visible in calculator)
            </label>
            {editing._id && (
              <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3 flex items-center justify-between gap-3">
                <p className="text-xs text-emerald-800">
                  Last verified: {editing.lastVerifiedAt ? new Date(editing.lastVerifiedAt).toLocaleDateString() : '—'}
                </p>
                <button onClick={() => save({ refreshVerification: true })} disabled={saving}
                  className="flex items-center gap-1.5 text-xs font-semibold bg-emerald-600 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-700 disabled:opacity-50">
                  <FiRefreshCw size={12} /> Save & re-verify now
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

// =================== BROADCAST ===================
function BroadcastTab() {
  const { t } = useTranslation();
  const [form, setForm] = useState({ title: '', message: '', type: 'broadcast' });
  const [sending, setSending] = useState(false);

  const send = async () => {
    if (!form.title.trim() || !form.message.trim()) return toast.error('Fill all fields');
    setSending(true);
    try {
      const res = await adminAPI.broadcast(form);
      toast.success(res.data.message);
      setForm({ title: '', message: '', type: 'broadcast' });
    } catch (e) { toast.error(errMsg(e, 'Failed to send broadcast')); }
    finally { setSending(false); }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 card-soft p-5 max-w-xl">
      <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><FiSend size={18} className="text-green-600" /> {t('admin.sendBroadcast')}</h3>
      <div className="space-y-3">
        <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
          className={inputCls} placeholder={t('admin.broadcastTitle')} />
        <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
          rows={4} className={`${inputCls} resize-none`} placeholder={t('admin.broadcastMessage')} />
        <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className={inputCls}>
          <option value="broadcast">📣 General Announcement</option>
          <option value="system">⚙️ System Update</option>
          <option value="alert">🚨 Important Alert</option>
        </select>
        <button onClick={send} disabled={sending}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-green-700 transition disabled:opacity-60">
          {sending ? <><Loader inline /> Sending…</> : <><FiSend size={16} /> {t('admin.sendBroadcast')}</>}
        </button>
      </div>
    </div>
  );
}
