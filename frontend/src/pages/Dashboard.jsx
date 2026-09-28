import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import ScenarioBadge from '../components/ScenarioBadge';
import TxHashLink from '../components/TxHashLink';
import { 
  Package, 
  CheckCircle, 
  AlertTriangle, 
  ShieldAlert, 
  Weight, 
  Coins, 
  ArrowUpRight, 
  Cpu, 
  PlusCircle,
  RefreshCw
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  BarChart, 
  Bar 
} from 'recharts';

export default function Dashboard() {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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

  // Compute metrics
  const totalBatches = batches.length;
  const verifiedCount = batches.filter(b => b.status === 'VERIFIED').length;
  const flaggedCount = batches.filter(b => b.status === 'FLAGGED').length;
  const challengedCount = batches.filter(b => b.status === 'CHALLENGED').length;
  const totalRecoveredWeight = batches.reduce((acc, b) => acc + (b.claimedRecoveredWeight || 0), 0);
  const totalSettlementAmount = batches.reduce((acc, b) => acc + (b.settlement?.amountINR || 0), 0);

  // Chart data for Recovery trends
  const chartData = batches.slice(-6).map((b, i) => ({
    name: b.id.replace('BATCH-2026-', '#'),
    Intake: b.inputWeight,
    Recovered: b.claimedRecoveredWeight,
    Downstream: b.downstreamWeight
  }));

  const statCards = [
    { title: 'Total Batches', value: totalBatches, icon: Package, color: 'text-cyan-400', border: 'border-cyan-500/30' },
    { title: 'Verified Safe', value: verifiedCount, icon: CheckCircle, color: 'text-emerald-400', border: 'border-emerald-500/30' },
    { title: 'AI Flagged', value: flaggedCount, icon: AlertTriangle, color: 'text-rose-400', border: 'border-rose-500/30' },
    { title: 'Challenged / Disputed', value: challengedCount, icon: ShieldAlert, color: 'text-amber-400', border: 'border-amber-500/30' },
    { title: 'Recovered Weight', value: `${totalRecoveredWeight.toLocaleString()} kg`, icon: Weight, color: 'text-teal-400', border: 'border-teal-500/30' },
    { title: 'Settlement Escrow', value: `₹${totalSettlementAmount.toLocaleString()}`, icon: Coins, color: 'text-yellow-400', border: 'border-yellow-500/30' }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-emerald-400">
              Protocol Overview
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-xs text-slate-400">Real-time off-chain AI + MST Testnet sync</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">Circular Verification Desk</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Live telemetry audits, Merkle root commitment, and zero-counterparty settlement for circular recycling.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/simulator')}
            className="px-4 py-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-semibold text-xs flex items-center gap-2 transition-all shadow-sm"
          >
            <Cpu size={15} />
            <span>Judge Simulator</span>
          </button>
          <button
            onClick={() => navigate('/create-batch')}
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20"
          >
            <PlusCircle size={15} />
            <span>Create Batch</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className={`bg-slate-900/80 border ${card.border} rounded-xl p-4 shadow-sm backdrop-blur-sm flex flex-col justify-between`}>
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-[11px] font-medium uppercase tracking-wider">{card.title}</span>
                <Icon size={16} className={card.color} />
              </div>
              <div className="text-xl sm:text-2xl font-black text-white">
                {loading ? '...' : card.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-100">Mass Balance Tracking</h3>
              <p className="text-xs text-slate-400">Intake vs Claimed Recovery vs Downstream Receipts (kg)</p>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              Thermodynamic Verifier
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="intakeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="recGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="Intake" stroke="#06b6d4" fillOpacity={1} fill="url(#intakeGrad)" />
                <Area type="monotone" dataKey="Recovered" stroke="#10b981" fillOpacity={1} fill="url(#recGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Downstream verification accuracy */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-100">Discrepancy Audit</h3>
            <p className="text-xs text-slate-400 mb-4">Comparison of claimed recovery to certified off-take</p>

            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                  <YAxis stroke="#64748b" fontSize={10} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Bar dataKey="Recovered" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Downstream" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-emerald-500" /> Claimed</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-amber-500" /> Downstream</span>
          </div>
        </div>
      </div>

      {/* Recent Batches Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-100">Batch Processing Ledger</h3>
            <p className="text-xs text-slate-400">Immutable trace and validation telemetry</p>
          </div>
          <button
            onClick={loadData}
            className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors"
            title="Refresh Ledger"
          >
            <RefreshCw size={15} />
          </button>
        </div>

        <div className="overflow-x-auto mt-2">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="py-3 px-3">Batch ID</th>
                <th className="py-3 px-3">Material</th>
                <th className="py-3 px-3">Intake / Claimed</th>
                <th className="py-3 px-3">Scenario</th>
                <th className="py-3 px-3">Integrity</th>
                <th className="py-3 px-3">Settlement</th>
                <th className="py-3 px-3">MST Hash</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {batches.map((batch) => (
                <tr 
                  key={batch.id} 
                  className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
                  onClick={() => navigate(`/batch/${batch.id}`)}
                >
                  <td className="py-3.5 px-3 font-bold text-cyan-400 flex items-center gap-1.5">
                    <span>{batch.id}</span>
                  </td>
                  <td className="py-3.5 px-3 text-slate-300 font-sans font-medium">
                    {batch.material}
                  </td>
                  <td className="py-3.5 px-3 text-slate-300">
                    <span className="text-white font-semibold">{batch.inputWeight}</span>
                    <span className="text-slate-500"> / </span>
                    <span className="text-emerald-400 font-semibold">{batch.claimedRecoveredWeight} kg</span>
                  </td>
                  <td className="py-3.5 px-3">
                    <ScenarioBadge scenario={batch.scenario} />
                  </td>
                  <td className="py-3.5 px-3">
                    <StatusBadge status={batch.status} size="sm" />
                  </td>
                  <td className="py-3.5 px-3 text-slate-300 font-sans">
                    <span className="font-semibold">₹{batch.settlement?.amountINR?.toLocaleString()}</span>
                    <span className="block text-[10px] text-slate-400 font-mono">{batch.settlement?.status}</span>
                  </td>
                  <td className="py-3.5 px-3">
                    <TxHashLink hash={batch.blockchain?.txHash} />
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/batch/${batch.id}`);
                      }}
                      className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-emerald-500 hover:text-slate-950 transition-colors"
                      title="Inspect Batch"
                    >
                      <ArrowUpRight size={14} />
                    </button>
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
