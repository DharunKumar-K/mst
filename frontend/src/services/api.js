import { mockService } from './mock';

// Allow toggle via VITE_USE_MOCK or fallback to true if backend is not available
const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = {
  isMock: USE_MOCK,

  async getBatches() {
    if (USE_MOCK) return mockService.getBatches();
    try {
      const res = await fetch(`${API_URL}/batches`);
      if (!res.ok) throw new Error("API call failed");
      return await res.json();
    } catch (err) {
      console.warn("Backend unavailable, falling back to mock service", err);
      return mockService.getBatches();
    }
  },

  async getBatchById(id) {
    if (USE_MOCK) return mockService.getBatchById(id);
    try {
      const res = await fetch(`${API_URL}/batches/${id}`);
      if (!res.ok) throw new Error("API call failed");
      return await res.json();
    } catch (err) {
      console.warn("Backend unavailable, falling back to mock service", err);
      return mockService.getBatchById(id);
    }
  },

  async createBatch(payload) {
    if (USE_MOCK) return mockService.createBatch(payload);
    try {
      const res = await fetch(`${API_URL}/batches`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Create batch failed");
      return await res.json();
    } catch (err) {
      console.warn("Backend unavailable, falling back to mock service", err);
      return mockService.createBatch(payload);
    }
  },

  async challengeBatch(batchId, challengeData) {
    if (USE_MOCK) return mockService.challengeBatch(batchId, challengeData);
    try {
      const res = await fetch(`${API_URL}/batches/${batchId}/challenge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(challengeData)
      });
      if (!res.ok) throw new Error("Challenge failed");
      return await res.json();
    } catch (err) {
      return mockService.challengeBatch(batchId, challengeData);
    }
  },

  async updateSettlement(batchId, status) {
    if (USE_MOCK) return mockService.updateSettlement(batchId, status);
    try {
      const res = await fetch(`${API_URL}/batches/${batchId}/settlement`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error("Update settlement failed");
      return await res.json();
    } catch (err) {
      return mockService.updateSettlement(batchId, status);
    }
  },

  async runSimulation(scenarioConfig) {
    // Generate simulated batch according to scenario
    return mockService.createBatch(scenarioConfig);
  },

  async resetData() {
    return mockService.resetToDefaults();
  }
};

export default api;
