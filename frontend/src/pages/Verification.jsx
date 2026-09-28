import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import AiReportCard from '../components/AiReportCard';
import StatusBadge from '../components/StatusBadge';
import ScenarioBadge from '../components/ScenarioBadge';
import TxHashLink from '../components/TxHashLink';
import { 
  CheckCircle, 
  XCircle, 
  Layers, 
  Cpu, 
  ShieldCheck, 
  Scale, 
  ArrowRight,
  Blocks,
  FileCheck2
} from 'lucide-react';

export default function Verification() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const batchIdParam = searchParams.get('batchId');

  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await api.getBatches();
        setBatches(data);
        if (batchIdParam) {
          const found = data.find(b => b.id === batchIdParam);
          if (found) setSelectedBatch(found);
          else if (data.length > 0) setSelectedBatch(data[0]);
        } else if (data.length > 0) {
          setSelectedBatch(data[0]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [batchIdParam]);

  if (loading || !selectedBatch) {
    return <div className="text-center py-20 text-slate-400 font-mono">Loading Verification Station...</div>;
  }

  const aiConsistent = selectedBatch.aiReport?.status === 'CONSISTENT';

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Banner / Judge Focal Area */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
                Judge Verification Panel
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span className="text-xs text-slate-400">RECOVERY VERIFICATION ENGINE</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">RECOVERY VERIFICATION</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Live deterministic verification of mass balance, facility capacity, and off-chain MST attestation proof.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-400 font-medium">Select Batch:</label>
            <select
              value={selectedBatch.id}
              onChange={(e) => {
                const found = batches.find(b => b.id === e.target.value);
                if (found) setSelectedBatch(found);
              }}
              className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-cyan-300 focus:outline-none"
            >
              {batches.map(b => (
                <option key={b.id} value={b.id}>{b.id} ({b.scenario})</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Recovery Verification Block */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Scale size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100">{selectedBatch.material}</h3>
              <span className="text-xs font-mono text-slate-400">{selectedBatch.id}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ScenarioBadge scenario={selectedBatch.scenario} />
            <StatusBadge status={selectedBatch.status} />
          </div>
        </div>

        {/* 4 Weights Table: Input, Processed, Recovered, Downstream */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-950/70 p-5 rounded-xl border border-slate-800">
          <div>
            <span className="text-xs uppercase font-mono text-slate-400 block mb-1">Input</span>
            <span className="text-2xl font-black text-cyan-400 font-mono">{selectedBatch.inputWeight} kg</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Weighbridge</span>
          </div>

          <div>
            <span className="text-xs uppercase font-mono text-slate-400 block mb-1">Processed</span>
            <span className="text-2xl font-black text-slate-200 font-mono">{selectedBatch.processedWeight} kg</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Reactor Input</span>
          </div>

          <div>
            <span className="text-xs uppercase font-mono text-slate-400 block mb-1">Recovered</span>
            <span className="text-2xl font-black text-emerald-400 font-mono">{selectedBatch.claimedRecoveredWeight} kg</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Claimed Yield</span>
          </div>

          <div>
            <span className="text-xs uppercase font-mono text-slate-400 block mb-1">Downstream</span>
            <span className="text-2xl font-black text-amber-400 font-mono">{selectedBatch.downstreamWeight} kg</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Buyer Receipt</span>
          </div>
        </div>

        {/* 3 Core Rule Verifications: Mass Balance, Capacity, Downstream Match */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Mass Balance</span>
              <span className="text-sm font-bold text-slate-200 mt-1 block">
                {selectedBatch.aiReport?.massBalance?.passed ? 'CONSERVED' : 'DISCREPANCY'}
              </span>
            </div>
            {selectedBatch.aiReport?.massBalance?.passed ? (
              <span className="text-emerald-400 font-black text-xl">✓</span>
            ) : (
              <span className="text-rose-400 font-black text-xl">✗</span>
            )}
          </div>

          <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Capacity</span>
              <span className="text-sm font-bold text-slate-200 mt-1 block">
                {selectedBatch.aiReport?.capacity?.passed ? 'VERIFIED' : 'EXCEEDED'}
              </span>
            </div>
            {selectedBatch.aiReport?.capacity?.passed ? (
              <span className="text-emerald-400 font-black text-xl">✓</span>
            ) : (
              <span className="text-rose-400 font-black text-xl">✗</span>
            )}
          </div>

          <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Downstream Match</span>
              <span className="text-sm font-bold text-slate-200 mt-1 block">
                {selectedBatch.aiReport?.downstreamMatch?.passed ? 'MATCHED' : 'UNCONFIRMED'}
              </span>
            </div>
            {selectedBatch.aiReport?.downstreamMatch?.passed ? (
              <span className="text-emerald-400 font-black text-xl">✓</span>
            ) : (
              <span className="text-rose-400 font-black text-xl">✗</span>
            )}
          </div>
        </div>

        {/* AI RESULT BLOCK */}
        <div className={`p-4 rounded-xl border flex items-center justify-between ${
          aiConsistent 
            ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300' 
            : 'bg-rose-950/30 border-rose-500/40 text-rose-300'
        }`}>
          <div>
            <span className="text-xs uppercase font-mono font-bold tracking-wider block">AI RESULT</span>
            <span className="text-xl font-black tracking-wide">{selectedBatch.aiReport?.status}</span>
          </div>
          <span className="text-xs font-mono bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800 text-slate-300">
            Automated Protocol Verdict
          </span>
        </div>

        {/* MST SECTION */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 text-cyan-400 text-sm font-bold uppercase tracking-wider border-b border-slate-800 pb-3">
            <Blocks size={18} />
            <span>MST Cryptographic Proof Anchor</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div>
              <span className="text-slate-400 block mb-0.5">Attestation ID</span>
              <span className="text-slate-200 font-bold">{selectedBatch.blockchain?.attestationId}</span>
            </div>

            <div>
              <span className="text-slate-400 block mb-0.5">Timestamp</span>
              <span className="text-slate-200">{new Date(selectedBatch.blockchain?.timestamp).toLocaleString()}</span>
            </div>

            <div className="md:col-span-2">
              <span className="text-slate-400 block mb-0.5">Transaction Hash</span>
              <TxHashLink hash={selectedBatch.blockchain?.txHash} truncate={false} />
            </div>

            <div className="md:col-span-2">
              <span className="text-slate-400 block mb-0.5">Evidence Root (Merkle)</span>
              <span className="text-cyan-400 break-all">{selectedBatch.blockchain?.evidenceRoot}</span>
            </div>

            <div className="md:col-span-2">
              <span className="text-slate-400 block mb-0.5">Verifier Contract / Signer</span>
              <span className="text-slate-300 break-all">{selectedBatch.blockchain?.verifier}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
