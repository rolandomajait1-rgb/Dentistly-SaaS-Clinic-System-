import { motion, AnimatePresence } from 'framer-motion';
import { Warning, SignOut, Trash, Question, Check } from '@phosphor-icons/react';

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  type = 'warning', // 'danger' | 'warning' | 'info' | 'success'
}) {
  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          iconBg: 'bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400 border-rose-500/20',
          btnBg: 'bg-rose-600 hover:bg-rose-700 text-white dark:bg-rose-550 dark:hover:bg-rose-600 shadow-rose-600/10',
          Icon: Trash,
        };
      case 'success':
        return {
          iconBg: 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-500/20',
          btnBg: 'bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-550 dark:hover:bg-emerald-600 shadow-emerald-600/10',
          Icon: Check,
        };
      case 'info':
        return {
          iconBg: 'bg-teal-500/10 text-teal-600 dark:bg-teal-500/20 dark:text-teal-400 border-teal-500/20',
          btnBg: 'bg-teal-600 hover:bg-teal-700 text-white dark:bg-teal-550 dark:hover:bg-teal-600 shadow-teal-600/10',
          Icon: Question,
        };
      case 'warning':
      default:
        return {
          iconBg: 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 border-amber-500/20',
          btnBg: 'bg-amber-600 hover:bg-amber-700 text-white dark:bg-amber-550 dark:hover:bg-amber-600 shadow-amber-600/10',
          Icon: Warning,
        };
    }
  };

  const { iconBg, btnBg, Icon } = getTypeStyles();

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCancel}
          className="absolute inset-0 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm"
        />

        {/* Modal panel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 8 }}
          transition={{ type: 'spring', duration: 0.35, bounce: 0.15 }}
          className="relative w-full max-w-sm bg-white dark:bg-[#131f1e] border border-outline-variant/60 dark:border-[#1b2b29] rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center overflow-hidden z-10"
        >
          {/* Top visual accent pattern */}
          <div className="absolute top-0 inset-x-0 h-1 bg-linear-to-r from-transparent via-primary/30 to-transparent" />

          {/* Icon Badge */}
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 mb-4 shrink-0 shadow-3xs ${iconBg}`}>
            <Icon size={26} weight="duotone" />
          </div>

          {/* Heading */}
          <h3 className="text-base font-extrabold text-slate-850 dark:text-slate-100 font-sans tracking-tight">
            {title}
          </h3>

          {/* Message description */}
          <p className="text-xs text-on-surface-variant/75 dark:text-slate-400 mt-2 font-semibold font-sans leading-relaxed max-w-[280px]">
            {message}
          </p>

          {/* Actions */}
          <div className="flex gap-2.5 w-full mt-6">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-2.5 border border-outline-variant/80 hover:bg-slate-50 dark:hover:bg-[#182625] text-xs font-extrabold text-on-surface-variant dark:text-slate-350 rounded-xl transition-all duration-200 cursor-pointer shadow-3xs font-sans"
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all duration-205 cursor-pointer shadow-3xs font-sans ${btnBg}`}
            >
              {confirmText}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
