import { useTranslation } from 'react-i18next';

/**
 * Beautiful, branded loader. Three variants:
 *   <Loader />              — full-section centered loader (default)
 *   <Loader inline />       — inline spinner (use beside a button label)
 *   <Loader fullscreen />   — overlays the whole viewport
 */
export default function Loader({ inline, fullscreen, size = 'md', label, className = '' }) {
  const { i18n } = useTranslation();
  const isUrdu = i18n.language === 'ur';
  const text = label || (isUrdu ? 'لوڈ ہو رہا ہے…' : 'Loading…');

  const dot = (delay) => (
    <span
      className="block rounded-full bg-gradient-to-br from-emerald-500 to-green-600 animate-pulse"
      style={{
        width: size === 'sm' ? 6 : size === 'lg' ? 10 : 8,
        height: size === 'sm' ? 6 : size === 'lg' ? 10 : 8,
        animationDelay: `${delay}s`
      }}
    />
  );

  if (inline) {
    return (
      <span className={`inline-flex items-center gap-1.5 ${className}`}>
        {dot(0)}{dot(0.15)}{dot(0.3)}
      </span>
    );
  }

  const ring = (
    <div className="relative">
      {/* Outer pulse ring */}
      <span className="absolute inset-0 rounded-full bg-emerald-200 animate-pulse-ring" />
      <span className="absolute inset-0 rounded-full bg-emerald-200 animate-pulse-ring" style={{ animationDelay: '0.4s' }} />
      {/* Spinning ring */}
      <div
        className="relative rounded-full border-[3px] border-emerald-100 border-t-emerald-600 animate-spin"
        style={{
          width: size === 'sm' ? 32 : size === 'lg' ? 64 : 48,
          height: size === 'sm' ? 32 : size === 'lg' ? 64 : 48
        }}
      />
      {/* Center logo */}
      <span
        className="absolute inset-0 flex items-center justify-center"
        style={{ fontSize: size === 'sm' ? 12 : size === 'lg' ? 22 : 16 }}
      >
        🌾
      </span>
    </div>
  );

  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-[9990] flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-emerald-50/90 via-white/90 to-green-50/90 backdrop-blur-sm">
        {ring}
        <p className="text-sm font-medium text-emerald-700">{text}</p>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center gap-3 py-12 sm:py-16 ${className}`}>
      {ring}
      <p className="text-sm font-medium text-emerald-700/80">{text}</p>
    </div>
  );
}

/** Skeleton card — for content that's loading inline (lists, grids) */
export function SkeletonCard({ lines = 3, className = '' }) {
  return (
    <div className={`bg-white rounded-2xl border border-gray-100 p-5 ${className}`}>
      <div className="h-4 w-1/3 skeleton-shimmer rounded mb-3" />
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="h-3 skeleton-shimmer rounded mb-2" style={{ width: `${100 - i * 12}%` }} />
      ))}
    </div>
  );
}

/** Skeleton grid — for dashboards / lists */
export function SkeletonGrid({ count = 6, columns = 3 }) {
  return (
    <div className={`grid gap-4 grid-cols-1 sm:grid-cols-2 ${columns >= 3 ? 'lg:grid-cols-3' : ''} ${columns >= 4 ? 'xl:grid-cols-4' : ''}`}>
      {Array.from({ length: count }).map((_, i) => <SkeletonCard key={i} />)}
    </div>
  );
}
