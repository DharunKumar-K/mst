import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import EvidenceList from '../components/EvidenceList';
import AiReportCard from '../components/AiReportCard';
import StatusBadge from '../components/StatusBadge';
import ScenarioBadge from '../components/ScenarioBadge';
import StatusTimeline from '../components/StatusTimeline';
import TxHashLink from '../components/TxHashLink';
import ChallengeModal from '../components/ChallengeModal';
import { 
  ArrowLeft, 
  ShieldAlert, 
  Coins, 
  CheckCircle, 
  ExternalLink,
  Weight,
  Layers,
  Building2,
  Calendar
} from 'lucide-react';

export default function BatchDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [batch, setBatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isChallengeOpen, setIsChallengeOpen] = useState(false);

  const fetchBatch = async () => {
    setLoading(true);
    try {
      const data = await api.getBatchById(id);
      setBatch(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatch();
  }, [id]);

  const handleChallengeSubmitted = async (challengeData) => {
    await api.challengeBatch(batch.id, challengeData);
    await fetchBatch();
  };

  if (loading) {
    return <div className="text-center py-20 text-slate-400 font-mono">Loading batch data...</div>;
  }

  if (!batch) {
    return (
      <div className="text-center py-20 space-y-4">
        <p className="text-slate-400">Batch {id} not found in verified registry.</p>
        <button 
          onClick={() => navigate('/')} 
          className="px-4 py-2 bg-slate-800 text-slate-200 rounded-lg text-xs"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-2xl font-black text-white font-mono">{batch.id}</h2>
              <ScenarioBadge scenario={batch.scenario} />
              <StatusBadge status={batch.status} />
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{batch.material}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {batch.status !== 'CHALLENGED' && (
            <button
              onClick={() => setIsChallengeOpen(true)}
              className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold flex items-center gap-2 transition-all shadow-sm"
            >
              <ShieldAlert size={15} />
              <span>Challenge Batch</span>
            </button>
          )}

          <button
            onClick={() => navigate('/verification')}
            className="px-4 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-semibold flex items-center gap-2 transition-all"
          >
            <ExternalLink size={15} />
            <span>Judge Verification View</span>
          </button>
        </div>
      </div>

      {/* Primary 4-Metric Mass Balance Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Intake Weight</span>
          <div className="text-2xl font-black text-cyan-400 font-mono mt-1">{batch.inputWeight} kg</div>
          <span className="text-[10px] text-slate-500 mt-1 block">Certified weighbridge slip</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Processed Weight</span>
          <div className="text-2xl font-black text-slate-200 font-mono mt-1">{batch.processedWeight} kg</div>
          <span className="text-[10px] text-slate-500 mt-1 block">Reactor throughput log</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Recovered Yield</span>
          <div className="text-2xl font-black text-emerald-400 font-mono mt-1">{batch.claimedRecoveredWeight} kg</div>
          <span className="text-[10px] text-slate-500 mt-1 block">Claimed recycling output</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Residue / Slag</span>
          <div className="text-2xl font-black text-amber-400 font-mono mt-1">{batch.residueWeight} kg</div>
          <span className="text-[10px] text-slate-500 mt-1 block">Inert / non-recoverable</span>
        </div>
      </div>

      {/* Main Grid: Evidence & AI Report */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <AiReportCard report={batch.aiReport} />
          <StatusTimeline status={batch.status} createdAt={batch.createdAt} />
        </div>

        <div className="space-y-6">
          <EvidenceList 
            evidence={batch.evidence} 
            evidenceRoot={batch.evidenceRoot} 
            integrityStatus={batch.integrityStatus} 
          />

          {/* Blockchain & Settlement Snapshot */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <h4 className="font-semibold text-slate-100 text-sm border-b border-slate-800 pb-3 flex items-center justify-between">
              <span>MST Testnet Attestation Anchor</span>
              <StatusBadge status={batch.settlement?.status || 'PENDING'} size="sm" />
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
              <div>
                <span className="text-slate-400 block mb-0.5">Attestation ID:</span>
                <span className="text-slate-200">{batch.blockchain?.attestationId}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Network & Block:</span>
                <span className="text-slate-200">MST Testnet #{batch.blockchain?.blockNumber}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-slate-400 block mb-0.5">Transaction Hash:</span>
                <TxHashLink hash={batch.blockchain?.txHash} truncate={false} />
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Escrow Bounty / Value:</span>
                <span className="text-emerald-400 font-sans font-bold">₹{batch.settlement?.amountINR?.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Settlement Release Hash:</span>
                <TxHashLink hash={batch.settlement?.releaseTx} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Challenge Modal */}
      <ChallengeModal
        isOpen={isChallengeOpen}
        onClose={() => setIsChallengeOpen(false)}
        batch={batch}
        onChallengeSubmitted={handleChallengeSubmitted}
      />
    </div>
  );
}
