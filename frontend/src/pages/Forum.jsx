import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { forumAPI } from '../services/api';
import { Input, Select, Button, Card, Textarea } from '../components/ui/FormControls';
import { FiMessageSquare, FiPlus, FiArrowUp, FiCheckCircle, FiEye, FiClock, FiX, FiSearch, FiSend, FiChevronLeft } from 'react-icons/fi';
import toast from 'react-hot-toast';

const CATEGORIES = [
  { value: '', label: 'All', labelUr: 'تمام', emoji: '📋' },
  { value: 'disease_pest', label: 'Disease & Pest', labelUr: 'بیماری اور کیڑے', emoji: '🦠' },
  { value: 'irrigation', label: 'Irrigation', labelUr: 'آبپاشی', emoji: '💧' },
  { value: 'fertilizer', label: 'Fertilizer', labelUr: 'کھاد', emoji: '🧪' },
  { value: 'market', label: 'Market & Prices', labelUr: 'بازار', emoji: '💰' },
  { value: 'machinery', label: 'Machinery', labelUr: 'مشینری', emoji: '🚜' },
  { value: 'weather', label: 'Weather', labelUr: 'موسم', emoji: '🌤' },
  { value: 'general', label: 'General', labelUr: 'عمومی', emoji: '💬' }
];

