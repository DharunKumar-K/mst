import React, { useState } from 'react';
import { ExternalLink, Copy, Check } from 'lucide-react';

export default function TxHashLink({ hash, label = "Transaction", truncate = true, explorerBase }) {
  const [copied, setCopied] = useState(false);
  const base = explorerBase || import.meta.env.VITE_MST_EXPLORER_URL || 'https://testnet.mstscan.io';

  if (!hash) {
    return <span className="text-slate-500 font-mono text-xs">Not emitted yet</span>;
  }

  const displayHash = truncate && hash.length > 16 
    ? `${hash.substring(0, 8)}...${hash.substring(hash.length - 8)}`
    : hash;

  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="inline-flex items-center gap-1.5 font-mono text-xs">
      <a
        href={`${base}/tx/${hash}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-cyan-400 hover:text-cyan-300 underline decoration-cyan-500/40 hover:decoration-cyan-400 inline-flex items-center gap-1 transition-colors"
        title={hash}
      >
        <span>{displayHash}</span>
        <ExternalLink size={12} className="opacity-75" />
      </a>
      <button
        onClick={handleCopy}
        className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
        title="Copy Hash"
      >
        {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
      </button>
    </div>
  );
}
