import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, ROLES } from '../hooks/useAuth';
import api from '../services/api';
import { ArrowRight, ArrowDown, ChevronRight } from 'lucide-react';


/* ─────────────────────────────────────────────────
   Material Flow Diagram — left panel hero visual
   Shows animated material moving through stages
───────────────────────────────────────────────── */
const FLOW_STAGES = [
  { kg: '1,000 KG', label: 'Input Material',   sub: 'Waste feedstock collected',    pct: 100 },
  { kg:   '950 KG', label: 'Processed',         sub: 'Thermal / chemical treatment', pct: 95  },
  { kg:   '680 KG', label: 'Recovered',         sub: 'Certified material yield',     pct: 68  },
  { kg:   '675 KG', label: 'Verified Output',   sub: 'On-chain attestation',         pct: 67  },
];

function FlowParticle({ delay, duration, x }) {
  return (
    <div
      className="flow-particle"
      style={{
        width: 5,
        height: 5,
        background: 'rgba(255,255,255,0.55)',
        left: x,
        top: 0,
        animationDuration: `${duration}s`,
        animationDelay: `${delay}s`,
      }}
    />
  );
}

function MaterialFlowDiagram({ variant = 'login' }) {
  const particles = [
    { delay: 0,    duration: 1.8, x: '46%' },
    { delay: 0.5,  duration: 2.1, x: '50%' },
    { delay: 0.9,  duration: 1.6, x: '54%' },
    { delay: 1.3,  duration: 2.0, x: '48%' },
    { delay: 1.7,  duration: 1.9, x: '52%' },
  ];

  return (
    <div className="flex flex-col items-center w-full select-none">
      {FLOW_STAGES.map((stage, idx) => {
        const isLast = idx === FLOW_STAGES.length - 1;
        return (
          <div key={idx} className="flex flex-col items-center w-full">
            {/* Stage node */}
            <div
              className="animate-stage-enter"
              style={{ animationDelay: `${idx * 120}ms` }}
            >
              <div className="flex items-center gap-4">
                {/* Left: kg measurement */}
                <div className="text-right" style={{ width: 100 }}>
                  <div
                    className="font-mono font-bold text-white"
                    style={{ fontSize: idx === 0 ? 22 : 18, letterSpacing: '-0.03em' }}
                  >
                    {stage.kg}
                  </div>
                </div>

                {/* Center: node + bar */}
                <div className="flex flex-col items-center" style={{ width: 44 }}>
                  {/* Dot */}
                  <div
                    style={{
                      width: idx === 0 ? 14 : 10,
                      height: idx === 0 ? 14 : 10,
                      borderRadius: '50%',
                      background: idx === 3 ? '#4F8A62' : 'rgba(255,255,255,0.9)',
                      border: '2px solid rgba(255,255,255,0.4)',
                      flexShrink: 0,
                    }}
                  />
                  {/* Width bar */}
                  <div
                    style={{
                      height: 3,
                      background: 'rgba(255,255,255,0.25)',
                      width: 36,
                      marginTop: 5,
                      borderRadius: 2,
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${stage.pct}%`,
                        background: idx === 3 ? '#4F8A62' : 'rgba(255,255,255,0.8)',
                        transition: 'width 1s ease',
                      }}
                    />
                  </div>
                </div>

                {/* Right: label */}
                <div style={{ width: 140 }}>
                  <div
                    className="font-sans font-semibold text-white"
                    style={{ fontSize: 13 }}
                  >
                    {stage.label}
                  </div>
                  <div
                    className="font-sans"
                    style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', marginTop: 1 }}
                  >
                    {stage.sub}
                  </div>
                </div>
              </div>
            </div>

            {/* Connector with particles */}
            {!isLast && (
              <div
                className="relative flex justify-center"
                style={{ height: 48, width: '100%' }}
              >
                {/* Vertical line */}
                <div
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: 0,
                    bottom: 0,
                    width: 1,
                    background: 'rgba(255,255,255,0.2)',
                    transform: 'translateX(-50%)',
                  }}
                />
                {/* Particles */}
                <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1 }}>
                  {particles.slice(0, 3).map((p, pi) => (
                    <FlowParticle
                      key={pi}
                      delay={p.delay + idx * 0.3}
                      duration={p.duration}
                      x="-2px"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────────────
   Login Transition Overlay
───────────────────────────────────────────────── */
function LoginTransitionOverlay({ role, onComplete }) {
  const stages = ['COLLECT', 'PROCESS', 'RECOVER', 'VERIFY'];
  const [activeStage, setActiveStage] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const timers = stages.map((_, i) =>
      setTimeout(() => setActiveStage(i + 1), 200 + i * 280)
    );
    const finalTimer = setTimeout(() => {
      setDone(true);
      setTimeout(onComplete, 300);
    }, 200 + stages.length * 280 + 300);

    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(finalTimer);
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
      style={{
        background: 'var(--teal)',
        opacity: done ? 0 : 1,
        transition: 'opacity 0.4s ease',
      }}
    >
      {/* Animated flow bar */}
      <div className="flex items-center gap-0 mb-8">
        {stages.map((stage, idx) => {
          const isActive = idx < activeStage;
          const isCurrent = idx === activeStage - 1;
          return (
            <React.Fragment key={stage}>
              <div
                style={{
                  padding: '8px 18px',
                  background: isActive ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${isActive ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.1)'}`,
                  borderRadius: 3,
                  transition: 'all 0.25s ease',
                  transform: isCurrent ? 'scale(1.06)' : 'scale(1)',
                }}
              >
                <span
                  className="font-mono font-bold uppercase tracking-widest"
                  style={{ fontSize: 11, color: isActive ? '#fff' : 'rgba(255,255,255,0.3)' }}
                >
                  {stage}
                </span>
              </div>
              {idx < stages.length - 1 && (
                <div
                  style={{
                    width: 32,
                    height: 1,
                    background: isActive ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.1)',
                    transition: 'background 0.3s ease',
                  }}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      <div
        className="font-mono text-white/50 text-xs tracking-widest uppercase"
        style={{ letterSpacing: '0.2em' }}
      >
        Loading workspace...
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────
   Role selector pill
───────────────────────────────────────────────── */
function RolePill({ roleKey, label, isSelected, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(roleKey)}
      style={{
        padding: '6px 14px',
        borderRadius: 3,
        border: `1px solid ${isSelected ? 'var(--teal)' : 'var(--border)'}`,
        background: isSelected ? 'var(--teal-light)' : 'var(--surface)',
        color: isSelected ? 'var(--teal)' : 'var(--text-muted)',
        fontSize: 12,
        fontWeight: 600,
        fontFamily: 'Plus Jakarta Sans, sans-serif',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
      }}
    >
      {label}
    </button>
  );
}

/* ─────────────────────────────────────────────────
   Main Login Page
───────────────────────────────────────────────── */
export default function Login() {
  const { selectRole } = useAuth();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState('RECYCLER');
  const [showTransition, setShowTransition] = useState(false);
  const [email, setEmail] = useState('operator@cirqproof.io');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);

  const roleOptions = [
    { key: 'RECYCLER',  label: 'Recycler' },
    { key: 'AUDITOR',   label: 'Auditor' },
    { key: 'PRODUCER',  label: 'Producer' },
    { key: 'BUYER',     label: 'Off-taker' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    selectRole(selectedRole);
    setShowTransition(true);
  };

  const handleTransitionComplete = () => {
    navigate('/');
  };

  return (
    <>
      {showTransition && (
        <LoginTransitionOverlay
          role={selectedRole}
          onComplete={handleTransitionComplete}
        />
      )}

      <div
        className="min-h-screen flex overflow-hidden"
        style={{ background: 'var(--bg)' }}
      >
        {/* ── LEFT: Material flow panel ── */}
        <div
          className="hidden lg:flex flex-col justify-between flex-shrink-0 relative overflow-hidden"
          style={{
            width: '45%',
            background: 'var(--teal)',
            padding: '48px 56px',
          }}
        >
          {/* Subtle background texture */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `
                radial-gradient(circle at 20% 50%, rgba(255,255,255,0.04) 0%, transparent 50%),
                radial-gradient(circle at 80% 80%, rgba(255,255,255,0.03) 0%, transparent 40%)
              `,
              pointerEvents: 'none',
            }}
          />

          {/* Logo */}
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              {/* Mark */}
              <div
                style={{
                  width: 32,
                  height: 32,
                  border: '2px solid rgba(255,255,255,0.5)',
                  borderRadius: 4,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <div
                  style={{
                    width: 14,
                    height: 14,
                    border: '2px solid rgba(255,255,255,0.8)',
                    borderRadius: '50%',
                  }}
                />
              </div>
              <span
                className="font-serif font-bold text-white"
                style={{ fontSize: 22, letterSpacing: '-0.03em' }}
              >
                CirqProof
              </span>
            </div>
            <div
              className="font-mono uppercase tracking-widest text-white/40"
              style={{ fontSize: 10, paddingLeft: 44 }}
            >
              Material Forensics Platform
            </div>
          </div>

          {/* Hero headline */}
          <div className="relative z-10">
            <h1
              className="font-serif text-white"
              style={{ fontSize: 42, lineHeight: 1.08, marginBottom: 16 }}
            >
              From Waste to<br />
              Verified Impact
            </h1>
            <p
              className="font-sans text-white/60"
              style={{ fontSize: 15, lineHeight: 1.65, maxWidth: 300 }}
            >
              Turn real-world recycling data into trusted evidence — anchored on-chain, verified by AI.
            </p>
          </div>

          {/* Material flow diagram */}
          <div className="relative z-10 py-4">
            <div
              className="label-caps mb-4"
              style={{ color: 'rgba(255,255,255,0.4)' }}
            >
              Active material trace — Batch #2026-0041
            </div>
            <MaterialFlowDiagram />
          </div>

          {/* Bottom spec annotation */}
          <div
            className="relative z-10 font-mono text-white/30"
            style={{ fontSize: 10, letterSpacing: '0.08em' }}
          >
            MST TESTNET // CHAIN ID 4242 // AI VERIFIER ACTIVE
          </div>
        </div>

        {/* ── RIGHT: Authentication panel ── */}
        <div
          className="flex-1 flex items-center justify-center px-6 py-12"
          style={{ background: 'var(--bg)' }}
        >
          <div style={{ width: '100%', maxWidth: 420 }}>
            {/* Evidence sheet header */}
            <div
              className="evidence-doc mb-8"
              style={{ padding: '20px 24px', borderTop: '3px solid var(--teal)' }}
            >
              <div className="flex items-start justify-between mb-1">
                <div>
                  <div className="label-caps mb-2">Workspace Access</div>
                  <h2
                    className="font-serif"
                    style={{ fontSize: 28, color: 'var(--text)', lineHeight: 1 }}
                  >
                    Welcome Back
                  </h2>
                  <p
                    className="font-sans mt-2"
                    style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}
                  >
                    Sign in to your forensic evidence workstation.
                  </p>
                </div>
                <div
                  className="font-mono text-right"
                  style={{ fontSize: 10, color: 'var(--text-faint)', lineHeight: 1.7 }}
                >
                  <div>DOC-2026-0041</div>
                  <div>28 Sep 2026</div>
                </div>
              </div>
            </div>

            {/* Auth form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Email */}
              <div>
                <label
                  className="label-caps"
                  style={{ display: 'block', marginBottom: 6 }}
                >
                  Email address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    fontSize: 14,
                    fontFamily: 'Plus Jakarta Sans, sans-serif',
                  }}
                  placeholder="operator@cirqproof.io"
                />
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
                  <label className="label-caps">Password</label>
                  <button
                    type="button"
                    style={{
                      fontSize: 12,
                      color: 'var(--teal)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontFamily: 'Plus Jakarta Sans, sans-serif',
                    }}
                  >
                    Forgot password?
                  </button>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    fontSize: 14,
                    fontFamily: 'Plus Jakarta Sans, sans-serif',
                  }}
                  placeholder="••••••••"
                />
              </div>

              {/* Role selection */}
              <div>
                <label className="label-caps" style={{ display: 'block', marginBottom: 8 }}>
                  Access role
                </label>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {roleOptions.map(r => (
                    <RolePill
                      key={r.key}
                      roleKey={r.key}
                      label={r.label}
                      isSelected={selectedRole === r.key}
                      onSelect={setSelectedRole}
                    />
                  ))}
                </div>
              </div>

              {/* Remember me */}
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  cursor: 'pointer',
                  fontSize: 13,
                  color: 'var(--text-muted)',
                  fontFamily: 'Plus Jakarta Sans, sans-serif',
                }}
              >
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={e => setRemember(e.target.checked)}
                  style={{ width: 15, height: 15, accentColor: 'var(--teal)', cursor: 'pointer' }}
                />
                Keep me signed in
              </label>

              {/* Submit */}
              <button
                type="submit"
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '13px 24px', fontSize: 14 }}
              >
                Enter Workspace
                <ArrowRight size={16} />
              </button>
            </form>

            {/* Divider */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                margin: '24px 0',
              }}
            >
              <hr className="rule" style={{ flex: 1 }} />
              <span className="font-mono" style={{ fontSize: 10, color: 'var(--text-faint)' }}>
                OR ACCESS AS
              </span>
              <hr className="rule" style={{ flex: 1 }} />
            </div>

            {/* Quick role access */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {roleOptions.map(r => (
                <button
                  key={r.key}
                  type="button"
                  onClick={() => {
                    setSelectedRole(r.key);
                    selectRole(r.key);
                    setShowTransition(true);
                  }}
                  style={{
                    padding: '9px 12px',
                    border: '1px solid var(--border)',
                    borderRadius: 4,
                    background: 'var(--surface)',
                    fontSize: 12,
                    fontWeight: 600,
                    color: 'var(--text-muted)',
                    fontFamily: 'Plus Jakarta Sans, sans-serif',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'var(--teal)';
                    e.currentTarget.style.color = 'var(--teal)';
                    e.currentTarget.style.background = 'var(--teal-light)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.color = 'var(--text-muted)';
                    e.currentTarget.style.background = 'var(--surface)';
                  }}
                >
                  <span>{r.label}</span>
                  <ChevronRight size={12} />
                </button>
              ))}
            </div>

            {/* Footer */}
            <div
              className="font-mono text-center mt-8"
              style={{ fontSize: 10, color: 'var(--text-faint)', lineHeight: 1.8 }}
            >
              MST Testnet · Chain ID 4242<br />
              AI Verifier Active · Autonomous Reconciliation Engine
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
