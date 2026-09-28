import React from 'react';
import { CheckCircle2, Clock, ShieldAlert, Coins } from 'lucide-react';

export default function StatusTimeline({ status, createdAt, blockchainTime }) {
  const steps = [
    { key: 'CREATED', label: 'Batch Created', desc: 'Material weighed & intake logged' },
    { key: 'AI_VERIFIED', label: 'AI Verifier', desc: 'Mass-balance & telemetry checked' },
    { key: 'ATTESTED', label: 'MST Attestation', desc: 'Merkle root committed on-chain' },
    { key: 'SETTLED', label: 'Escrow Settlement', desc: 'Funds released or frozen' }
  ];

  const getStepState = (index) => {
    if (status === 'FLAGGED' && index === 1) return 'error';
    if (status === 'CHALLENGED' && index >= 2) return 'disputed';
    if (status === 'VERIFIED') return 'completed';
    return index === 0 ? 'completed' : 'pending';
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
      <h4 className="font-semibold text-slate-100 text-sm mb-4">Lifecycle Verification Stages</h4>
      
      <div className="relative border-l-2 border-slate-800 ml-4 pl-6 space-y-6">
        {steps.map((step, idx) => {
          const state = getStepState(idx);

          return (
            <div key={step.key} className="relative group">
              <span className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full border-2 transition-all ${
                state === 'completed'
                  ? 'bg-emerald-500 border-emerald-400 ring-4 ring-emerald-500/20'
                  : state === 'error'
                  ? 'bg-rose-500 border-rose-400 ring-4 ring-rose-500/20'
                  : state === 'disputed'
                  ? 'bg-amber-500 border-amber-400 ring-4 ring-amber-500/20'
                  : 'bg-slate-900 border-slate-700'
              }`} />

              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${
                    state === 'completed' ? 'text-slate-100' : state === 'error' ? 'text-rose-400' : 'text-slate-400'
                  }`}>
                    {step.label}
                  </span>
                  {state === 'completed' && <CheckCircle2 size={13} className="text-emerald-400" />}
                </div>
                <span className="text-xs text-slate-400 mt-0.5">{step.desc}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
