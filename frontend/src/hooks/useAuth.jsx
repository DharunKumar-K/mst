import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const ROLES = {
  PRODUCER: {
    id: 'PRODUCER',
    name: 'VoltForge Dynamics (Producer)',
    address: '0x12Fa908bCd8721Fa009218Fae0012A349887CcBa',
    desc: 'Generates industrial recyclable stream and deposits escrow bonds.'
  },
  RECYCLER: {
    id: 'RECYCLER',
    name: 'EcoLoop Hydrometallurgy (Recycler)',
    address: '0x3F881c2069B56eF70F04D6a61DEa3D8f4f9a0A21',
    desc: 'Processes waste streams, uploads sensor telemetry and claims recovery.'
  },
  AUDITOR: {
    id: 'AUDITOR',
    name: 'BureauVeritas AI Audit Unit (Auditor)',
    address: '0x77A19bE492801FdA21004C9912AcDa78912066fB',
    desc: 'Monitors integrity, reviews AI reports, and stakes fraud challenges.'
  },
  BUYER: {
    id: 'BUYER',
    name: 'CathodePure Advanced Materials (Buyer)',
    address: '0x99104Abe9128004CdaEF01928374aed881029348',
    desc: 'Confirms certified weight intake and pays downstream invoices.'
  }
};

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('cirqproof_user');
    return saved ? JSON.parse(saved) : ROLES.RECYCLER;
  });

  const selectRole = (roleKey) => {
    const role = ROLES[roleKey];
    if (role) {
      setCurrentUser(role);
      localStorage.setItem('cirqproof_user', JSON.stringify(role));
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('cirqproof_user');
  };

  return (
    <AuthContext.Provider value={{ currentUser, selectRole, logout, ROLES }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
