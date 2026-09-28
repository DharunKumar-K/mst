import React from 'react';

export default function ScenarioBadge({ scenario }) {
  const sc = (scenario || 'NORMAL').toUpperCase();

  const styles = {
    NORMAL: 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40 ring-1 ring-emerald-500/20',
    INCONSISTENT: 'bg-amber-950/60 text-amber-300 border-amber-500/40 ring-1 ring-amber-500/20',
    TAMPERED: 'bg-rose-950/60 text-rose-300 border-rose-500/40 ring-1 ring-rose-500/20',
  };

  const icons = {
    NORMAL: '✓',
    INCONSISTENT: '⚠',
    TAMPERED: '⚡',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-medium border ${styles[sc] || styles.NORMAL}`}>
      <span>{icons[sc] || '•'}</span>
      <span>{sc}</span>
    </span>
  );
}
