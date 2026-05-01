/**
 * Branded preload screen shown for the first ~700ms while fonts and assets
 * are still settling, before the BismillahIntro takes over.
 * Pure-CSS animation — no JS heavy lifting.
 */
export default function PreloadScreen() {
  return (
    <div
      className="fixed inset-0 z-[10001] flex flex-col items-center justify-center overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #064e3b 0%, #047857 35%, #0d9488 70%, #14b8a6 100%)',
        backgroundSize: '200% 200%',
        animation: 'gradientShift 8s ease infinite'
      }}
    >
      {/* Soft floating glow orbs */}
      <div className="absolute top-1/4 -left-20 w-72 h-72 sm:w-96 sm:h-96 bg-emerald-300/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 -right-20 w-72 h-72 sm:w-96 sm:h-96 bg-yellow-300/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }} />

      <div className="relative flex flex-col items-center text-center px-6">
        {/* Pulse rings + logo */}
        <div className="relative mb-5 sm:mb-7">
          <span className="absolute inset-0 rounded-full bg-white/30 animate-pulse-ring" />
          <span className="absolute inset-0 rounded-full bg-white/20 animate-pulse-ring" style={{ animationDelay: '0.4s' }} />
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 bg-white rounded-full flex items-center justify-center text-4xl sm:text-5xl shadow-2xl">
            🌾
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight animate-fade-in">
          AgriSmart<span className="text-yellow-300">360</span>
        </h1>

        {/* Spinner dots */}
        <div className="flex items-center gap-1.5 mt-5 sm:mt-6">
          <span className="w-2 h-2 rounded-full bg-yellow-300 animate-pulse" />
          <span className="w-2 h-2 rounded-full bg-yellow-300/80 animate-pulse" style={{ animationDelay: '0.2s' }} />
          <span className="w-2 h-2 rounded-full bg-yellow-300/60 animate-pulse" style={{ animationDelay: '0.4s' }} />
        </div>

        <p className="mt-3 text-emerald-100/80 text-xs sm:text-sm font-medium tracking-wide animate-fade-in" style={{ animationDelay: '0.3s' }}>
          Loading your experience…
        </p>
      </div>
    </div>
  );
}
