import React, { useState, useEffect } from 'react';
import api from '../services/api';
import ChallengeModal from '../components/ChallengeModal';
import StatusBadge from '../components/StatusBadge';
import ScenarioBadge from '../components/ScenarioBadge';
import TxHashLink from '../components/TxHashLink';
import { 
  ShieldAlert, 
  AlertTriangle, 
  Scale, 
  Coins, 
  ArrowRight,
  Gavel
} from 'lucide-react';

export default function Challenges() {
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await api.getBatches();
      setBatches(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenChallenge = (batch) => {
    setSelectedBatch(batch);
    setIsModalOpen(true);
  };

  const handleChallengeSubmitted = async (challengeData) => {
    await api.challengeBatch(challengeData.batchId, challengeData);
    await loadData();
  };

  // Find candidate batches for challenge (e.g. inconsistent ones)
  const candidateBatch = batches.find(b => b.scenario === 'INCONSISTENT' || b.status === 'CHALLENGED') || batches[1] || batches[0];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 text-amber-400">
            <ShieldAlert size={18} />
            <span className="text-xs font-mono font-bold uppercase tracking-wider">
              Auditor Fraud Dispute Engine
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">Dispute & Challenge Portal</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Detect overstated recycling claims, stake auditor bounty bonds on MST Testnet, and trigger optimistic fraud proofs.
          </p>
        </div>
      </div>

      {/* Primary Challenge Spotlight Card */}
      {candidateBatch && (
        <div className="bg-gradient-to-br from-amber-950/30 via-slate-900 to-slate-900 border border-amber-500/40 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-amber-400 font-bold uppercase tracking-wider">
                  Audit Target
                </span>
                <span className="text-sm font-bold text-white font-mono">{candidateBatch.id}</span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">{candidateBatch.material}</p>
            </div>
            <div className="flex items-center gap-2">
              <ScenarioBadge scenario={candidateBatch.scenario} />
              <StatusBadge status={candidateBatch.status} />
            </div>
          </div>

          {/* Claimed vs Downstream Comparison */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800">
              <span className="text-xs font-mono uppercase text-slate-400 block mb-1">Claimed Recovery</span>
              <div className="text-2xl font-black text-amber-400 font-mono">
                {candidateBatch.claimedRecoveredWeight} kg
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">Recycler self-reported attestation</span>
            </div>

            <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800">
              <span className="text-xs font-mono uppercase text-slate-400 block mb-1">Downstream Receiver</span>
              <div className="text-2xl font-black text-rose-400 font-mono">
                {candidateBatch.downstreamWeight} kg
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">Off-taker certified scale intake</span>
            </div>
          </div>

          {/* Warning Banner */}
          <div className="bg-amber-950/40 border border-amber-500/50 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 shrink-0">
                <AlertTriangle size={22} />
              </div>
              <div>
                <span className="text-sm font-black text-amber-300 block tracking-wide">
                  ⚠ EVIDENCE INCONSISTENCY
                </span>
                <p className="text-xs text-amber-200/80 mt-0.5 font-mono">
                  {candidateBatch.claimedRecoveredWeight - candidateBatch.downstreamWeight} kg phantom weight delta detected between claim and certified off-take.
                </p>
              </div>
            </div>

            <button
              onClick={() => handleOpenChallenge(candidateBatch)}
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg shadow-amber-500/20 shrink-0"
            >
              <Gavel size={15} />
              <span>CHALLENGE</span>
            </button>
          </div>

          {/* Challenge Status (if active) */}
          {candidateBatch.challenge && (
            <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 text-xs font-mono space-y-2">
              <div className="text-amber-400 font-bold flex items-center justify-between">
                <span>Active Dispute: {candidateBatch.challenge.id}</span>
                <span className="text-slate-400 font-normal">{candidateBatch.challenge.status}</span>
              </div>
              <div className="text-slate-300">{candidateBatch.challenge.reason}</div>
              <div className="flex items-center justify-between text-slate-400 pt-2 border-t border-slate-800">
                <span>Challenger: {candidateBatch.challenge.challenger}</span>
                <span className="text-emerald-400 font-bold">Bounty: ₹{candidateBatch.challenge.bountyINR?.toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      <ChallengeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        batch={selectedBatch}
        onChallengeSubmitted={handleChallengeSubmitted}
      />
    </div>
  );
}
