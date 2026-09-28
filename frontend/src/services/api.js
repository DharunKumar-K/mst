import { mockService } from './mock';

const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) || 'http://localhost:4000/api';
const USE_MOCK_ENV = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_USE_MOCK) === 'true';

// Token management
export const getAuthToken = () => {
  try {
    return localStorage.getItem('cirqproof_token') || null;
  } catch {
    return null;
  }
};

export const setAuthToken = (token) => {
  try {
    if (token) localStorage.setItem('cirqproof_token', token);
    else localStorage.removeItem('cirqproof_token');
  } catch {}
};

const getHeaders = (isMultipart = false) => {
  const token = getAuthToken();
  const headers = {};
  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

// Safe request wrapper with timeout and fallback
async function request(path, options = {}) {
  const url = `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);

  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        ...getHeaders(options.isMultipart),
        ...options.headers,
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const json = await res.json().catch(() => null);
    if (!res.ok) {
      const err = new Error(json?.error || `Request failed with status ${res.status}`);
      err.status = res.status;
      err.data = json;
      throw err;
    }
    return json;
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

export const api = {
  isMock: USE_MOCK_ENV,

  // Health
  async checkHealth() {
    try {
      const res = await fetch(`${API_BASE.replace(/\/api$/, '')}/health`, { signal: AbortSignal.timeout(2000) });
      const data = await res.json();
      return data?.ok && data?.data?.status === 'ok';
    } catch {
      return false;
    }
  },

  // Auth
  async login({ email, password }) {
    try {
      const res = await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      if (res?.data?.token) setAuthToken(res.data.token);
      return res?.data;
    } catch (err) {
      console.warn('Backend login unavailable or failed, falling back to local session', err.message);
      // Fallback local session
      return {
        user: { name: email.split('@')[0], email, role: 'AUDITOR' },
        token: 'mock-jwt-token',
      };
    }
  },

  async register(payload) {
    return request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getMe() {
    try {
      const res = await request('/auth/me');
      return res?.data?.user;
    } catch {
      return null;
    }
  },

  // Batches
  async getBatches() {
    if (USE_MOCK_ENV) return mockService.getBatches();
    try {
      const res = await request('/batches');
      if (res?.ok && Array.isArray(res?.data?.batches)) {
        return res.data.batches;
      }
      return mockService.getBatches();
    } catch {
      return mockService.getBatches();
    }
  },

  async getBatchById(id) {
    if (USE_MOCK_ENV) return mockService.getBatchById(id);
    try {
      const res = await request(`/batches/${id}`);
      return res?.data?.batch || mockService.getBatchById(id);
    } catch {
      return mockService.getBatchById(id);
    }
  },

  async createBatch(payload) {
    if (USE_MOCK_ENV) return mockService.createBatch(payload);
    try {
      const res = await request('/batches', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      return res?.data?.batch || mockService.createBatch(payload);
    } catch (err) {
      console.warn('Backend createBatch failed, fallback to mock', err);
      return mockService.createBatch(payload);
    }
  },

  // Simulation
  async getScenarios() {
    try {
      const res = await request('/simulation/scenarios');
      return res?.data?.scenarios || null;
    } catch {
      return null;
    }
  },

  async generateScenario(scenario, batchId) {
    try {
      const res = await request('/simulation/generate', {
        method: 'POST',
        body: JSON.stringify({ scenario, batchId }),
      });
      return res?.data;
    } catch (err) {
      console.warn('Backend simulation/generate failed, using scenario fallback', err.message);
      return mockService.getBatchById(batchId);
    }
  },

  async tamperBatch(batchId, data) {
    try {
      const res = await request(`/simulation/tamper/${batchId}`, {
        method: 'POST',
        body: JSON.stringify({ data }),
      });
      return res?.data;
    } catch (err) {
      console.warn('Backend simulation/tamper failed', err.message);
      return null;
    }
  },

  async getSimulationEvents(batchId) {
    try {
      const res = await request(`/simulation/events/${batchId}`);
      return res?.data?.events || [];
    } catch {
      return [];
    }
  },

  // Evidence
  async getEvidence(batchId) {
    try {
      const res = await request(`/evidence/${batchId}`);
      return res?.data?.evidence || [];
    } catch {
      return mockService.getBatchById(batchId)?.evidenceChain || [];
    }
  },

  async getIntegrity(batchId) {
    try {
      const res = await request(`/evidence/${batchId}/integrity`);
      return res?.data || { allHashesMatch: true, mismatchedEvidenceIds: [] };
    } catch {
      const batch = mockService.getBatchById(batchId);
      const isTampered = batch?.scenario === 'TAMPERED' || batch?.verificationStatus === 'INVALID';
      return {
        allHashesMatch: !isTampered,
        mismatchedEvidenceIds: isTampered ? ['EV-003'] : [],
      };
    }
  },

  // AI Reconciliation
  async reconcileBatch(batchId) {
    try {
      const res = await request('/ai/reconcile', {
        method: 'POST',
        body: JSON.stringify({ batchId }),
      });
      return res?.data?.report;
    } catch (err) {
      console.warn('Backend AI reconciliation failed, fallback to mock AI analysis', err.message);
      const batch = mockService.getBatchById(batchId);
      return batch?.aiAnalysis || null;
    }
  },

  async getAiReport(batchId) {
    try {
      const res = await request(`/ai/report/${batchId}`);
      return res?.data?.report;
    } catch {
      return mockService.getBatchById(batchId)?.aiAnalysis || null;
    }
  },

  // Blockchain & Smart Contracts Integration
  async getBlockchainConfig() {
    try {
      const res = await request('/blockchain/config');
      return res;
    } catch {
      return {
        network: 'mst_testnet',
        chainId: '91562037',
        registryAddress: '0xFE9236E0A273c00C901D70A9C7D347f2A5d56633',
        settlementAddress: '0xade8B1Caa033Cf637fC52c5746798D58cAdcb372',
      };
    }
  },

  async challengeBatch(batchId, challengeData) {
    try {
      const res = await request('/challenge', {
        method: 'POST',
        body: JSON.stringify({
          batchId,
          challenger: challengeData.challenger || '0xAuditorTest',
          reason: challengeData.reason || challengeData.ground,
          txHash: challengeData.txHash || `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
        }),
      });
      return res;
    } catch {
      return mockService.challengeBatch(batchId, challengeData);
    }
  },

  async getChallenges(batchId) {
    try {
      const res = await request(`/challenge/${batchId}`);
      return res?.challenges || [];
    } catch {
      return [];
    }
  },

  async depositSettlement({ batchId, amount, payer, txHash }) {
    try {
      const res = await request('/settlement/deposit', {
        method: 'POST',
        body: JSON.stringify({ batchId, amount, payer, txHash }),
      });
      return res;
    } catch (err) {
      console.warn('Backend settlement deposit failed, using fallback', err.message);
      return mockService.updateSettlement(batchId, 'HELD');
    }
  },

  async releaseSettlement({ batchId, txHash }) {
    try {
      const res = await request('/settlement/release', {
        method: 'POST',
        body: JSON.stringify({ batchId, txHash }),
      });
      return res;
    } catch (err) {
      console.warn('Backend settlement release failed, using fallback', err.message);
      return mockService.updateSettlement(batchId, 'RELEASED');
    }
  },

  async submitAttestation({ batchId, attestor, txHash }) {
    try {
      const res = await request('/attestation', {
        method: 'POST',
        body: JSON.stringify({ batchId, attestor, txHash }),
      });
      return res;
    } catch {
      return null;
    }
  },

  async getAttestations(batchId) {
    try {
      const res = await request(`/attestation/${batchId}`);
      return res?.attestations || [];
    } catch {
      return [];
    }
  },

  async resetData() {
    return mockService.resetToDefaults();
  },
};

export default api;
