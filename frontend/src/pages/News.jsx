import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { newsAPI } from '../services/api';
import { FiSearch, FiEye, FiCalendar, FiExternalLink, FiPlay } from 'react-icons/fi';

const categoryColors = {
  crop_prices: 'bg-green-100 text-green-700',
  government_policy: 'bg-blue-100 text-blue-700',
  pest_disease: 'bg-red-100 text-red-700',
  climate: 'bg-cyan-100 text-cyan-700',
  technology: 'bg-purple-100 text-purple-700',
  market_trends: 'bg-yellow-100 text-yellow-700',
  subsidies: 'bg-orange-100 text-orange-700'
};

export default function News() {
  const { t, i18n } = useTranslation();
  const isUrdu = i18n.language === 'ur';
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [expanded, setExpanded] = useState(null);

  const categories = [
    { key: '', label: t('news.allCategories') },
    { key: 'crop_prices', label: 'Crop Prices', labelUrdu: 'فصل کی قیمتیں' },
    { key: 'government_policy', label: 'Government Policy', labelUrdu: 'حکومتی پالیسی' },
    { key: 'pest_disease', label: 'Pest & Disease', labelUrdu: 'کیڑے اور بیماری' },
    { key: 'climate', label: 'Climate', labelUrdu: 'موسم' },
    { key: 'technology', label: 'Technology', labelUrdu: 'ٹیکنالوجی' },
    { key: 'market_trends', label: 'Market Trends', labelUrdu: 'مارکیٹ رجحانات' },
    { key: 'subsidies', label: 'Subsidies', labelUrdu: 'سبسڈی' }
  ];

  useEffect(() => {
    setLoading(true);
    const params = { page, limit: 12 };
    if (category) params.category = category;
    if (search) params.search = search;

    newsAPI.getAll(params)
      .then(res => {
        setArticles(res.data.data || []);
        setTotalPages(res.data.pages || 1);
      })
      .catch(() => setArticles([]))
      .finally(() => setLoading(false));
  }, [category, page, search]);

  const formatDate = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = Math.floor((now - d) / (1000 * 60 * 60));
    if (diff < 1) return isUrdu ? 'ابھی' : 'Just now';
    if (diff < 24) return isUrdu ? `${diff} گھنٹے پہلے` : `${diff}h ago`;
    const days = Math.floor(diff / 24);
    if (days < 7) return isUrdu ? `${days} دن پہلے` : `${days}d ago`;
    return d.toLocaleDateString(isUrdu ? 'ur-PK' : 'en-PK', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="space-y-5 animate-fade-in-up">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-7 text-white card-elevated">
        <div className="absolute top-0 right-0 rtl:left-0 rtl:right-auto w-44 sm:w-60 h-44 sm:h-60 bg-white/10 rounded-full -mr-16 sm:-mr-20 -mt-16 sm:-mt-20 blur-2xl" />
        <div className="relative flex items-start gap-3 sm:gap-4">
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 backdrop-blur rounded-xl sm:rounded-2xl flex items-center justify-center text-2xl sm:text-3xl shrink-0">📰</div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold truncate">{t('news.title')}</h1>
            <p className="text-purple-100 text-xs sm:text-sm mt-1 line-clamp-2">
              {isUrdu ? 'تازہ ترین زرعی خبریں' : 'Latest agriculture news & market insights'}
            </p>
            <div className="relative mt-3 sm:mt-4">
              <FiSearch className="absolute left-3.5 rtl:right-3.5 rtl:left-auto top-1/2 -translate-y-1/2 text-purple-500" size={15} />
              <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                className="w-full pl-10 rtl:pr-10 rtl:pl-4 pr-4 py-2.5 bg-white text-gray-800 rounded-xl text-sm focus:ring-4 focus:ring-white/30 outline-none placeholder:text-gray-400"
                placeholder={isUrdu ? 'خبریں تلاش کریں...' : 'Search news...'} />
            </div>
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 flex-nowrap md:flex-wrap">
        {categories.map(cat => (
          <button key={cat.key} onClick={() => { setCategory(cat.key); setPage(1); }}
            className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition ${
              category === cat.key
                ? 'bg-gray-900 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}>
            {isUrdu && cat.labelUrdu ? cat.labelUrdu : cat.label}
          </button>
        ))}
      </div>

      {/* Articles */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-2xl p-5 animate-pulse">
              <div className="flex gap-4">
                <div className="w-32 h-24 bg-gray-100 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-100 rounded w-24" />
                  <div className="h-4 bg-gray-100 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : articles.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl py-16 text-center">
          <div className="text-6xl mb-3">📰</div>
          <h3 className="font-bold text-gray-900">{t('news.noNews')}</h3>
          <p className="text-sm text-gray-500 mt-1">{isUrdu ? 'مختلف زمرہ یا تلاش آزمائیں' : 'Try a different category or search'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {articles.map(article => (
            <article key={article._id}
              className="group bg-white rounded-2xl border border-gray-100 overflow-hidden card-soft hover:card-elevated transition-all">
              <div className="flex flex-col sm:flex-row">
                {article.imageUrl && (
                  <div className="sm:w-52 sm:h-auto h-48 shrink-0 overflow-hidden">
                    <img src={article.imageUrl} alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => { e.target.style.display = 'none'; }} />
                  </div>
                )}
                <div className="flex-1 p-5">
                  <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                    {article.isBreaking && (
                      <span className="text-[10px] bg-red-500 text-white px-2 py-0.5 rounded-full font-bold animate-pulse">
                        🔴 {t('news.breaking')}
                      </span>
                    )}
                    {(article.isVideo || article.tags?.includes('video')) && (
                      <span className="text-[10px] bg-red-500 text-white px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                        <FiPlay size={8} /> VIDEO
                      </span>
                    )}
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${categoryColors[article.category] || 'bg-gray-100 text-gray-600'}`}>
                      {article.category?.replace(/_/g, ' ')}
                    </span>
                    <span className="text-[10.5px] text-gray-400 flex items-center gap-1">
                      <FiCalendar size={10} /> {formatDate(article.publishedAt)}
                    </span>
                  </div>

                  <h3 className="text-[15.5px] font-bold text-gray-900 mb-1.5 leading-snug cursor-pointer group-hover:text-indigo-700 transition-colors"
                    onClick={() => setExpanded(expanded === article._id ? null : article._id)}>
                    {isUrdu && article.titleUrdu ? article.titleUrdu : article.title}
                  </h3>

                  {article.summary && expanded !== article._id && (
                    <p className="text-[13px] text-gray-500 line-clamp-2 mb-3 leading-relaxed">{article.summary}</p>
                  )}

                  {expanded === article._id && (
                    <div className="text-[13px] text-gray-700 mb-3 leading-relaxed whitespace-pre-line bg-gray-50 rounded-xl p-3.5">
                      {isUrdu && article.contentUrdu ? article.contentUrdu : article.content}
                    </div>
                  )}

                  <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
                    <div className="flex items-center gap-3 text-[11.5px] text-gray-400">
                      {article.source && <span className="font-semibold text-gray-500">{article.source}</span>}
                      <span className="flex items-center gap-1"><FiEye size={11} /> {article.views}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {(article.videoUrl || article.isVideo || article.tags?.includes('video')) && (
                        <a href={article.videoUrl || article.sourceUrl} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-[11.5px] bg-red-50 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-100 transition font-semibold">
                          <FiPlay size={11} /> {isUrdu ? 'ویڈیو دیکھیں' : 'Watch'}
                        </a>
                      )}
                      {article.sourceUrl && !article.isVideo && !article.tags?.includes('video') && (
                        <a href={article.sourceUrl} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-[11.5px] bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition font-semibold">
                          <FiExternalLink size={11} /> {isUrdu ? 'مکمل پڑھیں' : 'Read full'}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-1.5 pt-4">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed">
                ← {isUrdu ? 'پچھلا' : 'Prev'}
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const p = page <= 3 ? i + 1 : page - 2 + i;
                if (p > totalPages) return null;
                return (
                  <button key={p} onClick={() => setPage(p)}
                    className={`w-9 h-9 rounded-xl text-xs font-semibold transition ${
                      page === p ? 'bg-indigo-600 text-white shadow' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                    }`}>
                    {p}
                  </button>
                );
              })}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed">
                {isUrdu ? 'اگلا' : 'Next'} →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
