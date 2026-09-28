const { getRegistryContract } = require('./contracts');

async function sendTransaction(contractMethod, ...args) {
  try {
    const tx = await contractMethod(...args);
    const receipt = await tx.wait();
    return {
      success: true,
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber
    };
  } catch (error) {
    console.error('Blockchain transaction failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

async function recordAiResultOnChain(batchId, aiResultHash) {
  const registry = getRegistryContract(true);
  return await sendTransaction(registry.recordAiResult, batchId, aiResultHash);
}

module.exports = {
  sendTransaction,
  recordAiResultOnChain
};
