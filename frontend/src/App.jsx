import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import CreateBatch from './pages/CreateBatch';
import BatchDetails from './pages/BatchDetails';
import Verification from './pages/Verification';
import Challenges from './pages/Challenges';
import Settlements from './pages/Settlements';
import Blockchain from './pages/Blockchain';
import Simulator from './pages/Simulator';
import Login from './pages/Login';
import { useAuth } from './hooks/useAuth';

function ProtectedLayout() {
  const { currentUser } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col text-slate-100">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/create-batch" element={<CreateBatch />} />
          <Route path="/batch/:id" element={<BatchDetails />} />
          <Route path="/verification" element={<Verification />} />
          <Route path="/challenges" element={<Challenges />} />
          <Route path="/settlements" element={<Settlements />} />
          <Route path="/blockchain" element={<Blockchain />} />
          <Route path="/simulator" element={<Simulator />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <footer className="border-t border-slate-800/80 bg-slate-950/80 py-4 text-center text-xs text-slate-500 font-mono">
        CirqProof • MST Testnet Attestation Protocol • Chain ID: 4242
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/*" element={<ProtectedLayout />} />
    </Routes>
  );
}
