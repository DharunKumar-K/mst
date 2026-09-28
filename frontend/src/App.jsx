import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ForensicWorkbench from './pages/ForensicWorkbench';
import Blockchain from './pages/Blockchain';
import Simulator from './pages/Simulator';
import Login from './pages/Login';
import { useAuth } from './hooks/useAuth';

function ProtectedLayout() {
  const [isCommandOpen, setIsCommandOpen] = useState(false);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar onOpenCommand={() => setIsCommandOpen(true)} />
      <main>
        <Routes>
          <Route path="/"           element={<ForensicWorkbench />} />
          <Route path="/blockchain" element={<Blockchain />} />
          <Route path="/simulator"  element={<Simulator />} />
          <Route path="*"           element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/*"     element={<ProtectedLayout />} />
    </Routes>
  );
}
