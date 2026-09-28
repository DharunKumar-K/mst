import React, { useState } from 'react';
import { X, ShieldAlert, AlertCircle, Coins, Send } from 'lucide-react';

export default function ChallengeModal({ isOpen, onClose, batch, onChallengeSubmitted }) {
  const [reason, setReason] = useState('Downstream certified receipt proves 220kg delta against claimed recovery weight.');
  const [bountyINR, setBountyINR] = useState(15000);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !batch) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (onChallengeSubmitted) {
        await onChallengeSubmitted({
          batchId: batch.id,
          reason,
          bountyINR: Number(bountyINR),
          challenger: "0x77A19bE492801FdA21004C9912AcDa78912066fB"
        });
      }
      onClose();
    } catch (err) {
      console.error("Challenge submission failed", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-2.5 text-amber-400">
            <ShieldAlert size={22} />
            <h3 className="text-lg font-bold text-slate-100">Initiate MST Fraud Challenge</h3>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-amber-950/20 border border-amber-500/30 rounded-lg p-3 text-xs text-amber-300 flex items-start gap-2.5">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <p>
              Submitting a challenge freezes the escrowed funds on MST Testnet and stakes your auditor bond into the dispute resolution protocol.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Target Batch ID
            </label>
            <input
              type="text"
              readOnly
              value={batch.id}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 font-mono text-sm text-slate-300"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs font-mono">
            <div className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-400 block mb-0.5">Claimed Recovery:</span>
              <span className="text-amber-400 font-bold">{batch.claimedRecoveredWeight} kg</span>
            </div>
            <div className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-400 block mb-0.5">Buyer Receipt:</span>
              <span className="text-rose-400 font-bold">{batch.downstreamWeight} kg</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Challenge Reason & Proof Narrative
            </label>
            <textarea
              required
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Staked Challenge Bounty (INR)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-400 font-medium">₹</span>
              <input
                type="number"
                min="5000"
                step="1000"
                value={bountyINR}
                onChange={(e) => setBountyINR(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-sm flex items-center gap-2 transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50"
            >
              <Send size={15} />
              <span>{submitting ? 'Broadcasting Challenge...' : 'Stake & Challenge'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
