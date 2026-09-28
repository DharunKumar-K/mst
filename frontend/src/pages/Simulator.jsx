import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { 
  Play, 
  Settings, 
  Sparkles, 
  Cpu, 
  Flame, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  RefreshCcw,
  Zap
} from 'lucide-react';

export default function Simulator() {
  const navigate = useNavigate();
  const [running, setRunning] = useState(false);
  const [activeScenario, setActiveScenario] = useState('NORMAL'); // NORMAL, INCONSISTENT, TAMPERED

  // Form parameters
  const [material, setMaterial] = useState('Lithium-Ion Batteries (NMC 811)');
  const [inputWeight, setInputWeight] = useState(1000);
  const [processedWeight, setProcessedWeight] = useState(950);
  const [claimedRecoveredWeight, setClaimedRecoveredWeight] = useState(680);
  const [downstreamWeight, setDownstreamWeight] = useState(675);
  const [runtimeHours, setRuntimeHours] = useState(8.5);
  const [energyKwh, setEnergyKwh] = useState(1240);

  // Quick preset scenario picker
  const handleScenarioChange = (scenario) => {
    setActiveScenario(scenario);
    if (scenario === 'NORMAL') {
      setInputWeight(1000);
      setProcessedWeight(950);
      setClaimedRecoveredWeight(680);
      setDownstreamWeight(675);
      setRuntimeHours(8.5);
      setEnergyKwh(1240);
    } else if (scenario === 'INCONSISTENT') {
      setInputWeight(1000);
      setProcessedWeight(920);
      setClaimedRecoveredWeight(900); // 90% impossible recovery
      setDownstreamWeight(680); // Receiver got only 680kg
      setRuntimeHours(4.2);
      setEnergyKwh(480);
    } else if (scenario === 'TAMPERED') {
      setInputWeight(1500);
      setProcessedWeight(1400);
      setClaimedRecoveredWeight(1350);
      setDownstreamWeight(820);
      setRuntimeHours(2.1); // Impossible speed
      setEnergyKwh(120);
    }
  };

  const handleGenerate = async () => {
    setRunning(true);
    try {
      const simulated = await api.runSimulation({
        material,
        inputWeight: Number(inputWeight),
        processedWeight: Number(processedWeight),
        claimedRecoveredWeight: Number(claimedRecoveredWeight),
        downstreamWeight: Number(downstreamWeight),
        runtimeHours: Number(runtimeHours),
        energyKwh: Number(energyKwh),
        scenario: activeScenario,
        producer: "Demo Producer (Simulated)",
        recycler: "Demo Recycler Facility",
        buyer: "Global Cathode Off-taker",
        amountINR: 65000
      });

      // Navigate to verification screen for judges
      setTimeout(() => {
        navigate(`/verification?batchId=${simulated.id}`);
      }, 600);
    } catch (err) {
      console.error("Simulation failed", err);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/60 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Cpu size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-white">Judge Simulator Control Panel</h2>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                  Interactive Demo Mode
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-xl">
                Generate real-time simulated industrial waste runs, trigger fraud heuristics, and benchmark CirqProof AI and MST attestation engine.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Scenario Mode:</span>
            <span className="text-xs font-mono font-bold text-cyan-400">{activeScenario}</span>
          </div>
        </div>
      </div>

      {/* Scenario Selection Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* NORMAL SCENARIO */}
        <div 
          onClick={() => handleScenarioChange('NORMAL')}
          className={`p-5 rounded-2xl border cursor-pointer transition-all ${
            activeScenario === 'NORMAL'
              ? 'bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/20 text-emerald-200'
              : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-400'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} className={activeScenario === 'NORMAL' ? 'text-emerald-400' : 'text-slate-500'} />
              <span className="font-bold text-sm text-slate-100">Scenario 1: Normal</span>
            </div>
            <span className="text-[10px] font-mono uppercase bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded">
              Consistent
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed mb-3">
            Physically conserved mass-balance, verified sensor telemetry, matching downstream receiver weighment.
          </p>
          <div className="text-[11px] font-mono text-emerald-400 bg-slate-950/60 p-2 rounded border border-slate-800">
            Intake: 1000kg • Recovery: 680kg • Downstream: 675kg
          </div>
        </div>

        {/* INCONSISTENT SCENARIO */}
        <div 
          onClick={() => handleScenarioChange('INCONSISTENT')}
          className={`p-5 rounded-2xl border cursor-pointer transition-all ${
            activeScenario === 'INCONSISTENT'
              ? 'bg-amber-950/40 border-amber-500 ring-2 ring-amber-500/20 text-amber-200'
              : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-400'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <AlertTriangle size={18} className={activeScenario === 'INCONSISTENT' ? 'text-amber-400' : 'text-slate-500'} />
              <span className="font-bold text-sm text-slate-100">Scenario 2: Inconsistent</span>
            </div>
            <span className="text-[10px] font-mono uppercase bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded">
              Flagged
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed mb-3">
            Exaggerated recovery yield (900kg claimed vs 680kg downstream). Triggers mass-balance alert and escrow freeze.
          </p>
          <div className="text-[11px] font-mono text-amber-400 bg-slate-950/60 p-2 rounded border border-slate-800">
            Intake: 1000kg • Claimed: 900kg • Downstream: 680kg
          </div>
        </div>

        {/* TAMPERED SCENARIO */}
        <div 
          onClick={() => handleScenarioChange('TAMPERED')}
          className={`p-5 rounded-2xl border cursor-pointer transition-all ${
            activeScenario === 'TAMPERED'
              ? 'bg-rose-950/40 border-rose-500 ring-2 ring-rose-500/20 text-rose-200'
              : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-400'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Flame size={18} className={activeScenario === 'TAMPERED' ? 'text-rose-400' : 'text-slate-500'} />
              <span className="font-bold text-sm text-slate-100">Scenario 3: Tampered</span>
            </div>
            <span className="text-[10px] font-mono uppercase bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded">
              Tampered
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed mb-3">
            Modified evidence signatures, offline telemetry spoofing, and impossible thermodynamic throughput rate.
          </p>
          <div className="text-[11px] font-mono text-rose-400 bg-slate-950/60 p-2 rounded border border-slate-800">
            Intake: 1500kg • Impossible 2.1h Cycle • Missing 530kg
          </div>
        </div>
      </div>

      {/* Simulator Tuning Parameters */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
        <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider border-b border-slate-800 pb-3 flex items-center justify-between">
          <span>Simulation Parameters Control</span>
          <span className="text-xs text-slate-400 normal-case">Tweak physical plant variables</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Material Feedstock
            </label>
            <input
              type="text"
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Input Weight (kg)
            </label>
            <input
              type="number"
              value={inputWeight}
              onChange={(e) => setInputWeight(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Processed Weight (kg)
            </label>
            <input
              type="number"
              value={processedWeight}
              onChange={(e) => setProcessedWeight(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Claimed Recovery (kg)
            </label>
            <input
              type="number"
              value={claimedRecoveredWeight}
              onChange={(e) => setClaimedRecoveredWeight(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-emerald-400 font-bold focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Downstream Off-take (kg)
            </label>
            <input
              type="number"
              value={downstreamWeight}
              onChange={(e) => setDownstreamWeight(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Process Runtime (Hours)
            </label>
            <input
              type="number"
              step="0.1"
              value={runtimeHours}
              onChange={(e) => setRuntimeHours(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Energy Consumed (kWh)
            </label>
            <input
              type="number"
              value={energyKwh}
              onChange={(e) => setEnergyKwh(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Active Scenario Tag
            </label>
            <div className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-cyan-400 uppercase">
              {activeScenario}
            </div>
          </div>
        </div>

        {/* Generate Action Button */}
        <div className="pt-4 flex items-center justify-between border-t border-slate-800">
          <div className="text-xs text-slate-400">
            Will execute AI heuristic verifier and anchor Merkle root onto MST Testnet.
          </div>

          <button
            onClick={handleGenerate}
            disabled={running}
            className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-sm uppercase tracking-wider flex items-center gap-2.5 transition-all shadow-xl shadow-cyan-500/20 disabled:opacity-50"
          >
            {running ? <RefreshCcw size={18} className="animate-spin" /> : <Zap size={18} />}
            <span>{running ? 'Simulating Batch...' : 'GENERATE BATCH'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
