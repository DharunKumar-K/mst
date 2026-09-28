import React from 'react';
import { Bot, CheckCircle2, AlertTriangle, ShieldAlert, Cpu } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';


export default function AiReportCard({ report }) {
  if (!report) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-slate-400">
        AI Evaluation in progress or not generated yet.
      </div>
    );
  }

  const isConsistent = report.status === 'CONSISTENT';

  return (
    <div className={`rounded-xl border p-6 transition-all shadow-lg ${
      isConsistent 
        ? 'bg-slate-900/90 border-emerald-500/30 shadow-emerald-950/20' 
        : 'bg-slate-900/90 border-rose-500/40 shadow-rose-950/20'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-lg border ${
            isConsistent ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
          }`}>
            <Bot size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-lg text-slate-100">CirqProof AI Verifier Report</h3>
              <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">v2.4-agentic</span>
            </div>
            <p className="text-xs text-slate-400">Multi-stream telemetry, mass balance & downstream match engine</p>
          </div>
        </div>
        <div>
          <StatusBadge status={report.status} size="lg" />
        </div>
      </div>

      {/* Grid of 3 Core Checks */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-5">
        {/* Mass Balance Check */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Mass Balance</span>
            {report.massBalance?.passed ? (
              <CheckCircle2 size={16} className="text-emerald-400" />
            ) : (
              <AlertTriangle size={16} className="text-rose-400" />
            )}
          </div>
          <div className="text-sm font-semibold text-slate-200">
            {report.massBalance?.passed ? 'CONSERVED' : 'VIOLATION DETECTED'}
          </div>
          <p className="text-xs text-slate-400 mt-1 line-clamp-2">
            {report.massBalance?.message || `Variance: ${report.massBalance?.variancePercent}%`}
          </p>
        </div>

        {/* Capacity Check */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Facility Capacity</span>
            {report.capacity?.passed ? (
              <CheckCircle2 size={16} className="text-emerald-400" />
            ) : (
              <AlertTriangle size={16} className="text-rose-400" />
            )}
          </div>
          <div className="text-sm font-semibold text-slate-200">
            {report.capacity?.passed ? 'RATED COMPLIANT' : 'EXCEEDS CAPACITY'}
          </div>
          <p className="text-xs text-slate-400 mt-1 line-clamp-2">
            {report.capacity?.message || 'Within operational limits.'}
          </p>
        </div>

        {/* Downstream Match Check */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Downstream Match</span>
            {report.downstreamMatch?.passed ? (
              <CheckCircle2 size={16} className="text-emerald-400" />
            ) : (
              <AlertTriangle size={16} className="text-rose-400" />
            )}
          </div>
          <div className="text-sm font-semibold text-slate-200">
            {report.downstreamMatch?.passed ? 'CONFIRMED RECEIPT' : 'DISCREPANCY DETECTED'}
          </div>
          <p className="text-xs text-slate-400 mt-1 line-clamp-2">
            {report.downstreamMatch?.message || 'Invoice weight aligns with recovery claimed.'}
          </p>
        </div>
      </div>

      {/* Flags Section */}
      {report.flags && report.flags.length > 0 && (
        <div className="mb-4 bg-rose-950/30 border border-rose-500/30 rounded-lg p-3">
          <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldAlert size={15} />
            <span>Detected Fraud/Integrity Flags ({report.flags.length})</span>
          </div>
          <ul className="space-y-1.5">
            {report.flags.map((flag, idx) => (
              <li key={idx} className="text-xs text-rose-300 font-mono flex items-start gap-2">
                <span className="text-rose-500">•</span>
                <span>{flag}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Explanation */}
      <div className="space-y-3 pt-2 text-xs">
        <div>
          <span className="text-slate-400 font-medium uppercase tracking-wider block mb-1">AI Explanation</span>
          <p className="text-slate-300 bg-slate-950/40 p-3 rounded-lg border border-slate-800/60 leading-relaxed">
            {report.explanation}
          </p>
        </div>

        <div>
          <span className="text-slate-400 font-medium uppercase tracking-wider block mb-1">Audit Recommendation</span>
          <p className={`p-3 rounded-lg border font-medium ${
            isConsistent 
              ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300' 
              : 'bg-amber-950/30 border-amber-500/30 text-amber-300'
          }`}>
            {report.recommendation}
          </p>
        </div>
      </div>
    </div>
  );
}
