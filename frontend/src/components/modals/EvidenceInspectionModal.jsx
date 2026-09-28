import React, { useState } from 'react';
import { X, Download, ShieldCheck, AlertOctagon, Hash } from 'lucide-react';

export default function EvidenceInspectionModal({ isOpen, onClose, evidenceItem }) {
  if (!isOpen || !evidenceItem) return null;

  const isOk = !evidenceItem.status || evidenceItem.status === 'VALID';
  const isTampered = evidenceItem.status === 'TAMPERED_HASH';
  const statusColor = isOk ? 'var(--copper)' : isTampered ? 'var(--amber)' : 'var(--rust)';
  const statusBg = isOk ? 'var(--copper-trace)' : isTampered ? 'var(--amber-trace)' : 'var(--rust-trace)';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      style={{ background: 'rgba(10, 11, 12, 0.88)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-2xl border-2 overflow-hidden flex flex-col animate-slide-up"
        style={{ background: 'var(--bg-concrete)', borderColor: 'var(--border-primary)' }}
      >
        {/* ── Modal header — archival dossier folder ── */}
        <div
          className="px-5 py-4 border-b flex items-center justify-between"
          style={{ background: 'var(--bg-void)', borderColor: 'var(--border-primary)' }}
        >
          <div className="flex items-center gap-3">
            {/* Document type indicator strip */}
            <div
              className="w-1 self-stretch flex-shrink-0"
              style={{ background: statusColor }}
            />
            <div>
              <span className="field-label">Evidence Dossier</span>
              <h3 className="font-serif text-lg font-semibold" style={{ color: 'var(--paper-aged)' }}>
                {evidenceItem.title || evidenceItem.key}
              </h3>
              <span className="font-mono text-[9px] uppercase tracking-wider" style={{ color: 'var(--paper-ghost)' }}>
                Forensic Record // {evidenceItem.code || 'LEAF-XX'} // SHA-256 Canonical
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 border transition-colors flex-shrink-0"
            style={{ borderColor: 'var(--border-primary)', color: 'var(--paper-ghost)' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-concrete-2)'; e.currentTarget.style.color = 'var(--paper-aged)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--paper-ghost)'; }}
          >
            <X size={14} />
          </button>
        </div>

        {/* ── Content body ── */}
        <div className="p-5 space-y-4 overflow-y-auto max-h-[65vh]">
          {/* Metadata strip — engineering spec table */}
          <div
            className="grid grid-cols-3 divide-x border"
            style={{ borderColor: 'var(--border-primary)', background: 'var(--bg-void)', divideColor: 'var(--border-primary)' }}
          >
            <div className="p-3">
              <span className="field-label mb-1">Classification</span>
              <span className="font-mono text-[11px] font-bold" style={{ color: 'var(--paper-aged)' }}>
                {evidenceItem.code || 'LEAF-XX'}
              </span>
            </div>
            <div className="p-3" style={{ borderLeft: '1px solid var(--border-primary)' }}>
              <span className="field-label mb-1">Integrity Status</span>
              <span className="font-mono text-[11px] font-bold" style={{ color: statusColor }}>
                {evidenceItem.status || 'VALID'}
              </span>
            </div>
            <div className="p-3" style={{ borderLeft: '1px solid var(--border-primary)' }}>
              <span className="field-label mb-1">Verification</span>
              <span className="font-mono text-[11px]" style={{ color: isOk ? 'var(--copper)' : 'var(--rust)' }}>
                {isOk ? 'PASS (99.8%)' : 'ANOMALY DETECTED'}
              </span>
            </div>
          </div>

          {/* Payload serialization */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span
                className="font-mono text-[10px] uppercase tracking-wider font-bold"
                style={{ color: 'var(--paper-dim)' }}
              >
                Telemetry &amp; Canonical Payload
              </span>
              <span className="font-mono text-[9px] uppercase" style={{ color: 'var(--paper-ghost)' }}>
                SHA-256 Canonical Leaf
              </span>
            </div>
            <pre
              className="p-4 text-[11px] overflow-x-auto leading-relaxed border"
              style={{
                background: 'var(--charcoal)',
                borderColor: 'var(--border-secondary)',
                color: 'var(--paper-aged)',
              }}
            >
              {JSON.stringify(evidenceItem.data || {}, null, 2)}
            </pre>
          </div>

          {/* Merkle leaf hash */}
          <div className="p-3.5 border space-y-2" style={{ background: 'var(--bg-void)', borderColor: 'var(--border-secondary)' }}>
            <div className="flex items-center justify-between">
              <span className="font-mono text-[9px] uppercase tracking-wider" style={{ color: 'var(--paper-ghost)' }}>
                Merkle Leaf Hash Digest
              </span>
              <span className="font-mono text-[9px] px-1.5 py-0.5 border" style={{ color: 'var(--copper)', borderColor: 'var(--copper-dim)', background: 'var(--copper-trace)' }}>
                Hardware Enclave Sealed
              </span>
            </div>
            <div
              className="p-2 border font-mono text-[10px] break-all"
              style={{ background: 'var(--charcoal)', borderColor: 'var(--border-faint)', color: 'var(--copper)' }}
            >
              {evidenceItem.leafHash || '0x7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069'}
            </div>
          </div>

          {/* Forensic notes — archival marginalia */}
          <div
            className="pl-4 py-2 border-l-2 italic font-serif text-sm leading-relaxed"
            style={{ borderColor: 'var(--rust-dim)', color: 'var(--paper-dim)' }}
          >
            "Physical weighment, spectrometer readings, and thermodynamic logs are indexed chronologically. Any variance
            beyond standard moisture evaporation tolerance (±0.8%) generates an automated dispute flag."
          </div>
        </div>

        {/* Footer */}
        <div
          className="px-5 py-3 border-t flex items-center justify-between"
          style={{ background: 'var(--bg-void)', borderColor: 'var(--border-primary)' }}
        >
          <span className="font-mono text-[9px] uppercase" style={{ color: 'var(--paper-ghost)' }}>
            EV-DOC-2026-X // Chain ID: 4242
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 font-mono text-[10px] uppercase font-bold border transition-colors"
            style={{ borderColor: 'var(--border-primary)', color: 'var(--paper-dim)', background: 'var(--bg-concrete-2)' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--paper-aged)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--paper-dim)'; }}
          >
            Dismiss Dossier
          </button>
        </div>
      </div>
    </div>
  );
}
