import React from 'react';

const colors = {
  VERIFIED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  FLAGGED: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
  CHALLENGED: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  PENDING: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
  HELD: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
  RELEASED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  REFUNDED: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  VALID: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  CONSISTENT: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  TAMPERED: 'bg-red-500/10 text-red-400 border-red-500/30',
  SUSPICIOUS: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  MISMATCH: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
  WARNING: 'bg-amber-500/10 text-amber-400 border-amber-500/30'
};

export default function StatusBadge({ status, size = 'md' }) {
  const normalized = (status || '').toUpperCase();
  const colorClass = colors[normalized] || 'bg-slate-800 text-slate-300 border-slate-700';

  const sizeClass = size === 'sm' 
    ? 'text-xs px-2 py-0.5' 
    : size === 'lg' 
    ? 'text-sm px-3.5 py-1.5 font-bold' 
    : 'text-xs px-2.5 py-1 font-semibold';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border tracking-wide uppercase shadow-sm ${colorClass} ${sizeClass}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
      {status}
    </span>
  );
}
