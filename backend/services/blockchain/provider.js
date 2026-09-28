const { ethers } = require('ethers');

function getProvider() {
  const rpcUrl = process.env.MST_RPC_URL || 'http://127.0.0.1:8545';
  return new ethers.JsonRpcProvider(rpcUrl);
}

function getSigner() {
  const privateKey = process.env.DEPLOYER_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error('DEPLOYER_PRIVATE_KEY is missing');
  }
  return new ethers.Wallet(privateKey, getProvider());
}

module.exports = {
  getProvider,
  getSigner
};
