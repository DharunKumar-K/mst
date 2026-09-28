import React, { useState, useEffect } from 'react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import TxHashLink from '../components/TxHashLink';
import { 
  Coins, 
  Lock, 
  Unlock, 
  RotateCcw, 
  CheckCircle2, 
  AlertOctagon, 
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

export default function Settlements() {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

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

  const handleUpdateStatus = async (batchId, newStatus) => {
    setProcessingId(batchId);
    try {
      await api.updateSettlement(batchId, newStatus);
      await loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setProcessingId(null);
    }
  };

  const statuses = ['PENDING', 'HELD', 'RELEASED', 'REFUNDED'];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 text-emerald-400">
            <Coins size={18} />
            <span className="text-xs font-mono font-bold uppercase tracking-wider">
              Smart Contract Escrow Engine
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">Settlement & Escrow Desk</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Conditional payout automation anchored to physical recovery attestation. Supports PENDING, HELD, RELEASED, and REFUNDED states.
          </p>
        </div>
      </div>

      {/* Settlement Cards */}
      <div className="space-y-4">
        {batches.map((batch) => {
          const settlement = batch.settlement || {
            amountINR: 50000,
            status: 'PENDING',
            recipient: batch.recycler
          };

          const isHeld = settlement.status === 'HELD';
          const isReleased = settlement.status === 'RELEASED';
          const isPending = settlement.status === 'PENDING';
          const isRefunded = settlement.status === 'REFUNDED';

          return (
            <div 
              key={batch.id}
              className={`p-6 rounded-2xl border transition-all ${
                isReleased 
                  ? 'bg-slate-900/90 border-emerald-500/30' 
                  : isHeld 
                  ? 'bg-slate-900/90 border-amber-500/40' 
                  : 'bg-slate-900/80 border-slate-800'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4 mb-4">
                <div>
                  <div className="flex items-center gap-2.5 mb-1">
                    <span className="font-mono text-sm font-bold text-white">{batch.id}</span>
                    <span className="text-xs text-slate-400">({batch.material})</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
                    <span>Beneficiary: {settlement.recipient}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xs uppercase font-mono text-slate-400 block">Settlement</span>
                    <span className="text-2xl font-black text-white font-sans">
                      ₹{settlement.amountINR?.toLocaleString()}
                    </span>
                  </div>
                  <StatusBadge status={settlement.status} size="lg" />
                </div>
              </div>

              {/* Transactions details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono mb-4 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                <div>
                  <span className="text-slate-400 block mb-0.5">Escrow Deposit Tx:</span>
                  <TxHashLink hash={settlement.escrowTx} />
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Settlement Release Tx:</span>
                  <TxHashLink hash={settlement.releaseTx} />
                </div>
              </div>

              {/* Action Buttons connected to P1 chain hooks */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <span className="text-xs text-slate-400">
                  {isReleased && '✓ Escrow released to recycler after verified physical recovery.'}
                  {isHeld && '⚠ Escrow frozen pending auditor dispute resolution.'}
                  {isPending && '• Awaiting AI & downstream receipt confirmation.'}
                  {isRefunded && '↺ Funds refunded to waste producer.'}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    disabled={processingId === batch.id || isHeld}
                    onClick={() => handleUpdateStatus(batch.id, 'HELD')}
                    className="px-3.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center gap-1.5 disabled:opacity-40"
                  >
                    <Lock size={13} />
                    <span>HOLD</span>
                  </button>

                  <button
                    disabled={processingId === batch.id || isReleased}
                    onClick={() => handleUpdateStatus(batch.id, 'RELEASED')}
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 disabled:opacity-40"
                  >
                    <Unlock size={13} />
                    <span>RELEASE</span>
                  </button>

                  <button
                    disabled={processingId === batch.id || isRefunded}
                    onClick={() => handleUpdateStatus(batch.id, 'REFUNDED')}
                    className="px-3.5 py-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-semibold flex items-center gap-1.5 disabled:opacity-40"
                  >
                    <RotateCcw size={13} />
                    <span>REFUND</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
