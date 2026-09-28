import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
  LayoutDashboard, 
  PlusCircle, 
  FileCheck2, 
  ShieldAlert, 
  Coins, 
  Cpu, 
  Blocks,
  LogOut,
  Radio,
  ExternalLink
} from 'lucide-react';

export default function Navbar() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/verification', label: 'Verification', icon: FileCheck2 },
    { to: '/create-batch', label: 'Create Batch', icon: PlusCircle },
    { to: '/simulator', label: 'Simulator Panel', icon: Cpu, highlight: true },
    { to: '/challenges', label: 'Challenges', icon: ShieldAlert },
    { to: '/settlements', label: 'Settlements', icon: Coins },
    { to: '/blockchain', label: 'MST Explorer', icon: Blocks },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-6">
            <div 
              onClick={() => navigate('/')} 
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-400 p-0.5 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <Radio size={18} className="text-emerald-400 animate-pulse" />
                </div>
              </div>
              <div>
                <span className="text-lg font-black tracking-wider text-white">CIRQ<span className="text-emerald-400">PROOF</span></span>
                <span className="block text-[10px] font-mono text-slate-400 -mt-1">MST VERIFIED</span>
              </div>
            </div>

            {/* Navigation links */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map(item => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) => `px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 transition-all ${
                      isActive 
                        ? 'bg-slate-800 text-emerald-400 shadow-sm' 
                        : item.highlight
                        ? 'text-cyan-400 hover:bg-cyan-950/40 hover:text-cyan-300'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                    }`}
                  >
                    <Icon size={14} />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* User profile & Network pill */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>MST Testnet: 4242</span>
            </div>

            {currentUser ? (
              <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5">
                <div className="text-right hidden sm:block">
                  <span className="text-xs font-semibold text-slate-200 block truncate max-w-[140px]">
                    {currentUser.name}
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400">
                    {currentUser.address.substring(0, 6)}...{currentUser.address.slice(-4)}
                  </span>
                </div>
                <button
                  onClick={() => {
                    logout();
                    navigate('/login');
                  }}
                  title="Switch Role / Logout"
                  className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
