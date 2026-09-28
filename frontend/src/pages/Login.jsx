import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, ROLES } from '../hooks/useAuth';
import { ShieldCheck, Factory, RefreshCw, SearchCheck, ShoppingCart, ArrowRight } from 'lucide-react';

export default function Login() {
  const { selectRole } = useAuth();
  const navigate = useNavigate();

  const handleRolePick = (roleKey) => {
    selectRole(roleKey);
    navigate('/');
  };

  const roleCards = [
    {
      key: 'RECYCLER',
      title: 'Recycler Portal',
      subtitle: 'EcoLoop Hydrometallurgy Unit 4',
      desc: 'Ingest waste batches, upload processing telemetry, claim recovered material yields.',
      icon: RefreshCw,
      color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/40 text-emerald-400'
    },
    {
      key: 'AUDITOR',
      title: 'Auditor & Verifier Portal',
      subtitle: 'BureauVeritas AI Audit Desk',
      desc: 'Inspect AI mass balance, detect sensor anomalies, challenge fraudulent attestations.',
      icon: SearchCheck,
      color: 'from-amber-500/20 to-orange-500/10 border-amber-500/40 text-amber-400'
    },
    {
      key: 'PRODUCER',
      title: 'Waste Producer / EPR Desk',
      subtitle: 'VoltForge Dynamics Ltd',
      desc: 'Create intake batches, fund escrow settlement pools, verify certified recycling.',
      icon: Factory,
      color: 'from-cyan-500/20 to-blue-500/10 border-cyan-500/40 text-cyan-400'
    },
    {
      key: 'BUYER',
      title: 'Downstream Off-taker Portal',
      subtitle: 'CathodePure Advanced Materials',
      desc: 'Confirm downstream intake weight, sign bills of lading, release buyer escrows.',
      icon: ShoppingCart,
      color: 'from-purple-500/20 to-indigo-500/10 border-purple-500/40 text-purple-400'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-6 relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl w-full z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-4">
            <ShieldCheck size={16} />
            <span>MST Testnet • AI Verifiable Recovery Protocol</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-3">
            CirqProof Portal
          </h1>
          <p className="text-slate-400 text-base max-w-xl mx-auto">
            Zero-knowledge, telemetry-anchored circular economy verification for EPR recycling and industrial waste recovery.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {roleCards.map(card => {
            const Icon = card.icon;

            return (
              <div
                key={card.key}
                onClick={() => handleRolePick(card.key)}
                className={`p-6 rounded-2xl border bg-gradient-to-br transition-all duration-200 cursor-pointer hover:scale-[1.02] hover:shadow-xl ${card.color}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                    <Icon size={24} />
                  </div>
                  <span className="text-xs font-mono uppercase bg-slate-900/60 px-2 py-1 rounded text-slate-300">
                    {card.key}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-100 mb-1">{card.title}</h3>
                <h4 className="text-xs text-slate-400 font-mono mb-2">{card.subtitle}</h4>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">{card.desc}</p>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-200 group">
                  <span>Enter as {card.key}</span>
                  <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 text-center text-xs text-slate-500">
          Connected to MST Chain ID: 4242 • Autonomous AI Verifier Activated
        </div>
      </div>
    </div>
  );
}
