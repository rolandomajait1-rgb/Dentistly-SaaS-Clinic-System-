// Custom toggle switch component
export function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`w-10 h-5.5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors duration-200 shrink-0 ${
        checked ? 'bg-primary' : 'bg-slate-200 dark:bg-[#2b3d3b]'
      }`}
    >
      <div
        className={`bg-white w-4.5 h-4.5 rounded-full shadow-xs transform transition-transform duration-200 ease-out ${
          checked ? 'translate-x-4.5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

// Custom dark mode form field component
export function FormField({ label, children, hint }) {
  return (
    <div className="space-y-1.5 font-sans">
      <label className="block text-[10px] font-extrabold text-on-surface-variant/70 dark:text-slate-400 uppercase tracking-widest leading-none">{label}</label>
      {children}
      {hint && <p className="text-[10.5px] text-on-surface-variant/50 dark:text-slate-500 font-semibold leading-relaxed">{hint}</p>}
    </div>
  );
}

// Custom dark mode input component
export function Input({ Icon, readOnly, mono, ...props }) {
  return (
    <div className="relative flex items-center">
      {Icon && (
        <span className="absolute left-3.5 text-on-surface-variant/40 dark:text-slate-500 pointer-events-none flex items-center justify-center">
          <Icon size={15} weight="bold" />
        </span>
      )}
      <input
        {...props}
        readOnly={readOnly}
        className={`w-full ${Icon ? 'pl-10' : 'px-3.5'} pr-3.5 py-2.5 border rounded-xl text-xs font-semibold transition-all duration-205 focus:outline-none ${
          readOnly
            ? 'bg-slate-100/80 dark:bg-[#101817] border-outline-variant/60 dark:border-[#1b2b29] text-on-surface-variant/60 dark:text-slate-500 cursor-not-allowed'
            : 'bg-white dark:bg-[#182625] border-outline-variant/75 dark:border-[#213533] text-on-surface dark:text-[#f2f0ed] placeholder-on-surface-variant/30 dark:placeholder-slate-600 focus:bg-slate-50/50 dark:focus:bg-[#131f1e] focus:border-primary focus:ring-2 focus:ring-primary/10'
        } ${mono ? 'font-mono text-[11px]' : ''}`}
      />
    </div>
  );
}

// Dark card section layout
export function SectionCard({ title, Icon, children, trailing }) {
  return (
    <div className="bg-white dark:bg-[#131f1e] border border-outline-variant/50 dark:border-[#1b2b29] rounded-3xl shadow-xs overflow-hidden transition-all duration-300 hover:border-primary/30 dark:hover:border-primary/20 hover:shadow-sm">
      <div className="px-6 py-4.5 border-b border-outline-variant/50 dark:border-[#1b2b29] bg-slate-50/40 dark:bg-[#182625] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {Icon && (
            <span className="text-on-surface-variant/70 dark:text-slate-400 flex items-center">
              <Icon size={18} weight="bold" />
            </span>
          )}
          <h3 className="font-extrabold text-xs tracking-wider text-on-surface dark:text-[#f2f0ed] uppercase font-sans">{title}</h3>
        </div>
        {trailing}
      </div>
      <div className="p-6 space-y-5.5">{children}</div>
    </div>
  );
}
