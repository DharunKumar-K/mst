import React, { useState } from 'react';
import { ExternalLink, Copy, Check } from 'lucide-react';

export default function TxHashLink({ hash, label = 'Transaction', truncate = true, explorerBase }) {
  const [copied, setCopied] = useState(false);
  const base = explorerBase || import.meta.env.VITE_MST_EXPLORER_URL || 'https://testnet.mstscan.io';

  if (!hash) {
    return (
      <span className="font-mono text-[10px]" style={{ color: 'var(--paper-ghost)' }}>
        Not emitted
      </span>
    );
  }

  const displayHash =
    truncate && hash.length > 16
      ? `${hash.substring(0, 8)}…${hash.substring(hash.length - 8)}`
      : hash;

  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="inline-flex items-center gap-1.5 font-mono text-[10px]">
      <a
        href={`${base}/tx/${hash}`}
        target="_blank"
        rel="noopener noreferrer"
        title={hash}
        style={{ color: 'var(--copper)' }}
        onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--copper-bright)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--copper)'; }}
        className="inline-flex items-center gap-1 transition-colors"
      >
        <span>{displayHash}</span>
        <ExternalLink size={10} style={{ opacity: 0.6 }} />
      </a>
      <button
        onClick={handleCopy}
        title="Copy Hash"
        style={{ color: 'var(--paper-ghost)' }}
        onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--paper-dim)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--paper-ghost)'; }}
      >
        {copied ? (
          <Check size={11} style={{ color: 'var(--copper)' }} />
        ) : (
          <Copy size={11} />
        )}
      </button>
    </div>
  );
}
