export function Sidebar() {
  return (
    <aside className="w-14 bg-[#0c2e44] flex flex-col items-center py-3 shrink-0 text-white">
      {/* Expand icon */}
      <button className="p-2 hover:bg-white/10 rounded-md transition-colors mb-4" aria-label="Expand">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
        </svg>
      </button>

      {/* Home icon */}
      <button className="p-2 hover:bg-white/10 rounded-md transition-colors mb-2" aria-label="Home">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      </button>

      {/* Active app icon (snowflake-like) */}
      <button className="p-2 mt-4 text-[#0a8f8f]" aria-label="Purchase conditions">
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/>
          <circle cx="12" cy="12" r="2" fill="currentColor"/>
        </svg>
      </button>

      {/* Bottom: avatar */}
      <div className="mt-auto">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-300 to-orange-500 flex items-center justify-center text-xs font-semibold text-white">
          JD
        </div>
      </div>
    </aside>
  );
}
