const { ethers } = require('ethers');
const { getProvider, getSigner } = require('./provider');
const RegistryABI = require('../../../shared/abi/CirqProofRegistry.json');
const SettlementABI = require('../../../shared/abi/CirqProofSettlement.json');
const addresses = require('../../../shared/abi/addresses.testnet.json');

function getRegistryContract(withSigner = false) {
  const providerOrSigner = withSigner ? getSigner() : getProvider();
  return new ethers.Contract(addresses.CirqProofRegistry, RegistryABI, providerOrSigner);
}

function getSettlementContract(withSigner = false) {
  const providerOrSigner = withSigner ? getSigner() : getProvider();
  return new ethers.Contract(addresses.CirqProofSettlement, SettlementABI, providerOrSigner);
}

module.exports = {
  getRegistryContract,
  getSettlementContract
};