export default function Forum() {
  const { i18n } = useTranslation();
  const isUrdu = i18n.language === 'ur';
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filters, setFilters] = useState({ category: '', search: '', sort: 'recent' });

  const [form, setForm] = useState({
    title: '', content: '', category: 'general', crop: '', tags: ''
  });
  const [commentText, setCommentText] = useState('');
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const load = async () => {
    setLoading(true);
    try {
      const res = await forumAPI.list(filters);
      setPosts(res.data.data || []);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [filters.category, filters.sort]);

  const loadPost = async (id) => {
    try {
      const res = await forumAPI.get(id);
      setSelectedPost(res.data.data);
    } catch (err) {
      toast.error('Failed to load');
    }
  };

  const handleSubmit = async () => {
    if (!form.title || !form.content) {
      toast.error(isUrdu ? 'عنوان اور تفصیل ضروری ہے' : 'Title and content required');
      return;
    }
    try {
      await forumAPI.create({
        ...form,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean)
      });
      toast.success(isUrdu ? 'سوال پوسٹ ہو گیا' : 'Question posted!');
      setShowForm(false);
      setForm({ title: '', content: '', category: 'general', crop: '', tags: '' });
      load();
    } catch { toast.error('Failed'); }
  };

  const handleUpvote = async (postId) => {
    try {
      const res = await forumAPI.upvote(postId);
      if (selectedPost) setSelectedPost({ ...selectedPost, upvotes: res.data.data.upvotes });
      load();
    } catch {}
  };

  const handleComment = async () => {
    if (!commentText.trim()) return;
    try {
      await forumAPI.comment(selectedPost._id, { content: commentText });
      setCommentText('');
      loadPost(selectedPost._id);
    } catch { toast.error('Failed'); }
  };

  const timeAgo = (date) => {
    const seconds = Math.floor((Date.now() - new Date(date)) / 1000);
    if (seconds < 60) return isUrdu ? 'ابھی' : 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} ${isUrdu ? 'منٹ پہلے' : 'min ago'}`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} ${isUrdu ? 'گھنٹے پہلے' : 'h ago'}`;
    return `${Math.floor(seconds / 86400)} ${isUrdu ? 'دن پہلے' : 'd ago'}`;
  };

  // Single post detail view
  if (selectedPost) {
    return (
      <div className="space-y-4 max-w-4xl mx-auto">
        <button onClick={() => setSelectedPost(null)} className="text-sm text-gray-500 hover:text-green-600 flex items-center gap-1">
          <FiChevronLeft size={16} /> {isUrdu ? 'واپس' : 'Back to forum'}
        </button>

        <Card>
          <div className="flex items-start gap-4 mb-4">
            <div className="flex flex-col items-center gap-1">
              <button onClick={() => handleUpvote(selectedPost._id)}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-green-100 hover:text-green-700 transition">
                <FiArrowUp size={18} />
              </button>
              <span className="font-bold text-gray-800">{selectedPost.upvotes}</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                  {CATEGORIES.find(c => c.value === selectedPost.category)?.emoji} {CATEGORIES.find(c => c.value === selectedPost.category)?.[isUrdu ? 'labelUr' : 'label']}
                </span>
                {selectedPost.isResolved && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <FiCheckCircle size={10} /> {isUrdu ? 'حل ہو گیا' : 'Resolved'}
                  </span>
                )}
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">{selectedPost.title}</h2>
              <p className="text-gray-700 whitespace-pre-line leading-relaxed mb-3">{selectedPost.content}</p>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>👤 {selectedPost.userName}</span>
                <span>🕐 {timeAgo(selectedPost.createdAt)}</span>
                <span>👁 {selectedPost.views}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Comments */}
        <Card title={`💬 ${selectedPost.comments?.length || 0} ${isUrdu ? 'جوابات' : 'Answers'}`}>
          {selectedPost.comments?.length > 0 ? (
            <div className="space-y-4">
              {selectedPost.comments.map((c, i) => (
                <div key={i} className="flex gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 bg-green-100 text-green-700 rounded-full flex items-center justify-center font-bold text-sm shrink-0">
                    {c.userName?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-800 text-sm">{c.userName}</span>
                      <span className="text-xs text-gray-400">{timeAgo(c.createdAt)}</span>
                    </div>
                    <p className="text-sm text-gray-700 whitespace-pre-line">{c.content}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-6">{isUrdu ? 'ابھی کوئی جواب نہیں' : 'No answers yet. Be the first!'}</p>
          )}

          <div className="mt-4 pt-4 border-t border-gray-100">
            <Textarea rows={3}
              value={commentText} onChange={(e) => setCommentText(e.target.value)}
              placeholder={isUrdu ? 'اپنا جواب لکھیں...' : 'Share your answer...'} />
            <Button icon={FiSend} onClick={handleComment} className="mt-2">
              {isUrdu ? 'جواب دیں' : 'Post Answer'}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Forum list view
  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-500 via-rose-500 to-red-500 rounded-2xl p-5 sm:p-6 text-white">
        <div className="flex items-center justify-between flex-wrap gap-3 sm:gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
              💬 <span className="truncate">{isUrdu ? 'کمیونٹی فورم' : 'Community Forum'}</span>
            </h1>
            <p className="text-pink-100 text-xs sm:text-sm mt-1 line-clamp-2">
              {isUrdu ? 'سوال پوچھیں اور ایک دوسرے کی مدد کریں' : 'Ask questions, share experiences, help each other'}
            </p>
          </div>
          <Button onClick={() => setShowForm(true)} icon={FiPlus} variant="outline" className="bg-white text-pink-600 border-white hover:bg-pink-50 text-xs sm:text-sm shrink-0">
            {isUrdu ? 'سوال' : 'Ask'}
          </Button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 flex-wrap">
        {CATEGORIES.map(c => (
          <button key={c.value || 'all'} onClick={() => setFilters({ ...filters, category: c.value })}
            className={`text-sm px-4 py-1.5 rounded-full transition ${
              filters.category === c.value ? 'bg-green-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-green-300'
            }`}>
            {c.emoji} {isUrdu ? c.labelUr : c.label}
          </button>
        ))}
      </div>

      {/* Sort + Search */}
      <div className="flex gap-2 sm:gap-3 flex-wrap">
        <Input icon={FiSearch} className="flex-1 min-w-full sm:min-w-[200px]"
          placeholder={isUrdu ? 'تلاش کریں...' : 'Search questions...'}
          value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          onKeyDown={(e) => e.key === 'Enter' && load()} />
        <Select value={filters.sort} onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
          options={[
            { value: 'recent', label: isUrdu ? 'تازہ ترین' : 'Recent' },
            { value: 'popular', label: isUrdu ? 'مقبول' : 'Popular' },
            { value: 'unresolved', label: isUrdu ? 'حل طلب' : 'Unresolved' }
          ]} />
      </div>

      {/* Posts List */}
      {loading ? (
        <div className="text-center py-16 text-gray-400">{isUrdu ? 'لوڈ ہو رہا ہے' : 'Loading...'}</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl text-gray-400">
          <FiMessageSquare className="mx-auto mb-3 text-gray-300" size={64} />
          <p>{isUrdu ? 'ابھی کوئی سوال نہیں۔ پہلا بنیں!' : 'No questions yet. Be the first to ask!'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map(p => (
            <div key={p._id} onClick={() => loadPost(p._id)}
              className="bg-white rounded-2xl border border-gray-100 hover:border-green-300 hover:shadow-md transition-all p-4 cursor-pointer">
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center gap-1 shrink-0">
                  <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-gray-50">
                    <span className="text-xl">{CATEGORIES.find(c => c.value === p.category)?.emoji}</span>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-gray-700 text-sm">{p.upvotes}</div>
                    <div className="text-[10px] text-gray-400">{isUrdu ? 'ووٹ' : 'votes'}</div>
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    {p.isPinned && <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">📌 Pinned</span>}
                    {p.isResolved && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">✓ Resolved</span>}
                    <span className="text-xs text-gray-400">{CATEGORIES.find(c => c.value === p.category)?.[isUrdu ? 'labelUr' : 'label']}</span>
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-1 truncate">{p.title}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-2">{p.content}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                    <span>👤 {p.userName}</span>
                    <span className="flex items-center gap-1"><FiClock size={11} /> {timeAgo(p.createdAt)}</span>
                    <span className="flex items-center gap-1"><FiEye size={11} /> {p.views}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Post Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowForm(false)}>
          <div onClick={e => e.stopPropagation()} className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 relative">
            <button onClick={() => setShowForm(false)} className="absolute top-4 right-4 rtl:left-4 rtl:right-auto text-gray-400">
              <FiX size={20} />
            </button>
            <h3 className="text-xl font-bold mb-4">{isUrdu ? 'سوال پوچھیں' : 'Ask a Question'}</h3>
            <div className="space-y-4">
              <Input label={isUrdu ? 'عنوان' : 'Title'} value={form.title} onChange={set('title')}
                placeholder={isUrdu ? 'مثلاً: گندم پر پیلی زنگ کا علاج؟' : 'e.g. How to treat stripe rust on wheat?'} />
              <Textarea label={isUrdu ? 'تفصیل' : 'Details'} rows={5} value={form.content} onChange={set('content')}
                placeholder={isUrdu ? 'اپنی صورتحال مکمل بیان کریں۔' : 'Describe your situation in detail. Include crop stage, symptoms, location, etc.'} />
              <Select label={isUrdu ? 'زمرہ' : 'Category'} value={form.category} onChange={set('category')}
                options={CATEGORIES.filter(c => c.value).map(c => ({ value: c.value, label: `${c.emoji} ${isUrdu ? c.labelUr : c.label}` }))} />
              <div className="grid grid-cols-2 gap-3">
                <Input label={isUrdu ? 'فصل (اختیاری)' : 'Crop (optional)'}
                  value={form.crop} onChange={set('crop')} placeholder="Wheat" />
                <Input label={isUrdu ? 'ٹیگز (کوما)' : 'Tags (comma)'}
                  value={form.tags} onChange={set('tags')} placeholder="rust, fungicide" />
              </div>
              <Button onClick={handleSubmit} className="w-full">{isUrdu ? 'سوال شائع کریں' : 'Post Question'}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
