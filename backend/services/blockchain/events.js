const { getRegistryContract, getSettlementContract } = require('./contracts');
const Batch = require('../../models/Batch');

function setupEventListeners() {
  try {
    const registry = getRegistryContract();
    
    registry.on('BatchCreated', async (batchId, creator, event) => {
      console.log(`[Chain] BatchCreated: ${batchId}`);
      // Update backend model if needed
    });

    registry.on('EvidenceCommitted', async (batchId, evidenceHash, event) => {
      console.log(`[Chain] EvidenceCommitted: ${batchId}`);
    });

    registry.on('AttestationVerified', async (batchId, event) => {
      console.log(`[Chain] AttestationVerified: ${batchId}`);
      // Could trigger settlement release automatically if requested
    });

    console.log('Blockchain event listeners initialized');
  } catch (error) {
    console.error('Failed to setup blockchain event listeners:', error.message);
  }
}

module.exports = {
  setupEventListeners
};
