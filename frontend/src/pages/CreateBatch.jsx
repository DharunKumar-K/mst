import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import EvidenceUploader from '../components/EvidenceUploader';
import { PackagePlus, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

export default function CreateBatch() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    material: 'Lithium-Ion Battery Scrap (NMC 622)',
    inputWeight: 1000,
    processedWeight: 950,
    claimedRecoveredWeight: 680,
    downstreamWeight: 675,
    producer: 'VoltForge Dynamics Ltd',
    recycler: 'EcoLoop Hydrometallurgy Unit 4',
    buyer: 'CathodePure Advanced Materials',
    amountINR: 50000,
    scenario: 'NORMAL'
  });

  const materials = [
    'Lithium-Ion Battery Scrap (NMC 622)',
    'E-Waste Printed Circuit Boards (PCB Class 1)',
    'Post-Consumer PET Flakes (Clear Food Grade)',
    'End-of-Life Solar PV Modules (Monocrystalline)',
    'High-Density Polyethylene (HDPE Containers)',
    'Aluminium Dross & Smelter Scrap'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const created = await api.createBatch({
        ...formData,
        inputWeight: Number(formData.inputWeight),
        processedWeight: Number(formData.processedWeight),
        claimedRecoveredWeight: Number(formData.claimedRecoveredWeight),
        downstreamWeight: Number(formData.downstreamWeight),
        amountINR: Number(formData.amountINR)
      });
      navigate(`/batch/${created.id}`);
    } catch (err) {
      console.error("Batch creation failed", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <PackagePlus size={22} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Create Intake Batch</h2>
            <p className="text-xs text-slate-400">Register physical circular feedstocks, plant metrics, and escrow terms</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider border-b border-slate-800 pb-3">
            1. Feedstock & Participant Metadata
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Material Classification
              </label>
              <select
                name="material"
                value={formData.material}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              >
                {materials.map((m, i) => (
                  <option key={i} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Escrow Settlement Value (INR)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-slate-400 text-xs font-medium">₹</span>
                <input
                  type="number"
                  name="amountINR"
                  value={formData.amountINR}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Producer (Waste Generator)
              </label>
              <input
                type="text"
                name="producer"
                value={formData.producer}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Recycler Facility
              </label>
              <input
                type="text"
                name="recycler"
                value={formData.recycler}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider border-b border-slate-800 pb-3">
            2. Mass Balance & Recovery Metrics (kg)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Input Weight (kg)
              </label>
              <input
                type="number"
                name="inputWeight"
                value={formData.inputWeight}
                onChange={handleChange}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-xs font-mono text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Processed Weight (kg)
              </label>
              <input
                type="number"
                name="processedWeight"
                value={formData.processedWeight}
                onChange={handleChange}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-xs font-mono text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Claimed Recovered (kg)
              </label>
              <input
                type="number"
                name="claimedRecoveredWeight"
                value={formData.claimedRecoveredWeight}
                onChange={handleChange}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-xs font-mono text-emerald-400 font-bold focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Downstream Weight (kg)
              </label>
              <input
                type="number"
                name="downstreamWeight"
                value={formData.downstreamWeight}
                onChange={handleChange}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-xs font-mono text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Evidence attachment */}
        <EvidenceUploader />

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-5 py-2.5 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
          >
            <Sparkles size={16} />
            <span>{submitting ? 'Anchoring Evidence Root...' : 'Create Batch'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
