import React, { useState, useEffect } from 'react';
import { Scale, Activity, FileText, Truck, Cpu, Eye, Check, AlertOctagon, AlertTriangle } from 'lucide-react';

const EVIDENCE_STEPS = [
  {
    key: 'weighbridge',
    code: 'LEAF-01',
    title: 'Weighbridge Intake Slip',
    desc: 'Physical mass intake — certified scale calibration, seal #',
    icon: Scale,
    dataKey: 'weighbridge',
    hashShort: '0x3a91…b42e',
  },
  {
    key: 'processingLog',
    code: 'LEAF-02',
    title: 'Thermal Hydro-Reactor Telemetry',
    desc: 'Continuous process logs — temperature, energy draw, runtime',
    icon: Activity,
    dataKey: 'processingLog',
    hashShort: '0x8fa1…912c',
  },
  {
    key: 'outputRecord',
    code: 'LEAF-03',
    title: 'Assay Grade & Recovery Weighment',
    desc: 'Output sampling, grade, recovery mass',
    icon: FileText,
    dataKey: 'outputRecord',
    hashShort: '0x110e…88a4',
  },
  {
    key: 'downstreamInvoice',
    code: 'LEAF-04',
    title: 'Downstream Certified Bill of Lading',
    desc: 'Buyer off-taker weighbridge — counter-certified receipt',
    icon: Truck,
    dataKey: 'downstreamInvoice',
    hashShort: '0x99bc…2310',
  },
  {
    key: 'telemetry',
    code: 'LEAF-05',
    title: 'Enclave Hardware Cryptographic Pulse',
    desc: 'Secure hardware attestation — tamper-evident sensor log',
    icon: Cpu,
    dataKey: 'telemetry',
    hashShort: '0x55ca…0981',
  },
];

const TIMESTAMPS = [
  '08:15:22',
  '10:30:00',
  '12:00:15',
  '13:45:00',
  '14:00:00',
];

function getStatusMeta(status, key) {
  if (status === 'VALID') return { label: 'VALID', color: 'var(--copper)', bg: 'var(--copper-trace)', border: 'var(--copper-dim)' };
  if (status === 'TAMPERED_HASH') return { label: 'TAMPERED', color: 'var(--amber)', bg: 'var(--amber-trace)', border: 'var(--amber-dim)' };
  if (status === 'MISMATCH') return { label: 'MISMATCH', color: 'var(--rust)', bg: 'var(--rust-trace)', border: 'var(--rust-dim)' };
  if (status === 'SUSPICIOUS') return { label: 'SUSPICIOUS', color: 'var(--rust)', bg: 'var(--rust-trace)', border: 'var(--rust-dim)' };
  return { label: 'VALID', color: 'var(--copper)', bg: 'var(--copper-trace)', border: 'var(--copper-dim)' };
}

export default function EvidenceActivityChain({ evidence, onInspect }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(false);
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, [evidence]);

  if (!evidence) return null;

  const validCount = EVIDENCE_STEPS.filter(s => {
    const d = evidence[s.dataKey];
    return !d?.status || d?.status === 'VALID';
  }).length;

  return (
    <div className="border border-[var(--border-primary)]" style={{ background: 'var(--bg-concrete)' }}>
      {/* Header */}
      <div
        className="px-5 py-3.5 border-b border-[var(--border-primary)] flex items-center justify-between"
        style={{ background: 'var(--bg-void)' }}
      >
        <div>
          <h4 className="font-serif text-base font-semibold" style={{ color: 'var(--paper-aged)' }}>
            Forensic Evidence Chain
          </h4>
          <span className="font-mono text-[9px] uppercase tracking-widest" style={{ color: 'var(--paper-ghost)' }}>
            Chronological Merkle Leaf Anchors // Provable Attestation
          </span>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold" style={{ color: validCount === 5 ? 'var(--copper)' : 'var(--rust)' }}>
          {validCount}/5
          <span className="font-mono text-[9px] uppercase" style={{ color: 'var(--paper-ghost)' }}>leaves verified</span>
        </div>
      </div>

      {/* Timeline list */}
      <div className="p-5">
        <div className="relative pl-6">
          {/* Vertical rail */}
          <div
            className="absolute left-[5px] top-3 bottom-3 w-px"
            style={{ background: 'var(--border-primary)' }}
          />

          <div className="space-y-2.5">
            {EVIDENCE_STEPS.map((step, idx) => {
              const Icon = step.icon;
              const data = evidence[step.dataKey];
              const rawStatus = data?.status;
              const meta = getStatusMeta(rawStatus, step.key);
              const isOk = rawStatus === 'VALID' || !rawStatus;

              const staggerClass = `stagger-${idx + 1}`;

              return (
                <div
                  key={step.key}
                  className={`relative ${mounted ? `animate-slide-up ${staggerClass}` : 'opacity-0'} group`}
                >
                  {/* Timeline node */}
                  <div
                    className="absolute -left-[21px] top-3.5 w-[9px] h-[9px] border transition-colors"
                    style={{
                      borderColor: meta.color,
                      background: 'var(--bg-concrete)',
                    }}
                  />

                  <div
                    className="flex items-stretch gap-0 border transition-all"
                    style={{
                      background: isOk ? 'var(--bg-void)' : meta.bg,
                      borderColor: isOk ? 'var(--border-secondary)' : meta.border,
                    }}
                  >
                    {/* Left accent bar */}
                    <div
                      className="w-[3px] flex-shrink-0"
                      style={{ background: meta.color, opacity: 0.6 }}
                    />

                    <div className="flex-1 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                      {/* Content */}
                      <div className="flex items-start gap-3">
                        <div
                          className="p-1.5 border mt-0.5 flex-shrink-0"
                          style={{
                            borderColor: 'var(--border-primary)',
                            background: 'var(--bg-concrete-2)',
                            color: meta.color,
                          }}
                        >
                          <Icon size={13} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="font-mono text-[9px] uppercase tracking-wider px-1" style={{ color: 'var(--paper-ghost)', background: 'var(--bg-concrete-2)' }}>
                              {step.code}
                            </span>
                            <span className="font-mono text-xs font-bold" style={{ color: 'var(--paper-aged)' }}>
                              {step.title}
                            </span>
                            <span className="font-mono text-[9px]" style={{ color: 'var(--paper-ghost)' }}>
                              {TIMESTAMPS[idx]} IST
                            </span>
                          </div>
                          <p className="font-mono text-[10px]" style={{ color: 'var(--paper-dim)' }}>
                            {step.desc}
                          </p>
                          <div className="mt-1 font-mono text-[9px]" style={{ color: 'var(--paper-ghost)' }}>
                            SHA-256: <span style={{ color: meta.color }}>{step.hashShort}</span>
                          </div>
                        </div>
                      </div>

                      {/* Controls */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span
                          className="font-mono text-[9px] font-bold uppercase px-2 py-0.5 border"
                          style={{ color: meta.color, borderColor: meta.border, background: meta.bg }}
                        >
                          {meta.label}
                        </span>
                        <button
                          onClick={() => onInspect && onInspect({ ...step, data, status: rawStatus || 'VALID', leafHash: step.hashShort })}
                          className="p-1.5 border transition-all"
                          style={{ borderColor: 'var(--border-primary)', background: 'var(--bg-concrete-2)', color: 'var(--paper-ghost)' }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = 'var(--copper)';
                            e.currentTarget.style.color = 'var(--paper-aged)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = 'var(--border-primary)';
                            e.currentTarget.style.color = 'var(--paper-ghost)';
                          }}
                          title="Open Evidence Dossier"
                        >
                          <Eye size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
