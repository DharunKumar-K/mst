import React from 'react';
import { Scale, FileText, Cpu, Truck, Activity, CheckCircle, AlertCircle } from 'lucide-react';
import StatusBadge from './StatusBadge';

export default function EvidenceList({ evidence, evidenceRoot, integrityStatus }) {
  if (!evidence) return null;

  const items = [
    {
      key: 'weighbridge',
      title: 'Weighbridge Intake Slip',
      icon: Scale,
      data: evidence.weighbridge,
      desc: `Weight: ${evidence.weighbridge?.weight} kg | Slip #${evidence.weighbridge?.docId}`
    },
    {
      key: 'processingLog',
      title: 'Process Reactor Logs',
      icon: Activity,
      data: evidence.processingLog,
      desc: `Runtime: ${evidence.processingLog?.runtimeHours}h | Energy: ${evidence.processingLog?.energyKwh} kWh | Temp: ${evidence.processingLog?.temperatureAvg}`
    },
    {
      key: 'outputRecord',
      title: 'Output Assay & Weight',
      icon: FileText,
      data: evidence.outputRecord,
      desc: `Recovered: ${evidence.outputRecord?.recoveredWeight} kg | ${evidence.outputRecord?.grade}`
    },
    {
      key: 'downstreamInvoice',
      title: 'Downstream Off-taker Receipt',
      icon: Truck,
      data: evidence.downstreamInvoice,
      desc: `Invoice #${evidence.downstreamInvoice?.invoiceNo} | Received: ${evidence.downstreamInvoice?.verifiedWeight} kg`
    },
    {
      key: 'telemetry',
      title: 'IoT Enclave Telemetry',
      icon: Cpu,
      data: evidence.telemetry,
      desc: `Sensor Integrity: ${evidence.telemetry?.sensorIntegrity} | Streaming: ${evidence.telemetry?.continuousLogging ? 'Continuous' : 'Interrupted'}`
    }
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
        <div>
          <h4 className="font-semibold text-slate-100 flex items-center gap-2">
            Multi-Tier Verifiable Evidence Root
          </h4>
          <p className="text-xs text-slate-400">Cryptographically anchored off-chain and on-chain inputs</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Integrity:</span>
          <StatusBadge status={integrityStatus || 'VALID'} size="sm" />
        </div>
      </div>

      <div className="space-y-3">
        {items.map((item) => {
          const Icon = item.icon;
          const status = item.data?.status || 'VALID';
          const isValid = status === 'VALID';

          return (
            <div 
              key={item.key} 
              className={`p-3.5 rounded-lg border flex items-center justify-between transition-colors ${
                isValid 
                  ? 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700' 
                  : 'bg-rose-950/20 border-rose-500/30'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg border ${
                  isValid ? 'bg-slate-800/60 border-slate-700 text-cyan-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                }`}>
                  <Icon size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-200">{item.title}</span>
                    {isValid ? (
                      <CheckCircle size={14} className="text-emerald-400" />
                    ) : (
                      <AlertCircle size={14} className="text-rose-400" />
                    )}
                  </div>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">{item.desc}</p>
                </div>
              </div>

              <div>
                <StatusBadge status={status} size="sm" />
              </div>
            </div>
          );
        })}
      </div>

      {evidenceRoot && (
        <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between text-xs font-mono gap-2 bg-slate-950/40 p-2.5 rounded-lg">
          <span className="text-slate-400 uppercase tracking-wider">Merkle Evidence Root:</span>
          <span className="text-cyan-400 truncate max-w-sm" title={evidenceRoot}>{evidenceRoot}</span>
        </div>
      )}
    </div>
  );
}
