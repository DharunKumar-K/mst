import React, { useState, useEffect } from 'react';
import api from '../services/api';
import TxHashLink from '../components/TxHashLink';
import StatusBadge from '../components/StatusBadge';
import { Blocks, Search, ExternalLink, ShieldCheck, CheckCircle2, Cpu } from 'lucide-react';

export default function Blockchain() {
  const [batches, setBatches] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.getBatches().then(setBatches);
  }, []);

  const explorerBase = import.meta.env.VITE_MST_EXPLORER_URL || 'https://testnet.mstscan.io';

  const filtered = batches.filter(b => 
    b.id.toLowerCase().includes(search.toLowerCase()) ||
    (b.blockchain?.txHash || '').toLowerCase().includes(search.toLowerCase()) ||
    (b.evidenceRoot || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 text-cyan-400">
            <Blocks size={18} />
            <span className="text-xs font-mono font-bold uppercase tracking-wider">
              MST Testnet Explorer
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">Immutable Blockchain Ledger</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Live on-chain attestations, Merkle roots, and smart contract verification records on MST Testnet (Chain ID: 4242).
          </p>
        </div>

        <a
          href={explorerBase}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-semibold flex items-center gap-2 transition-all self-start sm:self-auto"
        >
          <span>Open MST Explorer</span>
          <ExternalLink size={14} />
        </a>
      </div>

      {/* Network Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 font-mono text-xs">
          <span className="text-slate-400 block mb-1">Network</span>
          <span className="text-emerald-400 font-bold text-sm">MST Testnet</span>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 font-mono text-xs">
          <span className="text-slate-400 block mb-1">Chain ID</span>
          <span className="text-white font-bold text-sm">4242</span>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 font-mono text-xs">
          <span className="text-slate-400 block mb-1">Latest Block</span>
          <span className="text-cyan-400 font-bold text-sm">#14,890,362</span>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 font-mono text-xs">
          <span className="text-slate-400 block mb-1">Attestations Minted</span>
          <span className="text-purple-400 font-bold text-sm">{batches.length} Records</span>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
        <input
          type="text"
          placeholder="Filter by Batch ID, Tx Hash (0x...), or Merkle Root..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
        />
      </div>

      {/* Table of Blockchain Attestations */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="py-3 px-3">Attestation ID</th>
                <th className="py-3 px-3">Batch ID</th>
                <th className="py-3 px-3">Transaction Hash</th>
                <th className="py-3 px-3">Evidence Merkle Root</th>
                <th className="py-3 px-3">Block #</th>
                <th className="py-3 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map(b => (
                <tr key={b.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-3 font-bold text-slate-200">
                    {b.blockchain?.attestationId}
                  </td>
                  <td className="py-3.5 px-3 text-cyan-400">
                    {b.id}
                  </td>
                  <td className="py-3.5 px-3">
                    <TxHashLink hash={b.blockchain?.txHash} truncate={true} />
                  </td>
                  <td className="py-3.5 px-3 text-slate-400 truncate max-w-xs" title={b.blockchain?.evidenceRoot}>
                    {b.blockchain?.evidenceRoot ? `${b.blockchain.evidenceRoot.substring(0, 10)}...${b.blockchain.evidenceRoot.slice(-8)}` : '-'}
                  </td>
                  <td className="py-3.5 px-3 text-slate-300">
                    #{b.blockchain?.blockNumber}
                  </td>
                  <td className="py-3.5 px-3">
                    <StatusBadge status={b.status} size="sm" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
